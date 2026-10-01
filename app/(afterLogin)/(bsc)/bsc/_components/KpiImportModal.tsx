'use client';

import React, { useCallback, useMemo, useState } from 'react';
import { Alert, Button, Modal, Table, Tag, Upload } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  CloseOutlined,
  DownloadOutlined,
  InboxOutlined,
} from '@ant-design/icons';
import NotificationMessage from '@/components/common/notification/notificationMessage';
import CustomButton from '@/components/common/buttons/customButton';
import { useBscUiStore } from '@/store/uistate/features/bsc';
import { useImportBscKpis } from '@/store/server/features/bsc/mutation';
import {
  useGetBscCycles,
  useGetBscPerspectiveCatalog,
} from '@/store/server/features/bsc/queries';
import { CycleStatus, KpiImportRowResult, TargetLogic } from '@/types/bsc';
import {
  KPI_IMPORT_HEADERS,
  buildKpiImportTemplateBuffer,
  parseKpiImportFile,
} from '@/utils/bsc/kpiImport';

const TARGET_DIRECTION_LABEL: Record<TargetLogic, string> = {
  [TargetLogic.HigherBetter]: 'Higher is Better',
  [TargetLogic.LowerBetter]: 'Lower is Better',
  [TargetLogic.Bounded]: 'Bounded',
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
type PerspectiveStatus = 'existing' | 'new' | 'unassigned';

function pickUploadFile(fileField: unknown): File | undefined {
  const raw = fileField as
    | { file?: { originFileObj?: File }; originFileObj?: File }
    | Array<{ originFileObj?: File }>
    | undefined;
  if (!raw) return undefined;
  if (Array.isArray(raw)) return raw[0]?.originFileObj;
  return raw.file?.originFileObj ?? raw.originFileObj;
}

export default function KpiImportModal() {
  const { kpiImportModalOpen, closeKpiImportModal } = useBscUiStore();
  const { data: configs } = useGetBscCycles();
  const { data: perspectiveCatalog } = useGetBscPerspectiveCatalog();
  const importKpis = useImportBscKpis();
  const [file, setFile] = useState<File | undefined>();
  const [parsedRows, setParsedRows] = useState<KpiImportRowResult[]>([]);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [parseLoading, setParseLoading] = useState(false);

  /** Existing perspectives by lower-cased name (matching is case-insensitive). */
  const existingPerspectives = useMemo(() => {
    const map = new Map<string, string>();
    for (const item of perspectiveCatalog || []) {
      const name = item.name?.trim();
      if (name) map.set(name.toLowerCase(), name);
    }
    return map;
  }, [perspectiveCatalog]);

  // Each row brings its own perspective: existing → reused, unknown → created
  // on import, empty → KPI imported as Unassigned.
  const perspectiveStatusOf = useCallback(
    (row: KpiImportRowResult): PerspectiveStatus => {
      const name = row.input?.perspective?.trim();
      if (!name) return 'unassigned';
      return existingPerspectives.has(name.toLowerCase()) ? 'existing' : 'new';
    },
    [existingPerspectives],
  );

  const evaluationConfigId = useMemo(() => {
    const openConfig = (configs || []).find(
      (c) => c.status === CycleStatus.Open,
    );
    return openConfig?.id || configs?.[0]?.id || 'library';
  }, [configs]);

  const validRows = parsedRows.filter((row) => row.input);
  const invalidRows = parsedRows.filter((row) => row.error);
  const unassignedCount = validRows.filter(
    (row) => perspectiveStatusOf(row) === 'unassigned',
  ).length;
  const newPerspectiveNames = Array.from(
    new Map(
      validRows
        .filter((row) => perspectiveStatusOf(row) === 'new')
        .map((row) => {
          const name = (row.input?.perspective || '').trim();
          return [name.toLowerCase(), name] as const;
        }),
    ).values(),
  );

  const previewColumns: ColumnsType<KpiImportRowResult> = [
    { title: 'Row', dataIndex: 'row', width: 70 },
    {
      title: 'Status',
      key: 'status',
      width: 110,
      render: (ignored, row) =>
        row.error ? (
          <Tag color="red">Invalid</Tag>
        ) : (
          <Tag color="green">Valid</Tag>
        ),
    },
    {
      title: 'KPI Name',
      key: 'name',
      render: (ignored, row) => row.input?.name || '—',
    },
    {
      title: 'Unit',
      key: 'unit',
      width: 80,
      render: (ignored, row) => row.input?.measurementUnit || '—',
    },
    {
      title: 'Target',
      key: 'target',
      width: 90,
      render: (ignored, row) =>
        row.input?.defaultTarget != null ? row.input.defaultTarget : '—',
    },
    {
      title: 'Target Direction',
      key: 'direction',
      width: 140,
      render: (ignored, row) =>
        row.input?.targetLogic
          ? TARGET_DIRECTION_LABEL[row.input.targetLogic]
          : '—',
    },
    {
      title: 'Perspective',
      key: 'perspective',
      width: 170,
      render: (ignored, row) => {
        if (!row.input) return '—';
        const status = perspectiveStatusOf(row);
        if (status === 'unassigned') {
          return (
            <Tag color="orange" data-cy="bsc-kpi-import-perspective-unassigned">
              Unassigned
            </Tag>
          );
        }
        const name = (row.input.perspective || '').trim();
        if (status === 'new') {
          return (
            <Tag color="green" data-cy="bsc-kpi-import-perspective-new">
              New: {name}
            </Tag>
          );
        }
        return (
          <Tag color="blue" data-cy="bsc-kpi-import-perspective-existing">
            {existingPerspectives.get(name.toLowerCase()) || name}
          </Tag>
        );
      },
    },
    {
      title: 'Details',
      key: 'details',
      render: (ignored, row) => row.error || row.input?.description || '—',
    },
  ];

  const reset = useCallback(() => {
    setFile(undefined);
    setParsedRows([]);
  }, []);

  const handleClose = () => {
    reset();
    closeKpiImportModal();
  };

  const handleDownloadTemplate = async () => {
    setDownloadLoading(true);
    try {
      const buffer = await buildKpiImportTemplateBuffer();
      const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'kpi-import-template.xlsx';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      NotificationMessage.success({ message: 'Template downloaded' });
    } catch {
      NotificationMessage.error({ message: 'Failed to download template' });
    } finally {
      setDownloadLoading(false);
    }
  };

  const handleParse = async (nextFile?: File) => {
    const upload = nextFile || file;
    if (!upload) {
      NotificationMessage.error({ message: 'Upload an Excel file first' });
      return;
    }
    setParseLoading(true);
    try {
      const rows = await parseKpiImportFile(upload);
      setParsedRows(rows);
      if (!rows.length) {
        NotificationMessage.warning({ message: 'No rows found in the file' });
      }
    } catch {
      NotificationMessage.error({ message: 'Could not read the Excel file' });
    } finally {
      setParseLoading(false);
    }
  };

  const handleImport = async () => {
    if (!validRows.length) {
      NotificationMessage.error({ message: 'No valid rows to import' });
      return;
    }
    await importKpis.mutateAsync({
      rows: validRows.map((row) => row.input!),
      evaluationConfigId,
    });
    handleClose();
  };

  return (
    <Modal
      open={kpiImportModalOpen}
      onCancel={handleClose}
      footer={null}
      width={760}
      centered
      destroyOnClose
      closeIcon={<CloseOutlined />}
      title="Import KPIs"
      data-cy="bsc-kpi-import-modal"
    >
      <div data-cy="auto-added" className="flex flex-col gap-4">
        <div data-cy="auto-added" className="flex flex-wrap items-center gap-2">
          <Button
            icon={<DownloadOutlined />}
            loading={downloadLoading}
            onClick={handleDownloadTemplate}
            data-cy="bsc-kpi-import-download-template"
          >
            Download template
          </Button>
          <span
            className="text-xs text-[#8F94A3]"
            data-cy="bsc-kpi-import-columns-hint"
          >
            Columns: {KPI_IMPORT_HEADERS.join(' · ')} (Perspective is optional)
          </span>
        </div>

        <Upload.Dragger
          accept=".xlsx,.xls"
          maxCount={1}
          beforeUpload={(uploadFile) => {
            setFile(uploadFile);
            void handleParse(uploadFile);
            return false;
          }}
          onRemove={() => {
            reset();
          }}
          fileList={
            file ? [{ uid: '1', name: file.name, status: 'done' as const }] : []
          }
          data-cy="bsc-kpi-import-upload"
        >
          <p data-cy="auto-added" className="ant-upload-drag-icon">
            <InboxOutlined />
          </p>
          <p data-cy="auto-added" className="ant-upload-text">
            Click or drag Excel file to upload
          </p>
          <p data-cy="auto-added" className="ant-upload-hint">
            Use the template format. Valid and invalid rows will be previewed
            before import.
          </p>
        </Upload.Dragger>

        {parsedRows.length ? (
          <>
            <div
              data-cy="auto-added"
              className="flex flex-wrap gap-3 text-sm text-gray-600"
            >
              <span data-cy="bsc-kpi-import-valid-count">
                Valid: {validRows.length}
              </span>
              <span data-cy="bsc-kpi-import-invalid-count">
                Invalid: {invalidRows.length}
              </span>
              {newPerspectiveNames.length ? (
                <span data-cy="bsc-kpi-import-new-perspective-count">
                  New perspectives: {newPerspectiveNames.length}
                </span>
              ) : null}
              {unassignedCount ? (
                <span data-cy="bsc-kpi-import-unassigned-count">
                  Unassigned: {unassignedCount}
                </span>
              ) : null}
            </div>
            {newPerspectiveNames.length ? (
              <Alert
                type="info"
                showIcon
                message={`These perspectives will be created: ${newPerspectiveNames.join(', ')}`}
                data-cy="bsc-kpi-import-new-perspectives-alert"
              />
            ) : null}
            {unassignedCount ? (
              <Alert
                type="warning"
                showIcon
                message={`${unassignedCount} KPI(s) have no perspective and will be imported as Unassigned`}
                description="After import, create the perspectives you need in BSC → Settings and assign one to each KPI with Edit KPI. Unassigned KPIs cannot be added to a scorecard."
                data-cy="bsc-kpi-import-unassigned-alert"
              />
            ) : null}
            <Table
              size="small"
              rowKey={(row) => `${row.row}-${row.input?.name || row.error}`}
              columns={previewColumns}
              dataSource={parsedRows}
              pagination={{ pageSize: 5, hideOnSinglePage: true }}
              scroll={{ x: true }}
              data-cy="bsc-kpi-import-preview-table"
            />
          </>
        ) : null}

        <div data-cy="auto-added" className="flex justify-end gap-2">
          <CustomButton
            type="default"
            title="Cancel"
            onClick={handleClose}
            className="h-10 px-6 rounded-lg bg-white"
            textClassName="text-sm font-medium"
            data-cy="bsc-kpi-import-cancel"
          />
          <CustomButton
            type="primary"
            title="Import"
            loading={importKpis.isLoading || parseLoading}
            disabled={!validRows.length}
            onClick={handleImport}
            data-cy="bsc-kpi-import-confirm"
          />
        </div>
      </div>
    </Modal>
  );
}
