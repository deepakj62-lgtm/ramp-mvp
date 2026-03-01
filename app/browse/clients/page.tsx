'use client';

import { useState, useEffect } from 'react';
import PageContextSetter from '@/components/PageContextSetter';

interface ClientProject {
  id: string;
  name: string;
  rampProjectCode: string;
  engagementClass: string;
}

interface Client {
  clientId: string;
  clientName: string;
  sector: string;
  projects: ClientProject[];
}

const sectorBadgeClass: Record<string, string> = {
  'pension': 'badge-jade',
  'insurance': 'badge-sea',
  'workers_comp': 'badge-rust',
  'benefits': 'badge-frost',
  'cybersecurity': 'badge-rust',
  'data': 'badge-sea',
  'government': 'badge-jade',
  'vendor': 'badge-frost',
};

const sectorLabel: Record<string, string> = {
  'pension': 'Pension',
  'insurance': 'Insurance',
  'workers_comp': 'Workers Comp',
  'benefits': 'Benefits',
  'cybersecurity': 'Cybersecurity',
  'data': 'Data',
  'government': 'Government',
  'vendor': 'Vendor',
};

const engagementBadge: Record<string, string> = {
  'Client': 'badge-jade',
  'ULC': 'badge-sea',
  'Cyber': 'badge-rust',
  'ICON': 'badge-frost',
};

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sector, setSector] = useState('all');
  const [expandedClient, setExpandedClient] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (sector !== 'all') params.set('sector', sector);

    try {
      const res = await fetch(`/api/clients?${params.toString()}`);
      const json = await res.json();
      setClients(json.clients || []);
      setTotal(json.total || 0);
    } catch (error) {
      console.error('Failed to fetch clients:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [search, sector]);

  return (
    <div className="space-y-6">
      <PageContextSetter context={{ pageName: 'Clients Directory' }} />

      <div>
        <h1 className="text-3xl font-heading font-bold text-jade">Clients</h1>
        <p className="text-jade/60 font-body mt-1">{total} clients across all business units</p>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-wrap gap-3">
          <div className="flex-1 min-w-[200px]">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search clients..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-body focus:outline-none focus:ring-2 focus:ring-jade/40 focus:border-jade"
            />
          </div>
          <div className="min-w-[160px]">
            <select
              value={sector}
              onChange={(e) => setSector(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-body focus:outline-none focus:ring-2 focus:ring-jade/40 focus:border-jade"
            >
              <option value="all">All Sectors</option>
              <option value="pension">Pension</option>
              <option value="insurance">Insurance</option>
              <option value="workers_comp">Workers Comp</option>
              <option value="benefits">Benefits</option>
              <option value="cybersecurity">Cybersecurity</option>
              <option value="data">Data</option>
              <option value="government">Government</option>
              <option value="vendor">Vendor</option>
            </select>
          </div>
        </div>
      </div>

      {/* Client Cards */}
      {loading ? (
        <div className="text-center py-12">
          <div className="flex items-center justify-center gap-2 text-jade/50 font-body">
            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Loading...
          </div>
        </div>
      ) : clients.length === 0 ? (
        <div className="text-center py-12 text-jade/50 font-body">
          No clients match your filters
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {clients.map((client) => (
            <div
              key={client.clientId}
              className="card p-4 cursor-pointer hover:shadow-md transition"
              onClick={() => setExpandedClient(
                expandedClient === client.clientId ? null : client.clientId
              )}
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-body font-semibold text-jade">{client.clientName}</h3>
                <span className={sectorBadgeClass[client.sector] || 'badge-sea'} style={{ fontSize: '0.75rem' }}>
                  {sectorLabel[client.sector] || client.sector}
                </span>
              </div>
              <p className="text-sm text-jade/60 font-body">
                {client.projects.length} project{client.projects.length !== 1 ? 's' : ''}
              </p>

              {/* Expanded view */}
              {expandedClient === client.clientId && (
                <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
                  {client.projects.map((project) => (
                    <div key={project.id} className="flex justify-between items-center">
                      <span className="text-sm font-body text-jade/80">{project.name}</span>
                      <span className={`${engagementBadge[project.engagementClass] || 'badge-jade'}`} style={{ fontSize: '0.7rem', padding: '0.15rem 0.5rem' }}>
                        {project.engagementClass}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
