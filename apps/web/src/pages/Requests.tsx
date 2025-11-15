import { useState, useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@repo/ui/components/tabs';
import { PageContainer } from '@repo/ui/components/page-container';
import { Badge } from '@repo/ui/components/badge';
import { Inbox, Send } from '@repo/ui/components/icons';
import {
  useIncomingBorrowRequests,
  useMyBorrowRequests,
  useApproveBorrowRequest,
  useDenyBorrowRequest,
  useMarkHandoverComplete,
  useUpdateHandoverTracking,
  useInitiateReturn,
  useConfirmReturn,
} from '../hooks/useBorrowRequests';
import { FilterControls } from '../components/Requests/FilterControls';
import { RequestList } from '../components/Requests/RequestList';
import { ApproveRequestDialog } from '../components/Requests/ApproveRequestDialog';
import { DenyRequestDialog } from '../components/Requests/DenyRequestDialog';
import { AddTrackingDialog } from '../components/Requests/AddTrackingDialog';
import { ReturnInitiateDialog } from '../components/Requests/ReturnInitiateDialog';
import type { BorrowRequestWithDetails, ReturnMethod } from '@repo/api-client';

export default function Requests() {
  const [activeTab, setActiveTab] = useState<'incoming' | 'outgoing'>('incoming');
  const [incomingStatusFilter, setIncomingStatusFilter] = useState<string>('all');
  const [outgoingStatusFilter, setOutgoingStatusFilter] = useState<string>('all');
  const [incomingSortBy, setIncomingSortBy] = useState<'newest' | 'oldest' | 'title'>('newest');
  const [outgoingSortBy, setOutgoingSortBy] = useState<'newest' | 'oldest' | 'title'>('newest');

  // Selected request for dialogs
  const [selectedRequest, setSelectedRequest] = useState<BorrowRequestWithDetails | null>(null);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [denyDialogOpen, setDenyDialogOpen] = useState(false);
  const [trackingDialogOpen, setTrackingDialogOpen] = useState(false);
  const [returnDialogOpen, setReturnDialogOpen] = useState(false);

  // Fetch requests
  const { data: incomingRequests = [], isLoading: incomingLoading } = useIncomingBorrowRequests();
  const { data: myRequests = [], isLoading: myRequestsLoading } = useMyBorrowRequests();

  // Mutations
  const approveMutation = useApproveBorrowRequest();
  const denyMutation = useDenyBorrowRequest();
  const markHandoverCompleteMutation = useMarkHandoverComplete();
  const updateTrackingMutation = useUpdateHandoverTracking();
  const initiateReturnMutation = useInitiateReturn();
  const confirmReturnMutation = useConfirmReturn();

  // Filter and sort incoming requests
  const filteredIncomingRequests = useMemo(() => {
    let filtered = incomingRequests;

    // Apply status filter
    if (incomingStatusFilter !== 'all') {
      filtered = filtered.filter((r) => r.status === incomingStatusFilter);
    }

    // Apply sorting
    const sorted = [...filtered].sort((a, b) => {
      if (incomingSortBy === 'newest') {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      } else if (incomingSortBy === 'oldest') {
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      } else {
        // Sort by book title
        const titleA = a.book?.title || '';
        const titleB = b.book?.title || '';
        return titleA.localeCompare(titleB);
      }
    });

    return sorted;
  }, [incomingRequests, incomingStatusFilter, incomingSortBy]);

  // Filter and sort outgoing requests
  const filteredMyRequests = useMemo(() => {
    let filtered = myRequests;

    // Apply status filter
    if (outgoingStatusFilter !== 'all') {
      filtered = filtered.filter((r) => r.status === outgoingStatusFilter);
    }

    // Apply sorting
    const sorted = [...filtered].sort((a, b) => {
      if (outgoingSortBy === 'newest') {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      } else if (outgoingSortBy === 'oldest') {
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      } else {
        // Sort by book title
        const titleA = a.book?.title || '';
        const titleB = b.book?.title || '';
        return titleA.localeCompare(titleB);
      }
    });

    return sorted;
  }, [myRequests, outgoingStatusFilter, outgoingSortBy]);

  const handleApproveClick = (requestId: string) => {
    const request = incomingRequests.find((r) => r.id === requestId);
    if (request) {
      setSelectedRequest(request);
      setApproveDialogOpen(true);
    }
  };

  const handleDenyClick = (requestId: string) => {
    const request = incomingRequests.find((r) => r.id === requestId);
    if (request) {
      setSelectedRequest(request);
      setDenyDialogOpen(true);
    }
  };

  const handleApprove = async (
    dueDate: string,
    handoverMethod: 'ship' | 'meetup' | 'pickup',
    handoverDetails: { address?: string; datetime?: string; instructions?: string },
    message?: string
  ) => {
    if (!selectedRequest) return;

    try {
      await approveMutation.mutateAsync({
        id: selectedRequest.id,
        dueDate,
        handoverDetails: {
          method: handoverMethod,
          address: handoverDetails.address,
          datetime: handoverDetails.datetime,
          instructions: handoverDetails.instructions,
        },
        message,
      });
      setApproveDialogOpen(false);
      setSelectedRequest(null);
    } catch (error) {
      console.error('Failed to approve request:', error);
    }
  };

  const handleDeny = async (message?: string) => {
    if (!selectedRequest) return;

    try {
      await denyMutation.mutateAsync({
        id: selectedRequest.id,
        message,
      });
      setDenyDialogOpen(false);
      setSelectedRequest(null);
    } catch (error) {
      console.error('Failed to deny request:', error);
    }
  };

  const handleMarkHandoverComplete = async (requestId: string) => {
    try {
      await markHandoverCompleteMutation.mutateAsync(requestId);
    } catch (error) {
      console.error('Failed to mark handover complete:', error);
    }
  };

  const handleAddTracking = (requestId: string) => {
    const request = incomingRequests.find((r) => r.id === requestId);
    if (request) {
      setSelectedRequest(request);
      setTrackingDialogOpen(true);
    }
  };

  const handleTrackingSubmit = async (trackingNumber: string) => {
    if (!selectedRequest) return;

    try {
      await updateTrackingMutation.mutateAsync({
        id: selectedRequest.id,
        tracking: trackingNumber,
      });
      setTrackingDialogOpen(false);
      setSelectedRequest(null);
    } catch (error) {
      console.error('Failed to update tracking:', error);
    }
  };

  const handleInitiateReturn = (requestId: string) => {
    const request = myRequests.find((r) => r.id === requestId);
    if (request) {
      setSelectedRequest(request);
      setReturnDialogOpen(true);
    }
  };

  const handleReturnSubmit = async (
    returnMethod: ReturnMethod,
    returnDetails: {
      address?: string;
      datetime?: string;
      instructions?: string;
      tracking?: string;
    }
  ) => {
    if (!selectedRequest) return;

    try {
      await initiateReturnMutation.mutateAsync({
        id: selectedRequest.id,
        returnDetails: {
          method: returnMethod,
          address: returnDetails.address,
          datetime: returnDetails.datetime,
          instructions: returnDetails.instructions,
          tracking: returnDetails.tracking,
        },
      });
      setReturnDialogOpen(false);
      setSelectedRequest(null);
    } catch (error) {
      console.error('Failed to initiate return:', error);
    }
  };

  const handleConfirmReturn = async (requestId: string) => {
    try {
      await confirmReturnMutation.mutateAsync(requestId);
    } catch (error) {
      console.error('Failed to confirm return:', error);
    }
  };

  // Count pending requests for badge
  const pendingIncomingCount = incomingRequests.filter((r) => r.status === 'pending').length;
  const activeMyRequestsCount = myRequests.filter(
    (r) => r.status === 'approved' || r.status === 'borrowed'
  ).length;

  // Calculate stats for header
  const approvedIncoming = incomingRequests.filter((r) => r.status === 'approved').length;
  const borrowed = myRequests.filter((r) => r.status === 'borrowed').length;

  return (
    <PageContainer maxWidth="2xl">
      {/* Page Header */}
      <div className="mb-8 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Requests</h1>
            <p className="text-muted-foreground mt-1">
              Manage your book lending requests
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="flex gap-6 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Pending:</span>
            <span className="font-semibold">{pendingIncomingCount}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Approved:</span>
            <span className="font-semibold">{approvedIncoming}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Borrowed:</span>
            <span className="font-semibold">{borrowed}</span>
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as 'incoming' | 'outgoing')}
        className="space-y-6"
      >
        {/* Clean Tabs List */}
        <TabsList className="inline-flex h-auto items-center justify-start rounded-none bg-transparent p-0 border-b border-border w-full">
          <TabsTrigger
            value="incoming"
            className="group relative inline-flex items-center justify-center gap-2 rounded-none border-b-2 border-transparent px-4 py-3 text-sm font-medium text-muted-foreground transition-all hover:text-foreground data-[state=active]:border-primary data-[state=active]:text-foreground data-[state=active]:shadow-none"
          >
            <Inbox className="h-4 w-4" />
            <span>Incoming</span>
            {pendingIncomingCount > 0 && (
              <Badge variant="secondary" className="ml-1 bg-primary/10 text-primary border-0">
                {pendingIncomingCount}
              </Badge>
            )}
          </TabsTrigger>

          <TabsTrigger
            value="outgoing"
            className="group relative inline-flex items-center justify-center gap-2 rounded-none border-b-2 border-transparent px-4 py-3 text-sm font-medium text-muted-foreground transition-all hover:text-foreground data-[state=active]:border-primary data-[state=active]:text-foreground data-[state=active]:shadow-none"
          >
            <Send className="h-4 w-4" />
            <span>My Requests</span>
            {activeMyRequestsCount > 0 && (
              <Badge variant="secondary" className="ml-1 bg-muted text-muted-foreground border-0">
                {activeMyRequestsCount}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Incoming Tab Content */}
        <TabsContent
          value="incoming"
          className="mt-0 space-y-6"
        >
          <FilterControls
            view="incoming"
            requests={incomingRequests}
            selectedStatus={incomingStatusFilter}
            onStatusChange={setIncomingStatusFilter}
            sortBy={incomingSortBy}
            onSortChange={setIncomingSortBy}
          />

          <RequestList
            requests={filteredIncomingRequests}
            view="incoming"
            isLoading={incomingLoading}
            onApprove={handleApproveClick}
            onDeny={handleDenyClick}
            onMarkHandoverComplete={handleMarkHandoverComplete}
            onAddTracking={handleAddTracking}
            onConfirmReturn={handleConfirmReturn}
            emptyMessage={
              incomingStatusFilter === 'all'
                ? 'No incoming requests'
                : `No ${incomingStatusFilter} requests`
            }
          />
        </TabsContent>

        {/* Outgoing Tab Content */}
        <TabsContent
          value="outgoing"
          className="mt-0 space-y-6"
        >
          <FilterControls
            view="outgoing"
            requests={myRequests}
            selectedStatus={outgoingStatusFilter}
            onStatusChange={setOutgoingStatusFilter}
            sortBy={outgoingSortBy}
            onSortChange={setOutgoingSortBy}
          />

          <RequestList
            requests={filteredMyRequests}
            view="outgoing"
            isLoading={myRequestsLoading}
            onInitiateReturn={handleInitiateReturn}
            emptyMessage={
              outgoingStatusFilter === 'all'
                ? 'No borrow requests'
                : `No ${outgoingStatusFilter} requests`
            }
          />
        </TabsContent>
      </Tabs>

      {/* Approve Dialog */}
      <ApproveRequestDialog
        open={approveDialogOpen}
        onOpenChange={setApproveDialogOpen}
        onApprove={handleApprove}
        isPending={approveMutation.isPending}
        bookTitle={selectedRequest?.book?.title}
        borrowerName={selectedRequest?.borrower?.name || selectedRequest?.borrower?.email}
      />

      {/* Deny Dialog */}
      <DenyRequestDialog
        open={denyDialogOpen}
        onOpenChange={setDenyDialogOpen}
        onDeny={handleDeny}
        isPending={denyMutation.isPending}
        bookTitle={selectedRequest?.book?.title}
        borrowerName={selectedRequest?.borrower?.name || selectedRequest?.borrower?.email}
      />

      {/* Add Tracking Dialog */}
      <AddTrackingDialog
        open={trackingDialogOpen}
        onOpenChange={setTrackingDialogOpen}
        onAddTracking={handleTrackingSubmit}
        isPending={updateTrackingMutation.isPending}
        bookTitle={selectedRequest?.book?.title}
        currentTracking={selectedRequest?.handover_tracking || undefined}
      />

      {/* Return Initiate Dialog */}
      <ReturnInitiateDialog
        open={returnDialogOpen}
        onOpenChange={setReturnDialogOpen}
        onInitiateReturn={handleReturnSubmit}
        isPending={initiateReturnMutation.isPending}
        bookTitle={selectedRequest?.book?.title}
        ownerName={selectedRequest?.owner?.name || selectedRequest?.owner?.email}
      />
    </PageContainer>
  );
}
