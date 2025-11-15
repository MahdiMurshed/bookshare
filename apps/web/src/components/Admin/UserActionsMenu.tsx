/**
 * UserActionsMenu Component
 *
 * Dropdown menu for user management actions
 * Features clean monochrome design with primary accents for dangerous actions
 */

import type { User } from '@repo/api-client';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@repo/ui/components/dropdown-menu';
import { Button } from '@repo/ui/components/button';
import {
  MoreVertical,
  ShieldCheck,
  ShieldOff,
  Ban,
  CheckCircle2,
  Edit3,
  Activity,
  Trash2,
} from 'lucide-react';

export interface UserActionsMenuProps {
  user: User;
  onAction: (action: string, user: User) => void;
}

export function UserActionsMenu({ user, onAction }: UserActionsMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 hover:bg-accent transition-colors"
          aria-label="User actions"
        >
          <MoreVertical className="h-4 w-4 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56 border-2">
        {/* Admin Toggle */}
        <DropdownMenuItem
          onClick={() => onAction(user.is_admin ? 'demote' : 'promote', user)}
          className="cursor-pointer hover:bg-accent focus:bg-accent transition-colors"
        >
          {user.is_admin ? (
            <>
              <ShieldOff className="mr-2 h-4 w-4 text-muted-foreground" />
              <span>Demote from Admin</span>
            </>
          ) : (
            <>
              <ShieldCheck className="mr-2 h-4 w-4 text-primary" />
              <span>Promote to Admin</span>
            </>
          )}
        </DropdownMenuItem>

        {/* Suspend Toggle */}
        <DropdownMenuItem
          onClick={() => onAction(user.suspended ? 'unsuspend' : 'suspend', user)}
          className="cursor-pointer hover:bg-accent focus:bg-accent transition-colors"
        >
          {user.suspended ? (
            <>
              <CheckCircle2 className="mr-2 h-4 w-4 text-primary" />
              <span>Unsuspend User</span>
            </>
          ) : (
            <>
              <Ban className="mr-2 h-4 w-4 text-muted-foreground" />
              <span>Suspend User</span>
            </>
          )}
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Edit Profile */}
        <DropdownMenuItem
          onClick={() => onAction('edit', user)}
          className="cursor-pointer hover:bg-accent focus:bg-accent transition-colors"
        >
          <Edit3 className="mr-2 h-4 w-4 text-muted-foreground" />
          <span>Edit Profile</span>
        </DropdownMenuItem>

        {/* View Activity */}
        <DropdownMenuItem
          onClick={() => onAction('activity', user)}
          className="cursor-pointer hover:bg-accent focus:bg-accent transition-colors"
        >
          <Activity className="mr-2 h-4 w-4 text-muted-foreground" />
          <span>View Activity History</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Delete User - Dangerous */}
        <DropdownMenuItem
          onClick={() => onAction('delete', user)}
          className="cursor-pointer text-destructive focus:text-destructive hover:bg-destructive/10 focus:bg-destructive/10 transition-colors"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          <span>Delete User</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
