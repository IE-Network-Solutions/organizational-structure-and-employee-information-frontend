import { useEmployeeManagementStore } from '@/store/uistate/features/employees/employeeManagment';
import { Col, Form, Row, Select } from 'antd';
import React, { useMemo } from 'react';
import { useGetBlueprints } from '@/store/server/features/timesheet/workSchedule/queries';
import { formatTimeRange } from '@/store/server/features/timesheet/workSchedule/helpers';

interface WorkScheduleFormProps {
  selectedWorkScheduleDetails?: any[];
  form?: any;
}

const EMPTY_WORK_SCHEDULES: NonNullable<
  ReturnType<typeof useGetBlueprints>['data']
> = [];

const WorkScheduleForm: React.FC<WorkScheduleFormProps> = ({ form }) => {
  const { data: workSchedulesData } = useGetBlueprints();
  const workSchedules = workSchedulesData ?? EMPTY_WORK_SCHEDULES;
  const { setWorkSchedule } = useEmployeeManagementStore();
  const selectedWorkScheduleId = Form.useWatch('workScheduleId', form);
  const selectedWorkSchedule = workSchedules.find(
    (schedule) => schedule.id === selectedWorkScheduleId,
  );
  const showShifts =
    Boolean(selectedWorkSchedule?.hasShifts) &&
    (selectedWorkSchedule?.shifts || []).length > 0;

  const shiftOptions = useMemo(
    () =>
      (selectedWorkSchedule?.shifts || []).map((shift) => ({
        value: shift.id,
        label: `${shift.name} · ${formatTimeRange(shift.startTime, shift.endTime)}`,
      })),
    [selectedWorkSchedule],
  );

  React.useEffect(() => {
    if (!form || !selectedWorkScheduleId) return;
    form.setFieldsValue({
      shiftScheduleId: selectedWorkScheduleId,
      ...(showShifts ? {} : { assignedShiftIds: [] }),
    });
  }, [form, selectedWorkScheduleId, showShifts]);

  const workscheduleChangeHandler = (value: string | undefined) => {
    setWorkSchedule(value || '');
    form?.setFieldsValue({
      workScheduleId: value,
      shiftScheduleId: value || undefined,
      assignedShiftIds: [],
    });
  };

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
              className="bg-white"
              optionFilterProp="label"
              showSearch
              id="work-schedule-select"
              data-cy="work-schedule-select"
              options={workSchedules.map((schedule) => ({
                value: schedule.id,
                label: schedule.title,
              }))}
            />
          </Form.Item>
        </Col>
        {showShifts ? (
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
                allowClear
                placeholder="Select shifts"
                className="bg-white"
                optionFilterProp="label"
                showSearch
                maxTagCount="responsive"
                options={shiftOptions}
                data-cy="work-schedule-form-shifts"
              />
            </Form.Item>
          </Col>
        ) : null}
      </Row>
    </div>
  );
};

export default WorkScheduleForm;
