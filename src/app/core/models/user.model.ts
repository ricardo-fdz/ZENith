export interface UserSettings {
  pomodoroTime: number;
  shortBreak: number;
  longBreak: number;
  theme: 'light' | 'dark' | 'zen';
  isSidebarCollapsed: boolean;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string; // El '?' significa que es opcional
  createdAt: Date | any; // 'any' por los Timestamps de Firebase
  globalSettings: UserSettings;
}
