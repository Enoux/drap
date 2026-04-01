import { createQuery, skipToken } from '@tanstack/svelte-query';

import { fetchInvitedUsers } from './http';

export function createFetchInvitedUsersQuery(type: 'admins' | 'heads' | null) {
  return createQuery(() => ({
    queryKey: ['users', 'invited', type] as const,
    queryFn:
      type === null
        ? skipToken
        : async ({ queryKey: [, , t] }) => await fetchInvitedUsers(t as 'admins' | 'heads'),
  }));
}
