import { useGetWorkSchedules } from '@/store/server/features/employees/employeeManagment/workSchedule/queries';
import { useEmployeeManagementStore } from '@/store/uistate/features/employees/employeeManagment';
import { Col, Form, Row, Select } from 'antd';

import React from 'react';

const { Option } = Select;

interface WorkScheduleFormProps {
  selectedWorkScheduleDetails?: any[];
  form?: any;
}

const WorkScheduleForm: React.FC<WorkScheduleFormProps> = ({ form }) => {
  const { data: workSchedules } = useGetWorkSchedules();
  const { setSelectedWorkSchedule, workSchedule, setWorkSchedule } =
    useEmployeeManagementStore();

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
    </div>
  );
};

export default WorkScheduleForm;
