'use client';

interface Todo {
  id: string;
  text: string;
  completed: boolean;
}

interface TodoListProps {
  title: string;
  todos: Todo[];
  isEditable?: boolean;
  showAddInput?: boolean;
  newTodoValue?: string;
  onNewTodoChange?: (value: string) => void;
  onAddTodo?: () => void;
  onToggleTodo?: (id: string) => void;
  onDeleteTodo?: (id: string) => void;
  onStartEdit?: (id: string, text: string) => void;
  onSaveEdit?: (id: string) => void;
  onCancelEdit?: () => void;
  editingTodo?: string | null;
  editText?: string;
  onEditTextChange?: (value: string) => void;
  maxDisplayCount?: number;
}

export default function TodoList({
  title,
  todos,
  isEditable = false,
  showAddInput = false,
  newTodoValue = '',
  onNewTodoChange,
  onAddTodo,
  onToggleTodo,
  onDeleteTodo,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  editingTodo,
  editText = '',
  onEditTextChange,
  maxDisplayCount
}: TodoListProps) {
  const displayTodos = maxDisplayCount ? todos.slice(0, maxDisplayCount) : todos;
  const remainingCount = maxDisplayCount && todos.length > maxDisplayCount 
    ? todos.length - maxDisplayCount 
    : 0;

  return (
    <div className="h-full flex flex-col min-h-0">
      <h3 className={`text-sm font-medium mb-3 ${isEditable ? 'text-app' : 'text-muted'}`}>
        {title}
      </h3>
      
      {/* Add Todo Input - only for editable lists */}
      {showAddInput && onNewTodoChange && onAddTodo && (
        <div className="flex gap-2 mb-3">
          <input 
            value={newTodoValue}
            onChange={(e) => onNewTodoChange(e.target.value)}
            placeholder="Add task..."
            className="input flex-1 h-9 text-sm"
            onKeyPress={(e) => e.key === 'Enter' && onAddTodo()}
          />
          <button 
            onClick={onAddTodo}
            className="btn btn-primary px-3 py-1 h-9 text-sm"
          >
            +
          </button>
        </div>
      )}

      {/* Todo List */}
      <div className="space-y-2 flex-1 overflow-y-auto pr-1 custom-scrollbar min-h-0">
        {displayTodos.length === 0 ? (
          <div className="text-center py-4">
            <div className="text-muted text-sm">
              {isEditable ? 'No tasks yet' : 'No tasks from yesterday'}
            </div>
            <div className="text-xs text-muted">
              {isEditable && showAddInput ? 'Add your first task above' : ''}
            </div>
          </div>
        ) : (
          displayTodos.map((todo) => (
            <div 
              key={todo.id}
              className={`flex items-center gap-2 py-2 px-2.5 border rounded-lg transition-colors group ${
                isEditable 
                  ? 'border-app hover:bg-muted' 
                  : 'border-app/50 bg-muted/20'
              }`}
            >
              {/* Checkbox */}
              <button
                onClick={() => onToggleTodo?.(todo.id)}
                disabled={!isEditable}
                className={`w-4 h-4 border rounded flex items-center justify-center flex-shrink-0 ${
                  todo.completed 
                    ? 'bg-accent border-accent' 
                    : isEditable 
                      ? 'border-app hover:border-app'
                      : 'border-app'
                }`}
              >
                {todo.completed && (
                  <span className="text-xs" style={{color: 'var(--bg)'}}>✓</span>
                )}
              </button>
              
              {/* Todo Content */}
              {isEditable && editingTodo === todo.id ? (
                /* Edit mode */
                <div className="flex-1">
                  <input
                    value={editText}
                    onChange={(e) => onEditTextChange?.(e.target.value)}
                    className="input flex-1 h-7 text-xs w-full"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') onSaveEdit?.(todo.id);
                      if (e.key === 'Escape') onCancelEdit?.();
                    }}
                    onBlur={() => onSaveEdit?.(todo.id)}
                    autoFocus
                  />
                </div>
              ) : (
                /* View mode */
                <div className="flex-1 flex items-center justify-between min-w-0">
                  <span 
                    className={`text-xs truncate flex-1 ${
                      todo.completed 
                        ? 'line-through text-muted' 
                        : 'text-app'
                    } ${isEditable ? 'cursor-pointer' : ''}`}
                    onClick={() => isEditable && onStartEdit?.(todo.id, todo.text)}
                    title={isEditable ? "Click to edit" : todo.text}
                  >
                    {todo.text}
                  </span>
                  
                  {/* Delete button - only for editable todos */}
                  {isEditable && onDeleteTodo && (
                    <button
                      onClick={() => onDeleteTodo(todo.id)}
                      className="text-muted hover:text-red-400 text-xs p-0.5 opacity-0 group-hover:opacity-100 transition-opacity ml-2"
                      title="Delete"
                    >
                      🗑️
                    </button>
                  )}
                </div>
              )}
            </div>
          ))
        )}
        
        {/* Show remaining count for truncated lists */}
        {remainingCount > 0 && (
          <div className="text-xs text-muted text-center py-1">
            +{remainingCount} more items
          </div>
        )}
      </div>
    </div>
  );
}
