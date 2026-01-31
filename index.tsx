
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { User, UserProfile, DailyLog, FastingSession, AppData } from './types';
import { cloudService } from './services/cloudService';
import Layout from './components/Layout';
import Onboarding from './components/Onboarding';
import Dashboard from './components/Dashboard';
import FoodLog from './components/FoodLog';
import FastingTimer from './components/FastingTimer';
import UserProfileView from './components/UserProfileView';
import Auth from './components/Auth';
import PetView from './components/PetView';
import DailySummary from './components/DailySummary';
import MotivationView from './components/MotivationView';

const SESSION_KEY = 'fitfocus_session';
const getTodayKey = () => new Date().toISOString().split('T')[0];

const INITIAL_DATA: AppData = {
  profile: null,
  logs: {},
  fasting: { startTime: null, targetDuration: 16, isActive: false },
};

const App = () => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = sessionStorage.getItem(SESSION_KEY);
    return saved ? JSON.parse(saved) : null;
  });

  const [data, setData] = useState<AppData>(INITIAL_DATA);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSyncing, setIsSyncing] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [showMotivation, setShowMotivation] = useState(false);
  
  const isFirstLoad = useRef(true);

  const handleLogin = (newUser: User) => {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(newUser));
    setUser(newUser);
  };

  const handleLogout = () => {
    sessionStorage.removeItem(SESSION_KEY);
    setUser(null);
    setData(INITIAL_DATA);
    isFirstLoad.current = true;
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    try {
      await cloudService.deleteAccount(user.id);
      handleLogout();
    } catch (e) {
      alert("註銷失敗，請檢查網路連線後再試一次。");
      throw e;
    }
  };

  useEffect(() => {
    if (user) {
      setIsInitialLoading(true);
      cloudService.fetchData(user.id).then(cloudData => {
        if (cloudData) {
          // 確保過往數據包含 steps 欄位防止 undefined
          const sanitizedLogs = { ...cloudData.logs };
          Object.keys(sanitizedLogs).forEach(date => {
            if (sanitizedLogs[date].steps === undefined) {
              sanitizedLogs[date].steps = 0;
            }
          });
          setData({ ...cloudData, logs: sanitizedLogs });
        }
        setIsInitialLoading(false);
        setTimeout(() => { isFirstLoad.current = false; }, 500);
      });
    }
  }, [user]);

  const updateData = (updater: (prev: AppData) => AppData) => {
    setData(prev => {
      const next = updater(prev);
      const today = getTodayKey();
      
      let tokenBonus = 0;
      let affectionBonus = 0;
      const prevLog = prev.logs[today];
      const nextLog = next.logs[today];

      if (prevLog && nextLog) {
        if (nextLog.waterIntake > prevLog.waterIntake) {
          const increments = Math.floor(nextLog.waterIntake / 250) - Math.floor(prevLog.waterIntake / 250);
          if (increments > 0) {
            tokenBonus += increments * 20;
            affectionBonus += increments * 5;
          }
        }
        if (nextLog.steps > prevLog.steps) {
          const increments = Math.floor(nextLog.steps / 1000) - Math.floor(prevLog.steps / 1000);
          if (increments > 0) {
            tokenBonus += increments * 50; // 每 1000 步獎勵 50 金幣
            affectionBonus += increments * 2;
          }
        }
        if (nextLog.bowelMovements > prevLog.bowelMovements) {
          const count = nextLog.bowelMovements - prevLog.bowelMovements;
          tokenBonus += count * 30;
          affectionBonus += count * 3;
        }
      }

      if ((tokenBonus > 0 || affectionBonus > 0) && next.profile) {
        next.profile = {
          ...next.profile,
          tokens: (next.profile.tokens || 0) + tokenBonus,
          affection: Math.min((next.profile.affection || 0) + affectionBonus, 100)
        };
      }

      if (user && !isFirstLoad.current) {
        setIsSyncing(true);
        cloudService.saveData(user.id, next).finally(() => setIsSyncing(false));
      }
      return next;
    });
  };

  if (!user) {
    return <Auth onLogin={handleLogin} />;
  }

  if (isInitialLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
        <p className="text-slate-400 text-sm animate-pulse">正在從雲端下載您的健康紀錄...</p>
      </div>
    );
  }

  if (!data.profile) {
    return (
      <Onboarding 
        onComplete={(profile) => updateData(p => {
          const today = getTodayKey();
          return { 
            ...p, 
            profile,
            logs: {
              ...p.logs,
              [today]: {
                date: today,
                meals: [],
                waterIntake: 0,
                bowelMovements: 0,
                weight: profile.weight,
                steps: 0
              }
            }
          };
        })} 
      />
    );
  }

  const todayKey = getTodayKey();
  const todayLog = data.logs[todayKey] || {
    date: todayKey,
    meals: [],
    waterIntake: 0,
    bowelMovements: 0,
    steps: 0,
    weight: data.profile.weight
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard 
            profile={data.profile!} 
            todayLog={todayLog} 
            allLogs={data.logs}
            onUpdateLog={(newLog) => updateData(prev => ({
              ...prev,
              logs: { ...prev.logs, [todayKey]: newLog }
            }))} 
            onUpdateProfile={(newProfile) => updateData(prev => ({
              ...prev,
              profile: newProfile
            }))}
            onOpenMotivation={() => setShowMotivation(true)}
          />
        );
      case 'food':
        return (
          <FoodLog 
            todayLog={todayLog} 
            onUpdateLog={(newLog) => updateData(prev => ({
              ...prev,
              logs: { ...prev.logs, [todayKey]: newLog }
            }))} 
          />
        );
      case 'pet':
        return (
          <PetView 
            profile={data.profile!}
            todayLog={todayLog}
            onUpdateProfile={(newProfile) => updateData(prev => ({
              ...prev,
              profile: newProfile
            }))}
          />
        );
      case 'summary':
        return (
          <DailySummary 
            profile={data.profile!}
            todayLog={todayLog}
            fasting={data.fasting}
          />
        );
      case 'fasting':
        return (
          <FastingTimer 
            fasting={data.fasting} 
            onUpdateFasting={(f) => updateData(prev => ({ ...prev, fasting: f }))} 
          />
        );
      case 'profile':
        return (
          <UserProfileView 
            profile={data.profile!} 
            onUpdate={(p) => updateData(prev => ({ ...prev, profile: p }))} 
            onLogout={handleLogout}
            onDeleteAccount={handleDeleteAccount}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab} profile={data.profile}>
      {isSyncing && (
        <div className="fixed top-4 right-16 z-[100] bg-white shadow-lg rounded-full px-4 py-2 border border-blue-100 flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <span className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></span>
          <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">雲端同步中...</span>
        </div>
      )}
      
      {showMotivation && (
        <MotivationView 
          profile={data.profile!} 
          onUpdate={(p) => updateData(prev => ({ ...prev, profile: p }))}
          onBack={() => setShowMotivation(false)} 
        />
      )}

      {renderContent()}
    </Layout>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);
