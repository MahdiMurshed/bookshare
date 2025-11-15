/**
 * Hook to get the current user's full profile including admin status
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@repo/api-client';
import type { User } from '@repo/api-client';
import { useAuth } from '../contexts/AuthContext';

export function useAdminUser() {
  const { user: authUser } = useAuth();

  return useQuery({
    queryKey: ['admin-user', authUser?.id],
    queryFn: async (): Promise<User | null> => {
      if (!authUser?.id) return null;

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!authUser?.id,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
}

export function useIsAdmin() {
  const { data: user, isLoading } = useAdminUser();

  return {
    isAdmin: user?.is_admin ?? false,
    isLoading,
    user,
  };
}
