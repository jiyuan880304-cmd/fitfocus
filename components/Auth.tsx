
import React, { useState } from 'react';
import { cloudService } from '../services/cloudService';
import { User } from '../types';

interface AuthProps {
  onLogin: (user: User) => void;
}

type AuthMode = 'login' | 'register' | 'forgot';

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      if (mode === 'login') {
        const user = await cloudService.login(email, password);
        onLogin(user);
      } else if (mode === 'register') {
        const user = await cloudService.register(email, password);
        onLogin(user);
      } else if (mode === 'forgot') {
        await cloudService.resetPassword(email, newPassword);
        setSuccess('密碼重設成功！請使用新密碼登入。');
        setMode('login');
        setPassword('');
        setNewPassword('');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const renderTitle = () => {
    switch (mode) {
      case 'login': return '登入帳號';
      case 'register': return '建立帳號';
      case 'forgot': return '重設密碼';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-blue-900 flex flex-col justify-center items-center p-6">
      <div className="w-full max-w-sm bg-white/10 backdrop-blur-xl p-8 rounded-[40px] border border-white/20 shadow-2xl transition-all">
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-blue-600 rounded-3xl mx-auto mb-4 flex items-center justify-center text-4xl shadow-lg shadow-blue-500/50">
            🏃‍♂️
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">FitFocus</h1>
          <p className="text-blue-200/60 text-sm mt-2 font-medium">我變瘦超好看</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-2xl text-red-200 text-xs text-center animate-in fade-in zoom-in duration-300">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-500/20 border border-green-500/50 rounded-2xl text-green-200 text-xs text-center animate-in fade-in zoom-in duration-300">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="電子郵件"
            required
            className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder-slate-500"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
          
          {mode !== 'forgot' ? (
            <input
              type="password"
              placeholder="密碼"
              required
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder-slate-500"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          ) : (
            <input
              type="password"
              placeholder="輸入新密碼"
              required
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder-slate-500"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
            />
          )}

          {mode === 'login' && (
            <div className="text-right">
              <button 
                type="button"
                onClick={() => setMode('forgot')}
                className="text-blue-300/60 text-xs hover:text-blue-300 transition-colors"
              >
                忘記密碼？
              </button>
            </div>
          )}

          <button
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-2xl shadow-xl shadow-blue-600/30 transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            {loading ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> : renderTitle()}
          </button>
        </form>

        <div className="mt-8 text-center space-y-3">
          {mode === 'login' ? (
            <button 
              onClick={() => setMode('register')}
              className="text-blue-300 text-sm font-medium hover:text-white transition-colors"
            >
              還沒有帳號？立即註冊
            </button>
          ) : (
            <button 
              onClick={() => setMode('login')}
              className="text-blue-300 text-sm font-medium hover:text-white transition-colors"
            >
              返回登入頁面
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Auth;
