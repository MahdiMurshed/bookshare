/**
 * AdminCharts Component
 *
 * Beautiful data visualizations for the admin dashboard
 * Uses recharts with custom styling matching the warm amber/orange theme
 */

import { useQuery } from '@tanstack/react-query';
import {
  getGenreDistribution,
  getBorrowActivityData,
  getUserGrowthData,
} from '@repo/api-client';
import { Card } from '@repo/ui/components/card';
import { Skeleton } from '@repo/ui/components/skeleton';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

// Custom colors matching the warm amber/orange theme
const CHART_COLORS = {
  primary: '#f97316', // orange-500
  secondary: '#f59e0b', // amber-500
  tertiary: '#eab308', // yellow-500
  accent1: '#ef4444', // red-500
  accent2: '#10b981', // emerald-500
  accent3: '#3b82f6', // blue-500
  accent4: '#8b5cf6', // violet-500
  accent5: '#ec4899', // pink-500
};

const PIE_COLORS = [
  CHART_COLORS.primary,
  CHART_COLORS.secondary,
  CHART_COLORS.tertiary,
  CHART_COLORS.accent1,
  CHART_COLORS.accent2,
  CHART_COLORS.accent3,
  CHART_COLORS.accent4,
  CHART_COLORS.accent5,
];

function ChartSkeleton() {
  return (
    <Card className="p-6">
      <Skeleton className="h-6 w-48 mb-6" />
      <Skeleton className="h-64 w-full" />
    </Card>
  );
}

function GenreDistributionChart() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-genre-distribution'],
    queryFn: getGenreDistribution,
  });

  if (error) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-serif font-semibold mb-4">Genre Distribution</h3>
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
          <p className="text-sm text-destructive">Failed to load chart</p>
        </div>
      </Card>
    );
  }

  if (isLoading || !data) {
    return <ChartSkeleton />;
  }

  return (
    <Card className="p-6 hover:shadow-lg transition-shadow duration-300">
      <div className="mb-6">
        <h3 className="text-lg font-serif font-semibold text-foreground">Genre Distribution</h3>
        <p className="text-sm text-muted-foreground mt-1">Books by genre category</p>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data as any}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={(entry: any) =>
              `${entry.genre}: ${((entry.percent ?? 0) * 100).toFixed(0)}%`
            }
            outerRadius={100}
            fill="#8884d8"
            dataKey="count"
          >
            {data.map((_, index) => (
              <Cell
                key={`cell-${index}`}
                fill={PIE_COLORS[index % PIE_COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
              fontSize: '14px',
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </Card>
  );
}

function BorrowActivityChart() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-borrow-activity'],
    queryFn: getBorrowActivityData,
  });

  if (error) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-serif font-semibold mb-4">Borrow Activity</h3>
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
          <p className="text-sm text-destructive">Failed to load chart</p>
        </div>
      </Card>
    );
  }

  if (isLoading || !data) {
    return <ChartSkeleton />;
  }

  return (
    <Card className="p-6 hover:shadow-lg transition-shadow duration-300">
      <div className="mb-6">
        <h3 className="text-lg font-serif font-semibold text-foreground">Borrow Activity</h3>
        <p className="text-sm text-muted-foreground mt-1">Last 30 days</p>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis
            dataKey="date"
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
            tickFormatter={(value) => {
              const date = new Date(value);
              return `${date.getMonth() + 1}/${date.getDate()}`;
            }}
          />
          <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
              fontSize: '14px',
            }}
            labelFormatter={(value) => {
              const date = new Date(value);
              return date.toLocaleDateString();
            }}
          />
          <Legend wrapperStyle={{ fontSize: '14px' }} />
          <Bar dataKey="requests" fill={CHART_COLORS.primary} name="Requests" />
          <Bar dataKey="approvals" fill={CHART_COLORS.accent2} name="Approvals" />
          <Bar dataKey="returns" fill={CHART_COLORS.accent3} name="Returns" />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}

function UserGrowthChart() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-user-growth'],
    queryFn: getUserGrowthData,
  });

  if (error) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-serif font-semibold mb-4">User Growth</h3>
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
          <p className="text-sm text-destructive">Failed to load chart</p>
        </div>
      </Card>
    );
  }

  if (isLoading || !data) {
    return <ChartSkeleton />;
  }

  return (
    <Card className="p-6 hover:shadow-lg transition-shadow duration-300">
      <div className="mb-6">
        <h3 className="text-lg font-serif font-semibold text-foreground">User Growth</h3>
        <p className="text-sm text-muted-foreground mt-1">Last 30 days</p>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis
            dataKey="date"
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
            tickFormatter={(value) => {
              const date = new Date(value);
              return `${date.getMonth() + 1}/${date.getDate()}`;
            }}
          />
          <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
              fontSize: '14px',
            }}
            labelFormatter={(value) => {
              const date = new Date(value);
              return date.toLocaleDateString();
            }}
          />
          <Legend wrapperStyle={{ fontSize: '14px' }} />
          <Line
            type="monotone"
            dataKey="totalUsers"
            stroke={CHART_COLORS.primary}
            strokeWidth={3}
            name="Total Users"
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line
            type="monotone"
            dataKey="newUsers"
            stroke={CHART_COLORS.accent2}
            strokeWidth={2}
            strokeDasharray="5 5"
            name="New Users"
            dot={{ r: 3 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
}

export function AdminCharts() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <div className="lg:col-span-2">
        <BorrowActivityChart />
      </div>
      <UserGrowthChart />
      <GenreDistributionChart />
    </div>
  );
}
