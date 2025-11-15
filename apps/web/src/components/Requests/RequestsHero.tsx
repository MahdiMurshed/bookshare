import type { BorrowRequestWithDetails } from '@repo/api-client';
import { CheckCircle2, Clock, BookOpen, TrendingUp } from '@repo/ui/components/icons';

export interface RequestsHeroProps {
  incomingRequests: BorrowRequestWithDetails[];
  myRequests: BorrowRequestWithDetails[];
}

interface StatCardProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  gradient: string;
  iconBg: string;
  delay: number;
}

function StatCard({ icon: Icon, label, value, gradient, iconBg, delay }: StatCardProps) {
  return (
    <div
      className="group relative overflow-hidden rounded-2xl bg-card/60 backdrop-blur-xl border border-border/50 p-6 shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-105 hover:border-amber-500/30"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Gradient overlay on hover */}
      <div className={`absolute inset-0 ${gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />

      {/* Decorative corner accent */}
      <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
        <div className={`absolute inset-0 ${gradient} rounded-full blur-3xl`} />
      </div>

      <div className="relative flex items-start gap-5">
        {/* Icon */}
        <div className={`flex-shrink-0 ${iconBg} rounded-xl p-4 shadow-md ring-1 ring-white/10 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500`}>
          <Icon className="w-7 h-7 text-white" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-muted-foreground mb-1 tracking-wide uppercase">
            {label}
          </p>
          <p className="text-4xl font-serif font-bold text-foreground tracking-tight">
            {value}
          </p>
        </div>
      </div>

      {/* Decorative line */}
      <div className={`absolute bottom-0 left-0 right-0 h-1 ${gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
    </div>
  );
}

export function RequestsHero({ incomingRequests, myRequests }: RequestsHeroProps) {
  // Calculate stats
  const pendingIncoming = incomingRequests.filter((r) => r.status === 'pending').length;
  const approvedIncoming = incomingRequests.filter((r) => r.status === 'approved').length;
  const borrowed = myRequests.filter((r) => r.status === 'borrowed').length;
  const totalActive = incomingRequests.filter(
    (r) => r.status === 'approved' || r.status === 'borrowed'
  ).length + myRequests.filter((r) => r.status === 'borrowed').length;

  const stats = [
    {
      icon: Clock,
      label: 'Pending Requests',
      value: pendingIncoming,
      gradient: 'bg-gradient-to-br from-amber-500 to-orange-600',
      iconBg: 'bg-gradient-to-br from-amber-500 to-orange-600',
      delay: 0,
    },
    {
      icon: CheckCircle2,
      label: 'Approved',
      value: approvedIncoming,
      gradient: 'bg-gradient-to-br from-emerald-500 to-green-600',
      iconBg: 'bg-gradient-to-br from-emerald-500 to-green-600',
      delay: 100,
    },
    {
      icon: BookOpen,
      label: 'Currently Borrowed',
      value: borrowed,
      gradient: 'bg-gradient-to-br from-blue-500 to-indigo-600',
      iconBg: 'bg-gradient-to-br from-blue-500 to-indigo-600',
      delay: 200,
    },
    {
      icon: TrendingUp,
      label: 'Active Exchanges',
      value: totalActive,
      gradient: 'bg-gradient-to-br from-purple-500 to-pink-600',
      iconBg: 'bg-gradient-to-br from-purple-500 to-pink-600',
      delay: 300,
    },
  ];

  return (
    <div className="relative overflow-hidden rounded-3xl mb-8 shadow-2xl animate-in fade-in slide-in-from-top-4 duration-700">
      {/* Main gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 dark:from-amber-950/40 dark:via-orange-950/30 dark:to-amber-900/40" />

      {/* Decorative patterns */}
      <div className="absolute inset-0 opacity-[0.03]">
        <div className="absolute top-0 left-0 w-full h-full"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgb(0 0 0) 1px, transparent 0)`,
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      {/* Decorative blobs */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-gradient-to-br from-amber-400/20 to-orange-500/20 rounded-full blur-3xl animate-float" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-gradient-to-br from-orange-400/20 to-amber-500/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />

      {/* Content */}
      <div className="relative px-8 py-10">
        {/* Title section */}
        <div className="text-center mb-10 animate-in fade-in slide-in-from-top-2 duration-500">
          <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 rounded-full bg-amber-100/80 dark:bg-amber-900/30 backdrop-blur-sm border border-amber-200/50 dark:border-amber-800/50">
            <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span className="text-sm font-medium text-amber-900 dark:text-amber-200 tracking-wide">
              Request Management
            </span>
          </div>

          <h1 className="font-serif font-bold text-5xl md:text-6xl tracking-tight mb-4 bg-gradient-to-br from-amber-900 via-orange-800 to-amber-900 dark:from-amber-100 dark:via-orange-200 dark:to-amber-100 bg-clip-text text-transparent leading-tight">
            Your Book Exchange Hub
          </h1>

          <p className="text-lg text-amber-950/70 dark:text-amber-50/70 max-w-2xl mx-auto leading-relaxed" style={{ fontFamily: 'var(--font-serif-body)' }}>
            Manage incoming borrow requests, track your active exchanges, and keep your literary community thriving
          </p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
          {stats.map((stat) => (
            <StatCard key={stat.label} {...stat} />
          ))}
        </div>
      </div>

      {/* Bottom decorative border */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent opacity-50" />
    </div>
  );
}
