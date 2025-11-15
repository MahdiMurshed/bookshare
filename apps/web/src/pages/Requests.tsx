import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@repo/ui/components/tabs';
import { PageContainer } from '@repo/ui/components/page-container';
import { PageHeader } from '@repo/ui/components/page-header';
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
import { RequestList } from '../components/Requests/RequestList';
import { ApproveRequestDialog } from '../components/Requests/ApproveRequestDialog';
import { DenyRequestDialog } from '../components/Requests/DenyRequestDialog';
import { AddTrackingDialog } from '../components/Requests/AddTrackingDialog';
import { ReturnInitiateDialog } from '../components/Requests/ReturnInitiateDialog';
import type { BorrowRequestWithDetails, ReturnMethod } from '@repo/api-client';

export default function Requests() {
  const [activeTab, setActiveTab] = useState<'incoming' | 'outgoing'>('incoming');

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
    <PageContainer maxWidth="xl">
      <PageHeader
        title="Borrow Requests"
        description="Manage incoming requests and track your active borrows"
        icon={Inbox}
      />

      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as 'incoming' | 'outgoing')}
        className="space-y-6"
      >
        <TabsList className="inline-flex h-12 items-center justify-center rounded-xl bg-muted/50 p-1 backdrop-blur-sm border border-border/50">
          <TabsTrigger
            value="incoming"
            className="relative inline-flex items-center justify-center whitespace-nowrap rounded-lg px-6 py-2 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm gap-2"
          >
            <Inbox className="h-4 w-4" />
            Incoming
            {pendingIncomingCount > 0 && (
              <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-semibold text-white bg-gradient-to-br from-amber-500 to-orange-600 rounded-full shadow-sm animate-in fade-in zoom-in duration-200">
                {pendingIncomingCount}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger
            value="outgoing"
            className="relative inline-flex items-center justify-center whitespace-nowrap rounded-lg px-6 py-2 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm gap-2"
          >
            <Send className="h-4 w-4" />
            My Requests
            {activeMyRequestsCount > 0 && (
              <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-medium text-muted-foreground bg-muted rounded-full">
                {activeMyRequestsCount}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent
          value="incoming"
          className="mt-0 space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300"
        >
          <RequestList
            requests={incomingRequests}
            view="incoming"
            isLoading={incomingLoading}
            onApprove={handleApproveClick}
            onDeny={handleDenyClick}
            onMarkHandoverComplete={handleMarkHandoverComplete}
            onAddTracking={handleAddTracking}
            onConfirmReturn={handleConfirmReturn}
            emptyMessage="No incoming requests"
          />
        </TabsContent>

        <TabsContent
          value="outgoing"
          className="mt-0 space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300"
        >
          <RequestList
            requests={myRequests}
            view="outgoing"
            isLoading={myRequestsLoading}
            onInitiateReturn={handleInitiateReturn}
            emptyMessage="No borrow requests"
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
