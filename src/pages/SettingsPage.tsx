import { useState } from 'react';
import { User, Bell, Palette, Shield, Key, CreditCard } from 'lucide-react';

type SettingsTab = 'profile' | 'notifications' | 'appearance' | 'security' | 'api' | 'billing';

const tabs = [
  { id: 'profile' as const, label: 'פרופיל', icon: User },
  { id: 'notifications' as const, label: 'התראות', icon: Bell },
  { id: 'appearance' as const, label: 'מראה', icon: Palette },
  { id: 'security' as const, label: 'אבטחה', icon: Shield },
  { id: 'api' as const, label: 'מפתחות API', icon: Key },
  { id: 'billing' as const, label: 'חיוב', icon: CreditCard },
];

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');

  return (
    <main className="flex-1 overflow-y-auto">
      <div className="max-w-5xl mx-auto px-8 py-10">
        <h1 className="text-2xl font-semibold text-phantom-900 tracking-tight mb-8">
          הגדרות
        </h1>

        <div className="flex gap-8">
          {/* Tabs */}
          <div className="w-48 flex-shrink-0">
            <nav className="space-y-1">
              {tabs.map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      activeTab === tab.id
                        ? 'bg-violet-100 text-violet-700'
                        : 'text-phantom-600 hover:bg-phantom-100'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 bg-white rounded-xl border border-phantom-200 p-6">
            {activeTab === 'profile' && (
              <div>
                <h2 className="text-lg font-semibold text-phantom-900 mb-6">הגדרות פרופיל</h2>
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-white text-2xl font-semibold">
                      מנ
                    </div>
                    <div>
                      <button className="px-4 py-2 text-sm font-medium text-violet-600 bg-violet-50 rounded-lg hover:bg-violet-100 transition-colors">
                        שנה תמונה
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-phantom-700 mb-1.5">שם פרטי</label>
                      <input
                        type="text"
                        defaultValue="ישראל"
                        className="w-full px-3 py-2 border border-phantom-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-phantom-700 mb-1.5">שם משפחה</label>
                      <input
                        type="text"
                        defaultValue="ישראלי"
                        className="w-full px-3 py-2 border border-phantom-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-phantom-700 mb-1.5">אימייל</label>
                    <input
                      type="email"
                      defaultValue="john.doe@leaveamark.agency"
                      className="w-full px-3 py-2 border border-phantom-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-phantom-700 mb-1.5">תפקיד</label>
                    <input
                      type="text"
                      defaultValue="סוכן"
                      disabled
                      className="w-full px-3 py-2 border border-phantom-200 rounded-lg bg-phantom-50 text-phantom-500"
                    />
                  </div>

                  <div className="pt-4 border-t border-phantom-200">
                    <button className="px-4 py-2 bg-violet-500 text-white text-sm font-medium rounded-lg hover:bg-violet-600 transition-colors">
                      שמור שינויים
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div>
                <h2 className="text-lg font-semibold text-phantom-900 mb-6">העדפות התראות</h2>
                <div className="space-y-4">
                  {[
                    { label: 'התראות באימייל', desc: 'קבלו עדכונים באימייל' },
                    { label: 'עדכוני פרויקטים', desc: 'קבלו התראות כשפרויקטים משתנים' },
                    { label: 'סיכום שבועי', desc: 'סיכום הפעילות השבועית שלכם' },
                    { label: 'אימיילים שיווקיים', desc: 'חדשות ועדכוני מוצר' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-4 rounded-lg bg-phantom-50">
                      <div>
                        <p className="font-medium text-phantom-900">{item.label}</p>
                        <p className="text-sm text-phantom-500">{item.desc}</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" defaultChecked={i < 2} className="sr-only peer" />
                        <div className="w-11 h-6 bg-phantom-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-violet-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-phantom-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-violet-500"></div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'appearance' && (
              <div>
                <h2 className="text-lg font-semibold text-phantom-900 mb-6">מראה</h2>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-phantom-700 mb-3">ערכת נושא</label>
                    <div className="flex gap-3">
                      {['בהיר', 'כהה', 'מערכת'].map((theme, idx) => (
                        <button
                          key={theme}
                          className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                            idx === 0
                              ? 'bg-violet-100 border-violet-300 text-violet-700'
                              : 'border-phantom-200 text-phantom-600 hover:border-phantom-300'
                          }`}
                        >
                          {theme}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div>
                <h2 className="text-lg font-semibold text-phantom-900 mb-6">אבטחה</h2>
                <div className="space-y-6">
                  <div>
                    <h3 className="font-medium text-phantom-900 mb-3">שינוי סיסמה</h3>
                    <div className="space-y-3 max-w-md">
                      <input
                        type="password"
                        placeholder="סיסמה נוכחית"
                        className="w-full px-3 py-2 border border-phantom-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                      />
                      <input
                        type="password"
                        placeholder="סיסמה חדשה"
                        className="w-full px-3 py-2 border border-phantom-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                      />
                      <input
                        type="password"
                        placeholder="אשרו סיסמה חדשה"
                        className="w-full px-3 py-2 border border-phantom-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                      />
                      <button className="px-4 py-2 bg-violet-500 text-white text-sm font-medium rounded-lg hover:bg-violet-600 transition-colors">
                        עדכן סיסמה
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'api' && (
              <div>
                <h2 className="text-lg font-semibold text-phantom-900 mb-6">מפתחות API</h2>
                <p className="text-phantom-500 mb-4">נהלו את מפתחות ה-API שלכם לאינטגרציות</p>
                <div className="p-4 rounded-lg bg-phantom-50 border border-phantom-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-phantom-900">מפתח ייצור</p>
                      <p className="text-sm text-phantom-500 font-mono">sk-****************************1234</p>
                    </div>
                    <button className="text-sm text-violet-600 hover:text-violet-700">צור מחדש</button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'billing' && (
              <div>
                <h2 className="text-lg font-semibold text-phantom-900 mb-6">חיוב</h2>
                <div className="p-4 rounded-lg bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white mb-6">
                  <p className="text-sm opacity-80">תוכנית נוכחית</p>
                  <p className="text-2xl font-bold">מקצועית</p>
                  <p className="text-sm opacity-80 mt-1">₪179/חודש · מתחדש ב-1 בינואר 2026</p>
                </div>
                <button className="px-4 py-2 border border-phantom-200 text-phantom-700 text-sm font-medium rounded-lg hover:bg-phantom-50 transition-colors">
                  נהל מנוי
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
