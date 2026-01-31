
import React, { useState, useEffect } from 'react';
import { FastingSession } from '../types';

interface FastingTimerProps {
  fasting: FastingSession;
  onUpdateFasting: (f: FastingSession) => void;
}

const FastingTimer: React.FC<FastingTimerProps> = ({ fasting, onUpdateFasting }) => {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    let interval: any;
    if (fasting.isActive && fasting.startTime) {
      const update = () => {
        setElapsed(Math.floor((Date.now() - fasting.startTime!) / 1000));
      };
      update();
      interval = setInterval(update, 1000);
    } else {
      setElapsed(0);
    }
    return () => clearInterval(interval);
  }, [fasting.isActive, fasting.startTime]);

  const toggleFasting = () => {
    if (fasting.isActive) {
      onUpdateFasting({ ...fasting, isActive: false, startTime: null });
    } else {
      onUpdateFasting({ ...fasting, isActive: true, startTime: Date.now() });
    }
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const progress = Math.min((elapsed / (fasting.targetDuration * 3600)) * 100, 100);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-800">斷食計時器</h2>

      <div className="bg-white rounded-[40px] p-8 shadow-sm border border-slate-100 flex flex-col items-center">
        {/* Timer Circle */}
        <div className="relative w-64 h-64 mb-8">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="128"
              cy="128"
              r="110"
              stroke="currentColor"
              strokeWidth="12"
              fill="transparent"
              className="text-slate-100"
            />
            <circle
              cx="128"
              cy="128"
              r="110"
              stroke="currentColor"
              strokeWidth="12"
              fill="transparent"
              strokeDasharray={2 * Math.PI * 110}
              strokeDashoffset={2 * Math.PI * 110 * (1 - progress / 100)}
              className={`text-indigo-600 transition-all duration-500 ease-out`}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <p className="text-4xl font-black text-slate-800 font-mono tracking-tighter">
              {formatTime(elapsed)}
            </p>
            <p className="text-slate-400 text-sm mt-1">
              目標: {fasting.targetDuration} 小時
            </p>
          </div>
        </div>

        <div className="w-full space-y-4">
           <div className="flex justify-between items-center text-sm px-2">
              <span className="text-slate-500">當前模式</span>
              <span className="font-bold text-slate-800">{fasting.targetDuration}/{(24 - fasting.targetDuration)} 間歇性斷食</span>
           </div>

           <select 
             disabled={fasting.isActive}
             value={fasting.targetDuration}
             onChange={(e) => onUpdateFasting({...fasting, targetDuration: Number(e.target.value)})}
             className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700 font-medium"
           >
             <option value={12}>12:12 輕量模式</option>
             <option value={14}>14:10 進階模式</option>
             <option value={16}>16:8 經典模式</option>
             <option value={18}>18:6 強效模式</option>
             <option value={20}>20:4 武士模式</option>
           </select>

           <button
             onClick={toggleFasting}
             className={`w-full py-5 rounded-3xl font-bold text-lg shadow-xl transition-all active:scale-95 ${
               fasting.isActive 
               ? 'bg-slate-800 text-white shadow-slate-200' 
               : 'bg-indigo-600 text-white shadow-indigo-200'
             }`}
           >
             {fasting.isActive ? '結束斷食' : '開始斷食'}
           </button>
        </div>
      </div>

      <div className="bg-indigo-50 p-6 rounded-3xl border border-indigo-100">
         <h4 className="font-bold text-indigo-900 mb-2">💡 斷食小知識</h4>
         <p className="text-sm text-indigo-700 leading-relaxed">
           斷食期間可以喝水、黑咖啡或無糖茶。適度的斷食有助於啟動細胞自噬與穩定胰島素，建議從 16:8 開始循序漸進。
         </p>
      </div>
    </div>
  );
};

export default FastingTimer;
