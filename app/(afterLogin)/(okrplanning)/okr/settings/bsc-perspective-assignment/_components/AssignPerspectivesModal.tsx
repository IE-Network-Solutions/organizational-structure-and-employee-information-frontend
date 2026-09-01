'use client';

import React, { useEffect, useMemo } from 'react';
import { Form, InputNumber, Modal, Select } from 'antd';
import { CloseOutlined, PlusOutlined } from '@ant-design/icons';
import CustomButton from '@/components/common/buttons/customButton';
import { useGetAllPositions } from '@/store/server/features/employees/positions/queries';
import {
  useGetBscCycles,
  useGetBscPerspectiveCatalog,
  useGetBscRolePerspectives,
} from '@/store/server/features/bsc/queries';
import { useSaveBscRolePerspectives } from '@/store/server/features/bsc/mutation';
import { useBscUiStore } from '@/store/uistate/features/bsc';
import { CycleStatus } from '@/types/bsc';
import {
  MAX_PERSPECTIVE_WEIGHT,
  validatePerspectiveWeights,
} from '@/utils/bsc/scoring';

function asList(data: any): any[] {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.items)) return data.items;
  return [];
}

type WeightRow = {
  name?: string;
  weight?: number | null;
};

export default function AssignPerspectivesModal() {
  const [form] = Form.useForm<{
    positionId?: string;
    rows: WeightRow[];
  }>();
  const { assignModalOpen, closeAssignModal, selectedConfigId } =
    useBscUiStore();
  const { data: configs } = useGetBscCycles();
  const { data: catalog } = useGetBscPerspectiveCatalog();
  const { data: allocations } = useGetBscRolePerspectives();
  const { data: positionsData } = useGetAllPositions();
  const savePerspectives = useSaveBscRolePerspectives();

  const evaluationConfigId = useMemo(() => {
    if (selectedConfigId && configs?.some((c) => c.id === selectedConfigId)) {
      return selectedConfigId;
    }
    const open = (configs || []).find((c) => c.status === CycleStatus.Open);
    return open?.id || configs?.[0]?.id || '';
  }, [configs, selectedConfigId]);

  const positionOptions = asList(positionsData).map((p: any) => ({
    value: String(p.id),
    label: p.name || p.positionName || 'Position',
    departmentName: p.departmentName || p.department?.name || null,
  }));
  const catalogNames = (catalog || []).map((item) => item.name);

  const watchedPositionId = Form.useWatch('positionId', form);
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
  const validation = useMemo(
    () => validatePerspectiveWeights(weights),
    [weights],
  );

  useEffect(() => {
    if (!assignModalOpen) return;
    form.resetFields();
    form.setFieldsValue({
      rows: [{ name: undefined, weight: undefined }],
    });
  }, [assignModalOpen, form]);

  useEffect(() => {
    if (!assignModalOpen || !evaluationConfigId || !watchedPositionId) return;
    const position = asList(positionsData).find(
      (p: any) => String(p.id) === watchedPositionId,
    );
    const title = position?.name || position?.positionName || '';
    const existing = (allocations || []).find((row) => {
      if (row.evaluationConfigId !== evaluationConfigId) return false;
      if (row.positionId && row.positionId === watchedPositionId) return true;
      return row.positionTitle.toLowerCase() === title.toLowerCase();
    });
    const rows = existing?.weights
      ? Object.entries(existing.weights)
          .filter(([, weight]) => Number(weight) > 0)
          .map(([name, weight]) => ({ name, weight }))
      : [];
    form.setFieldsValue({
      rows: rows.length ? rows : [{ name: undefined, weight: undefined }],
    });
  }, [
    assignModalOpen,
    evaluationConfigId,
    watchedPositionId,
    allocations,
    positionsData,
    form,
  ]);

  const handleClose = () => {
    form.resetFields();
    closeAssignModal();
  };

  const handleSubmit = async () => {
    if (!evaluationConfigId) return;
    const values = await form.validateFields();
    const nextWeights: Record<string, number> = {};
    for (const row of values.rows || []) {
      if (!row?.name) continue;
      nextWeights[row.name] = Number(row.weight);
    }
    const check = validatePerspectiveWeights(nextWeights);
    if (!check.valid) {
      form.setFields([
        { name: 'rows', errors: [check.message || 'Invalid weights'] },
      ]);
      return;
    }

    const position = positionOptions.find((p) => p.value === values.positionId);
    const positionTitle = position?.label || '';
    const cycle = (configs || []).find((c) => c.id === evaluationConfigId);

    await savePerspectives.mutateAsync({
      evaluationConfigId,
      positionId: values.positionId || null,
      positionTitle,
      departmentName:
        position?.departmentName || cycle?.departmentNames?.[0] || null,
      weights: nextWeights,
    });

    handleClose();
  };

  return (
    <Modal
      open={assignModalOpen}
      onCancel={handleClose}
      footer={null}
      centered
      width={640}
      closeIcon={<CloseOutlined />}
      title="Assign perspectives to a role"
      destroyOnClose
      data-cy="bsc-assign-perspectives-modal"
    >
      <Form form={form} layout="vertical" className="mt-2">
        <Form.Item
          name="positionId"
          label="Role"
          rules={[{ required: true, message: 'Select a role' }]}
        >
          <Select
            placeholder="Select any role from the organization"
            options={positionOptions}
            showSearch
            optionFilterProp="label"
            data-cy="bsc-assign-role"
          />
        </Form.Item>

        <p className="mb-2 text-[13px] font-medium text-[#161A2C]">
          Perspectives
        </p>
        <Form.List name="rows">
          {(fields, { add, remove }) => (
            <>
              <div className="flex flex-col gap-2">
                {fields.map((field) => {
                  const currentName = watchedRows[field.name]?.name;
                  const available = catalogNames.filter(
                    (name) => name === currentName || !selectedNames.has(name),
                  );
                  return (
                    <div
                      key={field.key}
                      className="flex items-start gap-2"
                      data-cy={`bsc-assign-row-${field.key}`}
                    >
                      <Form.Item
                        name={[field.name, 'name']}
                        className="mb-0 flex-1"
                        rules={[
                          { required: true, message: 'Select a perspective' },
                        ]}
                      >
                        <Select
                          placeholder="Perspective"
                          options={available.map((name) => ({
                            value: name,
                            label: name,
                          }))}
                          data-cy={`bsc-assign-perspective-${field.name}`}
                        />
                      </Form.Item>
                      <Form.Item
                        name={[field.name, 'weight']}
                        className="mb-0"
                        rules={[
                          { required: true, message: 'Weight is required' },
                        ]}
                      >
                        <InputNumber
                          min={1}
                          max={MAX_PERSPECTIVE_WEIGHT}
                          placeholder="%"
                          className="w-[88px]"
                          data-cy={`bsc-assign-weight-${field.name}`}
                        />
                      </Form.Item>
                      {fields.length > 1 && (
                        <button
                          type="button"
                          className="mt-1 border-none bg-transparent text-[#8F94A3] cursor-pointer"
                          onClick={() => remove(field.name)}
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
              <button
                type="button"
                onClick={() => add({ name: undefined, weight: undefined })}
                disabled={selectedNames.size >= catalogNames.length}
                className="mt-3 inline-flex items-center gap-1.5 border-none bg-transparent p-0 text-[13px] font-semibold text-[#574CFF] cursor-pointer hover:text-[#3236e6] disabled:opacity-40"
                data-cy="bsc-assign-add-row"
              >
                <PlusOutlined className="text-[12px]" />
                Add perspective
              </button>
            </>
          )}
        </Form.List>

        <p className="mt-3 mb-0 text-[12px] text-[#8F94A3]">
          Weights must total 100%. Each perspective can be at most{' '}
          {MAX_PERSPECTIVE_WEIGHT}%.
          {!validation.valid && watchedRows.some((r) => r?.weight) ? (
            <span className="block mt-1 text-[#DC2626]">
              {validation.message}
            </span>
          ) : null}
        </p>

        <div className="flex justify-end gap-3 mt-6">
          <CustomButton
            type="default"
            title="Cancel"
            onClick={handleClose}
            className="h-10 px-6 rounded-lg"
          />
          <CustomButton
            title="Assign"
            onClick={handleSubmit}
            loading={savePerspectives.isLoading}
            className="h-10 px-8 rounded-lg bg-[#2b54ad] hover:bg-[#3d66c2]"
          />
        </div>
      </Form>
    </Modal>
  );
}
