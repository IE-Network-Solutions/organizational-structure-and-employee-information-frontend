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
  const controlClass = 'mt-2.5 h-[40px] sm:h-[51px] w-full';
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
      className: 'h-[40px] sm:h-[56px] text-base',
      size: 'large',
      loading: isLoadingRequest,
      onClick: () => onClose(),
    },
    {
      label: 'Update',
      key: 'create',
      className: 'h-[40px] sm:h-[56px] text-base',
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
      <div
        id="time-attendance-employee-attendance-sidebar-container"
        data-cy="time-attendance-employee-attendance-sidebar-container"
      >
        <CustomDrawerLayout
          data-cy="time-attendance-employee-attendance-sidebar-container"
          open={isShowEmployeeAttendanceSidebar}
          onClose={onClose}
          modalHeader={
            <CustomDrawerHeader data-cy="time-attendance-employee-attendance-sidebar-modal-header">
              Update Employee Attendance
            </CustomDrawerHeader>
          }
          footer={
            <div
              data-cy="employee-attendance-components-sidebar-index-tsx-index-div-188"
              className="p-6 sm:p-0"
            >
              <div
                id="time-attendance-employee-attendance-sidebar-footer-buttons"
                data-cy="time-attendance-employee-attendance-sidebar-footer-buttons"
              >
                <CustomDrawerFooterButton
                  data-cy="time-attendance-employee-attendance-sidebar-footer-buttons"
                  buttons={footerModalItems}
                />
              </div>
            </div>
          }
          width="400px"
        >
          <Spin
            size="large"
            spinning={isAttendanceLoading || isUserLoading}
            data-cy="time-attendance-employee-attendance-sidebar-spin"
          >
            <Form
              layout="vertical"
              form={form}
              autoComplete="off"
              onFinish={onFinish}
              id="time-attendance-employee-attendance-sidebar-form"
              data-cy="time-attendance-employee-attendance-sidebar-form"
            >
              <Space.Compact
                direction="vertical"
                className="w-full px-3 sm:px-0 "
                id="time-attendance-employee-attendance-sidebar-fields-stack"
                data-cy="time-attendance-employee-attendance-sidebar-fields-stack"
              >
                <Form.Item name="isAbsent" label="Is Absent">
                  <div
                    id="time-attendance-employee-attendance-sidebar-absent-radio"
                    data-cy="time-attendance-employee-attendance-sidebar-absent-radio"
                  >
                    <CustomRadio
                      data-cy="time-attendance-employee-attendance-sidebar-absent-radio-label"
                      label="Is Absent"
                      initialValue={currentAttendanceData?.isAbsent}
                      onChange={onChangeIsAbsent}
                    />
                  </div>
                </Form.Item>
                <Form.Item
                  name="startAt"
                  id="time-attendance-employee-attendance-sidebar-clock-in-form-item"
                  data-cy="time-attendance-employee-attendance-sidebar-clock-in-form-item"
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
                      id="time-attendance-employee-attendance-sidebar-clock-in-date"
                      data-cy="time-attendance-employee-attendance-sidebar-clock-in-date"
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
                      id="time-attendance-employee-attendance-sidebar-clock-in-time"
                      data-cy="time-attendance-employee-attendance-sidebar-clock-in-time"
                    />
                  )}
                </Form.Item>
                <Form.Item
                  name="endAt"
                  id="time-attendance-employee-attendance-sidebar-clock-out-form-item"
                  data-cy="time-attendance-employee-attendance-sidebar-clock-out-form-item"
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
                      id="time-attendance-employee-attendance-sidebar-clock-out-date"
                      data-cy="time-attendance-employee-attendance-sidebar-clock-out-date"
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
                      id="time-attendance-employee-attendance-sidebar-clock-out-time"
                      data-cy="time-attendance-employee-attendance-sidebar-clock-out-time"
                    />
                  )}
                </Form.Item>
              </Space.Compact>
            </Form>
          </Spin>
        </CustomDrawerLayout>
      </div>
    )
  );
};

export default EmployeeAttendanceSideBar;
