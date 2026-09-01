'use client';

import React, { useEffect, useMemo } from 'react';
import { Button, Form, Input, InputNumber, Select, Tooltip, message } from 'antd';
import { CloseCircleFilled, LeftOutlined, PlusOutlined } from '@ant-design/icons';
import { useParams, useRouter } from 'next/navigation';
import EmptyState from '@/components/empty';
import {
  useGetBscCycles,
  useGetBscKpiLibrary,
  useGetBscRolePerspective,
  useGetBscRolePerspectives,
} from '@/store/server/features/bsc/queries';
import { useSaveBscRoleKpis } from '@/store/server/features/bsc/mutation';
import { useBscUiStore } from '@/store/uistate/features/bsc';
import {
  validateKpisMatchPerspectiveAllocation,
  validateWeights,
} from '@/utils/bsc/scoring';
import {
  buildRoleList,
  decodeRoleSlug,
  filterKpisForRole,
} from '../../_utils/roleList';

type KpiRow = {
  id?: string | null;
  name?: string;
  description?: string | null;
  weight?: number | null;
  perspective?: string;
};

function emptyRow(perspective?: string): KpiRow {
  return {
    name: '',
    description: '',
    weight: undefined,
    perspective,
  };
}

function toFormRows(rows: KpiRow[]) {
  return rows.map((k) => ({
    id: k.id,
    name: k.name,
    description: k.description || '',
    weight: k.weight,
    perspective: k.perspective,
  }));
}

export default function BscRoleKpiDetailPage() {
  const [form] = Form.useForm();
  const params = useParams();
  const router = useRouter();
  const roleKey = String(params?.roleKey || '');
  const { setRoleContext, setSelectedConfigId } = useBscUiStore();

  const { data: configs } = useGetBscCycles();
  const { data: allKpis, isLoading } = useGetBscKpiLibrary();
  const { data: allocations } = useGetBscRolePerspectives();
  const saveKpis = useSaveBscRoleKpis();

  const watchedRows: KpiRow[] = Form.useWatch('kpis', form) || [];
  const totalWeight = useMemo(
    () =>
      watchedRows.reduce((sum, row) => sum + Number(row?.weight || 0), 0),
    [watchedRows],
  );
  const roundedTotal = Math.round(totalWeight);
  const weightTone =
    roundedTotal === 100
      ? 'text-[#059669]'
      : roundedTotal > 100
        ? 'text-[#DC2626]'
        : 'text-[#D97706]';

  const roles = useMemo(
    () => buildRoleList(configs || [], allKpis || [], allocations || []),
    [configs, allKpis, allocations],
  );

  const role = useMemo(
    () =>
      roles.find((r) => r.key === roleKey) ||
      roles.find(
        (r) =>
          r.positionTitle.toLowerCase() ===
          decodeRoleSlug(roleKey).toLowerCase(),
      ),
    [roles, roleKey],
  );

  const roleTitle = role?.positionTitle || decodeRoleSlug(roleKey);

  const configId = useMemo(
    () =>
      role?.evaluationConfigId ||
      configs?.find((c) =>
        (c.positionTitles || []).some(
          (t) => t.toLowerCase() === roleTitle.toLowerCase(),
        ),
      )?.id ||
      configs?.[0]?.id ||
      '',
    [role, configs, roleTitle],
  );

  const roleKpis = useMemo(
    () =>
      filterKpisForRole(allKpis || [], roleKey, roleTitle).filter(
        (k) => !configId || k.evaluationConfigId === configId,
      ),
    [allKpis, roleKey, roleTitle, configId],
  );

  const existingIds = useMemo(() => roleKpis.map((k) => k.id), [roleKpis]);

  const { data: allocation, isLoading: allocationLoading } =
    useGetBscRolePerspective(
      configId,
      role?.positionId || null,
      roleTitle,
    );

  const perspectiveNames = useMemo(() => {
    if (!allocation?.weights) return [];
    return Object.entries(allocation.weights)
      .filter(([, weight]) => Number(weight) > 0)
      .map(([name]) => name);
  }, [allocation]);
  const hasAssignedPerspectives = perspectiveNames.length > 0;
  const weightByPerspective = useMemo(() => {
    const totals: Record<string, number> = {};
    for (const name of perspectiveNames) totals[name] = 0;
    for (const row of watchedRows) {
      const p = row?.perspective;
      if (!p) continue;
      totals[p] = (totals[p] || 0) + Number(row?.weight || 0);
    }
    return totals;
  }, [watchedRows, perspectiveNames]);

  const weightValidation = useMemo(() => {
    const kpiWeights = watchedRows.map((r) => Number(r?.weight || 0));
    const kpiPerspectives = watchedRows.map((r) => r?.perspective || '');
    if (!hasAssignedPerspectives) {
      return {
        valid: false,
        message: 'Assign perspectives to this role before adding KPIs',
      };
    }
    const base = validateWeights(kpiWeights, kpiPerspectives);
    if (!base.valid) return base;
    return validateKpisMatchPerspectiveAllocation(
      kpiWeights,
      kpiPerspectives,
      allocation?.weights || {},
    );
  }, [watchedRows, allocation, hasAssignedPerspectives]);
  const weightIncomplete = !weightValidation.valid;

  useEffect(() => {
    setSelectedConfigId(configId || null);
    setRoleContext({
      positionId: role?.positionId || null,
      positionTitle: roleTitle,
      evaluationConfigId: configId,
      departmentName: role?.departmentNames?.[0] || null,
    });
    return () => {
      setRoleContext(null);
    };
  }, [role, roleTitle, configId, setRoleContext, setSelectedConfigId]);

  useEffect(() => {
    if (isLoading) return;
    form.setFieldsValue({
      kpis: roleKpis.length
        ? roleKpis.map((k) => ({
            id: k.id,
            name: k.name,
            description: k.description || '',
            weight: k.weight ?? k.suggestedWeight ?? undefined,
            perspective: k.perspective,
          }))
        : [],
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- avoid wiping in-progress edits on refetch
  }, [isLoading, roleKey, configId, form]);

  const handleSave = async () => {
    if (!hasAssignedPerspectives) {
      message.info({
        content: 'Assign perspectives to this role before adding KPIs.',
        duration: 4,
      });
      return;
    }
    if (weightIncomplete) {
      message.info({
        content:
          weightValidation.message ||
          'Assign weights so your KPIs total exactly 100% before you save.',
        duration: 4,
      });
      return;
    }
    const values = await form.validateFields();
    const rows = (values.kpis || []) as KpiRow[];
    const saved = await saveKpis.mutateAsync({
      evaluationConfigId: configId,
      positionId: role?.positionId || null,
      positionTitle: roleTitle,
      departmentName: role?.departmentNames?.[0] || null,
      existingIds,
      rows: rows.map((r) => ({
        id: r.id || null,
        name: (r.name || '').trim(),
        description: r.description?.trim() || null,
        weight: Number(r.weight),
        perspective: r.perspective,
      })),
    });
    form.setFieldsValue({
      kpis: toFormRows(
        saved.map((k) => ({
          id: k.id,
          name: k.name,
          description: k.description || '',
          weight: k.weight ?? k.suggestedWeight ?? undefined,
          perspective: k.perspective,
        })),
      ),
    });
  };

  return (
    <div className="w-full" data-cy="bsc-role-kpi-detail">
      <div className="overflow-hidden rounded-xl border border-[#F1F2F6] bg-white min-h-[400px]">
        <div
          className="flex flex-wrap items-center justify-between gap-3 border-b border-[#F1F2F6] bg-[#FAFBFC] px-4 py-3 md:px-6 md:py-4"
          data-cy="bsc-kpi-header"
        >
          <div className="flex min-w-0 items-center gap-2 md:gap-3">
            <button
              type="button"
              onClick={() => router.push('/okr/settings/bsc-setup')}
              className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg text-[#64748B] transition-colors hover:bg-white hover:text-[#574CFF] hover:shadow-sm"
              aria-label="Back to roles"
              data-cy="bsc-kpi-back"
            >
              <LeftOutlined className="text-[14px]" />
            </button>
            <div className="min-w-0">
              <p className="m-0 truncate text-[12px] font-semibold leading-snug text-[#161A2C] md:text-sm">
                {roleTitle}
              </p>
              {!!role?.departmentNames?.length && (
                <p className="m-0 mt-0.5 truncate text-[11px] text-[#8F94A3]">
                  {role.departmentNames.join(' · ')}
                </p>
              )}
            </div>
          </div>

          <div className="flex min-w-0 flex-shrink-0 flex-wrap items-center justify-end gap-2 md:gap-3">
            <span
              className="whitespace-nowrap text-[12px] tabular-nums text-[#475569] md:text-sm"
              data-cy="bsc-kpi-weight-summary"
            >
              {watchedRows.length} KPI{watchedRows.length !== 1 ? 's' : ''}
              <span className="mx-1 text-[#CBD5E1] md:mx-2">·</span>
              <span
                className={`text-[18px] font-extrabold md:text-[20px] ${weightTone}`}
                data-cy="bsc-kpi-weight-total"
              >
                {roundedTotal}
              </span>
              <span className="text-[13px] font-medium text-[#94A3B8] md:text-[14px]">
                {' '}
                / 100
              </span>
            </span>
            <Tooltip
              title={
                weightIncomplete
                  ? weightValidation.message ||
                    'Total weight must equal 100 before you can save.'
                  : ''
              }
            >
              <Button
                type="primary"
                loading={saveKpis.isLoading}
                disabled={
                  weightIncomplete || !configId || !hasAssignedPerspectives
                }
                onClick={handleSave}
                className="!m-0 !h-9 !min-h-9 !w-auto !min-w-0 rounded-lg !border-[#1E40AF] !bg-[#1E40AF] !px-3.5 text-[12px] font-semibold !text-white hover:!border-[#1E3A8A] hover:!bg-[#1E3A8A] md:!h-10 md:!min-h-10 md:!px-5 md:text-[13px]"
                data-cy="bsc-kpi-save"
              >
                Save KPIs
              </Button>
            </Tooltip>
          </div>
        </div>

        <div className="px-4 py-4 md:px-6 md:py-5">
          {isLoading || allocationLoading ? (
            <div className="py-16 text-center text-[#94A3B8]">Loading…</div>
          ) : !hasAssignedPerspectives ? (
            <div className="flex min-h-[240px] items-center justify-center py-8">
              <EmptyState
                title="Assign perspectives first"
                description="Select perspectives and weights for this role before you can create KPIs."
                actionText="Assign perspectives"
                onAction={() =>
                  router.push(
                    `/okr/settings/bsc-perspective-assignment/role/${encodeURIComponent(roleKey)}`,
                  )
                }
              />
            </div>
          ) : (
            <Form
              form={form}
              layout="vertical"
              requiredMark={false}
              className="[&_.ant-form-item-explain-error]:text-[11px]"
            >
              <Form.List name="kpis">
                {(fields, { add, remove }) => {
                  const perspectiveOf = (field: { name: number }) =>
                    watchedRows[field.name]?.perspective ||
                    form.getFieldValue(['kpis', field.name, 'perspective']);
                  const unassignedFields = fields.filter(
                    (field) => !perspectiveOf(field),
                  );
                  const renderKpiRow = (
                    field: (typeof fields)[number],
                    index: number,
                  ) => (
                    <div
                      key={field.key}
                      className="rounded-xl bg-[#F9FAFB] px-3.5 py-3 md:px-4 md:py-3.5"
                      data-cy={`bsc-kpi-row-${field.key}`}
                    >
                      <div className="mb-2 flex items-center justify-between gap-2">
                        <span
                          className="text-[11px] font-semibold uppercase tracking-wider text-[#8F94A3]"
                          data-cy={`bsc-kpi-index-${field.name}`}
                        >
                          KPI {index + 1}
                        </span>
                      </div>

                      <Form.Item name={[field.name, 'id']} hidden>
                        <Input />
                      </Form.Item>

                      <div className="flex items-center gap-3 w-full">
                        <Form.Item
                          name={[field.name, 'name']}
                          className="mb-0 flex-1"
                          rules={[
                            {
                              required: true,
                              whitespace: true,
                              message:
                                'Please input a KPI name or delete this field.',
                            },
                          ]}
                          style={{ flex: 1, marginBottom: 0 }}
                        >
                          <Input
                            placeholder="Add your KPI name here"
                            className="text-[12px] h-10 border-gray-200 rounded-lg"
                            data-cy={`bsc-kpi-name-${field.name}`}
                          />
                        </Form.Item>
                        <CloseCircleFilled
                          className="text-[#3D41FF] cursor-pointer hover:text-[#3236e6] transition-colors"
                          style={{ fontSize: 20 }}
                          onClick={() => remove(field.name)}
                          data-cy={`bsc-kpi-remove-${field.name}`}
                        />
                      </div>

                      <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
                        <div className="w-full sm:w-[220px]">
                          <div className="mb-1 text-xs flex items-center gap-1.5 text-gray-500">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#574CFF] inline-block" />
                            Perspective
                          </div>
                          <Form.Item
                            name={[field.name, 'perspective']}
                            className="mb-0"
                            rules={[
                              {
                                required: true,
                                message: 'Select a perspective',
                              },
                            ]}
                          >
                            <Select
                              placeholder="Select perspective"
                              options={perspectiveNames.map((name) => ({
                                value: name,
                                label: name,
                              }))}
                              className="w-full"
                              data-cy={`bsc-kpi-perspective-${field.name}`}
                            />
                          </Form.Item>
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="mb-1 text-xs flex items-center gap-1.5 text-gray-500">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#574CFF] inline-block" />
                            Description
                          </div>
                          <Form.Item
                            name={[field.name, 'description']}
                            className="mb-0"
                            rules={[
                              {
                                required: true,
                                whitespace: true,
                                message: 'Description is required',
                              },
                            ]}
                          >
                            <Input
                              placeholder="What this KPI measures"
                              className="text-[12px] h-10 border-gray-200 rounded-lg"
                              data-cy={`bsc-kpi-description-${field.name}`}
                            />
                          </Form.Item>
                        </div>
                        <div>
                          <div className="mb-1 text-xs flex items-center gap-1.5 text-gray-500">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#574CFF] inline-block" />
                            Weight
                          </div>
                          <Form.Item
                            name={[field.name, 'weight']}
                            className="mb-0"
                            rules={[
                              {
                                required: true,
                                message: 'Weight is required',
                              },
                              {
                                validator: (_rule, value) => {
                                  if (
                                    value !== undefined &&
                                    value !== null &&
                                    value <= 0
                                  ) {
                                    return Promise.reject(
                                      new Error(
                                        'Weight must be greater than 0',
                                      ),
                                    );
                                  }
                                  return Promise.resolve();
                                },
                              },
                            ]}
                          >
                            <InputNumber
                              min={1}
                              max={100}
                              placeholder="0"
                              className="w-[80px] text-xs h-10 [&_.ant-input-number]:h-full [&_.ant-input-number-input-wrap]:h-full [&_.ant-input-number-input-wrap]:flex [&_.ant-input-number-input-wrap]:items-center [&_.ant-input-number-input]:h-full"
                              data-cy={`bsc-kpi-weight-${field.name}`}
                            />
                          </Form.Item>
                        </div>
                      </div>
                    </div>
                  );

                  return (
                    <div className="flex flex-col gap-6">
                      {unassignedFields.length > 0 && (
                        <section
                          className="rounded-xl bg-[#F9FAFB] px-3.5 py-3 md:px-4 md:py-4"
                          data-cy="bsc-perspective-section-unassigned"
                        >
                          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                            <h2 className="m-0 text-[13px] font-semibold text-[#161A2C]">
                              New KPI
                            </h2>
                          </div>
                          <div className="flex flex-col gap-3">
                            {unassignedFields.map((field, index) =>
                              renderKpiRow(field, index),
                            )}
                          </div>
                        </section>
                      )}
                      {perspectiveNames.map((perspective) => {
                        const sectionFields = fields.filter(
                          (field) => perspectiveOf(field) === perspective,
                        );
                        const sectionWeight = Math.round(
                          weightByPerspective[perspective] || 0,
                        );
                        const allocated =
                          allocation?.weights?.[perspective] ?? 0;
                        const overCap = sectionWeight > allocated;
                        return (
                          <section
                            key={perspective}
                            className="rounded-xl bg-[#F9FAFB] px-3.5 py-3 md:px-4 md:py-4"
                            data-cy={`bsc-perspective-section-${perspective}`}
                          >
                            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                              <h2 className="m-0 text-[13px] font-semibold text-[#161A2C]">
                                {perspective}
                              </h2>
                              <span
                                className={`text-[12px] tabular-nums ${
                                  overCap
                                    ? 'font-semibold text-[#DC2626]'
                                    : 'text-[#64748B]'
                                }`}
                                data-cy={`bsc-perspective-weight-${perspective}`}
                              >
                                {sectionWeight} / {allocated}
                              </span>
                            </div>

                            <div className="flex flex-col gap-3">
                              {sectionFields.length === 0 && (
                                <p className="m-0 text-[12px] text-[#94A3B8]">
                                  Add at least one KPI and select this
                                  perspective.
                                </p>
                              )}
                              {sectionFields.map((field, index) =>
                                renderKpiRow(field, index),
                              )}

                              <button
                                type="button"
                                onClick={() => add(emptyRow(perspective))}
                                className="inline-flex items-center gap-1.5 border-none bg-transparent p-0 text-[13px] font-semibold text-[#574CFF] cursor-pointer hover:text-[#3236e6]"
                                data-cy={`bsc-kpi-add-row-${perspective}`}
                              >
                                <PlusOutlined className="text-[12px]" />
                                Add KPI
                              </button>
                            </div>
                          </section>
                        );
                      })}
                    </div>
                  );
                }}
              </Form.List>

              <div
                className="mt-6 flex flex-wrap items-center justify-end gap-3 border-t border-[#F1F2F6] pt-4"
                data-cy="bsc-kpi-weight-footer"
              >
                <span className="text-sm font-medium text-[#161A2C] whitespace-nowrap">
                  Weight Point:{' '}
                  <span className={`font-bold ${weightTone}`}>
                    {roundedTotal}%
                  </span>
                </span>
              </div>
            </Form>
          )}
        </div>
      </div>
    </div>
  );
}
