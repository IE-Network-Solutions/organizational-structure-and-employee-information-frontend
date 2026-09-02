'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  AutoComplete,
  Button,
  Col,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Radio,
  Row,
  Tag,
} from 'antd';
import {
  CloseOutlined,
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import CustomButton from '@/components/common/buttons/customButton';
import ActionButton from '@/components/common/actionButton';
import { useBscUiStore } from '@/store/uistate/features/bsc';
import {
  useCreateBscKpi,
  useDeleteBscKpi,
  useDeleteBscPerspective,
  useUpdateBscKpi,
} from '@/store/server/features/bsc/mutation';
import {
  useGetBscCycles,
  useGetBscKpiLibrary,
  useGetBscPerspectiveCatalog,
} from '@/store/server/features/bsc/queries';
import { CycleStatus, KpiLibraryItem, TargetLogic } from '@/types/bsc';

const { TextArea } = Input;

const METRIC_OPTIONS = [
  { value: '%', label: '%' },
  { value: 'Currency', label: 'Currency' },
  { value: 'Count', label: 'Count' },
  { value: 'Days', label: 'Days' },
  { value: 'Hours', label: 'Hours' },
  { value: 'Ratio', label: 'Ratio' },
  { value: 'Score', label: 'Score' },
  { value: 'Index', label: 'Index' },
  { value: 'Rating (1.0 - 5.0)', label: 'Rating (1.0 - 5.0)' },
];

function targetLogicLabel(logic?: TargetLogic): string {
  if (logic === TargetLogic.LowerBetter) return 'Lower is better';
  if (logic === TargetLogic.Bounded) return 'Bounded';
  return 'Higher is better';
}

export default function PerspectiveKpiModal() {
  const [form] = Form.useForm();
  const [kpiFormOpen, setKpiFormOpen] = useState(false);
  const [editingKpi, setEditingKpi] = useState<KpiLibraryItem | null>(null);
  const {
    viewingPerspectiveKpis,
    closeViewPerspectiveKpis,
    perspectiveKpiModalOpen,
    perspectiveKpiContext,
    closePerspectiveKpiModal,
    openEditPerspective,
  } = useBscUiStore();

  const { data: configs } = useGetBscCycles();
  const { data: kpis, isLoading } = useGetBscKpiLibrary();
  const { data: catalog } = useGetBscPerspectiveCatalog();
  const createKpi = useCreateBscKpi();
  const updateKpi = useUpdateBscKpi();
  const deleteKpi = useDeleteBscKpi();
  const deletePerspective = useDeleteBscPerspective();

  const targetLogic = Form.useWatch('targetLogic', form) as
    | TargetLogic
    | undefined;
  const isBounded = targetLogic === TargetLogic.Bounded;

  const viewing = useMemo(() => {
    if (!viewingPerspectiveKpis) return null;
    return (
      catalog?.find((item) => item.id === viewingPerspectiveKpis.id) ||
      viewingPerspectiveKpis
    );
  }, [catalog, viewingPerspectiveKpis]);

  const open = Boolean(viewing) || perspectiveKpiModalOpen;
  const perspectiveName = viewing?.name || perspectiveKpiContext || '';

  const perspectiveKpis = useMemo(
    () =>
      (kpis || []).filter(
        (kpi) =>
          kpi.perspective.toLowerCase() === perspectiveName.toLowerCase(),
      ),
    [kpis, perspectiveName],
  );

  const closeKpiForm = () => {
    form.resetFields();
    setKpiFormOpen(false);
    setEditingKpi(null);
  };

  const applyDefaultKpiForm = () => {
    form.setFieldsValue({
      targetLogic: TargetLogic.HigherBetter,
      measurementUnit: '%',
      defaultTarget: undefined,
      worstCase: undefined,
      bestCase: undefined,
    });
  };

  useEffect(() => {
    if (!open) {
      closeKpiForm();
      return;
    }
    if (perspectiveKpiModalOpen && !viewing) {
      setEditingKpi(null);
      form.resetFields();
      applyDefaultKpiForm();
      setKpiFormOpen(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, perspectiveKpiModalOpen, viewing]);

  const handleClose = () => {
    closeKpiForm();
    closeViewPerspectiveKpis();
    closePerspectiveKpiModal();
  };

  const startAdd = () => {
    setEditingKpi(null);
    form.resetFields();
    applyDefaultKpiForm();
    setKpiFormOpen(true);
  };

  const startEdit = (kpi: KpiLibraryItem) => {
    setEditingKpi(kpi);
    form.setFieldsValue({
      name: kpi.name,
      description: kpi.description || '',
      targetLogic: kpi.targetLogic || TargetLogic.HigherBetter,
      measurementUnit: kpi.measurementUnit || '%',
      defaultTarget: kpi.defaultTarget ?? undefined,
      worstCase: kpi.worstCase ?? undefined,
      bestCase: kpi.bestCase ?? undefined,
    });
    setKpiFormOpen(true);
  };

  const handleSaveKpi = async () => {
    if (!perspectiveName) return;
    const values = await form.validateFields();
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
      perspective: perspectiveName,
      targetLogic: logic,
      measurementUnit,
      defaultTarget,
      worstCase,
      bestCase,
    };

    if (editingKpi) {
      await updateKpi.mutateAsync({
        id: editingKpi.id,
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

    closeKpiForm();
    if (perspectiveKpiModalOpen && !viewing) {
      closePerspectiveKpiModal();
    }
  };

  const saving = createKpi.isLoading || updateKpi.isLoading;

  const handleEditPerspective = () => {
    if (!viewing) return;
    openEditPerspective(viewing);
  };

  const handleDeletePerspective = async () => {
    if (!viewing || viewing.isSystem) return;
    await deletePerspective.mutateAsync(viewing.id);
    handleClose();
  };

  return (
    <>
      <Modal
        open={open}
        onCancel={handleClose}
        footer={null}
        centered
        width={960}
        closable={false}
        styles={{
          body: {
            minHeight: 520,
            maxHeight: '75vh',
            overflowY: 'auto',
          },
        }}
        title={
          <div
            className="flex items-center gap-2"
            data-cy="bsc-perspective-kpi-modal-title"
          >
            <span className="min-w-0 flex-1 truncate text-[16px] font-semibold text-[#262626]">
              {perspectiveName ? `${perspectiveName} KPIs` : 'KPIs'}
            </span>
            <div className="flex shrink-0 items-center gap-1">
              <Button
                type="text"
                icon={<PlusOutlined />}
                onClick={startAdd}
                className="inline-flex h-8 items-center justify-center gap-1 px-2 text-[13px] font-semibold text-[#2b54ad]"
                data-cy="bsc-perspective-kpi-modal-add"
              >
                Add KPI
              </Button>
              {viewing ? (
                <>
                  <Button
                    type="text"
                    icon={<EditOutlined />}
                    onClick={handleEditPerspective}
                    className="inline-flex h-8 w-8 items-center justify-center"
                    data-cy="bsc-perspective-modal-edit"
                  />
                  {!viewing.isSystem ? (
                    <Popconfirm
                      title="Delete this perspective?"
                      okText="Delete"
                      onConfirm={handleDeletePerspective}
                    >
                      <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        className="inline-flex h-8 w-8 items-center justify-center"
                        data-cy="bsc-perspective-modal-delete"
                      />
                    </Popconfirm>
                  ) : null}
                </>
              ) : null}
              <Button
                type="text"
                icon={<CloseOutlined />}
                onClick={handleClose}
                className="inline-flex h-8 w-8 items-center justify-center"
                aria-label="Close"
                data-cy="bsc-perspective-modal-close"
              />
            </div>
          </div>
        }
        destroyOnClose
        data-cy="bsc-perspective-kpi-modal"
      >
        <div className="mt-2" data-cy="bsc-perspective-kpi-modal-body">
          {viewing?.description ? (
            <p
              className="mb-4 text-sm text-[#595959]"
              data-cy="bsc-perspective-kpi-modal-description"
            >
              {viewing.description}
            </p>
          ) : null}

          {isLoading ? (
            <p className="py-8 text-center text-[#8F94A3]">Loading…</p>
          ) : perspectiveKpis.length === 0 ? (
            <p
              className="m-0 py-6 text-center text-[13px] text-[#94A3B8]"
              data-cy="bsc-perspective-kpi-modal-empty"
            >
              No KPIs under this perspective yet.
            </p>
          ) : (
            <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {perspectiveKpis.map((kpi) => (
                <div
                  key={kpi.id}
                  className="flex min-h-[160px] h-full flex-col rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-4"
                  data-cy={`bsc-perspective-kpi-${kpi.id}`}
                >
                  <div className="mb-3 flex items-start justify-between gap-2">
                    <p className="m-0 min-w-0 flex-1 text-[14px] font-medium leading-5 text-[#262626]">
                      {kpi.name}
                    </p>
                    <div
                      className="shrink-0"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ActionButton
                        id={`bsc-perspective-kpi-${kpi.id}`}
                        triggerSizePx={28}
                        moreMenuIconPx={18}
                        onEdit={() => startEdit(kpi)}
                        onDelete={() => deleteKpi.mutate(kpi.id)}
                      />
                    </div>
                  </div>
                  {kpi.description ? (
                    <p className="m-0 mb-3 flex-1 line-clamp-4 text-[12px] leading-5 text-[#8F94A3]">
                      {kpi.description}
                    </p>
                  ) : (
                    <div className="flex-1" />
                  )}
                  <div className="mt-auto flex flex-wrap items-center gap-1.5">
                    <Tag className="m-0 h-5 rounded border border-[#91caff] bg-[#e6f4ff] px-1.5 text-[11px] font-normal leading-5 text-[#1677ff]">
                      {kpi.measurementUnit || '—'}
                    </Tag>
                    <Tag className="m-0 h-5 rounded border border-[#91caff] bg-[#e6f4ff] px-1.5 text-[11px] font-normal leading-5 text-[#1677ff]">
                      {targetLogicLabel(kpi.targetLogic)}
                    </Tag>
                    {kpi.defaultTarget != null ? (
                      <Tag className="m-0 h-5 rounded border border-[#91caff] bg-[#e6f4ff] px-1.5 text-[11px] font-normal leading-5 text-[#1677ff]">
                        Target {kpi.defaultTarget}
                      </Tag>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Modal>

      <Modal
        open={kpiFormOpen}
        onCancel={closeKpiForm}
        footer={null}
        centered
        width={560}
        destroyOnClose
        zIndex={1100}
        closeIcon={<CloseOutlined />}
        title={editingKpi ? 'Edit KPI' : 'Add KPI'}
        data-cy="bsc-perspective-kpi-form-modal"
      >
        <Form form={form} layout="vertical" className="mt-2">
          {perspectiveName ? (
            <p className="mb-3 text-sm text-[#595959]">
              Perspective: <strong>{perspectiveName}</strong>
            </p>
          ) : null}
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
              data-cy="bsc-perspective-kpi-modal-name"
            />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <TextArea
              rows={3}
              placeholder="Describe what this KPI measures"
              data-cy="bsc-perspective-kpi-modal-description-input"
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
              data-cy="bsc-perspective-kpi-target-logic"
            >
              <Radio value={TargetLogic.HigherBetter}>Higher is better</Radio>
              <Radio value={TargetLogic.LowerBetter}>Lower is better</Radio>
              <Radio value={TargetLogic.Bounded}>
                Bounded (within a range)
              </Radio>
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
                  options={METRIC_OPTIONS}
                  placeholder="e.g. %, Days, Score"
                  filterOption={(input, option) =>
                    String(option?.label || option?.value || '')
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                  data-cy="bsc-perspective-kpi-metric"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="defaultTarget" label="Default target">
                <InputNumber
                  className="w-full"
                  placeholder="e.g. 40 (optional)"
                  data-cy="bsc-perspective-kpi-target"
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
                  rules={[
                    { required: true, message: 'Worst case is required' },
                  ]}
                >
                  <InputNumber
                    className="w-full"
                    placeholder="Lower bound"
                    data-cy="bsc-perspective-kpi-worst"
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
                    placeholder="Upper bound"
                    data-cy="bsc-perspective-kpi-best"
                  />
                </Form.Item>
              </Col>
            </Row>
          ) : null}

          <div
            className="flex justify-end gap-3 pt-2"
            data-cy="bsc-perspective-kpi-modal-actions"
          >
            <CustomButton
              type="default"
              title="Cancel"
              onClick={closeKpiForm}
              className="h-10 px-6 rounded-lg"
            />
            <CustomButton
              title={editingKpi ? 'Save' : 'Add KPI'}
              onClick={handleSaveKpi}
              loading={saving}
              className="h-10 px-6 rounded-lg"
              data-cy="bsc-perspective-kpi-modal-submit"
            />
          </div>
        </Form>
      </Modal>
    </>
  );
}
