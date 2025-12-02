import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Search, X, Settings, LogOut, User, CreditCard, FileText, MessageSquare, Folder } from 'lucide-react';

interface SearchResult {
  id: string;
  title: string;
  type: 'page' | 'project' | 'client';
  icon: React.ReactNode;
  path: string;
}

const searchResults: SearchResult[] = [
  { id: '1', title: 'לוח בקרה', type: 'page', icon: <FileText className="w-4 h-4" />, path: '/' },
  { id: '2', title: 'הפרויקטים שלי', type: 'page', icon: <Folder className="w-4 h-4" />, path: '/projects' },
  { id: '3', title: 'צ\'אטבוט AI', type: 'page', icon: <MessageSquare className="w-4 h-4" />, path: '/chatbot' },
  { id: '4', title: 'הגדרות', type: 'page', icon: <Settings className="w-4 h-4" />, path: '/settings' },
];

const notifications = [
  { id: '1', title: 'המצגת מוכנה', message: 'המצגת "אסטרטגיית מותג 2024" שלך נוצרה', time: 'לפני 5 דקות', unread: true },
  { id: '2', title: 'בריף לקוח חדש הועלה', message: 'הנחיות המותג של TechStart Ltd. זמינות כעת', time: 'לפני שעתיים', unread: true },
  { id: '3', title: 'הייצוא הצליח', message: 'מצגת הפיץ\' לקמפיין יוצאה ל-PPTX', time: 'לפני יום', unread: false },
];

export function Header() {
  const navigate = useNavigate();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Keyboard shortcut for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
      if (e.key === 'Escape') {
        setSearchOpen(false);
        setNotificationsOpen(false);
        setUserMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Focus search input when modal opens
  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notificationsRef.current && !notificationsRef.current.contains(e.target as Node)) {
        setNotificationsOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredResults = searchResults.filter(result =>
    result.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSearchSelect = (result: SearchResult) => {
    navigate(result.path);
    setSearchOpen(false);
    setSearchQuery('');
  };

  return (
    <>
      <header className="h-14 border-b border-phantom-200/80 flex items-center justify-between px-5 bg-white/80 backdrop-blur-sm">
        {/* Search / Command Bar */}
        <button
          onClick={() => setSearchOpen(true)}
          className="flex items-center gap-2 px-4 py-1.5 text-phantom-400 hover:text-phantom-600 bg-phantom-100/60 hover:bg-phantom-100 border border-phantom-200/80 rounded-lg transition-all min-w-[280px]"
        >
          <Search className="w-3.5 h-3.5" />
          <span className="text-[13px]">חיפוש...</span>
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-medium text-phantom-400 bg-white border border-phantom-200 rounded">
            <span>⌘</span><span>K</span>
          </kbd>
        </button>

        <div className="flex items-center gap-2">
          {/* Notifications */}
          <div className="relative" ref={notificationsRef}>
            <button
              onClick={() => {
                setNotificationsOpen(!notificationsOpen);
                setUserMenuOpen(false);
              }}
              className="relative p-2 text-phantom-400 hover:text-phantom-700 hover:bg-phantom-100/80 rounded-lg transition-all"
            >
              <Bell className="w-[18px] h-[18px]" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-violet-500 rounded-full ring-2 ring-white"></span>
            </button>

            {notificationsOpen && (
              <div className="absolute left-0 top-full mt-2 w-80 bg-white rounded-xl shadow-lg border border-phantom-200/80 overflow-hidden z-50">
                <div className="px-4 py-3 border-b border-phantom-200/80">
                  <h3 className="text-[14px] font-semibold text-phantom-900">התראות</h3>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.map(notification => (
                    <div
                      key={notification.id}
                      className={`px-4 py-3 border-b border-phantom-100 hover:bg-phantom-50 cursor-pointer transition-colors ${notification.unread ? 'bg-violet-50/30' : ''}`}
                    >
                      <div className="flex items-start gap-3">
                        {notification.unread && (
                          <span className="w-2 h-2 mt-1.5 bg-violet-500 rounded-full flex-shrink-0"></span>
                        )}
                        <div className={notification.unread ? '' : 'mr-5'}>
                          <p className="text-[13px] font-medium text-phantom-900">{notification.title}</p>
                          <p className="text-[12px] text-phantom-500 mt-0.5">{notification.message}</p>
                          <p className="text-[11px] text-phantom-400 mt-1">{notification.time}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="px-4 py-2 bg-phantom-50/50">
                  <button className="text-[12px] text-violet-600 hover:text-violet-700 font-medium">
                    סמן הכל כנקרא
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User Avatar */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => {
                setUserMenuOpen(!userMenuOpen);
                setNotificationsOpen(false);
              }}
              className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-white text-[11px] font-semibold shadow-sm hover:shadow-md transition-shadow"
            >
              מנ
            </button>

            {userMenuOpen && (
              <div className="absolute left-0 top-full mt-2 w-56 bg-white rounded-xl shadow-lg border border-phantom-200/80 overflow-hidden z-50">
                <div className="px-4 py-3 border-b border-phantom-200/80">
                  <p className="text-[13px] font-semibold text-phantom-900">מנהל Leave a Mark</p>
                  <p className="text-[12px] text-phantom-500">john@leaveamark.agency</p>
                </div>
                <div className="py-1">
                  <button
                    onClick={() => {
                      navigate('/settings');
                      setUserMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-[13px] text-phantom-700 hover:bg-phantom-50 transition-colors"
                  >
                    <User className="w-4 h-4 text-phantom-400" />
                    פרופיל
                  </button>
                  <button
                    onClick={() => {
                      navigate('/settings');
                      setUserMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-[13px] text-phantom-700 hover:bg-phantom-50 transition-colors"
                  >
                    <Settings className="w-4 h-4 text-phantom-400" />
                    הגדרות
                  </button>
                  <button className="w-full flex items-center gap-2.5 px-4 py-2 text-[13px] text-phantom-700 hover:bg-phantom-50 transition-colors">
                    <CreditCard className="w-4 h-4 text-phantom-400" />
                    חיוב
                  </button>
                </div>
                <div className="py-1 border-t border-phantom-200/80">
                  <button
                    onClick={() => alert('מתנתק...')}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-[13px] text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    התנתקות
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Search Modal */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]">
          <div
            className="absolute inset-0 bg-phantom-900/20 backdrop-blur-sm"
            onClick={() => setSearchOpen(false)}
          />
          <div className="relative w-full max-w-lg bg-white rounded-xl shadow-2xl border border-phantom-200/80 overflow-hidden">
            <div className="flex items-center gap-3 px-4 py-3 border-b border-phantom-200/80">
              <Search className="w-5 h-5 text-phantom-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="חפש עמודים ופרויקטים..."
                className="flex-1 text-[14px] text-phantom-900 placeholder:text-phantom-400 outline-none"
              />
              <button
                onClick={() => setSearchOpen(false)}
                className="p-1 text-phantom-400 hover:text-phantom-600 hover:bg-phantom-100 rounded transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {filteredResults.length > 0 ? (
                <div className="py-2">
                  <div className="px-3 py-1.5">
                    <span className="text-[11px] font-medium text-phantom-400 uppercase tracking-wider">עמודים</span>
                  </div>
                  {filteredResults.map(result => (
                    <button
                      key={result.id}
                      onClick={() => handleSearchSelect(result)}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-right hover:bg-phantom-50 transition-colors"
                    >
                      <span className="text-phantom-400">{result.icon}</span>
                      <span className="text-[13px] text-phantom-900">{result.title}</span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="px-4 py-8 text-center">
                  <p className="text-[13px] text-phantom-500">לא נמצאו תוצאות</p>
                </div>
              )}
            </div>
            <div className="px-4 py-2.5 bg-phantom-50/50 border-t border-phantom-200/80 flex items-center gap-4">
              <span className="text-[11px] text-phantom-400">
                <kbd className="px-1.5 py-0.5 bg-white border border-phantom-200 rounded text-[10px]">↵</kbd> לבחירה
              </span>
              <span className="text-[11px] text-phantom-400">
                <kbd className="px-1.5 py-0.5 bg-white border border-phantom-200 rounded text-[10px]">esc</kbd> לסגירה
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
