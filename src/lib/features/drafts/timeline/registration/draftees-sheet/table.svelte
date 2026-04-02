<script lang="ts" module>
  import type { Student } from '$lib/features/drafts/types';

  export interface ExtendedStudent extends Student {
    isLate: boolean;
  }

  export interface Props {
    students: ExtendedStudent[];
  }
</script>

<script lang="ts">
  import UsersIcon from '@lucide/svelte/icons/users';

  import * as Empty from '$lib/components/ui/empty';
  import DataTable from '$lib/features/drafts/draftees/data-table.svelte';

  const { students }: Props = $props();
</script>

<DataTable data={students} variant="registration-sheet">
  <Empty.Root class="min-h-40 grow">
    <Empty.Media variant="icon">
      <UsersIcon class="size-5" />
    </Empty.Media>
    <Empty.Header>
      <Empty.Title>No Matching Draftees</Empty.Title>
      <Empty.Description>Adjust the search or turn off the late-only filter.</Empty.Description>
    </Empty.Header>
  </Empty.Root>
</DataTable>
