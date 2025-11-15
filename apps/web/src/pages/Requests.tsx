import { useState, useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@repo/ui/components/tabs';
import { PageContainer } from '@repo/ui/components/page-container';
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
import { RequestsHero } from '../components/Requests/RequestsHero';
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

  return (
    <PageContainer maxWidth="2xl">
      {/* Hero Section */}
      <RequestsHero incomingRequests={incomingRequests} myRequests={myRequests} />

      {/* Tabs Section */}
      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as 'incoming' | 'outgoing')}
        className="space-y-6"
      >
        {/* Enhanced Tabs List */}
        <div className="sticky top-0 z-10 pb-4 backdrop-blur-xl bg-background/80 -mx-4 px-4 border-b border-border/50">
          <TabsList className="inline-flex h-14 items-center justify-center rounded-2xl bg-gradient-to-br from-muted/80 to-muted/50 p-1.5 backdrop-blur-xl border border-border/60 shadow-lg animate-in fade-in slide-in-from-top-2 duration-500">
            <TabsTrigger
              value="incoming"
              className="group relative inline-flex items-center justify-center whitespace-nowrap rounded-xl px-8 py-3 text-sm font-semibold ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-gradient-to-br data-[state=active]:from-background data-[state=active]:to-background/95 data-[state=active]:text-foreground data-[state=active]:shadow-xl gap-3 hover:scale-[1.02]"
            >
              <Inbox className="h-5 w-5 group-data-[state=active]:text-amber-600 dark:group-data-[state=active]:text-amber-400 transition-colors duration-300" />
              <span>Incoming</span>
              {pendingIncomingCount > 0 && (
                <span className="inline-flex items-center justify-center min-w-[24px] h-6 px-2 text-xs font-bold text-white bg-gradient-to-br from-amber-500 to-orange-600 rounded-full shadow-lg shadow-amber-500/50 animate-in fade-in zoom-in duration-300 group-data-[state=active]:animate-pulse">
                  {pendingIncomingCount}
                </span>
              )}
              {/* Active indicator */}
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-1 bg-gradient-to-r from-amber-500 to-orange-600 rounded-full transition-all duration-300 group-data-[state=active]:w-3/4 shadow-lg shadow-amber-500/50" />
            </TabsTrigger>

            <TabsTrigger
              value="outgoing"
              className="group relative inline-flex items-center justify-center whitespace-nowrap rounded-xl px-8 py-3 text-sm font-semibold ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-gradient-to-br data-[state=active]:from-background data-[state=active]:to-background/95 data-[state=active]:text-foreground data-[state=active]:shadow-xl gap-3 hover:scale-[1.02]"
            >
              <Send className="h-5 w-5 group-data-[state=active]:text-blue-600 dark:group-data-[state=active]:text-blue-400 transition-colors duration-300" />
              <span>My Requests</span>
              {activeMyRequestsCount > 0 && (
                <span className="inline-flex items-center justify-center min-w-[24px] h-6 px-2 text-xs font-semibold text-muted-foreground bg-muted/80 rounded-full border border-border/50 group-data-[state=active]:border-blue-500/30 group-data-[state=active]:bg-gradient-to-br group-data-[state=active]:from-blue-50 group-data-[state=active]:to-indigo-50 dark:group-data-[state=active]:from-blue-950/50 dark:group-data-[state=active]:to-indigo-950/50 group-data-[state=active]:text-blue-700 dark:group-data-[state=active]:text-blue-300 transition-all duration-300">
                  {activeMyRequestsCount}
                </span>
              )}
              {/* Active indicator */}
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-300 group-data-[state=active]:w-3/4 shadow-lg shadow-blue-500/50" />
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Incoming Tab Content */}
        <TabsContent
          value="incoming"
          className="mt-0 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500"
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
          className="mt-0 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500"
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
