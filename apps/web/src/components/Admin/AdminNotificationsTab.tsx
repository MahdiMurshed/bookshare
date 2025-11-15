/**
 * AdminNotificationsTab Component
 *
 * System notifications interface for the admin dashboard
 * Send broadcast, group, or individual notifications to users
 * Features form validation, preview, and notification history
 */

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
  sendBroadcastNotification,
  sendGroupNotification,
  sendUserNotification,
  getAllUsers,
} from '@repo/api-client';
import type {
  UserGroup,
  BroadcastNotificationInput,
  GroupNotificationInput,
  UserNotificationInput,
  User,
} from '@repo/api-client';
import {
  Send,
  Users,
  User as UserIcon,
  Bell,
  AlertTriangle,
  Info,
  CheckCircle,
  XCircle,
  Search,
  Megaphone,
} from 'lucide-react';
import { Card } from '@repo/ui/components/card';
import { Button } from '@repo/ui/components/button';
import { Input } from '@repo/ui/components/input';
import { Textarea } from '@repo/ui/components/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@repo/ui/components/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/ui/components/select';
import { Skeleton } from '@repo/ui/components/skeleton';
import { Badge } from '@repo/ui/components/badge';
import { format } from 'date-fns';

// Validation schema
const notificationSchema = z.object({
  recipientType: z.enum(['broadcast', 'group', 'individual']),
  group: z.enum(['all', 'admins', 'borrowers', 'lenders', 'suspended']).optional(),
  userId: z.string().optional(),
  title: z
    .string()
    .min(5, 'Title must be at least 5 characters')
    .max(100, 'Title must be less than 100 characters'),
  message: z
    .string()
    .min(10, 'Message must be at least 10 characters')
    .max(500, 'Message must be less than 500 characters'),
  type: z.enum(['announcement', 'alert', 'info']),
}).refine(
  (data) => {
    if (data.recipientType === 'group') {
      return !!data.group;
    }
    return true;
  },
  {
    message: 'Please select a user group',
    path: ['group'],
  }
).refine(
  (data) => {
    if (data.recipientType === 'individual') {
      return !!data.userId;
    }
    return true;
  },
  {
    message: 'Please select a user',
    path: ['userId'],
  }
);

type NotificationFormValues = z.infer<typeof notificationSchema>;

// Sent notification type for history
interface SentNotification {
  id: string;
  title: string;
  message: string;
  type: 'announcement' | 'alert' | 'info';
  recipientType: 'broadcast' | 'group' | 'individual';
  recipientCount: number;
  recipientInfo: string;
  timestamp: Date;
}

export function AdminNotificationsTab() {
  const [userSearch, setUserSearch] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [sentNotifications, setSentNotifications] = useState<SentNotification[]>([]);

  const form = useForm<NotificationFormValues>({
    resolver: zodResolver(notificationSchema),
    defaultValues: {
      recipientType: 'broadcast',
      type: 'announcement',
      title: '',
      message: '',
    },
  });

  const {
    watch,
    formState: { isSubmitting },
  } = form;

  const recipientType = watch('recipientType');
  const selectedGroup = watch('group');
  const selectedUserId = watch('userId');
  const notificationTitle = watch('title');
  const notificationMessage = watch('message');
  const notificationType = watch('type');

  // Fetch all users for individual selection
  const { data: users, isLoading: isLoadingUsers } = useQuery<User[]>({
    queryKey: ['admin-all-users'],
    queryFn: () => getAllUsers({}),
    enabled: recipientType === 'individual',
  });

  // Filter users based on search
  const filteredUsers: User[] | undefined = users?.filter((user) =>
    user.name.toLowerCase().includes(userSearch.toLowerCase()) ||
    user.email.toLowerCase().includes(userSearch.toLowerCase())
  );

  // Mutation for sending broadcast notification
  const sendBroadcastMutation = useMutation({
    mutationFn: sendBroadcastNotification,
    onSuccess: (_, variables) => {
      handleNotificationSent('broadcast', 'All Users', variables);
    },
  });

  // Mutation for sending group notification
  const sendGroupMutation = useMutation({
    mutationFn: sendGroupNotification,
    onSuccess: (_, variables) => {
      const groupNames: Record<UserGroup, string> = {
        all: 'All Users',
        admins: 'Administrators',
        borrowers: 'Active Borrowers',
        lenders: 'Book Lenders',
        suspended: 'Suspended Users',
      };
      handleNotificationSent('group', groupNames[variables.group], variables);
    },
  });

  // Mutation for sending individual notification
  const sendUserMutation = useMutation({
    mutationFn: sendUserNotification,
    onSuccess: (_, variables) => {
      const user = users?.find((u) => u.id === variables.userId);
      handleNotificationSent('individual', user?.name || 'User', variables);
    },
  });

  const handleNotificationSent = (
    type: 'broadcast' | 'group' | 'individual',
    recipientInfo: string,
    variables: BroadcastNotificationInput | GroupNotificationInput | UserNotificationInput
  ) => {
    const recipientCount = type === 'individual' ? 1 : type === 'broadcast' ? (users?.length || 0) : 0;

    setSuccessMessage(`Notification sent successfully to ${recipientInfo}`);

    // Add to sent notifications history
    const newNotification: SentNotification = {
      id: Date.now().toString(),
      title: variables.title,
      message: variables.message,
      type: variables.type || 'announcement',
      recipientType: type,
      recipientCount,
      recipientInfo,
      timestamp: new Date(),
    };

    setSentNotifications((prev) => [newNotification, ...prev.slice(0, 9)]);

    // Reset form
    form.reset({
      recipientType: 'broadcast',
      type: 'announcement',
      title: '',
      message: '',
    });
    setShowPreview(false);

    // Auto-hide success message after 5 seconds
    setTimeout(() => setSuccessMessage(null), 5000);
  };

  const handleSubmit = async (data: NotificationFormValues) => {
    try {
      setSuccessMessage(null);

      if (data.recipientType === 'broadcast') {
        await sendBroadcastMutation.mutateAsync({
          title: data.title,
          message: data.message,
          type: data.type,
        });
      } else if (data.recipientType === 'group' && data.group) {
        await sendGroupMutation.mutateAsync({
          group: data.group,
          title: data.title,
          message: data.message,
          type: data.type,
        });
      } else if (data.recipientType === 'individual' && data.userId) {
        await sendUserMutation.mutateAsync({
          userId: data.userId,
          title: data.title,
          message: data.message,
          type: data.type,
        });
      }
    } catch (error) {
      console.error('Failed to send notification:', error);
    }
  };

  const getNotificationIcon = (type: 'announcement' | 'alert' | 'info') => {
    switch (type) {
      case 'announcement':
        return <Megaphone className="w-5 h-5" />;
      case 'alert':
        return <AlertTriangle className="w-5 h-5" />;
      case 'info':
        return <Info className="w-5 h-5" />;
    }
  };

  const getNotificationColor = (type: 'announcement' | 'alert' | 'info') => {
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

  const selectedUser = users?.find((u) => u.id === selectedUserId);

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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Send Notification Form */}
        <div className="lg:col-span-2">
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

            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                {/* Recipient Type */}
                <FormField
                  control={form.control}
                  name="recipientType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-semibold">Recipient Type</FormLabel>
                      <FormDescription>
                        Choose who should receive this notification
                      </FormDescription>
                      <FormControl>
                        <div className="grid grid-cols-3 gap-3">
                          <button
                            type="button"
                            onClick={() => field.onChange('broadcast')}
                            className={`p-4 rounded-lg border-2 transition-all ${
                              field.value === 'broadcast'
                                ? 'border-primary bg-primary/10 shadow-sm'
                                : 'border-border bg-background hover:border-primary/50'
                            }`}
                          >
                            <Users className={`w-5 h-5 mx-auto mb-2 ${
                              field.value === 'broadcast' ? 'text-primary' : 'text-muted-foreground'
                            }`} />
                            <p className={`text-sm font-medium ${
                              field.value === 'broadcast' ? 'text-primary' : 'text-foreground'
                            }`}>
                              Broadcast
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">All users</p>
                          </button>

                          <button
                            type="button"
                            onClick={() => field.onChange('group')}
                            className={`p-4 rounded-lg border-2 transition-all ${
                              field.value === 'group'
                                ? 'border-primary bg-primary/10 shadow-sm'
                                : 'border-border bg-background hover:border-primary/50'
                            }`}
                          >
                            <Users className={`w-5 h-5 mx-auto mb-2 ${
                              field.value === 'group' ? 'text-primary' : 'text-muted-foreground'
                            }`} />
                            <p className={`text-sm font-medium ${
                              field.value === 'group' ? 'text-primary' : 'text-foreground'
                            }`}>
                              Group
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">User groups</p>
                          </button>

                          <button
                            type="button"
                            onClick={() => field.onChange('individual')}
                            className={`p-4 rounded-lg border-2 transition-all ${
                              field.value === 'individual'
                                ? 'border-primary bg-primary/10 shadow-sm'
                                : 'border-border bg-background hover:border-primary/50'
                            }`}
                          >
                            <UserIcon className={`w-5 h-5 mx-auto mb-2 ${
                              field.value === 'individual' ? 'text-primary' : 'text-muted-foreground'
                            }`} />
                            <p className={`text-sm font-medium ${
                              field.value === 'individual' ? 'text-primary' : 'text-foreground'
                            }`}>
                              Individual
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">Single user</p>
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Group Selector (conditional) */}
                {recipientType === 'group' && (
                  <FormField
                    control={form.control}
                    name="group"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-semibold">User Group</FormLabel>
                        <FormDescription>
                          Select which group of users to notify
                        </FormDescription>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="border-2">
                              <SelectValue placeholder="Select a user group" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="all">All Users</SelectItem>
                            <SelectItem value="admins">Administrators</SelectItem>
                            <SelectItem value="borrowers">Active Borrowers</SelectItem>
                            <SelectItem value="lenders">Book Lenders</SelectItem>
                            <SelectItem value="suspended">Suspended Users</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {/* User Selector (conditional) */}
                {recipientType === 'individual' && (
                  <FormField
                    control={form.control}
                    name="userId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-semibold">Select User</FormLabel>
                        <FormDescription>
                          Search and select a user to send notification
                        </FormDescription>
                        <div className="space-y-3">
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                              placeholder="Search by name or email..."
                              value={userSearch}
                              onChange={(e) => setUserSearch(e.target.value)}
                              className="pl-10 border-2"
                            />
                          </div>

                          {isLoadingUsers ? (
                            <div className="space-y-2 p-4 border-2 border-border rounded-lg max-h-64 overflow-y-auto">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <div key={i} className="flex items-center gap-3">
                                  <Skeleton className="h-10 w-10 rounded-full" />
                                  <div className="flex-1 space-y-1">
                                    <Skeleton className="h-4 w-32" />
                                    <Skeleton className="h-3 w-24" />
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : filteredUsers && filteredUsers.length > 0 ? (
                            <div className="border-2 border-border rounded-lg max-h-64 overflow-y-auto">
                              {filteredUsers.map((user) => (
                                <button
                                  key={user.id}
                                  type="button"
                                  onClick={() => {
                                    field.onChange(user.id);
                                    setUserSearch('');
                                  }}
                                  className={`w-full flex items-center gap-3 p-3 border-b border-border last:border-b-0 transition-colors ${
                                    field.value === user.id
                                      ? 'bg-primary/10'
                                      : 'hover:bg-accent'
                                  }`}
                                >
                                  {user.avatar_url ? (
                                    <img
                                      src={user.avatar_url}
                                      alt={user.name}
                                      className="w-10 h-10 rounded-full object-cover border-2 border-border"
                                    />
                                  ) : (
                                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center border-2 border-border">
                                      <span className="text-primary font-semibold text-sm">
                                        {user.name.charAt(0).toUpperCase()}
                                      </span>
                                    </div>
                                  )}
                                  <div className="flex-1 text-left">
                                    <p className="font-medium text-sm text-foreground">
                                      {user.name}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      {user.email}
                                    </p>
                                  </div>
                                  {field.value === user.id && (
                                    <CheckCircle className="w-5 h-5 text-primary" />
                                  )}
                                </button>
                              ))}
                            </div>
                          ) : (
                            <div className="p-8 text-center border-2 border-dashed border-border rounded-lg">
                              <UserIcon className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                              <p className="text-sm text-muted-foreground">
                                {userSearch ? 'No users found' : 'Start typing to search'}
                              </p>
                            </div>
                          )}

                          {/* Selected User Display */}
                          {field.value && selectedUser && (
                            <div className="p-4 bg-primary/5 border-2 border-primary/20 rounded-lg">
                              <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-2">
                                Selected User
                              </p>
                              <div className="flex items-center gap-3">
                                {selectedUser.avatar_url ? (
                                  <img
                                    src={selectedUser.avatar_url}
                                    alt={selectedUser.name}
                                    className="w-10 h-10 rounded-full object-cover border-2 border-primary"
                                  />
                                ) : (
                                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center border-2 border-primary">
                                    <span className="text-primary font-semibold">
                                      {selectedUser.name.charAt(0).toUpperCase()}
                                    </span>
                                  </div>
                                )}
                                <div>
                                  <p className="font-semibold text-foreground">
                                    {selectedUser.name}
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    {selectedUser.email}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {/* Notification Type */}
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-semibold">Notification Type</FormLabel>
                      <FormDescription>
                        Choose the style and urgency of the notification
                      </FormDescription>
                      <FormControl>
                        <div className="grid grid-cols-3 gap-3">
                          <button
                            type="button"
                            onClick={() => field.onChange('announcement')}
                            className={`p-4 rounded-lg border-2 transition-all ${
                              field.value === 'announcement'
                                ? 'border-primary bg-primary/10 shadow-sm'
                                : 'border-border bg-background hover:border-primary/50'
                            }`}
                          >
                            <Megaphone className={`w-5 h-5 mx-auto mb-2 ${
                              field.value === 'announcement' ? 'text-primary' : 'text-muted-foreground'
                            }`} />
                            <p className={`text-sm font-medium ${
                              field.value === 'announcement' ? 'text-primary' : 'text-foreground'
                            }`}>
                              Announcement
                            </p>
                          </button>

                          <button
                            type="button"
                            onClick={() => field.onChange('alert')}
                            className={`p-4 rounded-lg border-2 transition-all ${
                              field.value === 'alert'
                                ? 'border-destructive bg-destructive/10 shadow-sm'
                                : 'border-border bg-background hover:border-destructive/50'
                            }`}
                          >
                            <AlertTriangle className={`w-5 h-5 mx-auto mb-2 ${
                              field.value === 'alert' ? 'text-destructive' : 'text-muted-foreground'
                            }`} />
                            <p className={`text-sm font-medium ${
                              field.value === 'alert' ? 'text-destructive' : 'text-foreground'
                            }`}>
                              Alert
                            </p>
                          </button>

                          <button
                            type="button"
                            onClick={() => field.onChange('info')}
                            className={`p-4 rounded-lg border-2 transition-all ${
                              field.value === 'info'
                                ? 'border-blue-600 bg-blue-600/10 shadow-sm'
                                : 'border-border bg-background hover:border-blue-600/50'
                            }`}
                          >
                            <Info className={`w-5 h-5 mx-auto mb-2 ${
                              field.value === 'info' ? 'text-blue-600' : 'text-muted-foreground'
                            }`} />
                            <p className={`text-sm font-medium ${
                              field.value === 'info' ? 'text-blue-600' : 'text-foreground'
                            }`}>
                              Info
                            </p>
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Title */}
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-semibold">
                        Notification Title
                      </FormLabel>
                      <FormDescription>
                        A clear, concise title (5-100 characters)
                      </FormDescription>
                      <FormControl>
                        <Input
                          placeholder="e.g., New Feature: Book Wishlists"
                          {...field}
                          className="border-2 text-base"
                        />
                      </FormControl>
                      <div className="flex items-center justify-between">
                        <FormMessage />
                        <span className="text-xs text-muted-foreground">
                          {field.value.length}/100
                        </span>
                      </div>
                    </FormItem>
                  )}
                />

                {/* Message */}
                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-semibold">
                        Notification Message
                      </FormLabel>
                      <FormDescription>
                        The main content of your notification (10-500 characters)
                      </FormDescription>
                      <FormControl>
                        <Textarea
                          placeholder="e.g., We've added a new feature that lets you create wishlists for books you want to read. Check it out in your profile!"
                          {...field}
                          className="border-2 min-h-32 resize-none text-base"
                        />
                      </FormControl>
                      <div className="flex items-center justify-between">
                        <FormMessage />
                        <span className="text-xs text-muted-foreground">
                          {field.value.length}/500
                        </span>
                      </div>
                    </FormItem>
                  )}
                />

                {/* Action Buttons */}
                <div className="flex items-center gap-3 pt-4 border-t-2 border-border">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 h-12 text-base font-semibold border-2 border-primary"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2" />
                        Sending Notification...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Send Notification
                      </>
                    )}
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowPreview(!showPreview)}
                    className="h-12 border-2"
                  >
                    <Bell className="w-4 h-4 mr-2" />
                    {showPreview ? 'Hide' : 'Show'} Preview
                  </Button>
                </div>
              </form>
            </Form>
          </Card>
        </div>

        {/* Preview Panel */}
        <div className="lg:col-span-1">
          <Card className="p-6 border-2 sticky top-6">
            <div className="flex items-center gap-2 mb-4 pb-4 border-b-2 border-border">
              <Bell className="w-5 h-5 text-primary" />
              <h3 className="font-bold text-foreground">Preview</h3>
            </div>

            {showPreview && notificationTitle && notificationMessage ? (
              <div className="space-y-4">
                <div className="p-4 bg-background border-2 border-border rounded-lg shadow-sm">
                  <div className="flex items-start gap-3 mb-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${
                      notificationType === 'announcement' ? 'border-primary bg-primary/10' :
                      notificationType === 'alert' ? 'border-destructive bg-destructive/10' :
                      'border-blue-600 bg-blue-600/10'
                    }`}>
                      <div className={getNotificationColor(notificationType)}>
                        {getNotificationIcon(notificationType)}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground text-sm mb-1">
                        {notificationTitle}
                      </p>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {notificationMessage}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-border">
                    <span className="text-xs text-muted-foreground">
                      Just now
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {notificationType}
                    </Badge>
                  </div>
                </div>

                {/* Recipient Info */}
                <div className="p-3 bg-muted/30 border border-border rounded-lg">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                    Recipients
                  </p>
                  <div className="flex items-center gap-2">
                    {getRecipientIcon(recipientType)}
                    <span className="text-sm font-medium text-foreground">
                      {recipientType === 'broadcast' && 'All Users'}
                      {recipientType === 'group' && selectedGroup && (
                        {
                          all: 'All Users',
                          admins: 'Administrators',
                          borrowers: 'Active Borrowers',
                          lenders: 'Book Lenders',
                          suspended: 'Suspended Users',
                        }[selectedGroup]
                      )}
                      {recipientType === 'individual' && selectedUser && selectedUser.name}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center">
                <Bell className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">
                  Fill out the form to see a preview
                </p>
              </div>
            )}
          </Card>
        </div>
      </div>

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
