<script lang="ts">
  import AvailableDraftees from '$lib/features/drafts/draftees/available/index.svelte';
  import DraftedDraftees from '$lib/features/drafts/draftees/drafted/index.svelte';
  import InterestedDraftees from '$lib/features/drafts/draftees/interested/index.svelte';
  import { Badge } from '$lib/components/ui/badge';
  import type { Lab } from '$lib/features/drafts/types';

  interface Props {
    draftId: string;
    round: number;
    lab: Lab;
  }

  const { draftId, round, lab }: Props = $props();
</script>

<div
  class="flex w-full flex-col border-b px-1 py-2 text-left last:border-0 lg:flex-row lg:justify-between"
>
  <div class="flex flex-col gap-2 overflow-auto lg:flex-row">
    {#if lab.quota !== 0}
      <Badge
        variant="outline"
        class="h-fit border-warning bg-warning/10 font-mono text-xs uppercase"
      >
        {lab.quota} maximum
      </Badge>
    {/if}
    <div class="flex h-8 gap-1 overflow-auto whitespace-nowrap">
      {#if lab.quota === 0}
        <h5 class="text-lg font-medium text-muted-foreground">{lab.name}</h5>
      {:else}
        <h5 class="text-lg font-medium">{lab.name}</h5>
      {/if}
    </div>
  </div>
  <div class="flex gap-1 sm:items-end">
    <!-- Members -->
    <DraftedDraftees {draftId} {lab} />
    <!-- Preferred -->
    <AvailableDraftees {draftId} {round} {lab} variant="see-preferred" />
    <!-- Interested -->
    <InterestedDraftees {draftId} {round} {lab} />
  </div>
</div>
