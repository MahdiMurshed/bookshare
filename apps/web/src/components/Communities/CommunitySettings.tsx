/**
 * CommunitySettings - Edit and delete community (owners/admins only)
 *
 * Features:
 * - Edit community details (name, description, avatar, privacy settings)
 * - Delete community with confirmation
 * - Form validation with Zod
 * - Loading states
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { Community } from '@repo/api-client';
import { Card } from '@repo/ui/components/card';
import { Button } from '@repo/ui/components/button';
import { Loader2, Trash2, Settings as SettingsIcon } from '@repo/ui/components/icons';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@repo/ui/components/form';
import { Input } from '@repo/ui/components/input';
import { Textarea } from '@repo/ui/components/textarea';
import { Switch } from '@repo/ui/components/switch';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@repo/ui/components/alert-dialog';
import { editCommunitySchema, type EditCommunityFormValues } from '../../lib/validations/community';
import { useUpdateCommunity, useDeleteCommunity } from '../../hooks/useCommunities';

interface CommunitySettingsProps {
  community: Community;
  userId?: string;
}

export function CommunitySettings({ community, userId }: CommunitySettingsProps) {
  const navigate = useNavigate();
  const [saveSuccess, setSaveSuccess] = useState(false);

  const form = useForm<EditCommunityFormValues>({
    resolver: zodResolver(editCommunitySchema),
    defaultValues: {
      name: community.name,
      description: community.description || '',
      avatar_url: community.avatar_url || '',
      is_private: community.is_private,
      requires_approval: community.requires_approval,
    },
  });

  const updateCommunityMutation = useUpdateCommunity();
  const deleteCommunityMutation = useDeleteCommunity(userId);
  const isPrivate = form.watch('is_private');

  // Update form when community changes
  useEffect(() => {
    form.reset({
      name: community.name,
      description: community.description || '',
      avatar_url: community.avatar_url || '',
      is_private: community.is_private,
      requires_approval: community.requires_approval,
    });
  }, [community]);

  const handleFormSubmit = async (values: EditCommunityFormValues) => {
    try {
      await updateCommunityMutation.mutateAsync({
        id: community.id,
        data: {
          name: values.name.trim(),
          description: values.description?.trim() || undefined,
          avatar_url: values.avatar_url?.trim() || undefined,
          is_private: values.is_private,
          requires_approval: values.requires_approval,
        },
      });

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Failed to update community:', error);
      form.setError('root', {
        message: error instanceof Error ? error.message : 'Failed to update community. Please try again.',
      });
    }
  };

  const handleDeleteCommunity = async () => {
    try {
      await deleteCommunityMutation.mutateAsync(community.id);
      navigate('/communities');
    } catch (error) {
      console.error('Failed to delete community:', error);
      alert('Failed to delete community. Please try again.');
    }
  };

  return (
    <div className="space-y-8 max-w-3xl">
      {/* Edit Community Form */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <SettingsIcon className="h-5 w-5 text-muted-foreground" />
          <h3 className="text-lg font-semibold">Community Settings</h3>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
            {/* Community Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Community Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Sci-Fi Book Club" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="A community for science fiction enthusiasts..."
                      className="resize-none h-24"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Avatar URL */}
            <FormField
              control={form.control}
              name="avatar_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Avatar URL</FormLabel>
                  <FormControl>
                    <Input type="url" placeholder="https://example.com/avatar.jpg" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Privacy Settings Section */}
            <div className="space-y-4 p-4 rounded-lg border border-border bg-muted/30">
              <h4 className="text-sm font-semibold text-foreground">Privacy Settings</h4>

              {/* Private Toggle */}
              <FormField
                control={form.control}
                name="is_private"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between space-y-0">
                    <div className="space-y-0.5">
                      <FormLabel className="text-sm font-medium">Private Community</FormLabel>
                      <FormDescription className="text-xs">
                        Only members can see and access this community
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* Requires Approval Toggle */}
              {isPrivate && (
                <FormField
                  control={form.control}
                  name="requires_approval"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between space-y-0">
                      <div className="space-y-0.5">
                        <FormLabel className="text-sm font-medium">Require Approval</FormLabel>
                        <FormDescription className="text-xs">
                          Manually approve members who request to join
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              )}
            </div>

            {/* Error Message */}
            {form.formState.errors.root && (
              <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/40 rounded-md">
                <p className="text-red-600 dark:text-red-400 text-sm">
                  {form.formState.errors.root.message}
                </p>
              </div>
            )}

            {/* Success Message */}
            {saveSuccess && (
              <div className="p-3 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800/40 rounded-md">
                <p className="text-green-600 dark:text-green-400 text-sm">
                  Community settings saved successfully!
                </p>
              </div>
            )}

            <Button type="submit" disabled={updateCommunityMutation.isPending}>
              {updateCommunityMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </form>
        </Form>
      </Card>

      {/* Danger Zone - Delete Community */}
      <Card className="p-6 border-red-200 dark:border-red-800/40">
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-2">Danger Zone</h3>
            <p className="text-sm text-muted-foreground">
              Once you delete a community, there is no going back. This action cannot be undone.
            </p>
          </div>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-800/40 dark:text-red-400 dark:hover:bg-red-950/30"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Community
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete the community "{community.name}" and remove all members. This
                  action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteCommunity}
                  className="bg-red-600 hover:bg-red-700 text-white"
                  disabled={deleteCommunityMutation.isPending}
                >
                  {deleteCommunityMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    'Delete Community'
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </Card>
    </div>
  );
}
