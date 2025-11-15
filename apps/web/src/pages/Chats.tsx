import { useState } from 'react';
import { useActiveChats } from '../hooks/useActiveChats';
import { ChatListItem } from '../components/Chats/ChatListItem';
import { ChatConversation } from '../components/Chats/ChatConversation';
import { Card } from '@repo/ui/components/card';
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
      <div className="h-screen w-full flex items-center justify-center bg-gradient-to-br from-background via-amber-50/5 to-background">
        <div className="text-center space-y-6">
          <div className="relative inline-flex">
            <div className="absolute inset-0 bg-amber-500/20 blur-3xl rounded-full animate-pulse" />
            <div className="relative bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-3xl p-8 border border-border/50">
              <Loader2 className="h-12 w-12 animate-spin text-amber-600 dark:text-amber-400" strokeWidth={2} />
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="font-serif text-xl font-semibold text-foreground">Loading Messages</h3>
            <p className="text-sm text-muted-foreground">Fetching your conversations...</p>
          </div>
        </div>
      </div>
    );
  }

  // Empty state
  if (chats.length === 0) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-gradient-to-br from-background via-amber-50/5 to-background p-6">
        <Card className="border-border/50 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-xl overflow-hidden max-w-2xl w-full shadow-2xl">
          <div className="relative">
            {/* Decorative background */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(251,191,36,0.12),transparent_50%),radial-gradient(circle_at_70%_80%,rgba(249,115,22,0.12),transparent_50%)]" />

            <div className="relative flex flex-col items-center justify-center py-24 px-8 text-center">
              {/* Icon with ambient glow */}
              <div className="relative mb-8 animate-in fade-in-0 zoom-in-95 duration-700">
                <div className="absolute inset-0 bg-amber-500/20 blur-3xl rounded-full" />
                <div className="relative bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-3xl p-8 border border-border/50">
                  <MessageCircle className="h-16 w-16 text-amber-600 dark:text-amber-400" strokeWidth={1.5} />
                </div>
              </div>

              {/* Text Content */}
              <div className="space-y-4 mb-8 max-w-md animate-in fade-in-0 slide-in-from-bottom-4 duration-700 delay-100">
                <h3 className="font-serif text-3xl font-bold text-foreground tracking-tight">
                  No conversations yet
                </h3>
                <p className="text-base text-muted-foreground leading-relaxed">
                  Your message inbox is empty. When you request a book or someone requests one of yours,
                  you'll be able to chat with them here to coordinate the exchange.
                </p>
              </div>

              {/* Decorative element */}
              <div className="flex items-center gap-3 text-sm text-muted-foreground/60 animate-in fade-in-0 duration-700 delay-200">
                <div className="h-px w-12 bg-gradient-to-r from-transparent to-border/50" />
                <span className="font-medium">Start sharing books to begin chatting</span>
                <div className="h-px w-12 bg-gradient-to-l from-transparent to-border/50" />
              </div>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // Main split-pane layout
  return (
    <div className="h-screen w-full flex flex-col lg:flex-row overflow-hidden bg-gradient-to-br from-background via-amber-50/5 to-background">
      {/* Left Pane - Chat List (40%) */}
      <div className={cn(
        "flex flex-col border-r border-border/50",
        "w-full lg:w-[40%]",
        "h-[40vh] lg:h-full",
        selectedChat && "hidden lg:flex" // Hide on mobile when chat selected
      )}>
        {/* Header */}
        <div className="relative border-b border-border/50 bg-gradient-to-r from-background/95 to-amber-50/20 dark:to-amber-950/5 backdrop-blur-xl">
          {/* Decorative gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 via-transparent to-orange-500/5" />

          <div className="relative px-6 py-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="relative">
                <div className="absolute inset-0 bg-amber-500/20 blur-xl rounded-xl" />
                <div className="relative bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-xl p-2 border border-border/50">
                  <MessagesSquare className="h-6 w-6 text-amber-600 dark:text-amber-400" strokeWidth={2} />
                </div>
              </div>
              <div>
                <h1 className="font-serif text-3xl font-bold text-foreground tracking-tight">Messages</h1>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {chats.length} active conversation{chats.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
          </div>

          {/* Decorative bottom border */}
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />
        </div>

        {/* Chat List - Scrollable */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 space-y-2">
            {chats.map((chat, index) => (
              <div
                key={chat.request.id}
                style={{ animationDelay: `${index * 40}ms` }}
                className="animate-in fade-in-0 slide-in-from-left-4 duration-500 fill-mode-backwards"
              >
                <ChatListItem
                  chat={chat}
                  onClick={() => handleChatClick(chat)}
                  isActive={selectedChat?.request.id === chat.request.id}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Loading skeletons during refetch */}
        {isLoading && (
          <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-amber-600 dark:text-amber-400" />
          </div>
        )}
      </div>

      {/* Right Pane - Conversation View (60%) */}
      <div className={cn(
        "flex-1 flex flex-col",
        "w-full lg:w-[60%]",
        !selectedChat && "hidden lg:flex" // Hide on mobile when no chat selected
      )}>
        {selectedChat ? (
          <div className="h-full animate-in fade-in-0 slide-in-from-right-6 duration-500">
            {/* Mobile back button */}
            <div className="lg:hidden border-b border-border/50 p-4 bg-background/95 backdrop-blur-xl">
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
          <div className="hidden lg:flex h-full items-center justify-center bg-gradient-to-br from-background/50 to-amber-50/5">
            <div className="text-center space-y-6 px-8 max-w-md">
              <div className="relative inline-flex">
                <div className="absolute inset-0 bg-amber-500/10 blur-3xl rounded-full" />
                <div className="relative bg-gradient-to-br from-amber-500/5 to-orange-500/5 rounded-3xl p-10 border border-border/30">
                  <MessageCircle className="h-16 w-16 text-amber-600/40 dark:text-amber-400/40" strokeWidth={1.5} />
                </div>
              </div>
              <div className="space-y-3">
                <h3 className="font-serif text-2xl font-semibold text-foreground/60">
                  Select a conversation
                </h3>
                <p className="text-sm text-muted-foreground/60 leading-relaxed">
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
