import { useState } from 'react';
import { useActiveChats } from '../hooks/useActiveChats';
import { ChatListItem } from '../components/Chats/ChatListItem';
import { ChatDialog } from '../components/Requests/ChatDialog';
import type { ChatSummary } from '@repo/api-client';

export default function Chats() {
  const { data: chats = [], isLoading } = useActiveChats();
  const [selectedChat, setSelectedChat] = useState<ChatSummary | null>(null);
  const [chatDialogOpen, setChatDialogOpen] = useState(false);

  const handleChatClick = (chat: ChatSummary) => {
    setSelectedChat(chat);
    setChatDialogOpen(true);
  };

  const handleDialogClose = (open: boolean) => {
    setChatDialogOpen(open);
    if (!open) {
      setSelectedChat(null);
    }
  };

  if (isLoading) {
    return (
      <div className="container max-w-4xl mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-8">Chats</h1>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
            <p className="mt-4 text-sm text-muted-foreground">Loading chats...</p>
          </div>
        </div>
      </div>
    );
  }

  if (chats.length === 0) {
    return (
      <div className="container max-w-4xl mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-8">Chats</h1>
        <div className="flex items-center justify-center py-12">
          <div className="text-center max-w-md">
            <svg
              className="mx-auto h-12 w-12 text-muted-foreground"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            <h3 className="mt-4 text-sm font-medium">No active chats</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Start a conversation by requesting a book! Once you send or receive a message about a borrow request, it will appear here.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Chats</h1>
        <p className="text-muted-foreground mt-2">
          {chats.length} active conversation{chats.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Chat List */}
      <div className="space-y-3">
        {chats.map((chat) => (
          <ChatListItem
            key={chat.request.id}
            chat={chat}
            onClick={() => handleChatClick(chat)}
          />
        ))}
      </div>

      {/* Chat Dialog */}
      {selectedChat && (
        <ChatDialog
          open={chatDialogOpen}
          onOpenChange={handleDialogClose}
          requestId={selectedChat.request.id}
          bookTitle={selectedChat.request.book?.title}
          otherUserName={
            selectedChat.request.owner_id === selectedChat.request.borrower_id
              ? selectedChat.request.owner?.name || selectedChat.request.owner?.email
              : selectedChat.request.borrower?.name || selectedChat.request.borrower?.email
          }
        />
      )}
    </div>
  );
}
