import React, { FC, useState } from 'react';
import { Col, DatePicker, Form, Row, Select, Dropdown, Button } from 'antd';
import { CloseOutlined, SearchOutlined } from '@ant-design/icons';
import { AttendanceActionType } from '@/types/timesheet/attendance';
import { DATE_FORMAT } from '@/utils/constants';
import { CommonObject } from '@/types/commons/commonObject';
import { useGetAllUsers } from '@/store/server/features/employees/employeeManagment/queries';
import { useEmployeeAttendanceStore } from '@/store/uistate/features/timesheet/employeeAtendance';
import FilterAltOutlinedIcon from '@mui/icons-material/FilterAltOutlined';
import { useGetAttendanceRuleTypes } from '@/store/server/features/timesheet/attendanceNotificationRule/queries';

interface TableFilterProps {
  onChange: (val: CommonObject) => void;
}

const ACTION_TYPE_OPTIONS = [
  {
    label: 'Warning Letter',
    value: AttendanceActionType.WARNING_LETTER,
  },
  {
    label: 'Reprimand',
    value: AttendanceActionType.REPRIMAND,
  },
  {
    label: 'Salary Deduction',
    value: AttendanceActionType.SALARY_DEDUCTION,
  },
] as const;

const TableFilter: FC<TableFilterProps> = ({ onChange }) => {
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState('');
  const { data: employeeData } = useGetAllUsers();
  const { showViolationFilter, setShowViolationFilter } =
    useEmployeeAttendanceStore();
  const { data: attendanceRuleTypesData } = useGetAttendanceRuleTypes();

  const employeeOptions =
    employeeData?.items?.map((employee: any) => ({
      value: employee.id,
      label: `${employee?.firstName} ${employee?.middleName} ${employee?.lastName}`,
    })) || [];

  const labelClassName = 'text-sm font-medium text-gray-800 mb-2 block';
  const selectClassName = 'w-full h-10 rounded-md border-gray-300';

  const getFilterValues = (): CommonObject => ({
    ...form.getFieldsValue(),
    search: searchText.trim() || undefined,
  });

  const applyFilters = () => {
    onChange(getFilterValues());
  };

  const MobileFilters = () => (
    <div
      className="bg-white rounded-lg border border-gray-200 min-w-[320px] sm:max-w-[420px] overflow-hidden"
      id="time-attendance-rule-violation-mobile-filter-menu"
      data-cy="time-attendance-rule-violation-mobile-filter-menu"
    >
      <div
        className="px-6 pt-5 pb-1 relative"
        id="time-attendance-rule-violation-mobile-filter-header"
        data-cy="time-attendance-rule-violation-mobile-filter-header"
      >
        <button
          id="time-attendance-rule-violation-mobile-filter-close-button"
          data-cy="time-attendance-rule-violation-mobile-filter-close-button"
          type="button"
          onClick={() => setShowViolationFilter(false)}
          className="absolute top-5 right-6 p-1 text-gray-500 hover:text-gray-700 rounded transition-colors"
          aria-label="Close filter"
        >
          <CloseOutlined
            className="text-base"
            data-cy="time-attendance-rule-violation-mobile-filter-close-button-icon"
          />
        </button>
        <h3
          id="time-attendance-rule-violation-mobile-filter-title"
          data-cy="time-attendance-rule-violation-mobile-filter-title"
          className="text-xl font-semibold text-gray-900 pr-8"
        >
          Filter
        </h3>
        <p
          id="time-attendance-rule-violation-mobile-filter-description"
          data-cy="time-attendance-rule-violation-mobile-filter-description"
          className="text-sm text-gray-500 mt-1"
        >
          Select all filters that apply
        </p>
      </div>

      <div
        id="time-attendance-rule-violation-mobile-filter-fields"
        data-cy="time-attendance-rule-violation-mobile-filter-fields"
        className="px-6 py-4"
      >
        <Row gutter={16} className="mt-4">
          <Col lg={12} md={12} sm={24} xs={24}>
            <div
              data-cy="time-attendance-rule-violation-mobile-filter-rule-select-div"
              className="mb-4"
            >
              <label
                data-cy="time-attendance-rule-violation-mobile-filter-rule-select-label"
                className={labelClassName}
              >
                Rule
              </label>
              <Form.Item name="ruleTypeId" className="mb-0">
                <Select
                  placeholder="Select Rule"
                  allowClear
                  className={selectClassName}
                  options={attendanceRuleTypesData?.items?.map((item) => ({
                    label: item.name,
                    value: item.id,
                  }))}
                  onChange={() => applyFilters()}
                  id="time-attendance-rule-violation-mobile-filter-rule-select"
                  data-cy="time-attendance-rule-violation-mobile-filter-rule-select"
                />
              </Form.Item>
            </div>
          </Col>
          <Col lg={12} md={12} sm={24} xs={24}>
            <div
              data-cy="time-attendance-rule-violation-mobile-filter-actions-select-div"
              className="mb-4"
            >
              <label
                data-cy="time-attendance-rule-violation-mobile-filter-actions-select-label"
                className={labelClassName}
              >
                Actions
              </label>
              <Form.Item name="actionType" className="mb-0">
                <Select
                  placeholder="Select Actions"
                  allowClear
                  className={selectClassName}
                  options={ACTION_TYPE_OPTIONS as any}
                  onChange={() => applyFilters()}
                  id="time-attendance-rule-violation-mobile-filter-action-select"
                  data-cy="time-attendance-rule-violation-mobile-filter-action-select"
                />
              </Form.Item>
            </div>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col lg={12} md={12} sm={24} xs={24}>
            <div
              data-cy="time-attendance-rule-violation-mobile-filter-start-date-select-div"
              className="mb-4"
            >
              <label
                data-cy="time-attendance-rule-violation-mobile-filter-start-date-select-label"
                className={labelClassName}
              >
                Date From
              </label>
              <Form.Item
                name="startDate"
                rules={[
                  ({ getFieldValue }) => ({
                    validator(notUsed, value) {
                      if (
                        !value ||
                        !getFieldValue('endDate') ||
                        value.isBefore(getFieldValue('endDate'))
                      ) {
                        return Promise.resolve();
                      }
                      return Promise.reject(
                        'Start date must be before end date',
                      );
                    },
                  }),
                ]}
              >
                <DatePicker
                  className="w-full h-[40px]"
                  placeholder="Select Date"
                  format={DATE_FORMAT}
                  onChange={() => applyFilters()}
                  id="time-attendance-rule-violation-mobile-filter-start-date-picker"
                  data-cy="time-attendance-rule-violation-mobile-filter-start-date-picker"
                />
              </Form.Item>
            </div>
          </Col>
          <Col lg={12} md={12} sm={24} xs={24}>
            <div
              data-cy="time-attendance-rule-violation-mobile-filter-end-date-select-div"
              className="mb-4"
            >
              <label
                data-cy="time-attendance-rule-violation-mobile-filter-end-date-select-label"
                className={labelClassName}
              >
                Date To
              </label>
              <Form.Item
                name="endDate"
                rules={[
                  ({ getFieldValue }) => ({
                    validator(notUsed, value) {
                      if (
                        !value ||
                        !getFieldValue('startDate') ||
                        value.isAfter(getFieldValue('startDate'))
                      ) {
                        return Promise.resolve();
                      }
                      return Promise.reject(
                        'End date must be after start date',
                      );
                    },
                  }),
                ]}
              >
                <DatePicker
                  className="w-full h-[40px]"
                  placeholder="Select Date"
                  format={DATE_FORMAT}
                  onChange={() => applyFilters()}
                  id="time-attendance-rule-violation-mobile-filter-end-date-picker"
                  data-cy="time-attendance-rule-violation-mobile-filter-end-date-picker"
                />
              </Form.Item>
            </div>
          </Col>
        </Row>
      </div>

      <div
        data-cy="time-attendance-rule-violation-mobile-filter-footer"
        className="px-6 py-4 flex justify-end gap-2"
      >
        <Button
          onClick={() => {
            form.resetFields();
            setSearchText('');
            onChange({});
          }}
          className="h-8 border-[#d9d9d9] text-sm font-normal text-[#4d4d4d]"
          data-cy="time-attendance-rule-violation-mobile-filter-reset"
        >
          Reset
        </Button>
        <Button
          type="primary"
          className="h-8 font-normal text-sm text-white"
          onClick={() => {
            applyFilters();
            setShowViolationFilter(false);
          }}
          data-cy="time-attendance-rule-violation-mobile-filter-save"
        >
          Save Filter
        </Button>
      </div>
    </div>
  );

  return (
    <Form
      form={form}
      id="time-attendance-rule-violation-filter-form"
      data-cy="time-attendance-rule-violation-filter-form"
    >
      <div
        id="time-attendance-rule-violation-filter-div"
        data-cy="time-attendance-rule-violation-filter-div"
        className="flex justify-between gap-3"
      >
        <div
          id="time-attendance-rule-violation-filter-employee-select-div"
          data-cy="time-attendance-rule-violation-filter-employee-select-div"
          className="flex flex-1 gap-3 flex-wrap"
        >
          <div
            data-cy="time-attendance-rule-violation-filter-employee-select-div"
            className="w-full sm:w-1/3 min-w-[200px]"
          >
            <Form.Item name="employeeId" className="mb-0">
              <Select
                placeholder="Search Employee"
                allowClear
                className="h-8"
                options={employeeOptions}
                showSearch
                optionFilterProp="label"
                onChange={() => applyFilters()}
                filterOption={(input, option) =>
                  (typeof option?.label === 'string'
                    ? option.label.toLowerCase()
                    : ''
                  ).includes(input.toLowerCase())
                }
                id="time-attendance-rule-violation-employee-select"
                data-cy="time-attendance-rule-violation-employee-select"
                suffixIcon={
                  <div
                    data-cy="time-attendance-rule-violation-employee-select-suffix-icon-div"
                    className="text-gray-400 border-l p-2"
                  >
                    <SearchOutlined />
                  </div>
                }
              />
            </Form.Item>
          </div>
        </div>

        <Dropdown
          overlay={<MobileFilters />}
          trigger={['click']}
          open={showViolationFilter}
          onOpenChange={setShowViolationFilter}
          data-cy="time-attendance-rule-violation-filter-dropdown"
        >
          <Button
            className="h-8 rounded-md flex items-center justify-center border border-[#d9d9d9] text-base font-normal text-[#4d4d4d]"
            id="time-attendance-rule-violation-filter-toggle-button"
            data-cy="time-attendance-rule-violation-filter-toggle-button"
            icon={
              <FilterAltOutlinedIcon className="text-[#374151] text-base" />
            }
          >
            Filter
          </Button>
        </Dropdown>
      </div>
    </Form>
  );
};

export default TableFilter;
