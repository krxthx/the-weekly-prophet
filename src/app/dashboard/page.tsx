'use client';

import { useState, useEffect, useMemo } from 'react';
import Header from '@/components/header';
import DailyStatusCard from '@/components/dashboard/daily-status-card';
import MonthlyStatsCard from '@/components/dashboard/monthly-stats-card';
import WorkSummaryCard from '@/components/dashboard/work-summary-card';
import TodoSidebar from '@/components/dashboard/todo-sidebar';
import ProtectedRoute from '@/components/protected-route';
import { useAuth } from '@/contexts/auth-context';
import { 
  addTodo, 
  updateTodo, 
  deleteTodo as deleteTodoFromFirestore, 
  getTodosForDate,
  reorderTodos as reorderTodosInFirestore
} from '@/lib/firestore';

// Import the Todo type from firestore
import type { Todo as FirestoreTodo } from '@/lib/firestore';

// Local Todo type that extends the Firestore Todo type
interface Todo extends Omit<FirestoreTodo, 'createdAt' | 'updatedAt'> {
  id: string;
  text: string;
  completed: boolean;
  order?: number;
}

export default function DashboardPage() {
  const { user } = useAuth();
  
  const today = useMemo(() => new Date(), []);
  const currentMonth = today.toLocaleDateString('en-US', { month: 'long' });
  
  // Get user's first name
  const userName = useMemo(() => {
    if (!user) return '';
    
    // Extract first name from displayName or email
    if (user.displayName) {
      return user.displayName.split(' ')[0];
    } else if (user.email) {
      return user.email.split('@')[0];
    }
    return '';
  }, [user]);

  // State
  const [newTodayTodo, setNewTodayTodo] = useState('');
  const [editingTodo, setEditingTodo] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [todayTodos, setTodayTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);

  // Load data on component mount
  useEffect(() => {
    const loadTodos = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        const todayData = await getTodosForDate(user.uid, today);
        setTodayTodos(todayData);
      } catch (error) {
        console.error('Error loading todos:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadTodos();
    }
  }, [user, today]);

  // TODO functions
  const addTodayTodo = async () => {
    if (!newTodayTodo.trim() || !user) return;
    
    try {
      const todoId = await addTodo(user.uid, today, newTodayTodo.trim());
      const newTodo: Todo = {
        id: todoId,
        text: newTodayTodo.trim(),
        completed: false
      };
      setTodayTodos([...todayTodos, newTodo]);
      setNewTodayTodo('');
    } catch (error) {
      console.error('Error adding todo:', error);
    }
  };

  const toggleTodayTodo = async (id: string) => {
    if (!user) return;
    
    try {
      const todo = todayTodos.find(t => t.id === id);
      if (!todo) return;
      
      await updateTodo(user.uid, id, { completed: !todo.completed });
      setTodayTodos(todayTodos.map(todo => 
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      ));
    } catch (error) {
      console.error('Error toggling todo:', error);
    }
  };

  const startEditing = (id: string, text: string) => {
    setEditingTodo(id);
    setEditText(text);
  };

  const saveEdit = async (id: string) => {
    if (!editText.trim() || !user) return;
    
    try {
      await updateTodo(user.uid, id, { text: editText.trim() });
      setTodayTodos(todayTodos.map(todo => 
        todo.id === id ? { ...todo, text: editText.trim() } : todo
      ));
      setEditingTodo(null);
      setEditText('');
    } catch (error) {
      console.error('Error updating todo:', error);
    }
  };

  const cancelEdit = () => {
    setEditingTodo(null);
    setEditText('');
  };

  const deleteTodo = async (id: string) => {
    if (!user) return;
    
    try {
      await deleteTodoFromFirestore(user.uid, id);
      setTodayTodos(todayTodos.filter(todo => todo.id !== id));
    } catch (error) {
      console.error('Error deleting todo:', error);
    }
  };
  
  const reorderTodos = async (reorderedTodos: Todo[]) => {
    if (!user) return;
    
    try {
      // Update the local state immediately for a responsive UI
      setTodayTodos(reorderedTodos);
      
      // Update the order in Firestore
      // Convert local Todo type to Firestore Todo type
      await reorderTodosInFirestore(user.uid, today, reorderedTodos as FirestoreTodo[]);
    } catch (error) {
      console.error('Error reordering todos:', error);
      // If there's an error, reload the original order
      const todayData = await getTodosForDate(user.uid, today);
      setTodayTodos(todayData);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-app flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-app/30 border-t-app rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted">Loading dashboard...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-app">
        <Header />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-2xl font-bold text-app mb-2 px-2">
            {getGreeting()}{userName ? `, ${userName}` : ''}!
          </h1>          
          {/* Main Dashboard Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left Side - TODOs */}
            <div className="lg:col-span-8 transform transition-all duration-300 hover:scale-[1.01] h-full">
              <TodoSidebar
                today={today}
                todayTodos={todayTodos}
                newTodayTodo={newTodayTodo}
                setNewTodayTodo={setNewTodayTodo}
                editingTodo={editingTodo}
                editText={editText}
                setEditText={setEditText}
                addTodayTodo={addTodayTodo}
                toggleTodayTodo={toggleTodayTodo}
                startEditing={startEditing}
                saveEdit={saveEdit}
                cancelEdit={cancelEdit}
                deleteTodo={deleteTodo}
                reorderTodos={reorderTodos}
              />
            </div>
            
            {/* Right Side - Status Cards (Stacked) */}
            <div className="lg:col-span-4 flex flex-col gap-6 h-full">
              {/* Daily Status Card */}
              <div className="transform transition-all duration-300 hover:scale-[1.02] flex-1">
                <DailyStatusCard today={today} />
              </div>
              
              {/* Monthly Stats Card */}
              <div className="transform transition-all duration-300 hover:scale-[1.02] flex-1">
                <MonthlyStatsCard currentMonth={currentMonth} />
              </div>
            </div>
            
            {/* Bottom - Work Summary Card (Full Width) */}
            <div className="lg:col-span-12 transform transition-all duration-300 hover:scale-[1.01]">
              <WorkSummaryCard today={today} />
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
