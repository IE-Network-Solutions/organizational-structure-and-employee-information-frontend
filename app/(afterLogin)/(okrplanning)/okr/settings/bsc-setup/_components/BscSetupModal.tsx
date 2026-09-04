'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Avatar,
  Button,
  Checkbox,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Modal,
  Popover,
  Radio,
  Select,
  Steps,
  Tag,
} from 'antd';
import {
  CloseOutlined,
  DeleteOutlined,
  MinusOutlined,
  PlusOutlined,
  UserOutlined,
} from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';
import CustomButton from '@/components/common/buttons/customButton';
import BscSearchInput from '@/app/(afterLogin)/(bsc)/bsc/_components/BscSearchInput';
import {
  useCreateBscCycle,
  useCreateBscScorecard,
  useSaveBscRoleKpis,
  useSaveBscRolePerspectives,
  useUpdateBscCycle,
} from '@/store/server/features/bsc/mutation';
import {
  useGetBscKpiLibrary,
  useGetBscPerspectiveCatalog,
  useGetBscRolePerspectives,
} from '@/store/server/features/bsc/queries';
import { useGetDepartments } from '@/store/server/features/employees/employeeManagment/department/queries';
import { useGetAllUsers } from '@/store/server/features/employees/employeeManagment/queries';
import { useGetAllPositions } from '@/store/server/features/employees/positions/queries';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { useBscUiStore } from '@/store/uistate/features/bsc';
import {
  BscCadence,
  BscEvaluatorMode,
  BscEvaluatorStep,
  BscEvaluatorStepKind,
  BscKpiEvaluatorAssignment,
  BscScopeTarget,
  BscSetupKind,
  KpiLibraryItem,
  TargetLogic,
} from '@/types/bsc';
import {
  validatePerspectiveWeights,
  validateWeights,
} from '@/utils/bsc/scoring';
import NotificationMessage from '@/components/common/notification/notificationMessage';

const { RangePicker } = DatePicker;
const { TextArea } = Input;

function asList(data: any): any[] {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.items)) return data.items;
  return [];
}

function formCadence(cadence?: BscCadence): BscCadence {
  if (
    cadence === BscCadence.Weekly ||
    cadence === BscCadence.Monthly ||
    cadence === BscCadence.Yearly ||
    cadence === BscCadence.Quarterly
  ) {
    return cadence;
  }
  return BscCadence.Monthly;
}

function resolveSetupKind(config: {
  setupKind?: BscSetupKind;
  useCustomDates?: boolean;
}): BscSetupKind {
  if (config.setupKind === BscSetupKind.Temporary) {
    return BscSetupKind.Temporary;
  }
  if (config.setupKind === BscSetupKind.Permanent) {
    return BscSetupKind.Permanent;
  }
  return config.useCustomDates
    ? BscSetupKind.Temporary
    : BscSetupKind.Permanent;
}

const CADENCE_OPTIONS = [
  { value: BscCadence.Weekly, label: 'Weekly', minDays: 7 },
  { value: BscCadence.Monthly, label: 'Monthly', minDays: 28 },
  { value: BscCadence.Quarterly, label: 'Quarterly', minDays: 90 },
  { value: BscCadence.Yearly, label: 'Yearly', minDays: 365 },
];

function periodDayCount(range?: [Dayjs, Dayjs] | null): number {
  if (!range?.[0] || !range?.[1]) return 0;
  return Math.max(
    range[1].startOf('day').diff(range[0].startOf('day'), 'day') + 1,
    0,
  );
}

function cadenceOptionsForPeriod(dayCount: number) {
  if (dayCount <= 0) return [];
  return CADENCE_OPTIONS.filter((option) => option.minDays <= dayCount);
}

const PERMANENT_START = () => dayjs().format('YYYY-MM-DD');
const PERMANENT_END = '2099-12-31';

function resolveScopeTarget(config: {
  scopeTarget?: BscScopeTarget;
  departmentIds?: string[];
  positionIds?: string[];
  employeeIds?: string[];
}): BscScopeTarget {
  if (config.scopeTarget) return config.scopeTarget;
  if (config.employeeIds?.length) return BscScopeTarget.Individual;
  if (config.positionIds?.length) return BscScopeTarget.Role;
  if (config.departmentIds?.length) return BscScopeTarget.Department;
  return BscScopeTarget.Company;
}

const DEFAULT_EVALUATION_FLOW: BscEvaluatorStep[] = [
  { kind: 'self' },
  { kind: 'directManager' },
];

const EVALUATOR_STEP_OPTIONS: {
  value: BscEvaluatorStepKind;
  label: string;
}[] = [
  { value: 'self', label: 'Employee (self)' },
  { value: 'directManager', label: 'Direct manager' },
  { value: 'user', label: 'Specific person' },
];

function defaultEvaluationFlow(): BscEvaluatorStep[] {
  return DEFAULT_EVALUATION_FLOW.map((step) => ({ ...step }));
}

function normalizeEvaluationFlow(flow?: BscEvaluatorStep[] | null): BscEvaluatorStep[] {
  if (!flow?.length) return defaultEvaluationFlow();
  return flow.map((step) => ({
    kind: step.kind,
    userId: step.kind === 'user' ? step.userId ?? null : null,
  }));
}

/** Map legacy single assignment / scorecard defaults into a flow. */
function legacyAssignmentToFlow(
  assignment?: BscKpiEvaluatorAssignment | null,
  fallbackMode?: BscEvaluatorMode,
  fallbackUserId?: string | null,
): BscEvaluatorStep[] {
  const mode = assignment?.mode || fallbackMode || 'directManager';
  if (mode === 'user') {
    return [
      {
        kind: 'user',
        userId: assignment?.userId || fallbackUserId || null,
      },
    ];
  }
  return [{ kind: 'directManager' }];
}

function resolveKpiFlow(
  kpiId: string,
  flows?: Record<string, BscEvaluatorStep[]> | null,
  legacy?: Record<string, BscKpiEvaluatorAssignment> | null,
  fallbackMode?: BscEvaluatorMode,
  fallbackUserId?: string | null,
): BscEvaluatorStep[] {
  if (flows?.[kpiId]?.length) return normalizeEvaluationFlow(flows[kpiId]);
  if (legacy?.[kpiId]) {
    return legacyAssignmentToFlow(legacy[kpiId], fallbackMode, fallbackUserId);
  }
  if (fallbackMode || fallbackUserId) {
    return legacyAssignmentToFlow(null, fallbackMode, fallbackUserId);
  }
  return defaultEvaluationFlow();
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

function firstManagerLikeStep(
  flow: BscEvaluatorStep[],
): BscEvaluatorStep | undefined {
  return flow.find(
    (step) => step.kind === 'directManager' || step.kind === 'user',
  );
}

const STEPS = [
  { title: 'Define' },
  { title: 'Scope' },
  { title: 'KPIs' },
  { title: 'Weights' },
  { title: 'Evaluation' },
];

type PerspectiveRow = { name?: string; weight?: number | null };
type MeasureRow = {
  kpiId?: string;
  name?: string;
  perspective?: string;
  weight?: number | null;
  description?: string | null;
  targetLogic?: TargetLogic;
  measurementUnit?: string;
  defaultTarget?: number | null;
  targetValue?: number | null;
  worstCase?: number | null;
  bestCase?: number | null;
};

function targetLogicLabel(logic?: TargetLogic): string {
  if (logic === TargetLogic.LowerBetter) return 'Lower is better';
  if (logic === TargetLogic.Bounded) return 'Bounded';
  return 'Higher is better';
}

/** Split 100% across perspectives evenly. */
function seedPerspectiveRows(names: string[]): PerspectiveRow[] {
  if (!names.length) return [];
  const n = names.length;
  const base = Math.floor((100 / n) * 100) / 100;
  return names.map((name, index) => {
    if (index < n - 1) return { name, weight: base };
    const remainder = Math.round((100 - base * (n - 1)) * 100) / 100;
    return { name, weight: remainder };
  });
}

/**
 * Standard BSC cascade (Kaplan & Norton):
 * 1) Define the scorecard (identity, horizon, cadence)
 * 2) Set organizational scope (company, department, role, or individual)
 * 3) Select KPIs from all perspectives under the scorecard
 * 4) Assign perspective / KPI weights and cycle targets
 * 5) Choose scorecard-level evaluation default
 */
export default function BscSetupModal() {
  const [form] = Form.useForm();
  const [current, setCurrent] = useState(0);
  const [savingAll, setSavingAll] = useState(false);
  const [selectedKpiIds, setSelectedKpiIds] = useState<string[]>([]);
  const [kpiSearch, setKpiSearch] = useState('');
  const [addStepKpiId, setAddStepKpiId] = useState<string | null>(null);
  const [employeePickerSearch, setEmployeePickerSearch] = useState('');
  const {
    setupModalOpen,
    editingConfig,
    closeSetupModal,
    setSelectedConfigId,
  } = useBscUiStore();
  const { data: departmentsData } = useGetDepartments();
  const { data: positionsData } = useGetAllPositions();
  const { data: allUsersData } = useGetAllUsers();
  const { data: catalog } = useGetBscPerspectiveCatalog();
  const { data: allKpis, isFetched: kpisFetched } = useGetBscKpiLibrary();
  const { data: editAllocations } = useGetBscRolePerspectives(
    editingConfig?.id ? { evaluationConfigId: editingConfig.id } : undefined,
  );
  const createConfig = useCreateBscCycle();
  const updateConfig = useUpdateBscCycle();
  const savePerspectives = useSaveBscRolePerspectives();
  const saveRoleKpis = useSaveBscRoleKpis();
  const createScorecard = useCreateBscScorecard();
  const actorUserId = useAuthenticationStore((s) => s.userId);
  const editPrefillKeyRef = useRef<string | null>(null);

  const isEdit = Boolean(editingConfig);
  const stepItems = STEPS;
  const lastStep = stepItems.length - 1;

  const deptOptions = asList(departmentsData).map((d: any) => ({
    value: String(d.id),
    label: d.name || d.departmentName || 'Department',
  }));
  const positionOptions = asList(positionsData).map((p: any) => ({
    value: String(p.id),
    label: p.name || p.positionName || 'Position',
    departmentName: p.departmentName || p.department?.name || null,
  }));
  const employeeOptions = asList(allUsersData?.items || allUsersData || []).map(
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
        departmentId:
          user.employeeInformation?.departmentId ||
          user.departmentId ||
          user.department?.id ||
          null,
        positionId:
          user.employeeJobInformation?.[0]?.positionId ||
          user.positionId ||
          user.position?.id ||
          null,
        managerId:
          user.delegatedTo?.id ||
          user.reportingTo?.id ||
          user.employeeJobInformation?.[0]?.reportingToId ||
          null,
      };
    },
  );

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

  const closeEmployeePicker = () => {
    setAddStepKpiId(null);
    setEmployeePickerSearch('');
  };

  const setupKind = Form.useWatch('setupKind', form) as
    | BscSetupKind
    | undefined;
  const isTemporary = setupKind === BscSetupKind.Temporary;
  const isPermanent = setupKind === BscSetupKind.Permanent;
  const isRecurringChoice = Form.useWatch('isRecurring', form) as
    | boolean
    | undefined;
  const dateRange = Form.useWatch('dateRange', form) as
    | [Dayjs, Dayjs]
    | undefined;
  const selectedCadence = Form.useWatch('cadence', form) as
    | BscCadence
    | undefined;
  const perspectiveRows: PerspectiveRow[] =
    Form.useWatch('perspectiveRows', form) || [];
  const measureWeights: Record<string, number | null | undefined> =
    Form.useWatch('measureWeights', form) || {};
  const measureTargets: Record<string, number | null | undefined> =
    Form.useWatch('measureTargets', form) || {};
  const measureWorstCases: Record<string, number | null | undefined> =
    Form.useWatch('measureWorstCases', form) || {};
  const measureBestCases: Record<string, number | null | undefined> =
    Form.useWatch('measureBestCases', form) || {};
  const scopeTarget = Form.useWatch('scopeTarget', form) as
    | BscScopeTarget
    | undefined;
  const kpiEvaluationFlows = (Form.useWatch('kpiEvaluationFlows', form) ||
    {}) as Record<string, BscEvaluatorStep[]>;

  const showCadence =
    isPermanent || (isTemporary && isRecurringChoice === true);

  const temporaryDayCount = useMemo(
    () => (isTemporary ? periodDayCount(dateRange) : 0),
    [isTemporary, dateRange],
  );

  const cadenceOptions = useMemo(() => {
    if (!isTemporary) return CADENCE_OPTIONS;
    return cadenceOptionsForPeriod(temporaryDayCount);
  }, [isTemporary, temporaryDayCount]);

  const catalogPerspectiveNames = useMemo(
    () => (catalog || []).map((item) => item.name),
    [catalog],
  );

  const catalogKpisByPerspective = useMemo(() => {
    const map = new Map<string, KpiLibraryItem[]>();
    for (const kpi of allKpis || []) {
      const list = map.get(kpi.perspective) || [];
      list.push(kpi);
      map.set(kpi.perspective, list);
    }
    return map;
  }, [allKpis]);

  /** Deduped catalog KPIs for every perspective on the scorecard. */
  const uniqueCatalogKpis = useMemo(() => {
    const byName = new Map<string, KpiLibraryItem>();
    for (const name of catalogPerspectiveNames) {
      for (const kpi of catalogKpisByPerspective.get(name) || []) {
        const key = `${kpi.perspective}::${kpi.name}`;
        if (!byName.has(key)) byName.set(key, kpi);
      }
    }
    // Include orphan KPIs whose perspective isn't in catalog yet
    for (const kpi of allKpis || []) {
      if (catalogPerspectiveNames.includes(kpi.perspective)) continue;
      const key = `${kpi.perspective}::${kpi.name}`;
      if (!byName.has(key)) byName.set(key, kpi);
    }
    return Array.from(byName.values());
  }, [catalogPerspectiveNames, catalogKpisByPerspective, allKpis]);

  const selectedKpis = useMemo(
    () => uniqueCatalogKpis.filter((kpi) => selectedKpiIds.includes(kpi.id)),
    [uniqueCatalogKpis, selectedKpiIds],
  );

  const activePerspectiveNames = useMemo(
    () => [...new Set(selectedKpis.map((kpi) => kpi.perspective))],
    [selectedKpis],
  );

  useEffect(() => {
    if (!isTemporary || !selectedCadence) return;
    const stillValid = cadenceOptions.some(
      (option) => option.value === selectedCadence,
    );
    if (!stillValid) form.setFieldsValue({ cadence: undefined });
  }, [isTemporary, selectedCadence, cadenceOptions, form]);

  useEffect(() => {
    if (!setupModalOpen) return;
    setCurrent(0);
    setSelectedKpiIds([]);
    setKpiSearch('');
    setAddStepKpiId(null);
    setEmployeePickerSearch('');
    editPrefillKeyRef.current = null;
    if (editingConfig) {
      const kind = resolveSetupKind(editingConfig);
      form.setFieldsValue({
        name: editingConfig.label,
        description: editingConfig.description || '',
        setupKind: kind,
        isRecurring:
          kind === BscSetupKind.Temporary
            ? Boolean(editingConfig.isRecurring)
            : true,
        cadence: formCadence(editingConfig.cadence),
        scopeTarget: resolveScopeTarget(editingConfig),
        departmentIds: editingConfig.departmentIds,
        positionIds: editingConfig.positionIds,
        employeeIds: editingConfig.employeeIds || [],
        kpiEvaluationFlows: editingConfig.kpiEvaluationFlows || {},
        dateRange:
          kind === BscSetupKind.Temporary &&
          editingConfig.startDate &&
          editingConfig.endDate
            ? [dayjs(editingConfig.startDate), dayjs(editingConfig.endDate)]
            : undefined,
        perspectiveRows: seedPerspectiveRows(catalogPerspectiveNames),
        measureWeights: {},
        measureTargets: {},
        measureWorstCases: {},
        measureBestCases: {},
      });
    } else {
      form.resetFields();
      form.setFieldsValue({
        name: '',
        description: '',
        setupKind: undefined,
        isRecurring: undefined,
        cadence: undefined,
        dateRange: undefined,
        scopeTarget: undefined,
        departmentIds: [],
        positionIds: [],
        employeeIds: [],
        kpiEvaluationFlows: {},
        perspectiveRows: seedPerspectiveRows(catalogPerspectiveNames),
        measureWeights: {},
        measureTargets: {},
        measureWorstCases: {},
        measureBestCases: {},
      });
    }
  }, [setupModalOpen, editingConfig, form]);

  // Prefill selected KPIs / weights / targets from the existing scorecard once
  useEffect(() => {
    if (!setupModalOpen || !editingConfig || !kpisFetched) return;
    if (editPrefillKeyRef.current === editingConfig.id) return;

    const configKpis = (allKpis || []).filter(
      (kpi) => kpi.evaluationConfigId === editingConfig.id,
    );
    const byKey = new Map<string, KpiLibraryItem>();
    for (const kpi of configKpis) {
      const key = `${kpi.perspective}::${kpi.name}`;
      if (!byKey.has(key)) byKey.set(key, kpi);
    }

    const selectedIds: string[] = [];
    const measureWeights: Record<string, number> = {};
    const measureTargets: Record<string, number> = {};
    const measureWorstCases: Record<string, number> = {};
    const measureBestCases: Record<string, number> = {};

    for (const catalogKpi of uniqueCatalogKpis) {
      const existing = byKey.get(
        `${catalogKpi.perspective}::${catalogKpi.name}`,
      );
      if (!existing) continue;
      selectedIds.push(catalogKpi.id);
      if (existing.weight > 0) measureWeights[catalogKpi.id] = existing.weight;
      if (existing.defaultTarget != null) {
        measureTargets[catalogKpi.id] = existing.defaultTarget;
      }
      if (existing.worstCase != null) {
        measureWorstCases[catalogKpi.id] = existing.worstCase;
      }
      if (existing.bestCase != null) {
        measureBestCases[catalogKpi.id] = existing.bestCase;
      }
    }

    const activeNames = [
      ...new Set(
        selectedIds
          .map(
            (id) => uniqueCatalogKpis.find((kpi) => kpi.id === id)?.perspective,
          )
          .filter((name): name is string => Boolean(name)),
      ),
    ];

    const weightSource =
      editAllocations?.find((row) =>
        Object.values(row.weights || {}).some((w) => Number(w) > 0),
      ) || editAllocations?.[0];

    const perspectiveRows = activeNames.length
      ? activeNames.map((name) => ({
          name,
          weight:
            weightSource?.weights?.[name] != null
              ? Number(weightSource.weights[name])
              : seedPerspectiveRows(activeNames).find((r) => r.name === name)
                  ?.weight,
        }))
      : seedPerspectiveRows(catalogPerspectiveNames);

    editPrefillKeyRef.current = editingConfig.id;
    setSelectedKpiIds(selectedIds);

    const nextFlows: Record<string, BscEvaluatorStep[]> = {};
    for (const id of selectedIds) {
      nextFlows[id] = resolveKpiFlow(
        id,
        editingConfig.kpiEvaluationFlows,
        editingConfig.kpiEvaluators,
        editingConfig.evaluatorMode,
        editingConfig.evaluatorUserId,
      );
    }

    form.setFieldsValue({
      perspectiveRows,
      measureWeights,
      measureTargets,
      measureWorstCases,
      measureBestCases,
      kpiEvaluationFlows: nextFlows,
    });
  }, [
    setupModalOpen,
    editingConfig,
    kpisFetched,
    allKpis,
    uniqueCatalogKpis,
    editAllocations,
    catalogPerspectiveNames,
    form,
  ]);

  // Seed all catalog perspectives when catalog arrives (create flow, before weights tuned)
  useEffect(() => {
    if (!setupModalOpen || isEdit || !catalogPerspectiveNames.length) return;
    if (current >= 3) return;
    const rows: PerspectiveRow[] = form.getFieldValue('perspectiveRows') || [];
    const existingNames = rows
      .map((r) => r?.name)
      .filter((n): n is string => Boolean(n));
    if (!existingNames.length) {
      form.setFieldsValue({
        perspectiveRows: seedPerspectiveRows(catalogPerspectiveNames),
      });
    }
  }, [setupModalOpen, isEdit, catalogPerspectiveNames, form, current]);

  const handleClose = () => {
    form.resetFields();
    setSelectedKpiIds([]);
    setKpiSearch('');
    closeEmployeePicker();
    setCurrent(0);
    closeSetupModal();
  };

  const buildConfigPayload = (values: any) => {
    const kind = values.setupKind as BscSetupKind;
    const isTemp = kind === BscSetupKind.Temporary;
    const customRange = isTemp
      ? (values.dateRange as [Dayjs, Dayjs] | undefined)
      : undefined;

    const startDate = isTemp
      ? customRange![0].format('YYYY-MM-DD')
      : PERMANENT_START();
    const endDate = isTemp
      ? customRange![1].format('YYYY-MM-DD')
      : PERMANENT_END;
    const periodLabel = isTemp
      ? `${customRange![0].format('MMM D, YYYY')} – ${customRange![1].format('MMM D, YYYY')}`
      : 'Ongoing';

    const target = values.scopeTarget as BscScopeTarget;
    const departmentIds =
      target === BscScopeTarget.Department ? values.departmentIds || [] : [];
    const positionIds =
      target === BscScopeTarget.Role ? values.positionIds || [] : [];
    const employeeIds =
      target === BscScopeTarget.Individual ? values.employeeIds || [] : [];

    const departmentNames = departmentIds.map(
      (id: string) => deptOptions.find((o) => o.value === id)?.label || id,
    );
    const positionTitles = positionIds.map(
      (id: string) => positionOptions.find((o) => o.value === id)?.label || id,
    );
    const employeeNames = employeeIds.map(
      (id: string) => employeeOptions.find((o) => o.value === id)?.label || id,
    );
    const name = String(values.name || '').trim();
    const description = values.description?.trim() || null;
    const fallbackLabel = isTemp
      ? `Temporary · ${Boolean(values.isRecurring) ? values.cadence : 'One-time'} · ${periodLabel}`
      : `Permanent · ${values.cadence}`;

    const rawFlows = (values.kpiEvaluationFlows || {}) as Record<
      string,
      BscEvaluatorStep[]
    >;
    const kpiEvaluationFlowsPayload: Record<string, BscEvaluatorStep[]> = {};
    for (const id of selectedKpiIds) {
      kpiEvaluationFlowsPayload[id] = normalizeEvaluationFlow(rawFlows[id]);
    }

    const managerSteps = selectedKpiIds
      .map((id) => firstManagerLikeStep(kpiEvaluationFlowsPayload[id] || []))
      .filter((step): step is BscEvaluatorStep => Boolean(step));
    const allSameUser =
      managerSteps.length > 0 &&
      managerSteps.every(
        (step) =>
          step.kind === 'user' &&
          step.userId &&
          step.userId === managerSteps[0].userId,
      );
    const mode: BscEvaluatorMode = allSameUser ? 'user' : 'directManager';

    // Keep a thin legacy map for older consumers
    const kpiEvaluatorsPayload: Record<string, BscKpiEvaluatorAssignment> = {};
    for (const id of selectedKpiIds) {
      const step = firstManagerLikeStep(kpiEvaluationFlowsPayload[id] || []);
      if (step?.kind === 'user') {
        kpiEvaluatorsPayload[id] = { mode: 'user', userId: step.userId || null };
      } else {
        kpiEvaluatorsPayload[id] = { mode: 'directManager', userId: null };
      }
    }

    return {
      label: name || fallbackLabel,
      description,
      cadence: (isTemp && !values.isRecurring
        ? BscCadence.Custom
        : values.cadence) as BscCadence,
      setupKind: kind,
      fiscalYearId: isTemp ? 'temporary' : 'permanent',
      fiscalYearName: isTemp ? 'Temporary' : 'Permanent',
      periodIds: [] as string[],
      periodLabels: [periodLabel],
      startDate,
      endDate,
      isRecurring: isTemp ? Boolean(values.isRecurring) : true,
      useCustomDates: isTemp,
      scopeTarget: target,
      departmentIds,
      departmentNames,
      positionIds,
      positionTitles,
      employeeIds,
      employeeNames,
      evaluatorMode: mode,
      evaluatorUserId: allSameUser ? managerSteps[0].userId || null : null,
      kpiEvaluators: kpiEvaluatorsPayload,
      kpiEvaluationFlows: kpiEvaluationFlowsPayload,
    };
  };

  const validateDefineStep = async () => {
    const fields = ['name', 'setupKind'];
    const values = form.getFieldsValue(true);
    if (values.setupKind === BscSetupKind.Temporary) {
      fields.push('dateRange', 'isRecurring');
      if (values.isRecurring) fields.push('cadence');
    } else if (values.setupKind === BscSetupKind.Permanent) {
      fields.push('cadence');
    }
    await form.validateFields(fields);

    if (
      values.setupKind === BscSetupKind.Temporary &&
      values.isRecurring &&
      values.cadence
    ) {
      const allowed = cadenceOptionsForPeriod(periodDayCount(values.dateRange));
      if (!allowed.some((o) => o.value === values.cadence)) {
        form.setFields([
          {
            name: 'cadence',
            errors: ['Reporting cadence cannot exceed the scorecard period'],
          },
        ]);
        throw new Error('invalid cadence');
      }
    }
  };

  const validateScopeStep = async () => {
    const values = await form.validateFields(['scopeTarget']);
    const target = values.scopeTarget as BscScopeTarget;

    if (target === BscScopeTarget.Company) {
      return;
    }

    if (target === BscScopeTarget.Department) {
      const { departmentIds } = await form.validateFields(['departmentIds']);
      if (!(departmentIds || []).length) {
        form.setFields([
          {
            name: 'departmentIds',
            errors: ['Select at least one department'],
          },
        ]);
        throw new Error('departments required');
      }
      return;
    }

    if (target === BscScopeTarget.Role) {
      const { positionIds } = await form.validateFields(['positionIds']);
      if (!(positionIds || []).length) {
        form.setFields([
          {
            name: 'positionIds',
            errors: ['Select at least one role'],
          },
        ]);
        throw new Error('roles required');
      }
      return;
    }

    if (target === BscScopeTarget.Individual) {
      const { employeeIds } = await form.validateFields(['employeeIds']);
      if (!(employeeIds || []).length) {
        form.setFields([
          {
            name: 'employeeIds',
            errors: ['Select at least one individual'],
          },
        ]);
        throw new Error('individuals required');
      }
      return;
    }

    NotificationMessage.error({
      message:
        'Choose whether to assign by company, department, role, or individual',
    });
    throw new Error('scope target required');
  };

  const validateKpisStep = async () => {
    if (!selectedKpiIds.length) {
      NotificationMessage.error({
        message: 'Select at least one KPI under the scorecard perspectives',
      });
      throw new Error('measures required');
    }
  };

  const validateEvaluationStep = async () => {
    const values = form.getFieldsValue(true);
    const map = (values.kpiEvaluationFlows || {}) as Record<
      string,
      BscEvaluatorStep[]
    >;

    for (const kpi of selectedKpis) {
      const flow = map[kpi.id] || [];
      if (!flow.length) {
        NotificationMessage.error({
          message: `Add at least one evaluation step for “${kpi.name}”`,
        });
        throw new Error('evaluation flow required');
      }
      for (let i = 0; i < flow.length; i++) {
        const step = flow[i];
        if (step.kind === 'user' && !step.userId) {
          NotificationMessage.error({
            message: `Select the evaluating person for “${kpi.name}” (step ${i + 1})`,
          });
          throw new Error('evaluator user required');
        }
      }
    }
  };

  const seedKpiEvaluationFlows = () => {
    const current =
      (form.getFieldValue('kpiEvaluationFlows') as Record<
        string,
        BscEvaluatorStep[]
      >) || {};
    const next: Record<string, BscEvaluatorStep[]> = {};
    for (const id of selectedKpiIds) {
      next[id] = current[id]?.length
        ? normalizeEvaluationFlow(current[id])
        : defaultEvaluationFlow();
    }
    form.setFieldsValue({ kpiEvaluationFlows: next });
  };

  const updateKpiFlow = (kpiId: string, flow: BscEvaluatorStep[]) => {
    form.setFieldsValue({
      kpiEvaluationFlows: {
        ...kpiEvaluationFlows,
        [kpiId]: flow,
      },
    });
  };

  const addEvaluatorFromPicker = (step: BscEvaluatorStep) => {
    if (!addStepKpiId) return;
    const current =
      (form.getFieldValue('kpiEvaluationFlows') as Record<
        string,
        BscEvaluatorStep[]
      >) || {};
    const existing = current[addStepKpiId]?.length
      ? current[addStepKpiId]
      : defaultEvaluationFlow();
    updateKpiFlow(addStepKpiId, [...existing, step]);
    closeEmployeePicker();
  };

  const seedMeasureTargetsFromCatalog = () => {
    const currentTargets =
      (form.getFieldValue('measureTargets') as Record<
        string,
        number | null | undefined
      >) || {};
    const currentWorst =
      (form.getFieldValue('measureWorstCases') as Record<
        string,
        number | null | undefined
      >) || {};
    const currentBest =
      (form.getFieldValue('measureBestCases') as Record<
        string,
        number | null | undefined
      >) || {};

    const nextTargets = { ...currentTargets };
    const nextWorst = { ...currentWorst };
    const nextBest = { ...currentBest };

    for (const kpi of selectedKpis) {
      if (nextTargets[kpi.id] == null && kpi.defaultTarget != null) {
        nextTargets[kpi.id] = kpi.defaultTarget;
      }
      if (kpi.targetLogic === TargetLogic.Bounded) {
        if (nextWorst[kpi.id] == null && kpi.worstCase != null) {
          nextWorst[kpi.id] = kpi.worstCase;
        }
        if (nextBest[kpi.id] == null && kpi.bestCase != null) {
          nextBest[kpi.id] = kpi.bestCase;
        }
      }
    }

    form.setFieldsValue({
      measureTargets: nextTargets,
      measureWorstCases: nextWorst,
      measureBestCases: nextBest,
    });
  };

  const validateWeightsStep = async () => {
    if (!selectedKpiIds.length) {
      NotificationMessage.error({
        message: 'Select at least one KPI before assigning weights',
      });
      throw new Error('measures required');
    }

    const selected = uniqueCatalogKpis.filter((kpi) =>
      selectedKpiIds.includes(kpi.id),
    );
    const activePerspectives = [
      ...new Set(selected.map((kpi) => kpi.perspective)),
    ];

    const weights: Record<string, number> = {};
    for (const name of activePerspectives) {
      const row = perspectiveRows.find((r) => r.name === name);
      const weight = Number(row?.weight || 0);
      if (!weight) {
        NotificationMessage.error({
          message: `Set a weight for ${name}`,
        });
        throw new Error('perspective weight required');
      }
      weights[name] = weight;
    }

    const check = validatePerspectiveWeights(weights);
    if (!check.valid) {
      NotificationMessage.error({
        message: check.message || 'Perspective weights must sum to 100%',
      });
      throw new Error(check.message);
    }

    for (const kpi of selected) {
      const target = measureTargets[kpi.id];
      if (target == null || Number.isNaN(Number(target))) {
        NotificationMessage.error({
          message: `Set a target for ${kpi.name}`,
        });
        throw new Error('target required');
      }
      if (kpi.targetLogic === TargetLogic.Bounded) {
        if (
          measureWorstCases[kpi.id] == null ||
          measureBestCases[kpi.id] == null
        ) {
          NotificationMessage.error({
            message: `Set worst and best case for ${kpi.name}`,
          });
          throw new Error('bounded bounds required');
        }
      }
    }

    const rows = buildMeasureRows(weights);
    const weightCheck = validateWeights(
      rows.map((r) => Number(r.weight || 0)),
      rows.map((r) => r.perspective as string),
    );
    if (!weightCheck.valid) {
      NotificationMessage.error({
        message: weightCheck.message || 'Invalid KPI weights',
      });
      throw new Error(weightCheck.message);
    }

    for (const [perspective, allocated] of Object.entries(weights)) {
      const sum = rows
        .filter((r) => r.perspective === perspective)
        .reduce((s, r) => s + Number(r.weight || 0), 0);
      if (Math.abs(sum - allocated) > 0.01) {
        NotificationMessage.error({
          message: `${perspective} KPIs must total ${allocated}% (currently ${sum}%)`,
        });
        throw new Error('perspective measure mismatch');
      }
    }
  };

  const buildMeasureRows = (
    perspectiveWeightMap?: Record<string, number>,
  ): MeasureRow[] => {
    const weightMap: Record<string, number> = perspectiveWeightMap || {};
    if (!perspectiveWeightMap) {
      for (const row of perspectiveRows) {
        if (!row?.name) continue;
        weightMap[row.name] = Number(row.weight || 0);
      }
    }

    const selected = uniqueCatalogKpis.filter((kpi) =>
      selectedKpiIds.includes(kpi.id),
    );
    const byPerspective = new Map<string, KpiLibraryItem[]>();
    for (const kpi of selected) {
      const list = byPerspective.get(kpi.perspective) || [];
      list.push(kpi);
      byPerspective.set(kpi.perspective, list);
    }

    const rows: MeasureRow[] = [];
    for (const [perspective, kpis] of byPerspective) {
      const allocated = weightMap[perspective] || 0;
      const manualSum = kpis.reduce(
        (sum, kpi) => sum + Number(measureWeights[kpi.id] || 0),
        0,
      );
      kpis.forEach((kpi, index) => {
        let weight = Number(measureWeights[kpi.id]);
        if (!weight || weight <= 0) {
          if (manualSum > 0) {
            weight = 0;
          } else {
            const base = Math.floor((allocated / kpis.length) * 100) / 100;
            weight =
              index === kpis.length - 1
                ? Math.round((allocated - base * (kpis.length - 1)) * 100) / 100
                : base;
          }
        }
        rows.push({
          kpiId: kpi.id,
          name: kpi.name,
          perspective,
          weight,
          description: kpi.description,
          targetLogic: kpi.targetLogic,
          measurementUnit: kpi.measurementUnit,
          defaultTarget: kpi.defaultTarget,
          targetValue:
            measureTargets[kpi.id] != null
              ? Number(measureTargets[kpi.id])
              : (kpi.defaultTarget ?? null),
          worstCase:
            measureWorstCases[kpi.id] != null
              ? Number(measureWorstCases[kpi.id])
              : (kpi.worstCase ?? null),
          bestCase:
            measureBestCases[kpi.id] != null
              ? Number(measureBestCases[kpi.id])
              : (kpi.bestCase ?? null),
        });
      });
    }
    return rows;
  };

  const handleNext = async () => {
    try {
      if (current === 0) await validateDefineStep();
      if (current === 1) await validateScopeStep();
      if (current === 2) {
        await validateKpisStep();
        const existingRows: PerspectiveRow[] =
          form.getFieldValue('perspectiveRows') || [];
        const seeded = seedPerspectiveRows(activePerspectiveNames);
        form.setFieldsValue({
          perspectiveRows: seeded.map((row) => {
            const prev = existingRows.find((r) => r?.name === row.name);
            return prev?.weight != null ? { ...row, weight: prev.weight } : row;
          }),
        });
        // Prefill targets from catalog defaults; user may overwrite on Weights
        seedMeasureTargetsFromCatalog();
      }
      if (current === 3) {
        await validateWeightsStep();
        seedKpiEvaluationFlows();
      }
      if (current === 4) {
        await validateEvaluationStep();
        if (isEdit) await handleUpdateWithCascade();
        else await handleCreateWithCascade();
        return;
      }
      setCurrent((step) => Math.min(step + 1, lastStep));
    } catch {
      // validation messages already shown
    }
  };

  const handleBack = () => setCurrent((step) => Math.max(step - 1, 0));

  const cascadeKpisToScope = async (
    configId: string,
    values: any,
    measureRows: MeasureRow[],
    options?: { createIndividuals?: boolean },
  ) => {
    const perspectiveWeights: Record<string, number> = {};
    for (const row of measureRows) {
      if (!row.perspective) continue;
      if (perspectiveWeights[row.perspective] != null) continue;
      const match = (values.perspectiveRows || []).find(
        (r: PerspectiveRow) => r?.name === row.perspective,
      );
      perspectiveWeights[row.perspective] = Number(match?.weight || 0);
    }

    const kpiRowsBase = measureRows.map((row) => ({
      name: row.name!,
      description: row.description || null,
      weight: Number(row.weight),
      perspective: row.perspective,
      targetLogic: row.targetLogic,
      measurementUnit: row.measurementUnit,
      defaultTarget: row.targetValue ?? null,
      worstCase: row.worstCase ?? null,
      bestCase: row.bestCase ?? null,
    }));

    const cascadeTargets = async (target: {
      positionId: string | null;
      positionTitle: string;
      departmentName: string | null;
    }) => {
      await savePerspectives.mutateAsync({
        evaluationConfigId: configId,
        positionId: target.positionId,
        positionTitle: target.positionTitle,
        departmentName: target.departmentName,
        weights: perspectiveWeights,
      });
      const existingForRole = (allKpis || []).filter(
        (kpi) =>
          kpi.evaluationConfigId === configId &&
          (kpi.positionTitle || '') === target.positionTitle,
      );
      await saveRoleKpis.mutateAsync({
        evaluationConfigId: configId,
        positionId: target.positionId,
        positionTitle: target.positionTitle,
        departmentName: target.departmentName,
        existingIds: existingForRole.map((kpi) => kpi.id),
        rows: kpiRowsBase.map((row) => {
          const match = existingForRole.find(
            (kpi) =>
              kpi.name === row.name && kpi.perspective === row.perspective,
          );
          return match ? { ...row, id: match.id } : row;
        }),
      });
    };

    const roles = (values.positionIds || []).map((id: string) => {
      const option = positionOptions.find((p) => p.value === id);
      return {
        positionId: id as string,
        positionTitle: option?.label || id,
        departmentName: option?.departmentName || null,
      };
    });

    for (const role of roles) {
      await cascadeTargets(role);
    }

    const target = values.scopeTarget as BscScopeTarget;
    if (!roles.length) {
      if (target === BscScopeTarget.Company) {
        await cascadeTargets({
          positionId: null,
          positionTitle: 'Company',
          departmentName: null,
        });
      } else {
        const departmentIds: string[] = values.departmentIds || [];
        for (let i = 0; i < departmentIds.length; i++) {
          const option = deptOptions.find((d) => d.value === departmentIds[i]);
          const departmentName = option?.label || departmentIds[i];
          await cascadeTargets({
            positionId: null,
            positionTitle: departmentName,
            departmentName,
          });
        }
      }
    }

    const resolveManagerId = (employeeId: string) => {
      const map = (values.kpiEvaluationFlows || {}) as Record<
        string,
        BscEvaluatorStep[]
      >;
      const managerSteps = selectedKpiIds
        .map((id) => firstManagerLikeStep(map[id] || []))
        .filter((step): step is BscEvaluatorStep => Boolean(step));
      const allSameUser =
        managerSteps.length > 0 &&
        managerSteps.every(
          (step) =>
            step.kind === 'user' &&
            step.userId &&
            step.userId === managerSteps[0].userId,
        );
      if (allSameUser) return String(managerSteps[0].userId);
      const option = employeeOptions.find((e) => e.value === employeeId);
      return option?.managerId || actorUserId || 'system';
    };

    const employeeIds: string[] =
      target === BscScopeTarget.Company
        ? employeeOptions.map((e) => e.value)
        : values.employeeIds || [];
    if (options?.createIndividuals !== false) {
      const flowMap = (values.kpiEvaluationFlows || {}) as Record<
        string,
        BscEvaluatorStep[]
      >;
      for (const employeeId of employeeIds) {
        const option = employeeOptions.find((e) => e.value === employeeId);
        await createScorecard.mutateAsync({
          userId: employeeId,
          userName: option?.label || employeeId,
          managerId: resolveManagerId(employeeId),
          departmentId: option?.departmentId || null,
          positionId: option?.positionId || null,
          cycleId: configId,
          targets: measureRows.map((row) => {
            const flow = normalizeEvaluationFlow(flowMap[row.kpiId!]);
            const managerStep = firstManagerLikeStep(flow);
            return {
              kpiLibraryId: row.kpiId!,
              weightPercentage: Number(row.weight),
              targetValue: Number(row.targetValue),
              worstCase: row.worstCase ?? undefined,
              bestCase: row.bestCase ?? undefined,
              evaluationFlow: flow,
              evaluatorMode:
                managerStep?.kind === 'user' ? 'user' : 'directManager',
              evaluatorUserId:
                managerStep?.kind === 'user' ? managerStep.userId || null : null,
            };
          }),
        });
      }
    }
  };

  const handleUpdateWithCascade = async () => {
    if (!editingConfig) return;
    const values = form.getFieldsValue(true);
    const payload = buildConfigPayload(values);
    const measureRows = buildMeasureRows();

    setSavingAll(true);
    try {
      await updateConfig.mutateAsync({ id: editingConfig.id, input: payload });
      setSelectedConfigId(editingConfig.id);
      await cascadeKpisToScope(editingConfig.id, values, measureRows, {
        createIndividuals: false,
      });
      handleClose();
    } finally {
      setSavingAll(false);
    }
  };

  const handleCreateWithCascade = async () => {
    const values = form.getFieldsValue(true);
    const payload = buildConfigPayload(values);
    const measureRows = buildMeasureRows();

    setSavingAll(true);
    try {
      const created = await createConfig.mutateAsync(payload);
      setSelectedConfigId(created.id);
      await cascadeKpisToScope(
        created.id,
        {
          ...values,
          departmentIds: created.departmentIds?.length
            ? created.departmentIds
            : values.departmentIds,
        },
        measureRows,
      );
      handleClose();
    } finally {
      setSavingAll(false);
    }
  };

  const saving =
    savingAll ||
    createConfig.isLoading ||
    updateConfig.isLoading ||
    savePerspectives.isLoading ||
    saveRoleKpis.isLoading ||
    createScorecard.isLoading;

  return (
    <Modal
      open={setupModalOpen}
      onCancel={handleClose}
      footer={null}
      centered
      width={860}
      closeIcon={<CloseOutlined />}
      title={
        <div data-cy="-okrplanning-okr-settings-bsc-setup-bscsetupmodal-div-1">
          <h2
            className="m-0 text-xl font-bold text-black"
            data-cy="-okrplanning-okr-settings-bsc-setup-bscsetupmodal-h2-2"
          >
            {isEdit ? 'Edit Scorecard' : 'Add Scorecard'}
          </h2>
          <p
            className="m-0 mt-1 text-sm font-normal text-[#595959]"
            data-cy="-okrplanning-okr-settings-bsc-setup-bscsetupmodal-p-3"
          >
            {isEdit
              ? 'Update definition, scope, KPIs, weights, and evaluation.'
              : 'Define the scorecard, set scope, select KPIs, then assign weights and evaluation.'}
          </p>
        </div>
      }
      destroyOnClose
      data-cy="bsc-setup-modal"
    >
      <div
        className="mb-4 mt-2 hidden sm:block"
        data-cy="-okrplanning-okr-settings-bsc-setup-bscsetupmodal-div-4"
      >
        <Steps
          current={current}
          progressDot
          labelPlacement="vertical"
          className="px-2"
          items={stepItems}
          data-cy="bsc-scorecard-steps"
        />
      </div>

      <Form form={form} layout="vertical" className="mt-2" requiredMark={false}>
        {current === 0 && (
          <>
            <Form.Item
              name="name"
              label="Scorecard name"
              rules={[
                {
                  required: true,
                  whitespace: true,
                  message: 'Scorecard name is required',
                },
              ]}
            >
              <Input
                placeholder="e.g. HR Scorecard"
                className="h-10"
                data-cy="bsc-scorecard-name"
              />
            </Form.Item>

            <Form.Item name="description" label="Purpose">
              <TextArea
                rows={2}
                placeholder="e.g. Cascade non-financial HR outcomes"
                data-cy="bsc-scorecard-description"
              />
            </Form.Item>

            <Form.Item
              name="setupKind"
              label="Horizon"
              rules={[
                {
                  required: true,
                  message: 'Select permanent or temporary horizon',
                },
              ]}
            >
              <Radio.Group
                className="flex flex-col gap-2 sm:flex-row sm:gap-6"
                data-cy="bsc-setup-kind"
                onChange={() => {
                  form.setFieldsValue({
                    isRecurring: undefined,
                    cadence: undefined,
                    dateRange: undefined,
                  });
                }}
              >
                <Radio
                  value={BscSetupKind.Permanent}
                  data-cy="bsc-setup-permanent"
                >
                  Permanent
                </Radio>
                <Radio
                  value={BscSetupKind.Temporary}
                  data-cy="bsc-setup-temporary"
                >
                  Temporary
                </Radio>
              </Radio.Group>
            </Form.Item>

            {isTemporary ? (
              <>
                <Form.Item
                  name="dateRange"
                  label="Scorecard period"
                  rules={[
                    {
                      required: true,
                      message: 'Select when this scorecard is active',
                    },
                  ]}
                >
                  <RangePicker
                    className="w-full"
                    format="YYYY-MM-DD"
                    data-cy="bsc-setup-date-range"
                    onChange={() => {
                      form.setFieldsValue({ cadence: undefined });
                    }}
                  />
                </Form.Item>

                <Form.Item
                  name="isRecurring"
                  label="Reporting schedule"
                  rules={[
                    {
                      required: true,
                      message: 'Choose whether reporting is recurring',
                    },
                  ]}
                >
                  <Radio.Group
                    className="flex flex-col gap-2 sm:flex-row sm:gap-6"
                    data-cy="bsc-setup-temporary-recurring"
                    onChange={() => {
                      form.setFieldsValue({ cadence: undefined });
                    }}
                  >
                    <Radio value={true}>Recurring</Radio>
                    <Radio value={false}>One-time</Radio>
                  </Radio.Group>
                </Form.Item>
              </>
            ) : null}

            {showCadence ? (
              <Form.Item
                name="cadence"
                label="Reporting cadence"
                rules={[
                  { required: true, message: 'Select reporting cadence' },
                ]}
                extra={
                  isTemporary && temporaryDayCount > 0
                    ? `Only cadences that fit the ${temporaryDayCount}-day period are shown.`
                    : undefined
                }
              >
                <Select
                  placeholder="Select cadence"
                  options={cadenceOptions.map(({ value, label }) => ({
                    value,
                    label,
                  }))}
                  disabled={isTemporary && cadenceOptions.length === 0}
                  data-cy="bsc-setup-cadence"
                />
              </Form.Item>
            ) : null}
          </>
        )}

        {current === 1 && (
          <>
            <p
              className="mb-1 text-[13px] font-semibold text-[#262626]"
              data-cy="-okrplanning-okr-settings-bsc-setup-bscsetupmodal-p-5"
            >
              Organizational scope
            </p>
            <p
              className="mb-4 text-[12px] text-[#8F94A3]"
              data-cy="-okrplanning-okr-settings-bsc-setup-bscsetupmodal-p-6"
            >
              Choose how this scorecard is assigned, then select the matching
              targets.
            </p>

            <Form.Item
              name="scopeTarget"
              label="Assign to"
              rules={[
                {
                  required: true,
                  message:
                    'Select company, department, role, or individual',
                },
              ]}
            >
              <Radio.Group
                className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-6"
                data-cy="bsc-scorecard-scope-target"
                onChange={() => {
                  form.setFieldsValue({
                    departmentIds: [],
                    positionIds: [],
                    employeeIds: [],
                  });
                }}
              >
                <Radio
                  value={BscScopeTarget.Company}
                  data-cy="bsc-scope-company"
                >
                  Company
                </Radio>
                <Radio
                  value={BscScopeTarget.Department}
                  data-cy="bsc-scope-department"
                >
                  Department
                </Radio>
                <Radio value={BscScopeTarget.Role} data-cy="bsc-scope-role">
                  Role
                </Radio>
                <Radio
                  value={BscScopeTarget.Individual}
                  data-cy="bsc-scope-individual"
                >
                  Individual
                </Radio>
              </Radio.Group>
            </Form.Item>

            {scopeTarget === BscScopeTarget.Company ? (
              <p
                className="mb-0 text-[12px] text-[#8F94A3]"
                data-cy="bsc-scope-company-hint"
              >
                Applies the scorecard template organization-wide.
              </p>
            ) : null}

            {scopeTarget === BscScopeTarget.Department ? (
              <Form.Item
                name="departmentIds"
                label="Departments"
                extra="Cascades the scorecard template to the selected departments."
                rules={[
                  { required: true, message: 'Select at least one department' },
                ]}
              >
                <Select
                  mode="multiple"
                  allowClear
                  showSearch
                  placeholder="Select departments"
                  options={deptOptions}
                  optionFilterProp="label"
                  data-cy="bsc-scorecard-departments"
                />
              </Form.Item>
            ) : null}

            {scopeTarget === BscScopeTarget.Role ? (
              <Form.Item
                name="positionIds"
                label="Roles"
                extra="Cascades perspectives and KPIs to the selected roles."
                rules={[
                  { required: true, message: 'Select at least one role' },
                ]}
              >
                <Select
                  mode="multiple"
                  allowClear
                  showSearch
                  placeholder="Select roles"
                  options={positionOptions}
                  optionFilterProp="label"
                  data-cy="bsc-scorecard-roles"
                />
              </Form.Item>
            ) : null}

            {scopeTarget === BscScopeTarget.Individual ? (
              <Form.Item
                name="employeeIds"
                label="Individuals"
                extra="Creates an employee scorecard for each selected person."
                rules={[
                  {
                    required: true,
                    message: 'Select at least one individual',
                  },
                ]}
              >
                <Select
                  mode="multiple"
                  allowClear
                  showSearch
                  placeholder="Select employees"
                  options={employeeOptions}
                  optionFilterProp="label"
                  data-cy="bsc-scorecard-individuals"
                />
              </Form.Item>
            ) : null}
          </>
        )}

        {current === 2 && (
          <>
            <p
              className="mb-1 text-[13px] font-semibold text-[#262626]"
              data-cy="-okrplanning-okr-settings-bsc-setup-bscsetupmodal-p-7"
            >
              KPIs
            </p>
            <p
              className="mb-3 text-[12px] text-[#8F94A3]"
              data-cy="-okrplanning-okr-settings-bsc-setup-bscsetupmodal-p-8"
            >
              Select the KPIs to include on this scorecard. Weights are assigned
              in the next step.
            </p>

            {!uniqueCatalogKpis.length ? (
              <p
                className="text-[13px] text-[#94A3B8]"
                data-cy="-okrplanning-okr-settings-bsc-setup-bscsetupmodal-p-9"
              >
                No catalog KPIs yet. Add them on the KPIs tab first.
              </p>
            ) : (
              <>
                <div
                  className="mb-3 flex flex-wrap items-center justify-between gap-2"
                  data-cy="bsc-scorecard-kpi-toolbar"
                >
                  <BscSearchInput
                    value={kpiSearch}
                    onChange={setKpiSearch}
                    placeholder="Search KPIs"
                    data-cy="bsc-scorecard-kpi-search"
                  />
                  <span
                    className="text-[12px] text-[#8F94A3]"
                    data-cy="bsc-scorecard-kpi-selected-count"
                  >
                    {selectedKpiIds.length} KPI
                    {selectedKpiIds.length === 1 ? '' : 's'} selected
                  </span>
                </div>
                <div
                  className="flex max-h-[440px] flex-col gap-1 overflow-y-auto rounded-xl border border-[#E5E7EB] bg-white p-2"
                  data-cy="bsc-scorecard-kpi-list"
                >
                  {uniqueCatalogKpis
                    .filter((kpi) => {
                      const q = kpiSearch.trim().toLowerCase();
                      if (!q) return true;
                      return (
                        kpi.name.toLowerCase().includes(q) ||
                        (kpi.perspective || '').toLowerCase().includes(q)
                      );
                    })
                    .map((kpi) => {
                      const checked = selectedKpiIds.includes(kpi.id);
                      return (
                        <label
                          key={kpi.id}
                          className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2 hover:bg-[#F9FAFB]"
                          data-cy={`bsc-scorecard-kpi-row-${kpi.id}`}
                        >
                          <Checkbox
                            checked={checked}
                            onChange={(e) => {
                              setSelectedKpiIds((prev) =>
                                e.target.checked
                                  ? [...prev, kpi.id]
                                  : prev.filter((id) => id !== kpi.id),
                              );
                            }}
                          />
                          <span
                            className="min-w-0 flex-1 text-[13px] font-medium text-[#262626]"
                            data-cy="-okrplanning-okr-settings-bsc-setup-bscsetupmodal-span-15"
                          >
                            {kpi.name}
                          </span>
                          {kpi.perspective ? (
                            <Tag className="m-0 h-5 shrink-0 rounded border border-[#91caff] bg-[#e6f4ff] px-1.5 text-[11px] font-normal leading-5 text-[#1677ff]">
                              {kpi.perspective}
                            </Tag>
                          ) : null}
                          {kpi.measurementUnit ? (
                            <span
                              className="shrink-0 text-[11px] text-[#8F94A3]"
                              data-cy="-okrplanning-okr-settings-bsc-setup-bscsetupmodal-span-16"
                            >
                              {kpi.measurementUnit}
                            </span>
                          ) : null}
                        </label>
                      );
                    })}
                </div>
              </>
            )}
          </>
        )}

        {current === 3 && (
          <>
            <p
              className="mb-1 text-[13px] font-semibold text-[#262626]"
              data-cy="-okrplanning-okr-settings-bsc-setup-bscsetupmodal-p-17"
            >
              Weights & targets
            </p>
            <p
              className="mb-4 text-[12px] text-[#8F94A3]"
              data-cy="-okrplanning-okr-settings-bsc-setup-bscsetupmodal-p-18"
            >
              Set perspective weights (sum 100%). Targets are prefilled from the
              KPI catalog when available — overwrite if this scorecard needs a
              different number. Leave KPI weights blank to auto-split.
            </p>

            <Form.Item name="perspectiveRows" hidden>
              <Input />
            </Form.Item>
            <Form.Item name="measureWeights" hidden>
              <Input />
            </Form.Item>
            <Form.Item name="measureTargets" hidden>
              <Input />
            </Form.Item>
            <Form.Item name="measureWorstCases" hidden>
              <Input />
            </Form.Item>
            <Form.Item name="measureBestCases" hidden>
              <Input />
            </Form.Item>

            {!activePerspectiveNames.length ? (
              <p
                className="text-[13px] text-[#94A3B8]"
                data-cy="-okrplanning-okr-settings-bsc-setup-bscsetupmodal-p-19"
              >
                No KPIs selected. Go back and select KPIs first.
              </p>
            ) : (
              <div
                className="flex max-h-[440px] flex-col gap-4 overflow-y-auto pr-1"
                data-cy="-okrplanning-okr-settings-bsc-setup-bscsetupmodal-div-20"
              >
                {activePerspectiveNames.map((perspective) => {
                  const kpis = selectedKpis.filter(
                    (kpi) => kpi.perspective === perspective,
                  );
                  const rowIndex = perspectiveRows.findIndex(
                    (r) => r.name === perspective,
                  );
                  const allocated =
                    (rowIndex >= 0
                      ? perspectiveRows[rowIndex]?.weight
                      : undefined) || 0;

                  return (
                    <div
                      key={perspective}
                      className="rounded-xl border border-[#E5E7EB] p-4"
                      data-cy={`bsc-scorecard-weight-perspective-${perspective}`}
                    >
                      <div
                        className="mb-3 flex flex-wrap items-center justify-between gap-3"
                        data-cy="-okrplanning-okr-settings-bsc-setup-bscsetupmodal-div-21"
                      >
                        <p
                          className="m-0 text-[14px] font-semibold text-[#262626]"
                          data-cy="-okrplanning-okr-settings-bsc-setup-bscsetupmodal-p-22"
                        >
                          {perspective}
                          <span
                            className="ml-2 text-[11px] font-normal text-[#8F94A3]"
                            data-cy="-okrplanning-okr-settings-bsc-setup-bscsetupmodal-span-23"
                          >
                            {kpis.length} KPI{kpis.length === 1 ? '' : 's'}
                          </span>
                        </p>
                        <div
                          className="flex items-center gap-2"
                          data-cy="-okrplanning-okr-settings-bsc-setup-bscsetupmodal-div-24"
                        >
                          <span
                            className="text-[12px] text-[#595959]"
                            data-cy="-okrplanning-okr-settings-bsc-setup-bscsetupmodal-span-25"
                          >
                            Weight %
                          </span>
                          <InputNumber
                            className="w-24"
                            min={1}
                            max={100}
                            value={allocated || undefined}
                            onChange={(value) => {
                              const next = [...perspectiveRows];
                              if (rowIndex >= 0) {
                                next[rowIndex] = {
                                  ...next[rowIndex],
                                  name: perspective,
                                  weight: value,
                                };
                              } else {
                                next.push({
                                  name: perspective,
                                  weight: value,
                                });
                              }
                              form.setFieldsValue({
                                perspectiveRows: next,
                              });
                            }}
                            data-cy={`bsc-scorecard-perspective-weight-${perspective}`}
                          />
                        </div>
                      </div>

                      <div
                        className="flex flex-col gap-3"
                        data-cy="-okrplanning-okr-settings-bsc-setup-bscsetupmodal-div-26"
                      >
                        {kpis.map((kpi) => {
                          const isBounded =
                            kpi.targetLogic === TargetLogic.Bounded;
                          return (
                            <div
                              key={kpi.id}
                              className="rounded-lg bg-[#F9FAFB] px-3 py-3"
                              data-cy="-okrplanning-okr-settings-bsc-setup-bscsetupmodal-div-27"
                            >
                              <div
                                className="mb-2 flex flex-wrap items-start justify-between gap-2"
                                data-cy="-okrplanning-okr-settings-bsc-setup-bscsetupmodal-div-28"
                              >
                                <div data-cy="-okrplanning-okr-settings-bsc-setup-bscsetupmodal-div-29">
                                  <p
                                    className="m-0 text-[13px] font-medium text-[#262626]"
                                    data-cy="-okrplanning-okr-settings-bsc-setup-bscsetupmodal-p-30"
                                  >
                                    {kpi.name}
                                  </p>
                                  <p
                                    className="m-0 text-[11px] text-[#8F94A3]"
                                    data-cy="-okrplanning-okr-settings-bsc-setup-bscsetupmodal-p-31"
                                  >
                                    {kpi.measurementUnit} ·{' '}
                                    {targetLogicLabel(kpi.targetLogic)}
                                    {kpi.defaultTarget != null
                                      ? ` · catalog default ${kpi.defaultTarget}`
                                      : ''}
                                  </p>
                                </div>
                                <div
                                  className="flex items-center gap-2"
                                  data-cy="-okrplanning-okr-settings-bsc-setup-bscsetupmodal-div-32"
                                >
                                  <span
                                    className="text-[11px] text-[#595959]"
                                    data-cy="-okrplanning-okr-settings-bsc-setup-bscsetupmodal-span-33"
                                  >
                                    Weight %
                                  </span>
                                  <InputNumber
                                    className="w-20"
                                    min={1}
                                    max={100}
                                    placeholder="Auto"
                                    value={measureWeights[kpi.id] ?? undefined}
                                    onChange={(value) => {
                                      form.setFieldsValue({
                                        measureWeights: {
                                          ...measureWeights,
                                          [kpi.id]: value,
                                        },
                                      });
                                    }}
                                    data-cy={`bsc-scorecard-kpi-weight-${kpi.id}`}
                                  />
                                </div>
                              </div>
                              <div
                                className="flex flex-wrap gap-3"
                                data-cy="-okrplanning-okr-settings-bsc-setup-bscsetupmodal-div-34"
                              >
                                <div
                                  className="flex items-center gap-2"
                                  data-cy="-okrplanning-okr-settings-bsc-setup-bscsetupmodal-div-35"
                                >
                                  <span
                                    className="text-[11px] text-[#595959]"
                                    data-cy="-okrplanning-okr-settings-bsc-setup-bscsetupmodal-span-36"
                                  >
                                    Target
                                  </span>
                                  <InputNumber
                                    className="w-28"
                                    placeholder={
                                      kpi.defaultTarget != null
                                        ? String(kpi.defaultTarget)
                                        : 'Enter target'
                                    }
                                    value={measureTargets[kpi.id] ?? undefined}
                                    onChange={(value) => {
                                      form.setFieldsValue({
                                        measureTargets: {
                                          ...measureTargets,
                                          [kpi.id]: value,
                                        },
                                      });
                                    }}
                                    data-cy={`bsc-scorecard-kpi-target-${kpi.id}`}
                                  />
                                </div>
                                {isBounded ? (
                                  <>
                                    <div
                                      className="flex items-center gap-2"
                                      data-cy="-okrplanning-okr-settings-bsc-setup-bscsetupmodal-div-37"
                                    >
                                      <span
                                        className="text-[11px] text-[#595959]"
                                        data-cy="-okrplanning-okr-settings-bsc-setup-bscsetupmodal-span-38"
                                      >
                                        Worst
                                      </span>
                                      <InputNumber
                                        className="w-24"
                                        value={
                                          measureWorstCases[kpi.id] ?? undefined
                                        }
                                        onChange={(value) => {
                                          form.setFieldsValue({
                                            measureWorstCases: {
                                              ...measureWorstCases,
                                              [kpi.id]: value,
                                            },
                                          });
                                        }}
                                        data-cy={`bsc-scorecard-kpi-worst-${kpi.id}`}
                                      />
                                    </div>
                                    <div
                                      className="flex items-center gap-2"
                                      data-cy="-okrplanning-okr-settings-bsc-setup-bscsetupmodal-div-39"
                                    >
                                      <span
                                        className="text-[11px] text-[#595959]"
                                        data-cy="-okrplanning-okr-settings-bsc-setup-bscsetupmodal-span-40"
                                      >
                                        Best
                                      </span>
                                      <InputNumber
                                        className="w-24"
                                        value={
                                          measureBestCases[kpi.id] ?? undefined
                                        }
                                        onChange={(value) => {
                                          form.setFieldsValue({
                                            measureBestCases: {
                                              ...measureBestCases,
                                              [kpi.id]: value,
                                            },
                                          });
                                        }}
                                        data-cy={`bsc-scorecard-kpi-best-${kpi.id}`}
                                      />
                                    </div>
                                  </>
                                ) : null}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {current === 4 && (
          <>
            <p
              className="mb-1 text-[13px] font-semibold text-[#262626]"
              data-cy="bsc-scorecard-evaluation-title"
            >
              Evaluation
            </p>
            <p
              className="mb-4 text-[12px] text-[#8F94A3]"
              data-cy="bsc-scorecard-evaluation-desc"
            >
              Define who evaluates each selected KPI, in order. Any combination
              of self, direct manager, and specific people is allowed.
            </p>

            <Form.Item name="kpiEvaluationFlows" hidden>
              <Input />
            </Form.Item>

            {!selectedKpis.length ? (
              <p
                className="text-[13px] text-[#94A3B8]"
                data-cy="bsc-scorecard-evaluation-empty"
              >
                No KPIs selected. Go back and select KPIs first.
              </p>
            ) : (
              <div
                className="flex max-h-[440px] flex-col gap-2 overflow-y-auto pr-1"
                data-cy="bsc-scorecard-evaluation-list"
              >
                {selectedKpis.map((kpi) => {
                  const flow = kpiEvaluationFlows[kpi.id]?.length
                    ? kpiEvaluationFlows[kpi.id]
                    : defaultEvaluationFlow();

                  return (
                    <div
                      key={kpi.id}
                      className="rounded-xl border border-[#E5E7EB] px-3 py-3"
                      data-cy={`bsc-scorecard-evaluation-row-${kpi.id}`}
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

                      <div
                        className="w-full overflow-x-auto"
                        data-cy={`bsc-eval-flow-${kpi.id}`}
                      >
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
                                        flow.filter((_, i) => i !== index),
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
                                      data-cy={`bsc-eval-step-remove-${kpi.id}-${index}`}
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
                                      data-cy={`bsc-eval-step-${kpi.id}-${index}`}
                                      onKeyDown={(e) => {
                                        if (
                                          e.key === 'Enter' ||
                                          e.key === ' '
                                        ) {
                                          e.currentTarget.click();
                                        }
                                      }}
                                    >
                                      {truncateName(displayName)}
                                    </div>
                                  </Popover>
                                </div>
                              </React.Fragment>
                            );
                          })}

                          <div
                            className="inline-flex h-5 min-w-6 shrink-0 items-center justify-center rounded-full border border-[#E3E7FF] bg-[#F7F8FF] px-1 text-[11px] font-semibold text-[#5B67D9]"
                            data-cy={`bsc-eval-connector-add-${kpi.id}`}
                          >
                            →
                          </div>
                          <Popover
                            trigger="click"
                            open={addStepKpiId === kpi.id}
                            onOpenChange={(open) => {
                              if (open) {
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
                            overlayClassName="bsc-eval-employee-picker-dropdown"
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
                                  data-cy="bsc-eval-employee-picker-close"
                                >
                                  <CloseOutlined />
                                </button>
                              </div>
                            }
                            content={
                              <div data-cy="bsc-eval-employee-picker-dropdown">
                                <div className="mb-2 w-full [&_.ant-input-affix-wrapper]:!w-full [&_input]:!w-full">
                                  <BscSearchInput
                                    value={employeePickerSearch}
                                    onChange={setEmployeePickerSearch}
                                    placeholder="Search employees"
                                    className="!w-full !max-w-none"
                                    data-cy="bsc-eval-employee-picker-search"
                                  />
                                </div>
                                <div
                                  className="flex max-h-[280px] flex-col gap-0.5 overflow-y-auto"
                                  data-cy="bsc-eval-employee-picker-list"
                                >
                                  <button
                                    type="button"
                                    className="flex w-full items-center gap-3 rounded-lg border-0 bg-transparent px-2 py-2 text-left hover:bg-[#F5F5F5]"
                                    onClick={() =>
                                      addEvaluatorFromPicker({ kind: 'self' })
                                    }
                                    data-cy="bsc-eval-picker-self"
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
                                    data-cy="bsc-eval-picker-manager"
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
                                  <div className="my-1 border-t border-[#F0F0F0]" />
                                  {!filteredPickerEmployees.length ? (
                                    <p className="m-0 px-2 py-4 text-center text-[13px] text-[#8F94A3]">
                                      No employees match your search.
                                    </p>
                                  ) : (
                                    filteredPickerEmployees.map((option) => (
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
                                        data-cy={`bsc-eval-picker-user-${option.value}`}
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
                                    ))
                                  )}
                                </div>
                              </div>
                            }
                          >
                            <button
                              type="button"
                              className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-0 bg-transparent text-[#8F94A3] transition-opacity hover:opacity-70"
                              title="Add evaluator"
                              data-cy={`bsc-eval-add-step-${kpi.id}`}
                            >
                              <PlusOutlined />
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
          className="mt-6 flex justify-between gap-3"
          data-cy="-okrplanning-okr-settings-bsc-setup-bscsetupmodal-div-41"
        >
          <CustomButton
            type="default"
            title={current === 0 ? 'Cancel' : 'Back'}
            onClick={current === 0 ? handleClose : handleBack}
            className="h-10 px-6 rounded-lg"
          />
          <CustomButton
            type="primary"
            title={
              current === lastStep
                ? isEdit
                  ? 'Save changes'
                  : 'Create scorecard'
                : 'Continue'
            }
            onClick={handleNext}
            loading={saving}
            className="h-10 px-8 rounded-lg bg-[#2b54ad] hover:bg-[#3d66c2]"
            data-cy="bsc-scorecard-step-continue"
          />
        </div>
      </Form>
    </Modal>
  );
}
