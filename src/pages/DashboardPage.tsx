import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Plus, MessageSquare, Folder, FileText, ArrowRight, Sparkles } from 'lucide-react';
import { getProjects, getDocuments } from '../lib/api';

export function DashboardPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ projects: 0, documents: 0 });

  useEffect(() => {
    async function loadStats() {
      try {
        const [projects, documents] = await Promise.all([
          getProjects().catch(() => []),
          getDocuments().catch(() => [])
        ]);
        setStats({ projects: projects.length, documents: documents.length });
      } catch (e) {
        console.error('Failed to load stats:', e);
      }
    }
    loadStats();
  }, []);

  return (
    <main className="flex-1 overflow-y-auto">
      <div className="max-w-3xl mx-auto px-8 py-12">
        {/* Welcome */}
        <div className="mb-10">
          <h1 className="text-2xl font-semibold text-phantom-900 mb-2">
            Welcome back
          </h1>
          <p className="text-phantom-500">
            Create compelling presentations that leave a mark.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
          <button
            onClick={() => navigate('/wizard')}
            className="group p-5 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white text-left hover:shadow-lg hover:scale-[1.02] transition-all"
          >
            <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center mb-4">
              <Plus className="w-5 h-5" />
            </div>
            <h3 className="font-semibold mb-1 flex items-center gap-2">
              New Presentation
              <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
            </h3>
            <p className="text-sm text-white/80">
              Transform transcripts into polished decks
            </p>
          </button>

          <button
            onClick={() => navigate('/chatbot')}
            className="group p-5 rounded-xl border border-phantom-200 bg-white text-left hover:border-violet-300 hover:shadow-md transition-all"
          >
            <div className="w-10 h-10 rounded-lg bg-violet-100 flex items-center justify-center mb-4">
              <MessageSquare className="w-5 h-5 text-violet-600" />
            </div>
            <h3 className="font-semibold text-phantom-900 mb-1 flex items-center gap-2">
              AI Chatbot
              <Sparkles className="w-4 h-4 text-violet-500" />
            </h3>
            <p className="text-sm text-phantom-500">
              Ask questions about your documents
            </p>
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-10">
          <button
            onClick={() => navigate('/projects')}
            className="p-4 rounded-xl border border-phantom-200 bg-white hover:border-phantom-300 transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-phantom-100 flex items-center justify-center">
                <Folder className="w-5 h-5 text-phantom-600" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-phantom-900">{stats.projects}</p>
                <p className="text-sm text-phantom-500">Projects</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => navigate('/chatbot')}
            className="p-4 rounded-xl border border-phantom-200 bg-white hover:border-phantom-300 transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-phantom-100 flex items-center justify-center">
                <FileText className="w-5 h-5 text-phantom-600" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-phantom-900">{stats.documents}</p>
                <p className="text-sm text-phantom-500">Documents</p>
              </div>
            </div>
          </button>
        </div>

        {/* Quick Links */}
        <div className="border-t border-phantom-200 pt-6">
          <h2 className="text-sm font-medium text-phantom-500 mb-4">Quick links</h2>
          <div className="flex flex-wrap gap-2">
            {[
              { label: 'Idea to PPTX', path: '/idea-to-pptx' },
              { label: 'Training', path: '/training' },
              { label: 'Settings', path: '/settings' },
            ].map(link => (
              <button
                key={link.path}
                onClick={() => navigate(link.path)}
                className="px-3 py-1.5 text-sm text-phantom-600 bg-phantom-50 rounded-lg hover:bg-phantom-100 transition-colors"
              >
                {link.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
