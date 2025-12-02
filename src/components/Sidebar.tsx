import { useLocation, useNavigate } from 'react-router-dom';
import {
  FolderPlus,
  Folder,
  MessageSquare,
  User,
  GraduationCap,
  Ghost,
  Settings,
  LogOut,
  ChevronDown
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

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <aside className="w-[220px] h-screen bg-phantom-50/50 border-r border-phantom-200/80 flex flex-col">
      {/* Logo */}
      <div className="h-14 px-4 flex items-center border-b border-phantom-200/80">
        <div
          className="flex items-center gap-2.5 cursor-pointer"
          onClick={() => navigate('/')}
        >
          <div className="w-7 h-7 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-lg flex items-center justify-center shadow-sm">
            <Ghost className="w-4 h-4 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-phantom-900 font-semibold text-[13px] leading-tight">Leave a Mark</span>
            <span className="text-phantom-500 text-[11px] leading-tight">Agency</span>
          </div>
        </div>
      </div>

      {/* Primary Nav */}
      <nav className="flex-1 px-2.5 py-3 space-y-0.5 overflow-y-auto">
        <NavItem
          icon={<FolderPlus className="w-4 h-4" />}
          label="New Project"
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
        <NavItem
          icon={<User className="w-4 h-4" />}
          label="Client Profiles"
          active={isActive('/clients')}
          onClick={() => navigate('/clients')}
        />
        <NavItem
          icon={<GraduationCap className="w-4 h-4" />}
          label="Training"
          active={isActive('/training')}
          onClick={() => navigate('/training')}
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
      <div className="px-3 py-3 border-t border-phantom-200/80">
        <button className="w-full flex items-center gap-2.5 p-1.5 -m-1.5 rounded-lg hover:bg-phantom-100/80 transition-colors">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-white text-[10px] font-semibold shadow-sm">
            JD
          </div>
          <div className="flex-1 min-w-0 text-left">
            <p className="text-[13px] text-phantom-900 font-medium truncate leading-tight">John Doe</p>
            <p className="text-[11px] text-phantom-500 truncate leading-tight">Agent</p>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-phantom-400" />
        </button>
      </div>
    </aside>
  );
}
