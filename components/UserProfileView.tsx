
import React, { useState, useRef } from 'react';
import { UserProfile } from '../types';

interface UserProfileViewProps {
  profile: UserProfile;
  onUpdate: (p: UserProfile) => void;
  onLogout: () => void;
  onDeleteAccount: () => Promise<void>; // 更改為回傳 Promise
}

const EMOJI_OPTIONS = ['🤵', '👩', '🦁', '🥑', '🥦', '🏃‍♂️', '💪', '🥗'];

const UserProfileView: React.FC<UserProfileViewProps> = ({ profile, onUpdate, onLogout, onDeleteAccount }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState(profile);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = () => {
    onUpdate(editForm);
    setIsEditing(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        onUpdate({ ...profile, avatar: base64 });
        setShowAvatarPicker(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSelectEmoji = (emoji: string) => {
    onUpdate({ ...profile, avatar: emoji });
    setShowAvatarPicker(false);
  };

  const confirmDelete = async () => {
    if (window.confirm("確定要註銷帳號嗎？此操作將永久刪除您的所有數據（包括雲端備份），且無法恢復。")) {
      setIsDeleting(true);
      try {
        await onDeleteAccount();
      } catch (error) {
        console.error("Deletion failed:", error);
        setIsDeleting(false);
        // index.tsx 已經有 alert，這裡負責重置按鈕狀態
      }
    }
  };

  const renderAvatar = () => {
    if (profile.avatar && profile.avatar.startsWith('data:image')) {
      return <img src={profile.avatar} alt="Avatar" className="w-full h-full object-cover rounded-full" />;
    }
    return <span>{profile.avatar || (profile.gender === 'male' ? '🤵' : '👩')}</span>;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center py-6">
        <div 
          onClick={() => setShowAvatarPicker(!showAvatarPicker)}
          className="relative group cursor-pointer"
        >
          <div className="w-24 h-24 bg-gradient-to-tr from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-4xl text-white shadow-xl mb-4 overflow-hidden border-4 border-white">
            {renderAvatar()}
          </div>
          <div className="absolute bottom-4 right-0 bg-blue-600 w-8 h-8 rounded-full flex items-center justify-center text-white border-2 border-white shadow-md">
            📸
          </div>
        </div>

        {showAvatarPicker && (
          <div className="bg-white p-4 rounded-3xl shadow-xl border border-slate-100 w-full animate-in fade-in slide-in-from-top-4 duration-300 z-20">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 text-center">選擇頭像</p>
            <div className="flex flex-wrap justify-center gap-3 mb-4">
              {EMOJI_OPTIONS.map(emoji => (
                <button
                  key={emoji}
                  onClick={() => handleSelectEmoji(emoji)}
                  className="text-2xl w-10 h-10 flex items-center justify-center bg-slate-50 rounded-xl hover:bg-blue-50 transition-colors"
                >
                  {emoji}
                </button>
              ))}
            </div>
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-3 bg-slate-100 text-slate-600 rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-slate-200 transition-colors"
            >
              <span>🖼️</span> 上傳手機圖片
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handleFileChange} 
            />
          </div>
        )}

        <h2 className="text-2xl font-bold text-slate-800 mt-2">{profile.name}</h2>
        <p className="text-slate-400 text-sm italic">保持專注，達成目標</p>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">身體數據</span>
          {!isEditing ? (
            <button 
              onClick={() => setIsEditing(true)}
              className="text-xs text-blue-600 font-bold"
            >
              編輯
            </button>
          ) : (
            <div className="flex gap-2">
              <button 
                onClick={() => setIsEditing(false)}
                className="text-xs text-slate-400 font-bold"
              >
                取消
              </button>
              <button 
                onClick={handleSave}
                className="text-xs text-blue-600 font-bold"
              >
                儲存
              </button>
            </div>
          )}
        </div>
        
        <div className="divide-y divide-slate-50">
          <div className="flex justify-between p-5 items-center">
            <span className="text-slate-600">身高</span>
            {isEditing ? (
              <input 
                type="number"
                className="text-right font-bold text-slate-800 w-20 outline-none border-b border-blue-200"
                value={editForm.height}
                onChange={e => setEditForm({...editForm, height: Number(e.target.value)})}
              />
            ) : (
              <span className="font-bold text-slate-800">{profile.height} cm</span>
            )}
          </div>
          <div className="flex justify-between p-5 items-center">
            <span className="text-slate-600">目前體重</span>
            {isEditing ? (
              <input 
                type="number"
                step="0.1"
                className="text-right font-bold text-slate-800 w-20 outline-none border-b border-blue-200"
                value={editForm.weight}
                onChange={e => setEditForm({...editForm, weight: Number(e.target.value)})}
              />
            ) : (
              <span className="font-bold text-slate-800">{profile.weight} kg</span>
            )}
          </div>
          <div className="flex justify-between p-5 items-center">
            <span className="text-slate-600">目標體重</span>
            {isEditing ? (
              <input 
                type="number"
                step="0.1"
                className="text-right font-bold text-slate-800 w-20 outline-none border-b border-blue-200"
                value={editForm.targetWeight}
                onChange={e => setEditForm({...editForm, targetWeight: Number(e.target.value)})}
              />
            ) : (
              <span className="font-bold text-slate-800">{profile.targetWeight} kg</span>
            )}
          </div>
          <div className="flex justify-between p-5 items-center">
            <span className="text-slate-600">每日熱量目標</span>
            {isEditing ? (
              <input 
                type="number"
                className="text-right font-bold text-slate-800 w-20 outline-none border-b border-blue-200"
                value={editForm.dailyCalorieGoal}
                onChange={e => setEditForm({...editForm, dailyCalorieGoal: Number(e.target.value)})}
              />
            ) : (
              <span className="font-bold text-blue-600">{profile.dailyCalorieGoal} kcal</span>
            )}
          </div>
        </div>
      </div>

      <div className="pt-4 space-y-3">
        <button 
          onClick={onLogout}
          className="w-full bg-slate-100 text-slate-500 font-bold py-4 rounded-2xl hover:bg-slate-200 transition-colors"
        >
          登出帳號
        </button>
        <button 
          onClick={confirmDelete}
          disabled={isDeleting}
          className="w-full bg-red-50 text-red-500 font-bold py-4 rounded-2xl hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
        >
          {isDeleting ? (
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 border-2 border-red-200 border-t-red-500 rounded-full animate-spin"></span>
              <span>正在註銷...</span>
            </div>
          ) : (
            '註銷帳號'
          )}
        </button>
      </div>

      <p className="text-center text-slate-300 text-xs mt-8 italic">
        FitFocus v1.6.0
      </p>
    </div>
  );
};

export default UserProfileView;
