'use client';

import TodoList from './todo-list';

interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

interface TodoSidebarProps {
  yesterday: Date;
  today: Date;
  yesterdayTodos: Todo[];
  todayTodos: Todo[];
  newTodayTodo: string;
  setNewTodayTodo: (value: string) => void;
  editingTodo: number | null;
  editText: string;
  setEditText: (value: string) => void;
  addTodayTodo: () => void;
  toggleTodayTodo: (id: number) => void;
  startEditing: (id: number, text: string) => void;
  saveEdit: (id: number) => void;
  cancelEdit: () => void;
  deleteTodo: (id: number) => void;
}

export default function TodoSidebar({
  yesterday,
  today,
  yesterdayTodos,
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
    <div className="bg-muted/30 border border-app rounded-xl p-8 h-fit sticky top-8">
      <div className="flex items-center gap-3 mb-8">
        <span className="text-2xl">✅</span>
        <h2 className="text-xl font-medium text-app">TODOs</h2>
      </div>

      {/* Yesterday's TODOs */}
      <TodoList
        title={`Yesterday (${yesterday.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' })})`}
        todos={yesterdayTodos}
        isEditable={true}
        onToggleTodo={toggleTodayTodo}
        onDeleteTodo={deleteTodo}
        onStartEdit={startEditing}
        onSaveEdit={saveEdit}
        onCancelEdit={cancelEdit}
        editingTodo={editingTodo}
        editText={editText}
        onEditTextChange={setEditText}
        maxDisplayCount={3}
      />

      {/* Today's TODOs */}
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
  );
}
