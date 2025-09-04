'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { getDailyEntry, saveDailyEntry } from '@/lib/firestore';

interface DailyStatusCardProps {
  today: Date;
}

type StatusType = 'office' | 'wfh' | 'leave';

export default function DailyStatusCard({ today }: DailyStatusCardProps) {
  const { user } = useAuth();
  const [selectedStatus, setSelectedStatus] = useState<StatusType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTodayStatus = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        const entry = await getDailyEntry(user.uid, today);
        if (entry?.status) {
          setSelectedStatus(entry.status);
        } else {
          setSelectedStatus(null);
        }
      } catch (error) {
        console.error('Error loading daily status:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTodayStatus();

    // Listen for data updates from other components
    const handleDataUpdate = () => {
      loadTodayStatus();
    };

    window.addEventListener('daily-entry-updated', handleDataUpdate);
    window.addEventListener('focus', handleDataUpdate); // Reload when tab becomes active

    return () => {
      window.removeEventListener('daily-entry-updated', handleDataUpdate);
      window.removeEventListener('focus', handleDataUpdate);
    };
  }, [user, today]);

  const handleStatusChange = async (status: StatusType) => {
    if (!user) return;
    
    try {
      setSelectedStatus(status);
      
      // Use timezone-safe date formatting
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
      
      await saveDailyEntry(user.uid, {
        date: dateStr,
        status,
        notes: '',
        workSummary: ''
      });
      
      // Notify other components of the update
      window.dispatchEvent(new CustomEvent('daily-entry-updated', { 
        detail: { date: dateStr, status } 
      }));
    } catch (error) {
      console.error('Error saving status:', error);
      // Revert on error
      try {
        const entry = await getDailyEntry(user.uid, today);
        setSelectedStatus(entry?.status || null);
      } catch (revertError) {
        console.error('Error reverting status:', revertError);
      }
    }
  };

  if (loading) {
    return (
      <div className="bg-muted/30 border border-app rounded-xl p-8">
        <div className="animate-pulse">
          <div className="h-6 bg-muted rounded mb-6"></div>
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-muted rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-muted/30 border border-app rounded-xl p-8 h-full flex flex-col">
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl">📅</span>
        <h2 className="text-xl font-medium text-app">Today</h2>
        <span className="text-sm text-muted ml-auto">
          {today.toLocaleDateString('en-US', { 
            weekday: 'short', 
            month: 'short', 
            day: 'numeric' 
          })}
        </span>
      </div>
      
      {!selectedStatus && (
        <div className="text-center py-4 mb-4">
          <div className="text-muted text-sm mb-2">No status set for today</div>
          <div className="text-xs text-muted">Select your work status below</div>
        </div>
      )}
      
      <div className="grid grid-cols-3 gap-4 mt-auto">
        <button 
          onClick={() => handleStatusChange('office')}
          className={`p-4 border border-app rounded-xl hover:bg-muted transition-all duration-200 text-center group ${
            selectedStatus === 'office' ? 'bg-muted' : ''
          }`}
        >
          <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">🏢</div>
          <div className="text-sm font-medium text-app">Office</div>
        </button>
        <button 
          onClick={() => handleStatusChange('wfh')}
          className={`p-4 border border-app rounded-xl hover:bg-muted transition-all duration-200 text-center group ${
            selectedStatus === 'wfh' ? 'bg-muted' : ''
          }`}
        >
          <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">🏠</div>
          <div className="text-sm font-medium text-app">WFH</div>
        </button>
        <button 
          onClick={() => handleStatusChange('leave')}
          className={`p-4 border border-app rounded-xl hover:bg-muted transition-all duration-200 text-center group ${
            selectedStatus === 'leave' ? 'bg-muted' : ''
          }`}
        >
          <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">🌴</div>
          <div className="text-sm font-medium text-app">Leave</div>
        </button>
      </div>
    </div>
  );
}
