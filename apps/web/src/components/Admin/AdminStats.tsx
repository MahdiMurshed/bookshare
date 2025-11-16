/**
 * AdminStats Component
 *
 * Clean stat cards for the admin dashboard
 * Features minimal design with simple borders and subtle interactions
 */

import { useQuery } from '@tanstack/react-query';
import { getAdminStats } from '@repo/api-client';
import { Users, BookOpen, RefreshCw, Clock, CheckCircle2, BarChart3, UsersRound } from 'lucide-react';
import { Card } from '@repo/ui/components/card';
import { Skeleton } from '@repo/ui/components/skeleton';

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ElementType;
}

function StatCard({ title, value, icon: Icon }: StatCardProps) {
  return (
    <Card className="border-2 hover:border-primary hover:shadow-lg transition-all duration-300">
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground mb-2">{title}</p>
            <p className="text-3xl font-bold text-foreground tracking-tight">
              {value.toLocaleString()}
            </p>
          </div>

          <div className="rounded-lg bg-primary/10 p-3">
            <Icon className="w-5 h-5 text-primary" strokeWidth={2} />
          </div>
        </div>
      </div>
    </Card>
  );
}

function StatCardSkeleton() {
  return (
    <Card className="p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-20" />
        </div>
        <Skeleton className="h-12 w-12 rounded-2xl" />
      </div>
    </Card>
  );
}

export function AdminStats() {
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: getAdminStats,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  if (error) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
        <p className="text-sm text-destructive">Failed to load statistics</p>
      </div>
    );
  }

  if (isLoading || !stats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
        {Array.from({ length: 7 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: Users,
    },
    {
      title: 'Total Books',
      value: stats.totalBooks,
      icon: BookOpen,
    },
    {
      title: 'Total Communities',
      value: stats.totalCommunities,
      icon: UsersRound,
    },
    {
      title: 'Active Borrows',
      value: stats.activeBorrows,
      icon: RefreshCw,
    },
    {
      title: 'Pending Requests',
      value: stats.pendingRequests,
      icon: Clock,
    },
    {
      title: 'Completed Borrows',
      value: stats.completedBorrows,
      icon: CheckCircle2,
    },
    {
      title: 'Total Requests',
      value: stats.totalBorrowRequests,
      icon: BarChart3,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
      {statCards.map((stat) => (
        <StatCard
          key={stat.title}
          {...stat}
        />
      ))}
    </div>
  );
}
