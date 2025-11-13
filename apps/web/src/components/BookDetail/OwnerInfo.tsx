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
    <div className="border-t pt-6 mb-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-3">Owner</h2>
      <div className="flex items-center gap-3">
        {owner.avatar_url ? (
          <img
            src={owner.avatar_url}
            alt={owner.name}
            className="w-12 h-12 rounded-full object-cover"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-indigo-200 flex items-center justify-center">
            <User className="w-6 h-6 text-indigo-700" />
          </div>
        )}
        <div>
          <p className="font-semibold text-gray-900">{owner.name}</p>
          <p className="text-sm text-gray-600">{owner.email}</p>
        </div>
      </div>
    </div>
  );
}
