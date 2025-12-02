import { Zap, Bell, Search } from 'lucide-react';

export function Header() {
  return (
    <header className="h-14 border-b border-phantom-200/80 flex items-center justify-between px-5 bg-white/80 backdrop-blur-sm">
      {/* Search / Command Bar */}
      <button className="flex items-center gap-2 px-3 py-1.5 text-phantom-400 hover:text-phantom-600 bg-phantom-100/60 hover:bg-phantom-100 border border-phantom-200/80 rounded-lg transition-all">
        <Search className="w-3.5 h-3.5" />
        <span className="text-[13px]">Search...</span>
        <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-medium text-phantom-400 bg-white border border-phantom-200 rounded">
          <span>⌘</span><span>K</span>
        </kbd>
      </button>

      <div className="flex items-center gap-2">
        {/* Credits Badge */}
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-phantom-50 border border-phantom-200/80">
          <div className="w-5 h-5 rounded-md bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-sm">
            <Zap className="w-3 h-3 text-white" />
          </div>
          <span className="text-phantom-900 text-[13px] font-medium">24</span>
          <span className="text-phantom-500 text-[11px]">credits</span>
        </div>

        {/* Notifications */}
        <button className="relative p-2 text-phantom-400 hover:text-phantom-700 hover:bg-phantom-100/80 rounded-lg transition-all">
          <Bell className="w-[18px] h-[18px]" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-violet-500 rounded-full ring-2 ring-white"></span>
        </button>

        {/* User Avatar */}
        <button className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-white text-[11px] font-semibold shadow-sm hover:shadow-md transition-shadow">
          JD
        </button>
      </div>
    </header>
  );
}
