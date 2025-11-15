/**
 * RequestActionsMenu Component
 *
 * Dropdown menu for borrow request management actions
 * Context-aware menu that shows different actions based on request status
 * Features clean monochrome design with primary accents
 */

import type { BorrowRequestWithDetails } from '@repo/api-client';
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
  CheckCircle,
  XCircle,
  Package,
  Ban,
} from 'lucide-react';

export interface RequestActionsMenuProps {
  request: BorrowRequestWithDetails;
  onAction: (action: string, request: BorrowRequestWithDetails) => void;
}

export function RequestActionsMenu({
  request,
  onAction,
}: RequestActionsMenuProps) {
  const showApprove = request.status === 'pending';
  const showDeny = request.status === 'pending';
  const showMarkReturned = request.status === 'borrowed';
  const showCancel = request.status !== 'returned';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 hover:bg-accent transition-colors"
          aria-label="Request actions"
        >
          <MoreVertical className="h-4 w-4 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56 border-2">
        {/* Approve Request - Only for pending */}
        {showApprove && (
          <DropdownMenuItem
            onClick={() => onAction('approve', request)}
            className="cursor-pointer hover:bg-accent focus:bg-accent transition-colors"
          >
            <CheckCircle className="mr-2 h-4 w-4 text-primary" />
            <span>Approve Request</span>
          </DropdownMenuItem>
        )}

        {/* Deny Request - Only for pending */}
        {showDeny && (
          <DropdownMenuItem
            onClick={() => onAction('deny', request)}
            className="cursor-pointer hover:bg-accent focus:bg-accent transition-colors"
          >
            <XCircle className="mr-2 h-4 w-4 text-muted-foreground" />
            <span>Deny Request</span>
          </DropdownMenuItem>
        )}

        {(showApprove || showDeny) && showMarkReturned && (
          <DropdownMenuSeparator />
        )}

        {/* Mark as Returned - Only for borrowed status */}
        {showMarkReturned && (
          <DropdownMenuItem
            onClick={() => onAction('mark-returned', request)}
            className="cursor-pointer hover:bg-accent focus:bg-accent transition-colors"
          >
            <Package className="mr-2 h-4 w-4 text-primary" />
            <span>Mark as Returned</span>
          </DropdownMenuItem>
        )}

        {(showApprove || showDeny || showMarkReturned) && showCancel && (
          <DropdownMenuSeparator />
        )}

        {/* Cancel Request - Show for all except returned */}
        {showCancel && (
          <DropdownMenuItem
            onClick={() => onAction('cancel', request)}
            className="cursor-pointer text-destructive focus:text-destructive hover:bg-destructive/10 focus:bg-destructive/10 transition-colors"
          >
            <Ban className="mr-2 h-4 w-4" />
            <span>Cancel Request</span>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
