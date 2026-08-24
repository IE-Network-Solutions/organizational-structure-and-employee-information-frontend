'use client';
import React, { FC, useEffect, useMemo } from 'react';
import {
  Alert,
  Button,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Select,
} from 'antd';
import dayjs from 'dayjs';
import { AiOutlineDollarCircle } from 'react-icons/ai';
import CustomLabel from '@/components/form/customLabel/customLabel';
import { formatToOptions } from '@/helpers/formatTo';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { useCurrency } from '@/store/server/features/tna/review/queries';
import { useGetTrainingRequestById } from '@/store/server/features/tna/externalTraining/queries';
import { useSetTrainingRequest } from '@/store/server/features/tna/externalTraining/mutation';
import { TrainingRequestApprovalStatus } from '@/types/tna/externalTna';
import { useAllApproval } from '@/store/server/features/approver/queries';
import { useGetEmployee } from '@/store/server/features/employees/employeeDetail/queries';
import { APPROVALTYPES } from '@/types/enumTypes';
import NotificationMessage from '@/components/common/notification/notificationMessage';

interface ExternalTnaFormProps {
  trainingRequestId?: string | null;
  onClose: () => void;
}

/**
 * Free-text request for a training that is not in the course catalogue. Only
 * the course name and cost are mandatory; the rest is context for the approver.
 */
const ExternalTnaForm: FC<ExternalTnaFormProps> = ({
  trainingRequestId,
  onClose,
}) => {
  const [form] = Form.useForm();
  const { userId } = useAuthenticationStore();

  const { data: currencies } = useCurrency();
  const { data: existingRequest, isFetching } = useGetTrainingRequestById(
    trainingRequestId ?? '',
    !!trainingRequestId,
  );

  const { mutate: saveTrainingRequest, isLoading } = useSetTrainingRequest();

  // The approver service resolves a workflow either per-user or per-department;
  // whichever it returns first is the one the request gets routed through.
  const { data: employeeData } = useGetEmployee(userId ?? '');
  const departmentId =
    employeeData?.employeeJobInformation?.[0]?.departmentId ?? '';

  const { data: userApprovalData, refetch: refetchUserApproval } =
    useAllApproval(userId ?? '', APPROVALTYPES.TNA);
  const { data: departmentApprovalData, refetch: refetchDepartmentApproval } =
    useAllApproval(departmentId, APPROVALTYPES.TNA);

  useEffect(() => {
    if (userId) refetchUserApproval();
  }, [userId, refetchUserApproval]);

  useEffect(() => {
    if (departmentId) refetchDepartmentApproval();
  }, [departmentId, refetchDepartmentApproval]);

  /**
   * Every TNA workflow that applies to this requester — their own plus their
   * department's. More than one can be configured, so they are all offered and
   * the requester picks; taking `[0]` silently routed through whichever the
   * approver service happened to return first.
   */
  const workflowOptions = useMemo(() => {
    const seen = new Map<string, { value: string; label: string }>();

    const collect = (list: any, scope: string) => {
      (Array.isArray(list) ? list : []).forEach((workflow: any) => {
        if (!workflow?.id || seen.has(workflow.id)) return;
        seen.set(workflow.id, {
          value: workflow.id,
          label: `${workflow.name || 'Unnamed workflow'} (${scope})`,
        });
      });
    };

    collect(userApprovalData, 'you');
    collect(departmentApprovalData, 'department');

    return Array.from(seen.values());
  }, [userApprovalData, departmentApprovalData]);

  const hasWorkflowChoice = workflowOptions.length > 1;
  const selectedWorkflowId = Form.useWatch('approvalWorkflowId', form);
  const resolvedWorkflowId = hasWorkflowChoice
    ? (selectedWorkflowId ?? workflowOptions[0]?.value)
    : workflowOptions[0]?.value;

  const currencyOptions = useMemo(() => {
    const list = Array.isArray(currencies)
      ? currencies
      : (currencies?.items ?? []);
    return formatToOptions(list, 'code', 'id');
  }, [currencies]);

  const isRejected =
    existingRequest?.approvalStatus === TrainingRequestApprovalStatus.REJECTED;

  useEffect(() => {
    if (trainingRequestId && existingRequest) {
      form.setFieldsValue({
        courseName: existingRequest.courseName ?? undefined,
        amount: existingRequest.amount,
        currencyId: existingRequest.currencyId ?? undefined,
        source: existingRequest.source ?? undefined,
        reason: existingRequest.reason ?? undefined,
        description: existingRequest.description ?? undefined,
        startDate: existingRequest.startDate
          ? dayjs(existingRequest.startDate)
          : undefined,
      });
    } else if (!trainingRequestId) {
      form.resetFields();
    }
  }, [trainingRequestId, existingRequest, form]);

  const onFinish = () => {
    const value = form.getFieldsValue();
    const approvalWorkflowId =
      existingRequest?.approvalWorkflowId ?? resolvedWorkflowId;

    if (!approvalWorkflowId) {
      NotificationMessage.warning({
        message: 'No approver assigned',
        description:
          'You have no TNA approval workflow assigned. Ask HR to set one up under Learning & Growth settings.',
      });
      return;
    }

    saveTrainingRequest(
      {
        ...(trainingRequestId ? { id: trainingRequestId } : {}),
        userId: existingRequest?.userId ?? userId ?? '',
        courseName: value.courseName?.trim(),
        amount: Number(value.amount),
        currencyId: value.currencyId || undefined,
        approvalWorkflowId,
        startDate: value.startDate ? value.startDate.toISOString() : undefined,
        source: value.source?.trim() || undefined,
        reason: value.reason?.trim() || undefined,
        description: value.description?.trim() || undefined,
      },
      { onSuccess: () => onClose() },
    );
  };

  return (
    <div
      className="flex flex-col gap-3 max-md:min-h-0 max-md:flex-1 max-md:pt-3 md:gap-0 md:pt-0"
      data-cy="tna-external-form-column"
    >
      <div
        className="max-h-[564px] min-h-0 overflow-y-auto px-4 max-md:flex-1 md:max-h-[783px] md:px-6"
        data-cy="tna-external-form-scroll-body"
      >
        <div
          className="box-border w-full max-w-full rounded-[8px] border border-[#D9D9D9] p-4 md:w-[607px]"
          data-cy="tna-external-form-frame"
        >
          {isRejected ? (
            <Alert
              type="info"
              showIcon
              className="mb-4"
              message="This request was rejected"
              description={
                existingRequest?.reason
                  ? `Reason: ${existingRequest.reason}`
                  : 'Update the details and save to have it reviewed again.'
              }
              data-cy="tna-external-form-rejected-alert"
            />
          ) : null}

          <Form
            layout="vertical"
            form={form}
            disabled={isLoading || isFetching}
            onFinish={onFinish}
            requiredMark={CustomLabel}
            className="w-full max-w-full p-0 md:w-[575px] [&_input]:placeholder:font-normal [&_textarea]:placeholder:font-normal max-md:[&_.ant-form-item]:mb-4"
            id="tnaExternalFormId"
            data-cy="tna-external-form"
          >
            <Form.Item
              name="courseName"
              label={
                <span
                  data-cy="tna-external-form-course-name-label"
                  className="text-[14px] font-normal"
                >
                  Course name
                </span>
              }
              rules={[{ required: true, message: 'Required' }]}
              className="form-item"
              data-cy="tna-external-form-course-name-item"
            >
              <Input
                className="h-[40px] rounded-[6px]"
                placeholder="e.g. Advanced Kubernetes Operations"
                id="tnaExternalCourseNameFieldId"
                data-cy="tna-external-form-course-name"
              />
            </Form.Item>

            <div
              className="grid grid-cols-1 gap-x-4 md:grid-cols-2"
              data-cy="tna-external-form-cost-row"
            >
              <Form.Item
                name="amount"
                label={
                  <span
                    data-cy="tna-external-form-amount-label"
                    className="text-[14px] font-normal"
                  >
                    Cost
                  </span>
                }
                rules={[{ required: true, message: 'Required' }]}
                className="form-item"
                data-cy="tna-external-form-amount-item"
              >
                <InputNumber
                  min={0}
                  className="control-number h-10 w-full"
                  suffix={<AiOutlineDollarCircle />}
                  placeholder="0.00"
                  id="tnaExternalAmountFieldId"
                  data-cy="tna-external-form-amount"
                />
              </Form.Item>

              <Form.Item
                name="currencyId"
                label={
                  <span
                    data-cy="tna-external-form-currency-label"
                    className="text-[14px] font-normal"
                  >
                    Currency
                  </span>
                }
                className="form-item"
                data-cy="tna-external-form-currency-item"
              >
                <Select
                  className="h-[40px] [&_.ant-select-selector]:!h-10 [&_.ant-select-selector]:!rounded-[8px]"
                  placeholder="Select currency"
                  allowClear
                  options={currencyOptions}
                  id="tnaExternalCurrencyFieldId"
                  data-cy="tna-external-form-currency"
                />
              </Form.Item>
            </div>

            <div
              className="grid grid-cols-1 gap-x-4 md:grid-cols-2"
              data-cy="tna-external-form-meta-row"
            >
              <Form.Item
                name="source"
                label={
                  <span
                    data-cy="tna-external-form-source-label"
                    className="text-[14px] font-normal"
                  >
                    Training provider
                  </span>
                }
                className="form-item"
                data-cy="tna-external-form-source-item"
              >
                <Input
                  className="h-[40px] rounded-[6px]"
                  placeholder="Institution or vendor (optional)"
                  id="tnaExternalSourceFieldId"
                  data-cy="tna-external-form-source"
                />
              </Form.Item>

              <Form.Item
                name="startDate"
                label={
                  <span
                    data-cy="tna-external-form-start-label"
                    className="text-[14px] font-normal"
                  >
                    Training start date
                  </span>
                }
                className="form-item"
                data-cy="tna-external-form-start-item"
              >
                <DatePicker
                  className="h-10 w-full rounded-[6px]"
                  id="tnaExternalStartFieldId"
                  data-cy="tna-external-form-start"
                />
              </Form.Item>
            </div>

            <Form.Item
              name="reason"
              label={
                <span
                  data-cy="tna-external-form-reason-label"
                  className="text-[14px] font-normal"
                >
                  Reason
                </span>
              }
              className="form-item"
              data-cy="tna-external-form-reason-item"
            >
              <Input
                className="h-[40px] rounded-[6px]"
                placeholder="Why this training is needed (optional)"
                maxLength={255}
                id="tnaExternalReasonFieldId"
                data-cy="tna-external-form-reason"
              />
            </Form.Item>

            <Form.Item
              name="description"
              label={
                <span
                  data-cy="tna-external-form-description-label"
                  className="text-[14px] font-normal"
                >
                  Description
                </span>
              }
              className="form-item"
              data-cy="tna-external-form-description-item"
            >
              <Input.TextArea
                rows={3}
                className="min-h-[72px] rounded-[6px]"
                placeholder="Business justification or extra detail (optional)"
                id="tnaExternalDescriptionFieldId"
                data-cy="tna-external-form-description"
              />
            </Form.Item>

            {/* Only worth asking when there is genuinely more than one. */}
            {hasWorkflowChoice && !existingRequest?.approvalWorkflowId ? (
              <Form.Item
                name="approvalWorkflowId"
                initialValue={workflowOptions[0]?.value}
                label={
                  <span
                    data-cy="tna-external-form-workflow-label"
                    className="text-[14px] font-normal"
                  >
                    Approval workflow
                  </span>
                }
                className="form-item"
                rules={[
                  { required: true, message: 'Select an approval workflow' },
                ]}
                data-cy="tna-external-form-workflow-item"
              >
                <Select
                  options={workflowOptions}
                  placeholder="Select approval workflow"
                  className="h-[54px] w-full"
                  id="tnaExternalWorkflowFieldId"
                  data-cy="tna-external-form-workflow"
                />
              </Form.Item>
            ) : null}

            <div
              className="rounded-[6px] bg-black/[0.02] px-3 py-2 text-xs leading-5 text-black/45"
              data-cy="tna-external-form-workflow-hint"
            >
              {resolvedWorkflowId || existingRequest?.approvalWorkflowId
                ? 'Your request goes to your assigned TNA approvers. After approval, upload your certificate (or failure proof) and record the end date. Once payment is recorded, a TNA Officer confirms it and your commitment period begins.'
                : 'No TNA approval workflow is assigned to you yet. Ask HR to configure one before submitting.'}
            </div>
          </Form>
        </div>
      </div>

      <div
        className="flex min-h-[52px] shrink-0 items-center justify-end gap-2 px-6 pb-5 pt-0 font-[Calibri,sans-serif] md:gap-3 md:pt-2"
        data-cy="tna-external-form-footer"
      >
        <Button
          htmlType="button"
          className="h-8 min-h-8 rounded-md border-[#D9D9D9] px-[15px] !text-sm !font-normal leading-[22px] text-black/70"
          onClick={onClose}
          data-cy="tna-external-form-cancel"
        >
          Cancel
        </Button>
        <Button
          type="primary"
          htmlType="button"
          className="h-8 min-h-8 rounded-lg border-[#1E40AF] bg-[#1E40AF] px-4 !text-sm !font-normal leading-[22px] text-white"
          loading={isLoading || isFetching}
          onClick={() => form.submit()}
          data-cy="tna-external-form-submit"
        >
          {trainingRequestId ? 'Save' : 'Submit Request'}
        </Button>
      </div>
    </div>
  );
};

export default ExternalTnaForm;
