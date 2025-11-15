/**
 * AdminStats Component
 *
 * Beautiful gradient stat cards for the admin dashboard
 * Features warm amber/orange gradients with glass morphism effects
 */

import { useQuery } from '@tanstack/react-query';
import { getAdminStats } from '@repo/api-client';
import { Users, BookOpen, RefreshCw, Clock, CheckCircle2, BarChart3 } from 'lucide-react';
import { Card } from '@repo/ui/components/card';
import { Skeleton } from '@repo/ui/components/skeleton';

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ElementType;
  gradient: string;
  delay?: number;
}

function StatCard({ title, value, icon: Icon, gradient, delay = 0 }: StatCardProps) {
  return (
    <Card
      className="relative overflow-hidden group hover:shadow-xl transition-all duration-500 border-0"
      style={{
        animation: `fadeInUp 0.6s ease-out ${delay}s both`,
      }}
    >
      {/* Gradient background */}
      <div className={`absolute inset-0 ${gradient} opacity-90 group-hover:opacity-100 transition-opacity duration-500`} />

      {/* Glass morphism overlay */}
      <div className="absolute inset-0 bg-white/10 backdrop-blur-sm" />

      {/* Content */}
      <div className="relative p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-white/80 mb-1 font-sans">{title}</p>
            <p className="text-4xl font-bold text-white font-serif tracking-tight">
              {value.toLocaleString()}
            </p>
          </div>

          <div className="rounded-2xl bg-white/20 backdrop-blur-md p-3 group-hover:scale-110 transition-transform duration-300">
            <Icon className="w-6 h-6 text-white" strokeWidth={2} />
          </div>
        </div>

        {/* Decorative element */}
        <div className="absolute bottom-0 right-0 w-32 h-32 bg-white/5 rounded-tl-full transform translate-x-8 translate-y-8 group-hover:scale-150 transition-transform duration-700" />
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
        {Array.from({ length: 6 }).map((_, i) => (
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
      gradient: 'bg-gradient-to-br from-amber-500 via-orange-500 to-red-500',
    },
    {
      title: 'Total Books',
      value: stats.totalBooks,
      icon: BookOpen,
      gradient: 'bg-gradient-to-br from-orange-400 via-amber-500 to-yellow-500',
    },
    {
      title: 'Active Borrows',
      value: stats.activeBorrows,
      icon: RefreshCw,
      gradient: 'bg-gradient-to-br from-amber-600 via-orange-600 to-red-600',
    },
    {
      title: 'Pending Requests',
      value: stats.pendingRequests,
      icon: Clock,
      gradient: 'bg-gradient-to-br from-yellow-500 via-amber-500 to-orange-500',
    },
    {
      title: 'Completed Borrows',
      value: stats.completedBorrows,
      icon: CheckCircle2,
      gradient: 'bg-gradient-to-br from-emerald-500 via-green-500 to-teal-500',
    },
    {
      title: 'Total Requests',
      value: stats.totalBorrowRequests,
      icon: BarChart3,
      gradient: 'bg-gradient-to-br from-orange-500 via-red-500 to-pink-500',
    },
  ];

  return (
    <>
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
        {statCards.map((stat, index) => (
          <StatCard
            key={stat.title}
            {...stat}
            delay={index * 0.1}
          />
        ))}
      </div>
    </>
  );
}
