/**
 * AdminRequestsTab Component
 *
 * Borrow request management table for the admin dashboard
 * Features filtering by status and beautiful styling
 */

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getAllBorrowRequests,
  adminApproveRequest,
  adminDenyRequest,
  adminCancelRequest,
  adminMarkAsReturned,
} from '@repo/api-client';
import type { AdminBorrowRequestFilters as BorrowRequestFilters, BorrowRequestStatus, BorrowRequestWithDetails } from '@repo/api-client';
import { Filter, RefreshCw, AlertCircle } from 'lucide-react';
import { RequestActionsMenu } from './RequestActionsMenu';
import { AdminApproveDialog } from './AdminApproveDialog';
import { AdminDenyDialog } from './AdminDenyDialog';
import { AdminReturnDialog } from './AdminReturnDialog';
import { ConfirmDialog } from './ConfirmDialog';
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
  const queryClient = useQueryClient();
  const [selectedStatus, setSelectedStatus] = useState<BorrowRequestStatus | 'all'>('all');
  const [filters, setFilters] = useState<BorrowRequestFilters>({
    sortBy: 'requested_at',
    sortOrder: 'desc',
  });

  // Dialog states
  const [selectedRequest, setSelectedRequest] = useState<BorrowRequestWithDetails | null>(null);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showDenyDialog, setShowDenyDialog] = useState(false);
  const [showReturnDialog, setShowReturnDialog] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const { data: requests, isLoading, error } = useQuery({
    queryKey: ['admin-borrow-requests', selectedStatus, filters],
    queryFn: () =>
      getAllBorrowRequests({
        ...filters,
        status: selectedStatus === 'all' ? undefined : selectedStatus,
      }),
  });

  // Mutation for approving request
  const approveMutation = useMutation({
    mutationFn: ({ requestId, dueDate, message }: { requestId: string; dueDate: string; message?: string }) =>
      adminApproveRequest(requestId, dueDate, message),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-borrow-requests'] });
      setShowApproveDialog(false);
      setSelectedRequest(null);
    },
  });

  // Mutation for denying request
  const denyMutation = useMutation({
    mutationFn: ({ requestId, reason }: { requestId: string; reason: string }) =>
      adminDenyRequest(requestId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-borrow-requests'] });
      setShowDenyDialog(false);
      setSelectedRequest(null);
    },
  });

  // Mutation for marking as returned
  const returnMutation = useMutation({
    mutationFn: (requestId: string) => adminMarkAsReturned(requestId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-borrow-requests'] });
      setShowReturnDialog(false);
      setSelectedRequest(null);
    },
  });

  // Mutation for canceling request
  const cancelMutation = useMutation({
    mutationFn: (requestId: string) => adminCancelRequest(requestId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-borrow-requests'] });
      setShowCancelDialog(false);
      setSelectedRequest(null);
    },
  });

  // Handle request actions
  const handleRequestAction = (action: string, request: BorrowRequestWithDetails) => {
    setActionError(null);
    setSelectedRequest(request);

    switch (action) {
      case 'approve':
        setShowApproveDialog(true);
        break;
      case 'deny':
        setShowDenyDialog(true);
        break;
      case 'mark-returned':
        setShowReturnDialog(true);
        break;
      case 'cancel':
        setShowCancelDialog(true);
        break;
    }
  };

  const handleApprove = async (dueDate: string, message?: string) => {
    if (!selectedRequest) return;
    await approveMutation.mutateAsync({ requestId: selectedRequest.id, dueDate, message });
  };

  const handleDeny = async (reason: string) => {
    if (!selectedRequest) return;
    await denyMutation.mutateAsync({ requestId: selectedRequest.id, reason });
  };

  const handleReturn = async () => {
    if (!selectedRequest) return;
    await returnMutation.mutateAsync(selectedRequest.id);
  };

  const handleCancel = async () => {
    if (!selectedRequest) return;
    await cancelMutation.mutateAsync(selectedRequest.id);
  };

  return (
    <div className="space-y-6">
      {/* Error Display */}
      {actionError && (
        <div className="rounded-lg border-2 border-destructive/50 bg-destructive/10 p-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <p className="text-sm text-destructive font-medium">{actionError}</p>
          </div>
        </div>
      )}

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
                    ? 'bg-primary text-primary-foreground shadow-md'
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
                <TableHead className="font-semibold">Actions</TableHead>
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
                        <div className="w-10 h-14 rounded bg-primary/10 flex items-center justify-center border-2 border-border group-hover:border-primary transition-colors">
                          <span className="text-primary text-xs font-semibold">
                            {request.book?.title?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-foreground line-clamp-1">
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
                        <div className="w-8 h-8 rounded-full bg-primary/10 border-2 border-border flex items-center justify-center">
                          <span className="text-primary font-semibold text-xs">
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
                        <div className="w-8 h-8 rounded-full bg-primary/10 border-2 border-border flex items-center justify-center">
                          <span className="text-primary font-semibold text-xs">
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
                  <TableCell>
                    <RequestActionsMenu request={request} onAction={handleRequestAction} />
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

      {/* Dialogs */}
      <AdminApproveDialog
        request={selectedRequest}
        open={showApproveDialog}
        onClose={() => {
          setShowApproveDialog(false);
          setSelectedRequest(null);
        }}
        onApprove={handleApprove}
      />

      <AdminDenyDialog
        request={selectedRequest}
        open={showDenyDialog}
        onClose={() => {
          setShowDenyDialog(false);
          setSelectedRequest(null);
        }}
        onDeny={handleDeny}
      />

      <AdminReturnDialog
        request={selectedRequest}
        open={showReturnDialog}
        onClose={() => {
          setShowReturnDialog(false);
          setSelectedRequest(null);
        }}
        onConfirm={handleReturn}
      />

      <ConfirmDialog
        title="Cancel Request"
        description={`Are you sure you want to cancel this borrow request? This action cannot be undone and will permanently delete the request.`}
        open={showCancelDialog}
        onClose={() => {
          setShowCancelDialog(false);
          setSelectedRequest(null);
        }}
        onConfirm={handleCancel}
        variant="destructive"
      />
    </div>
  );
}
