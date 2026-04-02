<script lang="ts">
  import {
    createColumnHelper,
    getCoreRowModel,
    getFilteredRowModel,
    getSortedRowModel,
  } from '@tanstack/table-core';
  import type { Snippet } from 'svelte';

  import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
  import * as Table from '$lib/components/ui/table';
  import DesignatedLab from '$lib/users/designated-lab.svelte';
  import PreferredLab from '$lib/users/preferred-lab.svelte';
  import { Badge } from '$lib/components/ui/badge';
  import { Button } from '$lib/components/ui/button';
  import { createSvelteTable, FlexRender, renderComponent } from '$lib/components/ui/data-table';
  import type { Student } from '$lib/features/drafts/types';

  import LateNameCell from './late-name-cell.svelte';
  import SortByHeader from './sort-by-header.svelte';

  interface ExtendedStudent extends Student {
    isLate?: boolean;
  }

  interface Props {
    data: ExtendedStudent[];
    children?: Snippet;
  }

  const { data, children }: Props = $props();

  // Shape the table columns
  const columnHelper = createColumnHelper<ExtendedStudent>();
  const columns = [
    columnHelper.accessor(({ studentNumber }) => studentNumber, {
      id: 'studentNumber',
      header: header =>
        renderComponent(SortByHeader, {
          header: 'Student Number',
          onclick: header.column.getToggleSortingHandler(),
        }),
      cell: info => info.getValue(),
    }),
    columnHelper.accessor(
      ({ familyName, givenName }) => `${familyName.toUpperCase()}, ${givenName}`,
      {
        id: 'name',
        header: header =>
          renderComponent(SortByHeader, {
            header: 'Name',
            onclick: header.column.getToggleSortingHandler(),
          }),
        cell: ({ getValue, row }) =>
          renderComponent(LateNameCell, { isLate: row.original.isLate ?? false, name: getValue() }),
      },
    ),
    columnHelper.accessor(({ email }) => email, {
      id: 'email',
      header: header =>
        renderComponent(SortByHeader, {
          header: 'Email',
          onclick: header.column.getToggleSortingHandler(),
        }),
      cell: info => info.getValue(),
    }),
    columnHelper.accessor(({ labId }) => labId, {
      id: 'labId',
      header: 'Designated Lab',
      cell: info => renderComponent(DesignatedLab, { labId: info.getValue() }),
      filterFn: 'equalsString',
    }),
    columnHelper.accessor(({ labs }) => labs, {
      id: 'labs',
      header: 'Lab Preferences',
      cell: info => renderComponent(PreferredLab, { labs: info.getValue() }),
      filterFn: 'arrIncludesSome',
    }),
  ];

  // Get all possible labs for filtering
  const designatedLabFilters = $derived(
    Array.from(new Set(data.map(({ labId }) => labId)))
      .filter(labId => labId !== null)
      .sort(),
  );

  const preferredLabFilters = $derived(
    Array.from(new Set(data.flatMap(({ labs }) => labs))).sort(),
  );

  // This only initializes lazily on load.
  // We put it here so that we don't needlessly initialize state
  // in the `pending` case and the `error` case.
  const table = $derived(
    createSvelteTable({
      data,
      columns,
      getCoreRowModel: getCoreRowModel(),
      getSortedRowModel: getSortedRowModel(),
      getFilteredRowModel: getFilteredRowModel(),
    }),
  );

  const headerGroups = $derived.by(() => table.getHeaderGroups());
  const { rows } = $derived.by(() => table.getRowModel());

  const designatedLabFilterValue = $derived.by(() => {
    const value = table.getColumn('labId')?.getFilterValue();
    return typeof value === 'string' ? value : '';
  });

  const preferredLabFilterValues = $derived.by(() => {
    const value = table.getColumn('labs')?.getFilterValue();
    return Array.isArray(value) ? value.filter(lab => typeof lab === 'string') : [];
  });
</script>

<!-- Filter Buttons -->
<div class="mx-4 mb-4 flex items-center justify-end gap-2">
  <!-- Designated Labs -->
  {#if designatedLabFilters.length > 0}
    <DropdownMenu.Root>
      <DropdownMenu.Trigger>
        <Button
          variant="outline"
          class={designatedLabFilterValue === '' ? '' : 'border-secondary text-secondary'}
        >
          Designated Lab: {designatedLabFilterValue === ''
            ? 'All'
            : designatedLabFilterValue.toUpperCase()}
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content>
        <DropdownMenu.Item
          onclick={() => {
            table.getColumn('labId')?.setFilterValue(() => '');
          }}
        >
          Clear Filter
        </DropdownMenu.Item>
        {#each designatedLabFilters as filter (filter)}
          <DropdownMenu.Item
            onclick={() => {
              table
                .getColumn('labId')
                ?.setFilterValue((current: unknown) => (current === filter ? '' : filter));
            }}
          >
            {#if designatedLabFilterValue === filter}
              <Badge variant="outline" class="mr-1 border-primary bg-primary/10 text-xs uppercase">
                {filter.toUpperCase()}
              </Badge>
            {:else}
              <Badge variant="outline" class="mr-1 border-muted bg-muted/10 text-xs uppercase">
                {filter.toUpperCase()}
              </Badge>
            {/if}
          </DropdownMenu.Item>
        {/each}
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  {/if}

  <!-- Lab Preferences -->
  {#if preferredLabFilters.length > 0}
    <DropdownMenu.Root>
      <DropdownMenu.Trigger>
        <Button
          variant="outline"
          class={preferredLabFilterValues.length === 0 ? '' : 'border-secondary text-secondary'}
        >
          Lab Preference: {preferredLabFilterValues.length === 0 ||
          preferredLabFilterValues.length === preferredLabFilters.length
            ? 'All'
            : preferredLabFilterValues.map(lab => lab.toUpperCase()).join(', ')}
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content>
        <DropdownMenu.Item
          onclick={() => {
            table.getColumn('labs')?.setFilterValue(() => []);
          }}
        >
          Clear Filters
        </DropdownMenu.Item>
        {#each preferredLabFilters as filter (filter)}
          <DropdownMenu.Item
            onclick={() => {
              table.getColumn('labs')?.setFilterValue((current: string[] | undefined) => {
                const selected = Array.isArray(current)
                  ? current.filter(lab => typeof lab === 'string')
                  : [];

                return selected.includes(filter)
                  ? selected.filter(lab => lab !== filter)
                  : [...selected, filter];
              });
            }}
          >
            {#if preferredLabFilterValues.includes(filter)}
              <Badge variant="outline" class="mr-1 border-primary bg-primary/10 text-xs uppercase">
                {filter.toUpperCase()}
              </Badge>
            {:else}
              <Badge variant="outline" class="mr-1 border-muted bg-muted/10 text-xs uppercase">
                {filter.toUpperCase()}
              </Badge>
            {/if}
          </DropdownMenu.Item>
        {/each}
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  {/if}
</div>

<!-- Table -->
<div class="mx-4 rounded-sm">
  <Table.Root>
    <Table.Header>
      {#each headerGroups as headerGroup (headerGroup.id)}
        <Table.Row>
          {#each headerGroup.headers as header (header.id)}
            <Table.Head colspan={header.colSpan}>
              {#if !header.isPlaceholder}
                <FlexRender
                  content={header.column.columnDef.header}
                  context={header.getContext()}
                />
              {/if}
            </Table.Head>
          {/each}
        </Table.Row>
      {/each}
    </Table.Header>
    <Table.Body>
      {#each rows as row (row.id)}
        <Table.Row>
          {#each row.getVisibleCells() as cell (cell.id)}
            <Table.Cell>
              <FlexRender content={cell.column.columnDef.cell} context={cell.getContext()} />
            </Table.Cell>
          {/each}
        </Table.Row>
      {:else}
        <Table.Row>
          <Table.Cell colspan={columns.length}>
            <p class="text-center my-8 text-xl empty:hidden">{@render children?.()}</p>
          </Table.Cell>
        </Table.Row>
      {/each}
    </Table.Body>
  </Table.Root>
</div>
