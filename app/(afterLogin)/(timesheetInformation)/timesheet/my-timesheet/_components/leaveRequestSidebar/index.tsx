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
import NotificationMessage from '@/components/common/notification/notificationMessage';
import { showValidationErrors } from '@/utils/showValidationErrors';

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

  const { 
    data: approvalDepartmentData, 
    refetch: getDepartmentApproval, 
    isLoading: isLoadingDepartmentApproval,
    error: departmentApprovalError,
  } = useAllApproval(
    userData?.employeeJobInformation[0]?.departmentId || '',
    APPROVALTYPES?.LEAVE,
  );

  const { 
    data: approvalUserData, 
    refetch: getUserApproval, 
    isLoading: isLoadingUserApproval,
    error: userApprovalError,
  } = useAllApproval(
    userData?.id || '',
    APPROVALTYPES?.LEAVE,
  );

  // Check for CORS errors
  useEffect(() => {
    const departmentError = departmentApprovalError as any;
    const userError = userApprovalError as any;
    const hasCorsError = 
      (departmentError && (
        (typeof departmentError?.message === 'string' && 
         (departmentError.message.includes('CORS') || departmentError.message.includes('blocked'))) ||
        departmentError?.response?.status === 0
      )) ||
      (userError && (
        (typeof userError?.message === 'string' && 
         (userError.message.includes('CORS') || userError.message.includes('blocked'))) ||
        userError?.response?.status === 0
      ));
    
    if (hasCorsError && isShowLeaveRequestSidebar) {
      NotificationMessage.warning({
        message: 'CORS Configuration Issue',
        description: 'Unable to fetch approval workflows due to CORS policy. Please contact your administrator to configure CORS on the backend server.',
      });
    }
  }, [departmentApprovalError, userApprovalError, isShowLeaveRequestSidebar]);

  // Refetch approval data when sidebar opens and userData is available
  useEffect(() => {
    if (isShowLeaveRequestSidebar && userData) {
      const timer = setTimeout(() => {
        const departmentId = userData?.employeeJobInformation?.[0]?.departmentId;
        const userId = userData?.id;
        
        if (departmentId && departmentId !== '') {
          getDepartmentApproval();
        }
        if (userId && userId !== '') {
          getUserApproval();
        }
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [isShowLeaveRequestSidebar, userData?.id, userData?.employeeJobInformation?.[0]?.departmentId]);

  // Debug: Log approval data to see what's being returned
  useEffect(() => {
    if (isShowLeaveRequestSidebar) {
      console.log('=== Approval Workflow Data Debug ===');
      console.log('Approval User Data:', approvalUserData);
      console.log('Approval User Data Type:', typeof approvalUserData);
      console.log('Is Array?', Array.isArray(approvalUserData));
      console.log('Approval Department Data:', approvalDepartmentData);
      console.log('Approval Department Data Type:', typeof approvalDepartmentData);
      console.log('Is Array?', Array.isArray(approvalDepartmentData));
      console.log('User Data:', userData);
      console.log('User ID:', userData?.id);
      console.log('Department ID:', userData?.employeeJobInformation?.[0]?.departmentId);
      console.log('User Approval Error:', userApprovalError);
      console.log('Department Approval Error:', departmentApprovalError);
      console.log('=====================================');
    }
  }, [isShowLeaveRequestSidebar, approvalUserData, approvalDepartmentData, userData, userApprovalError, departmentApprovalError]);

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
    },
    {
      label:
        (() => {
          const approvalUserArray = Array.isArray(approvalUserData)
            ? approvalUserData
            : approvalUserData?.items || [];
          const approvalDepartmentArray = Array.isArray(approvalDepartmentData)
            ? approvalDepartmentData
            : approvalDepartmentData?.items || [];
          return approvalUserArray.length < 1 && approvalDepartmentArray.length < 1
            ? 'You lack an assigned approver.'
            : leaveRequest
              ? 'Update'
              : 'Create';
        })(),
      key: 'create',
      className: 'h-[40px] sm:h-[56px] text-base',
      size: 'large',
      type: 'primary',
      loading: isLoadingRequest || isLoading || isLoadingDepartmentApproval || isLoadingUserApproval,
      onClick: () => form.submit(),
      disabled:
        (() => {
          const approvalUserArray = Array.isArray(approvalUserData)
            ? approvalUserData
            : approvalUserData?.items || [];
          const approvalDepartmentArray = Array.isArray(approvalDepartmentData)
            ? approvalDepartmentData
            : approvalDepartmentData?.items || [];
          return approvalUserArray.length < 1 && approvalDepartmentArray.length < 1;
        })(),
    },
  ];

  const onFinish = () => {
    const value = form.getFieldsValue();

    // Validate required fields
    if (!value.type) {
      NotificationMessage.error({
        message: 'Validation Error',
        description: 'Please select a leave type',
      });
      return;
    }

    if (!value.startDate || !value.endDate) {
      NotificationMessage.error({
        message: 'Validation Error',
        description: 'Please select both start and end dates',
      });
      return;
    }

    // Validate approval workflow
    // Handle different response structures: array or object with items
    const approvalUserArray = Array.isArray(approvalUserData)
      ? approvalUserData
      : approvalUserData?.items || [];
    const approvalDepartmentArray = Array.isArray(approvalDepartmentData)
      ? approvalDepartmentData
      : approvalDepartmentData?.items || [];

    const approvalWorkflowId =
      approvalUserArray?.length > 0
        ? approvalUserArray[0]?.id
        : approvalDepartmentArray?.[0]?.id;

    if (!approvalWorkflowId) {
      // Check if it's a CORS error
      const departmentError = departmentApprovalError as any;
      const userError = userApprovalError as any;
      const hasCorsError = 
        (departmentError && (
          (typeof departmentError?.message === 'string' && 
           (departmentError.message.includes('CORS') || departmentError.message.includes('blocked'))) ||
          departmentError?.response?.status === 0
        )) ||
        (userError && (
          (typeof userError?.message === 'string' && 
           (userError.message.includes('CORS') || userError.message.includes('blocked'))) ||
          userError?.response?.status === 0
        ));

      if (hasCorsError) {
        NotificationMessage.error({
          message: 'CORS Configuration Issue',
          description: 'Unable to fetch approval workflows due to CORS policy. The backend server needs to be configured to allow requests from this origin. Please contact your administrator.',
        });
      } else {
        NotificationMessage.error({
          message: 'Validation Error',
          description: 'No approval workflow found. Please ensure an approval workflow is configured for your user or department, and contact your administrator if needed.',
        });
      }
      return;
    }

    // Validate dates
    if (dayjs(value.startDate).isAfter(dayjs(value.endDate))) {
      NotificationMessage.error({
        message: 'Validation Error',
        description: 'Start date cannot be after end date',
      });
      return;
    }

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
        approvalWorkflowId,
        approvalType: 'Leave',
      },
      userId,
    });
  };

  const onFinishFailed = (errorInfo: any) => {
    showValidationErrors(errorInfo?.errorFields);
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
        open={isShowLeaveRequestSidebar}
        onClose={onClose}
        modalHeader={
          <CustomDrawerHeader>
            {leaveRequest ? 'Update' : 'Add New'} Leave Request
          </CustomDrawerHeader>
        }
        footer={
          <div className="p-6 sm:p-0">
            <CustomDrawerFooterButton buttons={footerModalItems} />
          </div>
        }
        width="400px"
      >
        <Spin spinning={isLoading || isLoadingRequest || isLoadingDepartmentApproval || isLoadingUserApproval}>
          <Form
            layout="vertical"
            requiredMark={CustomLabel}
            form={form}
            autoComplete="off"
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
          >
            <Space.Compact
              direction="vertical"
              className="w-full px-3 sm:px-0 "
            >
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
                  className="w-full "
                  accept=".pdf,.docx,.png,.jpeg,.jpg"
                  name="attachment"
                  listType="text"
                  maxCount={1}
                  setIsLoading={setIsLoading}
                />
              </Form.Item>
              <div className="text-xs font-medium text-gray-600 text-start mb-3">
                Max file size : 5MB. File format : pdf, docx, epub, and jpeg
              </div>
              <Form.Item
                name="delegatee"
                label="Delegated Employee"
                className={itemClass}
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
