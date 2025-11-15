import { User } from '@repo/ui/components/icons';

interface Owner {
  id: string;
  name: string;
  email: string;
  avatar_url: string | null;
}

interface OwnerInfoProps {
  owner: Owner;
}

export function OwnerInfo({ owner }: OwnerInfoProps) {
  return (
    <div className="relative group">
      {/* Decorative Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/10 dark:to-orange-950/10 rounded-2xl opacity-50 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Content */}
      <div className="relative p-6 sm:p-8 rounded-2xl border border-amber-200/50 dark:border-amber-800/30 backdrop-blur-sm">
        <div className="flex items-start justify-between mb-4">
          <h2
            className="text-xl sm:text-2xl font-semibold text-foreground tracking-tight"
            style={{ fontFamily: '"Crimson Pro", serif' }}
          >
            Book Owner
          </h2>
          <div className="h-px bg-gradient-to-r from-amber-600/50 to-transparent dark:from-amber-500/50 flex-1 ml-4 mt-4" />
        </div>

        <div className="flex items-center gap-4 sm:gap-5">
          {/* Avatar with decorative ring */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full blur-md opacity-20 group-hover:opacity-40 transition-opacity duration-300" />
            {owner.avatar_url ? (
              <img
                src={owner.avatar_url}
                alt={owner.name}
                className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover ring-2 ring-amber-200 dark:ring-amber-800 ring-offset-2 ring-offset-background transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center ring-2 ring-amber-200 dark:ring-amber-800 ring-offset-2 ring-offset-background transition-transform duration-300 group-hover:scale-105">
                <User className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </div>
            )}
          </div>

          {/* Owner Details */}
          <div className="flex-1 min-w-0">
            <p
              className="text-lg sm:text-xl font-semibold text-foreground mb-1 truncate"
              style={{ fontFamily: '"Outfit", sans-serif' }}
            >
              {owner.name}
            </p>
            <p
              className="text-sm sm:text-base text-muted-foreground truncate"
              style={{ fontFamily: '"Outfit", sans-serif', fontWeight: 300 }}
            >
              {owner.email}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
