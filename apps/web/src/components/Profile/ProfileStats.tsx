/**
 * ProfileStats Component
 *
 * Displays user activity statistics in a grid layout
 */

import { Card } from '@repo/ui/components/card';
import { BookOpen, Heart, TrendingUp } from 'lucide-react';

interface UserStats {
  booksOwned: number;
  booksShared: number;
  booksBorrowed: number;
  totalExchanges: number;
}

interface ProfileStatsProps {
  stats?: UserStats | null;
}

export function ProfileStats({ stats }: ProfileStatsProps) {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Your Activity</h3>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-2 hover:border-primary/50 transition-colors">
          <div className="p-6 space-y-3">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
              <BookOpen className="w-5 h-5 text-primary" />
            </div>
            <div className="space-y-1">
              <div className="text-3xl font-bold">{stats?.booksOwned || 0}</div>
              <div className="text-sm text-muted-foreground">Books Owned</div>
            </div>
          </div>
        </Card>

        <Card className="border-2 hover:border-primary/50 transition-colors">
          <div className="p-6 space-y-3">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
              <Heart className="w-5 h-5 text-primary" />
            </div>
            <div className="space-y-1">
              <div className="text-3xl font-bold">{stats?.booksShared || 0}</div>
              <div className="text-sm text-muted-foreground">Books Shared</div>
            </div>
          </div>
        </Card>

        <Card className="border-2 hover:border-primary/50 transition-colors">
          <div className="p-6 space-y-3">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>
            <div className="space-y-1">
              <div className="text-3xl font-bold">{stats?.booksBorrowed || 0}</div>
              <div className="text-sm text-muted-foreground">Books Borrowed</div>
            </div>
          </div>
        </Card>

        <Card className="border-2 hover:border-primary/50 transition-colors">
          <div className="p-6 space-y-3">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
              <BookOpen className="w-5 h-5 text-primary" />
            </div>
            <div className="space-y-1">
              <div className="text-3xl font-bold">{stats?.totalExchanges || 0}</div>
              <div className="text-sm text-muted-foreground">Total Exchanges</div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
