<script lang="ts">
  import ArrowUpFromLineIcon from '@lucide/svelte/icons/arrow-up-from-line';
  import CheckCircle2Icon from '@lucide/svelte/icons/check-circle-2';
  import Loader2Icon from '@lucide/svelte/icons/loader-2';
  import SparklesIcon from '@lucide/svelte/icons/sparkles';
  import UsersIcon from '@lucide/svelte/icons/users';
  import { format, lightFormat } from 'date-fns';

  import * as Alert from '$lib/components/ui/alert';
  import * as Card from '$lib/components/ui/card';
  import StudentCard from '$lib/users/student.svelte';
  import { Button } from '$lib/components/ui/button';
  import { createFetchDrafteesQuery } from '$lib/queries/fetch-draftees';
  import { createFetchDraftAssignmentsQuery } from '$lib/queries/fetch-draft-assignments';
  import type { Draft, DraftFinalizedBreakdown, Lab } from '$lib/features/drafts/types';
  import { Empty } from '$lib/components/ui/empty';
  import { resolve } from '$app/paths';

  import DraftRoundsChart from './draft-rounds-chart.svelte';

  interface Props {
    draftId: string;
    requestedAt: Date;
    draft: Pick<Draft, 'activePeriodStart' | 'activePeriodEnd' | 'maxRounds'>;
    totalStudents: number;
    labs: Lab[];
    finalized: DraftFinalizedBreakdown;
    isReview: boolean;
  }

  const { draftId, requestedAt, draft, totalStudents, labs, finalized, isReview }: Props = $props();
  const participatingLabs = $derived(
    finalized.snapshots.length > 0 ? finalized.snapshots.length : labs.length,
  );

  const regularDraftedQuery = $derived(createFetchDraftAssignmentsQuery(draftId, assignments => (assignments.filter(({ round }) => (round !== null && 0 < round && round <= draft.maxRounds)))));
  const interventionDraftedQuery = $derived(createFetchDraftAssignmentsQuery(draftId, assignments => (assignments.filter(({ round }) => (round !== null && round === draft.maxRounds + 1)))));
  const lotteryDraftedQuery = $derived(createFetchDraftAssignmentsQuery(draftId, assignments => (assignments.filter(({ round }) => (round === null)))));

  const drafteesQuery = $derived(createFetchDrafteesQuery(draftId));
</script>

<div class="@container space-y-4">
  {#if isReview}
    <Alert.Root variant="warning">
      <SparklesIcon class="text-accent" />
      <Alert.Title>Draft Review</Alert.Title>
      <Alert.Description>
        Lottery assignments are complete. Review results below before finalizing.
      </Alert.Description>
    </Alert.Root>
  {:else}
    <Alert.Root variant="success">
      <CheckCircle2Icon class="text-success" />
      <Alert.Title>Draft Finalized</Alert.Title>
      <Alert.Description>
        This draft has been completed. All students have been assigned to their respective labs.
      </Alert.Description>
    </Alert.Root>
  {/if}

  <!-- Draft Summary Stats -->
  <div class="grid grid-cols-1 gap-2 @[36rem]:grid-cols-2 @[58rem]:grid-cols-3">
    <Card.Root>
      <Card.Header>
        <Card.Title class="text-md font-semibold tabular-nums">Total students</Card.Title>
        <Card.Title id="stat-total-students" class="text-4xl font-semibold tabular-nums">
          {totalStudents}
        </Card.Title>
      </Card.Header>
      <Card.Footer class="flex-col items-start gap-1.5 text-sm">
        <div class="flex items-center gap-2 font-medium text-muted-foreground">
          <UsersIcon class="size-4 text-muted-foreground" />
          All registered participants
        </div>
      </Card.Footer>
    </Card.Root>

    <Card.Root class="bg-linear-to-br from-muted/30 to-muted/10">
      <Card.Header>
        <Card.Title class="text-md font-semibold tabular-nums">Participating Labs</Card.Title>
        <Card.Title id="stat-participating-labs" class="text-4xl font-semibold tabular-nums">
          {participatingLabs}
        </Card.Title>
      </Card.Header>
      <Card.Footer class="flex-col items-start gap-1.5 text-sm">
        <div class="text-muted-foreground">Active labs in draft</div>
      </Card.Footer>
    </Card.Root>

    <Card.Root class="bg-linear-to-br from-muted/30 to-muted/10">
      <Card.Header>
        <Card.Title class="text-md font-semibold tabular-nums">Max Rounds</Card.Title>
        <Card.Title id="stat-max-rounds" class="text-4xl font-semibold tabular-nums">
          {draft.maxRounds}
        </Card.Title>
      </Card.Header>
      <Card.Footer class="flex-col items-start gap-1.5 text-sm">
        <div class="text-muted-foreground">Regular draft rounds</div>
      </Card.Footer>
    </Card.Root>

    {#if interventionDraftedQuery.isPending}
      <div class="flex h-full items-center justify-center">
        <Loader2Icon class="size-20 animate-spin" />
      </div>
    {:else if interventionDraftedQuery.isError}
      <Empty>Uh oh! An error has occurred.</Empty>
    {:else}
      <Card.Root class="bg-linear-to-br from-muted/30 to-muted/10">
        <Card.Header>
          <Card.Title class="text-md font-semibold tabular-nums">Interventions</Card.Title>
          <Card.Title id="quota-interventions" class="text-4xl font-semibold tabular-nums">
            {interventionDraftedQuery.data.length}
          </Card.Title>
        </Card.Header>
        <Card.Footer class="flex-col items-start gap-1.5 text-sm">
          <div class="text-muted-foreground">Interventions Made</div>
        </Card.Footer>
      </Card.Root>
    {/if}

    {#if lotteryDraftedQuery.isPending}
      <div class="flex h-full items-center justify-center">
        <Loader2Icon class="size-20 animate-spin" />
      </div>
    {:else if lotteryDraftedQuery.isError}
      <Empty>Uh oh! An error has occurred.</Empty>
    {:else}
      <Card.Root class="bg-linear-to-br from-muted/30 to-muted/10">
        <Card.Header>
          <Card.Title class="text-md font-semibold tabular-nums">Lottery Assignments</Card.Title>
          <Card.Title id="stat-lottery-assignments" class="text-4xl font-semibold tabular-nums">
            {lotteryDraftedQuery.data.length}
          </Card.Title>
        </Card.Header>
        <Card.Footer class="flex-col items-start gap-1.5 text-sm">
          <div class="text-muted-foreground">Students chosen during lottery</div>
        </Card.Footer>
      </Card.Root>
    {/if}
  </div>

  {#if regularDraftedQuery.isError || interventionDraftedQuery.isError || lotteryDraftedQuery.isError}
    <Empty>Uh oh! An error has occurred.</Empty>
  {:else if regularDraftedQuery.isPending || interventionDraftedQuery.isPending || lotteryDraftedQuery.isPending}
    <div class="flex h-full items-center justify-center">
      <Loader2Icon class="size-20 animate-spin" />
    </div>
  {:else}
    <DraftRoundsChart
      records={regularDraftedQuery.data}
      maxRounds={draft.maxRounds}
      interventionRecords={interventionDraftedQuery.data}
      lotteryRecords={lotteryDraftedQuery.data}
      {labs}
      {totalStudents}
    />
  {/if}

  <div class="grid grid-cols-1 gap-2">
    {#if regularDraftedQuery.isPending}
      <div class="flex h-full items-center justify-center">
        <Loader2Icon class="size-20 animate-spin" />
      </div>
    {:else if regularDraftedQuery.isError}
      <Empty>Uh oh! An error has occurred.</Empty>
    {:else}
      <Card.Root
        id="section-regular-drafted"
        variant="soft"
        class="bg-linear-to-br from-muted/30 to-muted/10"
      >
        <Card.Header>
          <Card.Title>Regular Drafted ({regularDraftedQuery.data.length})</Card.Title>
        </Card.Header>
        <Card.Content class="space-y-2">
          {#if regularDraftedQuery.data.length > 0}
            {#each regularDraftedQuery.data as { id, labId, labName, round, ...student } (id)}
              <div class="space-y-1">
                <StudentCard user={{ ...student, labs: [], labId }} />
                <p class="px-1 text-sm text-muted-foreground">
                  Assigned to <strong>{labName}</strong> in round {round}.
                </p>
              </div>
            {/each}
          {:else}
            <p class="text-sm text-muted-foreground">No regular-round assignments recorded.</p>
          {/if}
        </Card.Content>
      </Card.Root>
    {/if}

    {#if regularDraftedQuery.isError || interventionDraftedQuery.isError || drafteesQuery.isError}
      <Empty>Uh oh! An error has occurred.</Empty>
    {:else if regularDraftedQuery.isPending || interventionDraftedQuery.isPending || drafteesQuery.isPending}
      <div class="flex h-full items-center justify-center">
        <Loader2Icon class="size-20 animate-spin" />
      </div>
    {:else}
      {@const regularDraftedIds = new Set(regularDraftedQuery.data.map(({ id }) => id))}
      {@const undraftedAfterRegular = drafteesQuery.data.filter(
        ({ id }) => !regularDraftedIds.has(id),
      )}

      <Card.Root
        id="section-intervention-drafted"
        variant="soft"
        class="bg-linear-to-br from-muted/30 to-muted/10"
      >
        <Card.Header>
          <Card.Title
            >Intervention Drafted ({interventionDraftedQuery.data.length})</Card.Title
          >
        </Card.Header>
        <Card.Content class="space-y-2">
          <div class="grid grid-cols-1 gap-2 lg:grid-cols-2">
            <div id="section-undrafted-after-regular" class="space-y-2">
              <p class="text-sm font-medium">
                Undrafted After Regular ({undraftedAfterRegular.length})
              </p>
              {#if undraftedAfterRegular.length > 0}
                {#each undraftedAfterRegular as { id, ...student } (id)}
                  <StudentCard user={{ ...student, labs: [], labId: null }} />
                {/each}
              {:else}
                <p class="text-sm text-muted-foreground">
                  All students were drafted during regular rounds.
                </p>
              {/if}
            </div>

            <div id="section-intervention-assignments" class="space-y-2">
              <p class="text-sm font-medium">
                Intervention Assignments ({interventionDraftedQuery.data.length})
              </p>
              {#if interventionDraftedQuery.data.length > 0}
                {#each interventionDraftedQuery.data as { id, labId, labName, assignedAt, ...student } (id)}
                  <div class="space-y-1">
                    <StudentCard user={{ ...student, labs: [], labId }} />
                    <p class="px-1 text-sm text-muted-foreground">
                      Intervention assignment to <strong>{labName}</strong> on
                      {#if assignedAt !== null}
                        <time id="intervention-date-{id}" datetime={assignedAt.toISOString()}>
                          {format(assignedAt, 'PPP p')}
                        </time>
                      {:else}
                        <span id="intervention-date-{id}">Unknown date</span>
                      {/if}
                      .
                    </p>
                  </div>
                {/each}
              {:else}
                <p class="text-sm text-muted-foreground">No intervention assignments were made.</p>
              {/if}
            </div>
          </div>
        </Card.Content>
      </Card.Root>
    {/if}

    {#if lotteryDraftedQuery.isPending}
      <div class="flex h-full items-center justify-center">
        <Loader2Icon class="size-20 animate-spin" />
      </div>
    {:else if lotteryDraftedQuery.isError}
      <Empty>Uh oh! An error has occurred.</Empty>
    {:else}
      <Card.Root
        id="section-lottery-drafted"
        variant="soft"
        class="bg-linear-to-br from-muted/30 to-muted/10"
      >
        <Card.Header>
          <Card.Title>Lottery Drafted ({lotteryDraftedQuery.data.length})</Card.Title>
        </Card.Header>
        <Card.Content class="space-y-2">
          {#if lotteryDraftedQuery.data.length > 0}
            {#each lotteryDraftedQuery.data as { id, labId, labName, ...student } (id)}
              <div class="space-y-1">
                <StudentCard user={{ ...student, labs: [], labId }} />
                <p class="px-1 text-sm text-muted-foreground">
                  Assigned by finalized lottery results to <strong>{labName}</strong>.
                </p>
              </div>
            {/each}
          {:else}
            <p class="text-sm text-muted-foreground">No lottery assignments were recorded.</p>
          {/if}
        </Card.Content>
      </Card.Root>
    {/if}
  </div>

  <div class="flex flex-row gap-2 @max-[52rem]:grid @max-[52rem]:grid-cols-1">
    <Button
      href={resolve(`/dashboard/drafts/${draftId}/students.csv`)}
      download="{lightFormat(requestedAt, 'yyyy-MM-dd')}_{draftId}_students.csv"
      variant="outline"
      class="@max-[52rem]:h-auto @max-[52rem]:min-h-9 @max-[52rem]:justify-start @max-[52rem]:py-1.5 @max-[52rem]:whitespace-normal"
    >
      <ArrowUpFromLineIcon class="size-5" />
      <span>Export Student Ranks</span>
    </Button>
    <Button
      href={resolve(`/dashboard/drafts/${draftId}/results.csv`)}
      download="{lightFormat(requestedAt, 'yyyy-MM-dd')}_{draftId}_results.csv"
      variant="outline"
      class="@max-[52rem]:h-auto @max-[52rem]:min-h-9 @max-[52rem]:justify-start @max-[52rem]:py-1.5 @max-[52rem]:whitespace-normal"
    >
      <ArrowUpFromLineIcon class="size-5" />
      <span>Export Final Results</span>
    </Button>
    <Button
      href={resolve(`/dashboard/drafts/${draftId}/system-logs.csv`)}
      download="{lightFormat(requestedAt, 'yyyy-MM-dd')}_{draftId}_system-logs.csv"
      variant="outline"
      class="@max-[52rem]:h-auto @max-[52rem]:min-h-9 @max-[52rem]:justify-start @max-[52rem]:py-1.5 @max-[52rem]:whitespace-normal"
    >
      <ArrowUpFromLineIcon class="size-5" />
      <span>Export System Logs</span>
    </Button>
  </div>
</div>
