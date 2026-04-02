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
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';

  const { students }: Props = $props();

  let searchTerm = $state('');
  let showLateOnly = $state(false);

  const filteredStudents = $derived.by(() => {
    let result = students;
    if (searchTerm !== '') {
      const query = searchTerm.toLowerCase();
      result = result.filter(
        student =>
          student.givenName.toLowerCase().includes(query) ||
          student.familyName.toLowerCase().includes(query) ||
          student.email.toLowerCase().includes(query),
      );
    }
    if (showLateOnly) result = result.filter(student => student.isLate);
    return result;
  });

  const hasFilteredStudents = $derived(filteredStudents.length > 0);
</script>

<div class="flex min-h-0 grow flex-col gap-4">
  <div class="flex gap-2">
    <Input placeholder="Search students..." bind:value={searchTerm} class="flex-1" />
    <Button
      variant={showLateOnly ? 'secondary' : 'outline'}
      onclick={() => {
        showLateOnly = !showLateOnly;
      }}
    >
      Late Only
    </Button>
  </div>
  {#if hasFilteredStudents}
    <DataTable data={filteredStudents} />
  {:else}
    <Empty.Root class="min-h-40 grow">
      <Empty.Media variant="icon">
        <UsersIcon class="size-5" />
      </Empty.Media>
      <Empty.Header>
        <Empty.Title>No Matching Draftees</Empty.Title>
        <Empty.Description>Adjust the search or turn off the late-only filter.</Empty.Description>
      </Empty.Header>
    </Empty.Root>
  {/if}
</div>
