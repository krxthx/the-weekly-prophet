export interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

export type ViewMode = 'notes' | 'tasks' | 'both';

export interface DayData {
  date: string;
  status: string;
  notes: string;
  tasks: string[];
}
