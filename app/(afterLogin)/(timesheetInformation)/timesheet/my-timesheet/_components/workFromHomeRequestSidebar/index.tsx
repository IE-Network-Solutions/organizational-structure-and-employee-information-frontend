import { useMyTimesheetStore } from '@/store/uistate/features/timesheet/myTimesheet';
import { DatePicker, Form, Input, Modal, Skeleton, Space } from 'antd';
import CustomLabel from '@/components/form/customLabel/customLabel';
import CustomDrawerFooterButton, {
  CustomDrawerFooterButtonProps,
} from '@/components/common/customDrawer/customDrawerFooterButton';
import { useSetWorkFromHomeRequest } from '@/store/server/features/timesheet/workFromHome/mutation';
import React, { useEffect } from 'react';
import dayjs from 'dayjs';
import { DATE_FORMAT } from '@/utils/constants';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { useAllApproval } from '@/store/server/features/approver/queries';
import { useGetAllUsers } from '@/store/server/features/employees/employeeManagment/queries';

const WorkFromHomeRequestSidebar = () => {
  const {
    isShowWorkFromHomeRequestSidebar,
    setIsShowWorkFromHomeRequestSidebar,
  } = useMyTimesheetStore();
  const { userId } = useAuthenticationStore();
  const { data: employeeData } = useGetAllUsers();
  const userData = employeeData?.items?.find((item: any) => item.id === userId);
  const departmentId =
    userData?.employeeJobInformation?.[0]?.departmentId || '';
  const { data: approvalDepartmentData, refetch: getDepartmentApproval } =
    useAllApproval(departmentId, 'WorkFromHome');
  const { data: approvalUserData, refetch: getUserApproval } = useAllApproval(
    userId || '',
    'WorkFromHome',
  );
  const { mutate: createRequest, isLoading } = useSetWorkFromHomeRequest();
  const [form] = Form.useForm();

  useEffect(() => {
    if (!isShowWorkFromHomeRequestSidebar) return;
    if (departmentId) {
      getDepartmentApproval();
    }
    if (userId) {
      getUserApproval();
    }
  }, [
    isShowWorkFromHomeRequestSidebar,
    departmentId,
    userId,
    getDepartmentApproval,
    getUserApproval,
  ]);

  const onClose = () => {
    form.resetFields();
    setIsShowWorkFromHomeRequestSidebar(false);
  };

  const hasNoApprover =
    (approvalUserData?.length ?? 0) < 1 &&
    (approvalDepartmentData?.length ?? 0) < 1;

  const footerModalItems: CustomDrawerFooterButtonProps[] = [
    {
      label: 'Cancel',
      key: 'cancel',
      className:
        'h-10 text-sm !px-4 !py-0 font-normal border-gray-300 text-gray-700',
      size: 'middle',
      onClick: () => onClose(),
      disabled: isLoading,
      id: 'time-attendance-work-from-home-request-sidebar-cancel-button',
      'data-cy': 'time-attendance-work-from-home-request-sidebar-cancel-button',
    },
    {
      label: 'Submit Request',
      key: 'create',
      className: 'h-10 text-sm !px-4 !py-0 font-normal',
      size: 'large',
      type: 'primary',
      loading: isLoading,
      disabled: hasNoApprover,
      onClick: () => form.submit(),
      id: 'time-attendance-work-from-home-request-sidebar-submit-button',
      'data-cy': 'time-attendance-work-from-home-request-sidebar-submit-button',
    },
  ];

  const onFinish = () => {
    if (hasNoApprover) {
      return;
    }

    const value = form.getFieldsValue();
    const days = dayjs(value.endDate).diff(dayjs(value.startDate), 'day') + 1;
    const approvalWorkflowId =
      approvalUserData?.length > 0
        ? approvalUserData[0]?.id
        : approvalDepartmentData?.length > 0
          ? approvalDepartmentData[0]?.id
          : undefined;

    createRequest(
      {
        item: {
          startAt: dayjs(value.startDate).format('YYYY-MM-DD'),
          endAt: dayjs(value.endDate).format('YYYY-MM-DD'),
          days,
          reason: value.reason,
          status: 'Pending',
          approvalType: 'WorkFromHome',
          approvalWorkflowId,
        },
        userId: userId || '',
      },
      {
        onSuccess: () => onClose(),
      },
    );
  };

  const itemClass =
    'text-xs [&_.ant-form-item-label]:mb-1.5 [&_.ant-form-item-label]:font-normal';
  const controlClass = 'w-full';

  const validateDates = () => {
    const startDate = form.getFieldValue('startDate');
    const endDate = form.getFieldValue('endDate');
    if (startDate && endDate && dayjs(startDate).isAfter(dayjs(endDate))) {
      return Promise.reject(new Error('Invalid date'));
    }
    return Promise.resolve();
  };

  const handleChange = () => {
    form.validateFields(['startDate', 'endDate']);
  };

  return (
    <Modal
      open={isShowWorkFromHomeRequestSidebar}
      onCancel={onClose}
      title={
        <div data-cy="time-attendance-work-from-home-request-sidebar-title-container">
          <div
            className="text-base font-semibold"
            data-cy="time-attendance-work-from-home-request-sidebar-title"
          >
            New Work From Home Request
          </div>
          <p
            className="text-sm font-normal text-gray-500 mt-1 mb-0"
            data-cy="time-attendance-work-from-home-request-sidebar-description"
          >
            Fill in the details to submit a new work from home request.
          </p>
          {hasNoApprover && (
            <div
              className="mt-3 px-1 py-1"
              data-cy="time-attendance-work-from-home-request-sidebar-approver-message"
            >
              <p
                className="m-0 text-sm font-semibold leading-relaxed text-red-600"
                data-cy="time-attendance-work-from-home-request-sidebar-approver-message-text"
              >
                You lack approver please contact your team lead for more
                information
              </p>
            </div>
          )}
        </div>
      }
      footer={
        <div
          className="flex justify-end gap-2 !pt-0 [&_.flex]:!py-0"
          data-cy="time-attendance-work-from-home-request-sidebar-footer"
        >
          <CustomDrawerFooterButton
            data-cy="time-attendance-work-from-home-request-sidebar-footer-button"
            buttons={footerModalItems}
          />
        </div>
      }
      width={520}
      centered
      destroyOnClose
      data-cy="time-attendance-work-from-home-request-sidebar-container"
      styles={{
        body: { paddingTop: 8 },
        footer: { paddingTop: 0, marginTop: 0 },
      }}
    >
      <Skeleton
        loading={isLoading}
        active
        data-cy="time-attendance-work-from-home-request-sidebar-spin"
      >
        <Form
          layout="vertical"
          requiredMark={CustomLabel}
          form={form}
          autoComplete="off"
          onFinish={onFinish}
          data-cy="time-attendance-work-from-home-request-sidebar-form"
        >
          <Space.Compact direction="vertical" className="w-full px-3 sm:px-0 ">
            <Form.Item
              name="startDate"
              label="Start Date"
              rules={[
                { required: true, message: 'Required' },
                { validator: validateDates },
              ]}
              className={itemClass}
            >
              <DatePicker
                className={controlClass}
                size="large"
                onChange={handleChange}
                format={DATE_FORMAT}
                disabled={hasNoApprover}
              />
            </Form.Item>
            <Form.Item
              name="endDate"
              label="End Date"
              rules={[
                { required: true, message: 'Required' },
                { validator: validateDates },
              ]}
              className={itemClass}
            >
              <DatePicker
                className={controlClass}
                size="large"
                onChange={handleChange}
                format={DATE_FORMAT}
                disabled={hasNoApprover}
              />
            </Form.Item>
            <Form.Item
              name="reason"
              label="Reason"
              rules={[{ required: true, message: 'Required' }]}
              className={itemClass}
            >
              <Input.TextArea
                rows={4}
                size="middle"
                className="w-full"
                placeholder="Reason"
                disabled={hasNoApprover}
              />
            </Form.Item>
          </Space.Compact>
        </Form>
      </Skeleton>
    </Modal>
  );
};

export default WorkFromHomeRequestSidebar;
