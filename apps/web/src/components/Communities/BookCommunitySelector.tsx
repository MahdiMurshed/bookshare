/**
 * BookCommunitySelector - Multi-select component for assigning books to communities
 *
 * Features:
 * - Shows user's communities as checkboxes
 * - Indicates which communities the book is currently in
 * - Allows adding/removing book from multiple communities
 * - Beautiful checkbox design with community info
 * - Loading and empty states
 */

import { useState, useEffect } from 'react';
import type { Community } from '@repo/api-client';
import { Card } from '@repo/ui/components/card';
import { Checkbox } from '@repo/ui/components/checkbox';
import { Label } from '@repo/ui/components/label';
import { Badge } from '@repo/ui/components/badge';
import { Loader2, Users, Lock, Globe } from '@repo/ui/components/icons';
import { useMyCommunities } from '../../hooks/useCommunities';

interface BookCommunitySelectorProps {
  userId?: string;
  selectedCommunityIds: string[];
  onSelectionChange: (communityIds: string[]) => void;
}

export function BookCommunitySelector({
  userId,
  selectedCommunityIds,
  onSelectionChange,
}: BookCommunitySelectorProps) {
  const { data: myCommunities = [], isLoading } = useMyCommunities(userId);
  const [localSelectedIds, setLocalSelectedIds] = useState<string[]>(selectedCommunityIds);

  // Sync with parent when selectedCommunityIds changes
  useEffect(() => {
    setLocalSelectedIds(selectedCommunityIds);
  }, [selectedCommunityIds]);

  const handleToggleCommunity = (communityId: string, checked: boolean) => {
    const newSelection = checked
      ? [...localSelectedIds, communityId]
      : localSelectedIds.filter((id) => id !== communityId);

    setLocalSelectedIds(newSelection);
    onSelectionChange(newSelection);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (myCommunities.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="rounded-full bg-muted p-4 mx-auto w-fit mb-3">
          <Users className="h-6 w-6 text-muted-foreground" />
        </div>
        <p className="text-sm text-muted-foreground">
          You're not a member of any communities yet. Join communities to share your books with them.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-2">
        <Label className="text-sm font-medium">Share with Communities (Optional)</Label>
        {localSelectedIds.length > 0 && (
          <Badge variant="secondary" className="text-xs">
            {localSelectedIds.length} selected
          </Badge>
        )}
      </div>

      <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
        {myCommunities.map((community) => {
          const isSelected = localSelectedIds.includes(community.id);

          return (
            <Card
              key={community.id}
              className={`p-4 cursor-pointer transition-colors hover:bg-muted/50 ${
                isSelected ? 'border-primary bg-primary/5' : ''
              }`}
              onClick={() => handleToggleCommunity(community.id, !isSelected)}
            >
              <div className="flex items-start gap-3">
                <Checkbox
                  id={`community-${community.id}`}
                  checked={isSelected}
                  onCheckedChange={(checked) =>
                    handleToggleCommunity(community.id, checked as boolean)
                  }
                  className="mt-1"
                  onClick={(e) => e.stopPropagation()}
                />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Label
                      htmlFor={`community-${community.id}`}
                      className="text-sm font-medium cursor-pointer"
                    >
                      {community.name}
                    </Label>
                    <Badge
                      variant="outline"
                      className={`text-[10px] px-1.5 py-0 ${
                        community.is_private
                          ? 'border-amber-200 text-amber-700 dark:border-amber-800/40 dark:text-amber-400'
                          : 'border-emerald-200 text-emerald-700 dark:border-emerald-800/40 dark:text-emerald-400'
                      }`}
                    >
                      {community.is_private ? (
                        <>
                          <Lock className="h-2.5 w-2.5 mr-0.5" />
                          Private
                        </>
                      ) : (
                        <>
                          <Globe className="h-2.5 w-2.5 mr-0.5" />
                          Public
                        </>
                      )}
                    </Badge>
                  </div>

                  {community.description && (
                    <p className="text-xs text-muted-foreground line-clamp-1">
                      {community.description}
                    </p>
                  )}

                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {community.memberCount || 0}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <p className="text-xs text-muted-foreground">
        Select the communities where you want to share this book. Members of these communities will be able
        to discover and borrow it.
      </p>
    </div>
  );
}
