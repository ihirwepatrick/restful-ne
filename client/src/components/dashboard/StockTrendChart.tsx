'use client';

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

interface StockTrendChartProps {
  data: { snapshotDate: string; totalInStock: number }[];
}

export default function StockTrendChart({ data }: StockTrendChartProps) {
  if (data.length === 0) {
    return (
      <p className="text-sm text-[var(--text-muted)] flex items-center justify-center h-full">
        No stock history yet. Snapshots are recorded daily.
      </p>
    );
  }

  const chartData = data.map((d) => ({
    date: new Date(d.snapshotDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    stock: d.totalInStock,
  }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={chartData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
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
        <Bar dataKey="stock" fill="var(--chart-primary)" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
