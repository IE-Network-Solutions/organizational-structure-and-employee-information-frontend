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
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
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
    (schedule, index) => {
      const decimalHour = schedule.duration || 0;
      const hours = Math.floor(decimalHour);
      const minutes = Math.round((decimalHour % 1) * 60);
      const timeValue = dayjs()
        .startOf('day')
        .add(hours, 'hour')
        .add(minutes, 'minute');

      return {
        key: index.toString(),
        workingDay: (
          <div className="flex space-x-2 justify-start">
            <Switch checked={schedule?.workDay} disabled />
            <span>{schedule.day}</span>
          </div>
        ),
        time: <TimePicker value={timeValue} format="HH:mm" disabled />,
      };
    },
  );

  const handleEditChange = (editKey: keyof EditState) => {
    setEdit(editKey);
    if (workSchedule) {
      workscheduleChangeHandler(workSchedule);
    }
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

  useEffect(() => {
    const employeeDataInfo = {
      ...employeeData,
      workScheduleId: employeeData?.employeeJobInformation?.find(
        (e: any) => e.isPositionActive === true,
      )?.workScheduleId,
    };
    setWorkSchedule(employeeDataInfo?.workScheduleId);

    form.setFieldsValue(employeeDataInfo);
  }, [form, employeeData]);

  const schedule = workSchedules?.items[0];

  const totalWorkingHours = schedule?.detail.reduce((total, day) => {
    return total + day.hours || 0;
  }, 0);

  const workingHours: { day: string; hours: number }[] =
    workSchedules?.items[0]?.detail?.map((day) => ({
      day: day.dayOfWeek || '',
      hours: day.hours || 0,
    })) || [];
  return (
    <Card
      loading={isLoading}
      title="Work Schedule"
      extra={
        <AccessGuard permissions={[Permissions.UpdateEmployeeDetails]}>
          <LuPencil
            className="cursor-pointer"
            onClick={() => handleEditChange('workSchedule')}
          />
        </AccessGuard>
      }
      className="my-6 mt-0"
    >
      {!edit.workSchedule ? (
        <Row gutter={[16, 24]}>
          <Col lg={16}>
            <InfoLine
              title="Current schedule"
              value={
                employeeData?.employeeJobInformation?.find(
                  (e: any) => e.isPositionActive === true,
                )?.workSchedule?.name || ''
              }
            />
            <InfoLine
              title="Total working hours/week"
              value={totalWorkingHours}
            />
            <InfoLine
              title="Daily working hours"
              value={
                <div className="flex gap-6">
                  <div className="flex flex-col space-y-1">
                    {workingHours?.map((item) => (
                      <div key={`${item?.day}-label`}>{item?.day}</div>
                    ))}
                  </div>

                  <div className="flex flex-col space-y-1">
                    {workingHours?.map((item) => (
                      <div key={`${item?.day}-value`} className="font-normal">
                        {item?.hours} hours
                      </div>
                    ))}
                  </div>
                </div>
              }
            />
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
                    className="mt-2"
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
            <Row className="mt-6">
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
