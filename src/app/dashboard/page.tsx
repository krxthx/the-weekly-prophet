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
  getTodosForDate 
} from '@/lib/firestore';

interface Todo {
  id: string;
  text: string;
  completed: boolean;
}

export default function DashboardPage() {
  const { user } = useAuth();
  
  const today = useMemo(() => new Date(), []);
  const yesterday = useMemo(() => {
    const date = new Date();
    date.setDate(date.getDate() - 1);
    return date;
  }, []);
  
  const currentMonth = today.toLocaleDateString('en-US', { month: 'long' });

  // State
  const [newTodayTodo, setNewTodayTodo] = useState('');
  const [editingTodo, setEditingTodo] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [yesterdayTodos, setYesterdayTodos] = useState<Todo[]>([]);
  const [todayTodos, setTodayTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);

  // Load data on component mount
  useEffect(() => {
    const loadTodos = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        const [yesterdayData, todayData] = await Promise.all([
          getTodosForDate(user.uid, yesterday),
          getTodosForDate(user.uid, today)
        ]);
        
        setYesterdayTodos(yesterdayData);
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
  }, [user, yesterday, today]);

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

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-app">
        <Header />

        <div className="max-w-7xl mx-auto px-8 py-12">
          {/* Main Grid Layout */}
          <div className="grid grid-cols-12 gap-8">
            
            {/* Left Column - Today's Focus */}
            <div className="col-span-12 lg:col-span-8 space-y-8">
              
              {/* Today Section - Horizontal Layout */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <DailyStatusCard today={today} />
                <MonthlyStatsCard currentMonth={currentMonth} />
              </div>

              {/* Daily Work Summary - Full Width */}
              <WorkSummaryCard today={today} />

            </div>

            {/* Right Column - TODOs Sidebar */}
            <div className="col-span-12 lg:col-span-4">
              <TodoSidebar
                yesterday={yesterday}
                today={today}
                yesterdayTodos={yesterdayTodos}
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
              />
            </div>
            
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
