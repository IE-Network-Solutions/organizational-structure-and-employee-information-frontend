'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  Avatar,
  Button,
  Checkbox,
  InputNumber,
  Modal,
  Popover,
  Select,
  Steps,
  Tag,
} from 'antd';
import {
  CloseOutlined,
  DeleteOutlined,
  MinusOutlined,
  UserOutlined,
} from '@ant-design/icons';
import CustomButton from '@/components/common/buttons/customButton';
import BscSearchInput from '@/app/(afterLogin)/(bsc)/bsc/_components/BscSearchInput';
import NotificationMessage from '@/components/common/notification/notificationMessage';
import { useAppendIndividualBscKpis } from '@/store/server/features/bsc/mutation';
import { useGetBscKpiLibrary } from '@/store/server/features/bsc/queries';
import { useGetAllUsers } from '@/store/server/features/employees/employeeManagment/queries';
import {
  BscEvaluatorStep,
  BscEvaluatorStepKind,
  EmployeeScorecard,
  KpiLibraryItem,
  TargetLogic,
} from '@/types/bsc';
import { validateWeights } from '@/utils/bsc/scoring';

type PersonOption = {
  scorecard: EmployeeScorecard;
  label: string;
};

type WeightRow = {
  key: string;
  kind: 'existing' | 'new';
  targetId?: string;
  kpiLibraryId: string;
  name: string;
  perspective: string;
  source: 'shared' | 'individual';
  measurementUnit?: string;
  targetLogic?: TargetLogic;
  defaultTarget?: number | null;
  existingTarget?: number | null;
};

type Props = {
  open: boolean;
  scorecard: EmployeeScorecard | null;
  personOptions?: PersonOption[];
  evaluationConfigId?: string;
  onClose: () => void;
};

function kpiKey(kpi: Pick<KpiLibraryItem, 'perspective' | 'name'>) {
  return `${kpi.perspective}::${kpi.name}`;
}

function targetLogicLabel(logic?: TargetLogic): string {
  if (logic === TargetLogic.LowerBetter) return 'Lower is better';
  if (logic === TargetLogic.Bounded) return 'Bounded';
  return 'Higher is better';
}

function asList(data: unknown): any[] {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (typeof data === 'object' && Array.isArray((data as any).items)) {
    return (data as any).items;
  }
  return [];
}

function defaultEvaluationFlow(): BscEvaluatorStep[] {
  return [{ kind: 'self' }, { kind: 'directManager' }];
}

function normalizeEvaluationFlow(
  flow?: BscEvaluatorStep[] | null,
): BscEvaluatorStep[] {
  if (!flow?.length) return defaultEvaluationFlow();
  return flow.map((step) => ({
    kind: step.kind,
    userId: step.kind === 'user' ? step.userId ?? null : null,
  }));
}

function evaluatorStepDisplayName(
  step: BscEvaluatorStep,
  employeeById: Map<string, { label: string }>,
): string {
  if (step.kind === 'self') return 'Employee (self)';
  if (step.kind === 'directManager') return 'Direct manager';
  if (step.userId) {
    return employeeById.get(step.userId)?.label || 'Selected person';
  }
  return 'Select person';
}

function truncateName(name: string, max = 18): string {
  return name.length > max ? `${name.slice(0, max)}…` : name;
}

const EVALUATOR_STEP_OPTIONS: {
  value: BscEvaluatorStepKind;
  label: string;
}[] = [
  { value: 'self', label: 'Employee (self)' },
  { value: 'directManager', label: 'Direct manager' },
  { value: 'user', label: 'Specific person' },
];

const STEPS = [
  { title: 'KPIs' },
  { title: 'Weights' },
  { title: 'Evaluation' },
];

export default function AssignIndividualKpisModal({
  open,
  scorecard,
  personOptions = [],
  evaluationConfigId,
  onClose,
}: Props) {
  const { data: allKpis } = useGetBscKpiLibrary();
  const { data: allUsersData } = useGetAllUsers();
  const appendKpis = useAppendIndividualBscKpis();
  const [current, setCurrent] = useState(0);
  const [selectedScorecardId, setSelectedScorecardId] = useState<string>();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [kpiSearch, setKpiSearch] = useState('');
  const [personWeights, setPersonWeights] = useState<Record<string, number>>(
    {},
  );
  const [measureTargets, setMeasureTargets] = useState<
    Record<string, number | null>
  >({});
  const [kpiEvaluationFlows, setKpiEvaluationFlows] = useState<
    Record<string, BscEvaluatorStep[]>
  >({});
  const [addStepKpiId, setAddStepKpiId] = useState<string | null>(null);
  const [employeePickerSearch, setEmployeePickerSearch] = useState('');

  const lastStep = STEPS.length - 1;

  const activeScorecard = useMemo(() => {
    if (scorecard) return scorecard;
    return (
      personOptions.find(
        (option) => option.scorecard.id === selectedScorecardId,
      )?.scorecard || null
    );
  }, [scorecard, personOptions, selectedScorecardId]);

  const resolvedConfigId = evaluationConfigId || activeScorecard?.cycleId || '';

  const employeeOptions = useMemo(() => {
    return asList(allUsersData?.items || allUsersData || []).map(
      (user: any) => {
        const label =
          `${user.firstName || ''} ${user.middleName || ''} ${user.lastName || ''}`
            .replace(/\s+/g, ' ')
            .trim() ||
          user.email ||
          'Employee';
        const initials = label
          .split(' ')
          .filter(Boolean)
          .slice(0, 2)
          .map((part: string) => part[0]?.toUpperCase() || '')
          .join('');
        return {
          value: String(user.id),
          label,
          initials: initials || '?',
          profileImage: user.profileImage || null,
        };
      },
    );
  }, [allUsersData]);

  const employeeById = useMemo(() => {
    const map = new Map<string, (typeof employeeOptions)[number]>();
    for (const option of employeeOptions) map.set(option.value, option);
    return map;
  }, [employeeOptions]);

  const filteredPickerEmployees = useMemo(() => {
    const q = employeePickerSearch.trim().toLowerCase();
    if (!q) return employeeOptions;
    return employeeOptions.filter((option) =>
      option.label.toLowerCase().includes(q),
    );
  }, [employeeOptions, employeePickerSearch]);

  const alreadyOnScorecard = useMemo(() => {
    const names = new Set(
      (activeScorecard?.targets || []).map(
        (t) => `${t.perspective}::${t.kpiName}`,
      ),
    );
    const ids = new Set(
      (activeScorecard?.targets || []).map((t) => t.kpiLibraryId),
    );
    return { names, ids };
  }, [activeScorecard]);

  const availableKpis = useMemo(() => {
    if (!activeScorecard) return [] as KpiLibraryItem[];
    const seen = new Set<string>();
    const list: KpiLibraryItem[] = [];
    for (const kpi of allKpis || []) {
      const key = kpiKey(kpi);
      if (seen.has(key)) continue;
      if (
        alreadyOnScorecard.names.has(key) ||
        alreadyOnScorecard.ids.has(kpi.id)
      ) {
        continue;
      }
      if (
        kpi.evaluationConfigId !== 'library' &&
        resolvedConfigId &&
        kpi.evaluationConfigId !== resolvedConfigId &&
        (allKpis || []).some(
          (other) =>
            kpiKey(other) === key &&
            (other.evaluationConfigId === 'library' ||
              other.evaluationConfigId === resolvedConfigId),
        )
      ) {
        continue;
      }
      seen.add(key);
      list.push(kpi);
    }
    return list.sort((a, b) => {
      const byPerspective = a.perspective.localeCompare(b.perspective);
      if (byPerspective) return byPerspective;
      return a.name.localeCompare(b.name);
    });
  }, [allKpis, alreadyOnScorecard, activeScorecard, resolvedConfigId]);

  const filteredCatalogKpis = useMemo(() => {
    const q = kpiSearch.trim().toLowerCase();
    if (!q) return availableKpis;
    return availableKpis.filter(
      (kpi) =>
        kpi.name.toLowerCase().includes(q) ||
        (kpi.perspective || '').toLowerCase().includes(q) ||
        (kpi.measurementUnit || '').toLowerCase().includes(q),
    );
  }, [availableKpis, kpiSearch]);

  const selectedKpis = useMemo(
    () => availableKpis.filter((kpi) => selectedIds.includes(kpi.id)),
    [availableKpis, selectedIds],
  );

  const weightRows: WeightRow[] = useMemo(() => {
    if (!activeScorecard) return [];
    const existing: WeightRow[] = activeScorecard.targets.map((target) => ({
      key: `existing:${target.id}`,
      kind: 'existing',
      targetId: target.id,
      kpiLibraryId: target.kpiLibraryId,
      name: target.kpiName,
      perspective: target.perspective,
      source:
        target.assignmentSource === 'individual' ? 'individual' : 'shared',
      measurementUnit: target.measurementUnit,
      targetLogic: target.targetLogic,
      existingTarget: target.targetValue,
    }));
    const incoming: WeightRow[] = selectedKpis.map((kpi) => ({
      key: `new:${kpi.id}`,
      kind: 'new',
      kpiLibraryId: kpi.id,
      name: kpi.name,
      perspective: kpi.perspective,
      source: 'individual',
      measurementUnit: kpi.measurementUnit,
      targetLogic: kpi.targetLogic,
      defaultTarget: kpi.defaultTarget,
    }));
    return [...existing, ...incoming];
  }, [activeScorecard, selectedKpis]);

  const weightRowsByPerspective = useMemo(() => {
    const map = new Map<string, WeightRow[]>();
    for (const row of weightRows) {
      const list = map.get(row.perspective) || [];
      list.push(row);
      map.set(row.perspective, list);
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [weightRows]);

  useEffect(() => {
    if (!open) return;
    setCurrent(0);
    setSelectedIds([]);
    setKpiSearch('');
    setPersonWeights({});
    setMeasureTargets({});
    setKpiEvaluationFlows({});
    setAddStepKpiId(null);
    setEmployeePickerSearch('');
    setSelectedScorecardId(scorecard?.id);
  }, [open, scorecard?.id]);

  const seedPersonWeights = () => {
    if (!activeScorecard || !selectedKpis.length) return;
    const next: Record<string, number> = {};
    activeScorecard.targets.forEach((target) => {
      next[`existing:${target.id}`] = target.weightPercentage;
    });
    selectedKpis.forEach((kpi) => {
      next[`new:${kpi.id}`] = 0;
    });
    setPersonWeights(next);

    const targets: Record<string, number | null> = {};
    selectedKpis.forEach((kpi) => {
      targets[`new:${kpi.id}`] =
        measureTargets[`new:${kpi.id}`] ?? kpi.defaultTarget ?? null;
    });
    setMeasureTargets((prev) => ({ ...prev, ...targets }));
  };

  const seedKpiEvaluationFlows = () => {
    const next: Record<string, BscEvaluatorStep[]> = {};
    for (const kpi of selectedKpis) {
      next[kpi.id] = kpiEvaluationFlows[kpi.id]?.length
        ? normalizeEvaluationFlow(kpiEvaluationFlows[kpi.id])
        : defaultEvaluationFlow();
    }
    setKpiEvaluationFlows(next);
  };

  const updateKpiFlow = (kpiId: string, flow: BscEvaluatorStep[]) => {
    setKpiEvaluationFlows((prev) => ({
      ...prev,
      [kpiId]: normalizeEvaluationFlow(flow),
    }));
  };

  const closeEmployeePicker = () => {
    setAddStepKpiId(null);
    setEmployeePickerSearch('');
  };

  const addEvaluatorFromPicker = (step: BscEvaluatorStep) => {
    if (!addStepKpiId) return;
    const currentFlow =
      kpiEvaluationFlows[addStepKpiId]?.length
        ? kpiEvaluationFlows[addStepKpiId]
        : defaultEvaluationFlow();
    updateKpiFlow(addStepKpiId, [...currentFlow, step]);
    closeEmployeePicker();
  };

  const weightSum = weightRows.reduce(
    (sum, row) => sum + (Number(personWeights[row.key]) || 0),
    0,
  );
  const weightCheck = validateWeights(
    weightRows.map((row) => Number(personWeights[row.key]) || 0),
    weightRows.map((row) => row.perspective),
  );

  const validateEvaluationStep = () => {
    for (const kpi of selectedKpis) {
      const flow = normalizeEvaluationFlow(kpiEvaluationFlows[kpi.id]);
      if (!flow.length) {
        NotificationMessage.error({
          message: `Add at least one evaluator for ${kpi.name}`,
        });
        return false;
      }
      for (const step of flow) {
        if (step.kind === 'user' && !step.userId) {
          NotificationMessage.error({
            message: `Select a person for ${kpi.name}`,
          });
          return false;
        }
      }
    }
    return true;
  };

  const handleSave = async () => {
    if (!activeScorecard || !selectedKpis.length) return;
    if (!weightCheck.valid) {
      NotificationMessage.error({
        message: weightCheck.message || 'Weights must sum to 100%',
      });
      return;
    }
    if (!validateEvaluationStep()) return;

    for (const kpi of selectedKpis) {
      const target = measureTargets[`new:${kpi.id}`];
      if (target == null || Number.isNaN(Number(target))) {
        NotificationMessage.error({
          message: `Enter a target for ${kpi.name}`,
        });
        return;
      }
    }

    await appendKpis.mutateAsync({
      scorecardId: activeScorecard.id,
      existingWeights: activeScorecard.targets.map((target) => ({
        targetId: target.id,
        weightPercentage: Number(personWeights[`existing:${target.id}`]),
      })),
      kpis: selectedKpis.map((kpi) => ({
        kpiLibraryId: kpi.id,
        weightPercentage: Number(personWeights[`new:${kpi.id}`]),
        targetValue: Number(measureTargets[`new:${kpi.id}`]),
        worstCase:
          kpi.targetLogic === TargetLogic.Bounded ? kpi.worstCase : null,
        bestCase: kpi.targetLogic === TargetLogic.Bounded ? kpi.bestCase : null,
        evaluationFlow: normalizeEvaluationFlow(kpiEvaluationFlows[kpi.id]),
      })),
    });
    onClose();
  };

  const handleBack = () => {
    setCurrent((step) => Math.max(step - 1, 0));
  };

  const handleNext = async () => {
    if (current === 0) {
      if (!activeScorecard) {
        NotificationMessage.error({ message: 'Select a person first' });
        return;
      }
      if (!selectedKpis.length) {
        NotificationMessage.error({
          message: 'Select at least one KPI to append',
        });
        return;
      }
      seedPersonWeights();
      setCurrent(1);
      return;
    }
    if (current === 1) {
      if (!weightCheck.valid) {
        NotificationMessage.error({
          message: weightCheck.message || 'Weights must sum to 100%',
        });
        return;
      }
      for (const kpi of selectedKpis) {
        const target = measureTargets[`new:${kpi.id}`];
        if (target == null || Number.isNaN(Number(target))) {
          NotificationMessage.error({
            message: `Enter a target for ${kpi.name}`,
          });
          return;
        }
      }
      seedKpiEvaluationFlows();
      setCurrent(2);
      return;
    }
    await handleSave();
  };

  const needsPersonPick = !scorecard && personOptions.length > 0;

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      centered
      width={860}
      closeIcon={<CloseOutlined />}
      destroyOnClose
      title={
        <div data-cy="bsc-assign-individual-title">
          <h2 className="m-0 text-xl font-bold text-black">
            Add individual KPIs
          </h2>
          <p className="m-0 mt-1 text-sm font-normal text-[#595959]">
            {activeScorecard
              ? `Select KPIs for ${activeScorecard.userName}, set weights, then define evaluators.`
              : 'Choose a person, select KPIs, set weights, then define evaluators.'}
          </p>
        </div>
      }
      data-cy="bsc-assign-individual-kpis-modal"
    >
      <div className="mb-4 mt-2 hidden sm:block">
        <Steps
          current={current}
          progressDot
          labelPlacement="vertical"
          className="px-2"
          items={STEPS}
          data-cy="bsc-assign-individual-steps"
        />
      </div>

      <div className="mt-2">
        {current === 0 && (
          <>
            {needsPersonPick ? (
              <div className="mb-4">
                <p className="mb-2 text-[13px] font-semibold text-[#262626]">
                  Person
                </p>
                <Select
                  showSearch
                  allowClear
                  className="w-full"
                  placeholder="Select employee scorecard"
                  optionFilterProp="label"
                  value={selectedScorecardId}
                  onChange={(value) => {
                    setSelectedScorecardId(value);
                    setSelectedIds([]);
                    setMeasureTargets({});
                    setKpiEvaluationFlows({});
                  }}
                  options={personOptions.map((option) => ({
                    value: option.scorecard.id,
                    label: option.label,
                  }))}
                  data-cy="bsc-assign-individual-person-select"
                />
              </div>
            ) : null}

            <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="mb-1 text-[13px] font-semibold text-[#262626]">
                  KPIs
                </p>
                <p className="mb-0 text-[12px] text-[#8F94A3]">
                  Select the KPIs to append for this person only. Weights are
                  assigned in the next step.
                </p>
              </div>
              {activeScorecard && availableKpis.length ? (
                <BscSearchInput
                  value={kpiSearch}
                  onChange={setKpiSearch}
                  placeholder="Search KPIs"
                  data-cy="bsc-assign-individual-kpi-search"
                />
              ) : null}
            </div>

            {!activeScorecard ? (
              <p className="text-[13px] text-[#94A3B8]">
                Select a person to choose KPIs.
              </p>
            ) : !availableKpis.length ? (
              <p className="text-[13px] text-[#94A3B8]">
                No additional catalog KPIs available for this person.
              </p>
            ) : (
              <div
                className="flex max-h-[440px] flex-col gap-1 overflow-y-auto rounded-xl border border-[#E5E7EB] bg-white p-2"
                data-cy="bsc-assign-individual-kpi-list"
              >
                  {filteredCatalogKpis.map((kpi) => {
                    const checked = selectedIds.includes(kpi.id);
                    return (
                      <label
                        key={kpi.id}
                        className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2 hover:bg-[#F9FAFB]"
                        data-cy={`bsc-assign-individual-kpi-row-${kpi.id}`}
                      >
                        <Checkbox
                          checked={checked}
                          onChange={(e) => {
                            setSelectedIds((prev) =>
                              e.target.checked
                                ? [...prev, kpi.id]
                                : prev.filter((id) => id !== kpi.id),
                            );
                          }}
                        />
                        <span className="min-w-0 flex-1 text-[13px] font-medium text-[#262626]">
                          {kpi.name}
                        </span>
                        {kpi.perspective ? (
                          <Tag className="m-0 h-5 shrink-0 rounded border border-[#91caff] bg-[#e6f4ff] px-1.5 text-[11px] font-normal leading-5 text-[#1677ff]">
                            {kpi.perspective}
                          </Tag>
                        ) : null}
                        {kpi.measurementUnit ? (
                          <span className="shrink-0 text-[11px] text-[#8F94A3]">
                            {kpi.measurementUnit}
                          </span>
                        ) : null}
                      </label>
                    );
                  })}
              </div>
            )}
          </>
        )}

        {current === 1 && (
          <>
            <p className="mb-1 text-[13px] font-semibold text-[#262626]">
              Weights & targets
            </p>
            <p className="mb-4 text-[12px] text-[#8F94A3]">
              Set every KPI weight for {activeScorecard?.userName} only (sum
              100%). New KPI weights start empty — lower shared weights as
              needed so the total still adds to 100%. Targets are prefilled from
              the catalog when available.
            </p>

            <div className="mb-3 flex flex-wrap items-center gap-2 text-[12px]">
              <span
                className={
                  Math.abs(weightSum - 100) <= 0.01
                    ? 'text-[#389E0D]'
                    : 'text-[#CF1322]'
                }
              >
                Total {Math.round(weightSum * 100) / 100}%
              </span>
              {!weightCheck.valid && weightSum > 0 ? (
                <span className="text-[#CF1322]">{weightCheck.message}</span>
              ) : null}
            </div>

            {!weightRowsByPerspective.length ? (
              <p className="text-[13px] text-[#94A3B8]">
                No KPIs selected. Go back and select KPIs first.
              </p>
            ) : (
              <div
                className="flex max-h-[440px] flex-col gap-4 overflow-y-auto pr-1"
                data-cy="bsc-assign-individual-weights"
              >
                {weightRowsByPerspective.map(([perspective, rows]) => {
                  const allocated = rows.reduce(
                    (sum, row) =>
                      sum + (Number(personWeights[row.key]) || 0),
                    0,
                  );
                  return (
                    <div
                      key={perspective}
                      className="rounded-xl border border-[#E5E7EB] p-4"
                    >
                      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                        <p className="m-0 text-[14px] font-semibold text-[#262626]">
                          {perspective}
                          <span className="ml-2 text-[11px] font-normal text-[#8F94A3]">
                            {rows.length} KPI{rows.length === 1 ? '' : 's'}
                          </span>
                        </p>
                        <span className="text-[12px] text-[#595959]">
                          {Math.round(allocated * 100) / 100}%
                        </span>
                      </div>

                      <div className="flex flex-col gap-3">
                        {rows.map((row) => (
                          <div
                            key={row.key}
                            className="rounded-lg bg-[#F9FAFB] px-3 py-3"
                          >
                            <div className="mb-2 flex flex-wrap items-start justify-between gap-2">
                              <div>
                                <p className="m-0 text-[13px] font-medium text-[#262626]">
                                  {row.name}
                                </p>
                                <p className="m-0 text-[11px] text-[#8F94A3]">
                                  {row.measurementUnit || '—'} ·{' '}
                                  {targetLogicLabel(row.targetLogic)}
                                  {row.kind === 'new' &&
                                  row.defaultTarget != null
                                    ? ` · catalog default ${row.defaultTarget}`
                                    : ''}
                                </p>
                                <div className="mt-1 flex flex-wrap gap-1">
                                  <Tag className="m-0 h-5 rounded border border-[#91caff] bg-[#e6f4ff] px-1.5 text-[11px] font-normal leading-5 text-[#1677ff]">
                                    {row.source === 'individual'
                                      ? 'Individual'
                                      : 'Shared'}
                                  </Tag>
                                  {row.kind === 'new' ? (
                                    <Tag className="m-0 h-5 rounded border border-[#b7eb8f] bg-[#f6ffed] px-1.5 text-[11px] font-normal leading-5 text-[#389E0D]">
                                      New
                                    </Tag>
                                  ) : null}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-[11px] text-[#595959]">
                                  Weight %
                                </span>
                                <InputNumber
                                  className="w-20"
                                  min={1}
                                  max={100}
                                  placeholder={
                                    row.kind === 'new' ? 'Enter' : undefined
                                  }
                                  value={
                                    personWeights[row.key]
                                      ? personWeights[row.key]
                                      : undefined
                                  }
                                  onChange={(value) =>
                                    setPersonWeights((prev) => ({
                                      ...prev,
                                      [row.key]: Number(value) || 0,
                                    }))
                                  }
                                  data-cy={`bsc-assign-weight-${row.key}`}
                                />
                              </div>
                            </div>

                            {row.kind === 'new' ? (
                              <div className="flex flex-wrap gap-3">
                                <div className="flex items-center gap-2">
                                  <span className="text-[11px] text-[#595959]">
                                    Target
                                  </span>
                                  <InputNumber
                                    className="w-28"
                                    placeholder={
                                      row.defaultTarget != null
                                        ? String(row.defaultTarget)
                                        : 'Enter target'
                                    }
                                    value={
                                      measureTargets[row.key] ?? undefined
                                    }
                                    onChange={(value) =>
                                      setMeasureTargets((prev) => ({
                                        ...prev,
                                        [row.key]:
                                          value == null ? null : Number(value),
                                      }))
                                    }
                                    data-cy={`bsc-assign-target-${row.key}`}
                                  />
                                </div>
                              </div>
                            ) : row.existingTarget != null ? (
                              <p className="m-0 text-[11px] text-[#8F94A3]">
                                Target {row.existingTarget}
                              </p>
                            ) : null}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {current === 2 && (
          <>
            <p
              className="mb-1 text-[13px] font-semibold text-[#262626]"
              data-cy="bsc-assign-individual-evaluation-title"
            >
              Evaluation
            </p>
            <p className="mb-4 text-[12px] text-[#8F94A3]">
              Define who evaluates each new KPI, in order. Any combination of
              self, direct manager, and specific people is allowed.
            </p>

            {!selectedKpis.length ? (
              <p className="text-[13px] text-[#94A3B8]">
                No KPIs selected. Go back and select KPIs first.
              </p>
            ) : (
              <div
                className="flex max-h-[440px] flex-col gap-2 overflow-y-auto pr-1"
                data-cy="bsc-assign-individual-evaluation-list"
              >
                {selectedKpis.map((kpi) => {
                  const flow = kpiEvaluationFlows[kpi.id]?.length
                    ? kpiEvaluationFlows[kpi.id]
                    : defaultEvaluationFlow();

                  return (
                    <div
                      key={kpi.id}
                      className="rounded-xl border border-[#E5E7EB] px-3 py-3"
                      data-cy={`bsc-assign-eval-row-${kpi.id}`}
                    >
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <span className="text-[13px] font-medium text-[#262626]">
                          {kpi.name}
                        </span>
                        {kpi.perspective ? (
                          <Tag className="m-0 h-5 rounded border border-[#91caff] bg-[#e6f4ff] px-1.5 text-[11px] font-normal leading-5 text-[#1677ff]">
                            {kpi.perspective}
                          </Tag>
                        ) : null}
                      </div>

                      <div className="w-full overflow-x-auto">
                        <div className="flex min-w-max items-center gap-1.5 py-1">
                          {flow.map((step, index) => {
                            const displayName = evaluatorStepDisplayName(
                              step,
                              employeeById,
                            );
                            const employee =
                              step.kind === 'user' && step.userId
                                ? employeeById.get(step.userId)
                                : undefined;
                            const needsPerson =
                              step.kind === 'user' && !step.userId;

                            const editor = (
                              <div className="w-[240px] p-1">
                                <p className="mb-2 text-[12px] font-medium text-[#262626]">
                                  Step {index + 1}
                                </p>
                                <Select
                                  className="mb-2 w-full"
                                  size="small"
                                  value={step.kind}
                                  options={EVALUATOR_STEP_OPTIONS}
                                  onChange={(kind: BscEvaluatorStepKind) => {
                                    const next = [...flow];
                                    next[index] = {
                                      kind,
                                      userId:
                                        kind === 'user'
                                          ? step.userId || null
                                          : null,
                                    };
                                    updateKpiFlow(kpi.id, next);
                                  }}
                                />
                                {step.kind === 'user' ? (
                                  <Select
                                    className="mb-2 w-full"
                                    size="small"
                                    allowClear
                                    showSearch
                                    placeholder="Select employee"
                                    options={employeeOptions}
                                    optionFilterProp="label"
                                    value={step.userId || undefined}
                                    onChange={(userId) => {
                                      const next = [...flow];
                                      next[index] = {
                                        kind: 'user',
                                        userId: userId || null,
                                      };
                                      updateKpiFlow(kpi.id, next);
                                    }}
                                  />
                                ) : null}
                                <div className="flex justify-between gap-1">
                                  <Button
                                    type="text"
                                    size="small"
                                    disabled={index === 0}
                                    onClick={() => {
                                      if (index === 0) return;
                                      const next = [...flow];
                                      [next[index - 1], next[index]] = [
                                        next[index],
                                        next[index - 1],
                                      ];
                                      updateKpiFlow(kpi.id, next);
                                    }}
                                  >
                                    Move left
                                  </Button>
                                  <Button
                                    type="text"
                                    size="small"
                                    disabled={index === flow.length - 1}
                                    onClick={() => {
                                      if (index >= flow.length - 1) return;
                                      const next = [...flow];
                                      [next[index], next[index + 1]] = [
                                        next[index + 1],
                                        next[index],
                                      ];
                                      updateKpiFlow(kpi.id, next);
                                    }}
                                  >
                                    Move right
                                  </Button>
                                  <Button
                                    type="text"
                                    size="small"
                                    danger
                                    icon={<DeleteOutlined />}
                                    disabled={flow.length <= 1}
                                    onClick={() => {
                                      if (flow.length <= 1) return;
                                      updateKpiFlow(
                                        kpi.id,
                                        flow.filter((_, i) => i !== index),
                                      );
                                    }}
                                  />
                                </div>
                              </div>
                            );

                            return (
                              <React.Fragment key={`${kpi.id}-step-${index}`}>
                                {index > 0 ? (
                                  <div className="inline-flex h-5 min-w-6 shrink-0 items-center justify-center rounded-full border border-[#E3E7FF] bg-[#F7F8FF] px-1 text-[11px] font-semibold text-[#5B67D9]">
                                    →
                                  </div>
                                ) : null}
                                <div className="flex shrink-0 items-center gap-2">
                                  <div className="relative h-8 w-8 shrink-0">
                                    <Popover
                                      trigger="click"
                                      placement="bottomLeft"
                                      content={editor}
                                    >
                                      <div
                                        role="button"
                                        tabIndex={0}
                                        className="cursor-pointer"
                                      >
                                        {employee?.profileImage ? (
                                          <Avatar
                                            size={32}
                                            src={employee.profileImage}
                                          />
                                        ) : (
                                          <Avatar
                                            size={32}
                                            icon={
                                              step.kind === 'user' ? undefined : (
                                                <UserOutlined />
                                              )
                                            }
                                            className={
                                              step.kind === 'self'
                                                ? 'bg-[#E6F4FF] text-[#1677ff]'
                                                : step.kind === 'directManager'
                                                  ? 'bg-[#F0F5FF] text-[#5B67D9]'
                                                  : 'bg-[#EFF6FF] text-[#1D4ED8]'
                                            }
                                          >
                                            {step.kind === 'user'
                                              ? employee?.initials || '?'
                                              : null}
                                          </Avatar>
                                        )}
                                      </div>
                                    </Popover>
                                    <button
                                      type="button"
                                      className="absolute -right-1 -top-1 z-[1] inline-flex h-3.5 w-3.5 items-center justify-center rounded-full border border-white bg-[#f5f5f5] text-[8px] leading-none text-[#8c8c8c] hover:bg-[#fff1f0] hover:text-[#ff4d4f] disabled:cursor-not-allowed disabled:opacity-35"
                                      disabled={flow.length <= 1}
                                      title="Remove step"
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        if (flow.length <= 1) return;
                                        updateKpiFlow(
                                          kpi.id,
                                          flow.filter((_, i) => i !== index),
                                        );
                                      }}
                                    >
                                      <MinusOutlined />
                                    </button>
                                  </div>
                                  <Popover
                                    trigger="click"
                                    placement="bottomLeft"
                                    content={editor}
                                  >
                                    <div
                                      role="button"
                                      tabIndex={0}
                                      className={`max-w-[120px] cursor-pointer truncate text-[12px] font-medium transition-opacity hover:opacity-80 ${
                                        needsPerson
                                          ? 'text-[#cf1322]'
                                          : 'text-[#595959]'
                                      }`}
                                      title={displayName}
                                    >
                                      {truncateName(displayName)}
                                    </div>
                                  </Popover>
                                </div>
                              </React.Fragment>
                            );
                          })}

                          <div className="inline-flex h-5 min-w-6 shrink-0 items-center justify-center rounded-full border border-[#E3E7FF] bg-[#F7F8FF] px-1 text-[11px] font-semibold text-[#5B67D9]">
                            →
                          </div>
                          <Popover
                            trigger="click"
                            open={addStepKpiId === kpi.id}
                            onOpenChange={(openPicker) => {
                              if (openPicker) {
                                setEmployeePickerSearch('');
                                setAddStepKpiId(kpi.id);
                              } else {
                                closeEmployeePicker();
                              }
                            }}
                            placement="bottomLeft"
                            arrow={false}
                            zIndex={1100}
                            getPopupContainer={() => document.body}
                            overlayInnerStyle={{ padding: 12, width: 320 }}
                            title={
                              <div className="mb-1 flex items-start justify-between gap-2">
                                <div>
                                  <h3 className="m-0 text-base font-bold text-gray-900">
                                    Add evaluator
                                  </h3>
                                  <p className="mb-0 mt-1 text-xs text-gray-500">
                                    Search and select who evaluates next
                                  </p>
                                </div>
                                <button
                                  type="button"
                                  onClick={closeEmployeePicker}
                                  className="cursor-pointer border-none bg-transparent p-1 text-gray-400 hover:text-gray-600"
                                >
                                  <CloseOutlined />
                                </button>
                              </div>
                            }
                            content={
                              <div>
                                <div className="mb-2 w-full [&_.ant-input-affix-wrapper]:!w-full [&_input]:!w-full">
                                  <BscSearchInput
                                    value={employeePickerSearch}
                                    onChange={setEmployeePickerSearch}
                                    placeholder="Search employees"
                                    className="!w-full !max-w-none"
                                  />
                                </div>
                                <div className="flex max-h-[280px] flex-col gap-0.5 overflow-y-auto">
                                  <button
                                    type="button"
                                    className="flex w-full items-center gap-3 rounded-lg border-0 bg-transparent px-2 py-2 text-left hover:bg-[#F5F5F5]"
                                    onClick={() =>
                                      addEvaluatorFromPicker({ kind: 'self' })
                                    }
                                  >
                                    <Avatar
                                      size={28}
                                      icon={<UserOutlined />}
                                      className="shrink-0 bg-[#E6F4FF] text-[#1677ff]"
                                    />
                                    <span className="text-[13px] font-medium text-[#262626]">
                                      Employee (self)
                                    </span>
                                  </button>
                                  <button
                                    type="button"
                                    className="flex w-full items-center gap-3 rounded-lg border-0 bg-transparent px-2 py-2 text-left hover:bg-[#F5F5F5]"
                                    onClick={() =>
                                      addEvaluatorFromPicker({
                                        kind: 'directManager',
                                      })
                                    }
                                  >
                                    <Avatar
                                      size={28}
                                      icon={<UserOutlined />}
                                      className="shrink-0 bg-[#F0F5FF] text-[#5B67D9]"
                                    />
                                    <span className="text-[13px] font-medium text-[#262626]">
                                      Direct manager
                                    </span>
                                  </button>
                                  {filteredPickerEmployees.map((option) => (
                                    <button
                                      key={option.value}
                                      type="button"
                                      className="flex w-full items-center gap-3 rounded-lg border-0 bg-transparent px-2 py-2 text-left hover:bg-[#F5F5F5]"
                                      onClick={() =>
                                        addEvaluatorFromPicker({
                                          kind: 'user',
                                          userId: option.value,
                                        })
                                      }
                                    >
                                      {option.profileImage ? (
                                        <Avatar
                                          size={28}
                                          src={option.profileImage}
                                          className="shrink-0"
                                        />
                                      ) : (
                                        <Avatar
                                          size={28}
                                          className="shrink-0 bg-[#EFF6FF] text-[#1D4ED8]"
                                        >
                                          {option.initials}
                                        </Avatar>
                                      )}
                                      <span className="truncate text-[13px] font-medium text-[#262626]">
                                        {option.label}
                                      </span>
                                    </button>
                                  ))}
                                </div>
                              </div>
                            }
                          >
                            <button
                              type="button"
                              className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-dashed border-[#91caff] bg-[#e6f4ff] text-[#1677ff] hover:bg-[#bae0ff]"
                              title="Add evaluator"
                              data-cy={`bsc-assign-eval-add-${kpi.id}`}
                            >
                              +
                            </button>
                          </Popover>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        <div className="mt-6 flex justify-between gap-3">
          <CustomButton
            type="default"
            title={current === 0 ? 'Cancel' : 'Back'}
            onClick={current === 0 ? onClose : handleBack}
            className="h-10 px-6 rounded-lg"
          />
          <CustomButton
            type="primary"
            title={current === lastStep ? 'Save for person' : 'Continue'}
            onClick={handleNext}
            loading={appendKpis.isLoading}
            className="h-10 px-8 rounded-lg bg-[#2b54ad] hover:bg-[#3d66c2]"
            data-cy="bsc-assign-individual-step-continue"
          />
        </div>
      </div>
    </Modal>
  );
}
