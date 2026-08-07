'use client';
import React, { FC, useEffect, useState } from 'react';
import { Alert, Button, DatePicker, Form, Input, Modal, Upload } from 'antd';
import type { UploadFile } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import { DATE_FORMAT } from '@/utils/constants';
import {
  useCompleteTrainingRequest,
  useFailTrainingRequest,
} from '@/store/server/features/tna/externalTraining/mutation';
import { TrainingRequest } from '@/types/tna/externalTna';

interface CloseOutcomeModalProps {
  open: boolean;
  /** `complete` uploads a certificate, `fail` uploads failure proof. */
  outcome: 'complete' | 'fail';
  request: TrainingRequest | null;
  onClose: () => void;
}

/**
 * Records how the training ended. The date goes into `endDate` either way; the
 * proof document is pushed to the file server by the backend.
 */
const CloseOutcomeModal: FC<CloseOutcomeModalProps> = ({
  open,
  outcome,
  request,
  onClose,
}) => {
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  const { mutate: complete, isLoading: isCompleting } =
    useCompleteTrainingRequest();
  const { mutate: fail, isLoading: isFailing } = useFailTrainingRequest();

  const isCompleteOutcome = outcome === 'complete';
  const isLoading = isCompleting || isFailing;

  useEffect(() => {
    if (!open) {
      form.resetFields();
      setFileList([]);
    }
  }, [open, form]);

  const onSubmit = async () => {
    const values = await form.validateFields().catch(() => null);
    if (!values || !request?.id) return;

    const file = fileList[0]?.originFileObj;
    if (!file) {
      return;
    }

    const payload = {
      id: request.id,
      endDate: values.endDate.toISOString(),
      description: values.description?.trim() || undefined,
      file: file as File,
    };

    const onSuccess = () => onClose();

    if (isCompleteOutcome) {
      complete(payload, { onSuccess });
    } else {
      fail(payload, { onSuccess });
    }
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      centered
      width={520}
      footer={null}
      title={
        <span
          className="font-[Calibri,sans-serif] text-[16px] font-bold leading-6 text-black/70"
          data-cy="tna-close-outcome-title"
        >
          {isCompleteOutcome ? 'Mark as Completed' : 'Mark as Failed'}
        </span>
      }
      data-cy="tna-close-outcome-modal"
    >
      <div className="flex flex-col gap-3" data-cy="tna-close-outcome-body">
        <Alert
          type={isCompleteOutcome ? 'info' : 'warning'}
          showIcon
          message={
            isCompleteOutcome
              ? 'Upload the certificate that proves the training was passed.'
              : 'Upload the document that proves the training was not passed.'
          }
          data-cy="tna-close-outcome-hint"
        />

        <Form
          layout="vertical"
          form={form}
          data-cy="tna-close-outcome-form"
          disabled={isLoading}
        >
          <Form.Item
            name="endDate"
            label={
              <span
                data-cy="tna-close-outcome-date-label"
                className="text-[14px] font-normal"
              >
                {isCompleteOutcome ? 'Completion date' : 'Failure date'}
              </span>
            }
            rules={[{ required: true, message: 'Required' }]}
            className="form-item"
            data-cy="tna-close-outcome-date-item"
          >
            <DatePicker
              className="h-10 w-full rounded-[6px]"
              format={DATE_FORMAT}
              data-cy="tna-close-outcome-date"
            />
          </Form.Item>

          <Form.Item
            label={
              <span
                data-cy="tna-close-outcome-file-label"
                className="text-[14px] font-normal"
              >
                {isCompleteOutcome ? 'Certificate' : 'Failure proof'}
              </span>
            }
            required
            className="form-item"
            validateStatus={fileList.length ? undefined : undefined}
            data-cy="tna-close-outcome-file-item"
          >
            <Upload.Dragger
              multiple={false}
              maxCount={1}
              fileList={fileList}
              beforeUpload={() => false}
              onChange={({ fileList: next }) => setFileList(next.slice(-1))}
              onRemove={() => setFileList([])}
              data-cy="tna-close-outcome-upload"
            >
              <p
                className="ant-upload-drag-icon"
                data-cy="tna-close-outcome-upload-icon"
              >
                <InboxOutlined style={{ fontSize: 40, color: '#1E40AF' }} />
              </p>
              <p
                className="ant-upload-text"
                data-cy="tna-close-outcome-upload-text"
              >
                Click or drag the file to this area to upload
              </p>
              <p
                className="ant-upload-hint"
                data-cy="tna-close-outcome-upload-hint"
              >
                A single file, PDF or image.
              </p>
            </Upload.Dragger>
          </Form.Item>

          <Form.Item
            name="description"
            label={
              <span
                data-cy="tna-close-outcome-description-label"
                className="text-[14px] font-normal"
              >
                Remark
              </span>
            }
            className="form-item !mb-0"
            data-cy="tna-close-outcome-description-item"
          >
            <Input.TextArea
              rows={3}
              placeholder="Optional note about the outcome"
              data-cy="tna-close-outcome-description"
            />
          </Form.Item>
        </Form>

        <div
          className="flex items-center justify-end gap-2 pt-1"
          data-cy="tna-close-outcome-actions"
        >
          <Button
            className="h-8 min-h-8 rounded-md border-[#D9D9D9] px-[15px] !text-sm !font-normal text-black/70"
            onClick={onClose}
            data-cy="tna-close-outcome-cancel"
          >
            Cancel
          </Button>
          <Button
            type="primary"
            danger={!isCompleteOutcome}
            className={
              isCompleteOutcome
                ? 'h-8 min-h-8 rounded-lg border-[#1E40AF] bg-[#1E40AF] px-4 !text-sm !font-normal text-white'
                : 'h-8 min-h-8 rounded-lg px-4 !text-sm !font-normal'
            }
            loading={isLoading}
            disabled={!fileList.length}
            onClick={onSubmit}
            data-cy="tna-close-outcome-submit"
          >
            {isCompleteOutcome ? 'Upload & complete' : 'Upload & fail'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default CloseOutcomeModal;
