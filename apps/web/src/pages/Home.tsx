import { useAuth } from "../contexts/AuthContext";
import { Button } from "@repo/ui/components/button";

export function Home() {
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Failed to sign out:", error);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">BookShare</h1>
        {user && (
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              Welcome, {user.user_metadata?.name || user.email}
            </span>
            <Button onClick={handleSignOut} variant="outline">
              Sign Out
            </Button>
          </div>
        )}
      </div>

      <div className="max-w-2xl mx-auto text-center py-12">
        <h2 className="text-2xl font-semibold mb-4">
          Welcome to BookShare
        </h2>
        <p className="text-gray-600 mb-8">
          Share your books with the community, discover new reads, and connect
          with fellow book lovers.
        </p>

        {user ? (
          <div className="space-y-4">
            <p className="text-lg text-green-600 font-medium">
              You are signed in!
            </p>
            <p className="text-sm text-gray-500">
              Dashboard and book management features coming soon...
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-gray-700">
              Sign in to start sharing and borrowing books.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
