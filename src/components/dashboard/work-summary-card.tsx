'use client';

interface WorkSummaryCardProps {
  todayUpdate: string;
  setTodayUpdate: (value: string) => void;
}

export default function WorkSummaryCard({ todayUpdate, setTodayUpdate }: WorkSummaryCardProps) {
  return (
    <div className="bg-muted/30 border border-app rounded-xl p-8">
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl">📝</span>
        <h2 className="text-xl font-medium text-app">Today&apos;s Work Summary</h2>
      </div>
      
      <div className="space-y-6">
        <div>
          <h4 className="text-sm font-medium text-app mb-3">What did you accomplish today?</h4>
          <textarea 
            value={todayUpdate}
            onChange={(e) => setTodayUpdate(e.target.value)}
            placeholder="Summarize your key accomplishments, meetings, or important work from today..."
            className="input resize-none"
            rows={5}
            style={{ height: 'auto', minHeight: '120px' }}
          />
        </div>
        
        <div className="text-sm text-muted bg-muted/20 p-4 rounded-lg border border-app/30">
          💡 This will be used for your weekly updates and can be copied later
        </div>
      </div>
    </div>
  );
}
