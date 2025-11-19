import { useGetWorkSchedules } from '@/store/server/features/employees/employeeManagment/workSchedule/queries';
import { useEmployeeManagementStore } from '@/store/uistate/features/employees/employeeManagment';
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

interface WorkScheduleFormProps {
  selectedWorkScheduleDetails?: any[];
}

const WorkScheduleForm: React.FC<WorkScheduleFormProps> = ({
  selectedWorkScheduleDetails,
}) => {
  const { data: workSchedules } = useGetWorkSchedules();
  const {
    selectedWorkSchedule,
    setSelectedWorkSchedule,
    workSchedule,
    setWorkSchedule,
  } = useEmployeeManagementStore();

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

  const data: DataType[] = (
    selectedWorkSchedule?.detail ||
    selectedWorkScheduleDetails ||
    []
  ).map((schedule, index) => {
    const timeValue =
      schedule?.hours ||
      (schedule?.startTime && schedule?.endTime
        ? `${dayjs(schedule?.startTime, 'h:mm A').format('HH:mm:ss')} - ${dayjs(
            schedule?.endTime,
            'h:mm A',
          ).format('HH:mm:ss')}`
        : '00:00:00');

    return {
      key: `${selectedWorkSchedule?.id || 'default'}-${index}`,
      workingDay: (
        <div className="flex space-x-2 justify-start">
          <Switch checked={schedule?.status || schedule?.workday} disabled />
          <span>{schedule?.dayOfWeek || schedule?.day}</span>
        </div>
      ),
      time: <TimePicker value={dayjs(timeValue, 'HH:mm:ss')} disabled />,
    };
  });

  return (
    <div id="work-schedule-form" data-cy="work-schedule-form">
      <div
        className="flex justify-center items-center text-gray-950 text-sm font-semibold my-2"
        id="work-schedule-title"
        data-cy="work-schedule-title"
      >
        Work Schedule
      </div>
      <Row gutter={16} id="work-schedule-select-row" data-cy="work-schedule-select-row">
        <Col xs={24} sm={24} id="work-schedule-select-col" data-cy="work-schedule-select-col">
          <Form.Item
            className="font-semibold text-xs"
            name="workScheduleId"
            id="workScheduleId"
            data-cy="workScheduleId"
            label={
              <span className="mb-1 font-semibold text-xs">
                Work Schedule Category
              </span>
            }
            rules={[
              { required: true, message: 'Please select a work schedule!' },
            ]}
          >
            <Select
              placeholder="Select an option"
              onChange={workscheduleChangeHandler}
              allowClear
              value={workSchedule}
              className="bg-white"
              id="work-schedule-select"
              data-cy="work-schedule-select"
            >
              {workSchedules?.items.map((schedule) => (
                <Option
                  key={schedule?.id}
                  value={schedule?.id}
                  id={`work-schedule-option-${schedule?.id}`}
                  data-cy={`work-schedule-option-${schedule?.id}`}
                >
                  {schedule?.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={16} id="work-schedule-table-row" data-cy="work-schedule-table-row">
        <Col xs={24} sm={24} id="work-schedule-table-col" data-cy="work-schedule-table-col">
          <Table
            columns={columns}
            dataSource={data}
            pagination={false}
            id="work-schedule-table"
            data-cy="work-schedule-table"
          />
        </Col>
      </Row>
    </div>
  );
};

export default WorkScheduleForm;
