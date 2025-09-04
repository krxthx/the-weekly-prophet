'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Copy } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { getDailyEntry, saveDailyEntry, getTodosForDate } from '@/lib/firestore';
import DayEditModal from './day-edit-modal';

type StatusType = 'office' | 'wfh' | 'leave' | null;
type ViewMode = 'notes' | 'tasks' | 'both';

interface DayData {
  date: Date;
  status: StatusType;
  workSummary: string;
  todos: Array<{ id: string; text: string; completed: boolean; }>;
}

interface CalendarViewProps {
  currentDate: Date;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
  onToday: () => void;
}

export default function CalendarView({ 
  currentDate, 
  onPreviousMonth, 
  onNextMonth, 
  onToday 
}: CalendarViewProps) {
  const { user } = useAuth();
  const [monthData, setMonthData] = useState<Record<string, DayData>>({});
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('both');
  const [loading, setLoading] = useState(true);
  const [copySuccess, setCopySuccess] = useState<string | null>(null);

  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  
  // Helper functions
  const formatDateKey = useCallback((date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }, []);

  const isCurrentMonth = (date: Date) => date.getMonth() === currentDate.getMonth();
  
  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const getStatusColor = (status: StatusType) => {
    switch (status) {
      case 'office': return 'bg-blue-400/60';
      case 'wfh': return 'bg-green-400/60';
      case 'leave': return 'bg-orange-400/60';
      default: return 'bg-gray-300/60';
    }
  };

  const getStatusText = (status: StatusType) => {
    switch (status) {
      case 'office': return 'Office';
      case 'wfh': return 'WFH';
      case 'leave': return 'Leave';
      default: return '';
    }
  };

  // Generate calendar days for rendering
  const calendarDays = useMemo(() => {
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const startCalendar = new Date(firstDayOfMonth);
    startCalendar.setDate(startCalendar.getDate() - firstDayOfMonth.getDay()); // Start from Sunday
    
    const days: Date[] = [];
    const currentCalendarDay = new Date(startCalendar);
    
    // Generate 42 days (6 weeks) for calendar grid
    for (let i = 0; i < 42; i++) {
      days.push(new Date(currentCalendarDay));
      currentCalendarDay.setDate(currentCalendarDay.getDate() + 1);
    }
    
    return days;
  }, [currentDate]);
  
  // Load month data
  useEffect(() => {
    const loadMonthData = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        
        const data: Record<string, DayData> = {};
        
        // Process data in batches to improve performance
        const batchSize = 7; // Process a week at a time
        for (let i = 0; i < calendarDays.length; i += batchSize) {
          const batch = calendarDays.slice(i, i + batchSize);
          
          // Create promises for all days in the batch
          const batchPromises = batch.map(async (day) => {
            const dayKey = formatDateKey(day);
            
            const [dailyEntry, todos] = await Promise.all([
              getDailyEntry(user.uid, day),
              getTodosForDate(user.uid, day)
            ]);
            
            return {
              key: dayKey,
              data: {
                date: day,
                status: dailyEntry?.status || null,
                workSummary: dailyEntry?.workSummary || '',
                todos
              }
            };
          });
          
          // Wait for all promises in this batch to resolve
          const results = await Promise.all(batchPromises);
          
          // Add results to data object
          results.forEach(result => {
            data[result.key] = result.data;
          });
        }
        
        setMonthData(data);
      } catch (error) {
        console.error('Error loading month data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadMonthData();
    }

    // Listen for data updates from other components
    const handleDataUpdate = () => {
      if (user) {
        loadMonthData();
      }
    };

    window.addEventListener('daily-entry-updated', handleDataUpdate);

    return () => {
      window.removeEventListener('daily-entry-updated', handleDataUpdate);
    };
  }, [user, currentDate, calendarDays, formatDateKey]);

  // Copy day content to clipboard
  const copyDayContent = async (date: Date) => {
    const dayKey = formatDateKey(date);
    const dayData = monthData[dayKey];
    
    if (!dayData) return;
    
    const showNotes = viewMode === 'notes' || viewMode === 'both';
    const showTasks = viewMode === 'tasks' || viewMode === 'both';
    
    const dateStr = date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
    
    let content = `${dateStr}`;
    if (dayData.status) {
      content += ` (${getStatusText(dayData.status)})`;
    }
    content += '\n\n';
    
    if (showNotes && dayData.workSummary) {
      content += `Notes:\n${dayData.workSummary}\n\n`;
    }
    
    if (showTasks && dayData.todos.length > 0) {
      content += `Tasks:\n${dayData.todos.map(todo => `• ${todo.text}`).join('\n')}\n`;
    }
    
    try {
      await navigator.clipboard.writeText(content.trim());
      setCopySuccess('Copied!');
      setTimeout(() => setCopySuccess(null), 2000);
    } catch (error) {
      console.error('Failed to copy content:', error);
      setCopySuccess('Copy failed');
      setTimeout(() => setCopySuccess(null), 2000);
    }
  };

  // Update day data
  const handleDayUpdate = async (date: Date, status: StatusType, workSummary: string) => {
    if (!user) return;
    
    try {
      const dateStr = formatDateKey(date);
      
      await saveDailyEntry(user.uid, {
        date: dateStr,
        status: status || undefined,
        workSummary
      });
      
      // Update local state
      const dayKey = formatDateKey(date);
      setMonthData(prev => ({
        ...prev,
        [dayKey]: {
          ...prev[dayKey],
          status,
          workSummary
        }
      }));
      
      // Notify other components of the update
      window.dispatchEvent(new CustomEvent('daily-entry-updated', { 
        detail: { date: dateStr, status, workSummary } 
      }));
    } catch (error) {
      console.error('Error updating day:', error);
    }
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className="space-y-6" aria-busy="true" aria-label="Loading calendar">
        <div className="flex items-center justify-between">
          <div className="h-8 bg-muted rounded w-48 animate-pulse"></div>
          <div className="flex gap-3">
            <div className="h-8 w-20 bg-muted rounded animate-pulse"></div>
            <div className="h-8 w-8 bg-muted rounded animate-pulse"></div>
            <div className="h-8 w-8 bg-muted rounded animate-pulse"></div>
          </div>
        </div>
        <div className="bg-muted/30 rounded-lg ">
          <div className="grid grid-cols-7 gap-0">
            {[...Array(42)].map((_, i) => (
              <div key={i} className="h-24 bg-muted rounded animate-pulse m-1"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0">
        <h1 className="text-xl sm:text-2xl font-semibold text-app">{monthName}</h1>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* View Mode Toggle */}
          <div className="flex bg-muted rounded-md p-0.5" role="group" aria-label="View mode options">
            {(['notes', 'tasks', 'both'] as ViewMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-2 sm:px-2.5 py-1 text-xs rounded transition-all duration-200 ${
                  viewMode === mode
                    ? 'bg-app text-muted shadow-sm'
                    : 'text-muted hover:text-app'
                }`}
                aria-pressed={viewMode === mode}
                aria-label={`Show ${mode}`}
              >
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </button>
            ))}
          </div>
          
          <button
            onClick={onToday}
            className="px-2 sm:px-2.5 py-1 text-xs sm:text-sm bg-muted hover:bg-muted/80 rounded text-app transition-all duration-200"
            aria-label="Go to today"
          >
            Today
          </button>
          <button
            onClick={onPreviousMonth}
            className="p-1.5 hover:bg-muted rounded text-muted hover:text-app transition-all duration-200"
            aria-label="Previous month"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={onNextMonth}
            className="p-1.5 hover:bg-muted rounded text-muted hover:text-app transition-all duration-200"
            aria-label="Next month"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-muted/30 rounded-lg overflow-x-auto">
        {/* Day headers */}
        <div className="grid grid-cols-7 gap-0 mb-2 min-w-[640px]" role="row">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="p-2 text-center text-xs font-medium text-muted" role="columnheader">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar days */}
        <div className="grid grid-cols-7 gap-1 min-w-[640px]" role="grid">
          {calendarDays.map(date => {
            const dayKey = formatDateKey(date);
            const dayData = monthData[dayKey];
            const isCurrentMonthDay = isCurrentMonth(date);
            const isTodayDay = isToday(date);
            const dateLabel = date.toLocaleDateString('en-US', { 
              weekday: 'long', 
              month: 'long', 
              day: 'numeric' 
            });
            
            return (
              <div
                key={dayKey}
                className={`h-20 sm:h-24 p-1 sm:p-2 m-0.5 sm:m-1 ${isTodayDay ? 'bg-gray-900' : isCurrentMonthDay ? 'bg-muted' : 'bg-muted/80'} rounded-md transition-all duration-200 cursor-pointer group relative hover:bg-muted/50 ${
                  isCurrentMonthDay 
                    ? 'text-app' 
                    : 'text-muted/60'
                }`}
                onClick={() => setSelectedDay(date)}
                role="gridcell"
                aria-label={dateLabel}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setSelectedDay(date);
                  }
                }}
              >
                <div className="h-full flex flex-col">
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-xs sm:text-sm ${
                      isCurrentMonthDay 
                        ? isTodayDay 
                          ? 'text-accent font-medium' 
                          : 'text-app' 
                        : 'text-muted/60'
                    }`}>
                      {date.getDate()}
                    </span>
                    
                    {/* Copy button */}
                    {isCurrentMonthDay && (dayData?.status || dayData?.workSummary || (dayData?.todos?.length ?? 0) > 0) && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          copyDayContent(date);
                        }}
                        className="opacity-0 group-hover:opacity-60 p-0.5 hover:bg-muted rounded text-muted hover:text-app transition-all duration-200"
                        title="Copy day content"
                        aria-label={`Copy content for ${dateLabel}`}
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                  
                  {/* Status indicator */}
                  {dayData?.status && (
                    <div className="hidden sm:flex items-center gap-1.5 mb-1">
                      <div 
                        className={`w-1.5 h-1.5 rounded-full ${getStatusColor(dayData.status)}`}
                        aria-hidden="true"
                      ></div>
                      <span className="text-[9px] text-muted font-medium uppercase tracking-wide">
                        {getStatusText(dayData.status)}
                      </span>
                    </div>
                  )}
                  
                  {/* Mobile status indicator (dot only) */}
                  {dayData?.status && (
                    <div className="sm:hidden flex mb-1">
                      <div 
                        className={`w-2 h-2 rounded-full ${getStatusColor(dayData.status)}`}
                        aria-hidden="true"
                        title={getStatusText(dayData.status)}
                      ></div>
                    </div>
                  )}
                  
                  {/* Content indicators */}
                  <div className="flex-1 flex flex-col justify-end space-y-0.5">
                    {dayData?.workSummary && (viewMode === 'notes' || viewMode === 'both') && (
                      <div 
                        className="w-1 h-1 bg-muted rounded-full" 
                        aria-hidden="true"
                        title="Has notes"
                      ></div>
                    )}
                    {(dayData?.todos?.length ?? 0) > 0 && (viewMode === 'tasks' || viewMode === 'both') && (
                      <div className="text-[9px] text-muted font-medium">
                        {dayData?.todos?.length} task{(dayData?.todos?.length ?? 0) !== 1 ? 's' : ''}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Copy success notification */}
      {copySuccess && (
        <div 
          className="fixed bottom-4 right-4 bg-app text-white px-3 py-2 rounded shadow-lg"
          role="status"
          aria-live="polite"
        >
          {copySuccess}
        </div>
      )}

      {/* Day Edit Modal */}
      {selectedDay && (
        <DayEditModal
          date={selectedDay}
          initialStatus={monthData[formatDateKey(selectedDay)]?.status || null}
          initialWorkSummary={monthData[formatDateKey(selectedDay)]?.workSummary || ''}
          onSave={handleDayUpdate}
          onClose={() => setSelectedDay(null)}
        />
      )}
    </div>
  );
}
