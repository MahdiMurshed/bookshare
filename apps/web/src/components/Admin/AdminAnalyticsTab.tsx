/**
 * AdminAnalyticsTab Component
 *
 * Comprehensive analytics dashboard for BookShare admin panel
 * Features platform KPIs, user leaderboards, popular books, and retention metrics
 */

import { useQuery } from '@tanstack/react-query';
import {
  getPlatformKPIs,
  getMostActiveUsers,
  getMostBorrowedBooks,
  getAverageBorrowDuration,
  getUserRetentionMetrics,
} from '@repo/api-client';
import { Card, CardHeader, CardTitle, CardContent } from '@repo/ui/components/card';
import { Skeleton } from '@repo/ui/components/skeleton';
import { Avatar } from '@repo/ui/components/avatar';
import { Badge } from '@repo/ui/components/badge';
import {
  TrendingUp,
  TrendingDown,
  Users,
  BookOpen,
  Activity,
  CheckCircle,
  Clock,
  Target,
  Trophy,
  Award,
  Medal,
  Star,
  Zap,
} from 'lucide-react';

// Growth indicator component
function GrowthIndicator({ value }: { value: number }) {
  const isPositive = value >= 0;
  const Icon = isPositive ? TrendingUp : TrendingDown;
  const colorClass = isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400';
  const bgClass = isPositive ? 'bg-emerald-50 dark:bg-emerald-950/30' : 'bg-red-50 dark:bg-red-950/30';

  return (
    <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full ${bgClass}`}>
      <Icon className={`h-3.5 w-3.5 ${colorClass}`} />
      <span className={`text-xs font-semibold ${colorClass}`}>
        {isPositive ? '+' : ''}
        {value.toFixed(1)}%
      </span>
    </div>
  );
}

// KPI Card component
function KPICard({
  title,
  value,
  growth,
  icon: Icon,
}: {
  title: string;
  value: number | string;
  growth?: number;
  icon: React.ElementType;
}) {
  return (
    <Card className="border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-lg">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground mb-2">{title}</p>
            <p className="text-3xl font-bold text-foreground mb-2">
              {typeof value === 'number' ? value.toLocaleString() : value}
            </p>
            {growth !== undefined && <GrowthIndicator value={growth} />}
          </div>
          <div className="p-3 rounded-lg bg-primary/10 border-2 border-primary/20">
            <Icon className="h-6 w-6 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Star rating component
function StarRating({ rating }: { rating: number | null }) {
  if (rating === null) {
    return <span className="text-xs text-muted-foreground">No ratings</span>;
  }

  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`h-3.5 w-3.5 ${
            i < Math.floor(rating)
              ? 'fill-primary text-primary'
              : 'text-muted-foreground/30'
          }`}
        />
      ))}
      <span className="text-xs font-medium text-muted-foreground ml-1">
        {rating.toFixed(1)}
      </span>
    </div>
  );
}

// Platform KPIs Section
function PlatformKPIsSection() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-platform-kpis'],
    queryFn: getPlatformKPIs,
  });

  if (error) {
    return (
      <div className="rounded-lg border-2 border-destructive/50 bg-destructive/10 p-4">
        <p className="text-sm text-destructive">Failed to load platform KPIs</p>
      </div>
    );
  }

  if (isLoading || !data) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 7 }).map((_, i) => (
          <Card key={i} className="border-2">
            <CardContent className="p-6">
              <Skeleton className="h-4 w-24 mb-4" />
              <Skeleton className="h-8 w-16 mb-3" />
              <Skeleton className="h-5 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground mb-2">Platform KPIs</h2>
        <p className="text-muted-foreground">Key performance indicators for the last 30 days</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total Users"
          value={data.totalUsers}
          growth={data.userGrowthRate30Days}
          icon={Users}
        />
        <KPICard
          title="Total Books"
          value={data.totalBooks}
          growth={data.bookGrowthRate30Days}
          icon={BookOpen}
        />
        <KPICard
          title="Total Borrows"
          value={data.totalBorrows}
          growth={data.borrowGrowthRate30Days}
          icon={Activity}
        />
        <KPICard
          title="Active Borrows"
          value={data.activeBorrows}
          icon={Zap}
        />
        <KPICard
          title="Completed Borrows"
          value={data.completedBorrows}
          icon={CheckCircle}
        />
        <KPICard
          title="Avg Books/User"
          value={data.averageBooksPerUser.toFixed(1)}
          icon={Target}
        />
        <KPICard
          title="Avg Borrows/Book"
          value={data.averageBorrowsPerBook.toFixed(1)}
          icon={Target}
        />
      </div>
    </div>
  );
}

// Most Active Users Leaderboard
function MostActiveUsersSection() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-most-active-users'],
    queryFn: () => getMostActiveUsers(10),
  });

  if (error) {
    return (
      <Card className="border-2">
        <CardHeader>
          <CardTitle>Most Active Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border-2 border-destructive/50 bg-destructive/10 p-4">
            <p className="text-sm text-destructive">Failed to load active users</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading || !data) {
    return (
      <Card className="border-2">
        <CardHeader>
          <CardTitle>Most Active Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-3 w-32" />
                </div>
                <Skeleton className="h-6 w-16" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const getMedalIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-5 w-5 text-amber-500" />;
      case 2:
        return <Award className="h-5 w-5 text-zinc-400" />;
      case 3:
        return <Medal className="h-5 w-5 text-amber-600" />;
      default:
        return null;
    }
  };

  const getRankBgClass = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/50';
      case 2:
        return 'bg-zinc-50 dark:bg-zinc-900/30 border-zinc-200 dark:border-zinc-700/50';
      case 3:
        return 'bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800/50';
      default:
        return 'bg-background border-border';
    }
  };

  return (
    <Card className="border-2 hover:border-primary/50 transition-all duration-300">
      <CardHeader className="border-b-2 border-border">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10 border-2 border-primary/20">
            <Trophy className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-xl">Most Active Users</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">Top 10 by total activity</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-3">
          {data.map((user, index) => {
            const rank = index + 1;
            const totalActivity = user.totalBorrows + user.totalLends;

            return (
              <div
                key={user.id}
                className={`flex items-center gap-4 p-4 rounded-lg border-2 transition-all duration-200 hover:shadow-md ${getRankBgClass(
                  rank
                )}`}
              >
                {/* Rank */}
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-background border-2 border-border font-bold text-foreground">
                  {rank <= 3 ? getMedalIcon(rank) : `#${rank}`}
                </div>

                {/* Avatar */}
                <Avatar className="h-12 w-12 border-2 border-border">
                  {user.avatar_url ? (
                    <img src={user.avatar_url} alt={user.name} className="object-cover" />
                  ) : (
                    <div className="flex items-center justify-center bg-primary/10 text-primary font-semibold">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </Avatar>

                {/* User Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground truncate">{user.name}</p>
                  <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-4 text-sm">
                  <div className="text-center">
                    <p className="font-bold text-foreground">{user.totalBorrows}</p>
                    <p className="text-xs text-muted-foreground">Borrows</p>
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-foreground">{user.totalLends}</p>
                    <p className="text-xs text-muted-foreground">Lends</p>
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-primary">{totalActivity}</p>
                    <p className="text-xs text-muted-foreground">Total</p>
                  </div>
                </div>

                {/* Active Requests Badge */}
                {user.activeRequests > 0 && (
                  <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                    {user.activeRequests} active
                  </Badge>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

// Most Borrowed Books Section
function MostBorrowedBooksSection() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-most-borrowed-books'],
    queryFn: () => getMostBorrowedBooks(10),
  });

  if (error) {
    return (
      <Card className="border-2">
        <CardHeader>
          <CardTitle>Most Borrowed Books</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border-2 border-destructive/50 bg-destructive/10 p-4">
            <p className="text-sm text-destructive">Failed to load popular books</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading || !data) {
    return (
      <Card className="border-2">
        <CardHeader>
          <CardTitle>Most Borrowed Books</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-20 w-14 rounded" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-8 w-12" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 hover:border-primary/50 transition-all duration-300">
      <CardHeader className="border-b-2 border-border">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10 border-2 border-primary/20">
            <BookOpen className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-xl">Most Borrowed Books</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">Top 10 by borrow count</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-3">
          {data.map((book, index) => (
            <div
              key={book.id}
              className="flex items-start gap-4 p-4 rounded-lg border-2 border-border hover:border-primary/50 transition-all duration-200 hover:shadow-md bg-background"
            >
              {/* Rank Badge */}
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 border-2 border-primary/20 font-bold text-sm text-primary">
                  {index + 1}
                </div>
              </div>

              {/* Book Cover */}
              {book.cover_image_url ? (
                <img
                  src={book.cover_image_url}
                  alt={book.title}
                  className="w-14 h-20 rounded object-cover border-2 border-border shadow-sm"
                />
              ) : (
                <div className="w-14 h-20 rounded bg-primary/10 flex items-center justify-center border-2 border-primary/20">
                  <BookOpen className="w-6 h-6 text-primary" />
                </div>
              )}

              {/* Book Info */}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground line-clamp-1 mb-1">
                  {book.title}
                </p>
                <p className="text-sm text-muted-foreground mb-2">{book.author}</p>
                <div className="flex items-center gap-2 mb-2">
                  <StarRating rating={book.averageRating} />
                  {book.genre && (
                    <Badge variant="outline" className="text-xs">
                      {book.genre}
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Owner: <span className="font-medium">{book.ownerName}</span>
                </p>
              </div>

              {/* Borrow Count */}
              <div className="flex-shrink-0 text-center">
                <div className="p-3 rounded-lg bg-primary/10 border-2 border-primary/20">
                  <p className="text-2xl font-bold text-primary">{book.totalBorrows}</p>
                  <p className="text-xs text-muted-foreground mt-1">borrows</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Borrow Duration Metrics Section
function BorrowDurationSection() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-borrow-duration'],
    queryFn: getAverageBorrowDuration,
  });

  if (error) {
    return (
      <Card className="border-2">
        <CardHeader>
          <CardTitle>Borrow Duration Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border-2 border-destructive/50 bg-destructive/10 p-4">
            <p className="text-sm text-destructive">Failed to load duration metrics</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading || !data) {
    return (
      <Card className="border-2">
        <CardHeader>
          <CardTitle>Borrow Duration Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i}>
                <Skeleton className="h-16 w-full" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const metrics = [
    {
      label: 'Average Duration',
      value: `${data.averageDays} days`,
      icon: Clock,
      color: 'primary',
    },
    {
      label: 'Median Duration',
      value: `${data.medianDays} days`,
      icon: Activity,
      color: 'primary',
    },
    {
      label: 'Min / Max',
      value: `${data.minDays} / ${data.maxDays} days`,
      icon: Target,
      color: 'primary',
    },
    {
      label: 'Total Completed',
      value: data.totalCompletedBorrows.toLocaleString(),
      icon: CheckCircle,
      color: 'primary',
    },
  ];

  return (
    <Card className="border-2 hover:border-primary/50 transition-all duration-300">
      <CardHeader className="border-b-2 border-border">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10 border-2 border-primary/20">
            <Clock className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-xl">Borrow Duration Metrics</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">Average time books are borrowed</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {metrics.map((metric, index) => {
            const Icon = metric.icon;
            return (
              <div
                key={index}
                className="text-center p-4 rounded-lg border-2 border-border bg-background hover:border-primary/50 transition-all duration-200"
              >
                <div className="flex items-center justify-center mb-3">
                  <div className="p-2 rounded-lg bg-primary/10 border-2 border-primary/20">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-foreground mb-1">{metric.value}</p>
                <p className="text-xs text-muted-foreground">{metric.label}</p>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

// User Retention Metrics Section
function UserRetentionSection() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-user-retention'],
    queryFn: getUserRetentionMetrics,
  });

  if (error) {
    return (
      <Card className="border-2">
        <CardHeader>
          <CardTitle>User Retention Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border-2 border-destructive/50 bg-destructive/10 p-4">
            <p className="text-sm text-destructive">Failed to load retention metrics</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading || !data) {
    return (
      <Card className="border-2">
        <CardHeader>
          <CardTitle>User Retention Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i}>
                <Skeleton className="h-6 w-32 mb-2" />
                <Skeleton className="h-3 w-full" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 hover:border-primary/50 transition-all duration-300">
      <CardHeader className="border-b-2 border-border">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10 border-2 border-primary/20">
            <Users className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-xl">User Retention Metrics</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">Active users and retention rates</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-6">
          {/* Total Users */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-muted-foreground">Total Users</p>
              <p className="text-2xl font-bold text-foreground">{data.totalUsers.toLocaleString()}</p>
            </div>
          </div>

          {/* 7-Day Retention */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-sm font-medium text-foreground">7-Day Active Users</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {data.activeUsersLast7Days} active / {data.newUsersLast7Days} new
                </p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-primary">{data.retentionRate7Days}%</p>
                <p className="text-xs text-muted-foreground">retention</p>
              </div>
            </div>
            <div className="h-3 bg-muted rounded-full overflow-hidden border-2 border-border">
              <div
                className="h-full bg-primary transition-all duration-500"
                style={{ width: `${Math.min(data.retentionRate7Days, 100)}%` }}
              />
            </div>
          </div>

          {/* 30-Day Retention */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-sm font-medium text-foreground">30-Day Active Users</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {data.activeUsersLast30Days} active / {data.newUsersLast30Days} new
                </p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-primary">{data.retentionRate30Days}%</p>
                <p className="text-xs text-muted-foreground">retention</p>
              </div>
            </div>
            <div className="h-3 bg-muted rounded-full overflow-hidden border-2 border-border">
              <div
                className="h-full bg-primary transition-all duration-500"
                style={{ width: `${Math.min(data.retentionRate30Days, 100)}%` }}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Main Analytics Tab Component
export function AdminAnalyticsTab() {
  return (
    <div className="space-y-8">
      {/* Platform KPIs */}
      <PlatformKPIsSection />

      {/* Leaderboards Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MostActiveUsersSection />
        <MostBorrowedBooksSection />
      </div>

      {/* Metrics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BorrowDurationSection />
        <UserRetentionSection />
      </div>
    </div>
  );
}
