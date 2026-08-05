'use client';
import React, { FC, useEffect, useMemo } from 'react';
import {
  Button,
  Checkbox,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Modal,
} from 'antd';
import dayjs from 'dayjs';
import { DATE_FORMAT } from '@/utils/constants';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { useSetTnaOfficerDecision } from '@/store/server/features/tna/externalTraining/mutation';
import { useGetTnaCommitment } from '@/store/server/features/tna/commitment/queries';
import { ExternalTrainingRequest } from '@/types/tna/externalTna';

interface TnaOfficerDecisionModalProps {
  open: boolean;
  request: ExternalTrainingRequest | null;
  onClose: () => void;
}

/**
 * Step 2 — the TNA Officer confirms payment, records the commitment period and
 * activates the commitment on approval.
 */
const TnaOfficerDecisionModal: FC<TnaOfficerDecisionModalProps> = ({
  open,
  request,
  onClose,
}) => {
  const [form] = Form.useForm();
  const { userId } = useAuthenticationStore();
  const { mutate: submitDecision, isLoading } = useSetTnaOfficerDecision();
  const { data: commitmentRules } = useGetTnaCommitment({});

  const isPaymentConfirmed = Form.useWatch('isPaymentConfirmed', form);

  /** Commitment rules map a cost band to a default period — a helpful default. */
  const suggestedDays = useMemo(() => {
    const rules = commitmentRules?.items ?? [];
    const cost = Number(request?.cost ?? 0);
    const match = rules.find(
      (rule: any) =>
        Number(rule?.amountMin ?? 0) <= cost &&
        cost <= Number(rule?.amountMax ?? 0),
    );
    return match?.commitmentPeriodDays ?? undefined;
  }, [commitmentRules, request?.cost]);

  useEffect(() => {
    if (open) {
      form.setFieldsValue({
        isPaymentConfirmed: false,
        paidAmount: request?.cost ?? undefined,
        commitmentPeriodDays: suggestedDays,
        commitmentStartDate: dayjs(),
      });
    } else {
      form.resetFields();
    }
  }, [open, request?.cost, suggestedDays, form]);

  const decide = async (decision: 'approve' | 'reject') => {
    if (!request?.id) return;

    const values = form.getFieldsValue();
    const remark = values.remark?.trim();

    if (decision === 'reject') {
      if (!remark) {
        form.setFields([
          { name: 'remark', errors: ['A reason is required to reject.'] },
        ]);
        return;
      }

      submitDecision(
        {
          id: request.id,
          decision,
          remark,
          actedBy: userId ?? undefined,
        },
        { onSuccess: () => onClose() },
      );
      return;
    }

    try {
      await form.validateFields([
        'isPaymentConfirmed',
        'commitmentPeriodDays',
        'commitmentStartDate',
      ]);
    } catch {
      return;
    }

    submitDecision(
      {
        id: request.id,
        decision,
        remark: remark || undefined,
        actedBy: userId ?? undefined,
        isPaymentConfirmed: true,
        paymentReference: values.paymentReference?.trim() || undefined,
        paidAmount:
          values.paidAmount === undefined || values.paidAmount === null
            ? undefined
            : Number(values.paidAmount),
        commitmentPeriodDays: Number(values.commitmentPeriodDays),
        commitmentStartDate: values.commitmentStartDate
          ? values.commitmentStartDate.toISOString()
          : undefined,
      },
      { onSuccess: () => onClose() },
    );
  };

  const projectedEnd = useMemo(() => {
    const start = form.getFieldValue('commitmentStartDate');
    const days = form.getFieldValue('commitmentPeriodDays');
    if (!start || !days) return null;
    return dayjs(start).add(Number(days), 'day');
  }, [form, isPaymentConfirmed]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Modal
      open={open}
      onCancel={onClose}
      centered
      width={560}
      footer={null}
      title={
        <span
          data-cy="tna-officer-decision-modal-title"
          className="font-[Calibri,sans-serif] text-[16px] font-bold leading-6 text-black/70"
        >
          TNA Officer Review
        </span>
      }
      data-cy="tna-officer-decision-modal"
    >
      <div className="flex flex-col gap-3" data-cy="tna-officer-decision-body">
        <div
          className="rounded-[6px] bg-black/[0.02] px-3 py-2"
          data-cy="tna-officer-decision-summary"
        >
          <div
            data-cy="tna-officer-decision-course"
            className="text-sm font-bold leading-[22px] text-black"
          >
            {request?.courseName}
          </div>
          <div
            data-cy="tna-officer-decision-meta"
            className="text-xs leading-5 text-black/45"
          >
            {request?.trainingProvider || 'External training'} · requested cost{' '}
            {Number(request?.cost ?? 0).toLocaleString()}
          </div>
          {request?.managerRemark ? (
            <div
              data-cy="tna-officer-decision-manager-remark"
              className="mt-2 text-xs leading-5 text-black/70"
            >
              Manager remark: {request.managerRemark}
            </div>
          ) : null}
        </div>

        <Form layout="vertical" form={form} data-cy="tna-officer-decision-form">
          <Form.Item
            name="isPaymentConfirmed"
            valuePropName="checked"
            className="form-item !mb-3"
            rules={[
              {
                validator: (unusedRule, value) =>
                  value
                    ? Promise.resolve()
                    : Promise.reject(
                        new Error(
                          'Confirm the training has been paid for before approving.',
                        ),
                      ),
              },
            ]}
            data-cy="tna-officer-decision-payment-item"
          >
            <Checkbox data-cy="tna-officer-decision-payment">
              I confirm this training has been paid for
            </Checkbox>
          </Form.Item>

          <div
            data-cy="tna-officer-decision-payment-row"
            className="grid grid-cols-1 gap-x-4 md:grid-cols-2"
          >
            <Form.Item
              name="paymentReference"
              label={
                <span
                  data-cy="tna-officer-decision-reference-label"
                  className="text-[14px] font-normal"
                >
                  Payment reference
                </span>
              }
              className="form-item"
              data-cy="tna-officer-decision-reference-item"
            >
              <Input
                className="h-10 rounded-[6px]"
                placeholder="Receipt / invoice no."
                data-cy="tna-officer-decision-reference"
              />
            </Form.Item>

            <Form.Item
              name="paidAmount"
              label={
                <span
                  data-cy="tna-officer-decision-amount-label"
                  className="text-[14px] font-normal"
                >
                  Amount paid
                </span>
              }
              className="form-item"
              data-cy="tna-officer-decision-amount-item"
            >
              <InputNumber
                min={0}
                className="h-10 w-full"
                data-cy="tna-officer-decision-amount"
              />
            </Form.Item>
          </div>

          <div
            data-cy="tna-officer-decision-commitment-row"
            className="grid grid-cols-1 gap-x-4 md:grid-cols-2"
          >
            <Form.Item
              name="commitmentPeriodDays"
              label={
                <span
                  data-cy="tna-officer-decision-period-label"
                  className="text-[14px] font-normal"
                >
                  Commitment period (days)
                </span>
              }
              rules={[
                { required: true, message: 'Required' },
                {
                  type: 'number',
                  min: 1,
                  message: 'Must be at least one day',
                },
              ]}
              className="form-item"
              extra={
                suggestedDays ? (
                  <span
                    data-cy="tna-officer-decision-period-hint"
                    className="text-xs text-black/45"
                  >
                    Suggested from commitment rules: {suggestedDays} day(s)
                  </span>
                ) : undefined
              }
              data-cy="tna-officer-decision-period-item"
            >
              <InputNumber
                min={1}
                className="h-10 w-full"
                data-cy="tna-officer-decision-period"
              />
            </Form.Item>

            <Form.Item
              name="commitmentStartDate"
              label={
                <span
                  data-cy="tna-officer-decision-start-label"
                  className="text-[14px] font-normal"
                >
                  Commitment start date
                </span>
              }
              rules={[{ required: true, message: 'Required' }]}
              className="form-item"
              data-cy="tna-officer-decision-start-item"
            >
              <DatePicker
                className="h-10 w-full rounded-[6px]"
                format={DATE_FORMAT}
                data-cy="tna-officer-decision-start"
              />
            </Form.Item>
          </div>

          {projectedEnd ? (
            <div
              className="mb-3 rounded-[6px] bg-black/[0.02] px-3 py-2 text-xs leading-5 text-black/70"
              data-cy="tna-officer-decision-projected-end"
            >
              Commitment would end on {projectedEnd.format(DATE_FORMAT)}.
            </div>
          ) : null}

          <Form.Item
            name="remark"
            label={
              <span
                data-cy="tna-officer-decision-remark-label"
                className="text-[14px] font-normal"
              >
                Remark
              </span>
            }
            className="form-item !mb-0"
            data-cy="tna-officer-decision-remark-item"
          >
            <Input.TextArea
              rows={3}
              placeholder="Optional when approving, required when rejecting"
              data-cy="tna-officer-decision-remark"
            />
          </Form.Item>
        </Form>

        <div
          className="flex items-center justify-end gap-2 pt-1"
          data-cy="tna-officer-decision-actions"
        >
          <Button
            className="h-8 min-h-8 rounded-md border-[#D9D9D9] px-[15px] !text-sm !font-normal text-black/70"
            onClick={onClose}
            data-cy="tna-officer-decision-cancel"
          >
            Cancel
          </Button>
          <Button
            danger
            className="h-8 min-h-8 rounded-md px-[15px] !text-sm !font-normal"
            loading={isLoading}
            onClick={() => decide('reject')}
            data-cy="tna-officer-decision-reject"
          >
            Reject
          </Button>
          <Button
            type="primary"
            className="h-8 min-h-8 rounded-lg border-[#1E40AF] bg-[#1E40AF] px-4 !text-sm !font-normal text-white"
            loading={isLoading}
            onClick={() => decide('approve')}
            data-cy="tna-officer-decision-approve"
          >
            Approve &amp; activate
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default TnaOfficerDecisionModal;
