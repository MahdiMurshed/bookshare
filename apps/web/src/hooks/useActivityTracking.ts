/**
 * Activity Tracking Hook
 *
 * Provides hooks for creating community activity records.
 * Tracks borrow requests, returns, and reviews within communities.
 */

import { useMutation } from '@tanstack/react-query';
import { createActivity, type CreateActivityInput } from '@repo/api-client';

/**
 * Hook to create a community activity record
 */
export function useCreateActivity() {
  return useMutation({
    mutationFn: async (input: CreateActivityInput) => {
      return await createActivity(input);
    },
  });
}
