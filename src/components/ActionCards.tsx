import { Sparkles, FileEdit, Users, ArrowLeft, MessageSquareText } from 'lucide-react';

interface ActionCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  gradient: string;
  comingSoon?: boolean;
  onClick?: () => void;
}

function ActionCard({ icon, title, description, gradient, comingSoon = false, onClick }: ActionCardProps) {
  return (
    <button
      onClick={onClick}
      disabled={comingSoon}
      className={`relative group flex flex-col items-start p-5 rounded-xl border border-phantom-200/80 bg-white/80 backdrop-blur-sm hover:bg-white hover:border-phantom-300 hover:shadow-md transition-all duration-200 text-right ${comingSoon ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      {comingSoon && (
        <span className="absolute top-3 left-3 text-[10px] font-medium bg-phantom-100 text-phantom-500 px-2 py-0.5 rounded-md">
          בקרוב
        </span>
      )}

      <div className={`w-10 h-10 rounded-lg ${gradient} flex items-center justify-center mb-3.5 shadow-sm group-hover:shadow-md group-hover:scale-105 transition-all duration-200`}>
        {icon}
      </div>

      <h3 className="text-phantom-900 font-semibold text-[15px] mb-1 flex items-center gap-1.5">
        {title}
        <ArrowLeft className="w-3.5 h-3.5 opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
      </h3>
      <p className="text-phantom-500 text-[13px] leading-relaxed">
        {description}
      </p>
    </button>
  );
}

interface ActionCardsProps {
  onTranscriptClick?: () => void;
  onIdeaToPptxClick?: () => void;
}

export function ActionCards({ onTranscriptClick, onIdeaToPptxClick }: ActionCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
      <ActionCard
        icon={<MessageSquareText className="w-5 h-5 text-white" />}
        title="מתמליל למצגת"
        description="הפכו תמלילי פגישות למצגות מלוטשות בקלות."
        gradient="bg-gradient-to-br from-cyan-500 to-blue-600"
        onClick={onTranscriptClick}
      />
      <ActionCard
        icon={<Sparkles className="w-5 h-5 text-white" />}
        title="מרעיון ל-PPTX"
        description="תארו את הרעיון וקבלו מצגת מקצועית מוכנה."
        gradient="bg-gradient-to-br from-amber-500 to-orange-600"
        onClick={onIdeaToPptxClick}
      />
      <ActionCard
        icon={<FileEdit className="w-5 h-5 text-white" />}
        title="יצירה מבריף"
        description="בנו מצגת משכנעת מבריף הלקוח או המתווה שלכם."
        gradient="bg-gradient-to-br from-emerald-500 to-teal-600"
        comingSoon
      />
      <ActionCard
        icon={<Users className="w-5 h-5 text-white" />}
        title="התאמה לקהל"
        description="התאימו תוכן לבעלי עניין והקשרים שונים."
        gradient="bg-gradient-to-br from-violet-500 to-purple-600"
        comingSoon
      />
    </div>
  );
}
