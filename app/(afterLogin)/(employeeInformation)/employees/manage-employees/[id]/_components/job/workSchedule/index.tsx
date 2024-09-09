'use client';
import React from 'react';
import {
  Button,
  Card,
  Col,
  Form,
  Row,
  Select,
  Switch,
  Table,
  TableProps,
  TimePicker,
} from 'antd';
import { InfoLine } from '../../common/infoLine';
import dayjs from 'dayjs';
import {
  EditState,
  useEmployeeManagementStore,
} from '@/store/uistate/features/employees/employeeManagment';
import { useGetEmployee } from '@/store/server/features/employees/employeeManagment/queries';
import { useGetWorkSchedules } from '@/store/server/features/employees/employeeManagment/workSchedule/queries';
import { useUpdateEmployeeJobInformation } from '@/store/server/features/employees/employeeDetail/mutations';
import { LuPencil } from 'react-icons/lu';
interface DataType {
  key: string;
  workingDay: React.ReactNode;
  time: React.ReactNode;
}
interface Ids {
  id: string;
}
const { Option } = Select;
const WorkScheduleComponent: React.FC<Ids> = ({ id }) => {
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
  const { data: employeeData, isLoading } = useGetEmployee(id);
  const { data: workSchedules } = useGetWorkSchedules();
  const [form] = Form.useForm();

  const handleSaveChanges = (editKey: keyof EditState) => {
    form
      .validateFields()
      .then((values) => {
        updateEmployeeJobInformation({
          id: employeeData?.employeeJobInformation[0]?.id,
          values,
        });
        setEdit(editKey);
      })
      .catch();
  };
  const workscheduleChangeHandler = (value: string) => {
    const selectedValue = workSchedules?.items.find(
      (schedule: any) => schedule.id === value,
    );
    setSelectedWorkSchedule(selectedValue || null);
    setWorkSchedule(value);
  };

  const data: any = (selectedWorkSchedule?.detail || []).map(
    (schedule, index) => ({
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
    }),
  );

  const handleEditChange = (editKey: keyof EditState) => {
    setEdit(editKey);
  };
  const workScheduleColumns: TableProps<DataType>['columns'] = [
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
  const dataValue = (workScheduleDetail: any) => {
    return (workScheduleDetail || []).map((schedule: any, index: number) => ({
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
  };
  return (
    <Card
      loading={isLoading}
      title="Work Schedule"
      extra={
        <LuPencil
          className="cursor-pointer"
          onClick={() => handleEditChange('workSchedule')}
        />
      }
      className="my-6 mt-0"
    >
      {!edit.workSchedule ? (
        <Row gutter={[16, 24]}>
          <Col lg={16}>
            <InfoLine
              title=""
              value={
                employeeData?.employeeJobInformation?.find(
                  (e: any) => e.isPositionActive === true,
                )?.workSchedule?.name || ''
              }
            />
            <Row gutter={16}>
              <Col xs={24} sm={24}>
                <Table
                  columns={workScheduleColumns}
                  dataSource={dataValue(
                    employeeData?.employeeJobInformation[0]?.workSchedule
                      ?.detail,
                  )}
                  pagination={false}
                />
              </Col>
            </Row>
          </Col>
        </Row>
      ) : (
        <div>
          <div className="flex justify-center items-center text-gray-950 text-sm font-semibold my-2">
            Work Schedule
          </div>
          <Form
            form={form}
            layout="vertical"
            onFinish={() => handleSaveChanges('workSchedule')}
            initialValues={employeeData?.employeeInformation?.addresses || {}}
          >
            <Row gutter={16}>
              <Col xs={24} sm={24}>
                <Form.Item
                  className="font-semibold text-xs"
                  name="workScheduleId"
                  id="workScheduleId"
                  label="Work Schedule Category"
                  rules={[
                    {
                      required: true,
                      message: 'Please select a work schedule!',
                    },
                  ]}
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
                <Table
                  columns={workScheduleColumns}
                  dataSource={data}
                  pagination={false}
                />
              </Col>
            </Row>
            <Row>
              <Col span={24} style={{ textAlign: 'right' }}>
                <Button type="primary" htmlType="submit">
                  Save Changes
                </Button>
              </Col>
            </Row>
          </Form>
        </div>
      )}
    </Card>
  );
};

export default WorkScheduleComponent;
