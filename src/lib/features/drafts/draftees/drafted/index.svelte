<script lang="ts">
  import * as Sheet from '$lib/components/ui/sheet';
  import { Button } from '$lib/components/ui/button';

  import Loader, { type Props } from './loader.svelte';

  const loaderProps: Props = $props();
</script>

<Sheet.Root>
  <Sheet.Trigger>
    {#snippet child({ props })}
      {#if typeof loaderProps.lab === 'undefined'}
        <Button variant="outline" class="border-primary text-primary" {...props}
          >Already Drafted</Button
        >
      {:else}
        <Button
          variant="outline"
          class="h-fit border-primary bg-primary/10 font-mono text-xs uppercase"
          {...props}>Members</Button
        >
      {/if}
    {/snippet}
  </Sheet.Trigger>
  <Sheet.Content side="right" class="flex w-full flex-col overflow-hidden sm:max-w-[600px]">
    <Sheet.Header>
      <Sheet.Title>
        {#if typeof loaderProps.lab === 'undefined'}
          Already Drafted
        {:else}
          Lab Members
        {/if}
      </Sheet.Title>
      <Sheet.Description>Review students who have already been assigned.</Sheet.Description>
    </Sheet.Header>
    <div class="flex min-h-0 grow flex-col overflow-y-auto px-4 pb-4">
      <Loader {...loaderProps} />
    </div>
  </Sheet.Content>
</Sheet.Root>
