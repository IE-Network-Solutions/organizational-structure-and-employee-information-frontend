'use client';
import { FC, useEffect } from 'react';
import { Form, Input, TimePicker, Switch, Table } from 'antd';
import dayjs from 'dayjs';
import { ColumnsType } from 'antd/es/table';
import { ScheduleDetail } from '@/store/uistate/features/organizationStructure/workSchedule/interface';
import useScheduleStore from '@/store/uistate/features/organizationStructure/workSchedule/useStore';
import { FormInstance } from 'antd/lib';

interface WorkScheduleProps {
  form: FormInstance;
}

const WorkSchedule: FC<WorkScheduleProps> = ({ form }) => {
  const { setDetail, setScheduleName, setStandardHours } = useScheduleStore();
  const { scheduleName, detail } = useScheduleStore((state) => ({
    scheduleName: state.scheduleName,
    detail: state.detail,
  }));

  useEffect(() => {
    const defaultStart = '8:00 AM';
    const defaultEnd = '5:00 PM';
    const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

    const updatedDetail = detail.map((item) => {
      if (weekdays.includes(item.day)) {
        return {
          ...item,
          workDay: true,
          startTime: defaultStart,
          endTime: defaultEnd,
        };
      }
      return {
        ...item,
        workDay: false,
        startTime: '',
        endTime: '',
      };
    });

    updatedDetail.forEach((item) => {
      setDetail(item.day, {
        workDay: item.workDay,
        startTime: item.startTime,
        endTime: item.endTime,
      });
    });

    const fieldValues: Record<string, any> = {
      scheduleName: scheduleName || 'Full-time Schedule',
      ...updatedDetail.reduce(
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
  }, [form]);

  const handleValuesChange = (changed: any, allValues: any) => {
    if ('scheduleName' in changed) {
      setScheduleName(changed.scheduleName);
    }

    let totalHours = 0;
    detail.forEach((item) => {
      const start = allValues[`${item.day}-start`];
      const end = allValues[`${item.day}-end`];
      if (start && end && allValues[`${item.day}-working`]) {
        const duration = dayjs(end).diff(dayjs(start), 'hour', true);
        totalHours += duration;
      }
    });
    setStandardHours(totalHours);
  };

  const columns: ColumnsType<ScheduleDetail> = [
    {
      title: 'Working Day',
      dataIndex: 'day',
      key: 'day',
      render: (notused, record) => (
        <Form.Item
          name={`${record.day}-working`}
          valuePropName="checked"
          noStyle
        >
          <div className="flex gap-2 md:gap-4 justify-start items-center">
            <Switch
              checked={record.workDay}
              onChange={(checked) => {
                setDetail(record.day, { workDay: checked });
              }}
            />
            <p>{record.day}</p>
          </div>
        </Form.Item>
      ),
    },
    {
      title: 'Starting Time',
      dataIndex: 'startTime',
      key: 'startTime',
      render: (notused, record) => (
        <Form.Item
          name={`${record.day}-start`}
          noStyle
          rules={[
            {
              required: record.workDay,
              message: 'Start time is required.',
            },
          ]}
        >
          <TimePicker
            format="h:mm A"
            disabled={!record.workDay}
            use12Hours
            className="min-w-[100px]"
            onChange={(time) => {
              setDetail(record.day, {
                startTime: time ? dayjs(time).format('h:mm A') : '',
              });
            }}
          />
        </Form.Item>
      ),
    },
    {
      title: 'End Time',
      dataIndex: 'endTime',
      key: 'endTime',
      render: (notused, record) => (
        <Form.Item
          name={`${record.day}-end`}
          noStyle
          rules={[
            {
              required: record.workDay,
              message: 'End time is required.',
            },
            ({ getFieldValue }) => ({
              validator(notused, value) {
                const start = getFieldValue(`${record.day}-start`);
                if (!value || (start && dayjs(value).isAfter(dayjs(start)))) {
                  return Promise.resolve();
                }
                return Promise.reject(
                  new Error('End time must be after start time.'),
                );
              },
            }),
          ]}
        >
          <TimePicker
            format="h:mm A"
            disabled={!record.workDay}
            use12Hours
            className="min-w-[100px]"
            onChange={(time) => {
              setDetail(record.day, {
                endTime: time ? dayjs(time).format('h:mm A') : '',
              });
            }}
          />
        </Form.Item>
      ),
    },
    {
      title: 'Duration',
      dataIndex: 'duration',
      key: 'duration',
      render: (notused, record) => (
        <Form.Item shouldUpdate noStyle>
          {({ getFieldValue }) => {
            const start = getFieldValue(`${record.day}-start`);
            const end = getFieldValue(`${record.day}-end`);
            const duration =
              start && end ? dayjs(end).diff(dayjs(start), 'hour', true) : 0;
            return (
              <span>
                {record.workDay && duration
                  ? duration.toFixed(1)
                  : record.duration.toFixed(1)}
                h
              </span>
            );
          }}
        </Form.Item>
      ),
    },
  ];

  return (
    <div className="flex flex-col bg-gray-50 p-4 md:p-6 lg:p-8 rounded-lg my-4 md:my-6 lg:my-8 w-full h-full">
      <div className="bg-white p-4 md:p-6 lg:p-8 rounded-lg w-full h-full">
        <div className="flex flex-col md:flex-row justify-start items-center gap-2 md:gap-4 font-bold text-xl md:text-2xl text-black mt-4 md:mt-8">
          Set up your Work Schedule
        </div>
        <Form
          form={form}
          layout="vertical"
          onValuesChange={handleValuesChange}
          className="w-full"
        >
          <Form.Item
            name="scheduleName"
            label={<span className="text-sm font-semibold">Schedule Name</span>}
            className="w-full font-normal text-lg md:text-xl mt-4 md:mt-8"
            rules={[{ required: true, message: 'Please input schedule name!' }]}
          >
            <Input
              size="large"
              className="mt-2 w-full font-normal text-sm "
              placeholder="Enter your schedule name"
            />
          </Form.Item>

          <div className="overflow-x-auto">
            <Table
              columns={columns}
              dataSource={detail}
              pagination={false}
              className="mt-6 md:mt-12 w-full"
              scroll={{ x: '100%' }}
              rowKey="day"
            />
          </div>
        </Form>
      </div>
    </div>
  );
};

export default WorkSchedule;
