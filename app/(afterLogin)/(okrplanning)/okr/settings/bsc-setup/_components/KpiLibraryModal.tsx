'use client';

import React, { useEffect } from 'react';
import { Modal, Form, Input, InputNumber } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import CustomButton from '@/components/common/buttons/customButton';
import {
  BscPerspective,
  CreateKpiLibraryInput,
  TargetLogic,
} from '@/types/bsc';
import { useBscUiStore } from '@/store/uistate/features/bsc';
import {
  useCreateBscKpi,
  useUpdateBscKpi,
} from '@/store/server/features/bsc/mutation';

const { TextArea } = Input;

export default function KpiLibraryModal() {
  const [form] = Form.useForm();
  const {
    kpiModalOpen,
    editingKpi,
    closeKpiModal,
    selectedConfigId,
    roleContext,
  } = useBscUiStore();
  const createKpi = useCreateBscKpi();
  const updateKpi = useUpdateBscKpi();

  useEffect(() => {
    if (kpiModalOpen && editingKpi) {
      form.setFieldsValue({
        name: editingKpi.name,
        description: editingKpi.description,
        weight: editingKpi.weight ?? editingKpi.suggestedWeight,
      });
    } else if (kpiModalOpen) {
      form.resetFields();
    }
  }, [kpiModalOpen, editingKpi, form]);

  const handleClose = () => {
    form.resetFields();
    closeKpiModal();
  };

  const handleSubmit = async () => {
    const values = await form.validateFields();
    const evaluationConfigId =
      selectedConfigId ||
      roleContext?.evaluationConfigId ||
      editingKpi?.evaluationConfigId;
    if (!evaluationConfigId) return;

    const payload: CreateKpiLibraryInput = {
      evaluationConfigId,
      name: values.name,
      description: values.description?.trim() || null,
      weight: Number(values.weight),
      suggestedWeight: Number(values.weight),
      perspective: editingKpi?.perspective || BscPerspective.InternalProcess,
      targetLogic: editingKpi?.targetLogic || TargetLogic.HigherBetter,
      measurementUnit: editingKpi?.measurementUnit || '%',
      departmentId: editingKpi?.departmentId || null,
      departmentName:
        editingKpi?.departmentName || roleContext?.departmentName || null,
      positionId:
        editingKpi?.positionId || roleContext?.positionId || null,
      positionTitle:
        editingKpi?.positionTitle || roleContext?.positionTitle || null,
      defaultTarget: editingKpi?.defaultTarget ?? null,
    };
    if (editingKpi) {
      await updateKpi.mutateAsync({ id: editingKpi.id, input: payload });
    } else {
      await createKpi.mutateAsync(payload);
    }
    handleClose();
  };

  return (
    <Modal
      title={editingKpi ? 'Edit KPI' : 'Add KPI'}
      open={kpiModalOpen}
      onCancel={handleClose}
      width={520}
      destroyOnClose
      centered
      closeIcon={<CloseOutlined />}
      data-cy="bsc-kpi-library-modal"
      footer={
        <div className="flex justify-end gap-3">
          <CustomButton
            type="default"
            title="Cancel"
            onClick={handleClose}
            className="h-10 px-6 rounded-lg"
          />
          <CustomButton
            type="primary"
            title="Save"
            loading={createKpi.isLoading || updateKpi.isLoading}
            onClick={handleSubmit}
            className="h-10 px-8 rounded-lg bg-[#2b54ad] hover:bg-[#3d66c2]"
            data-cy="bsc-kpi-library-save"
          />
        </div>
      }
    >
      <Form form={form} layout="vertical" className="mt-2">
        {roleContext?.positionTitle && (
          <p className="mb-3 text-sm text-[#595959]">
            Role: <strong>{roleContext.positionTitle}</strong>
          </p>
        )}
        <Form.Item
          name="name"
          label="Name"
          rules={[{ required: true, message: 'Name is required' }]}
        >
          <Input placeholder="KPI name" />
        </Form.Item>
        <Form.Item
          name="description"
          label="Description"
          rules={[{ required: true, message: 'Description is required' }]}
        >
          <TextArea
            rows={3}
            placeholder="Describe what this KPI measures"
          />
        </Form.Item>
        <Form.Item
          name="weight"
          label="Weight (%)"
          rules={[
            { required: true, message: 'Weight is required' },
            {
              type: 'number',
              min: 1,
              max: 100,
              message: 'Weight must be between 1 and 100',
            },
          ]}
        >
          <InputNumber
            className="w-full"
            min={1}
            max={100}
            placeholder="e.g. 40"
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}
