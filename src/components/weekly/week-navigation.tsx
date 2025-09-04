'use client';

interface WeekNavigationProps {
  currentWeek: Date;
  onPreviousWeek: () => void;
  onNextWeek: () => void;
}

export default function WeekNavigation({ 
  currentWeek, 
  onPreviousWeek, 
  onNextWeek 
}: WeekNavigationProps) {
  const getWeekRange = (date: Date) => {
    const start = new Date(date);
    start.setDate(date.getDate() - date.getDay());
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    
    return {
      start: start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      end: end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    };
  };

  const weekRange = getWeekRange(currentWeek);

  return (
    <div className="flex items-center justify-between mb-8">
      <div>
        <h1 className="text-2xl font-medium text-app mb-1">Weekly View</h1>
        <p className="text-muted">
          {weekRange.start} - {weekRange.end}
        </p>
      </div>
      
      <div className="flex items-center gap-2">
        <button 
          onClick={onPreviousWeek}
          className="btn btn-outline p-2"
          title="Previous week"
        >
          ←
        </button>
        <button 
          onClick={onNextWeek}
          className="btn btn-outline p-2"
          title="Next week"
        >
          →
        </button>
      </div>
    </div>
  );
}
