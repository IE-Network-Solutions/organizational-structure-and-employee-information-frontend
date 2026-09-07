'use client';

import React, { useEffect, useMemo } from 'react';
import {
  AutoComplete,
  Col,
  Form,
  Input,
  InputNumber,
  Modal,
  Radio,
  Row,
  Select,
} from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import CustomButton from '@/components/common/buttons/customButton';
import { useBscUiStore } from '@/store/uistate/features/bsc';
import {
  useCreateBscKpi,
  useUpdateBscKpi,
} from '@/store/server/features/bsc/mutation';
import {
  useGetBscCycles,
  useGetBscPerspectiveCatalog,
} from '@/store/server/features/bsc/queries';
import { CycleStatus, TargetLogic } from '@/types/bsc';
import { METRIC_UNIT_OPTIONS } from '@/utils/bsc/measurementUnit';

const { TextArea } = Input;

export default function KpiCatalogFormModal() {
  const [form] = Form.useForm();
  const { catalogKpiFormOpen, catalogEditingKpi, closeCatalogKpiForm } =
    useBscUiStore();
  const { data: configs } = useGetBscCycles();
  const { data: catalog } = useGetBscPerspectiveCatalog();
  const createKpi = useCreateBscKpi();
  const updateKpi = useUpdateBscKpi();

  const targetLogic = Form.useWatch('targetLogic', form) as
    | TargetLogic
    | undefined;
  const isBounded = targetLogic === TargetLogic.Bounded;

  const perspectiveOptions = useMemo(
    () =>
      (catalog || []).map((item) => ({
        value: item.name,
        label: item.name,
      })),
    [catalog],
  );

  useEffect(() => {
    if (!catalogKpiFormOpen) return;
    if (catalogEditingKpi) {
      form.setFieldsValue({
        perspective: catalogEditingKpi.perspective,
        name: catalogEditingKpi.name,
        description: catalogEditingKpi.description || '',
        targetLogic: catalogEditingKpi.targetLogic || TargetLogic.HigherBetter,
        measurementUnit: catalogEditingKpi.measurementUnit || '%',
        defaultTarget: catalogEditingKpi.defaultTarget ?? undefined,
        worstCase: catalogEditingKpi.worstCase ?? undefined,
        bestCase: catalogEditingKpi.bestCase ?? undefined,
      });
    } else {
      form.resetFields();
      form.setFieldsValue({
        targetLogic: TargetLogic.HigherBetter,
        measurementUnit: '%',
      });
    }
  }, [catalogKpiFormOpen, catalogEditingKpi, form]);

  const handleClose = () => {
    form.resetFields();
    closeCatalogKpiForm();
  };

  const handleSubmit = async () => {
    const values = await form.validateFields();
    const perspective = String(values.perspective || '').trim();
    const name = values.name.trim();
    const description = values.description?.trim() || null;
    const logic = values.targetLogic as TargetLogic;
    const measurementUnit = String(values.measurementUnit || '').trim();
    const defaultTarget =
      values.defaultTarget == null ? null : Number(values.defaultTarget);
    const worstCase =
      logic === TargetLogic.Bounded && values.worstCase != null
        ? Number(values.worstCase)
        : null;
    const bestCase =
      logic === TargetLogic.Bounded && values.bestCase != null
        ? Number(values.bestCase)
        : null;

    const metricFields = {
      name,
      description,
      perspective,
      targetLogic: logic,
      measurementUnit,
      defaultTarget,
      worstCase,
      bestCase,
    };

    if (catalogEditingKpi) {
      await updateKpi.mutateAsync({
        id: catalogEditingKpi.id,
        input: metricFields,
      });
    } else {
      const openConfig = (configs || []).find(
        (c) => c.status === CycleStatus.Open,
      );
      const evaluationConfigId =
        openConfig?.id || configs?.[0]?.id || 'library';
      await createKpi.mutateAsync({
        evaluationConfigId,
        ...metricFields,
      });
    }
    handleClose();
  };

  const saving = createKpi.isLoading || updateKpi.isLoading;

  return (
    <Modal
      open={catalogKpiFormOpen}
      onCancel={handleClose}
      footer={null}
      centered
      width={560}
      destroyOnClose
      zIndex={1100}
      closeIcon={<CloseOutlined />}
      title={catalogEditingKpi ? 'Edit KPI' : 'Add KPI'}
      data-cy="bsc-kpi-catalog-form-modal"
    >
      <Form form={form} layout="vertical" className="mt-2">
        <Form.Item
          name="perspective"
          label="Perspective"
          rules={[{ required: true, message: 'Select a perspective' }]}
          extra={
            !perspectiveOptions.length
              ? 'Define perspectives under BSC → Settings first.'
              : undefined
          }
        >
          <Select
            placeholder="Select perspective"
            options={perspectiveOptions}
            disabled={!perspectiveOptions.length}
            showSearch
            optionFilterProp="label"
            data-cy="bsc-kpi-catalog-perspective"
          />
        </Form.Item>
        <Form.Item
          name="name"
          label="Name"
          rules={[
            {
              required: true,
              whitespace: true,
              message: 'Name is required',
            },
          ]}
        >
          <Input
            placeholder="KPI name"
            className="h-10"
            data-cy="bsc-kpi-catalog-name"
          />
        </Form.Item>
        <Form.Item name="description" label="Description">
          <TextArea
            rows={3}
            placeholder="Describe what this KPI measures"
            data-cy="bsc-kpi-catalog-description"
          />
        </Form.Item>
        <Form.Item
          name="targetLogic"
          label="Target direction"
          rules={[
            { required: true, message: 'Select higher or lower is better' },
          ]}
        >
          <Radio.Group
            className="flex flex-col gap-2"
            data-cy="bsc-kpi-catalog-target-logic"
          >
            <Radio value={TargetLogic.HigherBetter}>Higher is better</Radio>
            <Radio value={TargetLogic.LowerBetter}>Lower is better</Radio>
            <Radio value={TargetLogic.Bounded}>Bounded (within a range)</Radio>
          </Radio.Group>
        </Form.Item>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="measurementUnit"
              label="Metric / unit"
              rules={[
                {
                  required: true,
                  whitespace: true,
                  message: 'Select or enter a metric',
                },
              ]}
            >
              <AutoComplete
                options={METRIC_UNIT_OPTIONS}
                placeholder="e.g. Percentage, Days, Score"
                filterOption={(input, option) =>
                  String(option?.label || option?.value || '')
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
                data-cy="bsc-kpi-catalog-metric"
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="defaultTarget" label="Default target">
              <InputNumber
                className="w-full"
                placeholder="Optional"
                data-cy="bsc-kpi-catalog-target"
              />
            </Form.Item>
          </Col>
        </Row>
        {isBounded ? (
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="worstCase"
                label="Worst case"
                rules={[{ required: true, message: 'Worst case is required' }]}
              >
                <InputNumber
                  className="w-full"
                  data-cy="bsc-kpi-catalog-worst"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="bestCase"
                label="Best case"
                rules={[{ required: true, message: 'Best case is required' }]}
              >
                <InputNumber
                  className="w-full"
                  data-cy="bsc-kpi-catalog-best"
                />
              </Form.Item>
            </Col>
          </Row>
        ) : null}
        <div
          data-cy="kpicatalogformmodal-div-267"
          className="flex justify-end gap-3 pt-2"
        >
          <CustomButton
            type="default"
            title="Cancel"
            onClick={handleClose}
            className="h-10 px-6 rounded-lg"
          />
          <CustomButton
            type="primary"
            title="Save"
            loading={saving}
            onClick={handleSubmit}
            className="h-10 px-8 rounded-lg bg-[#2b54ad] hover:bg-[#3d66c2]"
            data-cy="bsc-kpi-catalog-save"
          />
        </div>
      </Form>
    </Modal>
  );
}
