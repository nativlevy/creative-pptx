import {
  LayoutTemplate,
  Palette,
  FileText,
  FileCheck,
  ListTree,
  BarChart3,
  Upload
} from 'lucide-react';

interface ToolItemProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  requiresUpload?: boolean;
  onClick?: () => void;
}

function ToolItem({ icon, title, description, requiresUpload = false, onClick }: ToolItemProps) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-3.5 py-3 hover:bg-phantom-50/80 transition-colors duration-150 text-right group"
    >
      <div className="w-9 h-9 rounded-lg bg-phantom-100/80 border border-phantom-200/80 flex items-center justify-center text-phantom-500 group-hover:text-phantom-700 group-hover:border-phantom-300 group-hover:bg-phantom-100 transition-all duration-150">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-phantom-900 text-[13px] font-medium">{title}</h4>
        <p className="text-phantom-500 text-[11px] truncate">{description}</p>
      </div>
      {requiresUpload && (
        <span className="flex items-center gap-1 text-[10px] font-medium text-violet-600 bg-violet-50 px-2 py-1 rounded-md border border-violet-100/80">
          <Upload className="w-3 h-3" />
          העלאה
        </span>
      )}
    </button>
  );
}

export function ToolsSection() {
  return (
    <div className="rounded-xl border border-phantom-200/80 bg-white/80 backdrop-blur-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-phantom-200/60 bg-phantom-50/30">
        <h3 className="text-phantom-900 font-semibold text-[13px]">כלים</h3>
      </div>
      <div className="divide-y divide-phantom-100/80">
        <ToolItem
          icon={<LayoutTemplate className="w-4 h-4" />}
          title="שיפור תוכן שקפים"
          description="קבלו דוח לארגון מחדש ושכתוב של שקפים."
          requiresUpload
        />
        <ToolItem
          icon={<Palette className="w-4 h-4" />}
          title="שיפור עיצוב שקפים"
          description="קבלו דוח לשינוי פריסה ועיצוב שקפים."
          requiresUpload
        />
        <ToolItem
          icon={<FileText className="w-4 h-4" />}
          title="בניית מצגת"
          description="קבלו מצגת PowerPoint של ~21 שקפים עם הערות דובר."
          requiresUpload
        />
        <ToolItem
          icon={<FileCheck className="w-4 h-4" />}
          title="כתיבת הצעה"
          description="קבלו מצגת של 5 עמודים המובנית להנעה לפעולה."
          requiresUpload
        />
        <ToolItem
          icon={<ListTree className="w-4 h-4" />}
          title="טיוטת מתווה"
          description="קבלו קו סיפורי ב-Word הממפה את הזרימה."
        />
        <ToolItem
          icon={<BarChart3 className="w-4 h-4" />}
          title="שיפור בהירות תרשימים"
          description="קבלו דוח להבהרת עיצוב תרשימים."
          requiresUpload
        />
      </div>
    </div>
  );
}
