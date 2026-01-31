
import React from 'react';
import { UserProfile } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
  profile?: UserProfile | null;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, onTabChange, profile }) => {
  const tabs = [
    { id: 'dashboard', icon: '🏠', label: '主頁' },
    { id: 'food', icon: '🥗', label: '飲食' },
    { id: 'pet', icon: '🐾', label: '寵物' },
    { id: 'fasting', icon: '⏱️', label: '斷食' },
    { id: 'summary', icon: '📋', label: '總結' }, // 移動到這裡：個人的左邊
    { id: 'profile', icon: '👤', label: '個人' },
  ];

  return (
    <div className="flex flex-col min-h-screen pb-24 max-w-md mx-auto bg-slate-50 shadow-xl overflow-x-hidden relative">
      {/* Top Floating Token Display */}
      {profile && (
        <div className="absolute top-4 right-4 z-[60] animate-in fade-in slide-in-from-right-4">
          <div className="bg-white/80 backdrop-blur-md px-3 py-1.5 rounded-full shadow-lg border border-amber-100 flex items-center gap-1.5">
            <span className="text-sm">💰</span>
            <span className="text-sm font-black text-amber-600">{profile.tokens}</span>
          </div>
        </div>
      )}

      <main className="flex-1 p-4 pt-12">
        {children}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/90 backdrop-blur-lg border-t border-slate-200 px-4 py-3 flex justify-between items-center z-50">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex flex-col items-center gap-1 transition-all ${
              activeTab === tab.id ? 'text-blue-600 scale-110' : 'text-slate-400'
            }`}
          >
            <span className="text-2xl">{tab.icon}</span>
            <span className="text-[10px] font-bold">{tab.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default Layout;
