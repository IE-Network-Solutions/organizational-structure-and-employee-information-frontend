import React from 'react';
import { Form, Input, TimePicker, Switch, Table } from 'antd';
import dayjs from 'dayjs';
import { ColumnsType } from 'antd/es/table';
import { ScheduleDetail } from '@/store/uistate/features/organizationStructure/workSchedule/interface';
import useScheduleStore from '@/store/uistate/features/organizationStructure/workSchedule/useStore';
import { FormInstance } from 'antd/lib';

const { Item: FormItem } = Form;

interface WorkScheduleProps {
  form: FormInstance;
}

const WorkSchedule: React.FC<WorkScheduleProps> = ({ form }) => {
  const { name, detail, setName, setDetail } = useScheduleStore();
  /* eslint-disable @typescript-eslint/naming-convention */

  const columns: ColumnsType<ScheduleDetail> = [
    {
      title: 'Working Day',
      dataIndex: 'dayOfWeek',
      key: 'dayOfWeek',
      render: (_, record) => (
        <FormItem
          name={`${record.dayOfWeek}-working`}
          valuePropName="checked"
          noStyle
        >
          <div className="flex gap-2 md:gap-4 justify-start items-center">
            <Switch
              id={`${record.dayOfWeek}SwitchId`}
              checked={record.status}
              onChange={(checked) => {
                setDetail(record.dayOfWeek, { status: checked });
              }}
            />
            <p>{record.dayOfWeek}</p>
          </div>
        </FormItem>
      ),
    },
    {
      title: 'Starting Time',
      dataIndex: 'startTime',
      key: 'startTime',
      render: (_, record) => (
        <FormItem
          name={`${record.dayOfWeek}-start`}
          noStyle
          rules={[
            {
              required: record.status,
              message: 'Start time is required when the status is checked.',
            },
          ]}
        >
          <TimePicker
            format="h:mm A"
            use12Hours
            defaultValue={
              record.startTime ? dayjs(record.startTime, 'h:mm A') : null
            }
            className="min-w-[100px]"
            onChange={(time) => {
              setDetail(record.dayOfWeek, {
                startTime: time ? dayjs(time).format('h:mm A') : '',
              });
            }}
            disabled={!record.status}
          />
        </FormItem>
      ),
    },
    {
      title: 'End Time',
      dataIndex: 'endTime',
      key: 'endTime',
      render: (_, record) => (
        <FormItem
          name={`${record.dayOfWeek}-end`}
          noStyle
          rules={[
            {
              required: record.status,
              message: 'End time is required when the status is checked.',
            },
          ]}
        >
          <TimePicker
            format="h:mm A"
            className="min-w-[100px]"
            use12Hours
            defaultValue={
              record.endTime ? dayjs(record.endTime, 'h:mm A') : null
            }
            onChange={(time) => {
              setDetail(record.dayOfWeek, {
                endTime: time ? dayjs(time).format('h:mm A') : '',
              });
            }}
            disabled={!record.status}
          />
        </FormItem>
      ),
    },
    {
      title: 'Duration',
      dataIndex: 'hours',
      key: 'hours',
      render: (_, record) => (
        <FormItem
          shouldUpdate={(
            prevValues: { [x: string]: any },
            currentValues: { [x: string]: any },
          ) =>
            prevValues[`${record.dayOfWeek}-start`] !==
              currentValues[`${record.dayOfWeek}-start`] ||
            prevValues[`${record.dayOfWeek}-end`] !==
              currentValues[`${record.dayOfWeek}-end`]
          }
          noStyle
        >
          {({ getFieldValue }) => {
            const start = getFieldValue(`${record.dayOfWeek}-start`);
            const end = getFieldValue(`${record.dayOfWeek}-end`);
            const duration =
              start && end ? dayjs(end).diff(dayjs(start), 'hour', true) : 0;
            return <span>{duration.toFixed(2)}h</span>;
          }}
        </FormItem>
      ),
    },
  ];
  /* eslint-enable @typescript-eslint/naming-convention */

  return (
    <div className="flex flex-col bg-gray-50 p-4 md:p-6 lg:p-8 rounded-lg my-4 md:my-6 lg:my-8 w-full h-full">
      <div className="bg-white p-4 md:p-6 lg:p-8 rounded-lg w-full h-full">
        <div className="flex flex-col md:flex-row justify-start items-center gap-2 md:gap-4 font-bold text-xl md:text-2xl text-black mt-4 md:mt-8">
          Set up your Work Schedule
        </div>
        <Form form={form} layout="vertical" className="w-full">
          <FormItem
            name="name"
            label="Schedule Name"
            className="w-full font-normal text-lg md:text-xl mt-4 md:mt-8"
            rules={[{ required: true, message: 'Please input schedule name!' }]}
            initialValue={name}
          >
            <Input
              size="large"
              className="mt-2 w-full font-normal text-sm md:text-base"
              placeholder="Enter your schedule name"
              onChange={(e) => {
                setName(e.target.value);
              }}
            />
          </FormItem>
          <div className="overflow-x-auto">
            <Table
              columns={columns}
              dataSource={detail}
              pagination={false}
              className="mt-6 md:mt-12 w-full"
              scroll={{ x: '100%' }}
            />
          </div>
        </Form>
      </div>
    </div>
  );
};

export default WorkSchedule;
