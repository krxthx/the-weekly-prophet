'use client';

import TodoList from './todo-list';

interface Todo {
  id: string;
  text: string;
  completed: boolean;
}

interface TodoSidebarProps {
  today: Date;
  todayTodos: Todo[];
  newTodayTodo: string;
  setNewTodayTodo: (value: string) => void;
  editingTodo: string | null;
  editText: string;
  setEditText: (value: string) => void;
  addTodayTodo: () => void;
  toggleTodayTodo: (id: string) => void;
  startEditing: (id: string, text: string) => void;
  saveEdit: (id: string) => void;
  cancelEdit: () => void;
  deleteTodo: (id: string) => void;
}

export default function TodoSidebar({
  today,
  todayTodos,
  newTodayTodo,
  setNewTodayTodo,
  editingTodo,
  editText,
  setEditText,
  addTodayTodo,
  toggleTodayTodo,
  startEditing,
  saveEdit,
  cancelEdit,
  deleteTodo
}: TodoSidebarProps) {
  return (
    <div className="bg-app border border-app rounded-xl p-6 h-full flex flex-col">
      <div className="flex items-center gap-3 mb-4">
        <span className="text-2xl">✅</span>
        <h2 className="text-xl font-medium text-app">Today&apos;s Tasks</h2>
      </div>

      <div className="bg-app p-5 rounded-lg border border-app flex-1 overflow-hidden flex flex-col min-h-0 max-h-[320px]">
        <TodoList
          title={`Today (${today.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' })})`}
          todos={todayTodos}
          isEditable={true}
          showAddInput={true}
          newTodoValue={newTodayTodo}
          onNewTodoChange={setNewTodayTodo}
          onAddTodo={addTodayTodo}
          onToggleTodo={toggleTodayTodo}
          onDeleteTodo={deleteTodo}
          onStartEdit={startEditing}
          onSaveEdit={saveEdit}
          onCancelEdit={cancelEdit}
          editingTodo={editingTodo}
          editText={editText}
          onEditTextChange={setEditText}
        />
      </div>
    </div>
  );
}
