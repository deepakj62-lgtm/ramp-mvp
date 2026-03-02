'use client';

import { useState, useRef, useEffect } from 'react';
import { useChatPageContext } from './ChatContext';
import ScreenshotAnnotator from './ScreenshotAnnotator';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  type?: 'normal' | 'action_result' | 'action_queued' | 'action_error';
  imagePreview?: string; // data URL for displaying sent screenshot
  actionData?: {
    ticketId?: string;
    complexity?: string;
    autoApplied?: boolean;
    changes?: string[];
    summary?: string;
    plan?: string[];
    intent?: string;
  };
}

// ─── Action intent detection ──────────────────────────────────────────────────

function detectActionIntent(text: string): boolean {
  const lower = text.toLowerCase();
  const actionPhrases = [
    'change', 'update', 'set ', 'fix ', 'mark ', 'edit ',
    'rename', 'move to', 'switch to', 'make it', 'make this',
    'should be', 'needs to be', 'please update', 'please change',
    'please set', 'please fix', 'can you update', 'can you change',
    'the status is', 'status to', 'level to', 'title to',
    'location to', 'percent to', 'end date to', 'start date to',
  ];
  return actionPhrases.some(phrase => lower.includes(phrase));
}

// ─── Component ─────────────────────────────────────────────────────────────────

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [mode, setMode] = useState<'chat' | 'action'>('chat');
  const [notifyEmail, setNotifyEmail] = useState('');
  const [showEmailField, setShowEmailField] = useState(false);
  const [pendingAction, setPendingAction] = useState<string | null>(null);

  // Screenshot annotator state
  const [showAnnotator, setShowAnnotator] = useState(false);
  const [capturedScreenshot, setCapturedScreenshot] = useState<string | null>(null);
  const [capturingScreen, setCapturingScreen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const widgetRef = useRef<HTMLDivElement>(null);
  const { context } = useChatPageContext();

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input on open
  useEffect(() => {
    if (isOpen && inputRef.current) inputRef.current.focus();
  }, [isOpen]);

  const handleOpen = () => {
    setIsOpen(true);
    if (messages.length === 0) {
      const contextText = context.entityName
        ? `I see you're viewing ${context.entityName}'s ${context.entityType || 'page'}.`
        : `You're on the ${context.pageName} page.`;
      setMessages([{
        id: 'welcome',
        role: 'assistant',
        content: `Hi! ${contextText} I can answer questions, report bugs, suggest features, or — just type a change like "update the status to Completed" and I'll do it for you.`,
        timestamp: new Date(),
      }]);
    }
  };

  const handleClose = () => setIsOpen(false);
  const clearChat = () => {
    setMessages([]);
    setFeedbackSubmitted(false);
    setMode('chat');
    setPendingAction(null);
    setCapturedScreenshot(null);
  };

  const buildPageContext = (): string => {
    let ctx = `Page: ${context.pageName}`;
    if (context.entityType) ctx += ` | Entity: ${context.entityType}`;
    if (context.entityName) ctx += ` | Name: ${context.entityName}`;
    if (context.additionalContext) ctx += ` | ${context.additionalContext}`;
    return ctx;
  };

  // ── Capture the page screenshot ───────────────────────────────────────────

  const handleCaptureScreenshot = async () => {
    setCapturingScreen(true);
    setIsOpen(false); // Hide widget so it's not in the screenshot

    // Wait two frames for the widget to visually disappear
    await new Promise(r => setTimeout(r, 120));

    try {
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(document.body, {
        useCORS: true,
        allowTaint: false,
        scale: Math.min(window.devicePixelRatio || 1, 2),
        logging: false,
        // Skip any elements that might have rendering issues
        ignoreElements: (el) => {
          const id = (el as HTMLElement).id;
          const cls = (el as HTMLElement).className || '';
          return id === 'chat-widget-portal' ||
            (typeof cls === 'string' && cls.includes('chat-widget-ignore'));
        },
      });
      const dataUrl = canvas.toDataURL('image/png');
      setCapturedScreenshot(dataUrl);
      setShowAnnotator(true);
    } catch (err) {
      console.error('Screenshot capture failed:', err);
      // Reopen widget with a fallback message
      setIsOpen(true);
      setMessages(prev => [...prev, {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: '⚠️ Could not capture the page screenshot. You can still upload an image using the 📎 button.',
        timestamp: new Date(),
      }]);
    } finally {
      setCapturingScreen(false);
    }
  };

  // ── Called when annotator submits ─────────────────────────────────────────

  const handleAnnotatorSubmit = async (annotatedBase64: string, description: string, mimeType: string) => {
    setShowAnnotator(false);
    setCapturedScreenshot(null);
    setIsOpen(true);
    setMode('action');

    // Build a data URL for the preview thumbnail
    const previewDataUrl = `data:${mimeType};base64,${annotatedBase64}`;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: `📸 ${description}`,
      timestamp: new Date(),
      imagePreview: previewDataUrl,
    };
    setMessages(prev => [...prev, userMsg]);

    await handleSendAction(description, annotatedBase64, mimeType);
  };

  const handleAnnotatorCancel = () => {
    setShowAnnotator(false);
    setCapturedScreenshot(null);
    setIsOpen(true);
  };

  // ── Send action to the action engine ────────────────────────────────────────

  const handleSendAction = async (userText: string, imageBase64?: string, imageMimeType?: string) => {
    setLoading(true);
    try {
      const chatTranscript = messages
        .map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
        .join('\n');

      const response = await fetch('/api/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userMessage: userText,
          pageContext: buildPageContext(),
          entityType: context.entityType,
          entityId: context.entityId,
          notifyEmail: notifyEmail || undefined,
          chatTranscript,
          ...(imageBase64 ? { imageBase64, imageMimeType: imageMimeType || 'image/png' } : {}),
        }),
      });

      const data = await response.json();

      if (data.autoApplied) {
        setMessages(prev => [...prev, {
          id: `action-${Date.now()}`,
          role: 'assistant',
          content: `✅ Done! ${data.summary}`,
          timestamp: new Date(),
          type: 'action_result',
          actionData: data,
        }]);
      } else if (data.queued) {
        // Detect whether this is a DB change vs UI/code change (UI = no fieldUpdates in classification)
        const isUIChange = !data.reason?.includes('single') && (
          data.reason?.includes('UI') || data.reason?.includes('code') || data.reason?.includes('frontend') ||
          data.reason?.includes('visual') || data.reason?.includes('CSS') || data.reason?.includes('styling') ||
          data.intent?.toLowerCase().includes('colour') || data.intent?.toLowerCase().includes('color') ||
          data.intent?.toLowerCase().includes('font') || data.intent?.toLowerCase().includes('size') ||
          data.intent?.toLowerCase().includes('layout') || imageBase64
        );
        setMessages(prev => [...prev, {
          id: `action-${Date.now()}`,
          role: 'assistant',
          content: isUIChange
            ? `🎨 UI/styling change logged on the Feedback Board. Open Feedback, find the ticket, and click ⚡ Apply Code Change — the self-correcting engine will edit the source files and hot-reload instantly.`
            : `📋 This is a larger change that needs your review. I've created a ticket on the Feedback Board — check the plan and approve when ready.`,
          timestamp: new Date(),
          type: 'action_queued',
          actionData: data,
        }]);
      } else if (data.complexity === 'small' && !data.autoApplied) {
        setMessages(prev => [...prev, {
          id: `action-${Date.now()}`,
          role: 'assistant',
          content: `⚠️ I tried to apply that but ran into an issue: ${data.summary}. A ticket was still created.`,
          timestamp: new Date(),
          type: 'action_error',
          actionData: data,
        }]);
      } else {
        setMessages(prev => [...prev, {
          id: `action-${Date.now()}`,
          role: 'assistant',
          content: data.error || 'Something went wrong with the action engine.',
          timestamp: new Date(),
          type: 'action_error',
        }]);
      }
    } catch {
      setMessages(prev => [...prev, {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: 'Connection error. Please try again.',
        timestamp: new Date(),
      }]);
    } finally {
      setLoading(false);
    }
  };

  // ── Send chat message ────────────────────────────────────────────────────────

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userText = input.trim();

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: userText,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');

    // ── Action path ─────────────────────────────────────────────────────────────
    const isAction = mode === 'action' || detectActionIntent(userText);

    if (isAction) {
      setMode('action');
      if (!notifyEmail && !showEmailField) {
        setPendingAction(userText);
        setShowEmailField(true);
        setMessages(prev => [...prev, {
          id: `sys-${Date.now()}`,
          role: 'assistant',
          content: '📧 Optional: enter your email below to get notified when this is applied, then click Send again — or skip it.',
          timestamp: new Date(),
        }]);
        return;
      }
      await handleSendAction(userText);
      return;
    }

    // ── Regular chat ────────────────────────────────────────────────────────────
    setLoading(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg].map(m => ({ role: m.role, content: m.content })),
          pageContext: buildPageContext(),
        }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: data.reply || "Sorry, I couldn't process that.",
        timestamp: new Date(),
      }]);
    } catch {
      setMessages(prev => [...prev, {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: 'Connection error. Please check your connection and try again.',
        timestamp: new Date(),
      }]);
    } finally {
      setLoading(false);
    }
  };

  // ── Proceed with pending action after email input ─────────────────────────

  const handleProceedWithAction = async () => {
    setShowEmailField(false);
    if (pendingAction) {
      await handleSendAction(pendingAction);
      setPendingAction(null);
    }
  };

  const handleSubmitFeedback = async () => {
    const chatTranscript = messages.map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`).join('\n');
    const userMessages = messages.filter(m => m.role === 'user');
    const firstUserMsg = userMessages[0]?.content || '';
    const allUserText = userMessages.map(m => m.content).join(' ');

    let type = 'question';
    if (allUserText.toLowerCase().includes('bug') || allUserText.toLowerCase().includes('broken')) type = 'bug';
    else if (allUserText.toLowerCase().includes('feature') || allUserText.toLowerCase().includes('wish')) type = 'feature';
    else if (allUserText.toLowerCase().includes('wrong') || allUserText.toLowerCase().includes('incorrect')) type = 'data_issue';

    try {
      await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          title: firstUserMsg.substring(0, 100),
          rawText: allUserText,
          chatTranscript,
          structuredJson: { problem: allUserText, type, priority: 2, pageContext: buildPageContext() },
          pageContext: context.pageName,
        }),
      });
      setFeedbackSubmitted(true);
      setMessages(prev => [...prev, {
        id: `system-${Date.now()}`,
        role: 'assistant',
        content: '✅ Feedback submitted! Thank you for helping improve the app.',
        timestamp: new Date(),
      }]);
      setTimeout(() => setFeedbackSubmitted(false), 3000);
    } catch { /* ignore */ }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (showEmailField) handleProceedWithAction();
      else handleSend();
    }
  };

  const handleQuickAction = (msg: string) => {
    setInput(msg);
    setTimeout(() => {
      const userMsg: ChatMessage = { id: `user-${Date.now()}`, role: 'user', content: msg, timestamp: new Date() };
      setMessages(prev => [...prev, userMsg]);
      setInput('');
      setLoading(true);
      fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, { role: 'user', content: msg }].map(m => ({ role: m.role, content: m.content })),
          pageContext: buildPageContext(),
        }),
      })
        .then(r => r.json())
        .then(data => setMessages(prev => [...prev, { id: `assistant-${Date.now()}`, role: 'assistant', content: data.reply, timestamp: new Date() }]))
        .catch(() => setMessages(prev => [...prev, { id: `error-${Date.now()}`, role: 'assistant', content: 'Sorry, I couldn\'t process that.', timestamp: new Date() }]))
        .finally(() => setLoading(false));
    }, 100);
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <>
      {/* ── Screenshot Annotator overlay ── */}
      {showAnnotator && capturedScreenshot && (
        <ScreenshotAnnotator
          imageDataUrl={capturedScreenshot}
          onSubmit={handleAnnotatorSubmit}
          onCancel={handleAnnotatorCancel}
        />
      )}

      {/* ── Capturing indicator (brief flash) ── */}
      {capturingScreen && (
        <div className="fixed inset-0 z-[55] bg-white/60 flex items-center justify-center pointer-events-none">
          <div className="bg-white rounded-2xl shadow-2xl px-6 py-4 flex items-center gap-3 border border-gray-100">
            <div className="w-5 h-5 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-700 text-sm font-medium">Capturing screenshot…</p>
          </div>
        </div>
      )}

      {/* ── Floating Button ── */}
      {!isOpen && !showAnnotator && (
        <button
          onClick={handleOpen}
          className="fixed bottom-8 right-8 w-14 h-14 bg-jade text-white rounded-full shadow-lg hover:bg-jade-light transition flex items-center justify-center z-50"
          title="Chat with Linea Assistant"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
          </svg>
        </button>
      )}

      {/* ── Chat Panel ── */}
      {isOpen && (
        <div
          ref={widgetRef}
          className="fixed bottom-8 right-8 w-96 max-h-[600px] flex flex-col card shadow-2xl z-50 overflow-hidden"
        >

          {/* Header */}
          <div className={`text-white p-3 flex justify-between items-start shrink-0 ${
            mode === 'action'
              ? 'bg-gradient-to-r from-jade to-sea'
              : 'bg-gradient-to-r from-jade to-jade-light'
          }`}>
            <div>
              <h3 className="font-heading font-semibold text-sm flex items-center gap-1.5">
                {mode === 'action' ? '⚡' : '💬'} Linea Assistant
                {mode === 'action' && (
                  <span className="text-xs bg-white/20 px-1.5 py-0.5 rounded-full">Action Mode</span>
                )}
              </h3>
              <p className="text-white/70 text-xs font-body mt-0.5">
                {context.entityName ? `Viewing: ${context.entityName}` : context.pageName}
              </p>
            </div>
            <div className="flex gap-1">
              <button
                onClick={clearChat}
                className="text-white/60 hover:text-white text-xs font-body px-1.5 py-0.5 rounded hover:bg-white/10 transition"
              >
                Clear
              </button>
              <button onClick={handleClose} className="text-white/80 hover:text-white text-lg leading-none px-1">✕</button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-[200px] max-h-[360px]" style={{ backgroundColor: '#F8F8F8' }}>
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.type === 'action_result' && msg.actionData ? (
                  <div className="bg-jade/10 border border-jade/20 rounded-xl px-3 py-2 max-w-[85%]">
                    <p className="text-jade font-body text-sm font-medium">{msg.content}</p>
                    {msg.actionData.changes && msg.actionData.changes.length > 0 && (
                      <ul className="mt-1.5 space-y-0.5">
                        {msg.actionData.changes.map((c, i) => (
                          <li key={i} className="text-xs text-jade/70 font-body">• {c}</li>
                        ))}
                      </ul>
                    )}
                    {msg.actionData.ticketId && (
                      <a href="/feedback" className="text-xs text-jade/50 hover:text-jade hover:underline mt-1 block font-body transition">
                        View ticket →
                      </a>
                    )}
                  </div>
                ) : msg.type === 'action_queued' && msg.actionData ? (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 max-w-[85%]">
                    <p className="text-amber-700 font-body text-sm font-medium">{msg.content}</p>
                    {msg.actionData.intent && (
                      <p className="text-xs text-amber-600 font-body mt-1 italic">"{msg.actionData.intent}"</p>
                    )}
                    {msg.actionData.plan && msg.actionData.plan.length > 0 && (
                      <div className="mt-1.5">
                        <p className="text-xs text-amber-600 font-body font-medium mb-1">Plan:</p>
                        <ol className="space-y-0.5">
                          {msg.actionData.plan.map((step, i) => (
                            <li key={i} className="text-xs text-amber-600 font-body">{i + 1}. {step}</li>
                          ))}
                        </ol>
                      </div>
                    )}
                    <a href="/feedback" className="text-xs text-amber-600 hover:text-amber-800 hover:underline mt-1 block font-body transition">
                      Review &amp; approve on Feedback Board →
                    </a>
                  </div>
                ) : msg.type === 'action_error' ? (
                  <div className="bg-rust/10 border border-rust/20 rounded-xl px-3 py-2 max-w-[85%]">
                    <p className="text-rust font-body text-sm">{msg.content}</p>
                  </div>
                ) : (
                  <div className={msg.role === 'user' ? 'chat-bubble-user max-w-[85%]' : 'chat-bubble-assistant max-w-[85%]'}>
                    {/* Screenshot thumbnail in user bubble */}
                    {msg.imagePreview && (
                      <img
                        src={msg.imagePreview}
                        alt="Screenshot"
                        className="max-w-full rounded-lg border border-white/20 mb-1.5 max-h-28 object-cover cursor-pointer"
                        onClick={() => window.open(msg.imagePreview, '_blank')}
                        title="Click to view full size"
                      />
                    )}
                    {msg.content.split('\n').map((line, i) => (
                      <span key={i}>{line}{i < msg.content.split('\n').length - 1 && <br />}</span>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="typing-indicator"><span /><span /><span /></div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions (initial state) */}
          {messages.length <= 1 && (
            <div className="px-3 py-2 flex gap-1.5 flex-wrap border-t border-gray-100 shrink-0" style={{ backgroundColor: '#F8F8F8' }}>
              <button
                onClick={() => handleQuickAction("I'd like to report a bug")}
                className="text-xs font-body px-2 py-1 rounded-full border border-rust/30 text-rust hover:bg-rust/10 transition"
              >
                Report Bug
              </button>
              <button
                onClick={() => handleQuickAction("I have a feature request")}
                className="text-xs font-body px-2 py-1 rounded-full border border-jade/30 text-jade hover:bg-jade/10 transition"
              >
                Request Feature
              </button>
              <button
                onClick={() => {
                  setMode('action');
                  setMessages(prev => [...prev, {
                    id: `sys-${Date.now()}`,
                    role: 'assistant',
                    content: '⚡ Action mode on! Just describe what you want to change — e.g. "update the status to Completed" or "change Kevin\'s title to Senior Consultant".',
                    timestamp: new Date(),
                  }]);
                }}
                className="text-xs font-body px-2 py-1 rounded-full border border-sea/40 text-sea hover:bg-sea/10 transition"
              >
                ⚡ Make a Change
              </button>
              <button
                onClick={handleCaptureScreenshot}
                disabled={capturingScreen}
                className="text-xs font-body px-2 py-1 rounded-full border border-violet-300 text-violet-600 hover:bg-violet-50 transition disabled:opacity-50"
              >
                📸 Annotate Page
              </button>
            </div>
          )}

          {/* Email notification field */}
          {showEmailField && (
            <div className="px-3 py-2 border-t border-amber-100 bg-amber-50 shrink-0">
              <p className="text-xs text-amber-700 font-body mb-1.5">Get notified by email when done (optional):</p>
              <div className="flex gap-2">
                <input
                  type="email"
                  value={notifyEmail}
                  onChange={e => setNotifyEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="flex-1 px-2 py-1.5 border border-amber-200 rounded-lg text-xs font-body focus:outline-none focus:ring-1 focus:ring-amber-400"
                />
                <button
                  onClick={handleProceedWithAction}
                  className="px-3 py-1.5 bg-jade text-white text-xs font-body rounded-lg hover:bg-jade/80 transition"
                >
                  {notifyEmail ? 'Send + Notify' : 'Skip'}
                </button>
              </div>
            </div>
          )}

          {/* Submit feedback button */}
          {messages.filter(m => m.role === 'user').length >= 2 && !feedbackSubmitted && mode === 'chat' && (
            <div className="px-3 py-2 border-t border-gray-100 shrink-0" style={{ backgroundColor: '#F8F8F8' }}>
              <button onClick={handleSubmitFeedback} className="w-full btn-accent text-xs py-1.5">
                Submit as Feedback Ticket
              </button>
            </div>
          )}

          {/* Input bar */}
          <div className="p-3 border-t border-gray-200 flex gap-2 shrink-0 bg-white">
            {/* Screenshot capture button in input bar */}
            <button
              onClick={handleCaptureScreenshot}
              disabled={capturingScreen || loading}
              className="shrink-0 p-2 rounded-lg border border-gray-200 text-gray-400 hover:border-violet-300 hover:text-violet-500 hover:bg-violet-50 transition text-base leading-none disabled:opacity-40"
              title="Capture & annotate current page"
            >
              📸
            </button>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                mode === 'action'
                  ? '⚡ Describe a change...'
                  : 'Type a message...'
              }
              className={`flex-1 px-3 py-2 border rounded-lg text-sm font-body focus:outline-none focus:ring-2 transition ${
                mode === 'action'
                  ? 'border-sea/40 focus:ring-sea/40 focus:border-sea'
                  : 'border-gray-300 focus:ring-jade/40 focus:border-jade'
              }`}
              disabled={loading}
            />
            <button
              onClick={showEmailField ? handleProceedWithAction : handleSend}
              disabled={!input.trim() || loading}
              className="btn-primary text-sm px-3 py-2 disabled:opacity-50"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </>
  );
}
