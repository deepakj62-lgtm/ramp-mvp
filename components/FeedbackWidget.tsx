'use client';

import { useState } from 'react';

export default function FeedbackWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackType, setFeedbackType] = useState('bug');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackText.trim()) return;

    setSubmitting(true);
    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: feedbackType,
          title: feedbackText.split('\n')[0].substring(0, 100),
          rawText: feedbackText,
          chatTranscript: `User: ${feedbackText}`,
          structuredJson: {
            problem: feedbackText,
            type: feedbackType,
            priority: 2,
          },
          pageContext: typeof window !== 'undefined' ? window.location.pathname : '',
        }),
      });

      if (response.ok) {
        setSubmitted(true);
        setFeedbackText('');
        setTimeout(() => {
          setSubmitted(false);
          setIsExpanded(false);
          setIsOpen(false);
        }, 2000);
      }
    } catch (error) {
      console.error('Failed to submit feedback:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-8 right-8 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition flex items-center justify-center text-2xl z-50"
          title="Give feedback"
        >
          💬
        </button>
      )}

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-96 flex flex-col">
            {/* Header */}
            <div className="bg-blue-600 text-white p-4 flex justify-between items-center rounded-t-lg">
              <h3 className="font-semibold">
                {isExpanded ? 'Detailed Feedback' : 'Quick Feedback'}
              </h3>
              <button
                onClick={() => {
                  setIsOpen(false);
                  setIsExpanded(false);
                  setFeedbackText('');
                  setSubmitted(false);
                }}
                className="text-xl hover:opacity-80"
              >
                ✕
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {submitted ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="text-4xl mb-2">✓</div>
                  <p className="text-green-600 font-medium">Thank you for your feedback!</p>
                  <p className="text-sm text-gray-600">We'll review it shortly.</p>
                </div>
              ) : (
                <>
                  {!isExpanded && (
                    <div className="space-y-3">
                      <p className="text-sm text-gray-600">What's on your mind?</p>
                      <textarea
                        value={feedbackText}
                        onChange={(e) => setFeedbackText(e.target.value)}
                        placeholder="Found a bug? Have a feature idea? Let us know..."
                        className="w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none h-20"
                      />
                      <select
                        value={feedbackType}
                        onChange={(e) => setFeedbackType(e.target.value)}
                        className="w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="bug">🐛 Bug Report</option>
                        <option value="feature">✨ Feature Request</option>
                        <option value="question">❓ Question</option>
                        <option value="data_issue">📊 Data Issue</option>
                      </select>
                    </div>
                  )}

                  {isExpanded && (
                    <div className="text-sm text-gray-600">
                      <p className="mb-2">
                        <strong>Type:</strong> {feedbackType}
                      </p>
                      <p className="mb-2">
                        <strong>Feedback:</strong>
                      </p>
                      <p className="bg-gray-50 p-2 rounded whitespace-pre-wrap">
                        {feedbackText}
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Footer */}
            {!submitted && (
              <div className="border-t p-4 flex gap-2 rounded-b-lg">
                {!isExpanded ? (
                  <>
                    <button
                      onClick={() => setIsExpanded(true)}
                      disabled={!feedbackText.trim() || submitting}
                      className="flex-1 px-3 py-2 text-gray-700 border rounded hover:bg-gray-50 disabled:opacity-50 text-sm font-medium"
                    >
                      Next →
                    </button>
                    <button
                      onClick={handleSubmit}
                      disabled={!feedbackText.trim() || submitting}
                      className="flex-1 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 text-sm font-medium"
                    >
                      {submitting ? 'Sending...' : 'Send'}
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => setIsExpanded(false)}
                      className="flex-1 px-3 py-2 text-gray-700 border rounded hover:bg-gray-50 text-sm font-medium"
                    >
                      ← Back
                    </button>
                    <button
                      onClick={handleSubmit}
                      disabled={submitting}
                      className="flex-1 px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 text-sm font-medium"
                    >
                      {submitting ? 'Sending...' : 'Submit'}
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
