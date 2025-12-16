import { useMyTimesheetStore } from '@/store/uistate/features/timesheet/myTimesheet';
import CustomDrawerLayout from '@/components/common/customDrawer';
import { Col, DatePicker, Form, Input, Row, Select, Space, Spin } from 'antd';
import CustomLabel from '@/components/form/customLabel/customLabel';
import CustomRadio from '@/components/form/customRadio';
import CustomDrawerFooterButton, {
  CustomDrawerFooterButtonProps,
} from '@/components/common/customDrawer/customDrawerFooterButton';
import CustomDrawerHeader from '@/components/common/customDrawer/customDrawerHeader';
import { useSetLeaveRequest } from '@/store/server/features/timesheet/leaveRequest/mutation';
import { formatLinkToUploadFile, formatToOptions } from '@/helpers/formatTo';
import { DATE_FORMAT } from '@/utils/constants';
import dayjs from 'dayjs';
import { LeaveRequest, LeaveRequestStatus } from '@/types/timesheet/settings';
import React, { useEffect, useState } from 'react';
import { useGetLeaveRequest } from '@/store/server/features/timesheet/leaveRequest/queries';
import CustomUpload from '@/components/form/customUpload';
import { MdKeyboardArrowDown } from 'react-icons/md';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { useAllApproval } from '@/store/server/features/approver/queries';
import { useGetAllUsers } from '@/store/server/features/employees/employeeManagment/queries';
import { APPROVALTYPES } from '@/types/enumTypes';
import { useGetLeaveTypes } from '@/store/server/features/timesheet/leaveType/queries';

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
  const { userId } = useAuthenticationStore();
  const { data: employeeData } = useGetAllUsers();
  const { data: leaveTypesData } = useGetLeaveTypes();
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

  const [form] = Form.useForm();

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
  };

  useEffect(() => {
    // If opening the drawer for "add" (not edit)
    if (isShowLeaveRequestSidebar && !leaveRequestSidebarData) {
      setLeaveRequest(undefined);
      form.resetFields();
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

  const footerModalItems: CustomDrawerFooterButtonProps[] = [
    {
      label: 'Cancel',
      key: 'cancel',
      className: 'h-[40px] sm:h-[56px] text-base',
      size: 'large',
      onClick: () => onClose(),
      disabled: isLoadingRequest || isLoading,
      id: 'time-attendance-leave-request-sidebar-cancel-button',
      'data-cy': 'time-attendance-leave-request-sidebar-cancel-button',
    },
    {
      label:
        approvalUserData?.length < 1 && approvalDepartmentData?.length < 1
          ? 'You lack an assigned approver.'
          : leaveRequest
            ? 'Update'
            : 'Create',
      key: 'create',
      className: 'h-[40px] sm:h-[56px] text-base',
      size: 'large',
      type: 'primary',
      loading: isLoadingRequest || isLoading,
      onClick: () => form.submit(),
      disabled:
        approvalUserData?.length < 1 && approvalDepartmentData?.length < 1,
      id: 'time-attendance-leave-request-sidebar-submit-button',
      'data-cy': 'time-attendance-leave-request-sidebar-submit-button',
    },
  ];

  const onFinish = () => {
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

  const itemClass = 'font-semibold text-xs';
  const controlClass = 'mt-2.5 h-[40px] sm:h-[51px] w-full';
  const onChangeIsHalfDay = (isHalf: any) => {
    form.setFieldValue('isHalfDay', !!isHalf);
  };

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
    isShowLeaveRequestSidebar && (
      <CustomDrawerLayout
        data-cy="time-attendance-leave-request-sidebar-container"
        open={isShowLeaveRequestSidebar}
        onClose={onClose}
        modalHeader={
          <CustomDrawerHeader data-cy="time-attendance-leave-request-sidebar-header">
            {leaveRequest ? 'Update' : 'Add New'} Leave Request
          </CustomDrawerHeader>
        }
        footer={
          <div
            className="p-6 sm:p-0"
            id="time-attendance-leave-request-sidebar-footer"
            data-cy="time-attendance-leave-request-sidebar-footer"
          >
            <CustomDrawerFooterButton
              data-cy="time-attendance-leave-request-sidebar-footer-button"
              buttons={footerModalItems}
            />
          </div>
        }
        width="400px"
      >
        <Spin
          spinning={isLoading || isLoadingRequest}
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
                  options={typeOptions()}
                  placeholder="Select Type"
                  disabled={
                    leaveRequest?.status === LeaveRequestStatus.APPROVED
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
              <Form.Item
                name="isHalfday"
                className={itemClass}
                id="time-attendance-leave-request-sidebar-half-day"
                data-cy="time-attendance-leave-request-sidebar-half-day"
              >
                <CustomRadio
                  label="Half Day"
                  initialValue={leaveRequest?.isHalfday}
                  disabled={
                    leaveRequest?.status === LeaveRequestStatus.APPROVED
                  }
                  onChange={onChangeIsHalfDay}
                  data-cy="time-attendance-leave-request-sidebar-half-day-radio"
                />
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
                      onChange={handleChange}
                      disabled={
                        leaveRequest?.status === LeaveRequestStatus.APPROVED
                      }
                      format={DATE_FORMAT}
                      id="time-attendance-leave-request-sidebar-start-date-picker"
                      data-cy="time-attendance-leave-request-sidebar-start-date-picker"
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
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
                      onChange={handleChange}
                      disabled={
                        leaveRequest?.status === LeaveRequestStatus.APPROVED
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
                label="Note"
                className={itemClass}
                id="time-attendance-leave-request-sidebar-note"
                data-cy="time-attendance-leave-request-sidebar-note"
              >
                <Input
                  className={controlClass}
                  disabled={
                    leaveRequest?.status === LeaveRequestStatus.APPROVED
                  }
                  id="time-attendance-leave-request-sidebar-note-input"
                  data-cy="time-attendance-leave-request-sidebar-note-input"
                />
              </Form.Item>
              <Form.Item
                name="attachment"
                label="Attachment"
                valuePropName="fileList"
                className={itemClass}
                id="time-attendance-leave-request-sidebar-attachment"
                data-cy="time-attendance-leave-request-sidebar-attachment"
                getValueFromEvent={(e) => {
                  return Array.isArray(e) ? e : e && e.fileList;
                }}
              >
                <CustomUpload
                  className="w-full "
                  accept=".pdf,.docx,.png,.jpeg,.jpg"
                  name="attachment"
                  listType="text"
                  maxCount={1}
                  setIsLoading={setIsLoading}
                  data-cy="time-attendance-leave-request-sidebar-attachment-upload"
                />
              </Form.Item>
              <div
                className="text-xs font-medium text-gray-600 text-start mb-3"
                id="time-attendance-leave-request-sidebar-attachment-hint"
                data-cy="time-attendance-leave-request-sidebar-attachment-hint"
              >
                Max file size : 5MB. File format : pdf, docx, epub, and jpeg
              </div>
              <Form.Item
                name="delegatee"
                label="Delegated Employee"
                className={itemClass}
                id="time-attendance-leave-request-sidebar-delegatee"
                data-cy="time-attendance-leave-request-sidebar-delegatee"
              >
                <Select
                  showSearch
                  placeholder="Select a person"
                  className={controlClass}
                  allowClear
                  filterOption={(input: any, option: any) =>
                    (option?.label ?? '')
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                  options={employeeData?.items?.map((item: any) => ({
                    //  ...item,
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
            </Space.Compact>
          </Form>
        </Spin>
      </CustomDrawerLayout>
    )
  );
};

export default LeaveRequestSidebar;
