<script lang="ts">
  import { format } from 'd3-format';
  import { PieChart } from 'layerchart';

  import * as Card from '$lib/components/ui/card';
  import * as Chart from '$lib/components/ui/chart';
  import type { DraftPreferenceAlignment } from '$lib/features/drafts/types';

  interface Props {
    data: DraftPreferenceAlignment;
  }

  const { data }: Props = $props();

  const SLICE_COLORS: Record<string, string> = {
    '1st Choice': 'var(--chart-1)',
    '2nd Choice': 'var(--chart-2)',
    '3rd Choice': 'var(--chart-3)',
    '4th+ Choice': 'var(--chart-4)',
    Unranked: 'var(--chart-5)',
  };

  const chartConfig = $derived(
    Object.fromEntries(
      data.slices.map(({ label }) => [
        label,
        { label, color: SLICE_COLORS[label] ?? 'var(--muted)' },
      ]),
    ),
  );

  const chartData = $derived(
    data.slices.map(({ label, count }) => ({
      key: label,
      label,
      value: count,
      color: SLICE_COLORS[label] ?? 'var(--muted)',
    })),
  );

  const percentFormat = format('.0%');
</script>

<Card.Root>
  <Card.Header>
    <Card.Title>Preference Alignment</Card.Title>
    <Card.Description>How well assignments match student preferences</Card.Description>
  </Card.Header>
  <Card.Content>
    <Chart.Container config={chartConfig} class="relative max-h-70 w-full">
      <PieChart
        data={chartData}
        key="key"
        value="value"
        label="label"
        c="color"
        innerRadius={0.6}
        legend
      >
        {#snippet tooltip()}
          <Chart.Tooltip indicator="dot" hideLabel />
        {/snippet}
      </PieChart>
      <div
        class="pointer-events-none absolute inset-0 mb-12 flex flex-col items-center justify-center"
      >
        <span class="text-3xl font-bold tabular-nums">{percentFormat(data.bordaScore)}</span>
        <span class="text-xs text-muted-foreground">Borda Score</span>
      </div>
    </Chart.Container>
  </Card.Content>
</Card.Root>
