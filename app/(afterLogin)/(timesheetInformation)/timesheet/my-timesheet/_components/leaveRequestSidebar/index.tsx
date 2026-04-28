import { useMyTimesheetStore } from '@/store/uistate/features/timesheet/myTimesheet';
import {
  Checkbox,
  Col,
  DatePicker,
  Form,
  Input,
  Modal,
  Row,
  Select,
  Space,
  Skeleton,
} from 'antd';
import CustomLabel from '@/components/form/customLabel/customLabel';
import CustomDrawerFooterButton, {
  CustomDrawerFooterButtonProps,
} from '@/components/common/customDrawer/customDrawerFooterButton';
import { useSetLeaveRequest } from '@/store/server/features/timesheet/leaveRequest/mutation';
import { formatLinkToUploadFile, formatToOptions } from '@/helpers/formatTo';
import { DATE_FORMAT } from '@/utils/constants';
import dayjs from 'dayjs';
import { LeaveRequest, LeaveRequestStatus } from '@/types/timesheet/settings';
import React, { useEffect, useState } from 'react';
import {
  useGetLeaveRequest,
  useGetSingleApproval,
} from '@/store/server/features/timesheet/leaveRequest/queries';
import CustomUpload from '@/components/form/customUpload';
import { InboxOutlined } from '@ant-design/icons';
import { MdKeyboardArrowDown } from 'react-icons/md';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { useAllApproval } from '@/store/server/features/approver/queries';
import { useGetAllUsers } from '@/store/server/features/employees/employeeManagment/queries';
import { APPROVALTYPES } from '@/types/enumTypes';
import { useGetLeaveTypes } from '@/store/server/features/timesheet/leaveType/queries';
import { useGetLeaveBalance } from '@/store/server/features/timesheet/leaveBalance/queries';

const LeaveRequestSidebar = () => {
  const {
    filter,
    setFilter,
    isShowLeaveRequestSidebar,
    setIsShowLeaveRequestSidebar,
    leaveRequestSidebarData,
    setLeaveRequestSidebarData,
  } = useMyTimesheetStore();
  const { data: leaveRequestData, refetch } = useGetLeaveRequest(
    { page: '1', limit: '1' },
    { filter },
    false,
    false,
  );
  const { data: approverLog } = useGetSingleApproval(leaveRequestSidebarData ?? '');
  const { userId } = useAuthenticationStore();
  const { data: employeeData } = useGetAllUsers();
  const { data: leaveTypesData } = useGetLeaveTypes();
  const { data: leaveBalanceData } = useGetLeaveBalance(userId ?? '', '');
  const userData = employeeData?.items?.find((item: any) => item.id === userId);

  const { data: approvalDepartmentData, refetch: getDepartmentApproval } =
    useAllApproval(
      userData?.employeeJobInformation[0]?.departmentId || '',
      APPROVALTYPES?.LEAVE,
    );

  const { data: approvalUserData, refetch: getUserApproval } = useAllApproval(
    userData?.id || '',
    APPROVALTYPES?.LEAVE,
  );

  useEffect(() => {
    if (userData?.employeeJobInformation[0]?.departmentId) {
      getDepartmentApproval();
    }
  }, [userData]);
  useEffect(() => {
    if (userData?.id) getUserApproval();
  }, [userData]);

  const {
    mutate: updateLeaveRequest,
    isLoading: isLoadingRequest,
    isSuccess: isSuccessUpdate,
  } = useSetLeaveRequest();
  const [leaveRequest, setLeaveRequest] = useState<LeaveRequest>();
  const [isLoading, setIsLoading] = useState(false);
  const [showApproverMessage, setShowApproverMessage] = useState(false);

  const [form] = Form.useForm();

  const selectedLeaveTypeId = Form.useWatch('type', form);
  const leaveBalanceItems =
    leaveBalanceData?.items?.items?.filter((item: any) => item.leaveType) ?? [];
  const selectedBalance = leaveBalanceItems.find(
    (item: any) => item?.leaveType?.id === selectedLeaveTypeId,
  );
  const availableDays =
    selectedBalance != null
      ? (selectedBalance.totalBalance ?? 0).toFixed(1)
      : null;

  const approverLogItems: any[] = Array.isArray(approverLog)
    ? approverLog
    : ((approverLog as any)?.items ?? []);

  const approvalHasApprovedStep = approverLogItems.some(
    (log) => String(log?.action ?? '').toLowerCase() === 'approved',
  );

  // If approval process has started (at least one "Approved" action), only allow editing
  // description + attachment while the leave is still pending.
  const lockCoreFields =
    !!leaveRequest && leaveRequest.status === LeaveRequestStatus.PENDING && approvalHasApprovedStep;

  useEffect(() => {
    if (leaveRequestSidebarData) {
      setFilter({
        leaveRequestsIds: [leaveRequestSidebarData!],
      });
      setIsLoading(true);
    }
  }, [leaveRequestSidebarData]);

  useEffect(() => {
    if (filter && Object.keys(filter).length) {
      refetch({}).finally(() => setIsLoading(false));
    }
  }, [filter]);

  useEffect(() => {
    if (leaveRequestData?.items) {
      setLeaveRequest(leaveRequestData.items[0]);
      setIsLoading(false);
    }
  }, [leaveRequestData]);

  useEffect(() => {
    if (leaveRequest) {
      form.setFieldValue(
        'type',
        typeof leaveRequest?.leaveType !== 'string' &&
          leaveRequest.leaveType?.id,
      );
      form.setFieldValue('isHalfday', leaveRequest.isHalfday);
      form.setFieldValue('startDate', dayjs(leaveRequest.startAt));
      form.setFieldValue('endDate', dayjs(leaveRequest.endAt));
      form.setFieldValue('note', leaveRequest.justificationNote);

      if (leaveRequest.justificationDocument) {
        form.setFieldValue('attachment', [
          formatLinkToUploadFile(leaveRequest.justificationDocument),
        ]);
      }
      if (leaveRequest.delegatee) {
        form.setFieldValue(
          'delegatee',
          typeof leaveRequest?.delegatee !== 'string' &&
            leaveRequest?.delegatee?.id,
        );
      }
    }
  }, [leaveRequest]);

  useEffect(() => {
    if (isSuccessUpdate) {
      onClose();
    }
  }, [isSuccessUpdate]);

  const onClose = () => {
    form.resetFields();
    setLeaveRequest(undefined);
    setFilter({});
    setIsLoading(false);
    setLeaveRequestSidebarData(null);
    setIsShowLeaveRequestSidebar(false);
    setShowApproverMessage(false);
  };

  useEffect(() => {
    // If opening the drawer for "add" (not edit)
    if (isShowLeaveRequestSidebar && !leaveRequestSidebarData) {
      setLeaveRequest(undefined);
      form.resetFields();
      setShowApproverMessage(false);
    }
  }, [isShowLeaveRequestSidebar, leaveRequestSidebarData]);

  useEffect(() => {
    // If the sidebar is open for edit, but the leave request is not editable, close and clear
    if (
      isShowLeaveRequestSidebar &&
      leaveRequestSidebarData && // means it's edit mode
      leaveRequest &&
      leaveRequest.status !== LeaveRequestStatus.PENDING // or whatever status means "editable"
    ) {
      onClose(); // This will clear the form and state
    }
  }, [isShowLeaveRequestSidebar, leaveRequestSidebarData, leaveRequest]);

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
      disabled: isLoadingRequest || isLoading,
      id: 'time-attendance-leave-request-sidebar-cancel-button',
      'data-cy': 'time-attendance-leave-request-sidebar-cancel-button',
    },
    {
      label: leaveRequest ? 'Update' : 'Submit Request',
      key: 'create',
      className: 'h-10 text-sm !px-4 !py-0 font-normal',
      size: 'large',
      type: 'primary',
      loading: isLoadingRequest || isLoading,
      disabled: hasNoApprover && !leaveRequest,
      onClick: () => form.submit(),
      id: 'time-attendance-leave-request-sidebar-submit-button',
      'data-cy': 'time-attendance-leave-request-sidebar-submit-button',
      tooltip:
        hasNoApprover && !leaveRequest
          ? 'You lack approver please contact your team lead for more information'
          : undefined,
      tooltipProps:
        hasNoApprover && !leaveRequest
          ? {
              overlayInnerStyle: {
                backgroundColor: 'white',
                color: '#1f2937',
                padding: '12px 16px',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                maxWidth: '300px',
                fontSize: '14px',
                fontWeight: 500,
              },
              color: 'white',
            }
          : undefined,
    },
  ];

  const onFinish = () => {
    // Check if there's no approver assigned
    if (approvalUserData?.length < 1 && approvalDepartmentData?.length < 1) {
      setShowApproverMessage(true);
      return;
    }

    const value = form.getFieldsValue();

    updateLeaveRequest({
      item: {
        ...(leaveRequest && leaveRequest),
        leaveType: value.type,
        delegatee: value.delegatee,
        isHalfday: !!value.isHalfday,
        startAt: dayjs(value.startDate).format('YYYY-MM-DD'),
        endAt: dayjs(value.endDate).format('YYYY-MM-DD'),
        justificationDocument: !!value.attachment?.length
          ? value.attachment[0]['response']
          : null,
        justificationNote: value.note,
        status: LeaveRequestStatus.PENDING,
        approvalWorkflowId:
          approvalUserData?.length > 0
            ? approvalUserData[0]?.id
            : approvalDepartmentData[0]?.id,
        approvalType: 'Leave',
      },
      userId,
    });
  };

  const typeOptions = () =>
    formatToOptions(leaveTypesData?.items ?? [], 'title', 'id');

  const itemClass =
    'text-xs [&_.ant-form-item-label]:mb-1.5 [&_.ant-form-item-label]:font-normal';
  const controlClass = 'w-full';

  const validateDates = () => {
    const startDate = form.getFieldValue('startDate');
    const endDate = form.getFieldValue('endDate');
    if (startDate && endDate) {
      if (dayjs(startDate).isAfter(dayjs(endDate))) {
        return Promise.reject(new Error('Invalid date'));
      }
    }
    return Promise.resolve();
  };

  const handleChange = () => {
    form.validateFields(['startDate', 'endDate']);
  };

  return (
    <Modal
      open={isShowLeaveRequestSidebar}
      onCancel={onClose}
      title={
        <div data-cy="time-attendance-leave-request-sidebar-title-container">
          <div
            className="text-base font-semibold"
            data-cy="time-attendance-leave-request-sidebar-title"
          >
            {leaveRequest ? 'Update Leave Request' : 'New Leave Request'}
          </div>
          {!leaveRequest && (
            <p
              className="text-sm font-normal text-gray-500 mt-1 mb-0"
              data-cy="time-attendance-leave-request-sidebar-description"
            >
              Fill in the details to submit a new leave request.
            </p>
          )}
        </div>
      }
      footer={
        <div
          className="flex justify-end gap-2 !pt-0 [&_.flex]:!py-0"
          id="time-attendance-leave-request-sidebar-footer"
          data-cy="time-attendance-leave-request-sidebar-footer"
        >
          <CustomDrawerFooterButton
            data-cy="time-attendance-leave-request-sidebar-footer-button"
            buttons={footerModalItems}
          />
        </div>
      }
      width={520}
      centered
      destroyOnClose
      data-cy="time-attendance-leave-request-sidebar-container"
      styles={{
        body: { paddingTop: 8 },
        footer: { paddingTop: 0, marginTop: 0 },
      }}
    >
      <Skeleton
        loading={isLoading || isLoadingRequest}
        active
        data-cy="time-attendance-leave-request-sidebar-spin"
      >
        <Form
          layout="vertical"
          requiredMark={CustomLabel}
          form={form}
          autoComplete="off"
          onFinish={onFinish}
          id="time-attendance-leave-request-sidebar-form"
          data-cy="time-attendance-leave-request-sidebar-form"
        >
          <Space.Compact
            direction="vertical"
            className="w-full px-3 sm:px-0 "
            id="time-attendance-leave-request-sidebar-form-fields"
            data-cy="time-attendance-leave-request-sidebar-form-fields"
          >
            <Form.Item
              name="type"
              label="Leave Type"
              rules={[{ required: true, message: 'Required' }]}
              className={itemClass}
              id="time-attendance-leave-request-sidebar-type"
              data-cy="time-attendance-leave-request-sidebar-type"
            >
              <Select
                className={controlClass}
                size="large"
                options={typeOptions()}
                placeholder="Select Leave Type"
                disabled={
                  leaveRequest?.status === LeaveRequestStatus.APPROVED ||
                  lockCoreFields
                }
                suffixIcon={
                  <MdKeyboardArrowDown
                    data-cy="time-attendance-leave-request-sidebar-type-select-icon"
                    size={16}
                    className="text-gray-900"
                  />
                }
                id="time-attendance-leave-request-sidebar-type-select"
                data-cy="time-attendance-leave-request-sidebar-type-select"
              />
            </Form.Item>
            {selectedLeaveTypeId && availableDays != null && (
              <p
                className="text-xs text-gray-500 -mt-1.5 mb-0"
                data-cy="time-attendance-leave-request-sidebar-available-days"
              >
                Available {availableDays} days
              </p>
            )}
            <Form.Item
              name="isHalfday"
              valuePropName="checked"
              className={itemClass}
              id="time-attendance-leave-request-sidebar-half-day"
              data-cy="time-attendance-leave-request-sidebar-half-day"
            >
              <Checkbox
                disabled={
                  leaveRequest?.status === LeaveRequestStatus.APPROVED ||
                  lockCoreFields
                }
                data-cy="time-attendance-leave-request-sidebar-half-day-checkbox"
              >
                Half Date
              </Checkbox>
            </Form.Item>
            <Row
              data-cy="time-attendance-leave-request-sidebar-date-row"
              gutter={16}
            >
              <Col
                data-cy="time-attendance-leave-request-sidebar-start-date-column"
                span={12}
              >
                <Form.Item
                  name="startDate"
                  label="Start Date "
                  rules={[
                    { required: true, message: 'Required' },
                    { validator: validateDates },
                  ]}
                  className={itemClass}
                  id="time-attendance-leave-request-sidebar-start-date"
                  data-cy="time-attendance-leave-request-sidebar-start-date"
                >
                  <DatePicker
                    className={controlClass}
                    size="large"
                    onChange={handleChange}
                    disabled={
                      leaveRequest?.status === LeaveRequestStatus.APPROVED ||
                      lockCoreFields
                    }
                    format={DATE_FORMAT}
                    id="time-attendance-leave-request-sidebar-start-date-picker"
                    data-cy="time-attendance-leave-request-sidebar-start-date-picker"
                  />
                </Form.Item>
              </Col>
              <Col
                span={12}
                data-cy="time-attendance-leave-request-sidebar-end-date-column"
              >
                <Form.Item
                  name="endDate"
                  label="End Date"
                  rules={[
                    { required: true, message: 'Required' },
                    { validator: validateDates },
                  ]}
                  className={itemClass}
                  id="time-attendance-leave-request-sidebar-end-date"
                  data-cy="time-attendance-leave-request-sidebar-end-date"
                >
                  <DatePicker
                    className={controlClass}
                    size="large"
                    onChange={handleChange}
                    disabled={
                      leaveRequest?.status === LeaveRequestStatus.APPROVED ||
                      lockCoreFields
                    }
                    format={DATE_FORMAT}
                    id="time-attendance-leave-request-sidebar-end-date-picker"
                    data-cy="time-attendance-leave-request-sidebar-end-date-picker"
                  />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item
              name="note"
              label="Reason"
              rules={[{ required: true, message: 'Required' }]}
              className={itemClass}
              id="time-attendance-leave-request-sidebar-reason"
              data-cy="time-attendance-leave-request-sidebar-reason"
            >
              <Input.TextArea
                rows={4}
                size="middle"
                className="w-full"
                placeholder="Reason"
                disabled={leaveRequest?.status === LeaveRequestStatus.APPROVED}
                id="time-attendance-leave-request-sidebar-reason-input"
                data-cy="time-attendance-leave-request-sidebar-reason-input"
              />
            </Form.Item>
            <Form.Item
              name="delegatee"
              label="Delegate"
              className={itemClass}
              id="time-attendance-leave-request-sidebar-delegatee"
              data-cy="time-attendance-leave-request-sidebar-delegatee"
            >
              <Select
                showSearch
                size="large"
                placeholder="Select Delegate"
                className={controlClass}
                allowClear
                disabled={lockCoreFields}
                filterOption={(input: any, option: any) =>
                  (option?.label ?? '')
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
                options={employeeData?.items?.map((item: any) => ({
                  value: item?.id,
                  label:
                    item?.firstName +
                    ' ' +
                    item?.middleName +
                    ' ' +
                    item?.lastName,
                }))}
                id="time-attendance-leave-request-sidebar-delegatee-select"
                data-cy="time-attendance-leave-request-sidebar-delegatee-select"
              />
            </Form.Item>
            <Form.Item
              name="attachment"
              label="Attachment (optional)"
              valuePropName="fileList"
              className={itemClass}
              id="time-attendance-leave-request-sidebar-attachment"
              data-cy="time-attendance-leave-request-sidebar-attachment"
              getValueFromEvent={(e) => {
                return Array.isArray(e) ? e : e && e.fileList;
              }}
            >
              <CustomUpload
                className="w-full"
                accept=".pdf,.docx,.png,.jpeg,.jpg"
                name="attachment"
                mode="draggable"
                maxCount={1}
                icon={
                  <InboxOutlined
                    style={{ fontSize: 40 }}
                    className="text-primary"
                  />
                }
                title="Click or drag file to this area to upload"
                dragTitleClassName="font-normal text-sm text-gray-700"
                dragSubtitleClassName="font-normal text-sm text-gray-500"
                showDragSubtitle={false}
                setIsLoading={setIsLoading}
                data-cy="time-attendance-leave-request-sidebar-attachment-upload"
              />
            </Form.Item>
            {showApproverMessage && (
              <div
                className="mt-6 mb-4 px-5 py-4 bg-white rounded-xl border-2 border-orange-200 shadow-md"
                id="time-attendance-leave-request-sidebar-approver-message"
                data-cy="time-attendance-leave-request-sidebar-approver-message"
              >
                <p
                  className="text-base font-medium text-gray-800 m-0 leading-relaxed"
                  id="time-attendance-leave-request-sidebar-approver-message-text"
                  data-cy="time-attendance-leave-request-sidebar-approver-message-text"
                >
                  You lack approver please contact your team lead for more
                  information
                </p>
              </div>
            )}
          </Space.Compact>
        </Form>
      </Skeleton>
    </Modal>
  );
};

export default LeaveRequestSidebar;
