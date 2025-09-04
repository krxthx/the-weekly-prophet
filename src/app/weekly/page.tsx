'use client';

import { useState } from 'react';
import Header from '@/components/header';
import WeekNavigation from '@/components/weekly/week-navigation';
import ViewToggle from '@/components/weekly/view-toggle';
import WeeklyContent from '@/components/weekly/weekly-content';

type ViewMode = 'notes' | 'tasks' | 'both';

export default function WeeklyPage() {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('both');

  const handlePreviousWeek = () => {
    const newWeek = new Date(currentWeek);
    newWeek.setDate(currentWeek.getDate() - 7);
    setCurrentWeek(newWeek);
  };

  const handleNextWeek = () => {
    const newWeek = new Date(currentWeek);
    newWeek.setDate(currentWeek.getDate() + 7);
    setCurrentWeek(newWeek);
  };

  return (
    <div className="min-h-screen bg-app">
      <Header />
      
      <div className="max-w-7xl mx-auto px-8 py-12">
        <WeekNavigation 
          currentWeek={currentWeek}
          onPreviousWeek={handlePreviousWeek}
          onNextWeek={handleNextWeek}
        />
        
        <ViewToggle 
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />
        
        <WeeklyContent viewMode={viewMode} />
      </div>
    </div>
  );
}
