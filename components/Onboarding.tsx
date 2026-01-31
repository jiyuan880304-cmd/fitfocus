
import React, { useState } from 'react';
import { UserProfile, PetType } from '../types';

interface OnboardingProps {
  onComplete: (profile: UserProfile) => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    gender: 'male' as const,
    height: 170,
    weight: 70,
    targetWeight: 65,
  });

  const [petData, setPetData] = useState({
    petType: 'cat' as PetType,
    petName: '',
  });

  const nextStep = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(2);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const baseCals = formData.gender === 'male' 
      ? (10 * formData.weight) + (6.25 * formData.height) - (5 * 30) + 5
      : (10 * formData.weight) + (6.25 * formData.height) - (5 * 30) - 161;
    
    onComplete({
      ...formData,
      ...petData,
      dailyCalorieGoal: Math.round(baseCals * 0.8),
      tokens: 100,
      affection: 10,
      inventory: [],
    });
  };

  if (step === 1) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 to-indigo-600 p-8 flex flex-col justify-center text-white">
        <h1 className="text-4xl font-bold mb-2">歡迎使用 FitFocus</h1>
        <p className="text-blue-100 mb-8 text-lg">讓我們開始您的減肥之旅，請填寫基本資料。</p>

        <form onSubmit={nextStep} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-1">姓名</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-white/20 border border-white/30 text-white placeholder-blue-200 outline-none focus:ring-2 focus:ring-white/50"
              placeholder="您的稱呼"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">性別</label>
              <select
                value={formData.gender}
                onChange={e => setFormData({ ...formData, gender: e.target.value as any })}
                className="w-full px-4 py-3 rounded-xl bg-white/20 border border-white/30 text-white outline-none"
              >
                <option value="male" className="text-slate-800">男性</option>
                <option value="female" className="text-slate-800">女性</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">身高 (cm)</label>
              <input
                type="number"
                value={formData.height}
                onChange={e => setFormData({ ...formData, height: Number(e.target.value) })}
                className="w-full px-4 py-3 rounded-xl bg-white/20 border border-white/30 text-white outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">目前體重 (kg)</label>
              <input
                type="number"
                step="0.1"
                value={formData.weight}
                onChange={e => setFormData({ ...formData, weight: Number(e.target.value) })}
                className="w-full px-4 py-3 rounded-xl bg-white/20 border border-white/30 text-white outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">目標體重 (kg)</label>
              <input
                type="number"
                step="0.1"
                value={formData.targetWeight}
                onChange={e => setFormData({ ...formData, targetWeight: Number(e.target.value) })}
                className="w-full px-4 py-3 rounded-xl bg-white/20 border border-white/30 text-white outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-white text-indigo-600 font-bold py-4 rounded-xl shadow-lg hover:bg-blue-50 transition-colors active:scale-95"
          >
            下一步：選擇夥伴
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-400 to-orange-600 p-8 flex flex-col justify-center text-white">
      <h1 className="text-4xl font-bold mb-2">選擇您的夥伴</h1>
      <p className="text-amber-100 mb-8 text-lg">在減肥的路上，選一隻可愛的小動物陪您吧！</p>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-3 gap-4">
          {[
            { type: 'cat', icon: '🐱', label: '貓咪' },
            { type: 'dog', icon: '🐶', label: '狗狗' },
            { type: 'mouse', icon: '🐭', label: '老鼠' },
          ].map((pet) => (
            <button
              key={pet.type}
              type="button"
              onClick={() => setPetData({ ...petData, petType: pet.type as PetType })}
              className={`p-4 rounded-3xl flex flex-col items-center gap-2 border-2 transition-all ${
                petData.petType === pet.type 
                  ? 'bg-white text-orange-600 border-white scale-110 shadow-xl' 
                  : 'bg-white/20 border-white/30 text-white hover:bg-white/30'
              }`}
            >
              <span className="text-4xl">{pet.icon}</span>
              <span className="text-xs font-bold">{pet.label}</span>
            </button>
          ))}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-center">給牠取個名字吧</label>
          <input
            type="text"
            required
            value={petData.petName}
            onChange={e => setPetData({ ...petData, petName: e.target.value })}
            className="w-full px-4 py-4 rounded-xl bg-white/20 border border-white/30 text-white placeholder-amber-200 outline-none focus:ring-2 focus:ring-white/50 text-center text-xl font-bold"
            placeholder="例如：肉丸、橘子..."
          />
        </div>

        <div className="flex flex-col gap-3">
          <button
            type="submit"
            disabled={!petData.petName}
            className="w-full bg-white text-orange-600 font-bold py-4 rounded-xl shadow-lg hover:bg-amber-50 transition-colors active:scale-95 disabled:opacity-50"
          >
            完成設定，開啟旅程
          </button>
          <button
            type="button"
            onClick={() => setStep(1)}
            className="w-full bg-transparent text-white/70 font-bold py-2 text-sm"
          >
            返回修改個人資料
          </button>
        </div>
      </form>
    </div>
  );
};

export default Onboarding;
