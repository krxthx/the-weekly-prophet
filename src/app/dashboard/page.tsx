'use client';

import { useState } from 'react';
import Header from '@/components/header';
import DailyStatusCard from '@/components/dashboard/daily-status-card';
import MonthlyStatsCard from '@/components/dashboard/monthly-stats-card';
import WorkSummaryCard from '@/components/dashboard/work-summary-card';
import TodoSidebar from '@/components/dashboard/todo-sidebar';

interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

export default function DashboardPage() {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  const currentMonth = today.toLocaleDateString('en-US', { month: 'long' });

  // Work summary state
  const [todayUpdate, setTodayUpdate] = useState('');

  // TODO state
  const [newTodayTodo, setNewTodayTodo] = useState('');
  const [editingTodo, setEditingTodo] = useState<number | null>(null);
  const [editText, setEditText] = useState('');

  // Mock data
  const [yesterdayTodos] = useState<Todo[]>([
    { id: 1, text: 'Finish user research analysis', completed: true },
    { id: 2, text: 'Prepare wireframes', completed: true },
    { id: 3, text: 'Client feedback review', completed: false },
    { id: 4, text: 'Update project timeline', completed: true },
    { id: 5, text: 'Team meeting prep', completed: false }
  ]);

  const [todayTodos, setTodayTodos] = useState<Todo[]>([
    { id: 6, text: 'Review project proposal', completed: false },
    { id: 7, text: 'Team meeting prep', completed: true },
    { id: 8, text: 'Client feedback review', completed: false },
    { id: 9, text: 'Update documentation', completed: false }
  ]);

  // TODO functions
  const addTodayTodo = () => {
    if (newTodayTodo.trim()) {
      setTodayTodos([...todayTodos, {
        id: Date.now(),
        text: newTodayTodo.trim(),
        completed: false
      }]);
      setNewTodayTodo('');
    }
  };

  const toggleTodayTodo = (id: number) => {
    setTodayTodos(todayTodos.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const startEditing = (id: number, text: string) => {
    setEditingTodo(id);
    setEditText(text);
  };

  const saveEdit = (id: number) => {
    if (editText.trim()) {
      setTodayTodos(todayTodos.map(todo => 
        todo.id === id ? { ...todo, text: editText.trim() } : todo
      ));
    }
    setEditingTodo(null);
    setEditText('');
  };

  const cancelEdit = () => {
    setEditingTodo(null);
    setEditText('');
  };

  const deleteTodo = (id: number) => {
    setTodayTodos(todayTodos.filter(todo => todo.id !== id));
  };

  return (
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
            <WorkSummaryCard 
              todayUpdate={todayUpdate}
              setTodayUpdate={setTodayUpdate}
            />

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
  );
}
