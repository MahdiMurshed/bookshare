/**
 * AdminNotificationsTab Component
 *
 * System notifications interface for the admin dashboard
 * Send broadcast, group, or individual notifications to users
 * Features form validation, and notification history
 *
 * Refactored to use separate form components for better maintainability
 */

import { useState } from 'react';
import type {
  BroadcastNotificationInput,
  GroupNotificationInput,
  UserNotificationInput,
  User,
  AdminNotificationType,
} from '@repo/api-client';
import {
  Send,
  Users,
  User as UserIcon,
  Bell,
  CheckCircle,
  XCircle,
  Megaphone,
  AlertTriangle,
  Info,
} from 'lucide-react';
import { Card } from '@repo/ui/components/card';
import { Badge } from '@repo/ui/components/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@repo/ui/components/tabs';
import { format } from 'date-fns';
import { BroadcastNotificationForm } from './NotificationForms/BroadcastNotificationForm';
import { GroupNotificationForm } from './NotificationForms/GroupNotificationForm';
import { UserNotificationForm } from './NotificationForms/UserNotificationForm';

// Sent notification type for history
interface SentNotification {
  id: string;
  title: string;
  message: string;
  type: AdminNotificationType;
  recipientType: 'broadcast' | 'group' | 'individual';
  recipientCount: number;
  recipientInfo: string;
  timestamp: Date;
}

export function AdminNotificationsTab() {
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [sentNotifications, setSentNotifications] = useState<SentNotification[]>([]);

  const handleBroadcastSuccess = (data: BroadcastNotificationInput) => {
    setSuccessMessage('Notification sent successfully to All Users');

    const newNotification: SentNotification = {
      id: Date.now().toString(),
      title: data.title,
      message: data.message,
      type: data.type || 'announcement',
      recipientType: 'broadcast',
      recipientCount: 0, // Could be fetched from API
      recipientInfo: 'All Users',
      timestamp: new Date(),
    };

    setSentNotifications((prev) => [newNotification, ...prev.slice(0, 9)]);
    setTimeout(() => setSuccessMessage(null), 5000);
  };

  const handleGroupSuccess = (data: GroupNotificationInput) => {
    const groupNames: Record<typeof data.group, string> = {
      all: 'All Users',
      admins: 'Administrators',
      borrowers: 'Active Borrowers',
      lenders: 'Book Lenders',
      suspended: 'Suspended Users',
    };

    const recipientInfo = groupNames[data.group];
    setSuccessMessage(`Notification sent successfully to ${recipientInfo}`);

    const newNotification: SentNotification = {
      id: Date.now().toString(),
      title: data.title,
      message: data.message,
      type: data.type || 'announcement',
      recipientType: 'group',
      recipientCount: 0,
      recipientInfo,
      timestamp: new Date(),
    };

    setSentNotifications((prev) => [newNotification, ...prev.slice(0, 9)]);
    setTimeout(() => setSuccessMessage(null), 5000);
  };

  const handleUserSuccess = (data: UserNotificationInput, user: User | undefined) => {
    const recipientInfo = user?.name || 'User';
    setSuccessMessage(`Notification sent successfully to ${recipientInfo}`);

    const newNotification: SentNotification = {
      id: Date.now().toString(),
      title: data.title,
      message: data.message,
      type: data.type || 'announcement',
      recipientType: 'individual',
      recipientCount: 1,
      recipientInfo,
      timestamp: new Date(),
    };

    setSentNotifications((prev) => [newNotification, ...prev.slice(0, 9)]);
    setTimeout(() => setSuccessMessage(null), 5000);
  };

  const handleError = (error: unknown) => {
    console.error('Failed to send notification:', error);
  };

  const getNotificationIcon = (type: AdminNotificationType) => {
    switch (type) {
      case 'announcement':
        return <Megaphone className="w-5 h-5" />;
      case 'alert':
        return <AlertTriangle className="w-5 h-5" />;
      case 'info':
        return <Info className="w-5 h-5" />;
    }
  };

  const getNotificationColor = (type: AdminNotificationType) => {
    switch (type) {
      case 'announcement':
        return 'text-primary';
      case 'alert':
        return 'text-destructive';
      case 'info':
        return 'text-blue-600';
    }
  };

  const getRecipientIcon = (recipientType: 'broadcast' | 'group' | 'individual') => {
    switch (recipientType) {
      case 'broadcast':
        return <Users className="w-4 h-4" />;
      case 'group':
        return <Users className="w-4 h-4" />;
      case 'individual':
        return <UserIcon className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Success Banner */}
      {successMessage && (
        <div className="rounded-lg border-2 border-emerald-500/50 bg-emerald-500/10 p-4 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-emerald-500 bg-emerald-500/20">
              <CheckCircle className="h-5 w-5 text-emerald-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-emerald-900 dark:text-emerald-100">
                {successMessage}
              </p>
              <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-0.5">
                Users will see this notification in their notifications panel
              </p>
            </div>
            <button
              onClick={() => setSuccessMessage(null)}
              className="text-emerald-600 hover:text-emerald-700 transition-colors"
            >
              <XCircle className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      {/* Send Notification Forms */}
      <Card className="p-6 border-2">
        <div className="flex items-center gap-3 mb-6 pb-6 border-b-2 border-border">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg border-2 border-primary bg-primary/10">
            <Send className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">Send Notification</h2>
            <p className="text-sm text-muted-foreground">
              Broadcast announcements to users across the platform
            </p>
          </div>
        </div>

        <Tabs defaultValue="broadcast" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="broadcast" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>Broadcast</span>
            </TabsTrigger>
            <TabsTrigger value="group" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>Group</span>
            </TabsTrigger>
            <TabsTrigger value="individual" className="flex items-center gap-2">
              <UserIcon className="w-4 h-4" />
              <span>Individual</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="broadcast">
            <BroadcastNotificationForm
              onSuccess={handleBroadcastSuccess}
              onError={handleError}
            />
          </TabsContent>

          <TabsContent value="group">
            <GroupNotificationForm
              onSuccess={handleGroupSuccess}
              onError={handleError}
            />
          </TabsContent>

          <TabsContent value="individual">
            <UserNotificationForm
              onSuccess={handleUserSuccess}
              onError={handleError}
            />
          </TabsContent>
        </Tabs>
      </Card>

      {/* Recent Notifications History */}
      {sentNotifications.length > 0 && (
        <Card className="p-6 border-2">
          <div className="flex items-center gap-3 mb-6 pb-6 border-b-2 border-border">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg border-2 border-border bg-muted">
              <Bell className="h-6 w-6 text-foreground" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">Recent Notifications</h2>
              <p className="text-sm text-muted-foreground">
                Last {sentNotifications.length} notifications sent
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {sentNotifications.map((notification) => (
              <div
                key={notification.id}
                className="p-4 bg-muted/30 border-2 border-border rounded-lg hover:border-primary/50 transition-colors"
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex items-start gap-3 flex-1">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-full border-2 shrink-0 ${
                      notification.type === 'announcement' ? 'border-primary bg-primary/10' :
                      notification.type === 'alert' ? 'border-destructive bg-destructive/10' :
                      'border-blue-600 bg-blue-600/10'
                    }`}>
                      <div className={getNotificationColor(notification.type)}>
                        {getNotificationIcon(notification.type)}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground mb-1">
                        {notification.title}
                      </p>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {notification.message}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className="shrink-0">
                    {notification.type}
                  </Badge>
                </div>

                <div className="flex items-center gap-4 text-xs text-muted-foreground pt-3 border-t border-border">
                  <div className="flex items-center gap-1.5">
                    {getRecipientIcon(notification.recipientType)}
                    <span>{notification.recipientInfo}</span>
                  </div>
                  {notification.recipientCount > 0 && (
                    <div className="flex items-center gap-1.5">
                      <Users className="w-3 h-3" />
                      <span>{notification.recipientCount} recipient{notification.recipientCount !== 1 ? 's' : ''}</span>
                    </div>
                  )}
                  <span className="ml-auto">
                    {format(notification.timestamp, 'MMM d, yyyy h:mm a')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
