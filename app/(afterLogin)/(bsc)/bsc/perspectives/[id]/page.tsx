'use client';

import React, { useMemo, useState } from 'react';
import {
  AutoComplete,
  Button,
  Col,
  Dropdown,
  Empty,
  Form,
  Input,
  InputNumber,
  Modal,
  Progress,
  Radio,
  Row,
  Tag,
} from 'antd';
import type { MenuProps } from 'antd';
import {
  EllipsisOutlined,
  LeftOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { useParams, useRouter } from 'next/navigation';
import CustomBreadcrumb from '@/components/common/breadCramp';
import CustomButton from '@/components/common/buttons/customButton';
import BscSearchInput from '@/app/(afterLogin)/(bsc)/bsc/_components/BscSearchInput';
import {
  useCreateBscKpi,
  useDeleteBscKpi,
  useUpdateBscKpi,
} from '@/store/server/features/bsc/mutation';
import {
  useGetBscCycles,
  useGetBscKpiLibrary,
  useGetBscPerspectiveCatalog,
  useGetBscScorecards,
} from '@/store/server/features/bsc/queries';
import { useBscUiStore } from '@/store/uistate/features/bsc';
import { CycleStatus, KpiLibraryItem, TargetLogic } from '@/types/bsc';
import {
  formatScore,
  latestScorecardsByEmployee,
  perspectiveKpiProgressList,
  type PerspectiveKpiProgress,
} from '@/utils/bsc/rollup';

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

export default function BscPerspectiveDetailPage() {
  const router = useRouter();
  const params = useParams();
  const perspectiveId = decodeURIComponent(String(params?.id || ''));
  const setScorecardTab = useBscUiStore((s) => s.setScorecardTab);

  const [search, setSearch] = useState('');
  const [form] = Form.useForm();
  const [kpiFormOpen, setKpiFormOpen] = useState(false);
  const [editingKpi, setEditingKpi] = useState<KpiLibraryItem | null>(null);

  const { data: catalog, isLoading: catalogLoading } =
    useGetBscPerspectiveCatalog();
  const { data: kpis, isLoading: kpisLoading } = useGetBscKpiLibrary();
  const { data: scorecards, isLoading: scorecardsLoading } =
    useGetBscScorecards();
  const { data: configs } = useGetBscCycles();
  const createKpi = useCreateBscKpi();
  const updateKpi = useUpdateBscKpi();
  const deleteKpi = useDeleteBscKpi();

  const targetLogic = Form.useWatch('targetLogic', form) as
    | TargetLogic
    | undefined;
  const isBounded = targetLogic === TargetLogic.Bounded;

  const perspective = useMemo(
    () => (catalog || []).find((item) => item.id === perspectiveId) || null,
    [catalog, perspectiveId],
  );

  const latest = useMemo(
    () => latestScorecardsByEmployee(scorecards),
    [scorecards],
  );

  const libraryById = useMemo(() => {
    const map = new Map<string, KpiLibraryItem>();
    for (const kpi of kpis || []) map.set(kpi.id, kpi);
    return map;
  }, [kpis]);

  const perspectiveKpis = useMemo(() => {
    if (!perspective) return [];
    return (kpis || [])
      .filter((kpi) => kpi.perspective === perspective.name)
      .map((kpi) => ({
        id: kpi.id,
        name: kpi.name,
        measurementUnit: kpi.measurementUnit,
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [kpis, perspective]);

  const kpiRows = useMemo(() => {
    if (!perspective) return [];
    return perspectiveKpiProgressList(latest, perspectiveKpis);
  }, [latest, perspective, perspectiveKpis]);

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return kpiRows;
    return kpiRows.filter(
      (row) =>
        row.kpiName.toLowerCase().includes(q) ||
        (row.measurementUnit || '').toLowerCase().includes(q),
    );
  }, [kpiRows, search]);

  const loading = catalogLoading || kpisLoading || scorecardsLoading;

  const backToKpis = () => {
    setScorecardTab('kpis');
    router.push('/bsc/my-scorecard');
  };

  const openKpi = (row: PerspectiveKpiProgress) => {
    router.push(
      `/bsc/kpis/${encodeURIComponent(row.kpiLibraryId)}?perspective=${encodeURIComponent(perspectiveId)}`,
    );
  };

  const closeKpiForm = () => {
    form.resetFields();
    setKpiFormOpen(false);
    setEditingKpi(null);
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

  const startAdd = () => {
    if (!perspective) return;
    setEditingKpi(null);
    form.resetFields();
    form.setFieldsValue({
      targetLogic: TargetLogic.HigherBetter,
      measurementUnit: '%',
    });
    setKpiFormOpen(true);
  };

  const handleSaveKpi = async () => {
    if (!perspective) return;
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
      perspective: perspective.name,
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
  };

  const saving = createKpi.isLoading || updateKpi.isLoading;

  const menuFor = (row: PerspectiveKpiProgress): MenuProps['items'] => {
    const kpi = libraryById.get(row.kpiLibraryId);
    return [
      {
        key: 'edit',
        label: 'Edit',
        onClick: ({ domEvent }) => {
          domEvent.stopPropagation();
          if (kpi) startEdit(kpi);
        },
      },
      {
        key: 'delete',
        danger: true,
        label: 'Delete',
        onClick: ({ domEvent }) => {
          domEvent.stopPropagation();
          Modal.confirm({
            title: 'Delete this KPI?',
            okText: 'Delete',
            okButtonProps: { danger: true },
            cancelText: 'Cancel',
            onOk: async () => {
              await deleteKpi.mutateAsync(row.kpiLibraryId);
            },
          });
        },
      },
    ];
  };

  return (
    <div className="w-full" data-cy="bsc-perspective-detail-page">
      <CustomBreadcrumb
        title={perspective?.name || 'Perspective'}
        subtitle={
          perspective?.description ||
          'Average progress and KPIs in this perspective'
        }
      />

      <div
        className="mb-4 flex flex-wrap items-center justify-between gap-3"
        data-cy="bsc-perspective-detail-toolbar"
      >
        <Button
          type="text"
          icon={<LeftOutlined />}
          onClick={backToKpis}
          className="!px-0 text-[#595959]"
          data-cy="bsc-perspective-detail-back"
        >
          KPIs
        </Button>
        <div
          className="flex flex-wrap items-center gap-2"
          data-cy="bsc-perspective-detail-actions"
        >
          <BscSearchInput
            placeholder="Search KPIs"
            value={search}
            onChange={setSearch}
            data-cy="bsc-perspective-kpi-search"
          />
          {perspective ? (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              className="bg-[#2b54ad]"
              onClick={startAdd}
              data-cy="bsc-perspective-add-kpi"
            >
              Add KPI
            </Button>
          ) : null}
        </div>
      </div>

      {loading ? (
        <div
          className="py-16 text-center text-gray-400"
          data-cy="bsc-perspective-detail-loading"
        >
          Loading…
        </div>
      ) : !perspective ? (
        <div className="py-12" data-cy="bsc-perspective-detail-missing">
          <Empty description="Perspective not found" />
        </div>
      ) : !filteredRows.length ? (
        <div className="py-12" data-cy="bsc-perspective-kpi-empty">
          <Empty
            description={
              search.trim()
                ? 'No KPIs match your search'
                : 'No KPIs in this perspective yet'
            }
          />
        </div>
      ) : (
        <div
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
          data-cy="bsc-perspective-kpi-grid"
        >
          {filteredRows.map((row) => {
            const percent = row.evaluatedCount ? row.averageScore : 0;
            return (
              <button
                key={row.kpiLibraryId}
                type="button"
                onClick={() => openKpi(row)}
                className="flex min-h-[120px] flex-col rounded-[10px] border border-[#E5E7EB] bg-[#F9FAFB] p-4 text-left transition-colors hover:bg-[#F3F4F6] cursor-pointer"
                data-cy={`bsc-perspective-kpi-card-${row.kpiLibraryId}`}
              >
                <div
                  className="flex items-start gap-2"
                  data-cy={`bsc-perspective-kpi-card-header-${row.kpiLibraryId}`}
                >
                  <p
                    className="m-0 min-w-0 flex-1 line-clamp-2 text-[13px] font-semibold leading-5 text-[#262626]"
                    data-cy={`bsc-perspective-kpi-card-name-${row.kpiLibraryId}`}
                  >
                    {row.kpiName}
                  </p>
                  <span
                    className="shrink-0 pt-0.5 text-[18px] font-semibold leading-none text-[#262626]"
                    data-cy={`bsc-perspective-kpi-card-avg-${row.kpiLibraryId}`}
                  >
                    {row.evaluatedCount ? `${formatScore(percent)}%` : '—'}
                  </span>
                  <div
                    className="shrink-0"
                    data-cy={`bsc-perspective-kpi-card-menu-wrap-${row.kpiLibraryId}`}
                    onClick={(event) => event.stopPropagation()}
                  >
                    <Dropdown
                      menu={{ items: menuFor(row) }}
                      trigger={['click']}
                      placement="bottomRight"
                    >
                      <button
                        type="button"
                        className="flex h-7 w-7 items-center justify-center rounded border-none bg-transparent text-[#8c8c8c] hover:text-[#262626] cursor-pointer"
                        onClick={(event) => event.stopPropagation()}
                        data-cy={`bsc-perspective-kpi-card-menu-${row.kpiLibraryId}`}
                      >
                        <EllipsisOutlined />
                      </button>
                    </Dropdown>
                  </div>
                </div>
                <div
                  className="mt-2 flex flex-wrap items-center gap-1.5"
                  data-cy={`bsc-perspective-kpi-card-meta-${row.kpiLibraryId}`}
                >
                  <Tag className="m-0 h-5 rounded border border-[#d9d9d9] bg-white px-1.5 text-[11px] font-normal leading-5 text-[#595959]">
                    {row.measurementUnit || '—'}
                  </Tag>
                </div>
                <div
                  className="mt-auto pt-3"
                  data-cy={`bsc-perspective-kpi-card-progress-${row.kpiLibraryId}`}
                >
                  <Progress
                    percent={percent}
                    showInfo={false}
                    strokeColor="#1f4fd8"
                    trailColor="#e5e7eb"
                    size="small"
                  />
                </div>
              </button>
            );
          })}
        </div>
      )}

      <Modal
        open={kpiFormOpen}
        onCancel={closeKpiForm}
        footer={null}
        centered
        width={560}
        destroyOnClose
        title={editingKpi ? 'Edit KPI' : 'Add KPI'}
        data-cy="bsc-perspective-detail-kpi-form-modal"
      >
        <Form form={form} layout="vertical" className="mt-2">
          {perspective ? (
            <p
              className="mb-3 text-sm text-[#595959]"
              data-cy="bsc-perspective-detail-kpi-form-perspective"
            >
              Perspective:{' '}
              <strong data-cy="bsc-perspective-detail-kpi-form-perspective-name">
                {perspective.name}
              </strong>
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
              data-cy="bsc-perspective-detail-kpi-name"
            />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <TextArea
              rows={3}
              placeholder="Describe what this KPI measures"
              data-cy="bsc-perspective-detail-kpi-description"
            />
          </Form.Item>
          <Form.Item
            name="targetLogic"
            label="Direction"
            rules={[{ required: true, message: 'Select direction' }]}
          >
            <Radio.Group data-cy="bsc-perspective-detail-kpi-logic">
              <Radio value={TargetLogic.HigherBetter}>Higher is better</Radio>
              <Radio value={TargetLogic.LowerBetter}>Lower is better</Radio>
              <Radio value={TargetLogic.Bounded}>Bounded</Radio>
            </Radio.Group>
          </Form.Item>
          <Form.Item
            name="measurementUnit"
            label="Metric"
            rules={[
              {
                required: true,
                whitespace: true,
                message: 'Metric is required',
              },
            ]}
          >
            <AutoComplete
              options={METRIC_OPTIONS}
              placeholder="Select or type a metric"
              className="w-full"
              data-cy="bsc-perspective-detail-kpi-metric"
            />
          </Form.Item>
          <Form.Item name="defaultTarget" label="Default target">
            <InputNumber
              className="w-full"
              data-cy="bsc-perspective-detail-kpi-target"
            />
          </Form.Item>
          {isBounded ? (
            <Row gutter={12}>
              <Col span={12}>
                <Form.Item name="worstCase" label="Worst case">
                  <InputNumber
                    className="w-full"
                    data-cy="bsc-perspective-detail-kpi-worst"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="bestCase" label="Best case">
                  <InputNumber
                    className="w-full"
                    data-cy="bsc-perspective-detail-kpi-best"
                  />
                </Form.Item>
              </Col>
            </Row>
          ) : null}
          <div
            className="flex justify-end gap-2 pt-2"
            data-cy="bsc-perspective-detail-kpi-form-actions"
          >
            <CustomButton
              type="default"
              title="Cancel"
              onClick={closeKpiForm}
              className="h-10"
            />
            <CustomButton
              title={editingKpi ? 'Save' : 'Add KPI'}
              onClick={() => {
                void handleSaveKpi();
              }}
              loading={saving}
              className="h-10 bg-[#2b54ad]"
            />
          </div>
        </Form>
      </Modal>
    </div>
  );
}
