import { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Folder,
  MessageSquare,
  User,
  Settings,
  LogOut,
  ChevronDown,
  CreditCard,
  HelpCircle
} from 'lucide-react';

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
}

function NavItem({ icon, label, active = false, onClick }: NavItemProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-[13px] font-medium transition-all duration-150 ${
        active
          ? 'bg-phantom-900 text-white shadow-sm'
          : 'text-phantom-600 hover:text-phantom-900 hover:bg-phantom-100/80'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

export function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close dropdown on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setUserMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <aside className="w-[220px] h-screen bg-phantom-50/50 border-r border-phantom-200/80 flex flex-col">
      {/* Logo */}
      <div className="h-14 px-4 flex items-center border-b border-phantom-200/80">
        <div
          className="cursor-pointer"
          onClick={() => navigate('/')}
        >
          <img
            src="https://leave-mark.com/pp/wp-content/uploads/2021/11/%D7%9C%D7%95%D7%92%D7%95-%D7%9C%D7%99%D7%91-%D7%90-%D7%90%D7%9E%D7%90%D7%A8%D7%A7-%D7%97%D7%93%D7%A9.png"
            alt="Leave a Mark"
            className="h-10 object-contain"
          />
        </div>
      </div>

      {/* Primary Nav */}
      <nav className="flex-1 px-2.5 py-3 space-y-0.5 overflow-y-auto">
        <NavItem
          icon={<LayoutDashboard className="w-4 h-4" />}
          label="Dashboard"
          active={isActive('/') && !isActive('/projects')}
          onClick={() => navigate('/')}
        />
        <NavItem
          icon={<Folder className="w-4 h-4" />}
          label="My Projects"
          active={isActive('/projects')}
          onClick={() => navigate('/projects')}
        />
        <NavItem
          icon={<MessageSquare className="w-4 h-4" />}
          label="AI Chatbot"
          active={isActive('/chatbot')}
          onClick={() => navigate('/chatbot')}
        />
      </nav>

      {/* Bottom section */}
      <div className="px-2.5 py-2 border-t border-phantom-200/80 space-y-0.5">
        <NavItem
          icon={<Settings className="w-4 h-4" />}
          label="Settings"
          active={isActive('/settings')}
          onClick={() => navigate('/settings')}
        />
        <NavItem
          icon={<LogOut className="w-4 h-4" />}
          label="Sign out"
          onClick={() => alert('Sign out clicked')}
        />
      </div>

      {/* User */}
      <div className="px-3 py-3 border-t border-phantom-200/80 relative" ref={userMenuRef}>
        <button
          onClick={() => setUserMenuOpen(!userMenuOpen)}
          className="w-full flex items-center gap-2.5 p-1.5 -m-1.5 rounded-lg hover:bg-phantom-100/80 transition-colors"
        >
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-white text-[10px] font-semibold shadow-sm">
            JD
          </div>
          <div className="flex-1 min-w-0 text-left">
            <p className="text-[13px] text-phantom-900 font-medium truncate leading-tight">John Doe</p>
            <p className="text-[11px] text-phantom-500 truncate leading-tight">Agent</p>
          </div>
          <ChevronDown className={`w-3.5 h-3.5 text-phantom-400 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
        </button>

        {/* User Dropdown Menu */}
        {userMenuOpen && (
          <div className="absolute bottom-full left-3 right-3 mb-2 bg-white rounded-xl shadow-lg border border-phantom-200/80 overflow-hidden z-50">
            <div className="px-3 py-2.5 border-b border-phantom-200/80">
              <p className="text-[13px] font-semibold text-phantom-900">John Doe</p>
              <p className="text-[11px] text-phantom-500">john@leaveamark.agency</p>
            </div>
            <div className="py-1">
              <button
                onClick={() => {
                  navigate('/settings');
                  setUserMenuOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-[12px] text-phantom-700 hover:bg-phantom-50 transition-colors"
              >
                <User className="w-3.5 h-3.5 text-phantom-400" />
                View Profile
              </button>
              <button
                onClick={() => {
                  navigate('/settings');
                  setUserMenuOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-[12px] text-phantom-700 hover:bg-phantom-50 transition-colors"
              >
                <Settings className="w-3.5 h-3.5 text-phantom-400" />
                Settings
              </button>
              <button
                className="w-full flex items-center gap-2.5 px-3 py-2 text-[12px] text-phantom-700 hover:bg-phantom-50 transition-colors"
              >
                <CreditCard className="w-3.5 h-3.5 text-phantom-400" />
                Billing & Plans
              </button>
              <button
                className="w-full flex items-center gap-2.5 px-3 py-2 text-[12px] text-phantom-700 hover:bg-phantom-50 transition-colors"
              >
                <HelpCircle className="w-3.5 h-3.5 text-phantom-400" />
                Help & Support
              </button>
            </div>
            <div className="py-1 border-t border-phantom-200/80">
              <button
                onClick={() => alert('Signing out...')}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-[12px] text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign out
              </button>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
