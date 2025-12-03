import React, { FC } from 'react';
import { Col, DatePicker, Form, Row, Select, Dropdown, Menu } from 'antd';
import { attendanceRecordTypeOption } from '@/types/timesheet/attendance';
import { DATE_FORMAT } from '@/utils/constants';
import { CommonObject } from '@/types/commons/commonObject';
import { MdKeyboardArrowDown } from 'react-icons/md';
import { useMediaQuery } from 'react-responsive';
import { useGetAllUsers } from '@/store/server/features/employees/employeeManagment/queries';
import { useGetBreakTypes } from '@/store/server/features/timesheet/breakType/queries';
import { LuSettings2 } from 'react-icons/lu';
import { useEmployeeAttendanceStore } from '@/store/uistate/features/timesheet/employeeAtendance';

interface TableFilterProps {
  onChange: (val: CommonObject) => void;
}

const TableFilter: FC<TableFilterProps> = ({ onChange }) => {
  const [form] = Form.useForm();
  const isSmallScreen = useMediaQuery({ maxWidth: 768 });
  const { data: employeeData } = useGetAllUsers();
  const { data: breakTypeData } = useGetBreakTypes();
  const { isShowMobileFilters, setIsShowMobileFilters } =
    useEmployeeAttendanceStore();

  const employeeOptions =
    employeeData?.items?.map((employee: any) => ({
      value: employee.id,
      label: `${employee?.firstName} ${employee?.middleName} ${employee?.lastName}`,
    })) || [];

  const breakTypeOptions =
    breakTypeData?.items?.map((breakType: any) => ({
      value: breakType.id,
      label: breakType.title,
    })) || [];

  const MobileFilters = () => (
    <Menu
      className="p-4 w-[280px]"
      id="time-attendance-employee-attendance-mobile-filter-menu"
      data-cy="time-attendance-employee-attendance-mobile-filter-menu"
    >
      <div id="time-attendance-employee-attendance-mobile-filter-employee-select-div" data-cy="time-attendance-employee-attendance-mobile-filter-employee-select-div" className="mb-4">
        <p id="time-attendance-employee-attendance-mobile-filter-employee-select-label" data-cy="time-attendance-employee-attendance-mobile-filter-employee-select-label" className="text-sm text-gray-600 mb-2">Employee</p>
        <Form.Item data-cy="time-attendance-employee-attendance-mobile-filter-employee-select-form-item" name="employeeId" className="mb-0">
          <Select
            id="time-attendance-employee-attendance-mobile-filter-employee-select"
            data-cy="time-attendance-employee-attendance-mobile-filter-employee-select"
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
      <div id="time-attendance-employee-attendance-mobile-filter-status-select-div" data-cy="time-attendance-employee-attendance-mobile-filter-status-select-div" className="mb-4">
        <p id="time-attendance-employee-attendance-mobile-filter-status-select-label" data-cy="time-attendance-employee-attendance-mobile-filter-status-select-label" className="text-sm text-gray-600 mb-2">Attendance Status</p>
        <Form.Item data-cy="time-attendance-employee-attendance-mobile-filter-status-select-form-item" name="type" className="mb-0">
          <Select
            placeholder="Select Attendance Status"
            allowClear
            className="w-full"
            options={attendanceRecordTypeOption}
            onChange={(value) => {
              form.setFieldsValue({ type: value });
              onChange(form.getFieldsValue());
            }}
            value={form.getFieldValue('type')}
            id="time-attendance-employee-attendance-mobile-filter-status-select"
            data-cy="time-attendance-employee-attendance-mobile-filter-status-select"
          />
        </Form.Item>
      </div>
      <div>
        <p className="text-sm text-gray-600 mb-2">Break Type</p>
        <Form.Item data-cy="time-attendance-employee-attendance-mobile-filter-break-type-select-form-item" name="breakTypeId" className="mb-0">
          <Select
            placeholder="Select Break Type"
            allowClear
            className="w-full"
            options={breakTypeOptions}
            onChange={(value) => {
              form.setFieldsValue({ breakTypeId: value });
              onChange(form.getFieldsValue());
            }}
            value={form.getFieldValue('breakTypeId')}
            id="time-attendance-employee-attendance-mobile-filter-break-type-select"
            data-cy="time-attendance-employee-attendance-mobile-filter-break-type-select"
          />
        </Form.Item>
      </div>
    </Menu>
  );

  return (
    <Form
      form={form}
      onFieldsChange={() => onChange(form.getFieldsValue())}
      id="time-attendance-employee-attendance-filter-form"
      data-cy="time-attendance-employee-attendance-filter-form"
    >
      {isSmallScreen ? (
        <div id="time-attendance-employee-attendance-mobile-filter-div" data-cy="time-attendance-employee-attendance-mobile-filter-div" className="space-y-4">
          <div id="time-attendance-employee-attendance-mobile-filter-date-range-div" data-cy="time-attendance-employee-attendance-mobile-filter-date-range-div" className="flex items-center gap-2">
            <Form.Item data-cy="time-attendance-employee-attendance-mobile-filter-date-range-form-item" name="date" className="flex-1 mb-0">
              <DatePicker.RangePicker
                className="w-full h-[42px]"
                separator="-"
                format={DATE_FORMAT}
                id="time-attendance-employee-attendance-mobile-filter-date-range"
                data-cy="time-attendance-employee-attendance-mobile-filter-date-range"
              />
            </Form.Item>
            <Dropdown
              overlay={<MobileFilters />}
              trigger={['click']}
              onOpenChange={setIsShowMobileFilters}
              data-cy="time-attendance-employee-attendance-mobile-filter-dropdown"
            >
              <button
                className={`w-10 h-10 rounded-lg flex items-center justify-center border ${
                  isShowMobileFilters
                    ? 'bg-blue-50 border-blue-500'
                    : 'border-gray-300'
                }`}
                id="time-attendance-employee-attendance-mobile-filter-toggle-button"
                data-cy="time-attendance-employee-attendance-mobile-filter-toggle-button"
              >
                <LuSettings2 data-cy="time-attendance-employee-attendance-mobile-filter-toggle-button-icon" />
              </button>
            </Dropdown>
          </div>
        </div>
      ) : (
        <Row id="time-attendance-employee-attendance-desktop-filter-row" data-cy="time-attendance-employee-attendance-desktop-filter-row" gutter={[16, 16]} className="items-center">
          <Col id="time-attendance-employee-attendance-desktop-filter-date-range-col" data-cy="time-attendance-employee-attendance-desktop-filter-date-range-col" flex="360px">
            <Form.Item data-cy="time-attendance-employee-attendance-desktop-filter-date-range-form-item" name="date" className="mb-0">
              <DatePicker.RangePicker
                className="w-full h-[42px]"
                separator="-"
                format={DATE_FORMAT}
                id="time-attendance-employee-attendance-filter-date-range"
                data-cy="time-attendance-employee-attendance-filter-date-range"
              />
            </Form.Item>
          </Col>
          <Col id="time-attendance-employee-attendance-desktop-filter-employee-select-col" data-cy="time-attendance-employee-attendance-desktop-filter-employee-select-col" flex="1">
            <Form.Item data-cy="time-attendance-employee-attendance-desktop-filter-employee-select-form-item" name="employeeId" className="mb-0">
              <Select
                id="time-attendance-employee-attendance-desktop-filter-employee-select"
                data-cy="time-attendance-employee-attendance-desktop-filter-employee-select"
                placeholder="Select Employee"
                allowClear
                className="w-full h-[42px]"
                suffixIcon={
                  <MdKeyboardArrowDown data-cy="time-attendance-employee-attendance-desktop-filter-employee-select-suffix-icon" size={16} className="text-gray-900" />
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
          <Col  id="time-attendance-employee-attendance-desktop-filter-status-select-col" data-cy="time-attendance-employee-attendance-desktop-filter-status-select-col" flex="200px">
            <Form.Item data-cy="time-attendance-employee-attendance-desktop-filter-status-select-form-item" name="type" className="mb-0">
              <Select
                id="time-attendance-employee-attendance-desktop-filter-status-select"
                data-cy="time-attendance-employee-attendance-desktop-filter-status-select"
                placeholder="Attendance Status"
                allowClear
                className="w-full h-[42px]"
                suffixIcon={
                  <MdKeyboardArrowDown data-cy="time-attendance-employee-attendance-desktop-filter-status-select-suffix-icon" size={16} className="text-gray-900" />
                }
                options={attendanceRecordTypeOption}
              />
            </Form.Item>
          </Col>
          <Col id="time-attendance-employee-attendance-desktop-filter-break-type-select-col" data-cy="time-attendance-employee-attendance-desktop-filter-break-type-select-col" flex="200px">
            <Form.Item name="breakTypeId" className="mb-0">
              <Select
                placeholder="Break Type"
                allowClear
                className="w-full h-[42px]"
                suffixIcon={
                  <MdKeyboardArrowDown data-cy="time-attendance-employee-attendance-desktop-filter-break-type-select-suffix-icon" size={16} className="text-gray-900" />
                }
                options={breakTypeOptions}
                id="time-attendance-employee-attendance-filter-break-type-select"
                data-cy="time-attendance-employee-attendance-filter-break-type-select"
              />
            </Form.Item>
          </Col>
        </Row>
      )}
    </Form>
  );
};

export default TableFilter;
