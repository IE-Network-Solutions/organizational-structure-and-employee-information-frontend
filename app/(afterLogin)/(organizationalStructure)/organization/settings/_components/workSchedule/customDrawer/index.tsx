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

// interface WorkScheduleFormProps {
//   form: FormInstance;
//   scheduleName: string;
//   detail: ScheduleDetail[];
//   setScheduleName: (name: string) => void;
//   setDetail: (day: string, updatedData: Partial<ScheduleDetail>) => void;
//   setStandardHours: (hours: number) => void;
// }

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
  const { mutate: updateSchedule, isSuccess: isUpdateSuccess } =
    useUpdateSchedule();
  const { mutate: createSchedule, isSuccess: isCreateSuccess } =
    useCreateSchedule();
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
    const hasWorkingDays = detail.some((item) => item.status);

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
        duration: item.hours,
        workDay: item.status,
        day: item.dayOfWeek,
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
          acc[`${item.dayOfWeek}-working`] = item.status;
          acc[`${item.dayOfWeek}-start`] = item.startTime
            ? dayjs(item.startTime, 'h:mm A')
            : null;
          acc[`${item.dayOfWeek}-end`] = item.endTime
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
      const start = allValues[`${item.dayOfWeek}-start`];
      const end = allValues[`${item.dayOfWeek}-end`];
      if (start && end && item.status) {
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

  const columns: ColumnsType<ScheduleDetail> = [
    {
      title: 'Working Day',
      dataIndex: 'dayOfWeek',
      key: 'dayOfWeek',
      render: (s, record) => (
        <Form.Item
          name={`${record.dayOfWeek}-working`}
          valuePropName="checked"
          noStyle
        >
          <div className="flex gap-2 md:gap-4 justify-start items-center">
            <Switch
              checked={record.status}
              checkedChildren={<CheckOutlined />}
              unCheckedChildren={<CloseOutlined />}
              size="small"
              onChange={(checked) =>
                setDetail(record.dayOfWeek, { status: checked })
              }
            />
            <p>{record.dayOfWeek}</p>
          </div>
        </Form.Item>
      ),
    },
    {
      title: 'Starting Time',
      dataIndex: 'startTime',
      key: 'startTime',
      render: (s, record) => (
        <Form.Item name={`${record.dayOfWeek}-start`} noStyle>
          <TimePicker
            format="h:mm A"
            disabled={!record.status}
            use12Hours
            className="min-w-[90px] h-7 custom-timepicker"
            onChange={(time) =>
              setDetail(record.dayOfWeek, {
                startTime: time ? dayjs(time).format('h:mm A') : '',
              })
            }
            size="small"
          />
        </Form.Item>
      ),
    },
    {
      title: 'End Time',
      dataIndex: 'endTime',
      key: 'endTime',
      render: (s, record) => (
        <Form.Item name={`${record.dayOfWeek}-end`} noStyle>
          <TimePicker
            format="h:mm A"
            disabled={!record.status}
            use12Hours
            className="min-w-[90px] h-7 custom-timepicker"
            onChange={(time) =>
              setDetail(record.dayOfWeek, {
                endTime: time ? dayjs(time).format('h:mm A') : '',
              })
            }
            size="small"
          />
        </Form.Item>
      ),
    },
    {
      title: 'Duration',
      dataIndex: 'hours',
      key: 'hours',
      render: (s, record) => (
        <Form.Item shouldUpdate noStyle>
          {({ getFieldValue }) => {
            const start = getFieldValue(`${record.dayOfWeek}-start`);
            const end = getFieldValue(`${record.dayOfWeek}-end`);
            const duration =
              start && end ? dayjs(end).diff(dayjs(start), 'hour', true) : 0;
            const hours = Math.floor(duration);
            const minutes = Math.round((duration - hours) * 60);
            return (
              <span className="inline-block py-1 px-4 border rounded-lg bg-white text-[10px] min-w-[70px] text-center text-[#1a202c]">
                {record.status
                  ? `${hours}h ${minutes.toString().padStart(2, '0')}m`
                  : '0h 00m'}
              </span>
            );
          }}
        </Form.Item>
      ),
    },
  ];

  return (
    <CustomDrawerLayout
      modalHeader={
        <h1 className="text-base font-semibold">Add New Work Schedule</h1>
      }
      onClose={handleCancel}
      open={isOpen}
      width="45%"
      footer={
        <div className="flex justify-between items-center w-full my-1 pb-3">
          <div className="flex justify-start items-center gap-2 mt-4 mx-1">
            <span className="text-xs font-semibold text-nowrap ">
              Total Working hours:
            </span>
            <span
              className={`mr-4 text-xs font-semibold text-nowrap ${validationError ? 'text-red-500' : 'text-primary'}`}
            >
              {standardHours.toFixed(1) ?? '-'} / Week
            </span>
            {validationError && (
              <span className="text-red-500 text-xs ml-2">
                {validationError}
              </span>
            )}
          </div>
          <div className="flex gap-2 mt-4 mr-8">
            <Button type="default" className="font-md" onClick={handleCancel}>
              Cancel
            </Button>
            <Button type="primary" className="font-md" onClick={handleSubmit}>
              {isEditMode ? 'Update' : 'Create'}
            </Button>
          </div>
        </div>
      }
    >
      <Form
        form={form}
        layout="vertical"
        onValuesChange={handleValuesChange}
        className="w-full"
      >
        <Form.Item
          name="scheduleName"
          label={<span className="text-sm font-semibold">Schedule Name</span>}
          rules={[{ required: true, message: 'Please input schedule name!' }]}
        >
          <Input
            size="large"
            className="h-10 mt-2 w-full font-normal text-sm"
            placeholder="Enter your schedule name"
            value={scheduleName}
            onChange={(e) => setScheduleName(e.target.value)}
          />
        </Form.Item>
        <h1 className="text-base m-3">Working hours</h1>
        <Table
          columns={columns}
          dataSource={detail}
          pagination={false}
          scroll={{ x: '100%' }}
        />
      </Form>
    </CustomDrawerLayout>
  );
};

export default CustomWorkingScheduleDrawer;
