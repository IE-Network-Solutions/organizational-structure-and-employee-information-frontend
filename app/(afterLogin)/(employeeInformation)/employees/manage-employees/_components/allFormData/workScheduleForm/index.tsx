import { useGetWorkSchedules } from '@/store/server/features/employees/employeeManagment/workSchedule/queries';
import { useEmployeeManagementStore } from '@/store/uistate/features/employees/employeeManagment';
import { Col, Form, Row, Select } from 'antd';
import React from 'react';
import { useGetBlueprints } from '@/store/server/features/timesheet/workSchedule/queries';
import { formatTimeRange } from '@/store/server/features/timesheet/workSchedule/helpers';

const { Option } = Select;

interface WorkScheduleFormProps {
  selectedWorkScheduleDetails?: any[];
  form?: any;
}

const EMPTY_SHIFT_SCHEDULES: NonNullable<
  ReturnType<typeof useGetBlueprints>['data']
> = [];

const WorkScheduleForm: React.FC<WorkScheduleFormProps> = ({ form }) => {
  const { data: workSchedules } = useGetWorkSchedules();
  const { data: shiftSchedulesData } = useGetBlueprints();
  const shiftSchedules = shiftSchedulesData ?? EMPTY_SHIFT_SCHEDULES;
  const { setSelectedWorkSchedule, workSchedule, setWorkSchedule } =
    useEmployeeManagementStore();
  const selectedShiftScheduleId = Form.useWatch('shiftScheduleId', form);
  const selectedShiftSchedule = shiftSchedules.find(
    (item) => item.id === selectedShiftScheduleId,
  );

  const workscheduleChangeHandler = (value: string) => {
    const selectedValue = workSchedules?.items.find(
      (schedule) => schedule.id === value,
    );
    setSelectedWorkSchedule(selectedValue || null);
    setWorkSchedule(value);
  };

  React.useEffect(() => {
    if (form && workSchedule) {
      form.setFieldsValue({ workScheduleId: workSchedule });
    }
  }, [workSchedule, form]);

  return (
    <div id="work-schedule-form" data-cy="work-schedule-form">
      <Row
        gutter={16}
        id="work-schedule-select-row"
        data-cy="work-schedule-select-row"
      >
        <Col
          xs={24}
          sm={24}
          id="work-schedule-select-col"
          data-cy="work-schedule-select-col"
        >
          <Form.Item
            className="font-normal text-base"
            name="workScheduleId"
            id="workScheduleId"
            data-cy="workScheduleId"
            label={
              <span
                className="mb-1 font-normal text-sm text-[#030712]"
                data-cy="work-schedule-form-category-label"
              >
                Work Schedule Category{' '}
                <span
                  style={{ color: 'red' }}
                  data-cy={`work-schedule-form-category-required`}
                >
                  *
                </span>
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
        <Col xs={24} sm={24}>
          <Form.Item
            className="font-normal text-base"
            name="shiftScheduleId"
            label={
              <span
                className="mb-1 font-normal text-sm text-[#030712]"
                data-cy="work-schedule-form-shift-schedule-label"
              >
                Shift Schedule
              </span>
            }
          >
            <Select
              placeholder="Select shift schedule (optional)"
              allowClear
              className="bg-white"
              onChange={(value: string | undefined) => {
                const schedule = shiftSchedules.find(
                  (item) => item.id === value,
                );
                form?.setFieldsValue({
                  assignedShiftIds: schedule?.hasShifts
                    ? (schedule.shifts || []).map((shift) => shift.id)
                    : [],
                });
              }}
              options={shiftSchedules.map((schedule) => ({
                value: schedule.id,
                label: schedule.title,
              }))}
              data-cy="work-schedule-form-shift-schedule"
            />
          </Form.Item>
        </Col>
        {selectedShiftSchedule?.hasShifts && (
          <Col xs={24} sm={24}>
            <Form.Item
              className="font-normal text-base"
              name="assignedShiftIds"
              label={
                <span
                  className="mb-1 font-normal text-sm text-[#030712]"
                  data-cy="work-schedule-form-shifts-label"
                >
                  Shifts{' '}
                  <span
                    style={{ color: 'red' }}
                    data-cy="work-schedule-form-shifts-required"
                  >
                    *
                  </span>
                </span>
              }
              rules={[
                {
                  required: true,
                  message: 'Select at least one shift',
                },
              ]}
            >
              <Select
                mode="multiple"
                placeholder="Select shifts"
                className="bg-white"
                options={(selectedShiftSchedule.shifts || []).map((shift) => ({
                  value: shift.id,
                  label: `${shift.name} · ${formatTimeRange(
                    shift.startTime,
                    shift.endTime,
                  )}`,
                }))}
                data-cy="work-schedule-form-shifts"
              />
            </Form.Item>
          </Col>
        )}
      </Row>
    </div>
  );
};

export default WorkScheduleForm;
