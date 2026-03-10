export interface Session{
  id: string,                     // Auto-generated
  userId: string,                  // FK → users
  name: string,
  description: string | null,
  status: "active" | "paused" | "completed",
  color: string,                   // Color de identificación
  createdAt: Date,
  updatedAt: Date,
  completedAt: Date | null,
  pomodoroConfig: SessionPomodoroConfig,
  metrics: SessionMetrics
}

export interface SessionMetrics{
    totalPomodoros: number,
    totalWorkMinutes: number,
    tasksCompleted: number,
    tasksTotal: number,
    productivityScore: number,
}

export interface SessionPomodoroConfig{
    workDuration: number | null,
    shortBreak: number | null,
    longBreak: number | null,
    sessionsUntilLongBreak: number | null,
    autoStart: false;
}

export interface Task {
  id?: string;
  userId: string;
  sessionId?: string | null; // null = Tarea fuera de sesión
  isGlobal: boolean;
  title: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed';
  priority?: 'low' | 'medium' | 'high';

  // Gestión de tiempo
  estimatedPomodoros?: number;
  completedPomodoros?: number; // Contador de ciclos terminados enfocados aquí

  tags?: string[];
  order?: number; // Para el Drag & Drop en la UI
  createdAt?: Date;
  updatedAt?: Date;
  completedAt?: Date | null;
}

export interface PomodoroLog {
  id?: string;
  userId: string;
  sessionId: string;
  type: 'work' | 'short_break' | 'long_break';
  status?: 'completed' | 'interrupted';

  plannedDuration: number; // Lo que debería durar (ej. 25)
  actualDuration?: number;  // Lo que duró realmente (por si se corta antes)

  startedAt: Date;
  endedAt?: Date;
}
