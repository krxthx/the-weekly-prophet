'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import TodoList from '@/components/dashboard/todo-list';
import { useAuth } from '@/contexts/auth-context';
import { addTodo, updateTodo, deleteTodo as deleteTodoFromFirestore, getTodosForDate } from '@/lib/firestore';

type StatusType = 'office' | 'wfh' | 'leave' | null;

interface Todo {
  id: string;
  text: string;
  completed: boolean;
  order?: number;
}

interface DayEditModalProps {
  date: Date;
  initialStatus: StatusType;
  initialWorkSummary: string;
  initialTodos?: Todo[];
  onSave: (date: Date, status: StatusType, workSummary: string) => void;
  onClose: () => void;
}

export default function DayEditModal({ 
  date, 
  initialStatus, 
  initialWorkSummary,
  initialTodos = [],
  onSave, 
  onClose 
}: DayEditModalProps) {
  const { user } = useAuth();
  const [status, setStatus] = useState<StatusType>(initialStatus);
  const [workSummary, setWorkSummary] = useState(initialWorkSummary);
  const [todos, setTodos] = useState<Todo[]>(initialTodos);
  const [newTodo, setNewTodo] = useState('');
  const [editingTodo, setEditingTodo] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  const dateString = date.toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  const handleSave = () => {
    onSave(date, status, workSummary);
    onClose();
  };
  
  // Todo functions
  const addNewTodo = async () => {
    if (!newTodo.trim() || !user) return;
    
    try {
      const todoId = await addTodo(user.uid, date, newTodo.trim());
      const newTodoItem: Todo = {
        id: todoId,
        text: newTodo.trim(),
        completed: false
      };
      setTodos([...todos, newTodoItem]);
      setNewTodo('');
    } catch (error) {
      console.error('Error adding todo:', error);
    }
  };

  const toggleTodo = async (id: string) => {
    if (!user) return;
    
    try {
      const todo = todos.find(t => t.id === id);
      if (!todo) return;
      
      await updateTodo(user.uid, id, { completed: !todo.completed });
      setTodos(todos.map(todo => 
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
      setTodos(todos.map(todo => 
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
      setTodos(todos.filter(todo => todo.id !== id));
    } catch (error) {
      console.error('Error deleting todo:', error);
    }
  };
  
  const reorderTodos = async (reorderedTodos: Todo[]) => {
    if (!user) return;
    
    try {
      setTodos(reorderedTodos);
      
      // Update the order in Firestore
      const batch = [];
      for (let i = 0; i < reorderedTodos.length; i++) {
        const todo = reorderedTodos[i];
        batch.push(updateTodo(user.uid, todo.id, { order: i }));
      }
      
      await Promise.all(batch);
    } catch (error) {
      console.error('Error reordering todos:', error);
      // If there's an error, reload the original order
      const todayData = await getTodosForDate(user.uid, date);
      setTodos(todayData);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div className="bg-app border border-app rounded-xl p-6 w-full max-w-2xl mx-4 shadow-lg relative z-10 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-medium text-app">Edit Day</h2>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-muted rounded-lg text-muted hover:text-app transition-all duration-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <p className="text-sm text-muted-foreground">{dateString}</p>
          </div>

          {/* Status Selection */}
          <div>
            <label className="block text-sm font-medium text-foreground/80 mb-3">
              Work Status
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 'office' as const, label: 'Office', color: 'blue' },
                { value: 'wfh' as const, label: 'WFH', color: 'green' },
                { value: 'leave' as const, label: 'Leave', color: 'orange' }
              ].map(({ value, label, color }) => (
                <button
                  key={value}
                  onClick={() => setStatus(value)}
                  className={`p-3 rounded-lg border transition-all duration-200 text-sm font-medium ${
                    status === value
                      ? `border-${color}-200 bg-${color}-50 text-${color}-700`
                      : 'border-muted/40 bg-muted/10 text-muted-foreground hover:border-muted/60 hover:text-foreground/80'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            
            {status && (
              <button
                onClick={() => setStatus(null)}
                className="mt-2 text-xs text-muted-foreground hover:text-foreground/80 transition-colors duration-200"
              >
                Clear status
              </button>
            )}
          </div>

          {/* Work Summary */}
          <div>
            <label htmlFor="workSummary" className="block text-sm font-medium text-foreground/80 mb-3">
              Work Summary / Notes
            </label>
            <textarea
              id="workSummary"
              value={workSummary}
              onChange={(e) => setWorkSummary(e.target.value)}
              placeholder="What did you work on today? Key accomplishments, meetings, tasks completed..."
              className="w-full h-32 px-3 py-2.5 bg-muted/20 border border-muted/40 rounded-lg focus:border-muted/60 focus:outline-none resize-none text-foreground/90 placeholder-muted-foreground text-sm"
            />
          </div>
          
          {/* Todo List */}
          <div>
            <label className="block text-sm font-medium text-foreground/80 mb-3">
              Tasks
            </label>
            <div className="bg-muted/20 border border-muted/40 rounded-lg p-4">
              <TodoList
                title="Tasks"
                todos={todos}
                isEditable={true}
                showAddInput={true}
                newTodoValue={newTodo}
                onNewTodoChange={setNewTodo}
                onAddTodo={addNewTodo}
                onToggleTodo={toggleTodo}
                onDeleteTodo={deleteTodo}
                onStartEdit={startEditing}
                onSaveEdit={saveEdit}
                onCancelEdit={cancelEdit}
                editingTodo={editingTodo}
                editText={editText}
                onEditTextChange={setEditText}
                onReorder={reorderTodos}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 bg-muted/40 hover:bg-muted/60 text-foreground/80 rounded-lg transition-all duration-200 text-sm font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex-1 px-4 py-2.5 bg-accent hover:bg-accent/90 text-accent-foreground rounded-lg transition-all duration-200 text-sm font-medium"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
