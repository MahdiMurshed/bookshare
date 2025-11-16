import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@repo/ui/components/dialog';
import { Button } from '@repo/ui/components/button';
import { Loader2 } from '@repo/ui/components/icons';
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
import { createCommunitySchema, type CreateCommunityFormValues } from '../../lib/validations/community';
import { useCreateCommunity } from '../../hooks/useCommunities';

interface CreateCommunityModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  userId?: string;
}

export function CreateCommunityModal({ open, onOpenChange, onSuccess, userId }: CreateCommunityModalProps) {
  const form = useForm<CreateCommunityFormValues>({
    resolver: zodResolver(createCommunitySchema),
    defaultValues: {
      name: '',
      description: '',
      avatar_url: '',
      is_private: false,
      requires_approval: true,
    },
  });

  const createCommunityMutation = useCreateCommunity(userId);
  const isPrivate = form.watch('is_private');

  const handleFormSubmit = async (values: CreateCommunityFormValues) => {
    try {
      await createCommunityMutation.mutateAsync({
        name: values.name.trim(),
        description: values.description?.trim() || undefined,
        avatar_url: values.avatar_url?.trim() || undefined,
        is_private: values.is_private,
        requires_approval: values.requires_approval,
      });

      form.reset();
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error('Failed to create community:', error);
      form.setError('root', {
        message: error instanceof Error ? error.message : 'Failed to create community. Please try again.',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Community</DialogTitle>
          <DialogDescription>
            Create a new community to share books and connect with other readers.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)}>
            <div className="space-y-6">
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
                    <FormDescription>Choose a descriptive name for your community.</FormDescription>
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
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="A community for science fiction enthusiasts to share and discuss their favorite books..."
                        className="resize-none h-24"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Brief description of your community and what members can expect.
                    </FormDescription>
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
                    <FormLabel>Avatar URL (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        type="url"
                        placeholder="https://example.com/avatar.jpg"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>URL to an image that represents your community.</FormDescription>
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

                {/* Requires Approval Toggle - Only shown if private */}
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
            </div>

            {/* Error Message */}
            {form.formState.errors.root && (
              <div className="mt-4 p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/40 rounded-md">
                <p className="text-red-600 dark:text-red-400 text-sm">{form.formState.errors.root.message}</p>
              </div>
            )}

            <DialogFooter className="mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  form.reset();
                  onOpenChange(false);
                }}
                disabled={createCommunityMutation.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createCommunityMutation.isPending}>
                {createCommunityMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Community'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
