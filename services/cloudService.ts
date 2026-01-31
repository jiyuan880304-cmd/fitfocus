
import { User, AppData, DailyLog } from '../types';

const CLOUD_USERS_KEY = 'fitfocus_remote_users';
const CLOUD_DATA_PREFIX = 'fitfocus_cloud_data_';

// 模擬網路延遲
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export const cloudService = {
  async register(email: string, password: string): Promise<User> {
    await delay(800);
    const users: User[] = JSON.parse(localStorage.getItem(CLOUD_USERS_KEY) || '[]');
    if (users.find(u => u.email === email)) {
      throw new Error('此帳號已存在');
    }
    const newUser: User = { id: Math.random().toString(36).substr(2, 9), email, password };
    users.push(newUser);
    localStorage.setItem(CLOUD_USERS_KEY, JSON.stringify(users));
    return { id: newUser.id, email: newUser.email };
  },

  async login(email: string, password: string): Promise<User> {
    await delay(800);
    const users: User[] = JSON.parse(localStorage.getItem(CLOUD_USERS_KEY) || '[]');
    const user = users.find(u => u.email === email && u.password === password);
    if (!user) {
      throw new Error('帳號或密碼錯誤');
    }
    return { id: user.id, email: user.email };
  },

  async resetPassword(email: string, newPassword: string): Promise<void> {
    await delay(1000);
    const users: User[] = JSON.parse(localStorage.getItem(CLOUD_USERS_KEY) || '[]');
    const userIndex = users.findIndex(u => u.email === email);
    if (userIndex === -1) {
      throw new Error('找不到此電子郵件關聯的帳號');
    }
    users[userIndex].password = newPassword;
    localStorage.setItem(CLOUD_USERS_KEY, JSON.stringify(users));
  },

  async deleteAccount(userId: string): Promise<void> {
    if (!userId) throw new Error("無效的使用者 ID");
    await delay(1500);
    const users: User[] = JSON.parse(localStorage.getItem(CLOUD_USERS_KEY) || '[]');
    const updatedUsers = users.filter(u => u.id !== userId);
    localStorage.setItem(CLOUD_USERS_KEY, JSON.stringify(updatedUsers));
    localStorage.removeItem(CLOUD_DATA_PREFIX + userId);
  },

  async fetchData(userId: string): Promise<AppData | null> {
    await delay(500);
    const data = localStorage.getItem(CLOUD_DATA_PREFIX + userId);
    return data ? JSON.parse(data) : null;
  },

  async saveData(userId: string, data: AppData): Promise<void> {
    if (!userId) return;
    await delay(300);
    localStorage.setItem(CLOUD_DATA_PREFIX + userId, JSON.stringify(data));
  },

  /**
   * 用於保存使用者的健康數據（體重、水、步數）
   * @param user_email 使用者電子郵件
   * @param weight 體重
   * @param water 飲水量
   * @param steps 步數
   */
  async save_health_data(user_email: string, weight: number, water: number, steps: number): Promise<void> {
    const users: User[] = JSON.parse(localStorage.getItem(CLOUD_USERS_KEY) || '[]');
    const user = users.find(u => u.email === user_email);
    
    if (!user) {
      throw new Error('找不到該電子郵件對應的使用者');
    }

    const userId = user.id;
    const existingDataStr = localStorage.getItem(CLOUD_DATA_PREFIX + userId);
    const data: AppData = existingDataStr ? JSON.parse(existingDataStr) : {
      profile: null,
      logs: {},
      fasting: { startTime: null, targetDuration: 16, isActive: false }
    };

    const today = new Date().toISOString().split('T')[0];
    const currentLog = data.logs[today] || {
      date: today,
      meals: [],
      waterIntake: 0,
      bowelMovements: 0,
      steps: 0,
      weight: weight
    };

    // 更新今日數據
    data.logs[today] = {
      ...currentLog,
      weight: weight,
      waterIntake: water,
      steps: steps
    };

    // 如果 profile 存在，也更新 profile 中的目前體重
    if (data.profile) {
      data.profile.weight = weight;
    }

    localStorage.setItem(CLOUD_DATA_PREFIX + userId, JSON.stringify(data));
  }
};
