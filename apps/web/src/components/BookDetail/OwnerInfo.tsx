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
    <div className="border-2 border-border rounded-lg p-6 sm:p-8 bg-card">
      <h2 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight mb-4">
        Book Owner
      </h2>

      <div className="flex items-center gap-4 sm:gap-5">
        {/* Avatar */}
        <div className="relative">
          {owner.avatar_url ? (
            <img
              src={owner.avatar_url}
              alt={owner.name}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-2 border-border"
            />
          ) : (
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-primary/10 flex items-center justify-center border-2 border-border">
              <User className="w-8 h-8 sm:w-10 sm:h-10 text-primary" />
            </div>
          )}
        </div>

        {/* Owner Details */}
        <div className="flex-1 min-w-0">
          <p className="text-lg sm:text-xl font-semibold text-foreground mb-1 truncate">
            {owner.name}
          </p>
          <p className="text-sm sm:text-base text-muted-foreground truncate">
            {owner.email}
          </p>
        </div>
      </div>
    </div>
  );
}
