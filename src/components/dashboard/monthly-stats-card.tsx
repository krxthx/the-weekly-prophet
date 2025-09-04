'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { getMonthlyStats } from '@/lib/firestore';

interface MonthlyStatsCardProps {
  currentMonth: string;
}

interface MonthlyStats {
  totalDays: number;
  officeDays: number;
  wfhDays: number;
  leaveDays: number;
}

export default function MonthlyStatsCard({ currentMonth }: MonthlyStatsCardProps) {
  const { user } = useAuth();
  const [stats, setStats] = useState<MonthlyStats>({
    totalDays: 0,
    officeDays: 0,
    wfhDays: 0,
    leaveDays: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMonthlyStats = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        const now = new Date();
        const monthStats = await getMonthlyStats(user.uid, now.getMonth() + 1, now.getFullYear());
        setStats(monthStats);
      } catch (error) {
        console.error('Error loading monthly stats:', error);
      } finally {
        setLoading(false);
      }
    };

    loadMonthlyStats();

    // Listen for data updates from other components
    const handleDataUpdate = () => {
      loadMonthlyStats();
    };

    window.addEventListener('daily-entry-updated', handleDataUpdate);

    return () => {
      window.removeEventListener('daily-entry-updated', handleDataUpdate);
    };
  }, [user, currentMonth]);

  if (loading) {
    return (
      <div className="bg-muted/30 border border-app rounded-xl p-8">
        <div className="animate-pulse">
          <div className="h-6 bg-muted rounded mb-6"></div>
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="text-center">
                <div className="h-8 bg-muted rounded mb-2"></div>
                <div className="h-6 bg-muted rounded mb-1"></div>
                <div className="h-4 bg-muted rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-muted/30 border border-app rounded-xl p-8">
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl">📊</span>
        <h2 className="text-xl font-medium text-app">{currentMonth}</h2>
      </div>
      
      {stats.totalDays === 0 ? (
        <div className="text-center py-8">
          <div className="text-muted text-sm mb-2">No work data for this month</div>
          <div className="text-xs text-muted">Start logging your daily status to see statistics</div>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl mb-2">🏢</div>
            <div className="text-2xl font-medium text-app mb-1">{stats.officeDays}</div>
            <div className="text-sm text-muted">Office</div>
          </div>
          <div className="text-center">
            <div className="text-2xl mb-2">🏠</div>
            <div className="text-2xl font-medium text-app mb-1">{stats.wfhDays}</div>
            <div className="text-sm text-muted">WFH</div>
          </div>
          <div className="text-center">
            <div className="text-2xl mb-2">🌴</div>
            <div className="text-2xl font-medium text-app mb-1">{stats.leaveDays}</div>
            <div className="text-sm text-muted">Leave</div>
          </div>
        </div>
      )}
    </div>
  );
}
