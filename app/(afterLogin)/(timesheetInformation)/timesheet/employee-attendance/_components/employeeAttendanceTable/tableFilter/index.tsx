import React, { FC } from 'react';
import { Col, DatePicker, Form, Row, Select, Dropdown, Menu } from 'antd';
import {
  AttendanceRecordType,
  attendanceRecordTypeOption,
} from '@/types/timesheet/attendance';
import { DATE_FORMAT } from '@/utils/constants';
import { CommonObject } from '@/types/commons/commonObject';
import { MdKeyboardArrowDown } from 'react-icons/md';
import { useMediaQuery } from 'react-responsive';
import { IoMdSwitch } from 'react-icons/io';
import { useGetAllUsers } from '@/store/server/features/employees/employeeManagment/queries';

interface TableFilterProps {
  onChange: (val: CommonObject) => void;
}

const TableFilter: FC<TableFilterProps> = ({ onChange }) => {
  const [form] = Form.useForm();
  const isSmallScreen = useMediaQuery({ maxWidth: 768 });
  const { data: employeeData } = useGetAllUsers();

  const handleMenuClick = (value: AttendanceRecordType) => {
    form.setFieldsValue({ type: value });
    onChange(form.getFieldsValue());
  };

  const employeeOptions =
    employeeData?.items?.map((employee: any) => ({
      value: employee.id,
      label: `${employee?.firstName} ${employee?.middleName} ${employee?.lastName}`,
    })) || [];

  // const options =
  //   employeeData?.items?.map((emp: any) => ({
  //     value: emp.id,
  //     label: `${emp?.firstName || ''} ${emp?.middleName} ${emp?.lastName}`, // Full name as label
  //     employeeData: emp,
  //   })) || [];

  return (
    <Form form={form} onFieldsChange={() => onChange(form.getFieldsValue())}>
      <Row
        gutter={[20, 10]}
        align="middle"
        className="flex-nowrap overflow-x-auto"
      >
        <Col xs="auto" sm={12} md={12} lg={14} className="flex-1">
          <Form.Item id="date" name="date">
            <DatePicker.RangePicker
              className="w-full h-[50px]"
              separator="-"
              format={DATE_FORMAT}
            />
          </Form.Item>
        </Col>
        {!isSmallScreen ? <Col xs={0} sm={3} md={4} lg={5}></Col> : ''}
        <Col xs="auto" sm={16} md={8} lg={6}>
          <Form.Item name="employeeId">
            <Select
              mode="multiple"
              placeholder="Select Employee"
              allowClear
              className="w-full h-[50px]"
              suffixIcon={
                <MdKeyboardArrowDown size={16} className="text-gray-900" />
              }
              options={employeeOptions}
              showSearch
              optionFilterProp="label"
              filterOption={(input, option) =>
                (typeof option?.label === 'string'
                  ? option.label.toLowerCase()
                  : ''
                ).includes(input.toLowerCase())
              }
            />
          </Form.Item>
        </Col>

        <Col xs={24} sm={12} md={8} lg={8}>
          <Form.Item name="type">
            {isSmallScreen ? (
              <Dropdown
                overlay={
                  <Menu>
                    {attendanceRecordTypeOption.map((option) => (
                      <Menu.Item
                        key={option.value}
                        onClick={() => handleMenuClick(option.value)}
                      >
                        {option.label}
                      </Menu.Item>
                    ))}
                  </Menu>
                }
                trigger={['click']}
              >
                <button className="w-[50px] h-[50px] flex items-center justify-center border border-gray-300 rounded">
                  <IoMdSwitch size={24} className="text-gray-900" />
                </button>
              </Dropdown>
            ) : (
              <Select
                placeholder="Select Status"
                allowClear
                id="selectedStatusId"
                className="w-full h-[50px]"
                suffixIcon={
                  <MdKeyboardArrowDown size={16} className="text-gray-900" />
                }
                options={attendanceRecordTypeOption}
                onChange={(value) => {
                  form.setFieldsValue({ type: value });
                  onChange(form.getFieldsValue());
                }}
              />
            )}
          </Form.Item>
        </Col>
      </Row>
    </Form>
  );
};

export default TableFilter;
