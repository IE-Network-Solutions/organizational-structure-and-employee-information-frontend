import { Col, DatePicker, Form, Row, Select } from 'antd';
import { useLeaveManagementStore } from '@/store/uistate/features/timesheet/leaveManagement';
import { CommonObject } from '@/types/commons/commonObject';
import React, { FC } from 'react';
import { DATE_FORMAT } from '@/utils/constants';
import { formatToOptions } from '@/helpers/formatTo';
import { LeaveRequestStatusOption } from '@/types/timesheet/settings';
import { MdKeyboardArrowDown } from 'react-icons/md';
import { useGetAllUsers } from '@/store/server/features/employees/employeeManagment/queries';

interface LeaveManagementTableFilterProps {
  onChange: (val: CommonObject) => void;
}

const LeaveManagementTableFilter: FC<LeaveManagementTableFilterProps> = ({
  onChange,
}) => {
  const { leaveTypes } = useLeaveManagementStore();
  const [form] = Form.useForm();
  const { data: users } = useGetAllUsers();

  const filterClass = 'w-full h-[54px]';

  return (
    <Form
      form={form}
      onFieldsChange={() => {
        onChange(form.getFieldsValue());
      }}
    >
      <Row gutter={16}>
        <Col span={6}>
          <Form.Item id="dateRangeToFilterId" name="dateRange">
            <DatePicker.RangePicker
              className={filterClass}
              separator={'-'}
              format={DATE_FORMAT}
            />
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item id="filterByLeaveTypeId" name="type">
            <Select
              className="w-full h-[54px]"
              placeholder="Select Type"
              allowClear={true}
              suffixIcon={
                <MdKeyboardArrowDown size={16} className="text-gray-900" />
              }
              options={formatToOptions(leaveTypes ?? [], 'title', 'id')}
            />
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item id="filterByLeaveRequestStatusId" name="status">
            <Select
              className="w-full h-[54px]"
              placeholder="Select Status"
              allowClear={true}
              suffixIcon={
                <MdKeyboardArrowDown size={16} className="text-gray-900" />
              }
              options={LeaveRequestStatusOption}
            />
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item id="filterByLeaveRequestUserIds" name="userIds">
            <Select
              showSearch
              placeholder="Select a person"
              className="w-full h-[54px]"
              allowClear
              optionFilterProp="label"
              // onChange={onChange}
              options={users?.items?.map((list: any) => ({
                value: list?.id,
                label: `${list?.firstName ? list?.firstName : ''} ${list?.middleName ? list?.middleName : ''} ${list?.lastName ? list?.lastName : ''}`,
              }))}
            />
          </Form.Item>
        </Col>
      </Row>
    </Form>
  );
};

export default LeaveManagementTableFilter;
