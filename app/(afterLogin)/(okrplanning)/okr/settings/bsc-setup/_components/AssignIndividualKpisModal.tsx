'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  Avatar,
  Button,
  Checkbox,
  Input,
  InputNumber,
  Modal,
  Popover,
  Select,
  Steps,
  Tag,
  Tooltip,
} from 'antd';
import {
  CloseOutlined,
  DeleteOutlined,
  MinusOutlined,
  UserOutlined,
} from '@ant-design/icons';
import CustomButton from '@/components/common/buttons/customButton';
import BscSearchInput from '@/app/(afterLogin)/(bsc)/bsc/_components/BscSearchInput';
import { unitTagClassName } from '@/app/(afterLogin)/(bsc)/bsc/_components/TargetValueCell';
import NotificationMessage from '@/components/common/notification/notificationMessage';
import { useAppendIndividualBscKpis } from '@/store/server/features/bsc/mutation';
import { useGetBscKpiLibrary } from '@/store/server/features/bsc/queries';
import { useGetAllUsers } from '@/store/server/features/employees/employeeManagment/queries';
import {
  findDuplicateEvaluationStepLabel,
  isEvaluationStepAlreadyInFlow,
} from '@/utils/bsc/evaluationFlow';
import {
  BscCadence,
  BscEvaluatorStep,
  BscEvaluatorStepKind,
  EmployeeScorecard,
  KpiLibraryItem,
  TargetLogic,
} from '@/types/bsc';
import {
  checkInDayOptions,
  formatCheckInDate,
  KPI_CHECKIN_CADENCES,
  resolveFirstCheckInDate,
} from '@/utils/bsc/checkInSchedule';
import {
  validateAcceptableThreshold,
  validateWeights,
} from '@/utils/bsc/scoring';
import { measurementUnitLabel } from '@/utils/bsc/measurementUnit';

const KPI_LIST_ROW_GRID =
  'grid grid-cols-[32px_minmax(0,1fr)_120px_120px] gap-x-6 items-center px-2';

/* Weights step — same layout as the Add Scorecard BscSetupWeightsStep. */
const WEIGHTS_KPI_ROW_LAYOUT =
  'grid grid-cols-1 gap-y-3 px-3 py-3 sm:grid-cols-2 sm:gap-x-4 sm:px-4';
const WEIGHTS_TABLE_HEADER_LAYOUT =
  'grid grid-cols-1 gap-y-1 px-3 sm:grid-cols-2 sm:gap-x-4 sm:px-4';
const WEIGHTS_INPUT_FIELDS_GRID =
  'grid w-full max-w-full grid-cols-[minmax(60px,0.85fr)_minmax(72px,1fr)_minmax(72px,1fr)_minmax(72px,1fr)_minmax(100px,1.2fr)] grid-rows-[auto_auto] gap-x-2 gap-y-2';
const WEIGHTS_INPUT_HEADER_GRID =
  'grid grid-cols-[minmax(60px,0.85fr)_minmax(72px,1fr)_minmax(72px,1fr)_minmax(72px,1fr)_minmax(100px,1.2fr)] gap-x-2';
const weightsHeaderCellClassName = 'py-2.5 text-xs font-semibold text-gray-500';
const weightsFieldLabelClassName =
  'mb-1 block text-[11px] font-medium text-gray-500';
const weightsInputNumberClassName = '!w-full !h-8';
const weightsSelectClassName =
  '!w-full [&_.ant-select-selector]:!h-8 [&_.ant-select-selector]:!items-center';
const weightsTextInputClassName = '!w-full h-8 text-sm';
const CADENCE_OPTIONS = KPI_CHECKIN_CADENCES.map((cadence) => ({
  value: cadence,
  label: cadence,
}));

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
  /** Current settings of an existing KPI (shown read-only). */
  existingThreshold?: number | null;
  existingStretch?: number | null;
  existingCadence?: BscCadence | null;
  existingCheckInDay?: number | null;
  existingDataSource?: string | null;
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
    userId: step.kind === 'user' ? (step.userId ?? null) : null,
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
  const [measureDataSources, setMeasureDataSources] = useState<
    Record<string, string | null>
  >({});
  const [measureAcceptableThresholds, setMeasureAcceptableThresholds] =
    useState<Record<string, number | null>>({});
  // Same per-KPI fields as the Add Scorecard weights step.
  const [measureStretchTargets, setMeasureStretchTargets] = useState<
    Record<string, number | null>
  >({});
  const [measureCadences, setMeasureCadences] = useState<
    Record<string, BscCadence | null>
  >({});
  const [measureCheckInDays, setMeasureCheckInDays] = useState<
    Record<string, number | null>
  >({});
  const [measureWorstCases, setMeasureWorstCases] = useState<
    Record<string, number | null>
  >({});
  const [measureBestCases, setMeasureBestCases] = useState<
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
      // Unassigned KPIs need a perspective before they can be assigned.
      if (!kpi.perspective?.trim()) continue;
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
      existingThreshold: target.acceptableThreshold ?? null,
      existingStretch: target.stretchTarget ?? null,
      existingCadence: target.cadence ?? null,
      existingCheckInDay: target.checkInDay ?? null,
      existingDataSource: target.dataSource ?? null,
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

  useEffect(() => {
    if (!open) return;
    setCurrent(0);
    setSelectedIds([]);
    setKpiSearch('');
    setPersonWeights({});
    setMeasureTargets({});
    setMeasureDataSources({});
    setMeasureAcceptableThresholds({});
    setMeasureStretchTargets({});
    setMeasureCadences({});
    setMeasureCheckInDays({});
    setMeasureWorstCases({});
    setMeasureBestCases({});
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
    const worst: Record<string, number | null> = {};
    const best: Record<string, number | null> = {};
    selectedKpis.forEach((kpi) => {
      const key = `new:${kpi.id}`;
      targets[key] = measureTargets[key] ?? kpi.defaultTarget ?? null;
      // Bounded KPIs: prefill worst/best from the catalog.
      worst[key] = measureWorstCases[key] ?? kpi.worstCase ?? null;
      best[key] = measureBestCases[key] ?? kpi.bestCase ?? null;
    });
    setMeasureTargets((prev) => ({ ...prev, ...targets }));
    setMeasureWorstCases((prev) => ({ ...prev, ...worst }));
    setMeasureBestCases((prev) => ({ ...prev, ...best }));
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
    const normalized = normalizeEvaluationFlow(flow);
    const duplicate = findDuplicateEvaluationStepLabel(normalized);
    if (duplicate) {
      NotificationMessage.error({
        message: `Duplicate evaluator in the chain: ${duplicate}`,
      });
      return false;
    }
    setKpiEvaluationFlows((prev) => ({
      ...prev,
      [kpiId]: normalized,
    }));
    return true;
  };

  const closeEmployeePicker = () => {
    setAddStepKpiId(null);
    setEmployeePickerSearch('');
  };

  const addEvaluatorFromPicker = (step: BscEvaluatorStep) => {
    if (!addStepKpiId) return;
    const currentFlow = kpiEvaluationFlows[addStepKpiId]?.length
      ? kpiEvaluationFlows[addStepKpiId]
      : defaultEvaluationFlow();
    if (isEvaluationStepAlreadyInFlow(currentFlow, step)) {
      NotificationMessage.error({
        message:
          'That evaluator is already in this evaluation chain. Choose a different one.',
      });
      return;
    }
    if (updateKpiFlow(addStepKpiId, [...currentFlow, step])) {
      closeEmployeePicker();
    }
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
      const duplicate = findDuplicateEvaluationStepLabel(flow);
      if (duplicate) {
        NotificationMessage.error({
          message: `${kpi.name} has a duplicate evaluator (${duplicate})`,
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
      const key = `new:${kpi.id}`;
      const target = measureTargets[key];
      if (target == null || Number.isNaN(Number(target))) {
        NotificationMessage.error({
          message: `Enter a target for ${kpi.name}`,
        });
        return;
      }
      if (!measureDataSources[key]?.trim()) {
        NotificationMessage.error({
          message: `Enter a data source for ${kpi.name}`,
        });
        return;
      }
      if (
        (kpi.targetLogic === TargetLogic.HigherBetter ||
          kpi.targetLogic === TargetLogic.LowerBetter) &&
        measureAcceptableThresholds[key] == null
      ) {
        NotificationMessage.error({
          message: `Set an acceptable threshold for ${kpi.name}`,
        });
        return;
      }
      if (measureAcceptableThresholds[key] != null) {
        const thresholdCheck = validateAcceptableThreshold(
          Number(target),
          Number(measureAcceptableThresholds[key]),
          kpi.targetLogic,
        );
        if (!thresholdCheck.valid) {
          NotificationMessage.error({
            message:
              thresholdCheck.message || `Invalid threshold for ${kpi.name}`,
          });
          return;
        }
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
        dataSource: measureDataSources[`new:${kpi.id}`]?.trim() || null,
        acceptableThreshold:
          measureAcceptableThresholds[`new:${kpi.id}`] ?? null,
        stretchTarget: measureStretchTargets[`new:${kpi.id}`] ?? null,
        cadence: measureCadences[`new:${kpi.id}`] ?? null,
        checkInDay: measureCheckInDays[`new:${kpi.id}`] ?? null,
        worstCase:
          kpi.targetLogic === TargetLogic.Bounded
            ? (measureWorstCases[`new:${kpi.id}`] ?? null)
            : null,
        bestCase:
          kpi.targetLogic === TargetLogic.Bounded
            ? (measureBestCases[`new:${kpi.id}`] ?? null)
            : null,
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
        const key = `new:${kpi.id}`;
        const target = measureTargets[key];
        if (target == null || Number.isNaN(Number(target))) {
          NotificationMessage.error({
            message: `Enter a target for ${kpi.name}`,
          });
          return;
        }
        if (!measureDataSources[key]?.trim()) {
          NotificationMessage.error({
            message: `Enter a data source for ${kpi.name}`,
          });
          return;
        }
        if (
          (kpi.targetLogic === TargetLogic.HigherBetter ||
            kpi.targetLogic === TargetLogic.LowerBetter) &&
          measureAcceptableThresholds[key] == null
        ) {
          NotificationMessage.error({
            message: `Set an acceptable threshold for ${kpi.name}`,
          });
          return;
        }
        if (measureAcceptableThresholds[key] != null) {
          const thresholdCheck = validateAcceptableThreshold(
            Number(target),
            Number(measureAcceptableThresholds[key]),
            kpi.targetLogic,
          );
          if (!thresholdCheck.valid) {
            NotificationMessage.error({
              message:
                thresholdCheck.message || `Invalid threshold for ${kpi.name}`,
            });
            return;
          }
        }
        if (kpi.targetLogic === TargetLogic.Bounded) {
          const worst = measureWorstCases[key];
          const best = measureBestCases[key];
          if (worst == null || best == null) {
            NotificationMessage.error({
              message: `Set worst and best case for ${kpi.name}`,
            });
            return;
          }
          if (Number(worst) === Number(best)) {
            NotificationMessage.error({
              message: `Worst and best case cannot be equal for ${kpi.name}`,
            });
            return;
          }
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
      width={1040}
      closeIcon={<CloseOutlined />}
      destroyOnClose
      title={
        <div data-cy="bsc-assign-individual-title">
          <h2
            data-cy="assignindividualkpismodal-h2-491"
            className="m-0 text-xl font-bold text-black"
          >
            Add individual KPIs
          </h2>
          <p
            data-cy="assignindividualkpismodal-p-494"
            className="m-0 mt-1 text-sm font-normal text-[#595959]"
          >
            {activeScorecard
              ? `Select KPIs for ${activeScorecard.userName}, set weights, then define evaluators.`
              : 'Choose a person, select KPIs, set weights, then define evaluators.'}
          </p>
        </div>
      }
      data-cy="bsc-assign-individual-kpis-modal"
    >
      <div
        data-cy="assignindividualkpismodal-div-503"
        className="mb-4 mt-2 hidden sm:block"
      >
        <Steps
          current={current}
          progressDot
          labelPlacement="vertical"
          className="px-2"
          items={STEPS}
          data-cy="bsc-assign-individual-steps"
        />
      </div>

      <div data-cy="assignindividualkpismodal-div-514" className="mt-2">
        {current === 0 && (
          <>
            {needsPersonPick ? (
              <div data-cy="assignindividualkpismodal-div-518" className="mb-4">
                <p
                  data-cy="assignindividualkpismodal-p-519"
                  className="mb-2 text-[13px] font-semibold text-[#262626]"
                >
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

            <div
              data-cy="assignindividualkpismodal-div-544"
              className="mb-3 flex flex-wrap items-start justify-between gap-3"
            >
              <div
                data-cy="assignindividualkpismodal-div-545"
                className="min-w-0 flex-1"
              >
                <p
                  data-cy="assignindividualkpismodal-p-546"
                  className="mb-1 text-[13px] font-semibold text-[#262626]"
                >
                  KPIs
                </p>
                <p
                  data-cy="assignindividualkpismodal-p-549"
                  className="mb-0 text-[12px] text-[#8F94A3]"
                >
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
              <p
                data-cy="assignindividualkpismodal-p-565"
                className="text-[13px] text-[#94A3B8]"
              >
                Select a person to choose KPIs.
              </p>
            ) : !availableKpis.length ? (
              <p
                data-cy="assignindividualkpismodal-p-569"
                className="text-[13px] text-[#94A3B8]"
              >
                No additional catalog KPIs available for this person.
              </p>
            ) : (
              <>
                <div
                  className="mb-3 flex flex-wrap items-center justify-between gap-2"
                  data-cy="bsc-assign-individual-kpi-toolbar"
                >
                  <span
                    className="text-[12px] text-[#8F94A3]"
                    data-cy="bsc-assign-individual-kpi-selected-count"
                  >
                    {selectedIds.length} KPI
                    {selectedIds.length === 1 ? '' : 's'} selected
                  </span>
                </div>
                <div
                  className="max-h-[440px] overflow-y-auto rounded-xl border border-[#E5E7EB] bg-white p-2"
                  data-cy="bsc-assign-individual-kpi-list"
                >
                  <div
                    className={`${KPI_LIST_ROW_GRID} border-b border-[#E5E7EB] py-2 pb-2.5`}
                    data-cy="bsc-assign-individual-kpi-list-header"
                  >
                    <span
                      data-cy="assignindividualkpismodal-span-594"
                      aria-hidden
                    />
                    <span
                      data-cy="assignindividualkpismodal-span-595"
                      className="text-[11px] font-semibold uppercase tracking-wide text-[#8F94A3]"
                    >
                      KPI
                    </span>
                    <span
                      data-cy="assignindividualkpismodal-span-598"
                      className="text-[11px] font-semibold uppercase tracking-wide text-[#8F94A3]"
                    >
                      Perspective
                    </span>
                    <span
                      data-cy="assignindividualkpismodal-span-601"
                      className="text-[11px] font-semibold uppercase tracking-wide text-[#8F94A3]"
                    >
                      Unit
                    </span>
                  </div>
                  <div
                    data-cy="assignindividualkpismodal-div-605"
                    className="flex flex-col gap-0.5 pt-1"
                  >
                    {filteredCatalogKpis.map((kpi) => {
                      const checked = selectedIds.includes(kpi.id);
                      return (
                        <label
                          key={kpi.id}
                          className={`${KPI_LIST_ROW_GRID} cursor-pointer rounded-lg py-2 hover:bg-[#F9FAFB]`}
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
                          <span
                            data-cy="assignindividualkpismodal-span-624"
                            className="min-w-0 text-[13px] font-medium leading-snug text-[#262626]"
                          >
                            {kpi.name}
                          </span>
                          <div
                            data-cy="assignindividualkpismodal-div-627"
                            className="flex items-center"
                          >
                            {kpi.perspective ? (
                              <Tag className="m-0 h-5 shrink-0 rounded border border-[#91caff] bg-[#e6f4ff] px-1.5 text-[11px] font-normal leading-5 text-[#1677ff]">
                                {kpi.perspective}
                              </Tag>
                            ) : (
                              <span
                                data-cy="assignindividualkpismodal-span-633"
                                className="text-[11px] text-[#94A3B8]"
                              >
                                —
                              </span>
                            )}
                          </div>
                          <div
                            data-cy="assignindividualkpismodal-div-638"
                            className="flex items-center"
                          >
                            {(() => {
                              const unitLabel = measurementUnitLabel(
                                kpi.measurementUnit,
                              );
                              return unitLabel ? (
                                <Tag className={unitTagClassName}>
                                  {unitLabel}
                                </Tag>
                              ) : (
                                <span
                                  data-cy="assignindividualkpismodal-span-648"
                                  className="text-[11px] text-[#94A3B8]"
                                >
                                  —
                                </span>
                              );
                            })()}
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </>
        )}

        {current === 1 && (
          <>
            <p
              data-cy="assignindividualkpismodal-p-666"
              className="mb-1 text-[13px] font-semibold text-[#262626]"
            >
              Weights & targets
            </p>
            <p
              data-cy="assignindividualkpismodal-p-669"
              className="mb-4 text-[12px] text-[#8F94A3]"
            >
              Assign weights (must sum to 100%), targets, validation fields, and
              check-in schedule for each new KPI. Existing KPIs keep their
              settings — only their weight can change, so the total still adds
              to 100% for this person.
            </p>

            {!weightRows.length ? (
              <p
                data-cy="assignindividualkpismodal-p-677"
                className="text-[13px] text-[#94A3B8]"
              >
                No KPIs selected. Go back and select KPIs first.
              </p>
            ) : (
              <div
                className="flex max-h-[440px] flex-col gap-3 overflow-y-auto pr-1"
                data-cy="bsc-assign-individual-weights"
              >
                <div
                  data-cy="assignindividualkpismodal-div-685"
                  className="flex items-center justify-between rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] px-3 py-2"
                >
                  <span
                    data-cy="assignindividualkpismodal-span-686"
                    className="text-[12px] text-[#595959]"
                  >
                    Total KPI weight
                  </span>
                  <span
                    className={`text-[13px] font-semibold ${
                      Math.abs(weightSum - 100) < 0.01
                        ? 'text-[#1677ff]'
                        : 'text-[#CF1322]'
                    }`}
                    data-cy="bsc-assign-individual-weight-total"
                  >
                    {`${Math.round(weightSum * 100) / 100}%`}
                  </span>
                </div>
                {!weightCheck.valid && weightSum > 0 ? (
                  <p
                    data-cy="assignindividualkpismodal-p-701"
                    className="m-0 text-[12px] text-[#CF1322]"
                  >
                    {weightCheck.message}
                  </p>
                ) : null}

                {/* Same table layout as the Add Scorecard "Weights" step. */}
                <div
                  className="overflow-hidden rounded-lg border border-[#D9D9D9] bg-white shadow-none"
                  data-cy="bsc-assign-weights-table"
                >
                  <div
                    data-cy="bsc-assign-weights-table-head"
                    className="sticky top-0 z-[1] border-b border-[#E5E7EB] bg-white"
                  >
                    <div
                      data-cy="bsc-assign-weights-head-row"
                      className={WEIGHTS_TABLE_HEADER_LAYOUT}
                    >
                      <span
                        data-cy="bsc-assign-weights-head-kpi"
                        className={weightsHeaderCellClassName}
                      >
                        KPI
                      </span>
                      <div
                        data-cy="bsc-assign-weights-head-inputs"
                        className={WEIGHTS_INPUT_HEADER_GRID}
                      >
                        {[
                          'Weight',
                          'Target',
                          'Threshold',
                          'Stretch',
                          'Cadence',
                        ].map((label) => (
                          <span
                            key={label}
                            data-cy={`bsc-assign-weights-head-${label.toLowerCase()}`}
                            className={weightsHeaderCellClassName}
                          >
                            {label}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div data-cy="bsc-assign-weights-table-body">
                    {weightRows.map((row) => {
                      const isNew = row.kind === 'new';
                      const isBounded = row.targetLogic === TargetLogic.Bounded;
                      const showThreshold =
                        row.targetLogic === TargetLogic.HigherBetter ||
                        row.targetLogic === TargetLogic.LowerBetter;
                      const kpiCadence = measureCadences[row.key] ?? null;
                      const firstCheckInDate = isNew
                        ? resolveFirstCheckInDate(
                            kpiCadence,
                            measureCheckInDays[row.key],
                            activeScorecard?.periodStart,
                          )
                        : null;
                      const thresholdCheck =
                        isNew &&
                        row.targetLogic &&
                        measureTargets[row.key] != null &&
                        measureAcceptableThresholds[row.key] != null
                          ? validateAcceptableThreshold(
                              Number(measureTargets[row.key]),
                              Number(measureAcceptableThresholds[row.key]),
                              row.targetLogic,
                            )
                          : { valid: true as const };
                      const readOnly = (value: React.ReactNode, cy: string) => (
                        <span
                          data-cy={`bsc-assign-${cy}-${row.key}`}
                          className="self-center truncate text-sm text-gray-500"
                        >
                          {value ?? '—'}
                        </span>
                      );

                      return (
                        <div
                          key={row.key}
                          className="border-b border-[#F0F0F0] bg-white last:border-b-0"
                          data-cy={`bsc-assign-weight-row-${row.key}`}
                        >
                          <div
                            className={`${WEIGHTS_KPI_ROW_LAYOUT} [&_.ant-input-number]:self-center [&_.ant-select]:self-center`}
                            data-cy={`bsc-assign-weight-block-${row.key}`}
                          >
                            <div
                              data-cy={`bsc-assign-weight-kpi-${row.key}`}
                              className="flex min-w-0 items-center self-center"
                            >
                              <div
                                data-cy={`bsc-assign-weight-kpi-info-${row.key}`}
                                className="flex min-w-0 flex-col gap-1"
                              >
                                <p
                                  data-cy={`bsc-assign-weight-kpi-name-${row.key}`}
                                  className="m-0 min-w-0 truncate text-base font-semibold leading-6 text-gray-900"
                                >
                                  {row.name}
                                </p>
                                <div
                                  data-cy={`bsc-assign-weight-kpi-meta-${row.key}`}
                                  className="flex flex-wrap items-center gap-x-3 gap-y-1.5"
                                >
                                  {row.perspective ? (
                                    <Tag
                                      data-cy={`bsc-assign-weight-perspective-${row.key}`}
                                      className="m-0 h-5 shrink-0 rounded border border-[#91caff] bg-[#e6f4ff] px-1.5 text-[10px] font-normal leading-5 text-[#1677ff]"
                                    >
                                      {row.perspective}
                                    </Tag>
                                  ) : null}
                                  <Tag
                                    data-cy={`bsc-assign-weight-source-${row.key}`}
                                    className={`m-0 h-5 shrink-0 rounded border px-1.5 text-[10px] font-normal leading-5 ${
                                      isNew
                                        ? 'border-[#b7eb8f] bg-[#f6ffed] text-[#389E0D]'
                                        : 'border-[#d9d9d9] bg-[#fafafa] text-[#595959]'
                                    }`}
                                  >
                                    {isNew
                                      ? 'New · Individual'
                                      : row.source === 'individual'
                                        ? 'Individual'
                                        : 'Shared'}
                                  </Tag>
                                  <span
                                    data-cy={`bsc-assign-weight-logic-${row.key}`}
                                    className="shrink-0 text-[10px] text-gray-500"
                                  >
                                    {targetLogicLabel(row.targetLogic)}
                                  </span>
                                  {firstCheckInDate ? (
                                    <span
                                      data-cy={`bsc-assign-weight-first-checkin-${row.key}`}
                                      className="shrink-0 text-[10px] text-gray-500"
                                    >
                                      First check-in:{' '}
                                      {formatCheckInDate(firstCheckInDate)}
                                    </span>
                                  ) : null}
                                </div>
                              </div>
                            </div>

                            <div
                              className={`${WEIGHTS_INPUT_FIELDS_GRID} min-w-0 justify-self-stretch sm:max-w-full`}
                              data-cy={`bsc-assign-weight-fields-${row.key}`}
                            >
                              {/* Weight — editable for every KPI (total 100%). */}
                              <InputNumber
                                className={weightsInputNumberClassName}
                                min={1}
                                max={100}
                                placeholder="%"
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

                              {isNew ? (
                                <InputNumber
                                  className={weightsInputNumberClassName}
                                  placeholder={
                                    row.defaultTarget != null
                                      ? String(row.defaultTarget)
                                      : 'Target'
                                  }
                                  value={measureTargets[row.key] ?? undefined}
                                  onChange={(value) =>
                                    setMeasureTargets((prev) => ({
                                      ...prev,
                                      [row.key]:
                                        value == null ? null : Number(value),
                                    }))
                                  }
                                  data-cy={`bsc-assign-target-${row.key}`}
                                />
                              ) : (
                                readOnly(row.existingTarget, 'target-ro')
                              )}

                              {isNew && showThreshold ? (
                                <Tooltip
                                  title={
                                    !thresholdCheck.valid
                                      ? thresholdCheck.message
                                      : row.targetLogic ===
                                          TargetLogic.HigherBetter
                                        ? 'Must be ≤ target'
                                        : 'Must be ≥ target'
                                  }
                                >
                                  <InputNumber
                                    className={weightsInputNumberClassName}
                                    placeholder="Min/max"
                                    status={
                                      !thresholdCheck.valid
                                        ? 'error'
                                        : undefined
                                    }
                                    value={
                                      measureAcceptableThresholds[row.key] ??
                                      undefined
                                    }
                                    onChange={(value) =>
                                      setMeasureAcceptableThresholds(
                                        (prev) => ({
                                          ...prev,
                                          [row.key]:
                                            value == null
                                              ? null
                                              : Number(value),
                                        }),
                                      )
                                    }
                                    data-cy={`bsc-kpi-assignment-threshold-${row.key}`}
                                  />
                                </Tooltip>
                              ) : (
                                readOnly(
                                  isNew ? null : row.existingThreshold,
                                  'threshold-ro',
                                )
                              )}

                              {isNew ? (
                                <Tooltip title="Optional aspirational target beyond the standard target">
                                  <InputNumber
                                    className={weightsInputNumberClassName}
                                    placeholder="Stretch"
                                    value={
                                      measureStretchTargets[row.key] ??
                                      undefined
                                    }
                                    onChange={(value) =>
                                      setMeasureStretchTargets((prev) => ({
                                        ...prev,
                                        [row.key]:
                                          value == null ? null : Number(value),
                                      }))
                                    }
                                    data-cy={`bsc-assign-stretch-${row.key}`}
                                  />
                                </Tooltip>
                              ) : (
                                readOnly(row.existingStretch, 'stretch-ro')
                              )}

                              {isNew ? (
                                <Select
                                  className={weightsSelectClassName}
                                  placeholder="Cadence"
                                  options={CADENCE_OPTIONS}
                                  value={kpiCadence ?? undefined}
                                  onChange={(value: BscCadence) => {
                                    setMeasureCadences((prev) => ({
                                      ...prev,
                                      [row.key]: value,
                                    }));
                                    setMeasureCheckInDays((prev) => ({
                                      ...prev,
                                      [row.key]: null,
                                    }));
                                  }}
                                  data-cy={`bsc-assign-cadence-${row.key}`}
                                />
                              ) : (
                                readOnly(row.existingCadence, 'cadence-ro')
                              )}

                              <div
                                data-cy={`bsc-assign-data-source-wrap-${row.key}`}
                                className="col-span-4 min-w-0"
                              >
                                <label
                                  data-cy={`bsc-assign-data-source-label-${row.key}`}
                                  className={weightsFieldLabelClassName}
                                >
                                  Data source
                                </label>
                                {isNew ? (
                                  <Input
                                    className={weightsTextInputClassName}
                                    type="url"
                                    placeholder="https://example.com/report"
                                    value={measureDataSources[row.key] ?? ''}
                                    onChange={(event) =>
                                      setMeasureDataSources((prev) => ({
                                        ...prev,
                                        [row.key]: event.target.value || null,
                                      }))
                                    }
                                    data-cy={`bsc-kpi-assignment-data-source-${row.key}`}
                                  />
                                ) : (
                                  readOnly(
                                    row.existingDataSource,
                                    'data-source-ro',
                                  )
                                )}
                              </div>

                              <div
                                data-cy={`bsc-assign-checkin-wrap-${row.key}`}
                                className="min-w-0"
                              >
                                <label
                                  data-cy={`bsc-assign-checkin-label-${row.key}`}
                                  className={weightsFieldLabelClassName}
                                >
                                  Check-in day
                                </label>
                                {isNew ? (
                                  <Select
                                    className={weightsSelectClassName}
                                    placeholder="Day"
                                    options={checkInDayOptions(kpiCadence)}
                                    disabled={!kpiCadence}
                                    value={
                                      measureCheckInDays[row.key] ?? undefined
                                    }
                                    onChange={(value: number) =>
                                      setMeasureCheckInDays((prev) => ({
                                        ...prev,
                                        [row.key]: value,
                                      }))
                                    }
                                    data-cy={`bsc-assign-checkin-day-${row.key}`}
                                  />
                                ) : (
                                  readOnly(
                                    row.existingCheckInDay != null
                                      ? `Day ${row.existingCheckInDay}`
                                      : null,
                                    'checkin-ro',
                                  )
                                )}
                              </div>

                              {isNew && isBounded ? (
                                <div
                                  data-cy={`bsc-assign-bounds-${row.key}`}
                                  className="col-span-5 flex flex-wrap items-center gap-3 pt-1"
                                >
                                  <div
                                    data-cy={`bsc-assign-worst-wrap-${row.key}`}
                                    className="flex items-center gap-2"
                                  >
                                    <span
                                      data-cy={`bsc-assign-worst-label-${row.key}`}
                                      className="text-[11px] font-medium text-gray-500"
                                    >
                                      Worst
                                    </span>
                                    <InputNumber
                                      className="w-24"
                                      value={
                                        measureWorstCases[row.key] ?? undefined
                                      }
                                      onChange={(value) =>
                                        setMeasureWorstCases((prev) => ({
                                          ...prev,
                                          [row.key]:
                                            value == null
                                              ? null
                                              : Number(value),
                                        }))
                                      }
                                      data-cy={`bsc-assign-worst-${row.key}`}
                                    />
                                  </div>
                                  <div
                                    data-cy={`bsc-assign-best-wrap-${row.key}`}
                                    className="flex items-center gap-2"
                                  >
                                    <span
                                      data-cy={`bsc-assign-best-label-${row.key}`}
                                      className="text-[11px] font-medium text-gray-500"
                                    >
                                      Best
                                    </span>
                                    <InputNumber
                                      className="w-24"
                                      value={
                                        measureBestCases[row.key] ?? undefined
                                      }
                                      onChange={(value) =>
                                        setMeasureBestCases((prev) => ({
                                          ...prev,
                                          [row.key]:
                                            value == null
                                              ? null
                                              : Number(value),
                                        }))
                                      }
                                      data-cy={`bsc-assign-best-${row.key}`}
                                    />
                                  </div>
                                </div>
                              ) : null}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
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
            <p
              className="mb-4 text-[12px] text-[#8F94A3]"
              data-cy="bsc-assign-individual-evaluation-desc"
            >
              Define who evaluates each new KPI, in order. Any combination of
              self, direct manager, and specific people is allowed.
            </p>

            {!selectedKpis.length ? (
              <p
                data-cy="assignindividualkpismodal-p-822"
                className="text-[13px] text-[#94A3B8]"
              >
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
                      className="rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] px-3 py-3"
                      data-cy={`bsc-assign-eval-row-${kpi.id}`}
                    >
                      <div
                        data-cy="assignindividualkpismodal-div-841"
                        className="mb-2 flex flex-wrap items-center gap-2"
                      >
                        <span
                          data-cy="assignindividualkpismodal-span-842"
                          className="text-[13px] font-medium text-[#262626]"
                        >
                          {kpi.name}
                        </span>
                        {kpi.perspective ? (
                          <Tag className="m-0 h-5 rounded border border-[#91caff] bg-[#e6f4ff] px-1.5 text-[11px] font-normal leading-5 text-[#1677ff]">
                            {kpi.perspective}
                          </Tag>
                        ) : null}
                      </div>

                      <div
                        className="w-full overflow-x-auto"
                        data-cy={`bsc-eval-flow-${kpi.id}`}
                      >
                        <div
                          data-cy="assignindividualkpismodal-div-856"
                          className="flex min-w-max items-center gap-1.5 py-1"
                        >
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
                              <div
                                data-cy="assignindividualkpismodal-div-870"
                                className="w-[240px] p-1"
                              >
                                <p
                                  data-cy="assignindividualkpismodal-p-871"
                                  className="mb-2 text-[12px] font-medium text-[#262626]"
                                >
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
                                  data-cy={`bsc-eval-step-kind-${kpi.id}-${index}`}
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
                                    data-cy={`bsc-eval-step-user-${kpi.id}-${index}`}
                                  />
                                ) : null}
                                <div
                                  data-cy="assignindividualkpismodal-div-913"
                                  className="flex justify-between gap-1"
                                >
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
                                    data-cy={`bsc-eval-step-up-${kpi.id}-${index}`}
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
                                    data-cy={`bsc-eval-step-down-${kpi.id}-${index}`}
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
                                        flow.filter((unused, i) => i !== index),
                                      );
                                    }}
                                    data-cy={`bsc-eval-step-remove-menu-${kpi.id}-${index}`}
                                  />
                                </div>
                              </div>
                            );

                            return (
                              <React.Fragment key={`${kpi.id}-step-${index}`}>
                                {index > 0 ? (
                                  <div
                                    className="inline-flex h-5 min-w-6 shrink-0 items-center justify-center rounded-full border border-[#E3E7FF] bg-[#F7F8FF] px-1 text-[11px] font-semibold text-[#5B67D9]"
                                    data-cy={`bsc-eval-connector-${kpi.id}-${index}`}
                                  >
                                    →
                                  </div>
                                ) : null}
                                <div
                                  data-cy="assignindividualkpismodal-div-977"
                                  className="flex shrink-0 items-center gap-2"
                                >
                                  <div
                                    data-cy="assignindividualkpismodal-div-978"
                                    className="relative h-8 w-8 shrink-0"
                                  >
                                    <Popover
                                      trigger="click"
                                      placement="bottomLeft"
                                      content={editor}
                                    >
                                      <div
                                        role="button"
                                        tabIndex={0}
                                        className="cursor-pointer"
                                        data-cy={`bsc-eval-step-avatar-${kpi.id}-${index}`}
                                        onKeyDown={(e) => {
                                          if (
                                            e.key === 'Enter' ||
                                            e.key === ' '
                                          ) {
                                            e.currentTarget.click();
                                          }
                                        }}
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
                                              step.kind ===
                                              'user' ? undefined : (
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
                                      data-cy="assignindividualkpismodal-button-1027"
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
                                          flow.filter(
                                            (unused, i) => i !== index,
                                          ),
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
                                      data-cy={`bsc-eval-step-label-${kpi.id}-${index}`}
                                    >
                                      {truncateName(displayName)}
                                    </div>
                                  </Popover>
                                </div>
                              </React.Fragment>
                            );
                          })}

                          <div
                            data-cy="assignindividualkpismodal-div-1069"
                            className="inline-flex h-5 min-w-6 shrink-0 items-center justify-center rounded-full border border-[#E3E7FF] bg-[#F7F8FF] px-1 text-[11px] font-semibold text-[#5B67D9]"
                          >
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
                              <div
                                data-cy="assignindividualkpismodal-div-1089"
                                className="mb-1 flex items-start justify-between gap-2"
                              >
                                <div data-cy="assignindividualkpismodal-div-1090">
                                  <h3
                                    data-cy="assignindividualkpismodal-h3-1091"
                                    className="m-0 text-base font-bold text-gray-900"
                                  >
                                    Add evaluator
                                  </h3>
                                  <p
                                    data-cy="assignindividualkpismodal-p-1094"
                                    className="mb-0 mt-1 text-xs text-gray-500"
                                  >
                                    Search and select who evaluates next
                                  </p>
                                </div>
                                <button
                                  data-cy="assignindividualkpismodal-button-1098"
                                  type="button"
                                  onClick={closeEmployeePicker}
                                  className="cursor-pointer border-none bg-transparent p-1 text-gray-400 hover:text-gray-600"
                                >
                                  <CloseOutlined />
                                </button>
                              </div>
                            }
                            content={
                              <div data-cy="assignindividualkpismodal-div-1108">
                                <div
                                  data-cy="assignindividualkpismodal-div-1109"
                                  className="mb-2 w-full [&_.ant-input-affix-wrapper]:!w-full [&_input]:!w-full"
                                >
                                  <BscSearchInput
                                    value={employeePickerSearch}
                                    onChange={setEmployeePickerSearch}
                                    placeholder="Search employees"
                                    className="!w-full !max-w-none"
                                  />
                                </div>
                                <div
                                  data-cy="assignindividualkpismodal-div-1117"
                                  className="flex max-h-[280px] flex-col gap-0.5 overflow-y-auto"
                                >
                                  <button
                                    data-cy="assignindividualkpismodal-button-1118"
                                    type="button"
                                    className="flex w-full items-center gap-3 rounded-lg border-0 bg-transparent px-2 py-2 text-left hover:bg-[#F5F5F5] disabled:cursor-not-allowed disabled:opacity-40"
                                    disabled={isEvaluationStepAlreadyInFlow(
                                      flow,
                                      { kind: 'self' },
                                    )}
                                    onClick={() =>
                                      addEvaluatorFromPicker({ kind: 'self' })
                                    }
                                  >
                                    <Avatar
                                      size={28}
                                      icon={<UserOutlined />}
                                      className="shrink-0 bg-[#E6F4FF] text-[#1677ff]"
                                    />
                                    <span
                                      data-cy="assignindividualkpismodal-span-1130"
                                      className="text-[13px] font-medium text-[#262626]"
                                    >
                                      Employee (self)
                                    </span>
                                  </button>
                                  <button
                                    data-cy="assignindividualkpismodal-button-1134"
                                    type="button"
                                    className="flex w-full items-center gap-3 rounded-lg border-0 bg-transparent px-2 py-2 text-left hover:bg-[#F5F5F5] disabled:cursor-not-allowed disabled:opacity-40"
                                    disabled={isEvaluationStepAlreadyInFlow(
                                      flow,
                                      { kind: 'directManager' },
                                    )}
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
                                    <span
                                      data-cy="assignindividualkpismodal-span-1148"
                                      className="text-[13px] font-medium text-[#262626]"
                                    >
                                      Direct manager
                                    </span>
                                  </button>
                                  {filteredPickerEmployees.map((option) => (
                                    <button
                                      data-cy="assignindividualkpismodal-button-1153"
                                      key={option.value}
                                      type="button"
                                      className="flex w-full items-center gap-3 rounded-lg border-0 bg-transparent px-2 py-2 text-left hover:bg-[#F5F5F5] disabled:cursor-not-allowed disabled:opacity-40"
                                      disabled={isEvaluationStepAlreadyInFlow(
                                        flow,
                                        {
                                          kind: 'user',
                                          userId: option.value,
                                        },
                                      )}
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
                                      <span
                                        data-cy="assignindividualkpismodal-span-1178"
                                        className="truncate text-[13px] font-medium text-[#262626]"
                                      >
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

        <div
          data-cy="assignindividualkpismodal-div-1206"
          className="mt-6 flex justify-end gap-3"
        >
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
