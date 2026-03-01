'use client';

import { useEffect, useState } from 'react';

const statusColors: Record<string, string> = {
  new: 'badge-sea',
  triaged: 'badge-frost',
  accepted: 'badge-jade',
  in_progress: 'inline-block px-3 py-1 bg-leather/20 text-jade rounded text-sm font-medium',
  shipped: 'inline-block px-3 py-1 bg-sea/30 text-jade rounded text-sm font-medium',
  closed: 'inline-block px-3 py-1 bg-clay/40 text-jade/60 rounded text-sm font-medium',
  rejected: 'badge-rust',
};

export default function FeedbackPage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
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
    : tickets.filter((t: any) => t.status === filterStatus);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-heading font-bold text-jade mb-2">Feedback Board</h2>
        <p className="text-jade/60 font-body">Review and manage user feedback tickets</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ticket List */}
        <div className="lg:col-span-1">
          <div className="space-y-4">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-body text-jade focus:outline-none focus:ring-2 focus:ring-jade/40"
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

            {loading ? (
              <div className="text-jade/50 text-sm font-body">Loading...</div>
            ) : filteredTickets.length === 0 ? (
              <div className="card p-6 text-center text-jade/50 text-sm font-body">No tickets found</div>
            ) : (
              <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                {filteredTickets.map((ticket: any) => (
                  <button
                    key={ticket.id}
                    onClick={() => setSelectedTicket(ticket)}
                    className={`w-full text-left p-3 rounded-lg border transition font-body ${
                      selectedTicket?.id === ticket.id
                        ? 'bg-jade/5 border-jade/30'
                        : 'bg-white border-gray-200 hover:border-jade/20 hover:bg-canvas'
                    }`}
                  >
                    <p className="font-medium text-sm text-jade line-clamp-2">{ticket.title}</p>
                    <div className="flex gap-2 mt-2">
                      <span className={statusColors[ticket.status] || 'badge-frost'}>
                        {ticket.status}
                      </span>
                      <span className="inline-block px-2 py-1 bg-canvas text-jade/60 rounded text-xs font-medium">
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
            <div className="card p-6 space-y-5">
              <div>
                <h3 className="text-xl font-heading font-bold text-jade">{selectedTicket.title}</h3>
                <div className="flex gap-2 mt-3">
                  <span className={statusColors[selectedTicket.status] || 'badge-frost'}>
                    {selectedTicket.status}
                  </span>
                  <span className="inline-block px-2 py-1 bg-canvas text-jade/60 rounded text-xs font-medium">
                    {selectedTicket.type}
                  </span>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4">
                <h4 className="font-heading font-semibold text-jade mb-2">Raw User Feedback</h4>
                <p className="text-jade/70 text-sm font-body whitespace-pre-wrap">{selectedTicket.rawText}</p>
              </div>

              {selectedTicket.pageContext && (
                <div className="border-t border-gray-100 pt-4">
                  <h4 className="font-heading font-semibold text-jade mb-2">Page Context</h4>
                  <p className="text-jade/70 text-sm font-body">{selectedTicket.pageContext}</p>
                </div>
              )}

              {selectedTicket.structuredJson && (
                <div className="border-t border-gray-100 pt-4">
                  <h4 className="font-heading font-semibold text-jade mb-2">Structured Requirements</h4>
                  <pre className="bg-canvas p-3 rounded-lg text-xs overflow-x-auto font-mono text-jade/80 border border-gray-100">
                    {typeof selectedTicket.structuredJson === 'string'
                      ? JSON.stringify(JSON.parse(selectedTicket.structuredJson), null, 2)
                      : JSON.stringify(selectedTicket.structuredJson, null, 2)}
                  </pre>
                </div>
              )}

              {selectedTicket.chatTranscript && (
                <div className="border-t border-gray-100 pt-4">
                  <h4 className="font-heading font-semibold text-jade mb-2">Chat Transcript</h4>
                  <div className="bg-canvas p-3 rounded-lg text-xs max-h-48 overflow-y-auto border border-gray-100">
                    <pre className="whitespace-pre-wrap font-mono text-jade/80">{selectedTicket.chatTranscript}</pre>
                  </div>
                </div>
              )}

              {selectedTicket.status === 'new' && (
                <div className="border-t border-gray-100 pt-4 flex gap-3">
                  <button
                    onClick={() => handleApprove(selectedTicket.id)}
                    className="btn-primary text-sm"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleReject(selectedTicket.id)}
                    className="btn-accent text-sm"
                  >
                    Reject
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="card p-8 text-center text-jade/50 font-body">
              Select a ticket to view details
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
