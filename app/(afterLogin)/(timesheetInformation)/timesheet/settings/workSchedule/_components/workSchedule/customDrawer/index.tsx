import { DayOfWeek } from '@/store/server/features/organizationStructure/workSchedule/interface';
import { useUpdateSchedule } from '@/store/server/features/organizationStructure/workSchedule/mutation';
import { useCreateSchedule } from '@/store/server/features/organizationStructure/workSchedule/mutation';
import { useFetchSchedule } from '@/store/server/features/organizationStructure/workSchedule/queries';
import { ScheduleDetail } from '@/store/uistate/features/organizationStructure/workSchedule/interface';
import useScheduleStore from '@/store/uistate/features/organizationStructure/workSchedule/useStore';
import { showValidationErrors } from '@/utils/showValidationErrors';
import { useEffect } from 'react';
import { Form, Input, TimePicker, Switch, Button, Modal } from 'antd';
import dayjs from 'dayjs';
import { ClockCircleOutlined } from '@ant-design/icons';
import NotificationMessage from '@/components/common/notification/notificationMessage';

const CustomWorkingScheduleDrawer = () => {
  const {
    clearState,
    createWorkSchedule,
    id,
    scheduleName,
    standardHours,
    validationError,
    isOpen,
    closeDrawer,
    isEditMode,
    setDetail,
    setScheduleName,
    setStandardHours,
    setValidationError,
    clearValidationError,
    pageSize,
    currentPage,
  } = useScheduleStore();
  const {
    mutate: updateSchedule,
    isSuccess: isUpdateSuccess,
    isLoading: isUpdateLoading,
  } = useUpdateSchedule();
  const {
    mutate: createSchedule,
    isSuccess: isCreateSuccess,
    isLoading: isCreateLoading,
  } = useCreateSchedule();
  const { refetch: refetchSchedules } = useFetchSchedule(currentPage, pageSize);
  const [form] = Form.useForm();
  const { detail } = useScheduleStore((state) => ({
    scheduleName: state.scheduleName,
    detail: state.detail,
  }));

  const handleCancel = () => {
    clearState();
    form.resetFields();
    closeDrawer();
  };

  const handleSubmit = () => {
    const errorMessage =
      'Cannot create work schedule with 0 working hours. Please enable at least one working day with valid time range.';

    // Check if there are any working days enabled
    const hasWorkingDays = detail.some((item) => item.workDay);

    if (!hasWorkingDays) {
      setValidationError(errorMessage);
      NotificationMessage.warning({ message: errorMessage });
      return;
    }

    // Check if total working hours is 0
    if (standardHours === 0) {
      setValidationError(errorMessage);
      NotificationMessage.warning({ message: errorMessage });
      return;
    }

    clearValidationError();
    createWorkSchedule();
    const transformedDetails: DayOfWeek[] = useScheduleStore
      .getState()
      .detail.map((item: ScheduleDetail) => ({
        id: item.id,
        startTime: item.startTime,
        endTime: item.endTime,
        duration: item.duration,
        workDay: item.workDay,
        day: item.day,
      }));

    if (isEditMode) {
      form
        .validateFields()
        .then(() => {
          updateSchedule({
            id: id,
            schedule: {
              name: scheduleName,
              detail: transformedDetails,
            },
          });
        })
        .catch((errorInfo: any) => {
          showValidationErrors(errorInfo?.errorFields);
        });
    } else {
      form
        .validateFields()
        .then(() => {
          createSchedule({
            name: scheduleName,
            detail: transformedDetails,
          });
        })
        .catch((errorInfo: any) => {
          showValidationErrors(errorInfo?.errorFields);
        });
    }
  };

  useEffect(() => {
    const fieldValues: Record<string, any> = {
      scheduleName,
      ...detail.reduce(
        (acc, item) => {
          acc[`${item.day}-working`] = item.workDay;
          acc[`${item.day}-start`] = item.startTime
            ? dayjs(item.startTime, 'h:mm A')
            : null;
          acc[`${item.day}-end`] = item.endTime
            ? dayjs(item.endTime, 'h:mm A')
            : null;
          return acc;
        },
        {} as Record<string, any>,
      ),
    };
    form.setFieldsValue(fieldValues);
  }, [form, scheduleName, detail]);

  // Handle successful mutations with proper timing
  useEffect(() => {
    if (isUpdateSuccess || isCreateSuccess) {
      // Force refetch the schedule data and wait for it to complete
      refetchSchedules().then(() => {
        // Only close after the data has been refetched
        clearState();
        form.resetFields();
        closeDrawer();
      });
    }
  }, [
    isUpdateSuccess,
    isCreateSuccess,
    refetchSchedules,
    clearState,
    form,
    closeDrawer,
  ]);

  const handleValuesChange = (s: any, allValues: any) => {
    let totalHours = 0;
    detail.forEach((item) => {
      const start = allValues[`${item.day}-start`];
      const end = allValues[`${item.day}-end`];
      const isWorkingDay = allValues[`${item.day}-working`];

      if (start && end && isWorkingDay) {
        const duration = dayjs(end).diff(dayjs(start), 'hour', true);
        totalHours += duration;
      }
    });
    setStandardHours(totalHours);
    // Clear validation error when hours change
    if (totalHours > 0 && validationError) {
      clearValidationError();
    }
  };

  const handleSwitchChange = (day: string, checked: boolean) => {
    setDetail(day, { workDay: checked });

    // Recalculate total hours after workDay change
    setTimeout(() => {
      const updatedDetail = useScheduleStore.getState().detail;
      let totalHours = 0;
      updatedDetail.forEach((item) => {
        if (item.workDay && item.startTime && item.endTime) {
          const duration = dayjs(item.endTime, 'h:mm A').diff(
            dayjs(item.startTime, 'h:mm A'),
            'hour',
            true,
          );
          totalHours += duration;
        }
      });
      setStandardHours(totalHours);

      // Clear validation error when hours change
      if (totalHours > 0 && validationError) {
        clearValidationError();
      }
    }, 0);
  };

  const workingDays = detail.filter((item) => item.workDay);

  return (
    <Modal
      title={
        <h1
          className="text-[#4d4d4d] text-lg font-semibold"
          data-cy="org-settings-work-schedule-drawer-header"
          id="org-settings-work-schedule-drawer-header"
        >
          Work Schedule
        </h1>
      }
      onCancel={handleCancel}
      open={isOpen}
      width={720}
      footer={
        <div
          className="flex justify-end items-center w-full pt-3"
          data-cy="org-settings-work-schedule-drawer-footer"
          id="org-settings-work-schedule-drawer-footer"
        >
          <div
            className="flex gap-3"
            data-cy="org-components-workschedule-customdrawer-index-div-2"
            id="org-components-workschedule-customdrawer-index-div-2"
          >
            <Button
              type="default"
              className="font-normal h-8 border border-[#D9D9D9] text-[#4d4d4d]"
              onClick={handleCancel}
              data-cy="org-settings-work-schedule-drawer-cancel-btn"
              id="org-settings-work-schedule-drawer-cancel-btn"
            >
              Cancel
            </Button>
            <Button
              type="primary"
              className="font-normal h-8"
              onClick={handleSubmit}
              loading={isUpdateLoading || isCreateLoading}
              data-cy="org-settings-work-schedule-drawer-submit-btn"
              id="org-settings-work-schedule-drawer-submit-btn"
            >
              {isEditMode ? 'Update' : 'Create'}
            </Button>
          </div>
        </div>
      }
      data-cy="org-components-workschedule-customdrawer-index-customdrawerlayout-1"
      centered
      zIndex={10002}

    >
      <Form
        form={form}
        layout="vertical"
        onValuesChange={handleValuesChange}
        className="w-full"
        data-cy="org-settings-work-schedule-form"
        id="org-settings-work-schedule-form"
      >
        <div
          className="border border-gray-300 rounded-xl p-3"
          data-cy="org-settings-work-schedule-form-card"
        >
          <Form.Item
            name="scheduleName"
            label={
              <span
                className="text-[#2d2d2d] text-base font-medium"
                data-cy="org-components-workschedule-customdrawer-index-span-1"
                id="org-components-workschedule-customdrawer-index-span-1"
              >
                Work Schedule Name
              </span>
            }
            rules={[{ required: true, message: 'Please input schedule name!' }]}
            data-cy="org-settings-work-schedule-name-field"
            id="org-settings-work-schedule-name-field"
          >
            <Input
              size="large"
              className="h-12 mt-2 w-full font-normal text-base rounded-lg"
              placeholder="Input"
              value={scheduleName}
              onChange={(e) => setScheduleName(e.target.value)}
              data-cy="org-settings-work-schedule-name-input"
              id="org-settings-work-schedule-name-input"
            />
          </Form.Item>

          <div
            className="mb-3"
            data-cy="org-settings-work-schedule-working-days-section"
          >
            <span
              className="text-[#2d2d2d] text-md font-medium"
              data-cy="org-settings-work-schedule-working-days-title"
            >
              Working Days
            </span>
            <div
              className="flex flex-wrap gap-3 mt-3"
              data-cy="org-settings-work-schedule-working-days-chips"
            >
              {detail.map((item) => {
                const dayKey =
                  item.day?.toLowerCase().replace(/\s+/g, '-') ?? 'day';
                return (
                  <button
                    key={item.day}
                    type="button"
                    className={`h-10 min-w-[72px] px-4 rounded-lg border text-base transition-colors ${
                      item.workDay
                        ? 'border-primary text-primary bg-white'
                        : 'border-gray-300 text-[#4d4d4d]'
                    }`}
                    onClick={() => handleSwitchChange(item.day, !item.workDay)}
                    data-cy={`org-settings-work-schedule-day-chip-${dayKey}`}
                    id={`org-settings-work-schedule-day-chip-${dayKey}`}
                  >
                    {item.day.slice(0, 3)}
                  </button>
                );
              })}
            </div>
          </div>

          <div data-cy="org-settings-work-schedule-daily-section">
            <h1
              className="text-[#2d2d2d] text-base font-medium mb-3"
              data-cy="org-settings-work-schedule-hours-title"
              id="org-settings-work-schedule-hours-title"
            >
              Daily Schedule
            </h1>
            <div
              className="flex flex-col gap-3"
              data-cy="org-settings-work-schedule-daily-cards"
            >
              {workingDays.map((record) => {
                const dayKey =
                  record.day?.toLowerCase().replace(/\s+/g, '-') ?? 'day';
                const startValue = form.getFieldValue(`${record.day}-start`);
                const endValue = form.getFieldValue(`${record.day}-end`);
                const duration =
                  startValue && endValue
                    ? dayjs(endValue).diff(dayjs(startValue), 'hour', true)
                    : 0;
                const hours = Math.floor(duration);
                const minutes = Math.round((duration - hours) * 60);

                return (
                  <div
                    key={record.day}
                    className="border border-gray-300 rounded-xl p-2 sm:p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3"
                    data-cy={`org-settings-work-schedule-daily-card-${dayKey}`}
                  >
                    <div
                      className="flex items-center gap-3"
                      data-cy={`org-settings-work-schedule-working-content-${dayKey}`}
                    >
                      <Form.Item
                        name={`${record.day}-working`}
                        valuePropName="checked"
                        noStyle
                        data-cy={`org-settings-work-schedule-working-form-item-${dayKey}`}
                      >
                        <Switch
                          checked={record.workDay}
                          onChange={(checked) =>
                            handleSwitchChange(record.day, checked)
                          }
                          data-cy={`org-settings-work-schedule-working-switch-${dayKey}`}
                        />
                      </Form.Item>
                      <p
                        className="text-[20px] text-[#1f1f1f] mb-0 capitalize"
                        data-cy={`org-settings-work-schedule-working-label-${dayKey}`}
                      >
                        {record.day}
                      </p>
                    </div>

                    <div
                      className="flex items-center gap-2"
                      data-cy={`org-settings-work-schedule-time-duration-wrap-${dayKey}`}
                    >
                      <div
                        className="h-10 px-3 rounded-lg border border-gray-300 bg-white inline-flex items-center gap-2"
                        data-cy={`org-settings-work-schedule-time-box-${dayKey}`}
                      >
                        <Form.Item
                          name={`${record.day}-start`}
                          noStyle
                          data-cy={`org-settings-work-schedule-start-time-form-item-${dayKey}`}
                        >
                          <TimePicker
                            format="h:mm A"
                            disabled={!record.workDay}
                            use12Hours
                            bordered={false}
                            inputReadOnly
                            className="custom-timepicker"
                            onChange={(time) =>
                              setDetail(record.day, {
                                startTime: time
                                  ? dayjs(time).format('h:mm A')
                                  : '',
                              })
                            }
                            data-cy={`org-settings-work-schedule-start-time-${dayKey}`}
                          />
                        </Form.Item>
                        <span
                          data-cy={`org-settings-work-schedule-time-separator-${dayKey}`}
                          className="text-[#d9d9d9]"
                        >
                          →
                        </span>
                        <Form.Item
                          name={`${record.day}-end`}
                          noStyle
                          data-cy={`org-settings-work-schedule-end-time-form-item-${dayKey}`}
                        >
                          <TimePicker
                            format="h:mm A"
                            disabled={!record.workDay}
                            use12Hours
                            bordered={false}
                            inputReadOnly
                            className="custom-timepicker"
                            onChange={(time) =>
                              setDetail(record.day, {
                                endTime: time
                                  ? dayjs(time).format('h:mm A')
                                  : '',
                              })
                            }
                            data-cy={`org-settings-work-schedule-end-time-${dayKey}`}
                          />
                        </Form.Item>
                        <ClockCircleOutlined
                          className="text-gray-400"
                          data-cy={`org-settings-work-schedule-time-icon-${dayKey}`}
                        />
                      </div>
                      <span
                        className="h-10 px-1 sm:px-4 rounded-lg border border-[#91caff] bg-[#e6f4ff] text-[#1677ff] inline-flex items-center text-sm text-nowrap"
                        data-cy={`org-settings-work-schedule-duration-${dayKey}`}
                      >
                        {`${hours}h ${minutes.toString().padStart(2, '0')}m`}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        {validationError && (
          <p
            className="text-red-500 text-sm mt-2"
            data-cy="org-settings-work-schedule-validation-error"
            id="org-settings-work-schedule-validation-error"
          >
            {validationError}
          </p>
        )}
      </Form>
    </Modal>
  );
};

export default CustomWorkingScheduleDrawer;
