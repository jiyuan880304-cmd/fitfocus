
import React, { useEffect, useState, useMemo } from 'react';
import { UserProfile, DailyLog } from '../types';
import { getWeightLossAdvice } from '../services/geminiService';

interface DashboardProps {
  profile: UserProfile;
  todayLog: DailyLog;
  allLogs: Record<string, DailyLog>;
  onUpdateLog: (log: DailyLog) => void;
  onUpdateProfile: (profile: UserProfile) => void;
  onOpenMotivation?: () => void;
}

const WeightTrendChart: React.FC<{ logs: Record<string, DailyLog>, initialWeight: number }> = ({ logs, initialWeight }) => {
  const chartData = useMemo(() => {
    const dates = Object.keys(logs).sort();
    const data = dates
      .map(date => ({ date, weight: logs[date].weight }))
      .filter(d => d.weight !== undefined) as { date: string, weight: number }[];
    
    if (data.length === 0) return [{ date: '開始', weight: initialWeight }];
    if (data.length === 1) return [{ date: '開始', weight: initialWeight }, ...data];
    return data.slice(-7); 
  }, [logs, initialWeight]);

  if (chartData.length < 2) {
    return (
      <div className="h-32 flex flex-col items-center justify-center text-slate-300 text-xs italic bg-slate-50/50 rounded-2xl mt-4 border border-dashed border-slate-200">
        <span>📈 累積 2 天數據後</span>
        <span>將為您生成美麗的曲線圖</span>
      </div>
    );
  }

  const minW = Math.min(...chartData.map(d => d.weight)) - 0.5;
  const maxW = Math.max(...chartData.map(d => d.weight)) + 0.5;
  const range = maxW - minW || 1;
  
  const width = 300;
  const height = 100;
  const padding = 20;

  const points = chartData.map((d, i) => ({
    x: (i / (chartData.length - 1)) * (width - padding * 2) + padding,
    y: height - ((d.weight - minW) / range) * (height - padding * 2) - padding
  }));

  let pathD = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const curr = points[i];
    const next = points[i + 1];
    const cp1x = curr.x + (next.x - curr.x) / 2;
    pathD += ` C ${cp1x} ${curr.y}, ${cp1x} ${next.y}, ${next.x} ${next.y}`;
  }

  return (
    <div className="w-full mt-6 bg-slate-50/50 p-4 rounded-3xl border border-slate-100">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full overflow-visible">
        <path d={pathD} fill="none" stroke="#3b82f6" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="drop-shadow-lg" />
        {points.map((p, i) => (
          <g key={i} className="hover:scale-110 transition-transform">
            <circle cx={p.x} cy={p.y} r="5" fill="white" stroke="#3b82f6" strokeWidth="3" />
            <text x={p.x} y={p.y - 12} fontSize="10" textAnchor="middle" className="fill-blue-600 font-black">
              {chartData[i].weight}
            </text>
          </g>
        ))}
      </svg>
      <div className="flex justify-between mt-3 px-1">
        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{chartData[0].date.split('-').slice(1).join('/')}</span>
        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{chartData[chartData.length-1].date.split('-').slice(1).join('/')}</span>
      </div>
    </div>
  );
};

const Dashboard: React.FC<DashboardProps> = ({ profile, todayLog, allLogs, onUpdateLog, onUpdateProfile, onOpenMotivation }) => {
  const [advice, setAdvice] = useState<string>("正在思考如何讓您更好...");
  const [loadingAdvice, setLoadingAdvice] = useState(false);
  const [isEditingWeight, setIsEditingWeight] = useState(false);
  const [isEditingSteps, setIsEditingSteps] = useState(false);
  const [newWeight, setNewWeight] = useState(todayLog.weight?.toString() || profile.weight.toString());
  const [newSteps, setNewSteps] = useState(todayLog.steps?.toString() || "0");

  const consumedCalories = todayLog.meals.reduce((sum, meal) => sum + meal.calories, 0);
  const calorieProgress = Math.min((consumedCalories / profile.dailyCalorieGoal) * 100, 100);
  const waterGoal = Math.round(profile.weight * 33);
  const waterProgress = Math.min((todayLog.waterIntake / waterGoal) * 100, 100);
  const stepGoal = 10000;
  const stepProgress = Math.min(((todayLog.steps || 0) / stepGoal) * 100, 100);

  const reminders = useMemo(() => {
    const hour = new Date().getHours();
    if (waterProgress < 30) return { icon: '💧', text: '身體渴了！記得補水' };
    if ((todayLog.steps || 0) < 3000 && hour > 14) return { icon: '👟', text: '起來走走，目標 1 萬步！' };
    if (hour >= 21) return { icon: '🌙', text: '深夜時分，保持空腹' };
    return { icon: '✨', text: '你今天表現得很棒！' };
  }, [waterProgress, todayLog.steps]);

  useEffect(() => {
    const fetchAdvice = async () => {
      setLoadingAdvice(true);
      const res = await getWeightLossAdvice(profile, todayLog);
      setAdvice(res || "堅持就是勝利！");
      setLoadingAdvice(false);
    };
    fetchAdvice();
  }, [profile, todayLog.meals.length, todayLog.waterIntake, todayLog.weight, todayLog.steps]);

  const handleWeightSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const w = parseFloat(newWeight);
    if (!isNaN(w)) {
      onUpdateLog({ ...todayLog, weight: w });
      onUpdateProfile({ ...profile, weight: w });
      setIsEditingWeight(false);
    }
  };

  const handleStepsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const s = parseInt(newSteps);
    if (!isNaN(s)) {
      onUpdateLog({ ...todayLog, steps: s });
      setIsEditingSteps(false);
    }
  };

  const renderAvatar = () => {
    if (profile.avatar && profile.avatar.startsWith('data:image')) {
      return <img src={profile.avatar} alt="Avatar" className="w-full h-full object-cover rounded-full" />;
    }
    return <span>{profile.avatar || (profile.gender === 'male' ? '🤵' : '👩')}</span>;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <header className="flex justify-between items-center py-4 px-1">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">你好, {profile.name} 👋</h2>
          <p className="text-blue-500 text-sm font-bold mt-1 tracking-wide">雲端同步已開啟</p>
        </div>
        <button 
          onClick={onOpenMotivation}
          className="bg-white p-1 rounded-full w-14 h-14 flex items-center justify-center text-3xl overflow-hidden shadow-xl shadow-blue-100 hover:scale-110 active:scale-95 transition-all border-2 border-white"
        >
           {renderAvatar()}
        </button>
      </header>

      {/* Dynamic Reminder Card */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2.5rem] p-6 text-white shadow-2xl shadow-blue-200 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-10 text-7xl group-hover:scale-110 transition-transform">💡</div>
        <div className="flex items-center gap-3 mb-2">
          <span className="bg-white/20 p-2 rounded-xl text-xl">{reminders.icon}</span>
          <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">貼心提醒</span>
        </div>
        <p className="text-xl font-bold">{reminders.text}</p>
      </div>

      {/* Steps Tracking - New Section */}
      <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 relative overflow-hidden group">
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">今日步數</p>
            <h3 className="text-4xl font-black text-slate-800 tracking-tighter">
              {todayLog.steps || 0} <span className="text-sm text-slate-400 font-bold">/ 10,000</span>
            </h3>
          </div>
          <button 
            onClick={() => setIsEditingSteps(!isEditingSteps)}
            className="w-10 h-10 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 active:scale-90 transition-transform"
          >
            👟
          </button>
        </div>
        
        {isEditingSteps && (
          <form onSubmit={handleStepsSubmit} className="flex gap-2 mb-4 animate-in slide-in-from-top-2 duration-300">
            <input 
              type="number"
              autoFocus
              className="flex-1 px-4 py-2 bg-slate-50 border border-indigo-200 rounded-xl text-sm font-bold outline-none"
              value={newSteps}
              onChange={e => setNewSteps(e.target.value)}
              placeholder="輸入今日總步數"
            />
            <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-xl font-bold">✓</button>
          </form>
        )}

        <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
          <div className="h-full bg-indigo-500 transition-all duration-1000 ease-out" style={{ width: `${stepProgress}%` }} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-slate-100 flex flex-col justify-between">
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-4">熱量攝取</p>
          <div>
            <h3 className="text-2xl font-black text-slate-800">{consumedCalories}</h3>
            <p className="text-[10px] text-slate-400">kcal / {profile.dailyCalorieGoal}</p>
          </div>
          <div className="mt-4 w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div className={`h-full ${consumedCalories > profile.dailyCalorieGoal ? 'bg-red-500' : 'bg-blue-600'}`} style={{ width: `${calorieProgress}%` }} />
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-slate-100 flex flex-col justify-between">
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-4">目標進度</p>
          <div>
            <h3 className="text-2xl font-black text-slate-800">{profile.weight} <span className="text-xs text-slate-400">kg</span></h3>
            <p className="text-[10px] text-blue-500 font-bold">目標 {profile.targetWeight} kg</p>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <span className="text-[10px] font-black text-slate-400 uppercase">BMI { (profile.weight / Math.pow(profile.height/100, 2)).toFixed(1) }</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-sky-50/80 backdrop-blur-sm rounded-[2.5rem] p-6 border border-sky-100 group">
          <div className="flex justify-between items-start mb-4">
            <span className="text-3xl group-hover:scale-110 transition-transform">💧</span>
            <button 
              onClick={() => onUpdateLog({ ...todayLog, waterIntake: todayLog.waterIntake + 250 })}
              className="bg-white w-10 h-10 rounded-2xl shadow-lg shadow-sky-200/50 flex items-center justify-center text-sky-600 font-black active:scale-90"
            >
              +
            </button>
          </div>
          <p className="text-sky-900 font-black text-2xl mb-1">{todayLog.waterIntake} <span className="text-xs font-bold opacity-60">ml</span></p>
          <div className="w-full bg-sky-200/40 h-1.5 rounded-full overflow-hidden">
             <div className="h-full bg-sky-500 transition-all duration-700" style={{ width: `${waterProgress}%` }} />
          </div>
        </div>

        <div className="bg-amber-50/80 backdrop-blur-sm rounded-[2.5rem] p-6 border border-amber-100 group">
          <div className="flex justify-between items-start mb-4">
            <span className="text-3xl group-hover:scale-110 transition-transform">🍑</span>
            <button 
              onClick={() => onUpdateLog({ ...todayLog, bowelMovements: todayLog.bowelMovements + 1 })}
              className="bg-white w-10 h-10 rounded-2xl shadow-lg shadow-amber-200/50 flex items-center justify-center text-amber-600 font-black active:scale-90"
            >
              +
            </button>
          </div>
          <p className="text-amber-900 font-black text-2xl mb-1">{todayLog.bowelMovements} <span className="text-xs font-bold opacity-60">次</span></p>
          <p className="text-[10px] font-black text-amber-600/60 uppercase tracking-widest">排便紀錄</p>
        </div>
      </div>

      {/* AI Assistant */}
      <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 text-6xl opacity-5 select-none rotate-12">🤖</div>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-indigo-100 rounded-2xl flex items-center justify-center text-xl">✨</div>
          <h4 className="font-black text-slate-800">AI 智能分析</h4>
        </div>
        <p className="text-slate-600 leading-relaxed font-medium italic">
          「{loadingAdvice ? "正在分析雲端數據..." : advice}」
        </p>
      </div>

      <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100">
        <div className="flex justify-between items-center mb-2">
          <h4 className="font-black text-slate-800 uppercase tracking-widest text-xs">體重趨勢分析</h4>
          <button 
            onClick={() => setIsEditingWeight(true)}
            className="text-[10px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-3 py-1.5 rounded-full"
          >
            更新體重
          </button>
        </div>
        
        {isEditingWeight && (
          <form onSubmit={handleWeightSubmit} className="flex gap-2 mb-4 animate-in slide-in-from-top-2 duration-300">
            <input 
              type="number"
              step="0.1"
              autoFocus
              className="flex-1 px-4 py-2 bg-slate-50 border border-blue-200 rounded-xl text-sm font-bold outline-none"
              value={newWeight}
              onChange={e => setNewWeight(e.target.value)}
            />
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-xl font-bold">✓</button>
            <button type="button" onClick={() => setIsEditingWeight(false)} className="bg-slate-200 text-slate-500 px-4 py-2 rounded-xl font-bold">✕</button>
          </form>
        )}

        <WeightTrendChart logs={allLogs} initialWeight={profile.weight} />
      </div>
    </div>
  );
};

export default Dashboard;
