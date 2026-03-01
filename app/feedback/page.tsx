'use client';

import { useEffect, useState } from 'react';

const statusColors = {
  new: 'bg-blue-100 text-blue-800',
  triaged: 'bg-yellow-100 text-yellow-800',
  accepted: 'bg-purple-100 text-purple-800',
  in_progress: 'bg-indigo-100 text-indigo-800',
  shipped: 'bg-green-100 text-green-800',
  closed: 'bg-gray-100 text-gray-800',
  rejected: 'bg-red-100 text-red-800',
};

export default function FeedbackPage() {
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    try {
      const response = await fetch('/api/feedback');
      const data = await response.json();
      setTickets(data.tickets || []);
    } catch (err) {
      console.error('Failed to load tickets:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (ticketId: string) => {
    try {
      await fetch(`/api/feedback/${ticketId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'accepted' }),
      });
      loadTickets();
      setSelectedTicket(null);
    } catch (err) {
      console.error('Failed to approve ticket:', err);
    }
  };

  const handleReject = async (ticketId: string) => {
    try {
      await fetch(`/api/feedback/${ticketId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'rejected' }),
      });
      loadTickets();
      setSelectedTicket(null);
    } catch (err) {
      console.error('Failed to reject ticket:', err);
    }
  };

  const filteredTickets = filterStatus === 'all'
    ? tickets
    : tickets.filter(t => t.status === filterStatus);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Ticket List */}
      <div className="lg:col-span-1">
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Feedback Tickets</h2>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-sm"
            >
              <option value="all">All Statuses</option>
              <option value="new">New</option>
              <option value="triaged">Triaged</option>
              <option value="accepted">Accepted</option>
              <option value="in_progress">In Progress</option>
              <option value="shipped">Shipped</option>
              <option value="closed">Closed</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          {loading ? (
            <div className="text-gray-600 text-sm">Loading...</div>
          ) : filteredTickets.length === 0 ? (
            <div className="text-gray-600 text-sm">No tickets found</div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredTickets.map(ticket => (
                <button
                  key={ticket.id}
                  onClick={() => setSelectedTicket(ticket)}
                  className={`w-full text-left p-3 rounded border transition ${
                    selectedTicket?.id === ticket.id
                      ? 'bg-blue-50 border-blue-300'
                      : 'bg-white border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <p className="font-medium text-sm text-gray-900 line-clamp-2">{ticket.title}</p>
                  <div className="flex gap-2 mt-2">
                    <span className={`text-xs px-2 py-1 rounded ${statusColors[ticket.status] || 'bg-gray-100'}`}>
                      {ticket.status}
                    </span>
                    <span className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-700">
                      {ticket.type}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Ticket Details */}
      <div className="lg:col-span-2">
        {selectedTicket ? (
          <div className="bg-white rounded-lg border p-6 space-y-4">
            <div>
              <h3 className="text-xl font-bold text-gray-900">{selectedTicket.title}</h3>
              <div className="flex gap-2 mt-2">
                <span className={`text-xs px-2 py-1 rounded font-medium ${statusColors[selectedTicket.status] || 'bg-gray-100'}`}>
                  {selectedTicket.status}
                </span>
                <span className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-700 font-medium">
                  {selectedTicket.type}
                </span>
              </div>
            </div>

            <div className="border-t pt-4">
              <h4 className="font-semibold text-gray-900 mb-2">Raw User Feedback</h4>
              <p className="text-gray-600 text-sm whitespace-pre-wrap">{selectedTicket.rawText}</p>
            </div>

            {selectedTicket.pageContext && (
              <div className="border-t pt-4">
                <h4 className="font-semibold text-gray-900 mb-2">Page Context</h4>
                <p className="text-gray-600 text-sm">{selectedTicket.pageContext}</p>
              </div>
            )}

            {selectedTicket.structuredJson && (
              <div className="border-t pt-4">
                <h4 className="font-semibold text-gray-900 mb-2">Structured Requirements</h4>
                <pre className="bg-gray-50 p-3 rounded text-xs overflow-x-auto">
                  {typeof selectedTicket.structuredJson === 'string'
                    ? JSON.stringify(JSON.parse(selectedTicket.structuredJson), null, 2)
                    : JSON.stringify(selectedTicket.structuredJson, null, 2)}
                </pre>
              </div>
            )}

            {selectedTicket.chatTranscript && (
              <div className="border-t pt-4">
                <h4 className="font-semibold text-gray-900 mb-2">Chat Transcript</h4>
                <div className="bg-gray-50 p-3 rounded text-xs max-h-48 overflow-y-auto">
                  <pre className="whitespace-pre-wrap">{selectedTicket.chatTranscript}</pre>
                </div>
              </div>
            )}

            {selectedTicket.status === 'new' && (
              <div className="border-t pt-4 flex gap-2">
                <button
                  onClick={() => handleApprove(selectedTicket.id)}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 font-medium text-sm"
                >
                  ✓ Approve
                </button>
                <button
                  onClick={() => handleReject(selectedTicket.id)}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 font-medium text-sm"
                >
                  ✗ Reject
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-gray-50 rounded-lg p-8 text-center text-gray-600">
            Select a ticket to view details
          </div>
        )}
      </div>
    </div>
  );
}
