import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@repo/ui/components/tabs';
import { useIncomingBorrowRequests, useMyBorrowRequests, useApproveBorrowRequest, useDenyBorrowRequest } from '../hooks/useBorrowRequests';
import { RequestList } from '../components/Requests/RequestList';
import { ApproveRequestDialog } from '../components/Requests/ApproveRequestDialog';
import { DenyRequestDialog } from '../components/Requests/DenyRequestDialog';
import type { BorrowRequestWithDetails } from '@repo/api-client';

export default function Requests() {
  const [activeTab, setActiveTab] = useState<'incoming' | 'outgoing'>('incoming');

  // Selected request for dialogs
  const [selectedRequest, setSelectedRequest] = useState<BorrowRequestWithDetails | null>(null);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [denyDialogOpen, setDenyDialogOpen] = useState(false);

  // Fetch requests
  const { data: incomingRequests = [], isLoading: incomingLoading } = useIncomingBorrowRequests();
  const { data: myRequests = [], isLoading: myRequestsLoading } = useMyBorrowRequests();

  // Mutations
  const approveMutation = useApproveBorrowRequest();
  const denyMutation = useDenyBorrowRequest();

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
            emptyMessage="No incoming requests"
          />
        </TabsContent>

        <TabsContent value="outgoing" className="mt-6">
          <RequestList
            requests={myRequests}
            view="outgoing"
            isLoading={myRequestsLoading}
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
    </div>
  );
}
