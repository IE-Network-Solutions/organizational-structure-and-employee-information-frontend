import CustomDrawerLayout from '@/components/common/customDrawer';
import { DayOfWeek } from '@/store/server/features/organizationStructure/workSchedule/interface';
import { useUpdateSchedule } from '@/store/server/features/organizationStructure/workSchedule/mutation';
import { useCreateSchedule } from '@/store/server/features/organizationStructure/workSchedule/mutation';
import { useFetchSchedule } from '@/store/server/features/organizationStructure/workSchedule/queries';
import { ScheduleDetail } from '@/store/uistate/features/organizationStructure/workSchedule/interface';
import useScheduleStore from '@/store/uistate/features/organizationStructure/workSchedule/useStore';
import { showValidationErrors } from '@/utils/showValidationErrors';
import { useEffect } from 'react';
import { Form, Input, TimePicker, Switch, Table, Button } from 'antd';
import dayjs from 'dayjs';
import { ColumnsType } from 'antd/es/table';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
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

  const columns: ColumnsType<ScheduleDetail> = [
    {
      title: 'Working Day',
      dataIndex: 'day',
      key: 'day',
      render: (s, record) => {
        const dayKey = record.day?.toLowerCase().replace(/\s+/g, '-') ?? 'day';
        return (
          <Form.Item
            name={`${record.day}-working`}
            valuePropName="checked"
            noStyle
            data-cy={`org-settings-work-schedule-working-form-item-${dayKey}`}
            id={`org-settings-work-schedule-working-form-item-${dayKey}`}
          >
            <div
              className="flex gap-2 md:gap-4 justify-start items-center"
              data-cy={`org-settings-work-schedule-working-content-${dayKey}`}
              id={`org-settings-work-schedule-working-content-${dayKey}`}
            >
              <Switch
                checked={record.workDay}
                checkedChildren={
                  <CheckOutlined data-cy="org-components-workschedule-customdrawer-index-checkoutlined-1" />
                }
                unCheckedChildren={
                  <CloseOutlined data-cy="org-components-workschedule-customdrawer-index-closeoutlined-1" />
                }
                size="small"
                onChange={(checked) => handleSwitchChange(record.day, checked)}
                data-cy={`org-settings-work-schedule-working-switch-${dayKey}`}
                id={`org-settings-work-schedule-working-switch-${dayKey}`}
              />
              <p
                data-cy={`org-settings-work-schedule-working-label-${dayKey}`}
                id={`org-settings-work-schedule-working-label-${dayKey}`}
              >
                {record.day}
              </p>
            </div>
          </Form.Item>
        );
      },
    },
    {
      title: 'Starting Time',
      dataIndex: 'startTime',
      key: 'startTime',
      render: (s, record) => {
        const dayKey = record.day?.toLowerCase().replace(/\s+/g, '-') ?? 'day';
        return (
          <Form.Item
            name={`${record.day}-start`}
            noStyle
            data-cy={`org-settings-work-schedule-start-time-form-item-${dayKey}`}
            id={`org-settings-work-schedule-start-time-form-item-${dayKey}`}
          >
            <TimePicker
              format="h:mm A"
              disabled={!record.workDay}
              use12Hours
              className="min-w-[90px] h-7 custom-timepicker"
              onChange={(time) =>
                setDetail(record.day, {
                  startTime: time ? dayjs(time).format('h:mm A') : '',
                })
              }
              size="small"
              data-cy={`org-settings-work-schedule-start-time-${dayKey}`}
              id={`org-settings-work-schedule-start-time-${dayKey}`}
            />
          </Form.Item>
        );
      },
    },
    {
      title: 'End Time',
      dataIndex: 'endTime',
      key: 'endTime',
      render: (s, record) => {
        const dayKey = record.day?.toLowerCase().replace(/\s+/g, '-') ?? 'day';
        return (
          <Form.Item
            name={`${record.day}-end`}
            noStyle
            data-cy={`org-settings-work-schedule-end-time-form-item-${dayKey}`}
            id={`org-settings-work-schedule-end-time-form-item-${dayKey}`}
          >
            <TimePicker
              format="h:mm A"
              disabled={!record.workDay}
              use12Hours
              className="min-w-[90px] h-7 custom-timepicker"
              onChange={(time) =>
                setDetail(record.day, {
                  endTime: time ? dayjs(time).format('h:mm A') : '',
                })
              }
              size="small"
              data-cy={`org-settings-work-schedule-end-time-${dayKey}`}
              id={`org-settings-work-schedule-end-time-${dayKey}`}
            />
          </Form.Item>
        );
      },
    },
    {
      title: 'Duration',
      dataIndex: 'hours',
      key: 'hours',
      render: (s, record) => {
        const dayKey = record.day?.toLowerCase().replace(/\s+/g, '-') ?? 'day';
        return (
          <Form.Item
            shouldUpdate
            noStyle
            data-cy={`org-settings-work-schedule-duration-form-item-${dayKey}`}
            id={`org-settings-work-schedule-duration-form-item-${dayKey}`}
          >
            {({ getFieldValue }) => {
              const start = getFieldValue(`${record.day}-start`);
              const end = getFieldValue(`${record.day}-end`);
              const duration =
                start && end ? dayjs(end).diff(dayjs(start), 'hour', true) : 0;
              const hours = Math.floor(duration);
              const minutes = Math.round((duration - hours) * 60);
              return (
                <span
                  className="inline-block py-1 px-4 border rounded-lg bg-white text-[10px] min-w-[70px] text-center text-[#1a202c]"
                  data-cy={`org-settings-work-schedule-duration-${dayKey}`}
                  id={`org-settings-work-schedule-duration-${dayKey}`}
                >
                  {record.workDay
                    ? `${hours}h ${minutes.toString().padStart(2, '0')}m`
                    : '0h 00m'}
                </span>
              );
            }}
          </Form.Item>
        );
      },
    },
  ];

  return (
    <CustomDrawerLayout
      modalHeader={
        <h1
          className="text-base font-semibold"
          data-cy="org-settings-work-schedule-drawer-header"
          id="org-settings-work-schedule-drawer-header"
        >
          Add New Work Schedule
        </h1>
      }
      onClose={handleCancel}
      open={isOpen}
      width="45%"
      footer={
        <div
          className="flex justify-between items-center w-full my-1 pb-3"
          data-cy="org-settings-work-schedule-drawer-footer"
          id="org-settings-work-schedule-drawer-footer"
        >
          <div
            className="flex justify-start items-center gap-2 mt-4 mx-1"
            data-cy="org-components-workschedule-customdrawer-index-div-1"
            id="org-components-workschedule-customdrawer-index-div-1"
          >
            <span
              className="text-xs font-semibold text-nowrap "
              data-cy="org-settings-work-schedule-total-hours-label"
              id="org-settings-work-schedule-total-hours-label"
            >
              Total Working hours:
            </span>
            <span
              className={`mr-4 text-xs font-semibold text-nowrap ${validationError ? 'text-red-500' : 'text-primary'}`}
              data-cy="org-settings-work-schedule-total-hours-value"
              id="org-settings-work-schedule-total-hours-value"
            >
              {standardHours.toFixed(1) ?? '-'} / Week
            </span>
            {validationError && (
              <span
                className="text-red-500 text-xs ml-2"
                data-cy="org-settings-work-schedule-validation-error"
                id="org-settings-work-schedule-validation-error"
              >
                {validationError}
              </span>
            )}
          </div>
          <div
            className="flex gap-2 mt-4 mr-8"
            data-cy="org-components-workschedule-customdrawer-index-div-2"
            id="org-components-workschedule-customdrawer-index-div-2"
          >
            <Button
              type="default"
              className="font-md"
              onClick={handleCancel}
              data-cy="org-settings-work-schedule-drawer-cancel-btn"
              id="org-settings-work-schedule-drawer-cancel-btn"
            >
              Cancel
            </Button>
            <Button
              type="primary"
              className="font-md"
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
    >
      <Form
        form={form}
        layout="vertical"
        onValuesChange={handleValuesChange}
        className="w-full"
        data-cy="org-settings-work-schedule-form"
        id="org-settings-work-schedule-form"
      >
        <Form.Item
          name="scheduleName"
          label={
            <span
              className="text-sm font-semibold"
              data-cy="org-components-workschedule-customdrawer-index-span-1"
              id="org-components-workschedule-customdrawer-index-span-1"
            >
              Schedule Name
            </span>
          }
          rules={[{ required: true, message: 'Please input schedule name!' }]}
          data-cy="org-settings-work-schedule-name-field"
          id="org-settings-work-schedule-name-field"
        >
          <Input
            size="large"
            className="h-10 mt-2 w-full font-normal text-sm"
            placeholder="Enter your schedule name"
            value={scheduleName}
            onChange={(e) => setScheduleName(e.target.value)}
            data-cy="org-settings-work-schedule-name-input"
            id="org-settings-work-schedule-name-input"
          />
        </Form.Item>
        <h1
          className="text-base m-3"
          data-cy="org-settings-work-schedule-hours-title"
          id="org-settings-work-schedule-hours-title"
        >
          Working hours
        </h1>
        <Table
          columns={columns}
          dataSource={detail}
          pagination={false}
          scroll={{ x: '100%' }}
          data-cy="org-settings-work-schedule-table"
          id="org-settings-work-schedule-table"
        />
      </Form>
    </CustomDrawerLayout>
  );
};

export default CustomWorkingScheduleDrawer;
