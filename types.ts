
export interface User {
  id: string;
  email: string;
  password?: string;
}

export type PetType = 'cat' | 'dog' | 'mouse';

export interface UserProfile {
  name: string;
  gender: 'male' | 'female' | 'other';
  height: number;
  weight: number;
  targetWeight: number;
  dailyCalorieGoal: number;
  avatar?: string;
  motivationImage?: string; // 新增：激勵/目標照片
  tokens: number;
  affection: number;
  inventory: string[];
  petType: PetType;
  petName: string;
}

export interface FoodItem {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  timestamp: number;
}

export interface FastingSession {
  startTime: number | null;
  targetDuration: number;
  isActive: boolean;
}

export interface DailyLog {
  date: string;
  meals: FoodItem[];
  waterIntake: number;
  bowelMovements: number;
  weight?: number;
  steps: number; // 新增：步數紀錄
}

export interface AppData {
  profile: UserProfile | null;
  logs: Record<string, DailyLog>;
  fasting: FastingSession;
}

export interface AppState {
  currentUser: User | null;
  isSyncing: boolean;
}
