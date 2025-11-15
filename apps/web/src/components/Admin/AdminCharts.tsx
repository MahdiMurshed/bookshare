/**
 * AdminCharts Component
 *
 * Clean data visualizations for the admin dashboard
 * Uses recharts with neutral color palette matching the monochrome theme
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

// Neutral color palette - grays and primary only
const CHART_COLORS = {
  primary: 'hsl(var(--primary))', // primary color
  secondary: 'hsl(var(--muted-foreground))', // muted gray
  gray1: '#71717a', // zinc-500
  gray2: '#52525b', // zinc-600
  gray3: '#3f3f46', // zinc-700
  gray4: '#27272a', // zinc-800
  gray5: '#a1a1aa', // zinc-400
  gray6: '#d4d4d8', // zinc-300
};

const PIE_COLORS = [
  CHART_COLORS.primary,
  CHART_COLORS.gray1,
  CHART_COLORS.gray2,
  CHART_COLORS.gray3,
  CHART_COLORS.gray4,
  CHART_COLORS.gray5,
  CHART_COLORS.gray6,
  CHART_COLORS.secondary,
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
      <Card className="p-6 border-2">
        <h3 className="text-lg font-semibold mb-4">Genre Distribution</h3>
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
    <Card className="p-6 border-2 hover:border-primary/50 hover:shadow-lg transition-all duration-300">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-foreground">Genre Distribution</h3>
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
      <Card className="p-6 border-2">
        <h3 className="text-lg font-semibold mb-4">Borrow Activity</h3>
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
    <Card className="p-6 border-2 hover:border-primary/50 hover:shadow-lg transition-all duration-300">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-foreground">Borrow Activity</h3>
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
          <Bar dataKey="approvals" fill={CHART_COLORS.gray1} name="Approvals" />
          <Bar dataKey="returns" fill={CHART_COLORS.gray2} name="Returns" />
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
      <Card className="p-6 border-2">
        <h3 className="text-lg font-semibold mb-4">User Growth</h3>
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
    <Card className="p-6 border-2 hover:border-primary/50 hover:shadow-lg transition-all duration-300">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-foreground">User Growth</h3>
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
            stroke={CHART_COLORS.gray1}
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
