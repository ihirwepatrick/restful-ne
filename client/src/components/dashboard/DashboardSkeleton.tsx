'use client';

export default function DashboardSkeleton() {
  return (
    <div className="animate-pulse space-y-8">
      <div className="h-20 rounded-xl bg-[var(--card-border)]/40" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 rounded-xl bg-[var(--card-border)]/40" />
        ))}
      </div>
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="h-72 rounded-xl bg-[var(--card-border)]/40" />
        <div className="h-72 rounded-xl bg-[var(--card-border)]/40" />
      </div>
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="h-80 rounded-xl bg-[var(--card-border)]/40" />
        <div className="h-80 rounded-xl bg-[var(--card-border)]/40" />
      </div>
    </div>
  );
}
