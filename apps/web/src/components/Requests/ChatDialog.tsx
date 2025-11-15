import { useState, useRef, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@repo/ui/components/dialog';
import { Button } from '@repo/ui/components/button';
import { Textarea } from '@repo/ui/components/textarea';
import { useMessages, useSendMessage, useMessageSubscription } from '../../hooks/useMessages';
import { MessageBubble } from './MessageBubble';
import { useAuth } from '../../contexts/AuthContext';

export interface ChatDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  requestId: string;
  bookTitle?: string;
  otherUserName?: string;
}

export function ChatDialog({
  open,
  onOpenChange,
  requestId,
  bookTitle,
  otherUserName,
}: ChatDialogProps) {
  const [messageContent, setMessageContent] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  // Fetch messages
  const { data: messages = [], isLoading } = useMessages(open ? requestId : undefined);

  // Send message mutation
  const sendMessageMutation = useSendMessage(requestId);

  // Subscribe to real-time messages
  useMessageSubscription(open ? requestId : undefined);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSend = async () => {
    if (!messageContent.trim() || sendMessageMutation.isPending) return;

    try {
      await sendMessageMutation.mutateAsync(messageContent);
      setMessageContent('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Send on Enter (without Shift)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl h-[600px] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle>Chat</DialogTitle>
          <DialogDescription>
            {bookTitle && otherUserName && `About "${bookTitle}" with ${otherUserName}`}
            {!bookTitle && otherUserName && `Chat with ${otherUserName}`}
          </DialogDescription>
        </DialogHeader>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="inline-block h-6 w-6 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
                <p className="mt-2 text-sm text-muted-foreground">Loading messages...</p>
              </div>
            </div>
          )}

          {!isLoading && messages.length === 0 && (
            <div className="flex items-center justify-center py-8">
              <div className="text-center max-w-md">
                <p className="text-sm text-muted-foreground">
                  No messages yet. Start the conversation!
                </p>
              </div>
            </div>
          )}

          {!isLoading &&
            messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                isCurrentUser={message.sender_id === user?.id}
              />
            ))}

          {/* Scroll anchor */}
          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <div className="px-6 pb-6 pt-4 border-t bg-background">
          <div className="flex gap-2">
            <Textarea
              value={messageContent}
              onChange={(e) => setMessageContent(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message... (Enter to send, Shift+Enter for new line)"
              className="min-h-[60px] max-h-[120px] resize-none"
              disabled={sendMessageMutation.isPending}
            />
            <Button
              onClick={handleSend}
              disabled={!messageContent.trim() || sendMessageMutation.isPending}
              className="self-end"
            >
              {sendMessageMutation.isPending ? 'Sending...' : 'Send'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
