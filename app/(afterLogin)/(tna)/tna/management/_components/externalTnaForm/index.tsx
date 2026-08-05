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
import { useGetEmployee } from '@/store/server/features/employees/employeeDetail/queries';
import { useGetDepartments } from '@/store/server/features/employees/employeeManagment/department/queries';
import { useGetTnaCategory } from '@/store/server/features/tna/category/queries';
import { useCurrency } from '@/store/server/features/tna/review/queries';
import { useGetExternalTrainingById } from '@/store/server/features/tna/externalTraining/queries';
import { useSetExternalTraining } from '@/store/server/features/tna/externalTraining/mutation';
import { ExternalTrainingStatus } from '@/types/tna/externalTna';

interface ExternalTnaFormProps {
  externalTrainingId?: string | null;
  onClose: () => void;
}

/**
 * Free-text request for a training that is not in the course catalogue. Only
 * the course name and cost are mandatory; the rest helps the manager and the
 * TNA Officer decide.
 */
const ExternalTnaForm: FC<ExternalTnaFormProps> = ({
  externalTrainingId,
  onClose,
}) => {
  const [form] = Form.useForm();
  const { userId } = useAuthenticationStore();

  const { data: employeeData } = useGetEmployee(userId);
  const { data: departmentData } = useGetDepartments();
  const { data: currencies } = useCurrency();
  const { data: tnaCategoryData } = useGetTnaCategory({});
  const { data: existingRequest, isFetching } = useGetExternalTrainingById(
    externalTrainingId ?? '',
    !!externalTrainingId,
  );

  const { mutate: saveExternalTraining, isLoading } = useSetExternalTraining();

  const managerId = useMemo(
    () =>
      employeeData?.delegatedTo?.id ??
      employeeData?.reportingTo?.id ??
      employeeData?.employeeJobInformation?.[0]?.reportingToId ??
      null,
    [employeeData],
  );

  const managerName = useMemo(() => {
    const manager = employeeData?.delegatedTo ?? employeeData?.reportingTo;
    if (!manager) return null;
    return (
      [manager.firstName, manager.middleName, manager.lastName]
        .filter(Boolean)
        .join(' ') || null
    );
  }, [employeeData]);

  const defaultDepartmentId =
    employeeData?.employeeJobInformation?.[0]?.departmentId ?? undefined;

  const currencyOptions = useMemo(() => {
    const list = Array.isArray(currencies)
      ? currencies
      : (currencies?.items ?? []);
    return formatToOptions(list, 'code', 'id');
  }, [currencies]);

  const isRejected =
    existingRequest?.status === ExternalTrainingStatus.REJECTED;

  useEffect(() => {
    if (externalTrainingId && existingRequest) {
      form.setFieldsValue({
        courseName: existingRequest.courseName,
        cost: existingRequest.cost,
        currencyId: existingRequest.currencyId ?? undefined,
        trainingProvider: existingRequest.trainingProvider ?? undefined,
        courseLink: existingRequest.courseLink ?? undefined,
        trainingNeedCategoryId:
          existingRequest.trainingNeedCategoryId ?? undefined,
        departmentId: existingRequest.departmentId ?? defaultDepartmentId,
        businessJustification:
          existingRequest.businessJustification ?? undefined,
        trainingPeriod:
          existingRequest.trainingStartDate && existingRequest.trainingEndDate
            ? [
                dayjs(existingRequest.trainingStartDate),
                dayjs(existingRequest.trainingEndDate),
              ]
            : undefined,
      });
    } else if (!externalTrainingId) {
      form.resetFields();
      form.setFieldsValue({ departmentId: defaultDepartmentId });
    }
  }, [externalTrainingId, existingRequest, defaultDepartmentId, form]);

  const onFinish = () => {
    const value = form.getFieldsValue();
    const [start, end] = value.trainingPeriod ?? [];

    saveExternalTraining(
      [
        {
          ...(externalTrainingId ? { id: externalTrainingId } : {}),
          courseName: value.courseName?.trim(),
          cost: Number(value.cost),
          currencyId: value.currencyId ?? null,
          trainingProvider: value.trainingProvider?.trim() || null,
          courseLink: value.courseLink?.trim() || null,
          businessJustification: value.businessJustification?.trim() || null,
          trainingNeedCategoryId: value.trainingNeedCategoryId ?? null,
          trainingStartDate: start ? start.toISOString() : null,
          trainingEndDate: end ? end.toISOString() : null,
          requestedBy: existingRequest?.requestedBy ?? userId ?? undefined,
          departmentId: value.departmentId ?? null,
          managerId: existingRequest?.managerId ?? managerId,
          ...(isRejected ? { resubmit: true } : {}),
        },
      ],
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
          {!managerId && !externalTrainingId ? (
            <Alert
              type="warning"
              showIcon
              className="mb-4"
              message="No direct manager on file"
              description="Your request will go straight to the TNA Officer queue once a manager is assigned. Contact HR if this looks wrong."
              data-cy="tna-external-form-no-manager-alert"
            />
          ) : null}

          {isRejected ? (
            <Alert
              type="info"
              showIcon
              className="mb-4"
              message="This request was rejected"
              description={
                existingRequest?.rejectionReason
                  ? `Reason: ${existingRequest.rejectionReason}. Saving will resubmit it to your manager.`
                  : 'Saving will resubmit it to your manager.'
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
                name="cost"
                label={
                  <span
                    data-cy="tna-external-form-cost-label"
                    className="text-[14px] font-normal"
                  >
                    Cost
                  </span>
                }
                rules={[{ required: true, message: 'Required' }]}
                className="form-item"
                data-cy="tna-external-form-cost-item"
              >
                <InputNumber
                  min={0}
                  className="control-number h-10 w-full"
                  suffix={<AiOutlineDollarCircle />}
                  placeholder="0.00"
                  id="tnaExternalCostFieldId"
                  data-cy="tna-external-form-cost"
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

            <Form.Item
              name="trainingProvider"
              label={
                <span
                  data-cy="tna-external-form-provider-label"
                  className="text-[14px] font-normal"
                >
                  Training provider
                </span>
              }
              className="form-item"
              data-cy="tna-external-form-provider-item"
            >
              <Input
                className="h-[40px] rounded-[6px]"
                placeholder="Institution or vendor (optional)"
                id="tnaExternalProviderFieldId"
                data-cy="tna-external-form-provider"
              />
            </Form.Item>

            <Form.Item
              name="courseLink"
              label={
                <span
                  data-cy="tna-external-form-link-label"
                  className="text-[14px] font-normal"
                >
                  Course link
                </span>
              }
              rules={[{ type: 'url', message: 'Enter a valid URL' }]}
              className="form-item"
              data-cy="tna-external-form-link-item"
            >
              <Input
                className="h-[40px] rounded-[6px]"
                placeholder="https://... (optional)"
                id="tnaExternalLinkFieldId"
                data-cy="tna-external-form-link"
              />
            </Form.Item>

            <div
              className="grid grid-cols-1 gap-x-4 md:grid-cols-2"
              data-cy="tna-external-form-meta-row"
            >
              <Form.Item
                name="trainingNeedCategoryId"
                label={
                  <span
                    data-cy="tna-external-form-category-label"
                    className="text-[14px] font-normal"
                  >
                    Training category
                  </span>
                }
                className="form-item"
                data-cy="tna-external-form-category-item"
              >
                <Select
                  className="h-[40px] [&_.ant-select-selector]:!h-10 [&_.ant-select-selector]:!rounded-[8px]"
                  placeholder="Select category"
                  allowClear
                  options={formatToOptions(
                    tnaCategoryData?.items ?? [],
                    'name',
                    'id',
                  )}
                  id="tnaExternalCategoryFieldId"
                  data-cy="tna-external-form-category"
                />
              </Form.Item>

              <Form.Item
                name="departmentId"
                label={
                  <span
                    data-cy="tna-external-form-department-label"
                    className="text-[14px] font-normal"
                  >
                    Department
                  </span>
                }
                className="form-item"
                data-cy="tna-external-form-department-item"
              >
                <Select
                  className="h-[40px] [&_.ant-select-selector]:!h-10 [&_.ant-select-selector]:!rounded-[8px]"
                  placeholder="Select department"
                  allowClear
                  options={formatToOptions(departmentData ?? [], 'name', 'id')}
                  id="tnaExternalDepartmentFieldId"
                  data-cy="tna-external-form-department"
                />
              </Form.Item>
            </div>

            <Form.Item
              name="trainingPeriod"
              label={
                <span
                  data-cy="tna-external-form-period-label"
                  className="text-[14px] font-normal"
                >
                  Training period
                </span>
              }
              className="form-item"
              data-cy="tna-external-form-period-item"
            >
              <DatePicker.RangePicker
                className="h-10 w-full rounded-[6px]"
                id="tnaExternalPeriodFieldId"
                data-cy="tna-external-form-period"
              />
            </Form.Item>

            <Form.Item
              name="businessJustification"
              label={
                <span
                  data-cy="tna-external-form-justification-label"
                  className="text-[14px] font-normal"
                >
                  Business justification
                </span>
              }
              className="form-item"
              data-cy="tna-external-form-justification-item"
            >
              <Input.TextArea
                rows={3}
                className="min-h-[72px] rounded-[6px]"
                placeholder="Why does the business need this training? (optional)"
                id="tnaExternalJustificationFieldId"
                data-cy="tna-external-form-justification"
              />
            </Form.Item>

            <div
              className="rounded-[6px] bg-black/[0.02] px-3 py-2 text-xs leading-5 text-black/45"
              data-cy="tna-external-form-workflow-hint"
            >
              Approval flow:{' '}
              {managerName ? `${managerName} (Manager)` : 'Manager'} &rarr; TNA
              Officer (confirms payment and sets your commitment period).
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
          {externalTrainingId
            ? isRejected
              ? 'Resubmit'
              : 'Save'
            : 'Submit Request'}
        </Button>
      </div>
    </div>
  );
};

export default ExternalTnaForm;
