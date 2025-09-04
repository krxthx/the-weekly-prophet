'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { getWeeklyData, getTodosForDate } from '@/lib/firestore';

type ViewMode = 'notes' | 'tasks' | 'both';

interface DayData {
  date: string;
  status: string;
  notes: string;
  tasks: string[];
}

interface WeeklyContentProps {
  viewMode: ViewMode;
  currentWeek: Date;
}

export default function WeeklyContent({ viewMode, currentWeek }: WeeklyContentProps) {
  const { user } = useAuth();
  const [weekDays, setWeekDays] = useState<DayData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadWeeklyData = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        const weeklyEntries = await getWeeklyData(user.uid, currentWeek);
        
        // Generate all 7 days of the week (Monday to Sunday)
        const weekStart = new Date(currentWeek);
        weekStart.setDate(currentWeek.getDate() - currentWeek.getDay() + 1); // Monday
        
        const weekData: DayData[] = [];
        
        for (let i = 0; i < 7; i++) {
          const date = new Date(weekStart);
          date.setDate(weekStart.getDate() + i);
          
          // Format date string
          const dateString = date.toLocaleDateString('en-US', { 
            weekday: 'short', 
            month: 'short', 
            day: 'numeric' 
          });
          
          // Find entry for this date
          const entry = weeklyEntries.find(e => {
            const entryDate = new Date(e.date);
            return entryDate.toDateString() === date.toDateString();
          });
          
          // Get todos for this date
          const todos = await getTodosForDate(user.uid, date);
          const taskTexts = todos.map(todo => todo.text);
          
          weekData.push({
            date: dateString,
            status: entry?.status || 'Not set',
            notes: entry?.workSummary || '',
            tasks: taskTexts
          });
        }
        
        setWeekDays(weekData);
      } catch (error) {
        console.error('Error loading weekly data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadWeeklyData();
    }
  }, [user, currentWeek]);

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
          <div className="mb-3">
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

        {/* Empty state */}
        {((showNotes && !day.notes) || (showTasks && day.tasks.length === 0)) && 
         day.status === 'Not set' && (
          <div className="text-center py-4">
            <div className="text-xs text-muted">No content for this day</div>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(7)].map((_, i) => (
          <div key={i} className="border border-app rounded-lg p-4 bg-muted/20 animate-pulse">
            <div className="h-4 bg-muted rounded w-1/2 mb-3"></div>
            <div className="h-3 bg-muted rounded w-full mb-2"></div>
            <div className="h-3 bg-muted rounded w-3/4"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {weekDays.map(renderDayContent)}
    </div>
  );
}
