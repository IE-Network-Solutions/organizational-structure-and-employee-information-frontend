import React, { FC, useCallback, useMemo, useState } from 'react';
import {
  Col,
  DatePicker,
  Form,
  Row,
  Select,
  Dropdown,
  Button,
} from 'antd';
import type { FormInstance } from 'antd/es/form';
import { CloseOutlined, SearchOutlined } from '@ant-design/icons';
import { AttendanceActionType } from '@/types/timesheet/attendance';
import { DATE_FORMAT } from '@/utils/constants';
import { Dayjs } from 'dayjs';
import { CommonObject } from '@/types/commons/commonObject';
import { useGetAllUsers } from '@/store/server/features/employees/employeeManagment/queries';
import { useEmployeeAttendanceStore } from '@/store/uistate/features/timesheet/employeeAtendance';
import FilterAltOutlinedIcon from '@mui/icons-material/FilterAltOutlined';
import { useGetAttendanceRuleTypes } from '@/store/server/features/timesheet/attendanceNotificationRule/queries';

interface TableFilterProps {
  onChange: (val: CommonObject) => void;
}

interface SelectOption {
  value: string;
  label: string;
}

interface RuleViolationFilterPanelProps {
  form: FormInstance;
  onChange: (val: CommonObject) => void;
  onClose: () => void;
  onReset: () => void;
  getFilterValues: () => CommonObject;
  ruleTypeOptions: SelectOption[];
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
  {
    label: 'VP Deduction',
    value: AttendanceActionType.VP_DEDUCTION,
  },
] as const;

const labelClassName = 'text-sm font-medium text-gray-800 mb-2 block';
const selectClassName = 'w-full h-10 rounded-md border-gray-300';

function isDatePickerPopupOpen(): boolean {
  if (typeof document === 'undefined') return false;
  return Boolean(
    document.querySelector(
      '.ant-picker-dropdown:not(.ant-picker-dropdown-hidden)',
    ),
  );
}

/** Stable module-level panel — avoids remount on every TableFilter render. */
const RuleViolationFilterPanel: FC<RuleViolationFilterPanelProps> = ({
  form,
  onChange,
  onClose,
  onReset,
  getFilterValues,
  ruleTypeOptions,
}) => {
  const applyFilters = useCallback(() => {
    onChange(getFilterValues());
  }, [getFilterValues, onChange]);

  const handleDateChange = useCallback(
    (field: 'startDate' | 'endDate', value: Dayjs | null) => {
      form.setFieldsValue({ [field]: value });
      onChange(getFilterValues());
    },
    [form, getFilterValues, onChange],
  );

  return (
    <div
      className="bg-white rounded-lg border border-gray-200 min-w-[320px] sm:max-w-[420px] overflow-hidden"
      id="time-attendance-rule-violation-mobile-filter-menu"
      data-cy="time-attendance-rule-violation-mobile-filter-menu"
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
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
          onClick={onClose}
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
                  options={ruleTypeOptions}
                  getPopupContainer={(trigger) =>
                    trigger.parentElement ?? document.body
                  }
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
                  getPopupContainer={(trigger) =>
                    trigger.parentElement ?? document.body
                  }
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
                        value.isBefore(getFieldValue('endDate')) ||
                        value.isSame(getFieldValue('endDate'), 'day')
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
                  getPopupContainer={() => document.body}
                  onChange={(value) => handleDateChange('startDate', value)}
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
                        value.isAfter(getFieldValue('startDate')) ||
                        value.isSame(getFieldValue('startDate'), 'day')
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
                  getPopupContainer={() => document.body}
                  onChange={(value) => handleDateChange('endDate', value)}
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
          onClick={onReset}
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
            onClose();
          }}
          data-cy="time-attendance-rule-violation-mobile-filter-save"
        >
          Save Filter
        </Button>
      </div>
    </div>
  );
};

const TableFilter: FC<TableFilterProps> = ({ onChange }) => {
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState('');
  const { data: employeeData } = useGetAllUsers();
  const { showViolationFilter, setShowViolationFilter } =
    useEmployeeAttendanceStore();
  const { data: attendanceRuleTypesData } = useGetAttendanceRuleTypes();

  const employeeOptions = useMemo(
    () =>
      employeeData?.items?.map((employee: any) => ({
        value: employee.id,
        label: `${employee?.firstName} ${employee?.middleName} ${employee?.lastName}`,
      })) || [],
    [employeeData?.items],
  );

  const ruleTypeOptions = useMemo(
    () =>
      attendanceRuleTypesData?.items?.map((item) => ({
        label: item.name,
        value: item.id,
      })) || [],
    [attendanceRuleTypesData?.items],
  );

  const getFilterValues = useCallback(
    (): CommonObject => ({
      ...form.getFieldsValue(),
      search: searchText.trim() || undefined,
    }),
    [form, searchText],
  );

  const handleReset = useCallback(() => {
    form.resetFields();
    setSearchText('');
    onChange({});
  }, [form, onChange]);

  const handleCloseFilters = useCallback(() => {
    setShowViolationFilter(false);
  }, [setShowViolationFilter]);

  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (!open && isDatePickerPopupOpen()) {
        return;
      }
      setShowViolationFilter(open);
    },
    [setShowViolationFilter],
  );

  const filterDropdown = useCallback(
    () => (
      <RuleViolationFilterPanel
        form={form}
        onChange={onChange}
        onClose={handleCloseFilters}
        onReset={handleReset}
        getFilterValues={getFilterValues}
        ruleTypeOptions={ruleTypeOptions}
      />
    ),
    [
      form,
      onChange,
      handleCloseFilters,
      handleReset,
      getFilterValues,
      ruleTypeOptions,
    ],
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
                onChange={() => onChange(getFilterValues())}
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
          dropdownRender={filterDropdown}
          trigger={['click']}
          open={showViolationFilter}
          onOpenChange={handleOpenChange}
          destroyPopupOnHide={false}
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
