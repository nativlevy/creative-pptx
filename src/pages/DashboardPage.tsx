import { useNavigate } from 'react-router-dom';
import { ActionCards } from '../components/ActionCards';
import { ToolsSection } from '../components/ToolsSection';
import { AIChat } from '../components/AIChat';

export function DashboardPage() {
  const navigate = useNavigate();

  return (
    <>
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-8 py-10">
          <h1 className="text-2xl font-semibold text-phantom-900 mb-8 tracking-tight">
            What do you want to do today?
          </h1>

          <div className="mb-10">
            <ActionCards
              onTranscriptClick={() => navigate('/wizard')}
              onIdeaToPptxClick={() => navigate('/idea-to-pptx')}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <ToolsSection />
            <AIChat />
          </div>
        </div>
      </main>

      <footer className="border-t border-phantom-200/60 bg-white/50 backdrop-blur-sm px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4 text-[11px] text-phantom-400">
          <a href="#" className="hover:text-phantom-600 transition-colors">Contact us</a>
          <span className="text-phantom-300">·</span>
          <span>2025 © Leave a Mark</span>
        </div>
        <div className="flex items-center gap-3 text-[11px] text-phantom-400">
          <a href="#" className="hover:text-phantom-600 transition-colors">Terms</a>
          <span className="text-phantom-300">·</span>
          <a href="#" className="hover:text-phantom-600 transition-colors">Privacy Policy</a>
        </div>
      </footer>
    </>
  );
}
