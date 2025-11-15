/**
 * UserNotificationForm Component
 *
 * Form for sending notifications to individual users
 * Includes user search and selection functionality
 */

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { sendUserNotification, getAllUsers } from '@repo/api-client';
import type { UserNotificationInput, User } from '@repo/api-client';
import { Send, Megaphone, AlertTriangle, Info, Search, User as UserIcon, CheckCircle } from 'lucide-react';
import { Button } from '@repo/ui/components/button';
import { Input } from '@repo/ui/components/input';
import { Textarea } from '@repo/ui/components/textarea';
import { Skeleton } from '@repo/ui/components/skeleton';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@repo/ui/components/form';

// Validation schema
const userNotificationSchema = z.object({
  userId: z.string().min(1, 'Please select a user'),
  title: z
    .string()
    .min(5, 'Title must be at least 5 characters')
    .max(100, 'Title must be less than 100 characters'),
  message: z
    .string()
    .min(10, 'Message must be at least 10 characters')
    .max(500, 'Message must be less than 500 characters'),
  type: z.enum(['announcement', 'alert', 'info']),
});

type UserNotificationFormValues = z.infer<typeof userNotificationSchema>;

interface UserNotificationFormProps {
  onSuccess?: (data: UserNotificationInput, user: User | undefined) => void;
  onError?: (error: unknown) => void;
}

export function UserNotificationForm({ onSuccess, onError }: UserNotificationFormProps) {
  const [userSearch, setUserSearch] = useState('');

  const form = useForm<UserNotificationFormValues>({
    resolver: zodResolver(userNotificationSchema),
    defaultValues: {
      userId: '',
      type: 'announcement',
      title: '',
      message: '',
    },
  });

  const {
    watch,
    formState: { isSubmitting },
  } = form;

  const selectedUserId = watch('userId');

  // Fetch all users for selection
  const { data: users, isLoading: isLoadingUsers } = useQuery<User[]>({
    queryKey: ['admin-all-users'],
    queryFn: () => getAllUsers({}),
  });

  // Filter users based on search
  const filteredUsers: User[] | undefined = users?.filter((user) =>
    user.name.toLowerCase().includes(userSearch.toLowerCase()) ||
    user.email.toLowerCase().includes(userSearch.toLowerCase())
  );

  const selectedUser = users?.find((u) => u.id === selectedUserId);

  const sendMutation = useMutation({
    mutationFn: sendUserNotification,
    onSuccess: (_, variables) => {
      form.reset();
      onSuccess?.(variables, selectedUser);
    },
    onError: (error) => {
      onError?.(error);
    },
  });

  const handleSubmit = async (data: UserNotificationFormValues) => {
    try {
      await sendMutation.mutateAsync(data);
    } catch (error) {
      console.error('Failed to send user notification:', error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* User Selector */}
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

        {/* Submit Button */}
        <div className="pt-4 border-t-2 border-border">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-12 text-base font-semibold border-2 border-primary"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2" />
                Sending to {selectedUser?.name || 'User'}...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Send to {selectedUser?.name || 'Selected User'}
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
