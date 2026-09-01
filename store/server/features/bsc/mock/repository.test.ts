import {
  BscCadence,
  BscPerspective,
  KpiApprovalStatus,
  ScorecardStatus,
} from '@/types/bsc';
import { PROMPT_TO_MOCK_STATUS } from '@/utils/bsc/stateMachine';
import { BscMockRepository } from './repository';

const HR_TARGETS = [
  {
    kpiLibraryId: 'kpi-hr-dir-enps',
    weightPercentage: 35,
    targetValue: 40,
  },
  {
    kpiLibraryId: 'kpi-hr-dir-ttf',
    weightPercentage: 35,
    targetValue: 30,
  },
  {
    kpiLibraryId: 'kpi-hr-dir-succession',
    weightPercentage: 30,
    targetValue: 80,
  },
];

async function createActiveScorecard(repo: BscMockRepository) {
  const created = await repo.createScorecard({
    userId: 'emp-1',
    userName: 'Pat Lee',
    managerId: 'mgr-1',
    cycleId: 'config-seed-current',
    targets: HR_TARGETS,
  });
  await repo.submitForAck(created.id, 'mgr-1');
  return repo.acknowledge(created.id, 'emp-1');
}

describe('bsc mock repository contract', () => {
  it('persists acknowledgedBy and a mock signature token', async () => {
    const repo = new BscMockRepository();
    const sc = await createActiveScorecard(repo);
    expect(sc.status).toBe(ScorecardStatus.Active);
    expect(sc.acknowledgedBy).toBe('emp-1');
    expect(sc.acknowledgedAt).toBeTruthy();
    expect(sc.acknowledgmentSignature).toMatch(/^sig-/);
  });

  it('requires at least one evidence artifact on reportKpis', async () => {
    const repo = new BscMockRepository();
    const sc = await createActiveScorecard(repo);
    await expect(
      repo.reportKpis(sc.id, [
        { targetId: sc.targets[0].id, actualValue: 38 },
      ]),
    ).rejects.toThrow(/Evidence is required/);

    const saved = await repo.reportKpis(sc.id, [
      {
        targetId: sc.targets[0].id,
        actualValue: 38,
        evidenceFileName: 'enps.pdf',
      },
    ]);
    expect(saved.targets[0].actualValue).toBe(38);
    expect(saved.targets[0].evidenceFileName).toBe('enps.pdf');
  });

  it('freezes actuals after PendingEval except rejected KPIs in NeedsResubmit', async () => {
    const repo = new BscMockRepository();
    const active = await createActiveScorecard(repo);
    await repo.reportKpis(
      active.id,
      active.targets.map((t, i) => ({
        targetId: t.id,
        actualValue: [42, 28, 81][i],
        evidenceUrl: `https://mock/${t.id}`,
      })),
    );
    await repo.submitFinal(active.id, 'emp-1');

    await expect(
      repo.reportKpis(active.id, [
        {
          targetId: active.targets[0].id,
          actualValue: 99,
          evidenceUrl: 'https://mock/locked',
        },
      ]),
    ).rejects.toThrow(/not open for reporting/);

    await repo.setKpiApproval(active.id, active.targets[0].id, false, 'Redo');
    await repo.setKpiApproval(active.id, active.targets[1].id, true);
    await repo.setKpiApproval(active.id, active.targets[2].id, true);
    const resubmit = await repo.finalizeApprovals(active.id, 'mgr-1');
    expect(resubmit.status).toBe(ScorecardStatus.NeedsResubmit);

    await expect(
      repo.reportKpis(resubmit.id, [
        {
          targetId: resubmit.targets[1].id,
          actualValue: 1,
          evidenceUrl: 'https://mock/approved-locked',
        },
      ]),
    ).rejects.toThrow(/Actual value is locked/);

    const updated = await repo.reportKpis(resubmit.id, [
      {
        targetId: resubmit.targets[0].id,
        actualValue: 45,
        evidenceHash: 'hash-resubmit',
      },
    ]);
    expect(updated.targets[0].actualValue).toBe(45);
    expect(updated.targets[1].actualValue).toBe(28);
  });

  it('lets a manager edit reported actuals while pending evaluation', async () => {
    const repo = new BscMockRepository();
    const active = await createActiveScorecard(repo);
    await repo.reportKpis(
      active.id,
      active.targets.map((t, i) => ({
        targetId: t.id,
        actualValue: [40, 30, 80][i],
        evidenceUrl: `https://mock/${t.id}`,
      })),
    );
    await repo.submitFinal(active.id);
    const edited = await repo.adjustReportedKpis(active.id, [
      { targetId: active.targets[0].id, actualValue: 38 },
    ]);
    expect(edited.targets[0].actualValue).toBe(38);
    expect(edited.targets[0].approvalStatus).toBe(KpiApprovalStatus.Pending);
    expect(edited.targets[1].actualValue).toBe(30);
  });

  it('auto-scores inside finalizeApprovals without a SYSTEM_SCORING status', async () => {
    const repo = new BscMockRepository();
    const active = await createActiveScorecard(repo);
    await repo.reportKpis(
      active.id,
      active.targets.map((t, i) => ({
        targetId: t.id,
        actualValue: [40, 30, 80][i],
        evidenceUrl: `https://mock/${t.id}`,
      })),
    );
    await repo.submitFinal(active.id);
    for (const t of active.targets) {
      await repo.setKpiApproval(active.id, t.id, true);
    }
    const scored = await repo.finalizeApprovals(active.id, 'mgr-1');
    expect(scored.status).toBe(ScorecardStatus.Scored);
    expect(scored.finalEvaluation?.compositeScore).toBeGreaterThan(0);
    expect(Object.values(ScorecardStatus)).not.toContain('SYSTEM_SCORING');
    expect('SYSTEM_SCORING' in PROMPT_TO_MOCK_STATUS).toBe(false);
  });

  it('stamps cadence on recurring configs and does not spawn extra scorecards', async () => {
    const repo = new BscMockRepository();
    const before = (await repo.listScorecards()).length;
    const cycle = await repo.createCycle({
      label: 'Recurring weekly',
      cadence: BscCadence.Weekly,
      fiscalYearId: 'fy-active-placeholder',
      fiscalYearName: 'FY 2026',
      periodIds: [],
      periodLabels: [],
      startDate: '2026-01-01',
      endDate: '2026-01-07',
      isRecurring: true,
      departmentIds: ['d1'],
      departmentNames: ['HR'],
      positionIds: [],
      positionTitles: ['HR Director'],
    });
    expect(cycle.isRecurring).toBe(true);
    expect(cycle.cadence).toBe(BscCadence.Weekly);
    expect((await repo.listScorecards()).length).toBe(before);
  });

  it('persists KPI perspective on role sync', async () => {
    const repo = new BscMockRepository();
    const kpis = await repo.listKpis({ positionTitle: 'HR Director' });
    const monthly = kpis.filter(
      (k) => k.evaluationConfigId === 'config-seed-current',
    );
    const saved = await repo.syncRoleKpis({
      evaluationConfigId: 'config-seed-current',
      positionId: null,
      positionTitle: 'HR Director',
      departmentName: 'Human Resources',
      existingIds: monthly.map((k) => k.id),
      rows: monthly.map((k) => ({
        id: k.id,
        name: k.name,
        description: k.description,
        weight: k.weight,
        perspective: k.perspective,
      })),
    });
    expect(saved.map((k) => k.perspective).sort()).toEqual(
      [
        'Customer',
        'Internal Process',
        'Learning & Growth',
      ].sort(),
    );
  });

  it('blocks KPI sync until the role has assigned perspectives', async () => {
    const repo = new BscMockRepository();
    await expect(
      repo.syncRoleKpis({
        evaluationConfigId: 'config-seed-current',
        positionId: 'pos-unassigned',
        positionTitle: 'Unassigned Role',
        existingIds: [],
        rows: [
          {
            name: 'NPS',
            description: 'Customer NPS',
            weight: 100,
            perspective: 'Customer',
          },
        ],
      }),
    ).rejects.toThrow(/Assign perspectives/);
  });

  it('saves role perspective weights', async () => {
    const repo = new BscMockRepository();
    const saved = await repo.saveRolePerspectives({
      evaluationConfigId: 'config-seed-current',
      positionId: null,
      positionTitle: 'HR Director',
      departmentName: 'Human Resources',
      weights: {
        [BscPerspective.Customer]: 40,
        [BscPerspective.InternalProcess]: 35,
        [BscPerspective.LearningGrowth]: 25,
      },
    });
    expect(saved.weights[BscPerspective.Customer]).toBe(40);
    expect(saved.weights[BscPerspective.InternalProcess]).toBe(35);
    expect(saved.weights[BscPerspective.LearningGrowth]).toBe(25);
    await expect(
      repo.saveRolePerspectives({
        evaluationConfigId: 'config-seed-current',
        positionId: null,
        positionTitle: 'HR Director',
        weights: {
          [BscPerspective.Customer]: 60,
          [BscPerspective.InternalProcess]: 20,
          [BscPerspective.LearningGrowth]: 20,
        },
      }),
    ).rejects.toThrow(/cannot exceed 50%/);
  });

  it('assigns perspectives to a role that is not on a setup', async () => {
    const repo = new BscMockRepository();
    const saved = await repo.saveRolePerspectives({
      evaluationConfigId: 'config-seed-current',
      positionId: 'pos-new-product-lead',
      positionTitle: 'Product Lead',
      departmentName: 'Product',
      weights: {
        [BscPerspective.Customer]: 40,
        [BscPerspective.InternalProcess]: 30,
        [BscPerspective.LearningGrowth]: 30,
      },
    });
    expect(saved.positionId).toBe('pos-new-product-lead');
    const listed = await repo.listRolePerspectives();
    expect(
      listed.some((row) => row.positionId === 'pos-new-product-lead'),
    ).toBe(true);
  });

  it('creates a custom perspective in the catalog', async () => {
    const repo = new BscMockRepository();
    const created = await repo.createPerspective({
      name: 'Community Impact',
      description: 'External community outcomes',
    });
    expect(created.name).toBe('Community Impact');
    expect(created.isSystem).toBe(false);
    const catalog = await repo.listPerspectives();
    expect(catalog.some((p) => p.name === 'Community Impact')).toBe(true);
    await expect(
      repo.createPerspective({ name: 'Financial' }),
    ).rejects.toThrow(/Financial perspective is not used/);
  });
});
