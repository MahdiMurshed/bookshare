import { useState } from 'react';
import { useActiveChats } from '../hooks/useActiveChats';
import { ChatListItem } from '../components/Chats/ChatListItem';
import { ChatConversation } from '../components/Chats/ChatConversation';
import { MessageCircle, MessagesSquare, Loader2 } from '@repo/ui/components/icons';
import type { ChatSummary } from '@repo/api-client';
import { cn } from '@repo/ui/lib/utils';

export default function Chats() {
  const { data: chats = [], isLoading } = useActiveChats();
  const [selectedChat, setSelectedChat] = useState<ChatSummary | null>(null);

  const handleChatClick = (chat: ChatSummary) => {
    setSelectedChat(chat);
  };

  // Full-page loading state
  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mx-auto" strokeWidth={2} />
          <div className="space-y-1">
            <h3 className="text-lg font-semibold text-foreground">Loading Messages</h3>
            <p className="text-sm text-muted-foreground">Fetching your conversations...</p>
          </div>
        </div>
      </div>
    );
  }

  // Empty state
  if (chats.length === 0) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background p-6">
        <div className="text-center max-w-md space-y-6">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-muted border-2 border-border">
            <MessageCircle className="h-10 w-10 text-muted-foreground" strokeWidth={1.5} />
          </div>

          <div className="space-y-3">
            <h3 className="text-2xl font-bold text-foreground">
              No conversations yet
            </h3>
            <p className="text-base text-muted-foreground leading-relaxed">
              Your message inbox is empty. When you request a book or someone requests one of yours,
              you'll be able to chat with them here to coordinate the exchange.
            </p>
          </div>

          <p className="text-sm text-muted-foreground border-t border-border pt-4">
            Start sharing books to begin chatting
          </p>
        </div>
      </div>
    );
  }

  // Main split-pane layout
  return (
    <div className="h-screen w-full flex flex-col lg:flex-row overflow-hidden bg-background">
      {/* Left Pane - Chat List (40%) */}
      <div className={cn(
        "flex flex-col border-r-2 border-border",
        "w-full lg:w-[40%]",
        "h-[40vh] lg:h-full",
        selectedChat && "hidden lg:flex" // Hide on mobile when chat selected
      )}>
        {/* Header */}
        <div className="border-b-2 border-border bg-background">
          <div className="px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-muted border border-border">
                <MessagesSquare className="h-5 w-5 text-foreground" strokeWidth={2} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Messages</h1>
                <p className="text-sm text-muted-foreground">
                  {chats.length} conversation{chats.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Chat List - Scrollable */}
        <div className="flex-1 overflow-y-auto bg-background">
          <div className="p-3 space-y-1">
            {chats.map((chat) => (
              <ChatListItem
                key={chat.request.id}
                chat={chat}
                onClick={() => handleChatClick(chat)}
                isActive={selectedChat?.request.id === chat.request.id}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Right Pane - Conversation View (60%) */}
      <div className={cn(
        "flex-1 flex flex-col",
        "w-full lg:w-[60%]",
        !selectedChat && "hidden lg:flex" // Hide on mobile when no chat selected
      )}>
        {selectedChat ? (
          <div className="h-full">
            {/* Mobile back button */}
            <div className="lg:hidden border-b-2 border-border p-4 bg-background">
              <button
                onClick={() => setSelectedChat(null)}
                className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to chats
              </button>
            </div>
            <ChatConversation chat={selectedChat} />
          </div>
        ) : (
          // Empty state when no chat selected (desktop only)
          <div className="hidden lg:flex h-full items-center justify-center bg-background">
            <div className="text-center space-y-4 px-8 max-w-md">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-muted border-2 border-border mx-auto">
                <MessageCircle className="h-8 w-8 text-muted-foreground" strokeWidth={1.5} />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-foreground">
                  Select a conversation
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Choose a chat from the list to start messaging about your book exchanges.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
