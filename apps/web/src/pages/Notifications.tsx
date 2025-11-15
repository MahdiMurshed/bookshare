import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useNotifications,
  useMarkNotificationAsRead,
  useMarkAllAsRead,
  useDeleteNotification,
  useNotificationSubscription,
} from '../hooks/useNotifications';
import { Button } from '@repo/ui/components/button';
import { Card } from '@repo/ui/components/card';
import { Tabs, TabsList, TabsTrigger } from '@repo/ui/components/tabs';
import {
  Bell,
  BookOpen,
  Check,
  X,
  MessageCircle,
  Clock,
  AlertCircle,
  Trash2,
} from 'lucide-react';
import type { Notification, NotificationType } from '@repo/api-client';
import { formatDistanceToNow } from 'date-fns';
import { logError } from '../lib/utils/errors';

type FilterType = 'all' | 'unread' | 'read';

export default function Notifications() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<FilterType>('all');

  const { data: notifications = [], isLoading } = useNotifications(filter);
  const markAsReadMutation = useMarkNotificationAsRead();
  const markAllAsReadMutation = useMarkAllAsRead();
  const deleteNotificationMutation = useDeleteNotification();

  // Subscribe to real-time notifications
  useNotificationSubscription();

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleNotificationClick = async (notification: Notification) => {
    // Mark as read
    if (!notification.read) {
      await markAsReadMutation.mutateAsync(notification.id);
    }

    // Navigate based on notification type and payload
    if (notification.payload?.book_id) {
      navigate(`/books/${notification.payload.book_id}`);
    } else if (notification.payload?.request_id) {
      navigate(`/requests`);
    } else if (notification.type === 'new_message') {
      navigate(`/chats`);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsReadMutation.mutateAsync();
    } catch (error) {
      logError(error, 'marking all notifications as read');
    }
  };

  const handleDeleteNotification = async (
    e: React.MouseEvent,
    notificationId: string
  ) => {
    e.stopPropagation();
    try {
      await deleteNotificationMutation.mutateAsync(notificationId);
    } catch (error) {
      logError(error, 'deleting notification');
    }
  };

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'borrow_request':
        return <BookOpen className="w-5 h-5 text-muted-foreground" />;
      case 'request_approved':
        return <Check className="w-5 h-5 text-muted-foreground" />;
      case 'request_denied':
        return <X className="w-5 h-5 text-muted-foreground" />;
      case 'book_returned':
        return <BookOpen className="w-5 h-5 text-muted-foreground" />;
      case 'new_message':
        return <MessageCircle className="w-5 h-5 text-muted-foreground" />;
      case 'due_soon':
        return <Clock className="w-5 h-5 text-muted-foreground" />;
      case 'overdue':
        return <AlertCircle className="w-5 h-5 text-muted-foreground" />;
      default:
        return <Bell className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch {
      return 'recently';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Bell className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">
                  Notifications
                </h1>
                <p className="text-sm text-muted-foreground">
                  Stay updated on your books and requests
                </p>
              </div>
            </div>

            {unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleMarkAllAsRead}
                disabled={markAllAsReadMutation.isPending}
              >
                <Check className="w-4 h-4 mr-2" />
                Mark all as read
              </Button>
            )}
          </div>

          {/* Filter Tabs */}
          <Tabs value={filter} onValueChange={(v) => setFilter(v as FilterType)}>
            <TabsList className="w-full sm:w-auto">
              <TabsTrigger value="all" className="flex-1 sm:flex-initial">
                All
                {filter === 'all' && notifications.length > 0 && (
                  <span className="ml-2 text-xs bg-muted px-2 py-0.5 rounded-full">
                    {notifications.length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="unread" className="flex-1 sm:flex-initial">
                Unread
                {unreadCount > 0 && (
                  <span className="ml-2 text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="read" className="flex-1 sm:flex-initial">
                Read
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Notifications List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-muted-foreground">Loading notifications...</div>
          </div>
        ) : notifications.length === 0 ? (
          <Card className="border-2">
            <div className="flex flex-col items-center justify-center py-16 px-4">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <Bell className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                No notifications
              </h3>
              <p className="text-sm text-muted-foreground text-center max-w-sm">
                {filter === 'unread'
                  ? "You're all caught up! No unread notifications."
                  : filter === 'read'
                    ? "No read notifications yet."
                    : "You don't have any notifications yet. We'll notify you about book requests, messages, and more."}
              </p>
            </div>
          </Card>
        ) : (
          <div className="space-y-0 border-2 border-border rounded-lg overflow-hidden">
            {notifications.map((notification, index) => (
              <div
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                className={`
                  relative flex items-start gap-4 p-4 cursor-pointer transition-colors
                  ${!notification.read ? 'bg-primary/5' : 'bg-background'}
                  hover:bg-muted
                  ${index !== notifications.length - 1 ? 'border-b border-border' : ''}
                  group
                `}
              >
                {/* Icon */}
                <div className="flex-shrink-0 mt-1">
                  {getNotificationIcon(notification.type)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground mb-1">
                        {notification.title}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {notification.message}
                      </p>
                    </div>

                    {/* Delete button */}
                    <button
                      onClick={(e) =>
                        handleDeleteNotification(e, notification.id)
                      }
                      className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-background rounded-md"
                      disabled={deleteNotificationMutation.isPending}
                    >
                      <Trash2 className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                    </button>
                  </div>

                  {/* Timestamp and unread indicator */}
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs text-muted-foreground">
                      {formatTimestamp(notification.created_at)}
                    </span>
                    {!notification.read && (
                      <div className="w-2 h-2 bg-primary rounded-full" />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
