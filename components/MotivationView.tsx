
import React, { useState, useRef, useEffect } from 'react';
import { UserProfile } from '../types';
import { getMotivationMessage, getQuickCheer } from '../services/geminiService';

interface MotivationViewProps {
  profile: UserProfile;
  onUpdate: (p: UserProfile) => void;
  onBack: () => void;
}

const MotivationView: React.FC<MotivationViewProps> = ({ profile, onUpdate, onBack }) => {
  const [advice, setAdvice] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [quickCheer, setQuickCheer] = useState<string | null>(null);
  const [cheerLoading, setCheerLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cheerTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (profile.motivationImage) {
      setLoading(true);
      getMotivationMessage(profile).then(msg => {
        setAdvice(msg);
        setLoading(false);
      });
    }
  }, [profile.motivationImage, profile.weight]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onUpdate({ ...profile, motivationImage: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageClick = async (e: React.MouseEvent) => {
    if (!profile.motivationImage) {
      fileInputRef.current?.click();
      return;
    }

    if (cheerTimeoutRef.current) {
      window.clearTimeout(cheerTimeoutRef.current);
    }

    setCheerLoading(true);
    setQuickCheer(null);
    
    const msg = await getQuickCheer(profile);
    setQuickCheer(msg);
    setCheerLoading(false);

    cheerTimeoutRef.current = window.setTimeout(() => {
      setQuickCheer(null);
    }, 4000);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950 overflow-y-auto animate-in fade-in duration-500">
      <div className="max-w-md mx-auto min-h-screen flex flex-col p-8 space-y-8 pb-32">
        <header className="flex items-center justify-between text-white">
          <button onClick={onBack} className="w-12 h-12 rounded-2xl bg-white/5 backdrop-blur-md flex items-center justify-center border border-white/10 active:scale-90 transition-all">
            <span className="text-xl">✕</span>
          </button>
          <div className="text-center">
            <h2 className="text-xl font-black tracking-tight">夢想藍圖</h2>
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-0.5">Vision Board</p>
          </div>
          <div className="w-12 h-12" />
        </header>

        {/* Dynamic Aspect Ratio Vision Card */}
        <div 
          className="relative w-full min-h-[300px] max-h-[60vh] bg-slate-900 rounded-[2.5rem] overflow-hidden border-4 border-slate-900 shadow-2xl group cursor-pointer active:scale-[0.98] transition-all ring-1 ring-white/10 flex items-center justify-center"
          onClick={handleImageClick}
        >
          {profile.motivationImage ? (
            <>
              {/* Blurred Background for empty spaces */}
              <div 
                className="absolute inset-0 bg-cover bg-center blur-2xl opacity-30 scale-110" 
                style={{ backgroundImage: `url(${profile.motivationImage})` }} 
              />
              
              {/* Main Image - Now using object-contain to show full photo */}
              <img 
                src={profile.motivationImage} 
                className="relative z-10 w-full h-full max-h-[60vh] object-contain" 
                alt="Goal" 
              />
              
              {/* Overlays */}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-slate-950/40 z-11 pointer-events-none" />
              
              {/* Quick Cheer Bubble */}
              {quickCheer && (
                <div className="absolute inset-x-6 top-1/2 -translate-y-1/2 z-30 animate-in zoom-in slide-in-from-bottom-8 duration-700">
                  <div className="bg-white p-6 rounded-[2rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] border border-white text-slate-900 text-center relative">
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-5xl">✨</div>
                    <p className="font-black text-lg leading-relaxed italic">「{quickCheer}」</p>
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white rotate-45" />
                  </div>
                </div>
              )}

              {cheerLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-40">
                   <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin" />
                </div>
              )}

              <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/40 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/10 text-[9px] text-white font-black uppercase tracking-widest opacity-60 z-20">
                點擊照片獲取力量
              </div>

              <button 
                onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                className="absolute bottom-6 right-6 w-12 h-12 bg-white/10 backdrop-blur-xl rounded-full flex items-center justify-center text-white border border-white/20 opacity-0 group-hover:opacity-100 transition-opacity z-20"
              >
                ✎
              </button>
            </>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-700 gap-6">
              <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center text-4xl">📸</div>
              <div className="text-center space-y-2">
                <p className="font-black text-white text-lg">上傳你的夢想模樣</p>
                <p className="text-xs text-slate-500">不限比例，完整展示您的目標</p>
              </div>
            </div>
          )}
        </div>

        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />

        {/* AI Philosophy Card */}
        <div className="bg-gradient-to-br from-indigo-500/10 to-blue-500/5 backdrop-blur-2xl rounded-[2.5rem] p-8 border border-white/10 shadow-2xl relative overflow-hidden">
          <div className="absolute -top-12 -right-12 text-9xl opacity-5 select-none rotate-45">💎</div>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-9 h-9 bg-indigo-500 rounded-xl flex items-center justify-center text-lg shadow-lg shadow-indigo-500/40">💬</div>
            <h3 className="text-white font-black tracking-tight text-sm uppercase tracking-widest">AI 靈魂對話</h3>
          </div>
          
          <div className="text-indigo-100/90 leading-relaxed text-lg font-medium italic">
            {profile.motivationImage ? (
              loading ? "正在凝視你的夢想..." : `「${advice}」`
            ) : (
              "「當你上傳了心中那個閃耀的模樣，我會為你寫下最動人的讚美與指引。」"
            )}
          </div>

          <div className="mt-8 pt-6 border-t border-white/10 flex justify-between items-center">
            <div className="space-y-0.5">
              <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest">目前</p>
              <p className="text-white text-xl font-black">{profile.weight} <span className="text-xs font-normal opacity-50">kg</span></p>
            </div>
            <div className="text-right space-y-0.5">
              <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest">目標</p>
              <p className="text-indigo-400 text-xl font-black">{profile.targetWeight} <span className="text-xs font-normal opacity-50">kg</span></p>
            </div>
          </div>
        </div>

        <div className="text-center py-4">
          <button 
            onClick={onBack}
            className="text-slate-600 text-[10px] font-black uppercase tracking-[0.3em] hover:text-white transition-colors"
          >
            返回旅程
          </button>
        </div>
      </div>
    </div>
  );
};

export default MotivationView;
