import CustomDrawerLayout from '@/components/common/customDrawer';
import { DayOfWeek } from '@/store/server/features/organizationStructure/workSchedule/interface';
import { useUpdateSchedule } from '@/store/server/features/organizationStructure/workSchedule/mutation';
import { useCreateSchedule } from '@/store/server/features/organizationStructure/workSchedule/mutation';
import { ScheduleDetail } from '@/store/uistate/features/organizationStructure/workSchedule/interface';
import useScheduleStore from '@/store/uistate/features/organizationStructure/workSchedule/useStore';
import { showValidationErrors } from '@/utils/showValidationErrors';
import { useEffect } from 'react';
import { Form, Input, TimePicker, Switch, Table, Button } from 'antd';
import dayjs from 'dayjs';
import { ColumnsType } from 'antd/es/table';

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
    isOpen,
    closeDrawer,
    isEditMode,
    setDetail,
    setScheduleName,
    setStandardHours,
  } = useScheduleStore();
  const { mutate: updateSchedule } = useUpdateSchedule();
  const { mutate: createSchedule } = useCreateSchedule();
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
          handleCancel();
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
          handleCancel();
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
            className="min-w-[100px]"
            onChange={(time) =>
              setDetail(record.dayOfWeek, {
                startTime: time ? dayjs(time).format('h:mm A') : '',
              })
            }
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
            className="min-w-[100px]"
            onChange={(time) =>
              setDetail(record.dayOfWeek, {
                endTime: time ? dayjs(time).format('h:mm A') : '',
              })
            }
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
            return (
              <span>
                {record.status
                  ? duration
                    ? duration.toFixed(1)
                    : record.hours.toFixed(1)
                  : ''}
                h
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
        <h1 className="text-2xl font-semibold">Add New Work Schedule</h1>
      }
      onClose={handleCancel}
      open={isOpen}
      width="40%"
      footer={
        <div className="flex justify-between items-center w-full">
          <div className="flex justify items-center gap-2 mt-4">
            <span>Total Working hours:</span>
            <span className="mr-4">{standardHours.toFixed(1) ?? '-'}</span>
          </div>
          <div className="flex gap-4 mt-4 mr-8">
            <Button type="default" onClick={handleCancel}>
              Cancel
            </Button>
            <Button type="primary" onClick={handleSubmit}>
              {isEditMode ? 'Update' : 'Create'}
            </Button>
            {/* <CustomButton
              className="bg-gray-200 text-gray-700 hover:bg-gray-300"
              title="Cancel"
              onClick={handleCancel}
            />
            <CustomButton
              title={isEditMode ? 'Update' : 'Create'}
              onClick={handleSubmit}
            /> */}
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
          label="Schedule Name"
          rules={[{ required: true, message: 'Please input schedule name!' }]}
        >
          <Input
            size="large"
            placeholder="Enter your schedule name"
            value={scheduleName}
            onChange={(e) => setScheduleName(e.target.value)}
          />
        </Form.Item>
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
