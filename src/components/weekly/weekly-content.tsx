'use client';

type ViewMode = 'notes' | 'tasks' | 'both';

interface DayData {
  date: string;
  status: string;
  notes: string;
  tasks: string[];
}

interface WeeklyContentProps {
  viewMode: ViewMode;
}

export default function WeeklyContent({ viewMode }: WeeklyContentProps) {
  // Mock data for demonstration
  const weekDays: DayData[] = [
    { 
      date: 'Mon, Sep 2', 
      status: 'Office', 
      notes: 'Sprint planning meeting, code review with team',
      tasks: ['Review PR #123', 'Update documentation', 'Team standup']
    },
    { 
      date: 'Tue, Sep 3', 
      status: 'WFH', 
      notes: 'Focused development day, implemented new feature',
      tasks: ['Implement user authentication', 'Write unit tests', 'Deploy to staging']
    },
    { 
      date: 'Wed, Sep 4', 
      status: 'Office', 
      notes: 'Client meeting, design review session',
      tasks: ['Client presentation', 'Design mockups', 'Database optimization']
    },
    { 
      date: 'Thu, Sep 5', 
      status: 'WFH', 
      notes: 'Bug fixes and testing',
      tasks: ['Fix critical bug', 'QA testing', 'Code refactoring']
    },
    { 
      date: 'Fri, Sep 6', 
      status: 'Office', 
      notes: 'Sprint retrospective, team building',
      tasks: ['Sprint review', 'Team retrospective', 'Plan next sprint']
    }
  ];

  const copyDayContent = (day: DayData) => {
    const showNotes = viewMode === 'notes' || viewMode === 'both';
    const showTasks = viewMode === 'tasks' || viewMode === 'both';
    
    let content = `${day.date} (${day.status})\n\n`;
    
    if (showNotes && day.notes) {
      content += `Notes:\n${day.notes}\n\n`;
    }
    
    if (showTasks && day.tasks && day.tasks.length > 0) {
      content += `Tasks:\n${day.tasks.map(task => `• ${task}`).join('\n')}\n`;
    }
    
    navigator.clipboard.writeText(content.trim());
  };

  const renderDayContent = (day: DayData) => {
    const showNotes = viewMode === 'notes' || viewMode === 'both';
    const showTasks = viewMode === 'tasks' || viewMode === 'both';

    return (
      <div key={day.date} className="border border-app rounded-lg p-4 bg-muted/20 group relative">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-medium text-app">{day.date}</h3>
          <div className="flex items-center gap-2">
            <span className="text-xs px-2 py-1 bg-muted rounded-full text-muted">
              {day.status}
            </span>
            <button
              onClick={() => copyDayContent(day)}
              className="p-1 hover:bg-muted rounded text-muted hover:text-app transition-colors"
              title="Copy day content"
            >
              📋
            </button>
          </div>
        </div>
        
        {showNotes && day.notes && (
          <div className="mb-3">
            <h4 className="text-xs text-muted mb-1">Notes:</h4>
            <p className="text-sm text-app">{day.notes}</p>
          </div>
        )}
        
        {showTasks && day.tasks && day.tasks.length > 0 && (
          <div>
            <h4 className="text-xs text-muted mb-2">Tasks:</h4>
            <ul className="space-y-1">
              {day.tasks.map((task: string, index: number) => (
                <li key={index} className="text-sm text-app flex items-center gap-2">
                  <span className="w-1 h-1 bg-accent rounded-full"></span>
                  {task}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {weekDays.map(renderDayContent)}
    </div>
  );
}
