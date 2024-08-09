import { useGetWorkSchedules } from '@/store/server/features/employees/employeeManagment/workSchedule/queries';
import { useEmployeeManagmentStore } from '@/store/uistate/features/employees/employeeManagment';
import { Col, Form, Row, Select, Switch, Table, TimePicker } from 'antd';
import { TableProps } from 'antd/lib';
import dayjs from 'dayjs';
import React from 'react';

const { Option } = Select;

interface DataType {
  key: string;
  workingDay: React.ReactNode;
  time: React.ReactNode;
}

const WorkScheduleForm: React.FC = () => {
  const { data: workSchedules } = useGetWorkSchedules();
  const {
    selectedWorkSchedule,
    setSelectedWorkSchedule,
    workSchedule,
    setWorkSchedule,
  } = useEmployeeManagmentStore();

  const workscheduleChangeHandler = (value: string) => {
    const selectedValue = workSchedules?.items.find(
      (schedule) => schedule.id === value,
    );
    setSelectedWorkSchedule(selectedValue || null);
    setWorkSchedule(value);
  };

  const columns: TableProps<DataType>['columns'] = [
    {
      title: 'Working Day',
      dataIndex: 'workingDay',
      key: 'workingDay',
    },
    {
      title: 'Time',
      dataIndex: 'time',
      key: 'time',
    },
  ];

  const data: DataType[] = (selectedWorkSchedule?.detail || []).map((schedule, index) => ({
    key: index.toString(), // Use index or another unique identifier
    workingDay: (
      <div className="flex space-x-2 justify-start">
        <Switch checked={schedule?.status} disabled />
        <span>{schedule.dayOfWeek}</span>
      </div>
    ),
    time: (
      <TimePicker
        defaultValue={dayjs(schedule.hours || '00:00:00', 'HH:mm:ss')}
        disabled
      />
    ),
  }));

  return (
    <div>
      <div className="flex justify-center items-center text-gray-950 text-sm font-semibold my-2">
        Work Schedule
      </div>
      <Row gutter={16}>
        <Col xs={24} sm={24}>
          <Form.Item
            className="font-semibold text-xs"
            name="workScheduleId"
            id="workScheduleId"
            label="Work Schedule Category"
            rules={[{ required: true, message: 'Please select a work schedule!' }]}
          >
            <Select
              placeholder="Select an option"
              onChange={workscheduleChangeHandler}
              allowClear
              value={workSchedule}
            >
              {workSchedules?.items.map((schedule) => (
                <Option key={schedule.id} value={schedule.id}>
                  {schedule.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={16}>
        <Col xs={24} sm={24}>
          <Table columns={columns} dataSource={data} pagination={false} />
        </Col>
      </Row>
    </div>
  );
};

export default WorkScheduleForm;
