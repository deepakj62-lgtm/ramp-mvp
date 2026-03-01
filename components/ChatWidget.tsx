'use client';

import { useState, useRef, useEffect } from 'react';
import { useChatPageContext } from './ChatContext';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { context } = useChatPageContext();

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Add welcome message when opening
  const handleOpen = () => {
    setIsOpen(true);
    if (messages.length === 0) {
      const contextText = context.entityName
        ? `I see you're viewing ${context.entityName}'s ${context.entityType || 'page'}.`
        : `You're on the ${context.pageName} page.`;

      setMessages([{
        id: 'welcome',
        role: 'assistant',
        content: `Hi! ${contextText} How can I help? You can ask questions, report bugs, or suggest features.`,
        timestamp: new Date(),
      }]);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
          pageContext: buildPageContext(),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(prev => [...prev, {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: data.reply,
          timestamp: new Date(),
        }]);
      } else {
        setMessages(prev => [...prev, {
          id: `error-${Date.now()}`,
          role: 'assistant',
          content: "Sorry, I couldn't process that. Please try again.",
          timestamp: new Date(),
        }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: "Connection error. Please check your connection and try again.",
        timestamp: new Date(),
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAction = (action: string) => {
    setInput(action);
    // Auto-send after a brief delay
    setTimeout(() => {
      const userMessage: ChatMessage = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: action,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, userMessage]);
      setInput('');
      setLoading(true);

      fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, { role: 'user', content: action }].map(m => ({
            role: m.role,
            content: m.content,
          })),
          pageContext: buildPageContext(),
        }),
      })
        .then(res => res.json())
        .then(data => {
          setMessages(prev => [...prev, {
            id: `assistant-${Date.now()}`,
            role: 'assistant',
            content: data.reply,
            timestamp: new Date(),
          }]);
        })
        .catch(() => {
          setMessages(prev => [...prev, {
            id: `error-${Date.now()}`,
            role: 'assistant',
            content: "Sorry, I couldn't process that.",
            timestamp: new Date(),
          }]);
        })
        .finally(() => setLoading(false));
    }, 100);
  };

  const handleSubmitFeedback = async () => {
    // Convert chat to feedback ticket
    const chatTranscript = messages
      .map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
      .join('\n');

    const userMessages = messages.filter(m => m.role === 'user');
    const firstUserMsg = userMessages[0]?.content || '';
    const allUserText = userMessages.map(m => m.content).join(' ');

    // Detect type from conversation
    let type = 'question';
    if (allUserText.toLowerCase().includes('bug') || allUserText.toLowerCase().includes('broken')) type = 'bug';
    else if (allUserText.toLowerCase().includes('feature') || allUserText.toLowerCase().includes('wish')) type = 'feature';
    else if (allUserText.toLowerCase().includes('wrong') || allUserText.toLowerCase().includes('incorrect')) type = 'data_issue';

    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          title: firstUserMsg.substring(0, 100),
          rawText: allUserText,
          chatTranscript,
          structuredJson: {
            problem: allUserText,
            type,
            priority: 2,
            pageContext: buildPageContext(),
          },
          pageContext: context.pageName,
        }),
      });

      if (response.ok) {
        setFeedbackSubmitted(true);
        setMessages(prev => [...prev, {
          id: `system-${Date.now()}`,
          role: 'assistant',
          content: 'Your feedback has been submitted! Thank you for helping improve the app.',
          timestamp: new Date(),
        }]);
        setTimeout(() => setFeedbackSubmitted(false), 3000);
      }
    } catch (error) {
      console.error('Failed to submit feedback:', error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const buildPageContext = (): string => {
    let ctx = `Page: ${context.pageName}`;
    if (context.entityType) ctx += ` | Entity: ${context.entityType}`;
    if (context.entityName) ctx += ` | Name: ${context.entityName}`;
    if (context.additionalContext) ctx += ` | ${context.additionalContext}`;
    return ctx;
  };

  const clearChat = () => {
    setMessages([]);
    setFeedbackSubmitted(false);
  };

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
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

      {/* Chat Panel */}
      {isOpen && (
        <div className="fixed bottom-8 right-8 w-96 max-h-[520px] flex flex-col card shadow-2xl z-50 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-jade to-jade-light text-white p-3 flex justify-between items-start shrink-0">
            <div>
              <h3 className="font-heading font-semibold text-sm">Linea Assistant</h3>
              <p className="text-white/70 text-xs font-body mt-0.5">
                {context.entityName
                  ? `Viewing: ${context.entityName}`
                  : context.pageName}
              </p>
            </div>
            <div className="flex gap-1">
              <button
                onClick={clearChat}
                className="text-white/60 hover:text-white text-xs font-body px-1.5 py-0.5 rounded hover:bg-white/10 transition"
                title="Clear chat"
              >
                Clear
              </button>
              <button
                onClick={handleClose}
                className="text-white/80 hover:text-white text-lg leading-none px-1"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-[200px] max-h-[340px]" style={{ backgroundColor: '#F8F8F8' }}>
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={msg.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-assistant'}>
                  {msg.content.split('\n').map((line, i) => (
                    <span key={i}>
                      {line}
                      {i < msg.content.split('\n').length - 1 && <br />}
                    </span>
                  ))}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {loading && (
              <div className="flex justify-start">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions */}
          {messages.length <= 1 && (
            <div className="px-3 py-2 flex gap-1.5 border-t border-gray-100 shrink-0" style={{ backgroundColor: '#F8F8F8' }}>
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
                onClick={() => handleQuickAction("I have a question")}
                className="text-xs font-body px-2 py-1 rounded-full border border-sea/50 text-jade hover:bg-sea/10 transition"
              >
                Ask Question
              </button>
            </div>
          )}

          {/* Submit feedback button (appears after some conversation) */}
          {messages.filter(m => m.role === 'user').length >= 2 && !feedbackSubmitted && (
            <div className="px-3 py-2 border-t border-gray-100 shrink-0" style={{ backgroundColor: '#F8F8F8' }}>
              <button
                onClick={handleSubmitFeedback}
                className="w-full btn-accent text-xs py-1.5"
              >
                Submit as Feedback Ticket
              </button>
            </div>
          )}

          {/* Input */}
          <div className="p-3 border-t border-gray-200 flex gap-2 shrink-0 bg-white">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-body focus:outline-none focus:ring-2 focus:ring-jade/40 focus:border-jade"
              disabled={loading}
            />
            <button
              onClick={handleSend}
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
