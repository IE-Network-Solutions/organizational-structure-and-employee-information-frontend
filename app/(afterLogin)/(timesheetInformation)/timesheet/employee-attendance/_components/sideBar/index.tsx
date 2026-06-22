import { useEmployeeAttendanceStore } from '@/store/uistate/features/timesheet/employeeAtendance';
import { Button, DatePicker, Form, TimePicker } from 'antd';
import dayjs from 'dayjs';
import React from 'react';
import { formatToAttendanceStatuses } from '@/helpers/formatTo';
import { useGetEmployee } from '@/store/server/features/employees/employeeDetail/queries';
import CustomRadio from '@/components/form/customRadio';
import { useGetSingleAttendances } from '@/store/server/features/timesheet/attendance/queries';
import { useSetEditAttendance } from '@/store/server/features/timesheet/attendance/mutation';
import NotificationMessage from '@/components/common/notification/notificationMessage';
import {
  applyTimeToAttendanceDate,
  ATTENDANCE_API_DATETIME_FORMAT,
  formatAttendanceApiDateTime,
  formatAttendanceRecordDateLabel,
  getAttendanceDateBase,
} from '../attendanceDateHelpers';
import { parseAttendanceWallClockTime } from '@/helpers/attendanceTimeHelper';

const EmployeeAttendanceSideBar = () => {
  const [form] = Form.useForm();
  const itemClass = 'font-normal text-xs';
  const controlClass = 'mt-2.5 h-[40px]  w-full';
  const {
    isShowEmployeeAttendanceSidebar,
    employeeAttendanceId,
    isAbsent,
    employeeId,
    setIsAbsent,
    setIsShowEmployeeAttendanceSidebar,
    setEmployeeAttendanceId,
    setEmployeeId,
    attendanceRecordDate,
    setAttendanceRecordDate,
  } = useEmployeeAttendanceStore();
  const onClose = () => {
    setIsShowEmployeeAttendanceSidebar(false);
    form.resetFields();
    setEmployeeAttendanceId('');
    setEmployeeId('');
    setAttendanceRecordDate('');
  };

  const { data: currentAttendanceData } =
    useGetSingleAttendances(employeeAttendanceId);

  const { data: employeeData } = useGetEmployee(employeeId);

  const { mutate: updateLeaveRequest, isLoading: isLoadingRequest } =
    useSetEditAttendance();

  const recordDate =
    attendanceRecordDate || currentAttendanceData?.createdAt || '';

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

    if (!recordDate) {
      NotificationMessage.warning({
        message:
          'Attendance record date is missing. Please close and try again.',
      });
      return;
    }

    const attendanceDateBase = getAttendanceDateBase(recordDate);
    const dayOfTheWeek = attendanceDateBase.format('dddd');
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
          startAt: formatAttendanceApiDateTime(recordDate, value.startAt),
          endAt: formatAttendanceApiDateTime(recordDate, value.endAt),
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
    if (currentAttendanceData && recordDate) {
      const dateBase = getAttendanceDateBase(recordDate);
      const formattedBreakType = {
        ...currentAttendanceData,
        startAt: currentAttendanceData.startAt
          ? applyTimeToAttendanceDate(
              recordDate,
              parseAttendanceWallClockTime(currentAttendanceData.startAt)!,
            )
          : dateBase,
        endAt: currentAttendanceData.endAt
          ? applyTimeToAttendanceDate(
              recordDate,
              parseAttendanceWallClockTime(currentAttendanceData.endAt)!,
            )
          : dateBase,
        status: formatToAttendanceStatuses(currentAttendanceData)?.[0]?.status,
      };
      form.setFieldsValue(formattedBreakType);
    }
  }, [currentAttendanceData, form, recordDate]);

  const employeeFullName = `${employeeData?.firstName || ''} ${
    employeeData?.middleName || ''
  } ${employeeData?.lastName || ''}`.trim();

  const editDateLabel = formatAttendanceRecordDateLabel(recordDate);

  return (
    isShowEmployeeAttendanceSidebar && (
      <div
        className="bg-white border border-[#d4d4d4] p-4 rounded-md w-[320px] sm:w-[400px]"
        id="time-attendance-employee-attendance-sidebar-container"
        data-cy="time-attendance-employee-attendance-sidebar-container"
      >
        <div
          className="mb-4 flex items-start justify-between"
          data-cy="time-attendance-employee-attendance-sidebar-header"
        >
          <div data-cy="time-attendance-employee-attendance-sidebar-header-content">
            <div
              className="text-base font-semibold text-[#000000B2]"
              data-cy="time-attendance-sidebar-header-title"
            >
              Edit Attendance on {editDateLabel}
            </div>
            <div
              className="mt-1 text-sm text-gray-500"
              data-cy="time-attendance-sidebar-header-name"
            >
              {employeeFullName || '-'}
            </div>
          </div>

          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="text-gray-400 text-3xl leading-none select-none"
            data-cy="time-attendance-sidebar-close"
          >
            ×
          </button>
        </div>

        <Form
          layout="vertical"
          form={form}
          autoComplete="off"
          onFinish={onFinish}
          id="time-attendance-employee-attendance-sidebar-form"
          data-cy="time-attendance-employee-attendance-sidebar-form"
          requiredMark={false}
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
          <div
            id="time-attendance-employee-attendance-sidebar-clock-in-out-div"
            data-cy="time-attendance-employee-attendance-sidebar-clock-in-out-div"
            className="grid grid-cols-2 gap-2"
          >
            <Form.Item
              name="startAt"
              id="time-attendance-employee-attendance-sidebar-clock-in-form-item"
              data-cy="time-attendance-employee-attendance-sidebar-clock-in-form-item"
              label={
                <span
                  className="text-sm font-normal"
                  data-cy="time-attendance-employee-attendance-sidebar-check-in-label"
                >
                  Check In{' '}
                  <span
                    style={{ color: 'red' }}
                    data-cy="time-attendance-employee-attendance-sidebar-check-in-required"
                  >
                    *
                  </span>
                </span>
              }
              rules={[{ required: !isAbsent, message: 'Required' }]}
              className={itemClass}
            >
              {currentAttendanceData?.isAbsent ? (
                <DatePicker
                  showTime
                  disabled={isAbsent}
                  format={ATTENDANCE_API_DATETIME_FORMAT}
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
                    if (!time) return;
                    form.setFieldsValue({
                      startAt: applyTimeToAttendanceDate(recordDate, time),
                    });
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
              label={
                <span
                  className="text-sm font-normal"
                  data-cy="time-attendance-employee-attendance-sidebar-check-out-label"
                >
                  Check Out{' '}
                  <span
                    style={{ color: 'red' }}
                    data-cy="time-attendance-employee-attendance-sidebar-check-out-required"
                  >
                    *
                  </span>
                </span>
              }
              rules={[{ required: !isAbsent, message: 'Required' }]}
              className={itemClass}
            >
              {currentAttendanceData?.isAbsent ? (
                <DatePicker
                  showTime
                  disabled={isAbsent}
                  format={ATTENDANCE_API_DATETIME_FORMAT}
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
                    if (!time) return;
                    form.setFieldsValue({
                      endAt: applyTimeToAttendanceDate(recordDate, time),
                    });
                  }}
                  id="time-attendance-employee-attendance-sidebar-clock-out-time"
                  data-cy="time-attendance-employee-attendance-sidebar-clock-out-time"
                />
              )}
            </Form.Item>
          </div>
          <div
            id="time-attendance-employee-attendance-sidebar-buttons-div"
            data-cy="time-attendance-employee-attendance-sidebar-buttons-div"
            className="flex justify-end gap-2"
          >
            <Button
              type="default"
              loading={isLoadingRequest}
              onClick={() => onClose()}
              id="time-attendance-employee-attendance-sidebar-cancel-button"
              data-cy="time-attendance-employee-attendance-sidebar-cancel-button"
              className="h-8 border border-[#D9D9D9] text-sm font-normal text-[#4d4d4d]"
            >
              Cancel
            </Button>
            <Button
              type="primary"
              loading={isLoadingRequest}
              onClick={() => form.submit()}
              id="time-attendance-employee-attendance-sidebar-update-button"
              data-cy="time-attendance-employee-attendance-sidebar-update-button"
              className="h-8 text-sm font-normal"
            >
              Update
            </Button>
          </div>
        </Form>
      </div>
    )
  );
};

export default EmployeeAttendanceSideBar;
