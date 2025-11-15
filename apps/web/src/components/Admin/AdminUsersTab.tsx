/**
 * AdminUsersTab Component
 *
 * User management table for the admin dashboard
 * Features search, filtering, and beautiful styling
 */

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getAllUsers } from '@repo/api-client';
import type { UserFilters } from '@repo/api-client';
import { Search, UserCheck, User as UserIcon } from 'lucide-react';
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

export function AdminUsersTab() {
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<UserFilters>({
    sortBy: 'created_at',
    sortOrder: 'desc',
  });

  const { data: users, isLoading, error } = useQuery({
    queryKey: ['admin-users', search, filters],
    queryFn: () =>
      getAllUsers({
        ...filters,
        search: search || undefined,
      }),
  });

  return (
    <div className="space-y-6">
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
                <TableHead className="font-semibold">Joined</TableHead>
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
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center border-2 border-border group-hover:border-primary/50 transition-colors">
                          <span className="text-white font-semibold text-sm">
                            {user.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-foreground group-hover:text-primary transition-colors">
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
                        className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0"
                      >
                        <UserCheck className="w-3 h-3 mr-1" />
                        Admin
                      </Badge>
                    ) : (
                      <Badge variant="secondary">
                        <UserIcon className="w-3 h-3 mr-1" />
                        User
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {format(new Date(user.created_at), 'MMM d, yyyy')}
                    </span>
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
    </div>
  );
}
