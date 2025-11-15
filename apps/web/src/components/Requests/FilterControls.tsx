import { Badge } from '@repo/ui/components/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/ui/components/select';
import { Filter, ArrowUpDown } from '@repo/ui/components/icons';
import type { BorrowRequestWithDetails } from '@repo/api-client';

export interface FilterControlsProps {
  view: 'incoming' | 'outgoing';
  requests: BorrowRequestWithDetails[];
  selectedStatus: string;
  onStatusChange: (status: string) => void;
  sortBy: 'newest' | 'oldest' | 'title';
  onSortChange: (sort: 'newest' | 'oldest' | 'title') => void;
}

interface FilterChipProps {
  label: string;
  count: number;
  isActive: boolean;
  onClick: () => void;
  variant: 'all' | 'pending' | 'approved' | 'borrowed' | 'returned' | 'denied';
}

function FilterChip({ label, count, isActive, onClick, variant }: FilterChipProps) {
  const variantStyles = {
    all: {
      base: 'border-border/60 hover:border-primary/50 hover:bg-primary/5',
      active: 'border-amber-500/50 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/50 dark:to-orange-950/50 shadow-md ring-2 ring-amber-500/20',
      badge: 'bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-sm',
    },
    pending: {
      base: 'border-border/60 hover:border-amber-500/50 hover:bg-amber-50/50 dark:hover:bg-amber-950/30',
      active: 'border-amber-500/50 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/50 dark:to-orange-950/50 shadow-md ring-2 ring-amber-500/20',
      badge: 'bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-sm',
    },
    approved: {
      base: 'border-border/60 hover:border-emerald-500/50 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/30',
      active: 'border-emerald-500/50 bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950/50 dark:to-green-950/50 shadow-md ring-2 ring-emerald-500/20',
      badge: 'bg-gradient-to-br from-emerald-500 to-green-600 text-white shadow-sm',
    },
    borrowed: {
      base: 'border-border/60 hover:border-blue-500/50 hover:bg-blue-50/50 dark:hover:bg-blue-950/30',
      active: 'border-blue-500/50 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50 shadow-md ring-2 ring-blue-500/20',
      badge: 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-sm',
    },
    returned: {
      base: 'border-border/60 hover:border-muted-foreground/50 hover:bg-muted/50',
      active: 'border-muted-foreground/50 bg-muted shadow-md ring-2 ring-muted-foreground/20',
      badge: 'bg-muted-foreground text-white shadow-sm',
    },
    denied: {
      base: 'border-border/60 hover:border-destructive/50 hover:bg-destructive/5',
      active: 'border-destructive/50 bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-950/50 dark:to-rose-950/50 shadow-md ring-2 ring-destructive/20',
      badge: 'bg-gradient-to-br from-red-500 to-rose-600 text-white shadow-sm',
    },
  };

  const styles = variantStyles[variant];

  return (
    <button
      onClick={onClick}
      className={`group relative inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl border transition-all duration-300 ${
        isActive ? styles.active : styles.base
      }`}
    >
      <span className={`font-medium text-sm ${isActive ? 'text-foreground' : 'text-muted-foreground group-hover:text-foreground'}`}>
        {label}
      </span>
      <Badge
        variant="secondary"
        className={`min-w-[24px] h-6 px-2 font-semibold transition-all duration-300 ${
          isActive ? styles.badge : 'bg-muted text-muted-foreground'
        }`}
      >
        {count}
      </Badge>

      {/* Glow effect on active */}
      {isActive && (
        <div className="absolute inset-0 rounded-xl opacity-50 blur-md bg-gradient-to-br from-amber-400/20 to-orange-500/20 -z-10" />
      )}
    </button>
  );
}

export function FilterControls({
  view,
  requests,
  selectedStatus,
  onStatusChange,
  sortBy,
  onSortChange,
}: FilterControlsProps) {
  // Calculate counts for each status
  const allCount = requests.length;
  const pendingCount = requests.filter((r) => r.status === 'pending').length;
  const approvedCount = requests.filter((r) => r.status === 'approved').length;
  const borrowedCount = requests.filter((r) => r.status === 'borrowed').length;
  const returnedCount = requests.filter((r) => r.status === 'returned').length;
  const deniedCount = requests.filter((r) => r.status === 'denied').length;

  // Define filters based on view
  const incomingFilters = [
    { status: 'all', label: 'All Requests', count: allCount, variant: 'all' as const },
    { status: 'pending', label: 'Pending', count: pendingCount, variant: 'pending' as const },
    { status: 'approved', label: 'Approved', count: approvedCount, variant: 'approved' as const },
    { status: 'borrowed', label: 'Borrowed', count: borrowedCount, variant: 'borrowed' as const },
    { status: 'returned', label: 'Returned', count: returnedCount, variant: 'returned' as const },
    { status: 'denied', label: 'Denied', count: deniedCount, variant: 'denied' as const },
  ];

  const outgoingFilters = [
    { status: 'all', label: 'All Requests', count: allCount, variant: 'all' as const },
    { status: 'pending', label: 'Pending', count: pendingCount, variant: 'pending' as const },
    { status: 'approved', label: 'Approved', count: approvedCount, variant: 'approved' as const },
    { status: 'borrowed', label: 'Borrowed', count: borrowedCount, variant: 'borrowed' as const },
    { status: 'returned', label: 'Returned', count: returnedCount, variant: 'returned' as const },
    { status: 'denied', label: 'Denied', count: deniedCount, variant: 'denied' as const },
  ];

  const filters = view === 'incoming' ? incomingFilters : outgoingFilters;

  return (
    <div className="mb-6 space-y-4 animate-in fade-in slide-in-from-top-2 duration-500">
      {/* Filter chips */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Filter className="w-4 h-4" />
          <span className="font-medium">Filter:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {filters.map((filter) => (
            <FilterChip
              key={filter.status}
              label={filter.label}
              count={filter.count}
              isActive={selectedStatus === filter.status}
              onClick={() => onStatusChange(filter.status)}
              variant={filter.variant}
            />
          ))}
        </div>
      </div>

      {/* Sort dropdown */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <ArrowUpDown className="w-4 h-4" />
          <span className="font-medium">Sort by:</span>
        </div>
        <Select value={sortBy} onValueChange={(value) => onSortChange(value as 'newest' | 'oldest' | 'title')}>
          <SelectTrigger className="w-[200px] border-border/60 hover:border-primary/50 transition-colors duration-200">
            <SelectValue placeholder="Select sort order" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="oldest">Oldest First</SelectItem>
            <SelectItem value="title">Book Title (A-Z)</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
