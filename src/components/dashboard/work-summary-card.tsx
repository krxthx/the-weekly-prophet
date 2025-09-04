'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { getDailyEntry, saveDailyEntry } from '@/lib/firestore';

interface WorkSummaryCardProps {
  today: Date;
}

export default function WorkSummaryCard({ today }: WorkSummaryCardProps) {
  const { user } = useAuth();
  const [workSummary, setWorkSummary] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadWorkSummary = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        const entry = await getDailyEntry(user.uid, today);
        if (entry?.workSummary) {
          setWorkSummary(entry.workSummary);
        }
      } catch (error) {
        console.error('Error loading work summary:', error);
      } finally {
        setLoading(false);
      }
    };

    loadWorkSummary();
  }, [user, today]);

  const saveWorkSummary = useCallback(async (summary: string) => {
    if (!user) return;
    
    try {
      setSaving(true);
      await saveDailyEntry(user.uid, {
        date: today.toISOString().split('T')[0],
        workSummary: summary,
        notes: '',
        status: 'wfh' // Default status if not set
      });
    } catch (error) {
      console.error('Error saving work summary:', error);
    } finally {
      setSaving(false);
    }
  }, [user, today]);

  const handleTextChange = (value: string) => {
    setWorkSummary(value);
    // Debounced save - save after user stops typing for 1 second
    const timeoutId = setTimeout(() => {
      saveWorkSummary(value);
    }, 1000);
    
    return () => clearTimeout(timeoutId);
  };

  if (loading) {
    return (
      <div className="bg-muted/30 border border-app rounded-xl p-8">
        <div className="animate-pulse">
          <div className="h-6 bg-muted rounded mb-6"></div>
          <div className="h-32 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-muted/30 border border-app rounded-xl p-8">
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl">📝</span>
        <h2 className="text-xl font-medium text-app">Today&apos;s Work Summary</h2>
        {saving && (
          <div className="text-xs text-muted ml-auto">Saving...</div>
        )}
      </div>
      
      <div className="space-y-6">
        <div>
          <h4 className="text-sm font-medium text-app mb-3">What did you accomplish today?</h4>
          <textarea 
            value={workSummary}
            onChange={(e) => handleTextChange(e.target.value)}
            placeholder="Summarize your key accomplishments, meetings, or important work from today..."
            className="input resize-none"
            rows={5}
            style={{ height: 'auto', minHeight: '120px' }}
          />
        </div>m
      </div>
    </div>
  );
}
