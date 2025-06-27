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
import { useGetAllUsers } from '@/store/server/features/employees/employeeManagment/queries';
import { LuSettings2 } from 'react-icons/lu';
import { useEmployeeAttendanceStore } from '@/store/uistate/features/timesheet/employeeAtendance';

interface TableFilterProps {
  onChange: (val: CommonObject) => void;
}

const TableFilter: FC<TableFilterProps> = ({ onChange }) => {
  const [form] = Form.useForm();
  const isSmallScreen = useMediaQuery({ maxWidth: 768 });
  const { data: employeeData } = useGetAllUsers();
  const { isShowMobileFilters, setIsShowMobileFilters } =
    useEmployeeAttendanceStore();



  const employeeOptions =
    employeeData?.items?.map((employee: any) => ({
      value: employee.id,
      label: `${employee?.firstName} ${employee?.middleName} ${employee?.lastName}`,
    })) || [];

  const MobileFilters = () => (
    <Menu className="p-4 w-[280px]">
      <div className="mb-4">
        <p className="text-sm text-gray-600 mb-2">Employee</p>
        <Form.Item name="employeeId" className="mb-0">
          <Select
            placeholder="Select Employee"
            allowClear
            className="w-full"
            options={employeeOptions}
            showSearch
            optionFilterProp="label"
            onChange={(value) => {
              form.setFieldsValue({ employeeId: value });
              onChange(form.getFieldsValue());
            }}
            filterOption={(input, option) =>
              (typeof option?.label === 'string'
                ? option.label.toLowerCase()
                : ''
              ).includes(input.toLowerCase())
            }
            value={form.getFieldValue('employeeId')}
          />
        </Form.Item>
      </div>
      <div>
        <p className="text-sm text-gray-600 mb-2">Break Type</p>
        <Form.Item name="type" className="mb-0">
          <Select
            placeholder="Select Break Type"
            allowClear
            className="w-full"
            options={attendanceRecordTypeOption}
            onChange={(value) => {
              form.setFieldsValue({ type: value });
              onChange(form.getFieldsValue());
            }}
            value={form.getFieldValue('type')}
          />
        </Form.Item>
      </div>
    </Menu>
  );

  return (
    <Form form={form} onFieldsChange={() => onChange(form.getFieldsValue())}>
      {isSmallScreen ? (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Form.Item name="date" className="flex-1 mb-0">
              <DatePicker.RangePicker
                className="w-full h-[42px]"
                separator="-"
                format={DATE_FORMAT}
              />
            </Form.Item>
            <Dropdown
              overlay={<MobileFilters />}
              trigger={['click']}
              onOpenChange={setIsShowMobileFilters}
            >
              <button
                className={`w-10 h-10 rounded-lg flex items-center justify-center border ${
                  isShowMobileFilters
                    ? 'bg-blue-50 border-blue-500'
                    : 'border-gray-300'
                }`}
              >
                <LuSettings2 />
              </button>
            </Dropdown>
          </div>
        </div>
      ) : (
        <Row gutter={[16, 16]} className="items-center">
          <Col flex="360px">
            <Form.Item name="date" className="mb-0">
              <DatePicker.RangePicker
                className="w-full h-[42px]"
                separator="-"
                format={DATE_FORMAT}
              />
            </Form.Item>
          </Col>
          <Col flex="1">
            <Form.Item name="employeeId" className="mb-0">
              <Select
                placeholder="Select Employee"
                allowClear
                className="w-full h-[42px]"
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
          <Col flex="200px">
            <Form.Item name="type" className="mb-0">
              <Select
                placeholder="Break Type"
                allowClear
                className="w-full h-[42px]"
                suffixIcon={
                  <MdKeyboardArrowDown size={16} className="text-gray-900" />
                }
                options={attendanceRecordTypeOption}
              />
            </Form.Item>
          </Col>
        </Row>
      )}
    </Form>
  );
};

export default TableFilter;
