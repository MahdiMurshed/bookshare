/**
 * EditUserDialog Component
 *
 * Dialog for editing user profile information
 * Features react-hook-form validation with clean monochrome design
 */

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { User, UpdateUserInput } from '@repo/api-client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@repo/ui/components/dialog';
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
} from '@repo/ui/components/form';
import { Edit3 } from 'lucide-react';

// Validation schema
const editUserSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters'),
  bio: z
    .string()
    .max(500, 'Bio must be less than 500 characters')
    .optional(),
  avatar_url: z
    .string()
    .url('Must be a valid URL')
    .or(z.literal(''))
    .optional(),
});

type EditUserFormValues = z.infer<typeof editUserSchema>;

export interface EditUserDialogProps {
  user: User | null;
  open: boolean;
  onClose: () => void;
  onSave: (data: UpdateUserInput) => Promise<void>;
}

export function EditUserDialog({
  user,
  open,
  onClose,
  onSave,
}: EditUserDialogProps) {
  const form = useForm<EditUserFormValues>({
    resolver: zodResolver(editUserSchema),
    defaultValues: {
      name: '',
      bio: '',
      avatar_url: '',
    },
  });

  const {
    formState: { isSubmitting },
  } = form;

  // Reset form when user changes
  useEffect(() => {
    if (user) {
      form.reset({
        name: user.name || '',
        bio: user.bio || '',
        avatar_url: user.avatar_url || '',
      });
    }
  }, [user]);

  const handleSubmit = async (data: EditUserFormValues) => {
    try {
      // Only include fields that have values
      const updateData: UpdateUserInput = {
        name: data.name,
        bio: data.bio || undefined,
        avatar_url: data.avatar_url || undefined,
      };

      await onSave(updateData);
      onClose();
    } catch (error) {
      // Error handling is done in the parent component
      console.error('Failed to update user:', error);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      form.reset();
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[550px] border-2">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="rounded-lg bg-primary/10 p-2 border border-primary/20">
              <Edit3 className="w-5 h-5 text-primary" strokeWidth={2} />
            </div>
            <DialogTitle className="text-xl">Edit User Profile</DialogTitle>
          </div>
          <DialogDescription className="text-muted-foreground">
            Update profile information for {user?.name}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 py-4">
            {/* Name Field */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-medium">Full Name</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Enter user's full name"
                      disabled={isSubmitting}
                      className="border-2 focus-visible:ring-2 focus-visible:ring-primary transition-all"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Bio Field */}
            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-medium">Bio</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Enter user's bio (optional)"
                      disabled={isSubmitting}
                      className="min-h-[100px] resize-none border-2 focus-visible:ring-2 focus-visible:ring-primary transition-all"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Avatar URL Field */}
            <FormField
              control={form.control}
              name="avatar_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-medium">Avatar URL</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="https://example.com/avatar.jpg (optional)"
                      disabled={isSubmitting}
                      className="border-2 focus-visible:ring-2 focus-visible:ring-primary transition-all"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Preview avatar if URL exists */}
            {form.watch('avatar_url') && (
              <div className="rounded-lg border-2 border-border bg-muted/30 p-4">
                <p className="text-sm font-medium text-muted-foreground mb-3">
                  Avatar Preview
                </p>
                <div className="flex items-center gap-3">
                  <img
                    src={form.watch('avatar_url')}
                    alt="Avatar preview"
                    className="w-16 h-16 rounded-full object-cover border-2 border-border"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                  <p className="text-sm text-muted-foreground">
                    This avatar will be displayed on the user's profile
                  </p>
                </div>
              </div>
            )}

            <DialogFooter className="gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isSubmitting}
                className="border-2"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="min-w-[120px]"
              >
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
