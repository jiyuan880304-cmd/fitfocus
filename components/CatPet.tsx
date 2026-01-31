
import React, { useState, useMemo } from 'react';
import { UserProfile, DailyLog } from '../types';

interface CatPetProps {
  profile: UserProfile;
  todayLog: DailyLog;
  onUpdateProfile: (p: UserProfile) => void;
}

const SHOP_ITEMS = [
  { id: 'tuna', name: '特級鮪魚罐頭', cost: 50, icon: '🥫', desc: '貓咪最愛！', affectionBoost: 10 },
  { id: 'toy', name: '頂級羽毛逗貓棒', cost: 150, icon: '🪄', desc: '增加貓咪運動量', affectionBoost: 25 },
  { id: 'bed', name: '豪華雲朵貓窩', cost: 500, icon: '☁️', desc: '讓貓咪睡個好覺', affectionBoost: 60 },
  { id: 'shrimp', name: '鮮甜大蝦乾', cost: 80, icon: '🦐', desc: '脆脆的口感', affectionBoost: 15 },
];

const CatPet: React.FC<CatPetProps> = ({ profile, todayLog, onUpdateProfile }) => {
  const [isFeeding, setIsFeeding] = useState(false);
  const [bubbleText, setBubbleText] = useState("");

  const catSpeech = useMemo(() => {
    if (profile.affection >= 90) return "我最喜歡你喵！我們要一直在一起喵～";
    if (todayLog.waterIntake >= 2000) return "你今天喝好多水喵！跟我一樣健康！";
    if (todayLog.bowelMovements > 0) return "肚子空空的感覺很棒吧喵～";
    const calories = todayLog.meals.reduce((s, m) => s + m.calories, 0);
    if (calories > profile.dailyCalorieGoal) return "哎呀，今天吃得比我還多喵...明天要加油！";
    return "喵嗚～今天也要一起努力變瘦喵！";
  }, [todayLog, profile]);

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
      setBubbleText(`獲得了 ${item.name} 喵！好感度 +${item.affectionBoost}！`);
      setIsFeeding(true);
      setTimeout(() => {
        setIsFeeding(false);
        setBubbleText("");
      }, 2000);
    } else {
      alert("你的代幣不夠喵...快去喝水或紀錄飲食賺代幣吧！");
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">電子小貓「橘子」</h2>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">陪你一起達成目標</p>
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

      {/* Cat Environment */}
      <div className="relative aspect-square bg-gradient-to-b from-sky-50 to-amber-50 rounded-[40px] border-4 border-white shadow-inner flex items-center justify-center overflow-hidden">
        {profile.inventory?.includes('bed') && (
          <div className="absolute bottom-10 w-48 h-20 bg-white rounded-full opacity-60 blur-xl animate-pulse" />
        )}
        
        {/* Speech Bubble */}
        <div className="absolute top-10 left-10 right-10 bg-white p-4 rounded-3xl shadow-sm border border-slate-100 animate-bounce z-10">
          <p className="text-sm text-slate-700 font-medium">{bubbleText || catSpeech}</p>
          <div className="absolute -bottom-2 left-10 w-4 h-4 bg-white border-r border-b border-slate-100 transform rotate-45" />
        </div>

        {/* The Cat */}
        <div className={`relative transition-all duration-500 ${isFeeding ? 'scale-125 rotate-6' : 'scale-100 hover:scale-105'}`}>
          <div className="text-[120px] filter drop-shadow-xl select-none cursor-pointer">
            {isFeeding ? '😋' : profile.affection >= 80 ? '😻' : '🐱'}
          </div>
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
             <div className="w-4 h-1 bg-amber-400 rounded-full" />
             <div className="w-4 h-1 bg-slate-100 rounded-full" />
          </div>
        </div>

        {isFeeding && (
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

      <div className="bg-amber-50 p-5 rounded-3xl border border-amber-100">
         <h4 className="font-bold text-amber-900 mb-2">🐾 賺取金幣秘籍</h4>
         <ul className="text-xs text-amber-700 space-y-1 opacity-80">
           <li>• 每次紀錄飲水 250ml ➜ <span className="font-bold text-amber-600">+20 💰</span> / <span className="text-pink-400">+5 ❤️</span></li>
           <li>• 每次紀錄排便一次 ➜ <span className="font-bold text-amber-600">+30 💰</span> / <span className="text-pink-400">+3 ❤️</span></li>
           <li>• 每次紀錄一餐紀錄 ➜ <span className="font-bold text-amber-600">+5 💰</span> / <span className="text-pink-400">+2 ❤️</span></li>
         </ul>
      </div>
    </div>
  );
};

export default CatPet;
