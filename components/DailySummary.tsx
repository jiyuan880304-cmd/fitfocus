
import React, { useMemo } from 'react';
import { UserProfile, DailyLog, FastingSession } from '../types';

interface DailySummaryProps {
  profile: UserProfile;
  todayLog: DailyLog;
  fasting: FastingSession;
}

const DailySummary: React.FC<DailySummaryProps> = ({ profile, todayLog, fasting }) => {
  const todayDate = new Date().toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  });

  const consumedCalories = todayLog.meals.reduce((sum, meal) => sum + meal.calories, 0);
  const totalMacros = todayLog.meals.reduce((acc, m) => ({
    p: acc.p + m.protein,
    c: acc.c + m.carbs,
    f: acc.f + m.fat
  }), { p: 0, c: 0, f: 0 });

  const bmi = useMemo(() => {
    const hMeter = profile.height / 100;
    return (profile.weight / (hMeter * hMeter)).toFixed(1);
  }, [profile.weight, profile.height]);

  return (
    <div className="space-y-6 pb-8">
      <header className="text-center py-4">
        <h2 className="text-2xl font-black text-slate-800 tracking-tight">每日健康快照</h2>
        <p className="text-slate-400 text-sm font-medium">{todayDate}</p>
      </header>

      {/* Report Card */}
      <div id="report-card" className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200 overflow-hidden border border-slate-100">
        <div className="bg-gradient-to-br from-indigo-600 to-blue-700 p-8 text-white relative">
          <div className="absolute top-0 right-0 p-8 opacity-10 text-8xl">📊</div>
          <div className="flex justify-between items-center relative z-10">
            <div>
              <p className="text-indigo-100 text-xs font-bold uppercase tracking-widest opacity-80 mb-1">FitFocus 雲端報告</p>
              <h3 className="text-3xl font-black">{profile.name}</h3>
            </div>
            <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-2xl text-center">
              <p className="text-[10px] font-bold uppercase tracking-tighter opacity-70">今日體重</p>
              <p className="text-xl font-black">{todayLog.weight || profile.weight} <span className="text-xs font-normal">kg</span></p>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-4 relative z-10">
            <div className="bg-black/10 rounded-2xl p-3 border border-white/10 text-center">
              <p className="text-[10px] font-bold opacity-60 uppercase">今日步數</p>
              <p className="text-lg font-black">{todayLog.steps || 0} 步</p>
            </div>
            <div className="bg-black/10 rounded-2xl p-3 border border-white/10 text-center">
              <p className="text-[10px] font-bold opacity-60 uppercase">BMI 指數</p>
              <p className="text-lg font-black">{bmi}</p>
            </div>
          </div>
        </div>

        <div className="p-8 space-y-8">
          <section>
            <div className="flex justify-between items-end mb-4">
              <h4 className="text-slate-800 font-black text-lg">熱量攝取分析</h4>
              <span className={`text-sm font-bold ${consumedCalories > profile.dailyCalorieGoal ? 'text-red-500' : 'text-blue-600'}`}>
                {consumedCalories} / {profile.dailyCalorieGoal} kcal
              </span>
            </div>
            
            <div className="w-full bg-slate-100 h-4 rounded-full overflow-hidden mb-6">
              <div 
                className={`h-full transition-all duration-1000 ${consumedCalories > profile.dailyCalorieGoal ? 'bg-red-500' : 'bg-blue-600'}`}
                style={{ width: `${Math.min((consumedCalories / profile.dailyCalorieGoal) * 100, 100)}%` }}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="bg-blue-50 text-blue-600 w-10 h-10 rounded-xl flex items-center justify-center font-black mx-auto mb-2 text-xs">P</div>
                <p className="text-sm font-black text-slate-700">{totalMacros.p}g</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase">蛋白質</p>
              </div>
              <div className="text-center border-x border-slate-100">
                <div className="bg-green-50 text-green-600 w-10 h-10 rounded-xl flex items-center justify-center font-black mx-auto mb-2 text-xs">C</div>
                <p className="text-sm font-black text-slate-700">{totalMacros.c}g</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase">碳水</p>
              </div>
              <div className="text-center">
                <div className="bg-amber-50 text-amber-600 w-10 h-10 rounded-xl flex items-center justify-center font-black mx-auto mb-2 text-xs">F</div>
                <p className="text-sm font-black text-slate-700">{totalMacros.f}g</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase">脂肪</p>
              </div>
            </div>
          </section>

          <div className="grid grid-cols-2 gap-6 border-t border-slate-50 pt-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-sky-50 rounded-2xl flex items-center justify-center text-2xl shadow-sm">💧</div>
              <div>
                <p className="text-lg font-black text-slate-800">{todayLog.waterIntake} <span className="text-[10px] text-slate-400">ml</span></p>
                <p className="text-[10px] font-bold text-sky-600 uppercase">飲水量</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-2xl shadow-sm">👟</div>
              <div>
                <p className="text-lg font-black text-slate-800">{todayLog.steps || 0}</p>
                <p className="text-[10px] font-bold text-indigo-600 uppercase">今日步數</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-slate-800 p-4 text-center">
           <p className="text-slate-500 text-[10px] font-black tracking-widest uppercase">已從雲端同步過往數據</p>
        </div>
      </div>
    </div>
  );
};

export default DailySummary;
