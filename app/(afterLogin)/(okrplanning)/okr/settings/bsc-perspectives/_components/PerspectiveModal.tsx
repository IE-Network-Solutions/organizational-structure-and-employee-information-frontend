'use client';

import React, { useEffect } from 'react';
import { Form, Input, Modal } from 'antd';
import { CloseOutlined, PlusOutlined } from '@ant-design/icons';
import CustomButton from '@/components/common/buttons/customButton';
import { useBscUiStore } from '@/store/uistate/features/bsc';
import {
  useCreateBscKpi,
  useCreateBscPerspective,
  useUpdateBscPerspective,
} from '@/store/server/features/bsc/mutation';
import { useGetBscCycles } from '@/store/server/features/bsc/queries';
import { CycleStatus, TargetLogic } from '@/types/bsc';

const { TextArea } = Input;

type OptionalKpiRow = {
  name?: string;
  description?: string;
};

function hasKpiContent(row?: OptionalKpiRow | null) {
  if (!row) return false;
  return Boolean(row.name?.trim() || row.description?.trim());
}

export default function PerspectiveModal() {
  const [form] = Form.useForm();
  const { perspectiveModalOpen, editingPerspective, closePerspectiveModal } =
    useBscUiStore();
  const { data: configs } = useGetBscCycles();
  const createPerspective = useCreateBscPerspective();
  const updatePerspective = useUpdateBscPerspective();
  const createKpi = useCreateBscKpi();

  useEffect(() => {
    if (!perspectiveModalOpen) return;
    if (editingPerspective) {
      form.setFieldsValue({
        name: editingPerspective.name,
        description: editingPerspective.description || '',
        kpis: [],
      });
    } else {
      form.resetFields();
      form.setFieldsValue({ kpis: [] });
    }
  }, [perspectiveModalOpen, editingPerspective, form]);

  const handleClose = () => {
    form.resetFields();
    closePerspectiveModal();
  };

  const resolveConfigId = () => {
    const open = (configs || []).find((c) => c.status === CycleStatus.Open);
    return open?.id || configs?.[0]?.id || 'library';
  };

  const createOptionalKpis = async (
    perspectiveName: string,
    rows: OptionalKpiRow[] | undefined,
  ) => {
    const filled = (rows || []).filter((row) => row?.name?.trim());
    for (const row of filled) {
      await createKpi.mutateAsync({
        evaluationConfigId: resolveConfigId(),
        name: row.name!.trim(),
        description: row.description?.trim() || null,
        perspective: perspectiveName,
        targetLogic: TargetLogic.HigherBetter,
        measurementUnit: '%',
      });
    }
  };

  const handleSubmit = async () => {
    const values = await form.validateFields();
    const kpiRows: OptionalKpiRow[] = values.kpis || [];
    for (let i = 0; i < kpiRows.length; i += 1) {
      const row = kpiRows[i];
      if (!hasKpiContent(row)) continue;
      if (!row.name?.trim()) {
        form.setFields([
          {
            name: ['kpis', i, 'name'],
            errors: ['KPI name is required'],
          },
        ]);
        return;
      }
    }

    const payload = {
      name: values.name.trim(),
      description: values.description?.trim() || null,
    };

    if (editingPerspective) {
      await updatePerspective.mutateAsync({
        id: editingPerspective.id,
        input: payload,
      });
      await createOptionalKpis(payload.name, kpiRows);
    } else {
      await createPerspective.mutateAsync(payload);
      await createOptionalKpis(payload.name, kpiRows);
    }
    handleClose();
  };

  const saving =
    createPerspective.isLoading ||
    updatePerspective.isLoading ||
    createKpi.isLoading;

  return (
    <Modal
      open={perspectiveModalOpen}
      onCancel={handleClose}
      footer={null}
      centered
      width={560}
      closeIcon={<CloseOutlined />}
      title={editingPerspective ? 'Edit Perspective' : 'Add Perspective'}
      destroyOnClose
      data-cy="bsc-perspective-modal"
    >
      <Form form={form} layout="vertical" className="mt-2">
        <Form.Item
          name="name"
          label="Name"
          rules={[
            { required: true, whitespace: true, message: 'Name is required' },
          ]}
        >
          <Input
            placeholder="e.g. Customer"
            className="h-10"
            data-cy="bsc-perspective-name"
          />
        </Form.Item>
        <Form.Item name="description" label="Description">
          <TextArea
            rows={3}
            placeholder="What this perspective covers"
            data-cy="bsc-perspective-description"
          />
        </Form.Item>

        <div
          className="mb-2 flex items-center justify-between"
          data-cy="bsc-perspective-optional-kpis-header"
        >
          <div>
            <p className="m-0 text-[13px] font-semibold text-[#262626]">
              KPIs <span className="font-normal text-[#8F94A3]">(optional)</span>
            </p>
            <p className="m-0 mt-0.5 text-[12px] text-[#8F94A3]">
              Add measures under this perspective now, or later from the list.
            </p>
          </div>
        </div>

        <Form.List name="kpis">
          {(fields, { add, remove }) => (
            <div className="flex flex-col gap-3 mb-4">
              {fields.map((field, index) => (
                <div
                  key={field.key}
                  className="rounded-xl bg-[#F9FAFB] px-3.5 py-3"
                  data-cy={`bsc-perspective-kpi-row-${field.key}`}
                >
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-[#8F94A3]">
                      KPI {index + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => remove(field.name)}
                      className="border-none bg-transparent p-0 text-[12px] text-[#94A3B8] cursor-pointer hover:text-[#DC2626]"
                      data-cy={`bsc-perspective-kpi-remove-${field.name}`}
                    >
                      Remove
                    </button>
                  </div>
                  <Form.Item
                    name={[field.name, 'name']}
                    label="Name"
                    className="mb-2"
                  >
                    <Input
                      placeholder="KPI name"
                      data-cy={`bsc-perspective-kpi-name-${field.name}`}
                    />
                  </Form.Item>
                  <Form.Item
                    name={[field.name, 'description']}
                    label="Description"
                    className="mb-0"
                  >
                    <TextArea
                      rows={2}
                      placeholder="What this KPI measures"
                      data-cy={`bsc-perspective-kpi-description-${field.name}`}
                    />
                  </Form.Item>
                </div>
              ))}
              <button
                type="button"
                onClick={() => add({})}
                className="inline-flex items-center gap-1.5 border-none bg-transparent p-0 text-[13px] font-semibold text-[#2b54ad] cursor-pointer hover:text-[#3d66c2]"
                data-cy="bsc-perspective-kpi-add-row"
              >
                <PlusOutlined className="text-[12px]" />
                Add KPI
              </button>
            </div>
          )}
        </Form.List>

        <div
          data-cy="settings-bsc-perspectives-components-perspectivemodal-tsx-perspectivemodal-div-91"
          className="flex justify-end gap-3 pt-2"
        >
          <CustomButton
            type="default"
            title="Cancel"
            onClick={handleClose}
            className="h-10 px-6 rounded-lg"
          />
          <CustomButton
            title={editingPerspective ? 'Save' : 'Add Perspective'}
            onClick={handleSubmit}
            loading={saving}
            className="h-10 px-6 rounded-lg"
            data-cy="bsc-perspective-submit"
          />
        </div>
      </Form>
    </Modal>
  );
}
