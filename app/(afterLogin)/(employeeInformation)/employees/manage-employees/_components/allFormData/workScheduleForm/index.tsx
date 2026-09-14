import {
  useGetWorkSchedules,
  useGetWorkScheduleShifts,
} from '@/store/server/features/employees/employeeManagment/workSchedule/queries';
import { useEmployeeManagementStore } from '@/store/uistate/features/employees/employeeManagment';
import { Col, Form, Row, Select } from 'antd';

import React, { useMemo } from 'react';

const { Option } = Select;

const unwrapShiftList = (payload: unknown): any[] => {
  if (Array.isArray(payload)) return payload;
  if (!payload || typeof payload !== 'object') return [];
  const data = payload as Record<string, unknown>;
  if (Array.isArray(data.items)) return data.items;
  if (Array.isArray(data.data)) return data.data;
  if (data.data && typeof data.data === 'object') {
    const nested = data.data as Record<string, unknown>;
    if (Array.isArray(nested.items)) return nested.items;
  }
  if (Array.isArray(data.shifts)) return data.shifts;
  return [];
};

interface WorkScheduleFormProps {
  selectedWorkScheduleDetails?: any[];
  form?: any;
}

const WorkScheduleForm: React.FC<WorkScheduleFormProps> = ({ form }) => {
  const { data: workSchedules } = useGetWorkSchedules();
  const { setSelectedWorkSchedule, workSchedule, setWorkSchedule } =
    useEmployeeManagementStore();
  const { data: shiftsPayload } = useGetWorkScheduleShifts(workSchedule || '');

  const selectedSchedule = useMemo(
    () => workSchedules?.items?.find((s) => s.id === workSchedule),
    [workSchedules?.items, workSchedule],
  );

  const shiftOptions = useMemo(() => {
    const fromApi = unwrapShiftList(shiftsPayload);
    if (fromApi.length) return fromApi;
    return selectedSchedule?.shifts ?? [];
  }, [shiftsPayload, selectedSchedule]);

  const workscheduleChangeHandler = (value: string) => {
    const selectedValue = workSchedules?.items.find(
      (schedule) => schedule.id === value,
    );
    setSelectedWorkSchedule(selectedValue || null);
    setWorkSchedule(value);
    form?.setFieldsValue({
      workScheduleId: value,
      workScheduleShiftId: undefined,
    });
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
        <Col xs={24} sm={24} data-cy="work-schedule-shift-select-col">
          <Form.Item
            className="font-normal text-base"
            name="workScheduleShiftId"
            id="workScheduleShiftId"
            data-cy="workScheduleShiftId"
            label={
              <span
                className="mb-1 font-normal text-sm text-[#030712]"
                data-cy="work-schedule-form-shift-label"
              >
                Shift
              </span>
            }
            rules={[
              {
                required: shiftOptions.length > 0,
                message: 'Please select a shift!',
              },
            ]}
          >
            <Select
              placeholder={
                workSchedule
                  ? shiftOptions.length
                    ? 'Select a shift'
                    : 'No shifts on this schedule'
                  : 'Select a work schedule first'
              }
              allowClear
              disabled={!workSchedule || shiftOptions.length === 0}
              className="bg-white"
              id="work-schedule-shift-select"
              data-cy="work-schedule-shift-select"
            >
              {shiftOptions.map((shift) => (
                <Option
                  key={shift.id}
                  value={shift.id}
                  id={`work-schedule-shift-option-${shift.id}`}
                  data-cy={`work-schedule-shift-option-${shift.id}`}
                >
                  {`${shift.name} (${shift.startTime} - ${shift.endTime})`}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
      </Row>
    </div>
  );
};

export default WorkScheduleForm;
