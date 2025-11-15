/**
 * BookActionsMenu Component
 *
 * Dropdown menu for book management actions
 * Features clean monochrome design with primary accents for dangerous actions
 */

import type { BookWithOwner } from '@repo/api-client';
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
  Edit3,
  Flag,
  FlagOff,
  Trash2,
} from 'lucide-react';

export interface BookActionsMenuProps {
  book: BookWithOwner;
  onAction: (action: string, book: BookWithOwner) => void;
}

export function BookActionsMenu({ book, onAction }: BookActionsMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 hover:bg-accent transition-colors"
          aria-label="Book actions"
        >
          <MoreVertical className="h-4 w-4 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56 border-2">
        {/* Edit Book Details */}
        <DropdownMenuItem
          onClick={() => onAction('edit', book)}
          className="cursor-pointer hover:bg-accent focus:bg-accent transition-colors"
        >
          <Edit3 className="mr-2 h-4 w-4 text-muted-foreground" />
          <span>Edit Book Details</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Flag/Unflag Book Toggle */}
        <DropdownMenuItem
          onClick={() => onAction(book.flagged ? 'unflag' : 'flag', book)}
          className="cursor-pointer hover:bg-accent focus:bg-accent transition-colors"
        >
          {book.flagged ? (
            <>
              <FlagOff className="mr-2 h-4 w-4 text-primary" />
              <span>Unflag Book</span>
            </>
          ) : (
            <>
              <Flag className="mr-2 h-4 w-4 text-muted-foreground" />
              <span>Flag Book</span>
            </>
          )}
        </DropdownMenuItem>

        {/* View Flagged Details - Only show if flagged */}
        {book.flagged && (
          <DropdownMenuItem
            onClick={() => onAction('view-flag', book)}
            className="cursor-pointer hover:bg-accent focus:bg-accent transition-colors"
          >
            <Flag className="mr-2 h-4 w-4 text-primary" />
            <span>View Flag Details</span>
          </DropdownMenuItem>
        )}

        <DropdownMenuSeparator />

        {/* Delete Book - Dangerous */}
        <DropdownMenuItem
          onClick={() => onAction('delete', book)}
          className="cursor-pointer text-destructive focus:text-destructive hover:bg-destructive/10 focus:bg-destructive/10 transition-colors"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          <span>Delete Book</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
