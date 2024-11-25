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

const LeaveRequestSidebar = () => {
  const {
    filter,
    setFilter,
    isShowLeaveRequestSidebar,
    setIsShowLeaveRequestSidebar,
    leaveTypes,
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
    if (userData?.employeeJobInformation[0]?.departmentId)
      getDepartmentApproval();
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

  const footerModalItems: CustomDrawerFooterButtonProps[] = [
    {
      label: 'Cancel',
      key: 'cancel',
      className: 'h-[56px] text-base',
      size: 'large',
      loading: isLoadingRequest || isLoading,
      onClick: () => onClose(),
    },
    {
      label:
        approvalUserData?.length < 1 && approvalDepartmentData?.length < 1
          ? 'You lack an assigned approver.'
          : leaveRequest
            ? 'Update'
            : 'Create',
      key: 'create',
      className: 'h-[56px] text-base',
      size: 'large',
      type: 'primary',
      loading: isLoadingRequest || isLoading,
      onClick: () => form.submit(),
      disabled:
        approvalUserData?.length < 1 && approvalDepartmentData?.length < 1,
    },
  ];

  const onFinish = () => {
    const value = form.getFieldsValue();

    updateLeaveRequest({
      item: {
        ...(leaveRequest && leaveRequest),
        leaveType: value.type,
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

  const typeOptions = () => formatToOptions(leaveTypes ?? [], 'title', 'id');

  const itemClass = 'font-semibold text-xs';
  const controlClass = 'mt-2.5 h-[54px] w-full';
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
        open={isShowLeaveRequestSidebar}
        onClose={onClose}
        modalHeader={
          <CustomDrawerHeader>
            {leaveRequest ? 'Update' : 'Add New'} Leave Request
          </CustomDrawerHeader>
        }
        footer={<CustomDrawerFooterButton buttons={footerModalItems} />}
        width="400px"
      >
        <Spin spinning={isLoading || isLoadingRequest}>
          <Form
            layout="vertical"
            requiredMark={CustomLabel}
            form={form}
            autoComplete="off"
            onFinish={onFinish}
          >
            <Space className="w-full" direction="vertical" size={12}>
              <Form.Item
                name="type"
                label="Leave Type"
                rules={[{ required: true, message: 'Required' }]}
                className={itemClass}
              >
                <Select
                  className={controlClass}
                  options={typeOptions()}
                  placeholder="Select Type"
                  disabled={
                    leaveRequest?.status === LeaveRequestStatus.APPROVED
                  }
                  suffixIcon={
                    <MdKeyboardArrowDown size={16} className="text-gray-900" />
                  }
                />
              </Form.Item>
              <Form.Item name="isHalfday" className={itemClass}>
                <CustomRadio
                  label="Half Day"
                  initialValue={leaveRequest?.isHalfday}
                  disabled={
                    leaveRequest?.status === LeaveRequestStatus.APPROVED
                  }
                  onChange={onChangeIsHalfDay}
                />
              </Form.Item>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="startDate"
                    label="Start Date "
                    rules={[
                      { required: true, message: 'Required' },
                      { validator: validateDates },
                    ]}
                    className={itemClass}
                  >
                    <DatePicker
                      className={controlClass}
                      onChange={handleChange}
                      minDate={dayjs()}
                      disabled={
                        leaveRequest?.status === LeaveRequestStatus.APPROVED
                      }
                      format={DATE_FORMAT}
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
                  >
                    <DatePicker
                      className={controlClass}
                      onChange={handleChange}
                      minDate={dayjs()}
                      disabled={
                        leaveRequest?.status === LeaveRequestStatus.APPROVED
                      }
                      format={DATE_FORMAT}
                    />
                  </Form.Item>
                </Col>
              </Row>
              <Form.Item name="note" label="Note" className={itemClass}>
                <Input
                  className={controlClass}
                  disabled={
                    leaveRequest?.status === LeaveRequestStatus.APPROVED
                  }
                />
              </Form.Item>
              <Form.Item
                name="attachment"
                label="Attachment"
                valuePropName="fileList"
                className={itemClass}
                getValueFromEvent={(e) => {
                  return Array.isArray(e) ? e : e && e.fileList;
                }}
              >
                <CustomUpload
                  className="w-full"
                  accept=".pdf,.docx,.png,.jpeg,.jpg"
                  name="attachment"
                  listType="text"
                  maxCount={1}
                  setIsLoading={setIsLoading}
                />
              </Form.Item>
              <div className="text-xs font-medium text-gray-600 text-center">
                Max file size : 5MB. File format : pdf, docx, png, and jpeg
              </div>
            </Space>
          </Form>
        </Spin>
      </CustomDrawerLayout>
    )
  );
};

export default LeaveRequestSidebar;
