<script lang="ts">
  import FlaskConicalIcon from '@lucide/svelte/icons/flask-conical';
  import GraduationCapIcon from '@lucide/svelte/icons/graduation-cap';
  import PaperclipIcon from '@lucide/svelte/icons/paperclip';
  import ChevronDownIcon from '@lucide/svelte/icons/chevron-down';

  import * as Tabs from '$lib/components/ui/tabs';
  import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
  import { Button } from '$lib/components/ui/button';
  
  import AvailableDraftees from '$lib/features/drafts/draftees/available/index.svelte';
  import AvailableLoader from '$lib/features/drafts/draftees/available/loader.svelte';
  
  import DraftedDraftees from '$lib/features/drafts/draftees/drafted/index.svelte';
  import DraftedLoader from '$lib/features/drafts/draftees/drafted/loader.svelte';

  import SystemLogsLoader from '$lib/features/drafts/system-logs/loader.svelte';
  import type { Lab } from '$lib/features/drafts/types';

  import LabRoundSummary from './lab-round-summary.svelte';

  type TabType = 'students' | 'labs' | 'logs';

  interface Props {
    draftId: string;
    requestedAt: Date;
    round: number;
    labs: Lab[];
  }

  const { draftId, requestedAt, round, labs }: Props = $props();

  let group: TabType = $state('students');
  let selectedView = $state<'pending' | 'drafted'>('pending');
  let dropdownOpen = $state(false);
</script>

<Tabs.Root
  value={group}
  onValueChange={value => {
    if (value === 'students' || value === 'labs' || value === 'logs') group = value;
  }}
>
  <div class="flex justify-around sm:justify-normal">
    <Tabs.List class="grid h-full w-full grid-cols-3">
      <Tabs.Trigger value="students">
        <GraduationCapIcon class="size-5" />
        <span class="sr-only md:not-sr-only">Registered Students</span>
      </Tabs.Trigger>
      <Tabs.Trigger value="labs">
        <FlaskConicalIcon class="size-5" />
        <span class="sr-only md:not-sr-only">Laboratories</span>
      </Tabs.Trigger>
      <Tabs.Trigger value="logs">
        <PaperclipIcon class="size-5" />
        <span class="sr-only md:not-sr-only">System Logs</span>
      </Tabs.Trigger>
    </Tabs.List>
  </div>
  <Tabs.Content value="students">
    <div class="mb-2">
      <DropdownMenu.Root bind:open={dropdownOpen}>
        <DropdownMenu.Trigger>
          {#snippet child({ props })}
            <Button
              {...props}
              variant="outline"
              class="bg-background hover:bg-accent dark:bg-input dark:hover:bg-input/80"
            >
              <ChevronDownIcon
                class="size-4 text-muted-foreground transition-transform {dropdownOpen ? 'rotate-180' : ''}"
              />
              {selectedView === 'pending'
                ? 'Pending Selection'
                : 'Already Drafted'}
            </Button>
          {/snippet}
        </DropdownMenu.Trigger>
        <DropdownMenu.Content align="start">
          <DropdownMenu.Item onclick={() => (selectedView = 'pending')}>
            <span>Pending Selection</span>
          </DropdownMenu.Item>
          <DropdownMenu.Item onclick={() => (selectedView = 'drafted')}>
            <span>Already Drafted</span>
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Root>
    </div>

    {#if selectedView === 'pending'}
      <AvailableLoader {draftId} />
    {:else if selectedView === 'drafted'}
      <DraftedLoader {draftId} />
    {/if}
  </Tabs.Content>
  <Tabs.Content value="labs" class="min-w-0 overflow-auto">
    {#each labs as lab (lab.id)}
      <LabRoundSummary {draftId} {round} {lab} />
    {/each}
  </Tabs.Content>
  <Tabs.Content value="logs">
    {#if group === 'logs'}
      <SystemLogsLoader {draftId} {requestedAt} />
    {/if}
  </Tabs.Content>
</Tabs.Root>
