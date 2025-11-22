/**
 * AdminCommunitiesTab Component
 *
 * Community management table for the admin dashboard
 * Features search, filtering, and beautiful styling
 */

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getAllCommunities,
  adminDeleteCommunity,
  adminUpdateCommunity,
} from '@repo/api-client';
import type { AdminCommunityFilters, CommunityWithStats } from '@repo/api-client';
import { Search, UsersRound, Lock, Unlock, Trash2, Edit, Users, BookOpen } from 'lucide-react';
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
import { Button } from '@repo/ui/components/button';
import { Skeleton } from '@repo/ui/components/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@repo/ui/components/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@repo/ui/components/alert-dialog';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

export function AdminCommunitiesTab() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [filters, _setFilters] = useState<AdminCommunityFilters>({
    sortBy: 'created_at',
    sortOrder: 'desc',
  });

  // Dialog states
  const [selectedCommunity, setSelectedCommunity] = useState<CommunityWithStats | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const { data: communities, isLoading, error } = useQuery({
    queryKey: ['admin-communities', search, filters],
    queryFn: () =>
      getAllCommunities({
        ...filters,
        search: search || undefined,
      }),
  });

  // Mutation for deleting community
  const deleteCommunityMutation = useMutation({
    mutationFn: (communityId: string) => adminDeleteCommunity(communityId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-communities'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      setShowDeleteDialog(false);
      setSelectedCommunity(null);
    },
  });

  // Mutation for toggling privacy
  const togglePrivacyMutation = useMutation({
    mutationFn: ({ id, isPrivate }: { id: string; isPrivate: boolean }) =>
      adminUpdateCommunity(id, { is_private: !isPrivate }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-communities'] });
    },
  });

  const handleDelete = (community: CommunityWithStats) => {
    setSelectedCommunity(community);
    setShowDeleteDialog(true);
  };

  const handleView = (community: CommunityWithStats) => {
    navigate(`/communities/${community.id}`);
  };

  const handleTogglePrivacy = (community: CommunityWithStats) => {
    togglePrivacyMutation.mutate({ id: community.id, isPrivate: community.is_private });
  };

  if (error) {
    return (
      <Card className="p-6">
        <div className="text-center text-destructive">
          <p className="text-sm">Failed to load communities</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Search */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search communities..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1">
            <UsersRound className="w-3 h-3" />
            {communities?.length || 0} communities
          </Badge>
        </div>
      </div>

      {/* Communities Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-b-2">
              <TableHead className="font-semibold">Community</TableHead>
              <TableHead className="font-semibold">Creator</TableHead>
              <TableHead className="font-semibold">Privacy</TableHead>
              <TableHead className="font-semibold text-center">Members</TableHead>
              <TableHead className="font-semibold text-center">Books</TableHead>
              <TableHead className="font-semibold">Created</TableHead>
              <TableHead className="font-semibold text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-12" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-12" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : communities && communities.length > 0 ? (
              communities.map((community) => (
                <TableRow key={community.id} className="group">
                  <TableCell>
                    <div>
                      <p className="font-medium text-foreground">{community.name}</p>
                      {community.description && (
                        <p className="text-sm text-muted-foreground line-clamp-1 mt-0.5">
                          {community.description}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm font-medium">{community.creatorName}</p>
                      <p className="text-xs text-muted-foreground">{community.creatorEmail}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={community.is_private ? 'secondary' : 'outline'}
                      className="gap-1"
                    >
                      {community.is_private ? (
                        <>
                          <Lock className="w-3 h-3" />
                          Private
                        </>
                      ) : (
                        <>
                          <Unlock className="w-3 h-3" />
                          Public
                        </>
                      )}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">{community.memberCount}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <BookOpen className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">{community.bookCount}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {format(new Date(community.created_at), 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                        >
                          <span className="sr-only">Open menu</span>
                          <svg
                            className="h-4 w-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                            />
                          </svg>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleView(community)}>
                          <Edit className="w-4 h-4 mr-2" />
                          View Community
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleTogglePrivacy(community)}>
                          {community.is_private ? (
                            <>
                              <Unlock className="w-4 h-4 mr-2" />
                              Make Public
                            </>
                          ) : (
                            <>
                              <Lock className="w-4 h-4 mr-2" />
                              Make Private
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(community)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12">
                  <UsersRound className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                  <p className="text-muted-foreground">No communities found</p>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Community</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <span className="font-semibold">{selectedCommunity?.name}</span>?
              This will remove all members, books, and activity from this community. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => selectedCommunity && deleteCommunityMutation.mutate(selectedCommunity.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteCommunityMutation.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
