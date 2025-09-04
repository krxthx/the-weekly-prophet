'use client';

type ViewMode = 'notes' | 'tasks' | 'both';

interface ViewToggleProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

export default function ViewToggle({ viewMode, onViewModeChange }: ViewToggleProps) {
  return (
    <div className="flex items-center gap-2 mb-6">
      <span className="text-sm text-muted mr-2">View:</span>
      <button
        onClick={() => onViewModeChange('notes')}
        className={`btn text-sm px-3 py-1 ${
          viewMode === 'notes' 
            ? 'bg-accent text-bg border-accent' 
            : 'btn-outline'
        }`}
      >
        Notes Only
      </button>
      <button
        onClick={() => onViewModeChange('tasks')}
        className={`btn text-sm px-3 py-1 ${
          viewMode === 'tasks' 
            ? 'bg-accent text-bg border-accent' 
            : 'btn-outline'
        }`}
      >
        Tasks Only
      </button>
      <button
        onClick={() => onViewModeChange('both')}
        className={`btn text-sm px-3 py-1 ${
          viewMode === 'both' 
            ? 'bg-accent text-bg border-accent' 
            : 'btn-outline'
        }`}
      >
        Both
      </button>
    </div>
  );
}
