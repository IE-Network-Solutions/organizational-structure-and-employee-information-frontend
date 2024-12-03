import CustomDrawerLayout from '@/components/common/customDrawer';
import CustomDrawerFooterButton, {
  CustomDrawerFooterButtonProps,
} from '@/components/common/customDrawer/customDrawerFooterButton';
import CustomDrawerHeader from '@/components/common/customDrawer/customDrawerHeader';
import { useSetLeaveRequest } from '@/store/server/features/timesheet/leaveRequest/mutation';
import { useEmployeeAttendanceStore } from '@/store/uistate/features/timesheet/employeeAtendance';
import { attendanceRecordTypeOption } from '@/types/timesheet/attendance';
import { Form, Select, Space, Spin, TimePicker } from 'antd';
import dayjs from 'dayjs';
import React from 'react';
import { formatToAttendanceStatuses } from '@/helpers/formatTo';

import { MdKeyboardArrowDown } from 'react-icons/md';

const EmployeeAttendanceSideBar = () => {
  const [form] = Form.useForm();
  const itemClass = 'font-semibold text-xs';
  const controlClass = 'mt-2.5 h-[54px] w-full';
  const {
    newData,
    isShowEmployeeAttendanceSidebar,
    setIsShowEmployeeAttendanceSidebar,
    setNewData,
  } = useEmployeeAttendanceStore();
  const onClose = () => {
    setIsShowEmployeeAttendanceSidebar(false);
    form.resetFields();
    setNewData(null);
  };
  const {
    // mutate: updateLeaveRequest,
    isLoading: isLoadingRequest,
    // isSuccess: isSuccessUpdate,
  } = useSetLeaveRequest();
  const footerModalItems: CustomDrawerFooterButtonProps[] = [
    {
      label: 'Cancel',
      key: 'cancel',
      className: 'h-[56px] text-base',
      size: 'large',
      loading: isLoadingRequest,
      onClick: () => onClose(),
    },
    {
      label: 'Update',
      key: 'create',
      className: 'h-[56px] text-base',
      size: 'large',
      type: 'primary',
      loading: isLoadingRequest,
      onClick: () => form.submit(),
    },
  ];

  const onFinish = () => {
    // const value = form.getFieldsValue();
    // console.log('final value', newData, value);
  };

  React.useEffect(() => {
    if (newData) {
      const formattedBreakType = {
        ...newData,
        startAt: dayjs(newData.startAt, 'YYYY-MM-DD HH:mm'),
        endAt: dayjs(newData.endAt, 'YYYY-MM-DD HH:mm'),
        status: formatToAttendanceStatuses(newData)?.[0]?.status,
      };
      form.setFieldsValue(formattedBreakType);
    }
  }, [newData, form]);
  // console.log('new data', newData);

  return (
    isShowEmployeeAttendanceSidebar && (
      <div>
        <CustomDrawerLayout
          open={isShowEmployeeAttendanceSidebar}
          onClose={onClose}
          modalHeader={
            <CustomDrawerHeader>Update Employee Attendance</CustomDrawerHeader>
          }
          footer={<CustomDrawerFooterButton buttons={footerModalItems} />}
          width="400px"
        >
          <Spin spinning={isLoadingRequest}>
            <Form
              layout="vertical"
              form={form}
              autoComplete="off"
              onFinish={onFinish}
            >
              <Space className="w-full" direction="vertical" size={12}>
                <Form.Item
                  name="status"
                  label="Status"
                  rules={[{ required: true, message: 'Required' }]}
                  className={itemClass}
                >
                  <Select
                    className={controlClass}
                    options={attendanceRecordTypeOption}
                    placeholder="Select Status"
                    suffixIcon={
                      <MdKeyboardArrowDown
                        size={16}
                        className="text-gray-900"
                      />
                    }
                  />
                </Form.Item>
                <Form.Item
                  name="startAt"
                  label="Clock In"
                  rules={[{ required: true, message: 'Required' }]}
                  className={itemClass}
                >
                  <TimePicker
                    format="HH:mm"
                    className={controlClass}
                    onChange={(time) => {
                      const currentStartAt = form.getFieldValue('startAt');
                      const updatedStartAt = dayjs(currentStartAt)
                        .hour(time.hour())
                        .minute(time.minute());
                      form.setFieldsValue({ startAt: updatedStartAt });
                    }}
                  />
                </Form.Item>
                <Form.Item
                  name="endAt"
                  label="Clock Out"
                  rules={[{ required: true, message: 'Required' }]}
                  className={itemClass}
                >
                  <TimePicker
                    format="HH:mm"
                    className={controlClass}
                    onChange={(time) => {
                      const currentEndAt = form.getFieldValue('endAt');
                      const updatedEndAt = dayjs(currentEndAt)
                        .hour(time.hour())
                        .minute(time.minute());
                      form.setFieldsValue({ endAt: updatedEndAt });
                    }}
                  />
                </Form.Item>
              </Space>
            </Form>
          </Spin>
        </CustomDrawerLayout>
      </div>
    )
  );
};

export default EmployeeAttendanceSideBar;
