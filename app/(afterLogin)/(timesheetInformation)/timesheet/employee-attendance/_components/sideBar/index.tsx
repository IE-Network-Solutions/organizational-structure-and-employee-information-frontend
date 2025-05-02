import CustomDrawerLayout from '@/components/common/customDrawer';
import CustomDrawerFooterButton, {
  CustomDrawerFooterButtonProps,
} from '@/components/common/customDrawer/customDrawerFooterButton';
import CustomDrawerHeader from '@/components/common/customDrawer/customDrawerHeader';
import { useEmployeeAttendanceStore } from '@/store/uistate/features/timesheet/employeeAtendance';
import { DatePicker, Form, Space, Spin, TimePicker } from 'antd';
import dayjs from 'dayjs';
import React from 'react';
import { formatToAttendanceStatuses } from '@/helpers/formatTo';
import { useGetEmployee } from '@/store/server/features/employees/employeeDetail/queries';
import CustomRadio from '@/components/form/customRadio';
import { useGetSingleAttendances } from '@/store/server/features/timesheet/attendance/queries';
import { useSetEditAttendance } from '@/store/server/features/timesheet/attendance/mutation';
import NotificationMessage from '@/components/common/notification/notificationMessage';

const EmployeeAttendanceSideBar = () => {
  const [form] = Form.useForm();
  const itemClass = 'font-semibold text-xs';
  const controlClass = 'mt-2.5 h-[54px] w-full';
  const {
    isShowEmployeeAttendanceSidebar,
    employeeAttendanceId,
    isAbsent,
    employeeId,
    setIsAbsent,
    setIsShowEmployeeAttendanceSidebar,
    setEmployeeAttendanceId,
    setEmployeeId,
  } = useEmployeeAttendanceStore();
  const onClose = () => {
    setIsShowEmployeeAttendanceSidebar(false);
    form.resetFields();
    setEmployeeAttendanceId('');
    setEmployeeId('');
  };

  const { data: currentAttendanceData, isLoading: isAttendanceLoading } =
    useGetSingleAttendances(employeeAttendanceId);

  const { data: employeeData, isLoading: isUserLoading } =
    useGetEmployee(employeeId);

  const { mutate: updateLeaveRequest, isLoading: isLoadingRequest } =
    useSetEditAttendance();

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
  const onChangeIsAbsent = (isAbsent: any) => {
    setIsAbsent(isAbsent);
    form.setFieldValue('isAbsent', isAbsent);
    if (isAbsent) {
      form.setFieldsValue({
        startAt: null,
        endAt: null,
      });
    }
  };
  const onFinish = () => {
    const value = form.getFieldsValue();

    if (value.isAbsent) {
      updateLeaveRequest(
        {
          id: employeeAttendanceId,
          data: {
            startAt: null,
            endAt: null,
            lateByMinutes: 0,
            earlyByMinutes: 0,
            isAbsent: true,
            isOnGoing: false,
          },
        },
        {
          onSuccess: () => {
            onClose();
          },
        },
      );
      return;
    }

    if (!value.startAt || !value.endAt) {
      NotificationMessage.warning({
        message:
          'Clock In and Clock Out times are required unless marked absent.',
      });
      return;
    }

    const dayOfTheWeek = value.startAt.format('dddd');
    const checkIn = value.startAt.format('HH.mm');
    const checkOut = value.endAt.format('HH.mm');

    const workScheduleData = employeeData?.employeeJobInformation
      ?.find((item: any) => item.isPositionActive === true)
      ?.workSchedule?.detail?.find((item: any) =>
        item.day ? item.day === dayOfTheWeek : item.dayOfWeek === dayOfTheWeek,
      );

    if (!workScheduleData) {
      NotificationMessage.warning({
        message: `This Employee does not have any active work scheduled`,
      });
      return;
    }

    const lateByMinutes = dayjs(checkIn, 'HH.mm').diff(
      dayjs(workScheduleData.startTime, 'HH.mm'),
      'minute',
    );

    const earlyByMinutes = dayjs(workScheduleData.endTime, 'HH:mm A').diff(
      dayjs(checkOut, 'HH.mm'),
      'minute',
    );

    updateLeaveRequest(
      {
        id: employeeAttendanceId,
        data: {
          startAt: dayjs(value.startAt).format('YYYY-MM-DD HH:mm'),
          endAt: dayjs(value.endAt).format('YYYY-MM-DD HH:mm'),
          lateByMinutes: Math.max(0, lateByMinutes),
          earlyByMinutes: Math.max(0, earlyByMinutes),
          isAbsent: false,
          isOnGoing: false,
        },
      },
      {
        onSuccess: () => {
          onClose();
        },
      },
    );
  };

  React.useEffect(() => {
    if (currentAttendanceData) {
      const formattedBreakType = {
        ...currentAttendanceData,
        startAt: currentAttendanceData.startAt
          ? dayjs(currentAttendanceData.startAt, 'YYYY-MM-DD HH:mm')
          : dayjs('00:00', 'HH:mm'),
        endAt: currentAttendanceData.endAt
          ? dayjs(currentAttendanceData.endAt, 'YYYY-MM-DD HH:mm')
          : dayjs('00:00', 'HH:mm'),
        status: formatToAttendanceStatuses(currentAttendanceData)?.[0]?.status,
      };
      form.setFieldsValue(formattedBreakType);
    }
  }, [currentAttendanceData, form]);

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
          <Spin size="large" spinning={isAttendanceLoading || isUserLoading}>
            <Form
              layout="vertical"
              form={form}
              autoComplete="off"
              onFinish={onFinish}
            >
              <Space className="w-full" direction="vertical" size={12}>
                <Form.Item name="isAbsent" label="Is Absent">
                  <CustomRadio
                    label="Is Absent"
                    initialValue={currentAttendanceData?.isAbsent}
                    onChange={onChangeIsAbsent}
                  />
                </Form.Item>

                <Form.Item
                  name="startAt"
                  label="Clock In"
                  rules={[{ required: !isAbsent, message: 'Required' }]}
                  className={itemClass}
                >
                  {currentAttendanceData?.isAbsent ? (
                    <DatePicker
                      showTime
                      disabled={isAbsent}
                      format="YYYY-MM-DD HH:mm"
                      className={controlClass}
                      onChange={(datetime) => {
                        form.setFieldsValue({ startAt: datetime });
                      }}
                    />
                  ) : (
                    <TimePicker
                      disabled={isAbsent}
                      format="HH:mm"
                      className={controlClass}
                      onChange={(time) => {
                        const currentStartAt = form.getFieldValue('startAt');
                        const updatedStartAt = currentStartAt
                          ? dayjs(currentStartAt)
                              .hour(time.hour())
                              .minute(time.minute())
                          : dayjs().hour(time.hour()).minute(time.minute());
                        form.setFieldsValue({ startAt: updatedStartAt });
                      }}
                    />
                  )}
                </Form.Item>

                <Form.Item
                  name="endAt"
                  label="Clock Out"
                  rules={[{ required: !isAbsent, message: 'Required' }]}
                  className={itemClass}
                >
                  {currentAttendanceData?.isAbsent ? (
                    <DatePicker
                      showTime
                      disabled={isAbsent}
                      format="YYYY-MM-DD HH:mm"
                      className={controlClass}
                      onChange={(datetime) => {
                        form.setFieldsValue({ endAt: datetime });
                      }}
                    />
                  ) : (
                    <TimePicker
                      format="HH:mm"
                      disabled={isAbsent}
                      className={controlClass}
                      onChange={(time) => {
                        const currentEndAt = form.getFieldValue('endAt');
                        const updatedEndAt = currentEndAt
                          ? dayjs(currentEndAt)
                              .hour(time.hour())
                              .minute(time.minute())
                          : dayjs().hour(time.hour()).minute(time.minute());
                        form.setFieldsValue({ endAt: updatedEndAt });
                      }}
                    />
                  )}
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
