
import React, { useState } from 'react';
import { DailyLog, FoodItem } from '../types';
import { analyzeMeal } from '../services/geminiService';

interface FoodLogProps {
  todayLog: DailyLog;
  onUpdateLog: (log: DailyLog) => void;
}

const FoodLog: React.FC<FoodLogProps> = ({ todayLog, onUpdateLog }) => {
  const [description, setDescription] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAddMeal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    setIsAnalyzing(true);
    const result = await analyzeMeal(description);
    
    if (result) {
      const newMeal: FoodItem = {
        id: Date.now().toString(),
        name: result.name,
        calories: result.calories,
        protein: result.protein,
        carbs: result.carbs,
        fat: result.fat,
        timestamp: Date.now()
      };

      onUpdateLog({
        ...todayLog,
        meals: [...todayLog.meals, newMeal]
      });
      setDescription('');
    } else {
      alert("分析失敗，請稍後再試或換個說法。");
    }
    setIsAnalyzing(false);
  };

  const deleteMeal = (id: string) => {
    onUpdateLog({
      ...todayLog,
      meals: todayLog.meals.filter(m => m.id !== id)
    });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-800 mb-4">飲食紀錄</h2>
      
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
        <form onSubmit={handleAddMeal} className="space-y-4">
          <label className="block text-sm font-medium text-slate-600">
            告訴 AI 你吃了什麼？
            <span className="text-xs font-normal text-slate-400 block">例如：一碗牛肉麵加上一顆滷蛋</span>
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none text-black"
            rows={3}
            placeholder="輸入餐點內容..."
          />
          <button
            type="submit"
            disabled={isAnalyzing || !description.trim()}
            className="w-full bg-blue-600 text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-200 disabled:bg-slate-300 disabled:shadow-none transition-all flex items-center justify-center gap-2 active:scale-95"
          >
            {isAnalyzing ? (
              <>
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                AI 分析中...
              </>
            ) : (
              '✨ 計算卡路里'
            )}
          </button>
        </form>
      </div>

      <div className="space-y-4">
        <h3 className="font-bold text-slate-700 flex justify-between items-center px-1">
          今日餐點
          <span className="text-sm font-normal text-slate-400">{todayLog.meals.length} 筆</span>
        </h3>
        
        {todayLog.meals.length === 0 ? (
          <div className="text-center py-12 text-slate-400 italic">
            目前還沒有紀錄，快去吃點健康的吧！
          </div>
        ) : (
          todayLog.meals.map((meal) => (
            <div key={meal.id} className="bg-white p-5 rounded-3xl shadow-sm border border-slate-50 flex items-center gap-4 group">
              <div className="bg-orange-100 w-12 h-12 rounded-2xl flex items-center justify-center text-xl">
                🍲
              </div>
              <div className="flex-1">
                <div className="flex justify-between">
                  <h4 className="font-bold text-slate-800">{meal.name}</h4>
                  <p className="text-orange-600 font-black">{meal.calories} kcal</p>
                </div>
                <div className="flex gap-3 mt-1">
                   <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-bold">P: {meal.protein}g</span>
                   <span className="text-[10px] bg-green-50 text-green-600 px-2 py-0.5 rounded-full font-bold">C: {meal.carbs}g</span>
                   <span className="text-[10px] bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full font-bold">F: {meal.fat}g</span>
                </div>
              </div>
              <button 
                onClick={() => deleteMeal(meal.id)}
                className="text-slate-300 hover:text-red-500 transition-colors p-2"
              >
                ✕
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default FoodLog;
