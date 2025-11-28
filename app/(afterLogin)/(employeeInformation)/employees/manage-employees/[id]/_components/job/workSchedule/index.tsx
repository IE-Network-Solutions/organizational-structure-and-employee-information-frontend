'use client';
import React, { useEffect, useState } from 'react';
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
import { useParams } from 'next/navigation';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';

interface DataType {
  key: string;
  workingDay: React.ReactNode;
  time: React.ReactNode;
}

const { Option } = Select;

const WorkScheduleComponent: React.FC = () => {
  const params = useParams();
  const userId = params.id as string;
  const { userId: loggedInUserId } = useAuthenticationStore();
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
  const { data: employeeData, isLoading, refetch } = useGetEmployee(userId);
  const { data: workSchedules } = useGetWorkSchedules();
  const [form] = Form.useForm();

  // State to track working days selections
  const [workingDays, setWorkingDays] = useState<Record<number, boolean>>({});

  const handleSaveChanges = (editKey: keyof EditState) => {
    form
      .validateFields()
      .then((values) => {
        // Include working days data in the submission
        const submissionData = {
          ...values,
          workScheduleDetails: selectedWorkSchedule?.detail?.map(
            (schedule, index) => ({
              ...schedule,
              workDay:
                workingDays[index] !== undefined
                  ? workingDays[index]
                  : schedule.workDay,
            }),
          ),
        };

        updateEmployeeJobInformation(
          {
            id: employeeData?.employeeJobInformation[0]?.id,
            values: submissionData,
            changeMakerUserId: loggedInUserId,
          },
          {
            onSuccess: () => {
              refetch(); // Refresh data after successful update
            },
          },
        );
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

    // Initialize working days state when schedule changes
    if (selectedValue?.detail) {
      const initialWorkingDays: Record<number, boolean> = {};
      selectedValue.detail.forEach((schedule: any, index: number) => {
        initialWorkingDays[index] = schedule.workDay;
      });
      setWorkingDays(initialWorkingDays);
    }
  };

  const handleWorkDayToggle = (index: number, checked: boolean) => {
    setWorkingDays((prev) => ({
      ...prev,
      [index]: checked,
    }));
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

      const isWorkDayChecked =
        workingDays[index] !== undefined
          ? workingDays[index]
          : schedule?.workDay;

      return {
        key: index.toString(),
        workingDay: (
          <div  id={`job-work-schedule-day-${index}`}
            data-cy={`job-work-schedule-day-${index}`} className="flex space-x-2 justify-start">
            <Switch    id={`job-work-schedule-switch-${index}`}
              data-cy={`job-work-schedule-switch-${index}`}
              checked={isWorkDayChecked}
              disabled={!edit.workSchedule}
              onChange={(checked) => handleWorkDayToggle(index, checked)}
            />
            <span id={`job-work-schedule-day-name-${index}`}
              data-cy={`job-work-schedule-day-name-${index}`}>{schedule.day}</span>
          </div>
        ),
        time: (
          <TimePicker
            value={timeValue}
            format="HH:mm"
            disabled
            id={`job-work-schedule-time-${index}`}
            data-cy={`job-work-schedule-time-${index}`}
          />
        ),
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

    // Initialize working days from employee data
    const activeSchedule = employeeData?.employeeJobInformation?.find(
      (e: any) => e.isPositionActive === true,
    )?.workSchedule;

    if (activeSchedule?.detail) {
      const initialWorkingDays: Record<number, boolean> = {};
      activeSchedule.detail.forEach((schedule: any, index: number) => {
        initialWorkingDays[index] = schedule.workDay;
      });
      setWorkingDays(initialWorkingDays);
    }
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
        <AccessGuard
          permissions={[Permissions.UpdateEmployeeDetails]}
          id="job-work-schedule-edit-guard"
          data-cy="job-work-schedule-edit-guard"
        >
          <LuPencil
            className="cursor-pointer"
            onClick={() => handleEditChange('workSchedule')}
            id="job-work-schedule-edit-icon"
            data-cy="job-work-schedule-edit-icon"
          />
        </AccessGuard>
      }
      className="my-6 mt-0"
      id="job-work-schedule-card"
      data-cy="job-work-schedule-card"
    >
      {!edit.workSchedule ? (
        <Row
          gutter={[16, 24]}
          id="job-work-schedule-display-row"
          data-cy="job-work-schedule-display-row"
        >
          <Col
            lg={16}
            id="job-work-schedule-display-col"
            data-cy="job-work-schedule-display-col"
          >
            <InfoLine
              title="Current schedule"
              value={
                employeeData?.employeeJobInformation?.find(
                  (e: any) => e.isPositionActive === true,
                )?.workSchedule?.name || ''
              }
              data-cy="job-work-schedule-current-schedule"
            />
            <InfoLine
              title="Total working hours/week"
              value={totalWorkingHours}
              data-cy="job-work-schedule-total-working-hours"
            />
            <InfoLine
              title="Daily working hours"
              value={
                <div
                  className="flex gap-10"
                  id="job-work-schedule-daily-hours"
                  data-cy="job-work-schedule-daily-hours"
                >
                  <div
                    className="flex flex-col space-y-1"
                    id="job-work-schedule-days"
                    data-cy="job-work-schedule-days"
                  >
                    {workingHours?.map((item) => (
                      <div
                        key={`${item?.day}-label`}
                        id={`job-work-schedule-day-${item?.day}`}
                        data-cy={`job-work-schedule-day-${item?.day}`}
                      >
                        {item?.day}
                      </div>
                    ))}
                  </div>

                  <div
                    className="flex flex-col space-y-1"
                    id="job-work-schedule-hours"
                    data-cy="job-work-schedule-hours"
                  >
                    {workingHours?.map((item) => (
                      <div
                        key={`${item?.day}-value`}
                        className="font-light"
                        id={`job-work-schedule-hour-${item?.day}`}
                        data-cy={`job-work-schedule-hour-${item?.day}`}
                      >
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
        <div
          id="job-work-schedule-edit-wrapper"
          data-cy="job-work-schedule-edit-wrapper"
        >
          <div
            className="flex justify-center items-center text-gray-950 text-sm font-semibold my-2"
            id="job-work-schedule-edit-header"
            data-cy="job-work-schedule-edit-header"
          >
            Work Schedule
          </div>
          <Form
            form={form}
            layout="vertical"
            onFinish={() => handleSaveChanges('workSchedule')}
            initialValues={employeeData?.employeeInformation?.addresses || {}}
            id="job-work-schedule-edit-form"
            data-cy="job-work-schedule-edit-form"
          >
            <Row
              gutter={16}
              id="job-work-schedule-edit-select-row"
              data-cy="job-work-schedule-edit-select-row"
            >
              <Col
                xs={24}
                sm={24}
                id="job-work-schedule-edit-select-col"
                data-cy="job-work-schedule-edit-select-col"
              >
                <Form.Item
                  className="font-semibold text-xs"
                  name="workScheduleId"
                  id="workScheduleId"
                  data-cy="job-work-schedule-edit-form-item"
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
                    id="job-work-schedule-edit-select"
                    data-cy="job-work-schedule-edit-select"
                  >
                    {workSchedules?.items.map((schedule) => (
                      <Option
                        key={schedule.id}
                        value={schedule.id}
                        id={`job-work-schedule-edit-option-${schedule.id}`}
                        data-cy={`job-work-schedule-edit-option-${schedule.id}`}
                      >
                        {schedule.name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>
            <Row
              gutter={16}
              id="job-work-schedule-edit-table-row"
              data-cy="job-work-schedule-edit-table-row"
            >
              <Col
                xs={24}
                sm={24}
                id="job-work-schedule-edit-table-col"
                data-cy="job-work-schedule-edit-table-col"
              >
                <Table
                  columns={workScheduleColumns}
                  dataSource={data}
                  pagination={false}
                  id="job-work-schedule-edit-table"
                  data-cy="job-work-schedule-edit-table"
                />
              </Col>
            </Row>
            <Row
              className="mt-6"
              id="job-work-schedule-edit-submit-row"
              data-cy="job-work-schedule-edit-submit-row"
            >
              <Col
                span={24}
                style={{ textAlign: 'right' }}
                id="job-work-schedule-edit-submit-col"
                data-cy="job-work-schedule-edit-submit-col"
              >
                <Button
                  type="primary"
                  htmlType="submit"
                  id="job-work-schedule-edit-submit-btn"
                  data-cy="job-work-schedule-edit-submit-btn"
                >
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
