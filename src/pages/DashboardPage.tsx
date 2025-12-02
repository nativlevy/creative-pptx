import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Plus, MessageSquare, Folder, FileText, ArrowLeft, Sparkles } from 'lucide-react';
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
            ברוכים השבים
          </h1>
          <p className="text-phantom-500">
            צרו מצגות משכנעות שמשאירות חותם.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
          <button
            onClick={() => navigate('/wizard')}
            className="group p-5 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white text-right hover:shadow-lg hover:scale-[1.02] transition-all"
          >
            <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center mb-4">
              <Plus className="w-5 h-5" />
            </div>
            <h3 className="font-semibold mb-1 flex items-center gap-2">
              מצגת חדשה
              <ArrowLeft className="w-4 h-4 opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
            </h3>
            <p className="text-sm text-white/80">
              הפכו תמלילים למצגות מלוטשות
            </p>
          </button>

          <button
            onClick={() => navigate('/chatbot')}
            className="group p-5 rounded-xl border border-phantom-200 bg-white text-right hover:border-violet-300 hover:shadow-md transition-all"
          >
            <div className="w-10 h-10 rounded-lg bg-violet-100 flex items-center justify-center mb-4">
              <MessageSquare className="w-5 h-5 text-violet-600" />
            </div>
            <h3 className="font-semibold text-phantom-900 mb-1 flex items-center gap-2">
              צ'אטבוט AI
              <Sparkles className="w-4 h-4 text-violet-500" />
            </h3>
            <p className="text-sm text-phantom-500">
              שאלו שאלות על המסמכים שלכם
            </p>
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-10">
          <button
            onClick={() => navigate('/projects')}
            className="p-4 rounded-xl border border-phantom-200 bg-white hover:border-phantom-300 transition-colors text-right"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-phantom-100 flex items-center justify-center">
                <Folder className="w-5 h-5 text-phantom-600" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-phantom-900">{stats.projects}</p>
                <p className="text-sm text-phantom-500">פרויקטים</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => navigate('/chatbot')}
            className="p-4 rounded-xl border border-phantom-200 bg-white hover:border-phantom-300 transition-colors text-right"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-phantom-100 flex items-center justify-center">
                <FileText className="w-5 h-5 text-phantom-600" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-phantom-900">{stats.documents}</p>
                <p className="text-sm text-phantom-500">מסמכים</p>
              </div>
            </div>
          </button>
        </div>

      </div>
    </main>
  );
}
