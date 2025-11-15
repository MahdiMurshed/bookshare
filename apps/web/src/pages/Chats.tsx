import { useState } from 'react';
import { useActiveChats } from '../hooks/useActiveChats';
import { ChatListItem } from '../components/Chats/ChatListItem';
import { ChatDialog } from '../components/Requests/ChatDialog';
import { PageContainer } from '@repo/ui/components/page-container';
import { PageHeader } from '@repo/ui/components/page-header';
import { Card } from '@repo/ui/components/card';
import { MessageCircle, MessagesSquare, Loader2 } from '@repo/ui/components/icons';
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
      <PageContainer maxWidth="lg">
        <PageHeader
          title="Messages"
          description="Your conversations about borrowed books"
          icon={MessagesSquare}
        />

        {/* Loading State */}
        <div className="flex items-center justify-center py-24">
          <div className="text-center space-y-4">
            <div className="relative inline-flex">
              <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse" />
              <Loader2 className="relative h-10 w-10 animate-spin text-primary" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">Loading your conversations...</p>
          </div>
        </div>
      </PageContainer>
    );
  }

  if (chats.length === 0) {
    return (
      <PageContainer maxWidth="lg">
        <PageHeader
          title="Messages"
          description="Your conversations about borrowed books"
          icon={MessagesSquare}
        />

        {/* Empty State */}
        <Card className="border-border/50 bg-gradient-to-br from-card/50 to-card/30 backdrop-blur-sm overflow-hidden">
          <div className="relative">
            {/* Decorative background */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(251,191,36,0.08),transparent_50%),radial-gradient(circle_at_70%_80%,rgba(249,115,22,0.08),transparent_50%)]" />

            <div className="relative flex flex-col items-center justify-center py-20 px-6 text-center">
              {/* Icon with ambient glow */}
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-primary/10 blur-3xl rounded-full" />
                <div className="relative bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-2xl p-6 border border-border/50">
                  <MessageCircle className="h-14 w-14 text-amber-600 dark:text-amber-400" strokeWidth={1.5} />
                </div>
              </div>

              {/* Text Content */}
              <div className="space-y-3 mb-6 max-w-md">
                <h3 className="text-2xl font-semibold text-foreground tracking-tight">
                  No conversations yet
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Your message inbox is empty. When you request a book or someone requests one of yours,
                  you'll be able to chat with them here to coordinate the exchange.
                </p>
              </div>

              {/* Decorative element */}
              <div className="flex items-center gap-2 text-xs text-muted-foreground/60 mt-4">
                <div className="h-px w-8 bg-border/50" />
                <span>Start sharing books to begin chatting</span>
                <div className="h-px w-8 bg-border/50" />
              </div>
            </div>
          </div>
        </Card>
      </PageContainer>
    );
  }

  return (
    <PageContainer maxWidth="lg">
      <PageHeader
        title="Messages"
        description={`${chats.length} active conversation${chats.length !== 1 ? 's' : ''}`}
        icon={MessagesSquare}
      />

      {/* Chat List */}
      <div className="space-y-2">
        {chats.map((chat, index) => (
          <div
            key={chat.request.id}
            style={{ animationDelay: `${index * 50}ms` }}
            className="animate-in fade-in-0 slide-in-from-bottom-4 duration-500 fill-mode-backwards"
          >
            <ChatListItem chat={chat} onClick={() => handleChatClick(chat)} />
          </div>
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
    </PageContainer>
  );
}
