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

function FilterChip({ label, count, isActive, onClick }: FilterChipProps) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md border transition-all ${
        isActive
          ? 'border-primary bg-primary/5 text-foreground'
          : 'border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground'
      }`}
    >
      <span className="font-medium text-sm">{label}</span>
      <Badge
        variant="secondary"
        className={`min-w-[20px] h-5 px-1.5 text-xs font-semibold ${
          isActive ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
        }`}
      >
        {count}
      </Badge>
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
    <div className="mb-6 space-y-4">
      {/* Filter chips */}
      <div className="flex items-center gap-3 flex-wrap">
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
          <SelectTrigger className="w-[200px]">
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
