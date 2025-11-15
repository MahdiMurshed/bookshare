/**
 * GroupNotificationForm Component
 *
 * Form for sending notifications to specific user groups
 * Part of the admin notification system
 */

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { sendGroupNotification } from '@repo/api-client';
import type { GroupNotificationInput, UserGroup } from '@repo/api-client';
import { Send, Megaphone, AlertTriangle, Info } from 'lucide-react';
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

// Validation schema
const groupNotificationSchema = z.object({
  group: z.enum(['all', 'admins', 'borrowers', 'lenders', 'suspended']),
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

type GroupNotificationFormValues = z.infer<typeof groupNotificationSchema>;

interface GroupNotificationFormProps {
  onSuccess?: (data: GroupNotificationInput) => void;
  onError?: (error: unknown) => void;
}

const groupNames: Record<UserGroup, string> = {
  all: 'All Users',
  admins: 'Administrators',
  borrowers: 'Active Borrowers',
  lenders: 'Book Lenders',
  suspended: 'Suspended Users',
};

export function GroupNotificationForm({ onSuccess, onError }: GroupNotificationFormProps) {
  const form = useForm<GroupNotificationFormValues>({
    resolver: zodResolver(groupNotificationSchema),
    defaultValues: {
      group: 'all',
      type: 'announcement',
      title: '',
      message: '',
    },
  });

  const {
    watch,
    formState: { isSubmitting },
  } = form;

  const selectedGroup = watch('group');

  const sendMutation = useMutation({
    mutationFn: sendGroupNotification,
    onSuccess: (_, variables) => {
      form.reset();
      onSuccess?.(variables);
    },
    onError: (error) => {
      onError?.(error);
    },
  });

  const handleSubmit = async (data: GroupNotificationFormValues) => {
    try {
      await sendMutation.mutateAsync(data);
    } catch (error) {
      console.error('Failed to send group notification:', error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Group Selector */}
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
                Sending to {groupNames[selectedGroup]}...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Send to {groupNames[selectedGroup]}
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
