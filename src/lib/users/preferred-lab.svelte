<script lang="ts">
  import { Badge } from '$lib/components/ui/badge';

  interface Props {
    labs: string[];
  }

  const { labs }: Props = $props();
</script>

<div class="overflow-x-auto">
  {#each labs as lab (lab)}
    <Badge variant="outline" class="mr-1 border-accent bg-accent/10 text-xs uppercase h-fit py-1 px-2">
      {lab}
    </Badge>
  {/each}
</div>
