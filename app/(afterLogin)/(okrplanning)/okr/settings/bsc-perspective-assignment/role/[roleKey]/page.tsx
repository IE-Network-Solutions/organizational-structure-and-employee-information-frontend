'use client';

import React, { useEffect, useMemo } from 'react';
import { Button, Form, InputNumber, Select, Tooltip, message } from 'antd';
import {
  CloseCircleFilled,
  LeftOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { useParams, useRouter } from 'next/navigation';
import {
  useGetBscCycles,
  useGetBscKpiLibrary,
  useGetBscPerspectiveCatalog,
  useGetBscRolePerspective,
  useGetBscRolePerspectives,
} from '@/store/server/features/bsc/queries';
import { useSaveBscRolePerspectives } from '@/store/server/features/bsc/mutation';
import {
  MAX_PERSPECTIVE_WEIGHT,
  validatePerspectiveWeights,
} from '@/utils/bsc/scoring';
import {
  buildRoleList,
  decodeRoleSlug,
} from '../../../bsc-setup/_utils/roleList';

type WeightRow = {
  name?: string;
  weight?: number | null;
};

export default function BscPerspectiveAssignmentRolePage() {
  const [form] = Form.useForm<{ rows: WeightRow[] }>();
  const params = useParams();
  const router = useRouter();
  const roleKey = String(params?.roleKey || '');

  const { data: catalog, isLoading: catalogLoading } =
    useGetBscPerspectiveCatalog();
  const { data: configs } = useGetBscCycles();
  const { data: allKpis, isLoading: kpisLoading } = useGetBscKpiLibrary();
  const { data: allocations } = useGetBscRolePerspectives();
  const savePerspectives = useSaveBscRolePerspectives();

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

  const { data: allocation, isLoading: allocationLoading } =
    useGetBscRolePerspective(configId, role?.positionId || null, roleTitle);

  const watchedRows: WeightRow[] = Form.useWatch('rows', form) || [];
  const selectedNames = useMemo(
    () => new Set(watchedRows.map((row) => row?.name).filter(Boolean)),
    [watchedRows],
  );
  const weights = useMemo(() => {
    const map: Record<string, number> = {};
    for (const row of watchedRows) {
      if (!row?.name) continue;
      map[row.name] = Number(row.weight || 0);
    }
    return map;
  }, [watchedRows]);
  const roundedTotal = Math.round(
    Object.values(weights).reduce((sum, value) => sum + value, 0),
  );
  const validation = useMemo(
    () => validatePerspectiveWeights(weights),
    [weights],
  );
  const weightIncomplete = !validation.valid;
  const weightTone =
    roundedTotal === 100
      ? 'text-[#059669]'
      : roundedTotal > 100
        ? 'text-[#DC2626]'
        : 'text-[#D97706]';

  const loading = kpisLoading || allocationLoading || catalogLoading;
  const catalogNames = (catalog || []).map((item) => item.name);

  useEffect(() => {
    if (loading) return;
    const assigned = allocation?.weights
      ? Object.entries(allocation.weights)
          .filter(([, weight]) => Number(weight) > 0)
          .map(([name, weight]) => ({ name, weight }))
      : [];
    form.setFieldsValue({
      rows: assigned.length
        ? assigned
        : [{ name: undefined, weight: undefined }],
    });
  }, [loading, roleKey, configId, allocation, form]);

  const handleSave = async () => {
    if (weightIncomplete) {
      message.info({
        content:
          validation.message ||
          'Assigned perspective weights must total exactly 100% before you save.',
        duration: 4,
      });
      return;
    }
    const values = await form.validateFields();
    const nextWeights: Record<string, number> = {};
    for (const row of values.rows || []) {
      if (!row?.name) continue;
      nextWeights[row.name] = Number(row.weight);
    }
    await savePerspectives.mutateAsync({
      evaluationConfigId: configId,
      positionId: role?.positionId || null,
      positionTitle: roleTitle,
      departmentName: role?.departmentNames?.[0] || null,
      weights: nextWeights,
    });
  };

  return (
    <div className="w-full" data-cy="bsc-perspective-assignment-detail">
      <div
        data-cy="bsc-perspective-assignment-role-rolekey-page-tsx-page-div-152"
        className="overflow-hidden rounded-xl border border-[#F1F2F6] bg-white min-h-[400px]"
      >
        <div
          className="flex flex-wrap items-center justify-between gap-3 border-b border-[#F1F2F6] bg-[#FAFBFC] px-4 py-3 md:px-6 md:py-4"
          data-cy="bsc-assignment-header"
        >
          <div
            data-cy="bsc-perspective-assignment-role-rolekey-page-tsx-page-div-157"
            className="flex min-w-0 items-center gap-2 md:gap-3"
          >
            <button
              type="button"
              onClick={() =>
                router.push('/okr/settings/bsc-perspective-assignment')
              }
              className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg text-[#64748B] transition-colors hover:bg-white hover:text-[#574CFF] hover:shadow-sm"
              aria-label="Back to assignment"
              data-cy="bsc-assignment-back"
            >
              <LeftOutlined className="text-[14px]" />
            </button>
            <div
              data-cy="bsc-perspective-assignment-role-rolekey-page-tsx-page-div-169"
              className="min-w-0"
            >
              <p
                data-cy="bsc-perspective-assignment-role-rolekey-page-tsx-page-p-170"
                className="m-0 truncate text-[12px] font-semibold leading-snug text-[#161A2C] md:text-sm"
              >
                {roleTitle}
              </p>
              {!!role?.departmentNames?.length && (
                <p
                  data-cy="bsc-perspective-assignment-role-rolekey-page-tsx-page-p-174"
                  className="m-0 mt-0.5 truncate text-[11px] text-[#8F94A3]"
                >
                  {role.departmentNames.join(' · ')}
                </p>
              )}
            </div>
          </div>

          <div
            data-cy="bsc-perspective-assignment-role-rolekey-page-tsx-page-div-181"
            className="flex min-w-0 flex-shrink-0 flex-wrap items-center justify-end gap-2 md:gap-3"
          >
            <span
              className="whitespace-nowrap text-[12px] tabular-nums text-[#475569] md:text-sm"
              data-cy="bsc-assignment-weight-summary"
            >
              <span
                data-cy="bsc-perspective-assignment-role-rolekey-page-tsx-page-span-186"
                className={`text-[18px] font-extrabold md:text-[20px] ${weightTone}`}
              >
                {roundedTotal}
              </span>
              <span
                data-cy="bsc-perspective-assignment-role-rolekey-page-tsx-page-span-191"
                className="text-[13px] font-medium text-[#94A3B8] md:text-[14px]"
              >
                {' '}
                / 100
              </span>
            </span>
            <Tooltip
              title={
                weightIncomplete
                  ? validation.message ||
                    'Total weight must equal 100 before you can save.'
                  : ''
              }
            >
              <Button
                type="primary"
                loading={savePerspectives.isLoading}
                disabled={weightIncomplete || !configId}
                onClick={handleSave}
                className="!m-0 !h-9 !min-h-9 !w-auto !min-w-0 rounded-lg !border-[#1E40AF] !bg-[#1E40AF] !px-3.5 text-[12px] font-semibold !text-white hover:!border-[#1E3A8A] hover:!bg-[#1E3A8A] md:!h-10 md:!min-h-10 md:!px-5 md:text-[13px]"
                data-cy="bsc-assignment-save"
              >
                Save Assignment
              </Button>
            </Tooltip>
          </div>
        </div>

        <div
          data-cy="bsc-perspective-assignment-role-rolekey-page-tsx-page-div-218"
          className="px-4 py-4 md:px-6 md:py-5"
        >
          {loading ? (
            <div
              data-cy="bsc-perspective-assignment-role-rolekey-page-tsx-page-div-220"
              className="py-16 text-center text-[#94A3B8]"
            >
              Loading…
            </div>
          ) : (
            <Form
              form={form}
              layout="vertical"
              requiredMark={false}
              className="[&_.ant-form-item-explain-error]:text-[11px]"
            >
              <Form.List name="rows">
                {(fields, { add, remove }) => (
                  <>
                    <div
                      data-cy="bsc-perspective-assignment-role-rolekey-page-tsx-page-div-231"
                      className="rounded-xl bg-[#F9FAFB] px-3.5 py-3 md:px-4 md:py-4"
                    >
                      <div
                        data-cy="bsc-perspective-assignment-role-rolekey-page-tsx-page-div-232"
                        className="mb-2 hidden gap-3 sm:flex sm:items-center"
                      >
                        <div
                          data-cy="bsc-perspective-assignment-role-rolekey-page-tsx-page-div-233"
                          className="min-w-0 flex-1 text-xs text-gray-500"
                        >
                          Perspective
                        </div>
                        <div
                          data-cy="bsc-perspective-assignment-role-rolekey-page-tsx-page-div-236"
                          className="w-[88px] text-xs text-gray-500"
                        >
                          Weight
                        </div>
                        <div
                          data-cy="bsc-perspective-assignment-role-rolekey-page-tsx-page-div-239"
                          className="w-5"
                        />
                      </div>
                      <div
                        data-cy="bsc-perspective-assignment-role-rolekey-page-tsx-page-div-241"
                        className="flex flex-col gap-3"
                      >
                        {fields.map((field) => {
                          const currentName = watchedRows[field.name]?.name;
                          const available = catalogNames.filter(
                            (name) =>
                              name === currentName || !selectedNames.has(name),
                          );
                          const value = Math.round(
                            weights[currentName || ''] || 0,
                          );
                          const overCap = value > MAX_PERSPECTIVE_WEIGHT;
                          return (
                            <div
                              key={field.key}
                              className="flex flex-col gap-1"
                              data-cy={`bsc-assignment-row-${field.key}`}
                            >
                              <div
                                data-cy="bsc-perspective-assignment-role-rolekey-page-tsx-page-div-258"
                                className="flex flex-col gap-3 sm:flex-row sm:items-center"
                              >
                                <div
                                  data-cy="bsc-perspective-assignment-role-rolekey-page-tsx-page-div-259"
                                  className="min-w-0 flex-1"
                                >
                                  <div
                                    data-cy="bsc-perspective-assignment-role-rolekey-page-tsx-page-div-260"
                                    className="mb-1 text-xs text-gray-500 sm:hidden"
                                  >
                                    Perspective
                                  </div>
                                  <Form.Item
                                    name={[field.name, 'name']}
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
                                      options={available.map((name) => ({
                                        value: name,
                                        label: name,
                                      }))}
                                      className="w-full"
                                      data-cy={`bsc-assignment-perspective-${field.name}`}
                                    />
                                  </Form.Item>
                                </div>
                                <div data-cy="bsc-perspective-assignment-role-rolekey-page-tsx-page-div-284">
                                  <div
                                    data-cy="bsc-perspective-assignment-role-rolekey-page-tsx-page-div-285"
                                    className="mb-1 text-xs text-gray-500 sm:hidden"
                                  >
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
                                        validator: (rule, val) => {
                                          if (
                                            val !== undefined &&
                                            val !== null &&
                                            val <= 0
                                          ) {
                                            return Promise.reject(
                                              new Error(
                                                'Weight must be greater than 0',
                                              ),
                                            );
                                          }
                                          if (val > MAX_PERSPECTIVE_WEIGHT) {
                                            return Promise.reject(
                                              new Error(
                                                `Cannot exceed ${MAX_PERSPECTIVE_WEIGHT}%`,
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
                                      max={MAX_PERSPECTIVE_WEIGHT}
                                      placeholder="0"
                                      className="w-[88px] text-xs h-10 [&_.ant-input-number]:h-full [&_.ant-input-number-input-wrap]:h-full [&_.ant-input-number-input-wrap]:flex [&_.ant-input-number-input-wrap]:items-center [&_.ant-input-number-input]:h-full"
                                      data-cy={`bsc-assignment-weight-${field.name}`}
                                    />
                                  </Form.Item>
                                </div>
                                <CloseCircleFilled
                                  className={`text-[#3D41FF] ${
                                    fields.length <= 1
                                      ? 'opacity-30 cursor-not-allowed'
                                      : 'cursor-pointer hover:text-[#3236e6]'
                                  }`}
                                  style={{ fontSize: 20 }}
                                  onClick={() => {
                                    if (fields.length <= 1) return;
                                    remove(field.name);
                                  }}
                                  data-cy={`bsc-assignment-remove-${field.name}`}
                                />
                              </div>
                              {overCap && (
                                <p
                                  data-cy="bsc-perspective-assignment-role-rolekey-page-tsx-page-p-345"
                                  className="m-0 text-[12px] text-[#DC2626]"
                                >
                                  Max {MAX_PERSPECTIVE_WEIGHT}% per perspective
                                </p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        add({ name: undefined, weight: undefined })
                      }
                      disabled={selectedNames.size >= catalogNames.length}
                      className="mt-4 inline-flex items-center gap-1.5 border-none bg-transparent p-0 text-[13px] font-semibold text-[#574CFF] cursor-pointer hover:text-[#3236e6] disabled:opacity-40 disabled:cursor-not-allowed"
                      data-cy="bsc-assignment-add-row"
                    >
                      <PlusOutlined className="text-[12px]" />
                      Assign perspective
                    </button>
                  </>
                )}
              </Form.List>

              <div
                className="mt-6 flex flex-wrap items-center justify-end gap-3 border-t border-[#F1F2F6] pt-4"
                data-cy="bsc-assignment-weight-footer"
              >
                <span
                  data-cy="bsc-perspective-assignment-role-rolekey-page-tsx-page-span-375"
                  className="text-sm font-medium text-[#161A2C] whitespace-nowrap"
                >
                  Weight Point:{' '}
                  <span
                    data-cy="bsc-perspective-assignment-role-rolekey-page-tsx-page-span-377"
                    className={`font-bold ${weightTone}`}
                  >
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
