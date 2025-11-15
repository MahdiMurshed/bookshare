/**
 * AdminUsersTab Component
 *
 * User management table for the admin dashboard
 * Features search, filtering, and beautiful styling
 */

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getAllUsers,
  updateUserAdminStatus,
  suspendUser,
  unsuspendUser,
  updateUserProfile,
  getUserActivityHistory,
  deleteUser,
} from '@repo/api-client';
import type { UserFilters, User, UpdateUserInput } from '@repo/api-client';
import { Search, UserCheck, User as UserIcon, AlertCircle } from 'lucide-react';
import { Card } from '@repo/ui/components/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@repo/ui/components/table';
import { Input } from '@repo/ui/components/input';
import { Badge } from '@repo/ui/components/badge';
import { Skeleton } from '@repo/ui/components/skeleton';
import { format } from 'date-fns';
import { UserActionsMenu } from './UserActionsMenu';
import { SuspendUserDialog } from './SuspendUserDialog';
import { EditUserDialog } from './EditUserDialog';
import { UserActivityDialog } from './UserActivityDialog';
import { ConfirmDialog } from './ConfirmDialog';

export function AdminUsersTab() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<UserFilters>({
    sortBy: 'created_at',
    sortOrder: 'desc',
  });

  // Dialog states
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showSuspendDialog, setShowSuspendDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showActivityDialog, setShowActivityDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const { data: users, isLoading, error } = useQuery({
    queryKey: ['admin-users', search, filters],
    queryFn: () =>
      getAllUsers({
        ...filters,
        search: search || undefined,
      }),
  });

  // Fetch activity history when dialog is opened
  const { data: activities, isLoading: isLoadingActivities } = useQuery({
    queryKey: ['user-activity', selectedUser?.id],
    queryFn: () => getUserActivityHistory(selectedUser!.id),
    enabled: showActivityDialog && !!selectedUser,
  });

  // Mutation for promoting/demoting admin
  const toggleAdminMutation = useMutation({
    mutationFn: ({ userId, isAdmin }: { userId: string; isAdmin: boolean }) =>
      updateUserAdminStatus(userId, isAdmin),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
    onError: (error: Error) => {
      setActionError(error.message);
    },
  });

  // Mutation for suspending user
  const suspendMutation = useMutation({
    mutationFn: ({ userId, reason }: { userId: string; reason: string }) =>
      suspendUser(userId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setShowSuspendDialog(false);
      setSelectedUser(null);
    },
  });

  // Mutation for unsuspending user
  const unsuspendMutation = useMutation({
    mutationFn: (userId: string) => unsuspendUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
    onError: (error: Error) => {
      setActionError(error.message);
    },
  });

  // Mutation for editing user profile
  const editUserMutation = useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: UpdateUserInput }) =>
      updateUserProfile(userId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setShowEditDialog(false);
      setSelectedUser(null);
    },
  });

  // Mutation for deleting user
  const deleteUserMutation = useMutation({
    mutationFn: (userId: string) => deleteUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setShowDeleteDialog(false);
      setSelectedUser(null);
    },
  });

  // Handle user actions
  const handleUserAction = async (action: string, user: User) => {
    setActionError(null);
    setSelectedUser(user);

    switch (action) {
      case 'promote-admin':
        await toggleAdminMutation.mutateAsync({ userId: user.id, isAdmin: true });
        break;
      case 'demote-admin':
        await toggleAdminMutation.mutateAsync({ userId: user.id, isAdmin: false });
        break;
      case 'suspend':
        setShowSuspendDialog(true);
        break;
      case 'unsuspend':
        await unsuspendMutation.mutateAsync(user.id);
        break;
      case 'edit':
        setShowEditDialog(true);
        break;
      case 'activity':
        setShowActivityDialog(true);
        break;
      case 'delete':
        setShowDeleteDialog(true);
        break;
    }
  };

  const handleSuspend = async (reason: string) => {
    if (!selectedUser) return;
    await suspendMutation.mutateAsync({ userId: selectedUser.id, reason });
  };

  const handleEditUser = async (data: UpdateUserInput) => {
    if (!selectedUser) return;
    await editUserMutation.mutateAsync({ userId: selectedUser.id, data });
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    await deleteUserMutation.mutateAsync(selectedUser.id);
  };

  return (
    <div className="space-y-6">
      {/* Error Display */}
      {actionError && (
        <div className="rounded-lg border-2 border-destructive/50 bg-destructive/10 p-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <p className="text-sm text-destructive font-medium">{actionError}</p>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={() =>
                setFilters((prev) => ({
                  ...prev,
                  sortOrder: prev.sortOrder === 'asc' ? 'desc' : 'asc',
                }))
              }
              className="px-4 py-2 rounded-lg border border-border hover:bg-accent transition-colors text-sm font-medium"
            >
              {filters.sortOrder === 'asc' ? 'Oldest First' : 'Newest First'}
            </button>
          </div>
        </div>
      </Card>

      {/* Users Table */}
      <Card className="overflow-hidden">
        {error ? (
          <div className="p-6">
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
              <p className="text-sm text-destructive">Failed to load users</p>
            </div>
          </div>
        ) : isLoading || !users ? (
          <div className="p-6 space-y-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-32" />
                </div>
                <Skeleton className="h-6 w-16" />
              </div>
            ))}
          </div>
        ) : users.length === 0 ? (
          <div className="p-12 text-center">
            <UserIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No users found</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="font-semibold">User</TableHead>
                <TableHead className="font-semibold">Email</TableHead>
                <TableHead className="font-semibold">Role</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="font-semibold">Joined</TableHead>
                <TableHead className="font-semibold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow
                  key={user.id}
                  className="group hover:bg-accent/50 transition-colors"
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {user.avatar_url ? (
                        <img
                          src={user.avatar_url}
                          alt={user.name}
                          className="w-10 h-10 rounded-full object-cover border-2 border-border group-hover:border-primary/50 transition-colors"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center border-2 border-border group-hover:border-primary transition-colors">
                          <span className="text-primary font-semibold text-sm">
                            {user.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-foreground">
                          {user.name}
                        </p>
                        {user.bio && (
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            {user.bio}
                          </p>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {user.email}
                    </span>
                  </TableCell>
                  <TableCell>
                    {user.is_admin ? (
                      <Badge
                        variant="default"
                        className="bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20"
                      >
                        <UserCheck className="w-3 h-3 mr-1" />
                        Admin
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="bg-muted text-muted-foreground">
                        <UserIcon className="w-3 h-3 mr-1" />
                        User
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {user.suspended ? (
                      <Badge variant="destructive" className="bg-destructive/10 text-destructive border border-destructive/20">
                        Suspended
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                        Active
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {format(new Date(user.created_at), 'MMM d, yyyy')}
                    </span>
                  </TableCell>
                  <TableCell>
                    <UserActionsMenu user={user} onAction={handleUserAction} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {users && users.length > 0 && (
          <div className="px-6 py-4 border-t border-border bg-muted/30">
            <p className="text-sm text-muted-foreground">
              Showing {users.length} user{users.length !== 1 ? 's' : ''}
            </p>
          </div>
        )}
      </Card>

      {/* Dialogs */}
      <SuspendUserDialog
        user={selectedUser}
        open={showSuspendDialog}
        onClose={() => {
          setShowSuspendDialog(false);
          setSelectedUser(null);
        }}
        onConfirm={handleSuspend}
      />

      <EditUserDialog
        user={selectedUser}
        open={showEditDialog}
        onClose={() => {
          setShowEditDialog(false);
          setSelectedUser(null);
        }}
        onSave={handleEditUser}
      />

      <UserActivityDialog
        user={selectedUser}
        open={showActivityDialog}
        onClose={() => {
          setShowActivityDialog(false);
          setSelectedUser(null);
        }}
        activities={activities ?? []}
        isLoading={isLoadingActivities}
      />

      <ConfirmDialog
        title="Delete User"
        description={`Are you sure you want to delete ${selectedUser?.name}? This action cannot be undone and will remove all user data including their books and borrow history.`}
        open={showDeleteDialog}
        onClose={() => {
          setShowDeleteDialog(false);
          setSelectedUser(null);
        }}
        onConfirm={handleDeleteUser}
        variant="destructive"
      />
    </div>
  );
}
