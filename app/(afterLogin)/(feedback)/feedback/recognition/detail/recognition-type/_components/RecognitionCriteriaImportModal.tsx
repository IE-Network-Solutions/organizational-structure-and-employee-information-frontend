'use client';

import NotificationMessage from '@/components/common/notification/notificationMessage';
import { capitalizeInitials } from '@/helpers/capitalizeInitals';
import { useFetchAllPayPeriod } from '@/store/server/features/incentive/project/queries';
import { fetchExcelHeaders } from '@/store/server/features/incentive/all/queries';
import { useImportData } from '@/store/server/features/incentive/all/mutation';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import {
  DownloadOutlined,
  InboxOutlined,
  QuestionCircleOutlined,
} from '@ant-design/icons';
import { Button, Form, Modal, Select, Tooltip, Upload } from 'antd';
import TextArea from 'antd/es/input/TextArea';
import dayjs from 'dayjs';
import ExcelJS from 'exceljs';
import { useQueryClient } from 'react-query';
import React, { useCallback, useState } from 'react';

type Props = {
  open: boolean;
  onClose: () => void;
  recognitionTypeId: string;
  recognitionTypeName?: string;
  'data-cy'?: string;
};

function pickUploadFile(values: { fileName?: unknown }) {
  const raw = values?.fileName as
    | { file?: { originFileObj?: File }; originFileObj?: File }
    | Array<{ originFileObj?: File }>
    | undefined;
  if (!raw) return undefined;
  if (Array.isArray(raw)) {
    return raw[0]?.originFileObj;
  }
  return (
    raw.file?.originFileObj ?? (raw as { originFileObj?: File }).originFileObj
  );
}

export default function RecognitionCriteriaImportModal({
  open,
  onClose,
  recognitionTypeId,
  recognitionTypeName,
  'data-cy': dataCy = 'recognition-criteria-import-modal',
}: Props) {
  const [form] = Form.useForm();
  const queryClient = useQueryClient();
  const { mutate: importData, isLoading: importLoading } = useImportData();
  const { data: payPeriodData, isLoading: payPeriodLoading } =
    useFetchAllPayPeriod();
  const [downloadLoading, setDownloadLoading] = useState(false);

  const handleClose = useCallback(() => {
    form.resetFields();
    onClose();
  }, [form, onClose]);

  const handleDownloadFormat = async () => {
    if (!recognitionTypeId) return;
    setDownloadLoading(true);
    try {
      const headers = await fetchExcelHeaders(recognitionTypeId);
      if (!headers || headers.length === 0) {
        NotificationMessage.warning({
          message: 'No headers found. Please try again.',
        });
        return;
      }
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Recognition criteria');
      worksheet.columns = headers.map(
        (header: { criterionKey?: string; id?: string }, index: number) => ({
          header: capitalizeInitials(header.criterionKey ?? ''),
          key: header.id ?? `col_${index}`,
          width: 20,
        }),
      );
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const safeName = (recognitionTypeName || 'recognition-type')
        .replace(/[/\\?%*:|"<>]/g, '-')
        .slice(0, 80);
      link.download = `${safeName}_import_template.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      NotificationMessage.success({
        message: 'Template downloaded successfully!',
      });
    } catch {
      NotificationMessage.error({
        message: 'Failed to download template. Please try again.',
      });
    } finally {
      setDownloadLoading(false);
    }
  };

  const handleSubmit = async (values: {
    fileName?: unknown;
    importDate?: string;
    additionalInformation?: string;
  }) => {
    const userId = useAuthenticationStore.getState().userId;
    const file = pickUploadFile(values);
    if (!file) {
      NotificationMessage.error({ message: 'Please upload a file.' });
      return;
    }
    const formData = new FormData();
    formData.append('file', file);
    formData.append('payPeriodId', values.importDate ?? '');
    formData.append('recognitionTypeId', recognitionTypeId);
    formData.append('userId', userId || '');
    if (values.additionalInformation?.trim()) {
      formData.append(
        'additionalInformation',
        values.additionalInformation.trim(),
      );
    }

    importData(formData, {
      onSuccess: () => {
        form.resetFields();
        onClose();
        queryClient.invalidateQueries({ queryKey: ['recognitionTypeChild'] });
        queryClient.invalidateQueries('recognitionTypesWithRelations');
        queryClient.invalidateQueries('recognitionTypes');
      },
    });
  };

  const titleText = recognitionTypeName?.trim() || 'Recognition type';

  return (
    <Modal
      open={open}
      onCancel={handleClose}
      title={
        <span
          className="text-base font-semibold text-gray-800"
          data-cy="recognition-criteria-import-modal-title"
        >
          {titleText}
        </span>
      }
      width={600}
      centered
      destroyOnClose
      footer={
        <div
          className="flex justify-end gap-3"
          data-cy="recognition-criteria-import-modal-footer"
        >
          <Button
            type="default"
            className="h-[32px] min-w-[68px]"
            onClick={handleClose}
            data-cy="recognition-criteria-import-modal-cancel"
          >
            Cancel
          </Button>
          <Button
            type="primary"
            className="h-[32px] min-w-[68px]"
            loading={importLoading}
            onClick={() => form.submit()}
            data-cy="recognition-criteria-import-modal-import"
          >
            Import
          </Button>
        </div>
      }
      classNames={{
        content: 'rounded-xl',
        header: 'rounded-t-xl',
      }}
      data-cy={dataCy}
    >
      <div
        className="mb-6 rounded-lg bg-gray-100 px-4 py-4 flex flex-col justify-center items-center"
        data-cy="recognition-criteria-import-download-section"
      >
        <p
          className="mb-3 text-sm text-gray-600"
          data-cy="recognition-criteria-import-download-hint"
        >
          Download the Recognition type format to be able to upload your data
          correctly.
        </p>
        <Button
          type="default"
          icon={<DownloadOutlined />}
          loading={downloadLoading}
          className="border-primary text-primary hover:text-primary"
          onClick={handleDownloadFormat}
          data-cy="recognition-criteria-import-download-format"
        >
          Download Format
        </Button>
      </div>

      <Form
        form={form}
        layout="vertical"
        requiredMark={false}
        onFinish={handleSubmit}
        data-cy="recognition-criteria-import-form"
      >
        <Form.Item
          label={
            <span
              className="inline-flex items-center gap-1 font-normal text-gray-800"
              data-cy="recognition-criteria-import-file-label"
            >
              Downloaded format
              <span
                className="text-red-500"
                data-cy="recognition-criteria-import-required-star"
              >
                *
              </span>
              <Tooltip title="Use the downloaded Excel template so columns match this recognition type.">
                <QuestionCircleOutlined className="text-gray-400" />
              </Tooltip>
            </span>
          }
          name="fileName"
          valuePropName="fileList"
          getValueFromEvent={(e) => (Array.isArray(e) ? e : e?.fileList)}
          rules={[
            {
              validator: async (rule, fileList) => {
                if (!fileList?.length) {
                  return Promise.reject(new Error('Please upload a file.'));
                }
              },
            },
          ]}
          data-cy="recognition-criteria-import-file"
        >
          <Upload.Dragger
            name="file"
            className="bg-white"
            accept=".xlsx"
            maxCount={1}
            beforeUpload={() => false}
            data-cy="recognition-criteria-import-upload"
          >
            <p
              className="ant-upload-drag-icon flex justify-center text-primary"
              data-cy="recognition-criteria-import-upload-icon-wrap"
            >
              <InboxOutlined className="text-4xl" />
            </p>
            <p
              className="text-base font-semibold text-gray-800"
              data-cy="recognition-criteria-import-upload-title"
            >
              Click or drag file to this area to upload
            </p>
            <p
              className="text-sm text-gray-500"
              data-cy="recognition-criteria-import-upload-hint"
            >
              Support for a single or bulk upload.
            </p>
          </Upload.Dragger>
        </Form.Item>

        <Form.Item
          label={
            <span data-cy="recognition-criteria-import-pay-period-label">
              Pay Period{' '}
              <span
                className="text-red-500"
                data-cy="recognition-criteria-import-pay-period-required"
              >
                *
              </span>
            </span>
          }
          name="importDate"
          rules={[{ required: true, message: 'Please select a pay period.' }]}
          data-cy="recognition-criteria-import-pay-period"
        >
          <Select
            size="large"
            className="h-10 w-full"
            placeholder="Select"
            allowClear
            loading={payPeriodLoading}
            data-cy="recognition-criteria-import-pay-period-select"
          >
            {payPeriodData?.map(
              (payPeriod: {
                id?: string;
                startDate?: string;
                endDate?: string;
              }) => (
                <Select.Option key={payPeriod?.id} value={payPeriod?.id}>
                  {`${dayjs(payPeriod?.startDate).format('YYYY-MM-DD')} — ${dayjs(payPeriod?.endDate).format('YYYY-MM-DD')}`}
                </Select.Option>
              ),
            )}
          </Select>
        </Form.Item>

        <Form.Item
          label={
            <span
              className="font-normal text-gray-800"
              data-cy="recognition-criteria-import-additional-label"
            >
              Additional Information
            </span>
          }
          name="additionalInformation"
          data-cy="recognition-criteria-import-notes"
        >
          <TextArea
            rows={3}
            placeholder="Insert other necessary information"
            size="large"
            allowClear
            data-cy="recognition-criteria-import-additional-textarea"
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}
