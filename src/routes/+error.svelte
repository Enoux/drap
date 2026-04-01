<script>
  import Callout from '$lib/components/callout.svelte';
  import { page } from '$app/state';

  const { status, error } = $derived(page);
</script>

{#if error !== null}
  <Callout variant="destructive"><span><strong>{status}:</strong> {error.message}</span></Callout>
{:else}
  <Callout variant="destructive"><span><strong>{status}</strong></span></Callout>
{/if}
