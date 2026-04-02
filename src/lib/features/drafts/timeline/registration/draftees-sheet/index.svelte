<script lang="ts">
  import * as Sheet from '$lib/components/ui/sheet';
  import { Button } from '$lib/components/ui/button';

  import DrafteesSheetContent from './content.svelte';

  interface Props {
    draftId: string;
  }

  const { draftId }: Props = $props();
</script>

<Sheet.Root>
  <Sheet.Trigger>
    {#snippet child({ props })}
      <Button variant="outline" class="gap-2" {...props}>View All Draftees</Button>
    {/snippet}
  </Sheet.Trigger>
  <Sheet.Content side="right" class="flex w-full flex-col overflow-hidden sm:max-w-[600px]">
    <Sheet.Header>
      <Sheet.Title>All Draftees</Sheet.Title>
      <Sheet.Description>Browse registered and late draftees for this draft.</Sheet.Description>
    </Sheet.Header>
    <div class="flex min-h-0 grow flex-col overflow-y-auto px-4 pb-4">
      <DrafteesSheetContent {draftId} />
    </div>
  </Sheet.Content>
</Sheet.Root>
