'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Checkbox,
  Collapse,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Modal,
  Radio,
  Select,
  Steps,
} from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';
import CustomButton from '@/components/common/buttons/customButton';
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
  departmentIds?: string[];
  positionIds?: string[];
  employeeIds?: string[];
}): BscScopeTarget {
  if (config.employeeIds?.length) return BscScopeTarget.Individual;
  if (config.positionIds?.length) return BscScopeTarget.Role;
  return BscScopeTarget.Department;
}

const STEPS = [
  { title: 'Define' },
  { title: 'Scope' },
  { title: 'KPIs' },
  { title: 'Weights' },
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
 * 2) Set organizational scope (department, role, or individual)
 * 3) Select KPIs from all perspectives under the scorecard
 * 4) Assign perspective / KPI weights and cycle targets
 */
export default function BscSetupModal() {
  const [form] = Form.useForm();
  const [current, setCurrent] = useState(0);
  const [savingAll, setSavingAll] = useState(false);
  const [selectedKpiIds, setSelectedKpiIds] = useState<string[]>([]);
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
  const employeeOptions = asList(
    allUsersData?.items || allUsersData || [],
  ).map((user: any) => ({
    value: String(user.id),
    label:
      `${user.firstName || ''} ${user.middleName || ''} ${user.lastName || ''}`
        .replace(/\s+/g, ' ')
        .trim() || user.email || 'Employee',
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
  }));

  const setupKind = Form.useWatch('setupKind', form) as BscSetupKind | undefined;
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

  const scorecardPerspectiveNames = useMemo(
    () => catalogPerspectiveNames,
    [catalogPerspectiveNames],
  );

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
            (id) =>
              uniqueCatalogKpis.find((kpi) => kpi.id === id)?.perspective,
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
    form.setFieldsValue({
      perspectiveRows,
      measureWeights,
      measureTargets,
      measureWorstCases,
      measureBestCases,
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
      departmentIds,
      departmentNames,
      positionIds,
      positionTitles,
      employeeIds,
      employeeNames,
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
      const allowed = cadenceOptionsForPeriod(
        periodDayCount(values.dateRange),
      );
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
      message: 'Choose whether to assign by department, role, or individual',
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
              : kpi.defaultTarget ?? null,
          worstCase:
            measureWorstCases[kpi.id] != null
              ? Number(measureWorstCases[kpi.id])
              : kpi.worstCase ?? null,
          bestCase:
            measureBestCases[kpi.id] != null
              ? Number(measureBestCases[kpi.id])
              : kpi.bestCase ?? null,
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
            return prev?.weight != null
              ? { ...row, weight: prev.weight }
              : row;
          }),
        });
        // Prefill targets from catalog defaults; user may overwrite on Weights
        seedMeasureTargetsFromCatalog();
      }
      if (current === 3) {
        await validateWeightsStep();
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

    if (!roles.length) {
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

    const employeeIds: string[] = values.employeeIds || [];
    if (options?.createIndividuals !== false) {
      for (const employeeId of employeeIds) {
        const option = employeeOptions.find((e) => e.value === employeeId);
        await createScorecard.mutateAsync({
          userId: employeeId,
          userName: option?.label || employeeId,
          managerId: actorUserId || 'system',
          departmentId: option?.departmentId || null,
          positionId: option?.positionId || null,
          cycleId: configId,
          targets: measureRows.map((row) => ({
            kpiLibraryId: row.kpiId!,
            weightPercentage: Number(row.weight),
            targetValue: Number(row.targetValue),
            worstCase: row.worstCase ?? undefined,
            bestCase: row.bestCase ?? undefined,
          })),
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
        <div>
          <h2 className="m-0 text-xl font-bold text-black">
            {isEdit ? 'Edit Scorecard' : 'Add Scorecard'}
          </h2>
          <p className="m-0 mt-1 text-sm font-normal text-[#595959]">
            {isEdit
              ? 'Update definition, scope, KPIs, and weights.'
              : 'Define the scorecard, set scope, select KPIs, then assign weights.'}
          </p>
        </div>
      }
      destroyOnClose
      data-cy="bsc-setup-modal"
    >
      <div className="mb-4 mt-2 hidden sm:block">
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
            <p className="mb-1 text-[13px] font-semibold text-[#262626]">
              Organizational scope
            </p>
            <p className="mb-4 text-[12px] text-[#8F94A3]">
              Choose how this scorecard is assigned, then select the matching
              targets.
            </p>

            <Form.Item
              name="scopeTarget"
              label="Assign to"
              rules={[
                {
                  required: true,
                  message: 'Select department, role, or individual',
                },
              ]}
            >
              <Radio.Group
                className="flex flex-col gap-2 sm:flex-row sm:gap-6"
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
            <p className="mb-1 text-[13px] font-semibold text-[#262626]">
              KPIs by perspective
            </p>
            <p className="mb-4 text-[12px] text-[#8F94A3]">
              Expand each perspective and select the KPIs to include on this
              scorecard. Weights are assigned in the next step.
            </p>

            {!scorecardPerspectiveNames.length ? (
              <p className="text-[13px] text-[#94A3B8]">
                No perspectives in the catalog yet. Add them on the KPIs tab
                first.
              </p>
            ) : (
              <Collapse
                accordion={false}
                defaultActiveKey={scorecardPerspectiveNames.slice(0, 1)}
                className="max-h-[440px] overflow-y-auto rounded-xl border border-[#E5E7EB] bg-white [&_.ant-collapse-item]:border-b [&_.ant-collapse-item]:border-[#E5E7EB] [&_.ant-collapse-item:last-child]:border-b-0 [&_.ant-collapse-header]:px-4 [&_.ant-collapse-header]:py-3 [&_.ant-collapse-content-box]:px-4 [&_.ant-collapse-content-box]:pb-4 [&_.ant-collapse-content-box]:pt-0"
                data-cy="bsc-scorecard-kpi-accordion"
              >
                {scorecardPerspectiveNames.map((perspective) => {
                  const kpis = uniqueCatalogKpis.filter(
                    (kpi) => kpi.perspective === perspective,
                  );
                  const selectedCount = kpis.filter((kpi) =>
                    selectedKpiIds.includes(kpi.id),
                  ).length;

                  return (
                    <Collapse.Panel
                      key={perspective}
                      header={
                        <div
                          className="flex items-center justify-between gap-3 pr-2"
                          data-cy={`bsc-scorecard-perspective-${perspective}`}
                        >
                          <span className="text-[14px] font-semibold text-[#262626]">
                            {perspective}
                          </span>
                          <span className="text-[11px] font-normal text-[#8F94A3]">
                            {selectedCount} of {kpis.length} selected
                          </span>
                        </div>
                      }
                    >
                      {!kpis.length ? (
                        <p className="m-0 text-[12px] text-[#94A3B8]">
                          No catalog KPIs for this perspective yet. Add them on
                          the KPIs tab.
                        </p>
                      ) : (
                        <div className="flex flex-col gap-2">
                          {kpis.map((kpi) => {
                            const checked = selectedKpiIds.includes(kpi.id);
                            return (
                              <div
                                key={kpi.id}
                                className="rounded-lg bg-[#F9FAFB] px-3 py-2"
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
                                >
                                  <span className="text-[13px] font-medium text-[#262626]">
                                    {kpi.name}
                                  </span>
                                  <span className="ml-2 text-[11px] text-[#8F94A3]">
                                    {kpi.measurementUnit}
                                  </span>
                                </Checkbox>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </Collapse.Panel>
                  );
                })}
              </Collapse>
            )}
          </>
        )}

        {current === 3 && (
          <>
            <p className="mb-1 text-[13px] font-semibold text-[#262626]">
              Weights & targets
            </p>
            <p className="mb-4 text-[12px] text-[#8F94A3]">
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
              <p className="text-[13px] text-[#94A3B8]">
                No KPIs selected. Go back and select KPIs first.
              </p>
            ) : (
              <div className="flex max-h-[440px] flex-col gap-4 overflow-y-auto pr-1">
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
                      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                        <p className="m-0 text-[14px] font-semibold text-[#262626]">
                          {perspective}
                          <span className="ml-2 text-[11px] font-normal text-[#8F94A3]">
                            {kpis.length} KPI{kpis.length === 1 ? '' : 's'}
                          </span>
                        </p>
                        <div className="flex items-center gap-2">
                          <span className="text-[12px] text-[#595959]">
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

                      <div className="flex flex-col gap-3">
                        {kpis.map((kpi) => {
                          const isBounded =
                            kpi.targetLogic === TargetLogic.Bounded;
                          return (
                            <div
                              key={kpi.id}
                              className="rounded-lg bg-[#F9FAFB] px-3 py-3"
                            >
                              <div className="mb-2 flex flex-wrap items-start justify-between gap-2">
                                <div>
                                  <p className="m-0 text-[13px] font-medium text-[#262626]">
                                    {kpi.name}
                                  </p>
                                  <p className="m-0 text-[11px] text-[#8F94A3]">
                                    {kpi.measurementUnit} ·{' '}
                                    {targetLogicLabel(kpi.targetLogic)}
                                    {kpi.defaultTarget != null
                                      ? ` · catalog default ${kpi.defaultTarget}`
                                      : ''}
                                  </p>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-[11px] text-[#595959]">
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
                              <div className="flex flex-wrap gap-3">
                                <div className="flex items-center gap-2">
                                  <span className="text-[11px] text-[#595959]">
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
                                    <div className="flex items-center gap-2">
                                      <span className="text-[11px] text-[#595959]">
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
                                    <div className="flex items-center gap-2">
                                      <span className="text-[11px] text-[#595959]">
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

        <div className="mt-6 flex justify-between gap-3">
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
