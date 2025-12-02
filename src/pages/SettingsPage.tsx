import { useState } from 'react';
import { User, Bell, Palette, Shield, Key, CreditCard } from 'lucide-react';

type SettingsTab = 'profile' | 'notifications' | 'appearance' | 'security' | 'api' | 'billing';

const tabs = [
  { id: 'profile' as const, label: 'Profile', icon: User },
  { id: 'notifications' as const, label: 'Notifications', icon: Bell },
  { id: 'appearance' as const, label: 'Appearance', icon: Palette },
  { id: 'security' as const, label: 'Security', icon: Shield },
  { id: 'api' as const, label: 'API Keys', icon: Key },
  { id: 'billing' as const, label: 'Billing', icon: CreditCard },
];

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');

  return (
    <main className="flex-1 overflow-y-auto">
      <div className="max-w-5xl mx-auto px-8 py-10">
        <h1 className="text-2xl font-semibold text-phantom-900 tracking-tight mb-8">
          Settings
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
                <h2 className="text-lg font-semibold text-phantom-900 mb-6">Profile Settings</h2>
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-white text-2xl font-semibold">
                      JD
                    </div>
                    <div>
                      <button className="px-4 py-2 text-sm font-medium text-violet-600 bg-violet-50 rounded-lg hover:bg-violet-100 transition-colors">
                        Change Avatar
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-phantom-700 mb-1.5">First Name</label>
                      <input
                        type="text"
                        defaultValue="John"
                        className="w-full px-3 py-2 border border-phantom-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-phantom-700 mb-1.5">Last Name</label>
                      <input
                        type="text"
                        defaultValue="Doe"
                        className="w-full px-3 py-2 border border-phantom-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-phantom-700 mb-1.5">Email</label>
                    <input
                      type="email"
                      defaultValue="john.doe@leaveamark.agency"
                      className="w-full px-3 py-2 border border-phantom-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-phantom-700 mb-1.5">Role</label>
                    <input
                      type="text"
                      defaultValue="Agent"
                      disabled
                      className="w-full px-3 py-2 border border-phantom-200 rounded-lg bg-phantom-50 text-phantom-500"
                    />
                  </div>

                  <div className="pt-4 border-t border-phantom-200">
                    <button className="px-4 py-2 bg-violet-500 text-white text-sm font-medium rounded-lg hover:bg-violet-600 transition-colors">
                      Save Changes
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div>
                <h2 className="text-lg font-semibold text-phantom-900 mb-6">Notification Preferences</h2>
                <div className="space-y-4">
                  {[
                    { label: 'Email notifications', desc: 'Receive updates via email' },
                    { label: 'Project updates', desc: 'Get notified when projects are modified' },
                    { label: 'Weekly digest', desc: 'Summary of your weekly activity' },
                    { label: 'Marketing emails', desc: 'News and product updates' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-4 rounded-lg bg-phantom-50">
                      <div>
                        <p className="font-medium text-phantom-900">{item.label}</p>
                        <p className="text-sm text-phantom-500">{item.desc}</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" defaultChecked={i < 2} className="sr-only peer" />
                        <div className="w-11 h-6 bg-phantom-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-violet-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-phantom-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-violet-500"></div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'appearance' && (
              <div>
                <h2 className="text-lg font-semibold text-phantom-900 mb-6">Appearance</h2>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-phantom-700 mb-3">Theme</label>
                    <div className="flex gap-3">
                      {['Light', 'Dark', 'System'].map(theme => (
                        <button
                          key={theme}
                          className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                            theme === 'Light'
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
                <h2 className="text-lg font-semibold text-phantom-900 mb-6">Security</h2>
                <div className="space-y-6">
                  <div>
                    <h3 className="font-medium text-phantom-900 mb-3">Change Password</h3>
                    <div className="space-y-3 max-w-md">
                      <input
                        type="password"
                        placeholder="Current password"
                        className="w-full px-3 py-2 border border-phantom-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                      />
                      <input
                        type="password"
                        placeholder="New password"
                        className="w-full px-3 py-2 border border-phantom-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                      />
                      <input
                        type="password"
                        placeholder="Confirm new password"
                        className="w-full px-3 py-2 border border-phantom-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                      />
                      <button className="px-4 py-2 bg-violet-500 text-white text-sm font-medium rounded-lg hover:bg-violet-600 transition-colors">
                        Update Password
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'api' && (
              <div>
                <h2 className="text-lg font-semibold text-phantom-900 mb-6">API Keys</h2>
                <p className="text-phantom-500 mb-4">Manage your API keys for integrations</p>
                <div className="p-4 rounded-lg bg-phantom-50 border border-phantom-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-phantom-900">Production Key</p>
                      <p className="text-sm text-phantom-500 font-mono">sk-****************************1234</p>
                    </div>
                    <button className="text-sm text-violet-600 hover:text-violet-700">Regenerate</button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'billing' && (
              <div>
                <h2 className="text-lg font-semibold text-phantom-900 mb-6">Billing</h2>
                <div className="p-4 rounded-lg bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white mb-6">
                  <p className="text-sm opacity-80">Current Plan</p>
                  <p className="text-2xl font-bold">Professional</p>
                  <p className="text-sm opacity-80 mt-1">$49/month · Renews Jan 1, 2026</p>
                </div>
                <button className="px-4 py-2 border border-phantom-200 text-phantom-700 text-sm font-medium rounded-lg hover:bg-phantom-50 transition-colors">
                  Manage Subscription
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
