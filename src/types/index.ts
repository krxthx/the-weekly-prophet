export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
}

export interface DayEntry {
  id: string;
  date: string; // YYYY-MM-DD format
  status: 'office' | 'wfh' | 'leave';
  note?: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Todo {
  id: string;
  title: string;
  completed: boolean;
  weekStart: string; // YYYY-MM-DD format of the Monday of the week
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface WeekData {
  weekStart: string; // YYYY-MM-DD format of the Monday
  days: DayEntry[];
  todos: Todo[];
  stats: {
    officeDays: number;
    wfhDays: number;
    leaveDays: number;
    completedTodos: number;
    totalTodos: number;
  };
}
