'use client';

interface MonthlyStatsCardProps {
  currentMonth: string;
}

export default function MonthlyStatsCard({ currentMonth }: MonthlyStatsCardProps) {
  return (
    <div className="bg-muted/30 border border-app rounded-xl p-8">
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl">📊</span>
        <h2 className="text-xl font-medium text-app">{currentMonth}</h2>
      </div>
      
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center">
          <div className="text-2xl mb-2">🏢</div>
          <div className="text-2xl font-medium text-app mb-1">12</div>
          <div className="text-sm text-muted">Office</div>
        </div>
        <div className="text-center">
          <div className="text-2xl mb-2">🏠</div>
          <div className="text-2xl font-medium text-app mb-1">8</div>
          <div className="text-sm text-muted">WFH</div>
        </div>
        <div className="text-center">
          <div className="text-2xl mb-2">🌴</div>
          <div className="text-2xl font-medium text-app mb-1">2</div>
          <div className="text-sm text-muted">Leave</div>
        </div>
      </div>
    </div>
  );
}
