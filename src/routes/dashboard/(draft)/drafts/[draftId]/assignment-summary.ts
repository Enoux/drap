import { index, max, rollup, sum as d3sum } from 'd3-array';

import type {
  DraftAssignmentCountByAttribute,
  DraftAssignmentSummary,
  DraftLabBordaScore,
  DraftLabDistributionEntry,
  DraftPreferenceAlignmentRow,
  DraftSummaryChartData,
  DraftSupplyDemandEntry,
  Lab,
} from '$lib/features/drafts/types';

interface QuotaSnapshot {
  labId: string;
  initialQuota: number;
  lotteryQuota: number;
}

function getPhaseIndex(round: number | null, maxRounds: number) {
  if (round === null) return maxRounds + 1;
  if (round > 0 && round <= maxRounds) return round - 1;
  if (round === maxRounds + 1) return maxRounds;
  throw new Error(`unexpected draft assignment round: ${round}`);
}

function buildAssignedByPhase(
  phaseCount: ReadonlyMap<number, number> | undefined,
  phaseCountTotal: number,
) {
  return Array.from({ length: phaseCountTotal }, (_, index) => phaseCount?.get(index) ?? 0);
}

function getAssignedMax(assignedByPhase: number[]) {
  return max(assignedByPhase) ?? 0;
}

export function buildDraftAssignmentSummary(
  assignmentCountsByAttribute: DraftAssignmentCountByAttribute[],
  labs: Lab[],
  maxRounds: number,
  totalStudents: number,
): DraftAssignmentSummary {
  const phaseCountTotal = maxRounds + 2;
  const phases = [
    ...Array.from({ length: maxRounds }, (_, index) => {
      const round = index + 1;
      return {
        key: `round-${round}`,
        axisLabel: `R${round}`,
        tooltipLabel: `Round ${round}`,
      };
    }),
    {
      key: 'interventions',
      axisLabel: 'Interventions',
      tooltipLabel: 'Interventions',
    },
    {
      key: 'lottery',
      axisLabel: 'Lottery',
      tooltipLabel: 'Lottery',
    },
  ];

  const labById = index(labs, ({ id }) => id);

  const totalByPhase = rollup(
    assignmentCountsByAttribute,
    values => d3sum(values, d => d.count),
    ({ round }) => getPhaseIndex(round, maxRounds),
  );

  const countByLabAndPhase = rollup(
    assignmentCountsByAttribute,
    values => d3sum(values, d => d.count),
    ({ labId }) => labId,
    ({ round }) => getPhaseIndex(round, maxRounds),
  );

  const allLabsAssignedByPhase = buildAssignedByPhase(totalByPhase, phaseCountTotal);

  const labsChart = labs.map(lab => {
    const existingLab = labById.get(lab.id);
    if (typeof existingLab === 'undefined')
      throw new Error(`draft lab is missing from the snapshot index: ${lab.id}`);
    const assignedByPhase = buildAssignedByPhase(
      countByLabAndPhase.get(existingLab.id),
      phaseCountTotal,
    );
    return {
      id: existingLab.id,
      name: existingLab.name,
      capacity: existingLab.quota,
      assignedByPhase,
      assignedMax: getAssignedMax(assignedByPhase),
    };
  });

  return {
    metrics: {
      participatingLabCount: labs.length,
      interventionDraftedCount: allLabsAssignedByPhase[maxRounds] ?? 0,
      lotteryDraftedCount: allLabsAssignedByPhase[maxRounds + 1] ?? 0,
    },
    chart: {
      phases,
      allLabs: {
        capacity: totalStudents,
        assignedByPhase: allLabsAssignedByPhase,
        assignedMax: getAssignedMax(allLabsAssignedByPhase),
      },
      labs: labsChart,
    },
  };
}

function buildLabDistribution(
  counts: DraftAssignmentCountByAttribute[],
  labs: Lab[],
  totalStudents: number,
): DraftLabDistributionEntry[] {
  const countByLab = rollup(
    counts,
    values => d3sum(values, d => d.count),
    ({ labId }) => labId,
  );
  const labById = index(labs, ({ id }) => id);
  const entries: DraftLabDistributionEntry[] = [];
  let totalAssigned = 0;
  for (const lab of labs) {
    const count = countByLab.get(lab.id) ?? 0;
    totalAssigned += count;
    if (count > 0)
      entries.push({ labId: lab.id, labName: labById.get(lab.id)?.name ?? lab.id, count });
  }
  const unassigned = totalStudents - totalAssigned;
  if (unassigned > 0) entries.push({ labId: null, labName: 'Unassigned', count: unassigned });
  return entries;
}

function buildPreferenceAlignment(
  rows: DraftPreferenceAlignmentRow[],
): DraftSummaryChartData['preferenceAlignment'] {
  const buckets = new Map<string, number>([
    ['1st Choice', 0],
    ['2nd Choice', 0],
    ['3rd Choice', 0],
    ['4th+ Choice', 0],
    ['Unranked', 0],
  ]);

  let bordaNumerator = 0;
  let totalAssigned = 0;

  for (const { preferenceRank, totalRanked, count } of rows) {
    totalAssigned += count;

    if (preferenceRank === null || totalRanked === null) {
      buckets.set('Unranked', (buckets.get('Unranked') ?? 0) + count);
      // Borda score = 0 for unranked
      continue;
    }

    const rank = Number(preferenceRank);
    const n = totalRanked;

    // Bucket the rank (index is 1-based)
    switch (rank) {
      case 1:
        buckets.set('1st Choice', (buckets.get('1st Choice') ?? 0) + count);
        break;
      case 2:
        buckets.set('2nd Choice', (buckets.get('2nd Choice') ?? 0) + count);
        break;
      case 3:
        buckets.set('3rd Choice', (buckets.get('3rd Choice') ?? 0) + count);
        break;
      default:
        buckets.set('4th+ Choice', (buckets.get('4th+ Choice') ?? 0) + count);
        break;
    }

    // Borda alignment: (n - rank) / (n - 1) per student, times count (1-based index)
    if (n > 1) bordaNumerator += (count * (n - rank)) / (n - 1);
    else bordaNumerator += count; // single-lab ranking → perfect score
  }

  const slices = Array.from(buckets.entries())
    .filter(([, count]) => count > 0)
    .map(([label, count]) => ({ label, count }));

  return {
    slices,
    bordaScore: totalAssigned > 0 ? bordaNumerator / totalAssigned : 0,
  };
}

function buildSupplyVsDemand(
  counts: DraftAssignmentCountByAttribute[],
  labs: Lab[],
  quotaSnapshots: QuotaSnapshot[],
  bordaScores: DraftLabBordaScore[],
): DraftSupplyDemandEntry[] {
  const actualByLab = rollup(
    counts,
    values => d3sum(values, d => d.count),
    ({ labId }) => labId,
  );
  const bordaByLab = index(bordaScores, d => d.labId);
  const quotaByLab = index(quotaSnapshots, d => d.labId);

  const totalSupply = d3sum(labs, lab => {
    const q = quotaByLab.get(lab.id);
    return q ? q.initialQuota + q.lotteryQuota : 0;
  });
  const totalDemand = d3sum(labs, lab => bordaByLab.get(lab.id)?.bordaScore ?? 0);
  const totalActual = d3sum(labs, lab => actualByLab.get(lab.id) ?? 0);

  return labs.map(lab => {
    const supply = quotaByLab.get(lab.id);
    const supplyVal = supply ? supply.initialQuota + supply.lotteryQuota : 0;
    const demandVal = bordaByLab.get(lab.id)?.bordaScore ?? 0;
    const actualVal = actualByLab.get(lab.id) ?? 0;
    return {
      labId: lab.id,
      labName: lab.name,
      supplyShare: totalSupply > 0 ? supplyVal / totalSupply : 0,
      demandShare: totalDemand > 0 ? demandVal / totalDemand : 0,
      actualShare: totalActual > 0 ? actualVal / totalActual : 0,
    };
  });
}

export function buildDraftSummaryChartData(
  assignmentCounts: DraftAssignmentCountByAttribute[],
  labs: Lab[],
  quotaSnapshots: QuotaSnapshot[],
  bordaScores: DraftLabBordaScore[],
  alignmentRows: DraftPreferenceAlignmentRow[],
  maxRounds: number,
  totalStudents: number,
): DraftSummaryChartData {
  return {
    labDistribution: buildLabDistribution(assignmentCounts, labs, totalStudents),
    preferenceAlignment: buildPreferenceAlignment(alignmentRows),
    supplyVsDemand: buildSupplyVsDemand(assignmentCounts, labs, quotaSnapshots, bordaScores),
  };
}
