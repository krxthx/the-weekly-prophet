'use client';

import { useState } from 'react';
import { X } from 'lucide-react';

type StatusType = 'office' | 'wfh' | 'leave' | null;

interface DayEditModalProps {
  date: Date;
  initialStatus: StatusType;
  initialWorkSummary: string;
  onSave: (date: Date, status: StatusType, workSummary: string) => void;
  onClose: () => void;
}

export default function DayEditModal({ 
  date, 
  initialStatus, 
  initialWorkSummary, 
  onSave, 
  onClose 
}: DayEditModalProps) {
  const [status, setStatus] = useState<StatusType>(initialStatus);
  const [workSummary, setWorkSummary] = useState(initialWorkSummary);

  const dateString = date.toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  const handleSave = () => {
    onSave(date, status, workSummary);
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div className="bg-app border border-app rounded-xl p-6 w-full max-w-2xl mx-4 shadow-lg relative z-10 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-medium text-app">Edit Day</h2>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-muted rounded-lg text-muted hover:text-app transition-all duration-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <p className="text-sm text-muted-foreground">{dateString}</p>
          </div>

          {/* Status Selection */}
          <div>
            <label className="block text-sm font-medium text-foreground/80 mb-3">
              Work Status
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 'office' as const, label: 'Office', color: 'blue' },
                { value: 'wfh' as const, label: 'WFH', color: 'green' },
                { value: 'leave' as const, label: 'Leave', color: 'orange' }
              ].map(({ value, label, color }) => (
                <button
                  key={value}
                  onClick={() => setStatus(value)}
                  className={`p-3 rounded-lg border transition-all duration-200 text-sm font-medium ${
                    status === value
                      ? `border-${color}-200 bg-${color}-50 text-${color}-700`
                      : 'border-muted/40 bg-muted/10 text-muted-foreground hover:border-muted/60 hover:text-foreground/80'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            
            {status && (
              <button
                onClick={() => setStatus(null)}
                className="mt-2 text-xs text-muted-foreground hover:text-foreground/80 transition-colors duration-200"
              >
                Clear status
              </button>
            )}
          </div>

          {/* Work Summary */}
          <div>
            <label htmlFor="workSummary" className="block text-sm font-medium text-foreground/80 mb-3">
              Work Summary / Notes
            </label>
            <textarea
              id="workSummary"
              value={workSummary}
              onChange={(e) => setWorkSummary(e.target.value)}
              placeholder="What did you work on today? Key accomplishments, meetings, tasks completed..."
              className="w-full h-32 px-3 py-2.5 bg-muted/20 border border-muted/40 rounded-lg focus:border-muted/60 focus:outline-none resize-none text-foreground/90 placeholder-muted-foreground text-sm"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 bg-muted/40 hover:bg-muted/60 text-foreground/80 rounded-lg transition-all duration-200 text-sm font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex-1 px-4 py-2.5 bg-accent hover:bg-accent/90 text-accent-foreground rounded-lg transition-all duration-200 text-sm font-medium"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
