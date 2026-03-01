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
          className="fixed bottom-8 right-8 w-14 h-14 bg-jade text-white rounded-full shadow-lg hover:bg-jade-light transition flex items-center justify-center z-50"
          title="Give feedback"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
          </svg>
        </button>
      )}

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-jade/60 flex items-end sm:items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-96 flex flex-col">
            {/* Header */}
            <div className="bg-gradient-to-r from-jade to-jade-light text-white p-4 flex justify-between items-center rounded-t-lg">
              <h3 className="font-heading font-semibold">
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
                  <div className="text-4xl mb-2 text-jade">✓</div>
                  <p className="text-jade font-body font-medium">Thank you for your feedback!</p>
                  <p className="text-sm text-jade/60 font-body">We'll review it shortly.</p>
                </div>
              ) : (
                <>
                  {!isExpanded && (
                    <div className="space-y-3">
                      <p className="text-sm text-jade/70 font-body">What's on your mind?</p>
                      <textarea
                        value={feedbackText}
                        onChange={(e) => setFeedbackText(e.target.value)}
                        placeholder="Found a bug? Have a feature idea? Let us know..."
                        className="w-full px-3 py-2 border border-gray-300 rounded text-sm font-body focus:outline-none focus:ring-2 focus:ring-jade/40 focus:border-jade resize-none h-20"
                      />
                      <select
                        value={feedbackType}
                        onChange={(e) => setFeedbackType(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded text-sm font-body focus:outline-none focus:ring-2 focus:ring-jade/40 focus:border-jade"
                      >
                        <option value="bug">Bug Report</option>
                        <option value="feature">Feature Request</option>
                        <option value="question">Question</option>
                        <option value="data_issue">Data Issue</option>
                      </select>
                    </div>
                  )}

                  {isExpanded && (
                    <div className="text-sm text-jade/70 font-body">
                      <p className="mb-2">
                        <strong className="text-jade">Type:</strong> {feedbackType}
                      </p>
                      <p className="mb-2">
                        <strong className="text-jade">Feedback:</strong>
                      </p>
                      <p className="bg-canvas p-2 rounded whitespace-pre-wrap">
                        {feedbackText}
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Footer */}
            {!submitted && (
              <div className="border-t border-gray-200 p-4 flex gap-2 rounded-b-lg">
                {!isExpanded ? (
                  <>
                    <button
                      onClick={() => setIsExpanded(true)}
                      disabled={!feedbackText.trim() || submitting}
                      className="flex-1 btn-secondary text-sm disabled:opacity-50"
                    >
                      Next
                    </button>
                    <button
                      onClick={handleSubmit}
                      disabled={!feedbackText.trim() || submitting}
                      className="flex-1 btn-primary text-sm disabled:opacity-50"
                    >
                      {submitting ? 'Sending...' : 'Send'}
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => setIsExpanded(false)}
                      className="flex-1 btn-secondary text-sm"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleSubmit}
                      disabled={submitting}
                      className="flex-1 btn-primary text-sm disabled:opacity-50"
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
