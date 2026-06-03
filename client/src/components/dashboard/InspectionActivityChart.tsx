'use client';

import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

interface InspectionActivityChartProps {
  data: { date: string; scheduled: number; completed: number }[];
}

export default function InspectionActivityChart({ data }: InspectionActivityChartProps) {
  const hasActivity = data.some((d) => d.scheduled > 0 || d.completed > 0);

  if (!hasActivity) {
    return (
      <p className="text-sm text-[var(--text-muted)] flex items-center justify-center h-full">
        No inspection activity in this period.
      </p>
    );
  }

  const chartData = data.map((d) => ({
    date: new Date(d.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    scheduled: d.scheduled,
    completed: d.completed,
  }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={chartData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <defs>
          <linearGradient id="scheduledFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--chart-secondary)" stopOpacity={0.35} />
            <stop offset="95%" stopColor="var(--chart-secondary)" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="completedFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--chart-primary)" stopOpacity={0.35} />
            <stop offset="95%" stopColor="var(--chart-primary)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--card-border)" vertical={false} />
        <XAxis
          dataKey="date"
          tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          allowDecimals={false}
        />
        <Tooltip
          contentStyle={{
            background: 'var(--card-bg)',
            border: '1px solid var(--card-border)',
            borderRadius: '8px',
            color: 'var(--text-primary)',
          }}
        />
        <Legend wrapperStyle={{ fontSize: 12, color: 'var(--text-muted)' }} />
        <Area
          type="monotone"
          dataKey="scheduled"
          stroke="var(--chart-secondary)"
          fill="url(#scheduledFill)"
          strokeWidth={2}
        />
        <Area
          type="monotone"
          dataKey="completed"
          stroke="var(--chart-primary)"
          fill="url(#completedFill)"
          strokeWidth={2}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
