'use client';
import React, { useEffect } from 'react';
import {
  Button,
  Card,
  Col,
  Form,
  Row,
  Select,
  Switch,
  Tag,
  TimePicker,
} from 'antd';
import CloseIcon from '@mui/icons-material/Close';
import CheckIcon from '@mui/icons-material/Check';
import dayjs from 'dayjs';
import {
  EditState,
  useEmployeeManagementStore,
} from '@/store/uistate/features/employees/employeeManagment';
import { useGetEmployee } from '@/store/server/features/employees/employeeManagment/queries';
import { useGetWorkSchedules } from '@/store/server/features/employees/employeeManagment/workSchedule/queries';
import { useUpdateEmployeeJobInformation } from '@/store/server/features/employees/employeeDetail/mutations';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import {
  useGetBlueprints,
  useGetUserShiftAssignments,
} from '@/store/server/features/timesheet/workSchedule/queries';
import { useAssignEmployees } from '@/store/server/features/timesheet/workSchedule/mutation';
import { formatTimeRange } from '@/store/server/features/timesheet/workSchedule/helpers';

const { Option } = Select;

const EMPTY_SHIFT_SCHEDULES: NonNullable<
  ReturnType<typeof useGetBlueprints>['data']
> = [];
const EMPTY_USER_SHIFT_ASSIGNMENTS: NonNullable<
  ReturnType<typeof useGetUserShiftAssignments>['data']
> = [];

type WorkScheduleComponentProps = {
  employeeId: string;
};

const WorkScheduleComponent: React.FC<WorkScheduleComponentProps> = ({
  employeeId,
}) => {
  const userId = employeeId;
  const { userId: loggedInUserId } = useAuthenticationStore();
  const {
    selectedWorkSchedule,
    setSelectedWorkSchedule,
    workSchedule,
    setWorkSchedule,
    edit,
    setEdit,
  } = useEmployeeManagementStore();
  const { mutate: updateEmployeeJobInformation } =
    useUpdateEmployeeJobInformation();
  const { data: employeeData, isLoading, refetch } = useGetEmployee(userId);
  const { data: workSchedules } = useGetWorkSchedules();
  const { data: shiftSchedulesData } = useGetBlueprints();
  const shiftSchedules = shiftSchedulesData ?? EMPTY_SHIFT_SCHEDULES;
  const { data: userShiftAssignmentsData } =
    useGetUserShiftAssignments(userId);
  const userShiftAssignments =
    userShiftAssignmentsData ?? EMPTY_USER_SHIFT_ASSIGNMENTS;
  const { mutate: assignShiftSchedule } = useAssignEmployees();
  const [form] = Form.useForm();
  const [dailySchedule, setDailySchedule] = React.useState<any[]>([]);
  const selectedShiftScheduleId = Form.useWatch('shiftScheduleId', form);
  const selectedShiftSchedule = shiftSchedules.find(
    (item) => item.id === selectedShiftScheduleId,
  );

  const handleSaveChanges = (editKey: keyof EditState) => {
    form
      .validateFields()
      .then((values) => {
        const persistShiftAssignment = () => {
          if (values.shiftScheduleId) {
            assignShiftSchedule({
              blueprintId: values.shiftScheduleId,
              userIds: [userId],
              shiftIds: values.assignedShiftIds || [],
              employees: [
                {
                  id: userId,
                  firstName: employeeData?.firstName,
                  lastName: employeeData?.lastName,
                  email: employeeData?.email,
                  jobTitle:
                    employeeData?.employeeJobInformation?.[0]?.position?.name,
                },
              ],
            });
          }
        };

        updateEmployeeJobInformation(
          {
            id: employeeData?.employeeJobInformation[0]?.id,
            values: {
              workScheduleId: values.workScheduleId,
            },
            changeMakerUserId: loggedInUserId,
          },
          {
            onSuccess: async () => {
              persistShiftAssignment();
              await refetch();
              setSelectedWorkSchedule(null);
              setEdit(editKey);
            },
          },
        );
      })
      .catch();
  };
  const workscheduleChangeHandler = (value: string) => {
    const selectedValue = workSchedules?.items.find(
      (schedule: any) => schedule.id === value,
    );
    setSelectedWorkSchedule(selectedValue || null);
    setWorkSchedule(value);
    // CRITICAL: Update the form field value so it's included in form submission
    form.setFieldValue('workScheduleId', value);

    // Update daily schedule when schedule changes
    if (selectedValue?.detail) {
      const scheduleData = selectedValue.detail.map(
        (day: any, index: number) => {
          const decimalHour = day.duration || 0;
          const hours = Math.floor(decimalHour);
          const minutes = Math.round((decimalHour % 1) * 60);
          const startTime = day.startTime
            ? dayjs(day.startTime, 'HH:mm')
            : hours > 0
              ? dayjs().startOf('day').add(hours, 'hour').add(minutes, 'minute')
              : null;
          const endTime = day.endTime
            ? dayjs(day.endTime, 'HH:mm')
            : startTime
              ? startTime.add(decimalHour, 'hour')
              : null;

          return {
            key: index,
            day: day.dayOfWeek || day.day || '',
            workDay: day.workDay || day.workday || false,
            startTime: startTime,
            endTime: endTime,
            duration: day.duration || 0,
          };
        },
      );
      setDailySchedule(scheduleData);
    }
  };

  // const data: any = (selectedWorkSchedule?.detail || []).map(
  //   (schedule, index) => {
  //     const decimalHour = schedule.duration || 0;
  //     const hours = Math.floor(decimalHour);
  //     const minutes = Math.round((decimalHour % 1) * 60);
  //     const timeValue = dayjs()
  //       .startOf('day')
  //       .add(hours, 'hour')
  //       .add(minutes, 'minute');

  //     return {
  //       key: index.toString(),
  //       workingDay: (
  //         <div
  //           className="flex space-x-2 justify-start"
  //           id={`job-work-schedule-day-${index}`}
  //           data-cy={`job-work-schedule-day-${index}`}
  //         >
  //           <Switch
  //             checked={schedule?.workDay}
  //             disabled
  //             id={`job-work-schedule-switch-${index}`}
  //             data-cy={`job-work-schedule-switch-${index}`}
  //           />
  //           <span
  //             id={`job-work-schedule-day-name-${index}`}
  //             data-cy={`job-work-schedule-day-name-${index}`}
  //           >
  //             {schedule.day}
  //           </span>
  //         </div>
  //       ),
  //       time: (
  //         <TimePicker
  //           value={timeValue}
  //           format="HH:mm"
  //           disabled
  //           id={`job-work-schedule-time-${index}`}
  //           data-cy={`job-work-schedule-time-${index}`}
  //         />
  //       ),
  //     };
  //   },
  // );

  const handleEditChange = (editKey: keyof EditState) => {
    setEdit(editKey);

    // Initialize daily schedule when entering edit mode
    const scheduleToUse =
      selectedWorkSchedule ||
      workSchedules?.items?.find(
        (schedule: any) => schedule.id === workSchedule,
      );

    if (scheduleToUse?.detail) {
      const scheduleData = scheduleToUse.detail.map(
        (day: any, index: number) => {
          const decimalHour = day.duration || 0;
          const hours = Math.floor(decimalHour);
          const minutes = Math.round((decimalHour % 1) * 60);
          const startTime = day.startTime
            ? dayjs(day.startTime, 'HH:mm')
            : hours > 0
              ? dayjs().startOf('day').add(hours, 'hour').add(minutes, 'minute')
              : null;
          const endTime = day.endTime
            ? dayjs(day.endTime, 'HH:mm')
            : startTime
              ? startTime.add(decimalHour, 'hour')
              : null;

          return {
            key: index,
            day: day.dayOfWeek || day.day || '',
            workDay: day.workDay || day.workday || false,
            startTime: startTime,
            endTime: endTime,
            duration: day.duration || 0,
          };
        },
      );
      setDailySchedule(scheduleData);
    }

    if (workSchedule) {
      workscheduleChangeHandler(workSchedule);
    }
  };

  const handleCancelEdit = () => {
    setEdit('workSchedule');
    form.resetFields();
  };

  // Calculate total working days and hours for edit form
  const editTotalWorkingDays = dailySchedule.filter(
    (day) => day.workDay,
  ).length;
  const editTotalWorkingHours = dailySchedule.reduce((total, day) => {
    return total + (day.workDay ? day.duration || 0 : 0);
  }, 0);

  useEffect(() => {
    const activeWorkScheduleIdFromEmployee =
      employeeData?.employeeJobInformation?.find(
        (e: any) => e.isPositionActive === true,
      )?.workScheduleId;

    if (!edit.workSchedule) {
      if (workSchedule !== activeWorkScheduleIdFromEmployee) {
        setWorkSchedule(activeWorkScheduleIdFromEmployee);
      }

      if (activeWorkScheduleIdFromEmployee && workSchedules?.items) {
        const newSelectedSchedule = workSchedules.items.find(
          (schedule: any) => schedule.id === activeWorkScheduleIdFromEmployee,
        );
        if (
          newSelectedSchedule &&
          newSelectedSchedule.id !== selectedWorkSchedule?.id
        ) {
          setSelectedWorkSchedule(newSelectedSchedule);
        }
      }

      const primaryShiftAssignment = userShiftAssignments[0];
      const nextShiftScheduleId = primaryShiftAssignment?.blueprintId;
      const nextAssignedShiftIds = primaryShiftAssignment?.shiftIds || [];
      const currentValues = form.getFieldsValue([
        'workScheduleId',
        'shiftScheduleId',
        'assignedShiftIds',
      ]);
      const assignedShiftIdsChanged =
        JSON.stringify(currentValues.assignedShiftIds || []) !==
        JSON.stringify(nextAssignedShiftIds);
      if (
        currentValues.workScheduleId !== activeWorkScheduleIdFromEmployee ||
        currentValues.shiftScheduleId !== nextShiftScheduleId ||
        assignedShiftIdsChanged
      ) {
        form.setFieldsValue({
          workScheduleId: activeWorkScheduleIdFromEmployee,
          shiftScheduleId: nextShiftScheduleId,
          assignedShiftIds: nextAssignedShiftIds,
        });
      }
    }

    const scheduleToUse =
      (edit.workSchedule ? selectedWorkSchedule : null) ||
      (activeWorkScheduleIdFromEmployee &&
        workSchedules?.items?.find(
          (schedule: any) => schedule.id === activeWorkScheduleIdFromEmployee,
        ));

    if (scheduleToUse?.detail) {
      const scheduleData = scheduleToUse.detail.map(
        (day: any, index: number) => ({
          key: index,
          day: day.dayOfWeek || day.day || '',
          workDay: day.workDay || day.workday || false,
          startTime: day.startTime ? dayjs(day.startTime, 'HH:mm') : null,
          endTime: day.endTime ? dayjs(day.endTime, 'HH:mm') : null,
          duration: day.duration || 0,
        }),
      );
      setDailySchedule((prev) => {
        const prevSignature = prev
          .map(
            (day) =>
              `${day.day}-${day.workDay}-${day.duration}-${day.startTime?.format?.('HH:mm') || ''}-${day.endTime?.format?.('HH:mm') || ''}`,
          )
          .join('|');
        const nextSignature = scheduleData
          .map(
            (day: any) =>
              `${day.day}-${day.workDay}-${day.duration}-${day.startTime?.format?.('HH:mm') || ''}-${day.endTime?.format?.('HH:mm') || ''}`,
          )
          .join('|');
        return prevSignature === nextSignature ? prev : scheduleData;
      });
    }
  }, [
    form,
    employeeData,
    setWorkSchedule,
    selectedWorkSchedule,
    workSchedules,
    edit.workSchedule,
    userShiftAssignments,
    workSchedule,
  ]);

  // Find the active job's work schedule
  const activeJob = employeeData?.employeeJobInformation?.find(
    (e: any) => e.isPositionActive === true,
  );
  const activeWorkScheduleId = activeJob?.workScheduleId;

  // Try to get work schedule from selectedWorkSchedule first (if in edit mode), then from workSchedules list
  // Only use selectedWorkSchedule when in edit mode; otherwise use the schedule from employeeData
  const activeWorkSchedule = edit.workSchedule
    ? selectedWorkSchedule ||
      workSchedules?.items?.find(
        (schedule: any) => schedule.id === activeWorkScheduleId,
      )
    : workSchedules?.items?.find(
        (schedule: any) => schedule.id === activeWorkScheduleId,
      );

  // Calculate total working hours per week (only for working days)
  const workingDays =
    activeWorkSchedule?.detail?.filter(
      (day: any) => day.workDay === true || day.workday === true,
    ) || [];
  const totalWorkingHours = workingDays.reduce((total: number, day: any) => {
    // Use duration field (which is in decimal hours) or hours field if available
    const dayHours = day.duration ?? day.hours ?? 0;
    const hoursValue = Number(dayHours);
    return total + (isNaN(hoursValue) ? 0 : hoursValue);
  }, 0);

  // Calculate daily working hours (average) - round to 1 decimal place
  const dailyWorkingHours =
    workingDays.length > 0 && totalWorkingHours > 0
      ? Number((totalWorkingHours / workingDays.length).toFixed(1))
      : 0;

  return (
    <Card
      loading={isLoading}
      title={
        !edit.workSchedule ? (
          <span
            className="text-base font-normal text-[#4d4d4d]"
            data-cy="job-work-schedule-card-title"
          >
            Work Schedule
          </span>
        ) : null
      }
      extra={
        !edit.workSchedule ? (
          <AccessGuard
            permissions={[Permissions.UpdateEmployeeDetails]}
            id="job-work-schedule-edit-guard"
            data-cy="job-work-schedule-edit-guard"
          >
            <button
              onClick={() => handleEditChange('workSchedule')}
              className="w-6 h-6 border-[1px] border-[#D9D9D9] rounded-md"
              id="job-work-schedule-edit-btn"
              data-cy="job-work-schedule-edit-btn"
            >
              <EditOutlinedIcon className="text-sm" />
            </button>
          </AccessGuard>
        ) : null
      }
      className="work-schedule-card rounded-lg my-6 mt-0"
      bordered={false}
      style={{ background: '#F9FAFB', boxShadow: 'none' }}
      id="job-work-schedule-card"
      data-cy="job-work-schedule-card"
      headStyle={{
        borderBottom: 'none',
        paddingLeft: '16px',
        paddingRight: '16px',
        background: '#F9FAFB',
      }}
      bodyStyle={{ padding: '12px 16px 12px 16px', background: '#F9FAFB' }}
    >
      {!edit.workSchedule ? (
        <div className="px-3" data-cy="job-work-schedule-display-wrapper">
          <Row
            gutter={[24, 0]}
            id="job-work-schedule-display-row"
            data-cy="job-work-schedule-display-row"
          >
            <Col
              lg={12}
              id="job-work-schedule-display-col-left"
              data-cy="job-work-schedule-display-col-left"
              className="flex flex-col"
            >
              <div
                className="mb-5"
                id="job-work-schedule-current-schedule"
                data-cy="job-work-schedule-current-schedule"
              >
                <p
                  className="text-sm text-[#4d4d4d] font-normal m-0 mb-0.5"
                  data-cy="job-work-schedule-current-schedule-label"
                >
                  Current Schedule
                </p>
                <p
                  className="text-base font-normal text-[#4d4d4d] m-0"
                  data-cy="job-work-schedule-current-schedule-value"
                >
                  {activeJob?.workSchedule?.name || '-'}
                </p>
              </div>
            </Col>
            <Col
              lg={12}
              id="job-work-schedule-display-col-right"
              data-cy="job-work-schedule-display-col-right"
              className="flex flex-col"
            >
              <div
                className="mb-5"
                id="job-work-schedule-daily-hours"
                data-cy="job-work-schedule-daily-hours"
              >
                <p
                  className="text-sm text-[#4d4d4d] font-normal m-0 mb-0.5"
                  data-cy="job-work-schedule-daily-hours-label"
                >
                  Daily Working hours
                </p>
                <p
                  className="text-base font-normal text-[#4d4d4d] m-0"
                  data-cy="job-work-schedule-daily-hours-value"
                >
                  {dailyWorkingHours > 0
                    ? `${dailyWorkingHours} hours`
                    : activeWorkSchedule
                      ? '0 hours'
                      : '-'}
                </p>
              </div>
            </Col>
          </Row>
          <Row
            gutter={[24, 0]}
            id="job-work-schedule-total-row"
            data-cy="job-work-schedule-total-row"
          >
            <Col
              lg={12}
              id="job-work-schedule-total-col"
              data-cy="job-work-schedule-total-col"
              className="flex flex-col"
            >
              <div
                className="mb-5"
                id="job-work-schedule-total-working-hours"
                data-cy="job-work-schedule-total-working-hours"
              >
                <p
                  className="text-sm text-[#4d4d4d] font-normal m-0 mb-0.5"
                  data-cy="job-work-schedule-total-hours-label"
                >
                  Total Working Hours
                </p>
                <p
                  className="text-base font-normal text-[#4d4d4d] m-0"
                  data-cy="job-work-schedule-total-hours-value"
                >
                  {totalWorkingHours > 0
                    ? `${Math.round(totalWorkingHours)} Hours`
                    : activeWorkSchedule
                      ? '0 Hours'
                      : '-'}
                </p>
              </div>
            </Col>
          </Row>
          {userShiftAssignments.length > 0 && (
            <Row
              gutter={[24, 0]}
              id="job-work-schedule-shifts-row"
              data-cy="job-work-schedule-shifts-row"
            >
              <Col span={24} className="flex flex-col">
                <div
                  className="mb-2 rounded-xl border-2 border-[#93C5FD] bg-white px-3 py-3"
                  data-cy="job-work-schedule-assigned-shifts"
                >
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <p
                      className="text-sm font-semibold text-[#1E40AF] m-0"
                      data-cy="job-work-schedule-assigned-shifts-label"
                    >
                      Assigned Shifts
                    </p>
                    <Tag color="blue" className="!m-0 !text-[10px]">
                      Shift schedule
                    </Tag>
                  </div>
                  <div
                    className="flex flex-col gap-2"
                    data-cy="job-work-schedule-assigned-shifts-list"
                  >
                    {userShiftAssignments.map((assignment) => (
                      <div
                        key={assignment.id}
                        className="rounded-lg border border-[#BFDBFE] bg-[#F8FBFF] px-3 py-2"
                        data-cy={`job-work-schedule-assigned-shift-card-${assignment.id}`}
                      >
                        <p
                          className="mb-1 text-sm font-medium text-[#4d4d4d]"
                          data-cy={`job-work-schedule-assigned-shift-title-${assignment.id}`}
                        >
                          {assignment.blueprint.title}
                        </p>
                        <div
                          className="flex flex-wrap gap-1.5"
                          data-cy={`job-work-schedule-assigned-shift-tags-${assignment.id}`}
                        >
                          {assignment.shifts.length > 0 ? (
                            assignment.shifts.map((shift) => (
                              <Tag
                                key={shift.id}
                                color="blue"
                                className="!m-0 !text-[11px] !leading-5"
                              >
                                {shift.name} ·{' '}
                                {formatTimeRange(
                                  shift.startTime,
                                  shift.endTime,
                                )}
                              </Tag>
                            ))
                          ) : (
                            <Tag className="!m-0 !text-[11px] !leading-5">
                              Day hours only
                            </Tag>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Col>
            </Row>
          )}
        </div>
      ) : (
        <div
          id="job-work-schedule-edit-wrapper"
          data-cy="job-work-schedule-edit-wrapper"
        >
          {/* Header with Summary and Action Buttons */}
          <div
            className="flex justify-between items-center mb-6"
            id="job-work-schedule-edit-header"
            data-cy="job-work-schedule-edit-header"
          >
            <div
              className="flex items-center gap-3"
              data-cy="job-work-schedule-edit-summary-row"
            >
              <span
                className="text-base font-normal text-[#4d4d4d]"
                data-cy="job-work-schedule-edit-title"
              >
                Work Schedule
              </span>
              <div
                className="flex gap-2"
                data-cy="job-work-schedule-edit-badges"
              >
                <Tag className="bg-[#f9fafb]border border-[#e5e7eb] text-black">
                  {editTotalWorkingDays} Days
                </Tag>
                <Tag className="bg-[#f9fafb]border border-[#e5e7eb] text-black">
                  {Math.round(editTotalWorkingHours)} Hours
                </Tag>
              </div>
            </div>
            <div
              className="flex gap-2"
              data-cy="job-work-schedule-edit-actions"
            >
              <Button
                type="default"
                size="small"
                onClick={handleCancelEdit}
                className="w-6 h-6 rounded-md border border-red-500"
                id="job-work-schedule-edit-cancel-btn"
                data-cy="job-work-schedule-edit-cancel-btn"
              >
                <CloseIcon className="text-red-500 text-[10px]" />
              </Button>
              <Button
                type="primary"
                size="small"
                onClick={() => form.submit()}
                className="w-6 h-6 rounded-md border border-blue-500"
                id="job-work-schedule-edit-save-btn"
                data-cy="job-work-schedule-edit-save-btn"
              >
                <CheckIcon className="text-blue-500 text-[10px]" />
              </Button>
            </div>
          </div>

          <Form
            form={form}
            layout="vertical"
            onFinish={() => handleSaveChanges('workSchedule')}
            initialValues={employeeData?.employeeInformation?.addresses || {}}
            id="job-work-schedule-edit-form"
            data-cy="job-work-schedule-edit-form"
          >
            {/* Work Schedule Category */}
            <Form.Item
              className="font-semibold text-xs mb-4"
              name="workScheduleId"
              id="workScheduleId"
              data-cy="job-work-schedule-edit-form-item"
              label={
                <span
                  className="text-sm font-normal text-[#4d4d4d]"
                  data-cy="job-work-schedule-edit-form-label"
                >
                  Work Schedule Category
                </span>
              }
              rules={[
                {
                  required: true,
                  message: 'Please select a work schedule!',
                },
              ]}
            >
              <Select
                placeholder="Select"
                className="mt-2"
                onChange={workscheduleChangeHandler}
                allowClear
                value={workSchedule}
                id="job-work-schedule-edit-select"
                data-cy="job-work-schedule-edit-select"
                size="large"
              >
                {workSchedules?.items.map((schedule) => (
                  <Option
                    key={schedule.id}
                    value={schedule.id}
                    id={`job-work-schedule-edit-option-${schedule.id}`}
                    data-cy={`job-work-schedule-edit-option-${schedule.id}`}
                  >
                    {schedule.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              className="font-semibold text-xs mb-4"
              name="shiftScheduleId"
              label={
                <span
                  className="text-sm font-normal text-[#4d4d4d]"
                  data-cy="job-work-schedule-edit-shift-schedule-label"
                >
                  Shift Schedule
                </span>
              }
            >
              <Select
                placeholder="Select shift schedule (optional)"
                className="mt-2"
                allowClear
                size="large"
                onChange={(value: string | undefined) => {
                  const schedule = shiftSchedules.find(
                    (item) => item.id === value,
                  );
                  form.setFieldsValue({
                    assignedShiftIds: schedule?.hasShifts
                      ? (schedule.shifts || []).map((shift) => shift.id)
                      : [],
                  });
                }}
                options={shiftSchedules.map((schedule) => ({
                  value: schedule.id,
                  label: schedule.title,
                }))}
                data-cy="job-work-schedule-edit-shift-schedule"
              />
            </Form.Item>

            {selectedShiftSchedule?.hasShifts && (
              <Form.Item
                className="font-semibold text-xs mb-4"
                name="assignedShiftIds"
                label={
                  <span
                    className="text-sm font-normal text-[#4d4d4d]"
                    data-cy="job-work-schedule-edit-shifts-label"
                  >
                    Shifts
                  </span>
                }
                rules={[
                  {
                    required: true,
                    message: 'Select at least one shift',
                  },
                ]}
              >
                <Select
                  mode="multiple"
                  placeholder="Select shifts"
                  className="mt-2"
                  size="large"
                  options={(selectedShiftSchedule.shifts || []).map(
                    (shift) => ({
                      value: shift.id,
                      label: `${shift.name} · ${formatTimeRange(shift.startTime, shift.endTime)}`,
                    }),
                  )}
                  data-cy="job-work-schedule-edit-shifts"
                />
              </Form.Item>
            )}

            {/* Working Days Section */}
            <div
              className="mb-6"
              data-cy="job-work-schedule-working-days-section"
            >
              <label
                className="text-sm font-medium text-gray-700 mb-3 block"
                data-cy="job-work-schedule-working-days-label"
              >
                Working Days
              </label>
              <div
                className="flex items-center h-8 w-[52px] gap-6"
                data-cy="job-work-schedule-working-days-buttons"
              >
                {dailySchedule.length > 0 ? (
                  dailySchedule.map((day, index) => {
                    const dayName = day.day || '';
                    const abbreviated =
                      dayName.length > 3 ? dayName.substring(0, 3) : dayName;
                    return (
                      <Tag
                        key={index}
                        className={`rounded-md h-8 py-1 px-[14.7px] ${day.workDay ? 'border border-[#1d4ed8] text-[#4d4d4d]' : 'bg-[#f9fafb]border border-[#d9d9d9] text-[#4d4d4d]'}`}
                      >
                        {abbreviated}
                      </Tag>
                    );
                  })
                ) : (
                  <div
                    className="text-sm text-gray-500"
                    data-cy="job-work-schedule-no-data"
                  >
                    No schedule data available. Please select a work schedule
                    category.
                  </div>
                )}
              </div>
            </div>

            {/* Daily Schedule Section */}
            <div data-cy="job-work-schedule-daily-section">
              <label
                className="text-sm font-normal text-[#4d4d4d] mb-3 block"
                data-cy="job-work-schedule-daily-label"
              >
                Daily Schedule
              </label>
              <div className="space-y-4" data-cy="job-work-schedule-daily-list">
                {dailySchedule.map((day, index) => {
                  const hours = day.workDay ? day.duration || 0 : 0;
                  return (
                    <div
                      key={index}
                      className={`flex items-center gap-4 p-4 rounded-lg border 'border-gray-200 bg-white
                      `}
                      id={`job-work-schedule-day-row-${index}`}
                      data-cy={`job-work-schedule-day-row-${index}`}
                    >
                      <Switch
                        disabled
                        checked={day.workDay}
                        onChange={(checked) => {
                          const updated = [...dailySchedule];
                          updated[index].workDay = checked;
                          setDailySchedule(updated);
                        }}
                        id={`job-work-schedule-switch-${index}`}
                        data-cy={`job-work-schedule-switch-${index}`}
                      />
                      <span
                        className="text-sm font-medium text-gray-700 min-w-[80px]"
                        data-cy={`job-work-schedule-day-name-${index}`}
                      >
                        {day.day || ''}
                      </span>
                      <div
                        className="flex items-center gap-3 flex-1"
                        data-cy={`job-work-schedule-day-times-${index}`}
                      >
                        <div
                          className="flex items-center gap-2 flex-1 border-[1px] border-[#bfbfbf] rounded-md px-1 bg-white"
                          data-cy={`job-work-schedule-time-range-${index}`}
                        >
                          <TimePicker
                            value={day.startTime}
                            format="HH:mm"
                            placeholder="Start time"
                            disabled
                            onChange={(time) => {
                              const updated = [...dailySchedule];
                              updated[index].startTime = time;
                              if (time && updated[index].endTime) {
                                const start = time;
                                const end = updated[index].endTime;
                                const diff = end.diff(start, 'hour', true);
                                updated[index].duration = diff > 0 ? diff : 0;
                              }
                              setDailySchedule(updated);
                            }}
                            className="flex-1 border-none shadow-none bg-white"
                            id={`job-work-schedule-start-time-${index}`}
                            data-cy={`job-work-schedule-start-time-${index}`}
                          />
                          <span
                            className="text-[#bfbfbf] text-sm"
                            data-cy={`job-work-schedule-time-separator-${index}`}
                          >
                            -
                          </span>
                          <TimePicker
                            value={day.endTime}
                            format="HH:mm"
                            placeholder="End time"
                            disabled
                            onChange={(time) => {
                              const updated = [...dailySchedule];
                              updated[index].endTime = time;
                              if (time && updated[index].startTime) {
                                const start = updated[index].startTime;
                                const end = time;
                                const diff = end.diff(start, 'hour', true);
                                updated[index].duration = diff > 0 ? diff : 0;
                              }
                              setDailySchedule(updated);
                            }}
                            className="flex-1 border-none shadow-none bg-white"
                            id={`job-work-schedule-end-time-${index}`}
                            data-cy={`job-work-schedule-end-time-${index}`}
                          />
                        </div>
                        <Tag
                          className={`border-[#91caff] text-[#4096ff] px-3 py-1 rounded text-sm font-normal min-w-[80px] text-center hidden sm:block
                               bg-[#e6f4ff] border 
                              
                          `}
                          id={`job-work-schedule-hours-${index}`}
                          data-cy={`job-work-schedule-hours-${index}`}
                        >
                          {hours > 0
                            ? `${Math.round(hours * 10) / 10} Hours`
                            : '0 Hours'}
                        </Tag>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </Form>
        </div>
      )}
    </Card>
  );
};

export default WorkScheduleComponent;
