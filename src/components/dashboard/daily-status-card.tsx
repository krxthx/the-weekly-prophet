'use client';

interface DailyStatusCardProps {
  today: Date;
}

export default function DailyStatusCard({ today }: DailyStatusCardProps) {
  return (
    <div className="bg-muted/30 border border-app rounded-xl p-8">
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
      
      <div className="grid grid-cols-3 gap-4">
        <button className="p-4 border border-app rounded-xl hover:bg-muted transition-all duration-200 text-center group">
          <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">🏢</div>
          <div className="text-sm font-medium text-app">Office</div>
        </button>
        <button className="p-4 border border-app rounded-xl hover:bg-muted transition-all duration-200 text-center bg-muted group">
          <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">🏠</div>
          <div className="text-sm font-medium text-app">WFH</div>
        </button>
        <button className="p-4 border border-app rounded-xl hover:bg-muted transition-all duration-200 text-center group">
          <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">🌴</div>
          <div className="text-sm font-medium text-app">Leave</div>
        </button>
      </div>
    </div>
  );
}
