import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@repo/ui/components/tabs';
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

  return (
    <div className="container max-w-6xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Borrow Requests</h1>
        <p className="text-muted-foreground mt-2">
          Manage incoming requests and track your borrow requests
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'incoming' | 'outgoing')}>
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="incoming">
            Incoming Requests
            {incomingRequests.filter((r) => r.status === 'pending').length > 0 && (
              <span className="ml-2 inline-flex items-center justify-center w-5 h-5 text-xs font-semibold text-white bg-red-500 rounded-full">
                {incomingRequests.filter((r) => r.status === 'pending').length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="outgoing">My Requests</TabsTrigger>
        </TabsList>

        <TabsContent value="incoming" className="mt-6">
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

        <TabsContent value="outgoing" className="mt-6">
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
    </div>
  );
}
