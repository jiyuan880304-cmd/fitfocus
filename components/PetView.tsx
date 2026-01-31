
import React, { useState, useMemo } from 'react';
import { UserProfile, DailyLog } from '../types';

interface PetViewProps {
  profile: UserProfile;
  todayLog: DailyLog;
  onUpdateProfile: (p: UserProfile) => void;
}

const SHOP_ITEMS = [
  { id: 'tuna', name: '特級點心', cost: 50, icon: '🍱', desc: '美味點心！', affectionBoost: 10 },
  { id: 'toy', name: '高級玩具', cost: 150, icon: '🧶', desc: '玩耍時光', affectionBoost: 25 },
  { id: 'bed', name: '豪華舒眠窩', cost: 500, icon: '🏠', desc: '好夢連連', affectionBoost: 60 },
  { id: 'snack', name: '營養補給品', cost: 80, icon: '🍭', desc: '甜甜的滋味', affectionBoost: 15 },
];

const PetView: React.FC<PetViewProps> = ({ profile, todayLog, onUpdateProfile }) => {
  const [isAction, setIsAction] = useState(false);
  const [bubbleText, setBubbleText] = useState("");

  const petConfig = useMemo(() => {
    switch (profile.petType) {
      case 'dog': return { suffix: '汪', idle: '🐶', love: '😍', eat: '😋' };
      case 'mouse': return { suffix: '吱', idle: '🐭', love: '🥰', eat: '😋' };
      default: return { suffix: '喵', idle: '🐱', love: '😻', eat: '😋' };
    }
  }, [profile.petType]);

  const catSpeech = useMemo(() => {
    const s = petConfig.suffix;
    if (profile.affection >= 90) return `我最喜歡你${s}！我們要一直在一起${s}～`;
    if (todayLog.waterIntake >= 2000) return `你今天喝好多水${s}！跟我一樣健康！`;
    if (todayLog.bowelMovements > 0) return `肚子空空的感覺很棒吧${s}～`;
    const calories = todayLog.meals.reduce((s, m) => s + m.calories, 0);
    if (calories > profile.dailyCalorieGoal) return `哎呀，今天吃得比我還多${s}...明天要加油！`;
    return `嗚～今天也要一起努力變瘦${s}！`;
  }, [todayLog, profile, petConfig]);

  const handleBuy = (item: typeof SHOP_ITEMS[0]) => {
    if (profile.tokens >= item.cost) {
      const newInventory = [...(profile.inventory || []), item.id];
      const newAffection = Math.min((profile.affection || 0) + item.affectionBoost, 100);
      onUpdateProfile({
        ...profile,
        tokens: profile.tokens - item.cost,
        affection: newAffection,
        inventory: newInventory
      });
      setBubbleText(`獲得了 ${item.name}${petConfig.suffix}！好感度 +${item.affectionBoost}！`);
      setIsAction(true);
      setTimeout(() => {
        setIsAction(false);
        setBubbleText("");
      }, 2000);
    } else {
      alert(`你的代幣不夠${petConfig.suffix}...快去喝水或紀錄飲食賺代幣吧！`);
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">夥伴「{profile.petName}」</h2>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">陪伴您健康每一天</p>
        </div>
      </header>

      {/* Affection Bar */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-pink-50">
        <div className="flex justify-between items-center mb-2">
           <div className="flex items-center gap-1">
             <span className="text-lg">❤️</span>
             <span className="text-xs font-bold text-pink-600 uppercase tracking-widest">好感度</span>
           </div>
           <span className="text-xs font-black text-pink-400">{profile.affection || 0}%</span>
        </div>
        <div className="w-full bg-pink-50 h-3 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-pink-400 to-rose-500 transition-all duration-1000"
            style={{ width: `${profile.affection || 0}%` }}
          />
        </div>
      </div>

      {/* Pet Environment */}
      <div className="relative aspect-square bg-gradient-to-b from-sky-50 to-amber-50 rounded-[40px] border-4 border-white shadow-inner flex items-center justify-center overflow-hidden">
        {profile.inventory?.includes('bed') && (
          <div className="absolute bottom-10 w-48 h-20 bg-white rounded-full opacity-60 blur-xl animate-pulse" />
        )}
        
        {/* Speech Bubble */}
        <div className="absolute top-10 left-10 right-10 bg-white p-4 rounded-3xl shadow-sm border border-slate-100 animate-bounce z-10 text-center">
          <p className="text-sm text-slate-700 font-medium">{bubbleText || catSpeech}</p>
          <div className="absolute -bottom-2 left-10 w-4 h-4 bg-white border-r border-b border-slate-100 transform rotate-45" />
        </div>

        {/* The Pet */}
        <div className={`relative transition-all duration-500 ${isAction ? 'scale-125 rotate-6' : 'scale-100 hover:scale-105'}`}>
          <div className="text-[120px] filter drop-shadow-xl select-none cursor-pointer">
            {isAction ? petConfig.eat : profile.affection >= 80 ? petConfig.love : petConfig.idle}
          </div>
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
             <div className="w-4 h-1 bg-amber-400 rounded-full" />
             <div className="w-4 h-1 bg-slate-100 rounded-full" />
          </div>
        </div>

        {isAction && (
          <div className="absolute top-1/2 right-10 text-4xl animate-bounce">
            ✨
          </div>
        )}
      </div>

      {/* Shop Section */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">餵食與互動</h3>
        <div className="grid grid-cols-2 gap-3">
          {SHOP_ITEMS.map(item => (
            <button
              key={item.id}
              onClick={() => handleBuy(item)}
              className="p-3 bg-slate-50 border border-slate-100 rounded-2xl flex flex-col items-center text-center gap-1 hover:bg-amber-50 hover:border-amber-200 transition-all active:scale-95"
            >
              <span className="text-3xl">{item.icon}</span>
              <span className="text-xs font-bold text-slate-700">{item.name}</span>
              <div className="flex items-center gap-1 mt-1">
                <span className="text-[10px] text-amber-600 font-black">💰 {item.cost}</span>
                <span className="text-[10px] text-pink-400 font-bold">❤️ +{item.affectionBoost}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PetView;
