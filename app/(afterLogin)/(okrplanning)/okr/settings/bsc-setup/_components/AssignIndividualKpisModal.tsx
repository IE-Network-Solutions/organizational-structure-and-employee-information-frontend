import React, { useEffect, useMemo, useState } from 'react';
import {
  Checkbox,
  Collapse,
  InputNumber,
  Modal,
  Select,
  Steps,
  Tag,
} from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import CustomButton from '@/components/common/buttons/customButton';
import NotificationMessage from '@/components/common/notification/notificationMessage';
import { useAppendIndividualBscKpis } from '@/store/server/features/bsc/mutation';
import { useGetBscKpiLibrary } from '@/store/server/features/bsc/queries';
import { EmployeeScorecard, KpiLibraryItem, TargetLogic } from '@/types/bsc';
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
  /** When set and scorecard is null, user can pick a person first */
  personOptions?: PersonOption[];
  evaluationConfigId?: string;
  onClose: () => void;
};

function kpiKey(kpi: Pick<KpiLibraryItem, 'perspective' | 'name'>) {
  return `${kpi.perspective}::${kpi.name}`;
}

const STEPS = [{ title: 'KPIs' }, { title: 'Weights' }];

export default function AssignIndividualKpisModal({
  open,
  scorecard,
  personOptions = [],
  evaluationConfigId,
  onClose,
}: Props) {
  const { data: allKpis } = useGetBscKpiLibrary();
  const appendKpis = useAppendIndividualBscKpis();
  const [current, setCurrent] = useState(0);
  const [selectedScorecardId, setSelectedScorecardId] = useState<string>();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [personWeights, setPersonWeights] = useState<Record<string, number>>(
    {},
  );
  const [measureTargets, setMeasureTargets] = useState<
    Record<string, number | null>
  >({});

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

  const catalogByPerspective = useMemo(() => {
    const map = new Map<string, KpiLibraryItem[]>();
    if (!activeScorecard) return map;
    const seen = new Set<string>();
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
      const list = map.get(kpi.perspective) || [];
      list.push(kpi);
      map.set(kpi.perspective, list);
    }
    for (const list of map.values()) {
      list.sort((a, b) => a.name.localeCompare(b.name));
    }
    return map;
  }, [allKpis, alreadyOnScorecard, activeScorecard, resolvedConfigId]);

  const perspectives = useMemo(
    () => Array.from(catalogByPerspective.keys()).sort(),
    [catalogByPerspective],
  );

  const selectedKpis = useMemo(() => {
    const all = perspectives.flatMap(
      (name) => catalogByPerspective.get(name) || [],
    );
    return all.filter((kpi) => selectedIds.includes(kpi.id));
  }, [perspectives, catalogByPerspective, selectedIds]);

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
    setPersonWeights({});
    setMeasureTargets({});
    setSelectedScorecardId(scorecard?.id);
  }, [open, scorecard?.id]);

  const handleToggle = (kpi: KpiLibraryItem, checked: boolean) => {
    setSelectedIds((prev) =>
      checked ? [...prev, kpi.id] : prev.filter((id) => id !== kpi.id),
    );
  };

  const seedPersonWeights = () => {
    if (!activeScorecard || !selectedKpis.length) return;

    const next: Record<string, number> = {};
    activeScorecard.targets.forEach((target) => {
      next[`existing:${target.id}`] = target.weightPercentage;
    });
    // New KPIs start blank — user sets weights and rebalances the person total.
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

  const weightSum = weightRows.reduce(
    (sum, row) => sum + (Number(personWeights[row.key]) || 0),
    0,
  );
  const weightCheck = validateWeights(
    weightRows.map((row) => Number(personWeights[row.key]) || 0),
    weightRows.map((row) => row.perspective),
  );

  const handleSave = async () => {
    if (!activeScorecard || !selectedKpis.length) return;
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
        <div data-cy="-okrplanning-okr-settings-bsc-setup-assignindividualkpismodal-div-1">
          <h2
            className="m-0 text-xl font-bold text-black"
            data-cy="-okrplanning-okr-settings-bsc-setup-assignindividualkpismodal-h2-2"
          >
            Add individual KPIs
          </h2>
          <p
            className="m-0 mt-1 text-sm font-normal text-[#595959]"
            data-cy="-okrplanning-okr-settings-bsc-setup-assignindividualkpismodal-p-3"
          >
            {activeScorecard
              ? `Select KPIs for ${activeScorecard.userName}, then assign this person's weights.`
              : 'Choose a person, select KPIs, then assign weights.'}
          </p>
        </div>
      }
      data-cy="bsc-assign-individual-kpis-modal"
    >
      <div
        className="mb-4 mt-2 hidden sm:block"
        data-cy="-okrplanning-okr-settings-bsc-setup-assignindividualkpismodal-div-4"
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

      <div
        className="mt-2"
        data-cy="-okrplanning-okr-settings-bsc-setup-assignindividualkpismodal-div-5"
      >
        {current === 0 && (
          <>
            {needsPersonPick ? (
              <div
                className="mb-4"
                data-cy="-okrplanning-okr-settings-bsc-setup-assignindividualkpismodal-div-6"
              >
                <p
                  className="mb-2 text-[13px] font-semibold text-[#262626]"
                  data-cy="-okrplanning-okr-settings-bsc-setup-assignindividualkpismodal-p-7"
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
                  }}
                  options={personOptions.map((option) => ({
                    value: option.scorecard.id,
                    label: option.label,
                  }))}
                  data-cy="bsc-assign-individual-person-select"
                />
              </div>
            ) : null}

            <p
              className="mb-1 text-[13px] font-semibold text-[#262626]"
              data-cy="-okrplanning-okr-settings-bsc-setup-assignindividualkpismodal-p-8"
            >
              KPIs by perspective
            </p>
            <p
              className="mb-4 text-[12px] text-[#8F94A3]"
              data-cy="-okrplanning-okr-settings-bsc-setup-assignindividualkpismodal-p-9"
            >
              Expand each perspective and select the KPIs to append for this
              person only. Weights are assigned in the next step.
            </p>

            {activeScorecard ? (
              <div
                className="mb-4 flex flex-wrap items-center gap-2"
                data-cy="-okrplanning-okr-settings-bsc-setup-assignindividualkpismodal-div-10"
              >
                <Tag className="m-0 h-5 rounded border border-[#91caff] bg-[#e6f4ff] px-1.5 text-[11px] font-normal leading-5 text-[#1677ff]">
                  {
                    activeScorecard.targets.filter(
                      (t) => (t.assignmentSource || 'shared') === 'shared',
                    ).length
                  }{' '}
                  shared
                </Tag>
                <Tag className="m-0 h-5 rounded border border-[#91caff] bg-[#e6f4ff] px-1.5 text-[11px] font-normal leading-5 text-[#1677ff]">
                  {
                    activeScorecard.targets.filter(
                      (t) => t.assignmentSource === 'individual',
                    ).length
                  }{' '}
                  individual
                </Tag>
              </div>
            ) : null}

            {!activeScorecard ? (
              <p
                className="text-[13px] text-[#94A3B8]"
                data-cy="-okrplanning-okr-settings-bsc-setup-assignindividualkpismodal-p-11"
              >
                Select a person to choose KPIs.
              </p>
            ) : !perspectives.length ? (
              <p
                className="text-[13px] text-[#94A3B8]"
                data-cy="-okrplanning-okr-settings-bsc-setup-assignindividualkpismodal-p-12"
              >
                No additional catalog KPIs available for this person.
              </p>
            ) : (
              <Collapse
                accordion={false}
                defaultActiveKey={perspectives.slice(0, 1)}
                className="max-h-[440px] overflow-y-auto rounded-xl border border-[#E5E7EB] bg-white [&_.ant-collapse-item]:border-b [&_.ant-collapse-item]:border-[#E5E7EB] [&_.ant-collapse-item:last-child]:border-b-0 [&_.ant-collapse-header]:px-4 [&_.ant-collapse-header]:py-3 [&_.ant-collapse-content-box]:px-4 [&_.ant-collapse-content-box]:pb-4 [&_.ant-collapse-content-box]:pt-0"
                data-cy="bsc-individual-kpi-accordion"
              >
                {perspectives.map((perspective) => {
                  const kpis = catalogByPerspective.get(perspective) || [];
                  const selectedCount = kpis.filter((kpi) =>
                    selectedIds.includes(kpi.id),
                  ).length;
                  return (
                    <Collapse.Panel
                      key={perspective}
                      header={
                        <div
                          className="flex items-center justify-between gap-3 pr-2"
                          data-cy="-okrplanning-okr-settings-bsc-setup-assignindividualkpismodal-div-13"
                        >
                          <span
                            className="text-[14px] font-semibold text-[#262626]"
                            data-cy="-okrplanning-okr-settings-bsc-setup-assignindividualkpismodal-span-14"
                          >
                            {perspective}
                          </span>
                          <span
                            className="text-[11px] font-normal text-[#8F94A3]"
                            data-cy="-okrplanning-okr-settings-bsc-setup-assignindividualkpismodal-span-15"
                          >
                            {selectedCount} of {kpis.length} selected
                          </span>
                        </div>
                      }
                    >
                      <div
                        className="flex flex-col gap-2"
                        data-cy="-okrplanning-okr-settings-bsc-setup-assignindividualkpismodal-div-16"
                      >
                        {kpis.map((kpi) => {
                          const checked = selectedIds.includes(kpi.id);
                          return (
                            <div
                              key={kpi.id}
                              className="rounded-lg bg-[#F9FAFB] px-3 py-2"
                              data-cy="-okrplanning-okr-settings-bsc-setup-assignindividualkpismodal-div-17"
                            >
                              <Checkbox
                                checked={checked}
                                onChange={(e) =>
                                  handleToggle(kpi, e.target.checked)
                                }
                              >
                                <span
                                  className="text-[13px] font-medium text-[#262626]"
                                  data-cy="-okrplanning-okr-settings-bsc-setup-assignindividualkpismodal-span-18"
                                >
                                  {kpi.name}
                                </span>
                                <span
                                  className="ml-2 text-[11px] text-[#8F94A3]"
                                  data-cy="-okrplanning-okr-settings-bsc-setup-assignindividualkpismodal-span-19"
                                >
                                  {kpi.measurementUnit}
                                </span>
                              </Checkbox>
                            </div>
                          );
                        })}
                      </div>
                    </Collapse.Panel>
                  );
                })}
              </Collapse>
            )}
          </>
        )}

        {current === 1 && (
          <>
            <p
              className="mb-1 text-[13px] font-semibold text-[#262626]"
              data-cy="-okrplanning-okr-settings-bsc-setup-assignindividualkpismodal-p-20"
            >
              Weights & targets
            </p>
            <p
              className="mb-4 text-[12px] text-[#8F94A3]"
              data-cy="-okrplanning-okr-settings-bsc-setup-assignindividualkpismodal-p-21"
            >
              Set every KPI weight for {activeScorecard?.userName} only (sum
              100%). New KPI weights start empty — lower shared weights as
              needed so the total still adds to 100%.
            </p>

            <div
              className="mb-3 flex flex-wrap items-center gap-2 text-[12px]"
              data-cy="-okrplanning-okr-settings-bsc-setup-assignindividualkpismodal-div-22"
            >
              <span
                className={
                  Math.abs(weightSum - 100) <= 0.01
                    ? 'text-[#389E0D]'
                    : 'text-[#CF1322]'
                }
                data-cy="-okrplanning-okr-settings-bsc-setup-assignindividualkpismodal-span-23"
              >
                Total {Math.round(weightSum * 100) / 100}%
              </span>
              {!weightCheck.valid && weightSum > 0 ? (
                <span
                  className="text-[#CF1322]"
                  data-cy="-okrplanning-okr-settings-bsc-setup-assignindividualkpismodal-span-24"
                >
                  {weightCheck.message}
                </span>
              ) : null}
            </div>

            {!weightRowsByPerspective.length ? (
              <p
                className="text-[13px] text-[#94A3B8]"
                data-cy="-okrplanning-okr-settings-bsc-setup-assignindividualkpismodal-p-25"
              >
                No KPIs selected. Go back and select KPIs first.
              </p>
            ) : (
              <div
                className="flex max-h-[440px] flex-col gap-4 overflow-y-auto pr-1"
                data-cy="bsc-assign-individual-weights"
              >
                {weightRowsByPerspective.map(([perspective, rows]) => {
                  const allocated = rows.reduce(
                    (sum, row) => sum + (Number(personWeights[row.key]) || 0),
                    0,
                  );
                  return (
                    <div
                      key={perspective}
                      className="rounded-xl border border-[#E5E7EB] p-4"
                      data-cy="-okrplanning-okr-settings-bsc-setup-assignindividualkpismodal-div-26"
                    >
                      <div
                        className="mb-3 flex flex-wrap items-center justify-between gap-3"
                        data-cy="-okrplanning-okr-settings-bsc-setup-assignindividualkpismodal-div-27"
                      >
                        <p
                          className="m-0 text-[14px] font-semibold text-[#262626]"
                          data-cy="-okrplanning-okr-settings-bsc-setup-assignindividualkpismodal-p-28"
                        >
                          {perspective}
                          <span
                            className="ml-2 text-[11px] font-normal text-[#8F94A3]"
                            data-cy="-okrplanning-okr-settings-bsc-setup-assignindividualkpismodal-span-29"
                          >
                            {rows.length} KPI{rows.length === 1 ? '' : 's'}
                          </span>
                        </p>
                        <span
                          className="text-[12px] text-[#595959]"
                          data-cy="-okrplanning-okr-settings-bsc-setup-assignindividualkpismodal-span-30"
                        >
                          {Math.round(allocated * 100) / 100}%
                        </span>
                      </div>

                      <div
                        className="flex flex-col gap-3"
                        data-cy="-okrplanning-okr-settings-bsc-setup-assignindividualkpismodal-div-31"
                      >
                        {rows.map((row) => (
                          <div
                            key={row.key}
                            className="rounded-lg bg-[#F9FAFB] px-3 py-3"
                            data-cy="-okrplanning-okr-settings-bsc-setup-assignindividualkpismodal-div-32"
                          >
                            <div
                              className="mb-2 flex flex-wrap items-start justify-between gap-2"
                              data-cy="-okrplanning-okr-settings-bsc-setup-assignindividualkpismodal-div-33"
                            >
                              <div data-cy="-okrplanning-okr-settings-bsc-setup-assignindividualkpismodal-div-34">
                                <p
                                  className="m-0 text-[13px] font-medium text-[#262626]"
                                  data-cy="-okrplanning-okr-settings-bsc-setup-assignindividualkpismodal-p-35"
                                >
                                  {row.name}
                                </p>
                                <div
                                  className="mt-1 flex flex-wrap gap-1"
                                  data-cy="-okrplanning-okr-settings-bsc-setup-assignindividualkpismodal-div-36"
                                >
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
                                  {row.measurementUnit ? (
                                    <span
                                      className="text-[11px] text-[#8F94A3]"
                                      data-cy="-okrplanning-okr-settings-bsc-setup-assignindividualkpismodal-span-37"
                                    >
                                      {row.measurementUnit}
                                    </span>
                                  ) : null}
                                </div>
                              </div>
                              <div
                                className="flex items-center gap-2"
                                data-cy="-okrplanning-okr-settings-bsc-setup-assignindividualkpismodal-div-38"
                              >
                                <span
                                  className="text-[11px] text-[#595959]"
                                  data-cy="-okrplanning-okr-settings-bsc-setup-assignindividualkpismodal-span-39"
                                >
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
                              <div
                                className="flex flex-wrap gap-3"
                                data-cy="-okrplanning-okr-settings-bsc-setup-assignindividualkpismodal-div-40"
                              >
                                <div
                                  className="flex items-center gap-2"
                                  data-cy="-okrplanning-okr-settings-bsc-setup-assignindividualkpismodal-div-41"
                                >
                                  <span
                                    className="text-[11px] text-[#595959]"
                                    data-cy="-okrplanning-okr-settings-bsc-setup-assignindividualkpismodal-span-42"
                                  >
                                    Target
                                  </span>
                                  <InputNumber
                                    className="w-28"
                                    placeholder={
                                      row.defaultTarget != null
                                        ? String(row.defaultTarget)
                                        : 'Enter target'
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
                                </div>
                              </div>
                            ) : row.existingTarget != null ? (
                              <p
                                className="m-0 text-[11px] text-[#8F94A3]"
                                data-cy="-okrplanning-okr-settings-bsc-setup-assignindividualkpismodal-p-43"
                              >
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

        <div
          className="mt-6 flex justify-between gap-3"
          data-cy="-okrplanning-okr-settings-bsc-setup-assignindividualkpismodal-div-44"
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
