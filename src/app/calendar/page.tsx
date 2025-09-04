'use client';

import { useState } from 'react';
import Header from '@/components/header';
import CalendarView from '@/components/calendar/calendar-view';
import ProtectedRoute from '@/components/protected-route';

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());

  const handlePreviousMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() - 1);
    setCurrentDate(newDate);
  };

  const handleNextMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + 1);
    setCurrentDate(newDate);
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-app">
        <Header />
        
        <div className="max-w-7xl mx-auto px-8 py-12">
          <CalendarView 
            currentDate={currentDate}
            onPreviousMonth={handlePreviousMonth}
            onNextMonth={handleNextMonth}
            onToday={handleToday}
          />
        </div>
      </div>
    </ProtectedRoute>
  );
}
