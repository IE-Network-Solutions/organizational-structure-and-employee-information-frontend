import { useEmployeeAttendanceStore } from '@/store/uistate/features/timesheet/employeeAtendance';
import { Button, DatePicker, Form, TimePicker } from 'antd';
import dayjs from 'dayjs';
import React from 'react';
import { formatToAttendanceStatuses } from '@/helpers/formatTo';
import { useGetEmployee } from '@/store/server/features/employees/employeeDetail/queries';
import CustomRadio from '@/components/form/customRadio';
import { useGetSingleAttendances } from '@/store/server/features/timesheet/attendance/queries';
import {
  useSetEditAttendance,
  useSetEditAttendanceBreak,
} from '@/store/server/features/timesheet/attendance/mutation';
import NotificationMessage from '@/components/common/notification/notificationMessage';
import {
  applyTimeToAttendanceDate,
  ATTENDANCE_API_DATETIME_FORMAT,
  formatAttendanceApiDateTime,
  formatAttendanceRecordDateLabel,
  getAttendanceDateBase,
} from '../attendanceDateHelpers';
import { parseAttendanceWallClockTime } from '@/helpers/attendanceTimeHelper';
import { useGetBreakTypes } from '@/store/server/features/timesheet/breakType/queries';
import { AttendanceBreak } from '@/types/timesheet/attendance';

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
    editingBreakTimes,
    setEditingBreakTimes,
    filter,
  } = useEmployeeAttendanceStore();
  const onClose = () => {
    setIsShowEmployeeAttendanceSidebar(false);
    form.resetFields();
    setEmployeeAttendanceId('');
    setEmployeeId('');
    setAttendanceRecordDate('');
    setEditingBreakTimes(null);
  };

  const { data: currentAttendanceData } =
    useGetSingleAttendances(employeeAttendanceId);

  const { data: employeeData } = useGetEmployee(employeeId);
  const { data: breakTypeData } = useGetBreakTypes();

  const { mutate: updateAttendance, isLoading: isLoadingAttendance } =
    useSetEditAttendance();
  const { mutate: updateBreak, isLoading: isLoadingBreak } =
    useSetEditAttendanceBreak();
  const isLoadingRequest = isLoadingAttendance || isLoadingBreak;

  const breakTypeId = (filter?.breakTypeId ||
    editingBreakTimes?.breakTypeId) as string | undefined;
  const isEditingBreak = Boolean(breakTypeId);
  const selectedBreakType = breakTypeData?.items?.find(
    (bt) => bt.id === breakTypeId,
  );
  const currentBreak: AttendanceBreak | undefined =
    currentAttendanceData?.attendanceBreaks?.find(
      (item: AttendanceBreak) =>
        item.breakTypeId === breakTypeId || item.breakType?.id === breakTypeId,
    );

  const recordDate =
    attendanceRecordDate || currentAttendanceData?.createdAt || '';

  const toFormTime = (isoOrNull?: string | null) => {
    if (!isoOrNull || !recordDate) return null;
    const wall = parseAttendanceWallClockTime(isoOrNull);
    if (!wall) return null;
    return getAttendanceDateBase(recordDate)
      .hour(wall.utc().hour())
      .minute(wall.utc().minute())
      .second(0);
  };

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

    if (isEditingBreak && breakTypeId) {
      if (!recordDate) {
        NotificationMessage.warning({
          message:
            'Attendance record date is missing. Please close and try again.',
        });
        return;
      }

      const breakoutAt = value.startAt
        ? formatAttendanceApiDateTime(recordDate, value.startAt)
        : null;
      const breakinAt = value.endAt
        ? formatAttendanceApiDateTime(recordDate, value.endAt)
        : null;

      if (breakoutAt && breakinAt) {
        const out = dayjs(breakoutAt, ATTENDANCE_API_DATETIME_FORMAT);
        const inn = dayjs(breakinAt, ATTENDANCE_API_DATETIME_FORMAT);
        if (out.isSame(inn) || out.isAfter(inn)) {
          NotificationMessage.warning({
            message: 'Breakout time must be earlier than breakin time.',
          });
          return;
        }
      }

      updateBreak(
        {
          attendanceRecordId: employeeAttendanceId,
          data: {
            breakTypeId,
            startAt: breakoutAt,
            endAt: breakinAt,
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

    if (value.isAbsent) {
      updateAttendance(
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

    updateAttendance(
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
    if (!recordDate) return;

    if (isEditingBreak) {
      const breakoutIso =
        currentBreak?.startAt ?? editingBreakTimes?.startAt ?? null;
      const breakinIso =
        currentBreak?.endAt ?? editingBreakTimes?.endAt ?? null;

      form.setFieldsValue({
        startAt: toFormTime(breakoutIso),
        endAt: toFormTime(breakinIso),
        isAbsent: false,
      });
      setIsAbsent(false);
      return;
    }

    if (!currentAttendanceData) return;

    const dateBase = getAttendanceDateBase(recordDate);
    form.setFieldsValue({
      ...currentAttendanceData,
      startAt: currentAttendanceData.startAt
        ? (toFormTime(currentAttendanceData.startAt) ?? dateBase)
        : dateBase,
      endAt: currentAttendanceData.endAt
        ? (toFormTime(currentAttendanceData.endAt) ?? dateBase)
        : dateBase,
      status: formatToAttendanceStatuses(currentAttendanceData)?.[0]?.status,
    });
  }, [
    currentAttendanceData,
    currentBreak?.startAt,
    currentBreak?.endAt,
    editingBreakTimes?.startAt,
    editingBreakTimes?.endAt,
    form,
    isEditingBreak,
    recordDate,
    setIsAbsent,
  ]);

  const employeeFullName = `${employeeData?.firstName || ''} ${
    employeeData?.middleName || ''
  } ${employeeData?.lastName || ''}`.trim();

  const editDateLabel = formatAttendanceRecordDateLabel(recordDate);
  const breakTitle = selectedBreakType?.title || 'Break';
  const headerTitle = isEditingBreak
    ? `Edit ${breakTitle} on ${editDateLabel}`
    : `Edit Attendance on ${editDateLabel}`;

  const startLabel = isEditingBreak ? 'Breakout' : 'Check In';
  const endLabel = isEditingBreak ? 'Breakin' : 'Check Out';
  const requireBothTimes = !isEditingBreak && !isAbsent;

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
              {headerTitle}
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
          {!isEditingBreak && (
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
          )}
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
                  {startLabel}{' '}
                  {requireBothTimes && (
                    <span
                      style={{ color: 'red' }}
                      data-cy="time-attendance-employee-attendance-sidebar-check-in-required"
                    >
                      *
                    </span>
                  )}
                </span>
              }
              rules={
                requireBothTimes
                  ? [{ required: true, message: 'Required' }]
                  : undefined
              }
              className={itemClass}
            >
              {!isEditingBreak && currentAttendanceData?.isAbsent ? (
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
                  disabled={!isEditingBreak && isAbsent}
                  allowClear={isEditingBreak}
                  format="HH:mm"
                  className={controlClass}
                  onChange={(time) => {
                    if (!time) {
                      form.setFieldsValue({ startAt: null });
                      return;
                    }
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
                  {endLabel}{' '}
                  {requireBothTimes && (
                    <span
                      style={{ color: 'red' }}
                      data-cy="time-attendance-employee-attendance-sidebar-check-out-required"
                    >
                      *
                    </span>
                  )}
                </span>
              }
              rules={
                requireBothTimes
                  ? [{ required: true, message: 'Required' }]
                  : undefined
              }
              className={itemClass}
            >
              {!isEditingBreak && currentAttendanceData?.isAbsent ? (
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
                  disabled={!isEditingBreak && isAbsent}
                  allowClear={isEditingBreak}
                  className={controlClass}
                  onChange={(time) => {
                    if (!time) {
                      form.setFieldsValue({ endAt: null });
                      return;
                    }
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
          {isEditingBreak && (
            <div data-cy="time-attendance-employee-attendance-sidebar-break-note" className="mb-3 text-xs text-gray-500">
              Leave a time empty to mark that punch as missed. Status is
              recalculated from the {breakTitle} windows.
            </div>
          )}
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
