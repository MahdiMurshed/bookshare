/**
 * AdminRequestsTab Component
 *
 * Borrow request management table for the admin dashboard
 * Features filtering by status and beautiful styling
 */

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getAllBorrowRequests } from '@repo/api-client';
import type { AdminBorrowRequestFilters, BorrowRequestStatus } from '@repo/api-client';
import { Filter, RefreshCw } from 'lucide-react';
import { Card } from '@repo/ui/components/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@repo/ui/components/table';
import { StatusBadge } from '@repo/ui/components/status-badge';
import { Skeleton } from '@repo/ui/components/skeleton';
import { format } from 'date-fns';

const STATUS_OPTIONS: { value: BorrowRequestStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All Requests' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'borrowed', label: 'Borrowed' },
  { value: 'return_initiated', label: 'Return Initiated' },
  { value: 'returned', label: 'Returned' },
  { value: 'denied', label: 'Denied' },
];

export function AdminRequestsTab() {
  const [selectedStatus, setSelectedStatus] = useState<BorrowRequestStatus | 'all'>('all');
  const [filters, setFilters] = useState<AdminBorrowRequestFilters>({
    sortBy: 'requested_at',
    sortOrder: 'desc',
  });

  const { data: requests, isLoading, error } = useQuery({
    queryKey: ['admin-borrow-requests', selectedStatus, filters],
    queryFn: () =>
      getAllBorrowRequests({
        ...filters,
        status: selectedStatus === 'all' ? undefined : selectedStatus,
      }),
  });

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">Filter by status:</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {STATUS_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => setSelectedStatus(option.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedStatus === option.value
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md'
                    : 'border border-border hover:bg-accent'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          <button
            onClick={() =>
              setFilters((prev) => ({
                ...prev,
                sortOrder: prev.sortOrder === 'asc' ? 'desc' : 'asc',
              }))
            }
            className="ml-auto px-4 py-2 rounded-lg border border-border hover:bg-accent transition-colors text-sm font-medium"
          >
            {filters.sortOrder === 'asc' ? 'Oldest First' : 'Newest First'}
          </button>
        </div>
      </Card>

      {/* Requests Table */}
      <Card className="overflow-hidden">
        {error ? (
          <div className="p-6">
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
              <p className="text-sm text-destructive">Failed to load requests</p>
            </div>
          </div>
        ) : isLoading || !requests ? (
          <div className="p-6 space-y-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-12 w-12 rounded" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-64" />
                  <Skeleton className="h-3 w-40" />
                </div>
                <Skeleton className="h-6 w-20" />
              </div>
            ))}
          </div>
        ) : requests.length === 0 ? (
          <div className="p-12 text-center">
            <RefreshCw className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              No {selectedStatus !== 'all' ? selectedStatus : ''} requests found
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="font-semibold">Book</TableHead>
                <TableHead className="font-semibold">Borrower</TableHead>
                <TableHead className="font-semibold">Owner</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="font-semibold">Requested</TableHead>
                <TableHead className="font-semibold">Due Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map((request) => (
                <TableRow
                  key={request.id}
                  className="group hover:bg-accent/50 transition-colors"
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {request.book?.cover_image_url ? (
                        <img
                          src={request.book.cover_image_url}
                          alt={request.book.title}
                          className="w-10 h-14 rounded object-cover border border-border group-hover:border-primary/50 transition-colors shadow-sm"
                        />
                      ) : (
                        <div className="w-10 h-14 rounded bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center border border-border group-hover:border-primary/50 transition-colors shadow-sm">
                          <span className="text-white text-xs font-semibold">
                            {request.book?.title?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-foreground group-hover:text-primary transition-colors line-clamp-1">
                          {request.book?.title}
                        </p>
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {request.book?.author}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {request.borrower?.avatar_url ? (
                        <img
                          src={request.borrower.avatar_url}
                          alt={request.borrower.name || 'Borrower'}
                          className="w-8 h-8 rounded-full object-cover border border-border"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                          <span className="text-white font-semibold text-xs">
                            {request.borrower?.name?.charAt(0).toUpperCase() || 'B'}
                          </span>
                        </div>
                      )}
                      <span className="text-sm text-foreground">
                        {request.borrower?.name || 'Unknown'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {request.owner?.avatar_url ? (
                        <img
                          src={request.owner.avatar_url}
                          alt={request.owner.name || 'Owner'}
                          className="w-8 h-8 rounded-full object-cover border border-border"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                          <span className="text-white font-semibold text-xs">
                            {request.owner?.name?.charAt(0).toUpperCase() || 'O'}
                          </span>
                        </div>
                      )}
                      <span className="text-sm text-foreground">
                        {request.owner?.name || 'Unknown'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={request.status} />
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {format(new Date(request.requested_at), 'MMM d, yyyy')}
                    </span>
                  </TableCell>
                  <TableCell>
                    {request.due_date ? (
                      <span className="text-sm text-muted-foreground">
                        {format(new Date(request.due_date), 'MMM d, yyyy')}
                      </span>
                    ) : (
                      <span className="text-sm text-muted-foreground">-</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {requests && requests.length > 0 && (
          <div className="px-6 py-4 border-t border-border bg-muted/30">
            <p className="text-sm text-muted-foreground">
              Showing {requests.length} request{requests.length !== 1 ? 's' : ''}
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}
