'use client';

import React, { useEffect, useMemo } from 'react';
import { Button, Form, Input, InputNumber, Tooltip, message } from 'antd';
import { CloseCircleFilled, LeftOutlined, PlusOutlined } from '@ant-design/icons';
import { useParams, useRouter } from 'next/navigation';
import {
  useGetBscCycles,
  useGetBscKpiLibrary,
} from '@/store/server/features/bsc/queries';
import { useSaveBscRoleKpis } from '@/store/server/features/bsc/mutation';
import { useBscUiStore } from '@/store/uistate/features/bsc';
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
};

export default function BscRoleKpiDetailPage() {
  const [form] = Form.useForm();
  const params = useParams();
  const router = useRouter();
  const roleKey = String(params?.roleKey || '');
  const { setRoleContext, setSelectedConfigId } = useBscUiStore();

  const { data: configs } = useGetBscCycles();
  const { data: allKpis, isLoading } = useGetBscKpiLibrary();
  const saveKpis = useSaveBscRoleKpis();

  const watchedRows: KpiRow[] = Form.useWatch('kpis', form) || [];
  const totalWeight = useMemo(
    () =>
      watchedRows.reduce((sum, row) => sum + Number(row?.weight || 0), 0),
    [watchedRows],
  );
  const roundedTotal = Math.round(totalWeight);
  const weightIncomplete = roundedTotal !== 100;
  const weightTone =
    roundedTotal === 100
      ? 'text-[#059669]'
      : roundedTotal > 100
        ? 'text-[#DC2626]'
        : 'text-[#D97706]';

  const roles = useMemo(
    () => buildRoleList(configs || [], allKpis || []),
    [configs, allKpis],
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
    () => filterKpisForRole(allKpis || [], roleKey, roleTitle),
    [allKpis, roleKey, roleTitle],
  );

  const existingIds = useMemo(() => roleKpis.map((k) => k.id), [roleKpis]);

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
          }))
        : [{ name: '', description: '', weight: undefined }],
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- avoid wiping in-progress edits on refetch
  }, [isLoading, roleKey, form]);

  const handleSave = async () => {
    if (weightIncomplete) {
      message.info({
        content:
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
      })),
    });
    form.setFieldsValue({
      kpis: saved.map((k) => ({
        id: k.id,
        name: k.name,
        description: k.description || '',
        weight: k.weight ?? k.suggestedWeight ?? undefined,
      })),
    });
  };

  return (
    <div className="w-full" data-cy="bsc-role-kpi-detail">
      <div className="overflow-hidden rounded-xl border border-[#F1F2F6] bg-white min-h-[400px]">
        {/* Header — mirrors inline planning workspace */}
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
                  ? 'Total weight must equal 100 before you can save.'
                  : ''
              }
            >
              <Button
                type="primary"
                loading={saveKpis.isLoading}
                disabled={weightIncomplete || !configId}
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
          {isLoading ? (
            <div className="py-16 text-center text-[#94A3B8]">Loading…</div>
          ) : (
            <Form
              form={form}
              layout="vertical"
              requiredMark={false}
              className="[&_.ant-form-item-explain-error]:text-[11px]"
            >
              <Form.List name="kpis">
                {(fields, { add, remove }) => (
                  <>
                    <div className="flex flex-col gap-3">
                      {fields.map((field, index) => (
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

                          {/* Name row — like planning task input + close */}
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
                              className={`text-[#3D41FF] transition-colors ${
                                fields.length <= 1
                                  ? 'opacity-30 cursor-not-allowed'
                                  : 'cursor-pointer hover:text-[#3236e6]'
                              }`}
                              style={{ fontSize: 20 }}
                              onClick={() => {
                                if (fields.length <= 1) return;
                                remove(field.name);
                              }}
                              data-cy={`bsc-kpi-remove-${field.name}`}
                            />
                          </div>

                          {/* Description + Weight — planning metrics row style */}
                          <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
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

                            <div className="flex items-end gap-2">
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
                        </div>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        add({
                          name: '',
                          description: '',
                          weight: undefined,
                        })
                      }
                      className="mt-4 inline-flex items-center gap-1.5 border-none bg-transparent p-0 text-[13px] font-semibold text-[#574CFF] cursor-pointer hover:text-[#3236e6]"
                      data-cy="bsc-kpi-add-row"
                    >
                      <PlusOutlined className="text-[12px]" />
                      Add KPI
                    </button>
                  </>
                )}
              </Form.List>

              {/* Footer weight point — create-plan style */}
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
