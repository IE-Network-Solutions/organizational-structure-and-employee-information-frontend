'use client';

import React, { useCallback, useMemo, useState } from 'react';
import { Button, Modal, Table, Tag, Upload } from 'antd';
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
import { useGetBscCycles } from '@/store/server/features/bsc/queries';
import { CycleStatus, KpiImportRowResult } from '@/types/bsc';
import {
  buildKpiImportTemplateBuffer,
  parseKpiImportFile,
} from '@/utils/bsc/kpiImport';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
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
  const importKpis = useImportBscKpis();
  const [file, setFile] = useState<File | undefined>();
  const [parsedRows, setParsedRows] = useState<KpiImportRowResult[]>([]);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [parseLoading, setParseLoading] = useState(false);

  const evaluationConfigId = useMemo(() => {
    const openConfig = (configs || []).find(
      (c) => c.status === CycleStatus.Open,
    );
    return openConfig?.id || configs?.[0]?.id || 'library';
  }, [configs]);

  const validRows = parsedRows.filter((row) => row.input);
  const invalidRows = parsedRows.filter((row) => row.error);

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
      title: 'Name',
      key: 'name',
      render: (ignored, row) => row.input?.name || '—',
    },
    {
      title: 'Perspective',
      key: 'perspective',
      render: (ignored, row) => row.input?.perspective || '—',
    },
    {
      title: 'Details',
      key: 'details',
      render: (ignored, row) => row.error || row.input?.measurementUnit || '—',
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
            </div>
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
