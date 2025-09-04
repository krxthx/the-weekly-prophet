import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  getDocs,
  addDoc,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from './firebase';

// Types
export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface DailyEntry {
  id: string;
  date: string; // YYYY-MM-DD format
  status: 'office' | 'wfh' | 'leave';
  notes: string;
  todos: Todo[];
  workSummary: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface WeeklyEntry {
  id: string;
  weekStart: string; // YYYY-MM-DD format (Monday)
  weekEnd: string; // YYYY-MM-DD format (Sunday)
  dailyEntries: DailyEntry[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Helper function to get user's collection reference
const getUserCollection = (userId: string, collectionName: string) => {
  return collection(db, 'users', userId, collectionName);
};

// Helper function to format date as YYYY-MM-DD (timezone-safe)
const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Helper function to get week start (Monday) and end (Sunday)
const getWeekRange = (date: Date) => {
  const start = new Date(date);
  start.setDate(date.getDate() - date.getDay() + 1); // Monday
  const end = new Date(start);
  end.setDate(start.getDate() + 6); // Sunday
  
  return {
    start: formatDate(start),
    end: formatDate(end)
  };
};

// Daily Entry Functions
export const getDailyEntry = async (userId: string, date: Date): Promise<DailyEntry | null> => {
  try {
    const dateStr = formatDate(date);
    const docRef = doc(getUserCollection(userId, 'dailyEntries'), dateStr);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as DailyEntry;
    }
    return null;
  } catch (error) {
    console.error('Error getting daily entry:', error);
    throw error;
  }
};

export const saveDailyEntry = async (userId: string, entry: Partial<DailyEntry>): Promise<void> => {
  try {
    const dateStr = entry.date || formatDate(new Date());
    const docRef = doc(getUserCollection(userId, 'dailyEntries'), dateStr);
    
    const entryData = {
      ...entry,
      date: dateStr,
      updatedAt: serverTimestamp()
    };

    // Check if document exists
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      await updateDoc(docRef, entryData);
    } else {
      await setDoc(docRef, {
        ...entryData,
        createdAt: serverTimestamp()
      });
    }
  } catch (error) {
    console.error('Error saving daily entry:', error);
    throw error;
  }
};

// Todo Functions
export const addTodo = async (userId: string, date: Date, todoText: string): Promise<string> => {
  try {
    const todosRef = getUserCollection(userId, 'todos');
    const todoData = {
      text: todoText,
      completed: false,
      date: formatDate(date),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    const docRef = await addDoc(todosRef, todoData);
    return docRef.id;
  } catch (error) {
    console.error('Error adding todo:', error);
    throw error;
  }
};

export const updateTodo = async (userId: string, todoId: string, updates: Partial<Todo>): Promise<void> => {
  try {
    const todoRef = doc(getUserCollection(userId, 'todos'), todoId);
    await updateDoc(todoRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating todo:', error);
    throw error;
  }
};

export const deleteTodo = async (userId: string, todoId: string): Promise<void> => {
  try {
    const todoRef = doc(getUserCollection(userId, 'todos'), todoId);
    await deleteDoc(todoRef);
  } catch (error) {
    console.error('Error deleting todo:', error);
    throw error;
  }
};

export const getTodosForDate = async (userId: string, date: Date): Promise<Todo[]> => {
  try {
    const dateStr = formatDate(date);
    const todosRef = getUserCollection(userId, 'todos');
    const q = query(
      todosRef,
      where('date', '==', dateStr)
    );
    
    const querySnapshot = await getDocs(q);
    const todos = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Todo[];
    
    // Sort by createdAt on the client side
    return todos.sort((a, b) => {
      if (!a.createdAt || !b.createdAt) return 0;
      return a.createdAt.seconds - b.createdAt.seconds;
    });
  } catch (error) {
    console.error('Error getting todos for date:', error);
    throw error;
  }
};

// Week Functions
export const getWeeklyData = async (userId: string, date: Date): Promise<DailyEntry[]> => {
  try {
    const { start, end } = getWeekRange(date);
    const dailyEntriesRef = getUserCollection(userId, 'dailyEntries');
    const q = query(
      dailyEntriesRef,
      where('date', '>=', start),
      where('date', '<=', end),
      orderBy('date', 'asc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as DailyEntry[];
  } catch (error) {
    console.error('Error getting weekly data:', error);
    throw error;
  }
};

// Statistics Functions
export const getMonthlyStats = async (userId: string, month: number, year: number) => {
  try {
    const dailyEntriesRef = getUserCollection(userId, 'dailyEntries');
    const querySnapshot = await getDocs(dailyEntriesRef);
    const entries = querySnapshot.docs.map(doc => doc.data()) as DailyEntry[];
    
    // Filter entries for the specific month/year on client side
    const monthEntries = entries.filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate.getMonth() + 1 === month && entryDate.getFullYear() === year;
    });
    
    const stats = {
      totalDays: monthEntries.length,
      officeDays: monthEntries.filter(e => e.status === 'office').length,
      wfhDays: monthEntries.filter(e => e.status === 'wfh').length,
      leaveDays: monthEntries.filter(e => e.status === 'leave').length
    };
    
    return stats;
  } catch (error) {
    console.error('Error getting monthly stats:', error);
    throw error;
  }
};
