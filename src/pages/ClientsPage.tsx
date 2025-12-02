import { useState } from 'react';
import { Plus, Building2, Mail, Phone, MoreHorizontal } from 'lucide-react';

const mockClients = [
  {
    id: 1,
    name: 'Acme Corporation',
    contact: 'Sarah Johnson',
    email: 'sarah@acme.com',
    phone: '+1 (555) 123-4567',
    projects: 5,
    avatar: 'AC'
  },
  {
    id: 2,
    name: 'TechStart Inc',
    contact: 'Michael Chen',
    email: 'michael@techstart.io',
    phone: '+1 (555) 987-6543',
    projects: 3,
    avatar: 'TS'
  },
  {
    id: 3,
    name: 'Global Finance Ltd',
    contact: 'Emma Williams',
    email: 'emma@globalfinance.com',
    phone: '+1 (555) 456-7890',
    projects: 8,
    avatar: 'GF'
  }
];

export function ClientsPage() {
  const [clients] = useState(mockClients);

  return (
    <main className="flex-1 overflow-y-auto">
      <div className="max-w-5xl mx-auto px-8 py-10">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-semibold text-phantom-900 tracking-tight">
            Client Profiles
          </h1>
          <button className="flex items-center gap-2 px-4 py-2 bg-violet-500 text-white text-sm font-medium rounded-lg hover:bg-violet-600 transition-colors shadow-sm">
            <Plus className="w-4 h-4" />
            Add Client
          </button>
        </div>

        <div className="grid gap-4">
          {clients.map(client => (
            <div
              key={client.id}
              className="group p-5 rounded-xl border border-phantom-200 bg-white hover:border-violet-300 hover:shadow-md transition-all"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-white font-semibold">
                  {client.avatar}
                </div>

                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-phantom-900 flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-phantom-400" />
                        {client.name}
                      </h3>
                      <p className="text-sm text-phantom-500 mt-0.5">
                        Contact: {client.contact}
                      </p>
                    </div>
                    <button className="p-1.5 text-phantom-400 hover:text-phantom-600 opacity-0 group-hover:opacity-100 transition-all">
                      <MoreHorizontal className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="flex items-center gap-6 mt-3 text-sm text-phantom-600">
                    <span className="flex items-center gap-1.5">
                      <Mail className="w-4 h-4 text-phantom-400" />
                      {client.email}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Phone className="w-4 h-4 text-phantom-400" />
                      {client.phone}
                    </span>
                    <span className="px-2 py-0.5 bg-violet-100 text-violet-700 rounded-full text-xs font-medium">
                      {client.projects} projects
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
