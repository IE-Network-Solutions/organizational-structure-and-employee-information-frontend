import React, { FC, useCallback, useMemo, useState } from 'react';
import {
  Col,
  DatePicker,
  Form,
  Row,
  Select,
  Dropdown,
  Button,
  Tooltip,
  Modal,
} from 'antd';
import type { FormInstance } from 'antd/es/form';
import {
  CloseOutlined,
  ReloadOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import {
  AttendanceCheckInSource,
  AttendanceCheckOutSource,
  attendanceCheckInSourceLabels,
  attendanceCheckOutSourceLabels,
  attendanceRecordTypeOption,
} from '@/types/timesheet/attendance';
import { DATE_FORMAT } from '@/utils/constants';
import dayjs, { Dayjs } from 'dayjs';
import { CommonObject } from '@/types/commons/commonObject';
import { useTimesheetFilterUsers } from '@/store/server/features/employees/employeeManagment/queries';
import {
  TIMESHEET_EMPLOYMENT_STATUS_ACTIVE,
  TIMESHEET_EMPLOYMENT_STATUS_INACTIVE,
  type TimesheetEmploymentStatus,
} from '@/utils/timesheetEmploymentStatus';
import { useGetBreakTypes } from '@/store/server/features/timesheet/breakType/queries';
import { useEmployeeAttendanceStore } from '@/store/uistate/features/timesheet/employeeAtendance';
import { useCalculateAbsentAttendance } from '@/store/server/features/timesheet/attendance/mutation';
import FilterAltOutlinedIcon from '@mui/icons-material/FilterAltOutlined';
import { useIsMobile } from '@/hooks/useIsMobile';

interface TableFilterProps {
  onChange: (val: CommonObject) => void;
}

interface SelectOption {
  value: string;
  label: string;
}

interface AttendanceFilterPanelProps {
  form: FormInstance;
  onChange: (val: CommonObject) => void;
  onClose: () => void;
  onReset: () => void;
  getFilterValues: () => CommonObject;
  breakTypeOptions: SelectOption[];
  clockInMethodOptions: SelectOption[];
  clockOutMethodOptions: SelectOption[];
}

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
const AttendanceFilterPanel: FC<AttendanceFilterPanelProps> = ({
  form,
  onChange,
  onClose,
  onReset,
  getFilterValues,
  breakTypeOptions,
  clockInMethodOptions,
  clockOutMethodOptions,
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
      id="time-attendance-employee-attendance-mobile-filter-menu"
      data-cy="time-attendance-employee-attendance-mobile-filter-menu"
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    >
      <div
        className="px-6 pt-5 pb-1 relative"
        id="time-attendance-employee-attendance-mobile-filter-header"
        data-cy="time-attendance-employee-attendance-mobile-filter-header"
      >
        <button
          id="time-attendance-employee-attendance-mobile-filter-close-button"
          data-cy="time-attendance-employee-attendance-mobile-filter-close-button"
          type="button"
          onClick={onClose}
          className="absolute top-5 right-6 p-1 text-gray-500 hover:text-gray-700 rounded transition-colors"
          aria-label="Close filter"
        >
          <CloseOutlined
            className="text-base"
            data-cy="time-attendance-employee-attendance-mobile-filter-close-button-icon"
          />
        </button>
        <h3
          id="time-attendance-employee-attendance-mobile-filter-title"
          data-cy="time-attendance-employee-attendance-mobile-filter-title"
          className="text-xl font-semibold text-gray-900 pr-8"
        >
          Filter
        </h3>
        <p
          id="time-attendance-employee-attendance-mobile-filter-description"
          data-cy="time-attendance-employee-attendance-mobile-filter-description"
          className="text-sm text-gray-500 mt-1"
        >
          Select all filters that apply
        </p>
      </div>

      <div
        id="time-attendance-employee-attendance-mobile-filter-fields"
        data-cy="time-attendance-employee-attendance-mobile-filter-fields"
        className="px-6 py-4"
      >
        <Row
          gutter={16}
          id="time-attendance-employee-attendance-mobile-filter-fields-row"
          data-cy="time-attendance-employee-attendance-mobile-filter-fields-row"
        >
          <Col
            lg={24}
            md={24}
            sm={24}
            xs={24}
            id="time-attendance-employee-attendance-mobile-filter-fields-col"
            data-cy="time-attendance-employee-attendance-mobile-filter-fields-col"
          >
            <div
              id="time-attendance-employee-attendance-mobile-filter-status-select-div"
              className="mb-4"
              data-cy="time-attendance-employee-attendance-mobile-filter-status-select-div"
            >
              <label
                id="time-attendance-employee-attendance-mobile-filter-status-select-label"
                data-cy="time-attendance-employee-attendance-mobile-filter-status-select-label"
                className={labelClassName}
              >
                Attendance Status
              </label>
              <Form.Item
                data-cy="time-attendance-employee-attendance-mobile-filter-status-select-form-item"
                name="type"
                className="mb-0"
              >
                <Select
                  placeholder="Select Attendance Status"
                  allowClear
                  className={selectClassName}
                  options={attendanceRecordTypeOption}
                  size="large"
                  getPopupContainer={(trigger) =>
                    trigger.parentElement ?? document.body
                  }
                  onChange={(value) => {
                    form.setFieldsValue({ type: value });
                    applyFilters();
                  }}
                  id="time-attendance-employee-attendance-mobile-filter-status-select"
                  data-cy="time-attendance-employee-attendance-mobile-filter-status-select"
                />
              </Form.Item>
            </div>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col lg={12} md={12} sm={24} xs={24}>
            <div
              id="time-attendance-employee-attendance-mobile-filter-start-date-div"
              data-cy="time-attendance-employee-attendance-mobile-filter-start-date-div"
              className="mb-4"
            >
              <label
                id="time-attendance-employee-attendance-mobile-filter-start-date-label"
                data-cy="time-attendance-employee-attendance-mobile-filter-start-date-label"
                className={labelClassName}
              >
                Start Date
              </label>
              <Form.Item
                name="startDate"
                id="time-attendance-history-table-filter-mobile-start-date"
                data-cy="time-attendance-history-table-filter-mobile-start-date"
                rules={[
                  ({ getFieldValue }) => ({
                    /* eslint-disable @typescript-eslint/naming-convention */
                    validator(_, value) {
                      /* eslint-enable @typescript-eslint/naming-convention */
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
                  placeholder="Start Date"
                  format={DATE_FORMAT}
                  getPopupContainer={() => document.body}
                  onChange={(value) => handleDateChange('startDate', value)}
                  id="time-attendance-history-table-filter-mobile-start-date-picker"
                  data-cy="time-attendance-history-table-filter-mobile-start-date-picker"
                />
              </Form.Item>
            </div>
          </Col>
          <Col lg={12} md={12} sm={24} xs={24}>
            <div
              id="time-attendance-employee-attendance-mobile-filter-end-date-div"
              data-cy="time-attendance-employee-attendance-mobile-filter-end-date-div"
              className="mb-4"
            >
              <label
                id="time-attendance-employee-attendance-mobile-filter-end-date-label"
                data-cy="time-attendance-employee-attendance-mobile-filter-end-date-label"
                className={labelClassName}
              >
                End Date
              </label>
              <Form.Item
                name="endDate"
                id="time-attendance-history-table-filter-mobile-end-date"
                data-cy="time-attendance-history-table-filter-mobile-end-date"
                rules={[
                  ({ getFieldValue }) => ({
                    /* eslint-disable @typescript-eslint/naming-convention */
                    validator(_, value) {
                      /* eslint-enable @typescript-eslint/naming-convention */
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
                  placeholder="End Date"
                  format={DATE_FORMAT}
                  getPopupContainer={() => document.body}
                  onChange={(value) => handleDateChange('endDate', value)}
                  id="time-attendance-history-table-filter-mobile-end-date-picker"
                  data-cy="time-attendance-history-table-filter-mobile-end-date-picker"
                />
              </Form.Item>
            </div>
          </Col>
        </Row>
        <div
          data-cy="time-attendance-employee-attendance-mobile-filter-break-type-div"
          className="mt-1"
        >
          <label
            data-cy="time-attendance-employee-attendance-mobile-filter-break-type-label"
            className={labelClassName}
          >
            Break Type
          </label>
          <Form.Item
            data-cy="time-attendance-employee-attendance-mobile-filter-break-type-select-form-item"
            name="breakTypeId"
            className="mb-0"
          >
            <Select
              placeholder="Select Break Type"
              allowClear
              className={selectClassName}
              options={breakTypeOptions}
              size="large"
              getPopupContainer={(trigger) =>
                trigger.parentElement ?? document.body
              }
              onChange={(value) => {
                form.setFieldsValue({ breakTypeId: value });
                applyFilters();
              }}
              id="time-attendance-employee-attendance-mobile-filter-break-type-select"
              data-cy="time-attendance-employee-attendance-mobile-filter-break-type-select"
            />
          </Form.Item>
        </div>
        <Row gutter={16} className="mt-4">
          <Col lg={12} md={12} sm={24} xs={24}>
            <div
              id="time-attendance-employee-attendance-mobile-filter-check-in-method-select-div"
              data-cy="time-attendance-employee-attendance-mobile-filter-check-in-method-select-div"
              className="mb-4"
            >
              <label
                id="time-attendance-employee-attendance-mobile-filter-check-in-method-select-label"
                data-cy="time-attendance-employee-attendance-mobile-filter-check-in-method-select-label"
                className={labelClassName}
              >
                Clock In Method
              </label>
              <Form.Item
                name="checkInSource"
                className="mb-0"
                data-cy="time-attendance-employee-attendance-mobile-filter-check-in-method-select-form-item"
              >
                <Select
                  placeholder="Select Clock In Method"
                  allowClear
                  className={selectClassName}
                  options={clockInMethodOptions}
                  size="large"
                  getPopupContainer={(trigger) =>
                    trigger.parentElement ?? document.body
                  }
                  onChange={(value) => {
                    form.setFieldsValue({ checkInSource: value });
                    applyFilters();
                  }}
                  id="time-attendance-employee-attendance-mobile-filter-check-in-method-select"
                  data-cy="time-attendance-employee-attendance-mobile-filter-check-in-method-select"
                />
              </Form.Item>
            </div>
          </Col>
          <Col lg={12} md={12} sm={24} xs={24}>
            <div
              id="time-attendance-employee-attendance-mobile-filter-check-out-method-select-div"
              data-cy="time-attendance-employee-attendance-mobile-filter-check-out-method-select-div"
              className="mb-4"
            >
              <label
                id="time-attendance-employee-attendance-mobile-filter-check-out-method-select-label"
                data-cy="time-attendance-employee-attendance-mobile-filter-check-out-method-select-label"
                className={labelClassName}
              >
                Clock Out Method
              </label>
              <Form.Item
                name="checkOutSource"
                className="mb-0"
                data-cy="time-attendance-employee-attendance-mobile-filter-check-out-method-select-form-item"
              >
                <Select
                  placeholder="Select Clock Out Method"
                  allowClear
                  className={selectClassName}
                  options={clockOutMethodOptions}
                  size="large"
                  getPopupContainer={(trigger) =>
                    trigger.parentElement ?? document.body
                  }
                  onChange={(value) => {
                    form.setFieldsValue({ checkOutSource: value });
                    applyFilters();
                  }}
                  id="time-attendance-employee-attendance-mobile-filter-check-out-method-select"
                  data-cy="time-attendance-employee-attendance-mobile-filter-check-out-method-select"
                />
              </Form.Item>
            </div>
          </Col>
        </Row>
      </div>

      <div
        data-cy="time-attendance-employee-attendance-mobile-filter-footer"
        className="px-6 py-4 flex justify-end gap-2"
      >
        <Button
          onClick={onReset}
          className="h-8 border-[#d9d9d9] text-sm font-normal text-[#4d4d4d]"
          data-cy="time-attendance-employee-attendance-mobile-filter-reset"
        >
          Reset
        </Button>
        <Button
          type="primary"
          className="h-8 font-normal text-sm text-white"
          onClick={onClose}
          data-cy="time-attendance-employee-attendance-mobile-filter-save"
        >
          Save Filter
        </Button>
      </div>
    </div>
  );
};

const TableFilter: FC<TableFilterProps> = ({ onChange }) => {
  const [form] = Form.useForm();
  const { isMobile } = useIsMobile();
  const [employmentStatus, setEmploymentStatus] =
    useState<TimesheetEmploymentStatus>(TIMESHEET_EMPLOYMENT_STATUS_ACTIVE);
  const { data: employeeData } = useTimesheetFilterUsers(employmentStatus);
  const { data: breakTypeData } = useGetBreakTypes();
  const { isShowMobileFilters, setIsShowMobileFilters, filter } =
    useEmployeeAttendanceStore();
  const {
    mutateAsync: calculateAbsentAttendance,
    isLoading: isCalculatingAbsent,
  } = useCalculateAbsentAttendance();
  const isInactiveView = employmentStatus === TIMESHEET_EMPLOYMENT_STATUS_INACTIVE;

  const getFilterValues = useCallback((): CommonObject => {
    const values = { ...form.getFieldsValue() };
    if (values.startDate || values.endDate) {
      const start = values.startDate ?? values.endDate;
      const end = values.endDate ?? values.startDate;
      values.date = [start, end];
    }
    values.employmentStatus = employmentStatus;
    return values;
  }, [form, employmentStatus]);

  const handleEmploymentStatusChange = (value?: TimesheetEmploymentStatus) => {
    const next = value || TIMESHEET_EMPLOYMENT_STATUS_ACTIVE;
    setEmploymentStatus(next);
    form.setFieldsValue({
      employmentStatus: next,
      employeeId: undefined,
    });
    onChange({
      ...getFilterValues(),
      employmentStatus: next,
      employeeId: undefined,
    });
  };

  const getAbsentDateFilter = () => {
    const today = dayjs().format('YYYY-MM-DD');
    if (filter?.date?.from && filter?.date?.to) {
      return { date: { from: filter.date.from, to: filter.date.to } };
    }
    const values = form.getFieldsValue();
    const from = values.startDate
      ? dayjs(values.startDate).format('YYYY-MM-DD')
      : today;
    const to = values.endDate
      ? dayjs(values.endDate).format('YYYY-MM-DD')
      : today;
    return { date: { from, to } };
  };

  const handleCalculateAbsent = () => {
    const dateFilter = getAbsentDateFilter();
    Modal.confirm({
      title: 'Calculate absent attendance?',
      content:
        'This will calculate absence for all employees from ' +
        dateFilter.date.from +
        ' to ' +
        dateFilter.date.to +
        '.',
      okText: 'Calculate Absent',
      cancelText: 'Cancel',
      onOk: () => calculateAbsentAttendance(dateFilter),
    });
  };

  const employeeOptions = useMemo(
    () =>
      employeeData?.items?.map((employee: any) => ({
        value: employee.id,
        label: `${employee?.firstName} ${employee?.middleName} ${employee?.lastName}`,
      })) || [],
    [employeeData?.items],
  );

  const breakTypeOptions = useMemo(
    () =>
      breakTypeData?.items?.map((breakType: any) => ({
        value: breakType.id,
        label: breakType.title,
      })) || [],
    [breakTypeData?.items],
  );

  const clockInMethodOptions = useMemo(
    () => [
      {
        value: AttendanceCheckInSource.IMPORTED,
        label: attendanceCheckInSourceLabels[AttendanceCheckInSource.IMPORTED],
      },
      {
        value: AttendanceCheckInSource.REMOTE_CHECKED_IN,
        label:
          attendanceCheckInSourceLabels[
            AttendanceCheckInSource.REMOTE_CHECKED_IN
          ],
      },
      {
        value: AttendanceCheckInSource.ATTENDANCE_DEVICE_CHECKED_IN,
        label:
          attendanceCheckInSourceLabels[
            AttendanceCheckInSource.ATTENDANCE_DEVICE_CHECKED_IN
          ],
      },
      {
        value: AttendanceCheckInSource.SYSTEM_UPDATED,
        label:
          attendanceCheckInSourceLabels[AttendanceCheckInSource.SYSTEM_UPDATED],
      },
    ],
    [],
  );

  const clockOutMethodOptions = useMemo(
    () => [
      {
        value: AttendanceCheckOutSource.IMPORTED,
        label:
          attendanceCheckOutSourceLabels[AttendanceCheckOutSource.IMPORTED],
      },
      {
        value: AttendanceCheckOutSource.REMOTE_CHECKED_OUT,
        label:
          attendanceCheckOutSourceLabels[
            AttendanceCheckOutSource.REMOTE_CHECKED_OUT
          ],
      },
      {
        value: AttendanceCheckOutSource.ATTENDANCE_DEVICE_CHECKED_OUT,
        label:
          attendanceCheckOutSourceLabels[
            AttendanceCheckOutSource.ATTENDANCE_DEVICE_CHECKED_OUT
          ],
      },
      {
        value: AttendanceCheckOutSource.SYSTEM_UPDATED,
        label:
          attendanceCheckOutSourceLabels[
            AttendanceCheckOutSource.SYSTEM_UPDATED
          ],
      },
    ],
    [],
  );

  const handleReset = useCallback(() => {
    form.resetFields();
    setEmploymentStatus(TIMESHEET_EMPLOYMENT_STATUS_ACTIVE);
    form.setFieldsValue({
      employmentStatus: TIMESHEET_EMPLOYMENT_STATUS_ACTIVE,
    });
    onChange({ employmentStatus: TIMESHEET_EMPLOYMENT_STATUS_ACTIVE });
  }, [form, onChange]);

  const handleCloseFilters = useCallback(() => {
    setIsShowMobileFilters(false);
  }, [setIsShowMobileFilters]);

  const handleOpenChange = useCallback(
    (open: boolean) => {
      // Keep the panel open while the date picker calendar is visible.
      if (!open && isDatePickerPopupOpen()) {
        return;
      }
      setIsShowMobileFilters(open);
    },
    [setIsShowMobileFilters],
  );

  const filterDropdown = useCallback(
    () => (
      <AttendanceFilterPanel
        form={form}
        onChange={onChange}
        onClose={handleCloseFilters}
        onReset={handleReset}
        getFilterValues={getFilterValues}
        breakTypeOptions={breakTypeOptions}
        clockInMethodOptions={clockInMethodOptions}
        clockOutMethodOptions={clockOutMethodOptions}
      />
    ),
    [
      form,
      onChange,
      handleCloseFilters,
      handleReset,
      getFilterValues,
      breakTypeOptions,
      clockInMethodOptions,
      clockOutMethodOptions,
    ],
  );

  return (
    <Form
      form={form}
      initialValues={{ employmentStatus: TIMESHEET_EMPLOYMENT_STATUS_ACTIVE }}
      id="time-attendance-employee-attendance-filter-form"
      data-cy="time-attendance-employee-attendance-filter-form"
    >
      <div
        id="time-attendance-employee-attendance-mobile-filter-div"
        data-cy="time-attendance-employee-attendance-mobile-filter-div"
      >
        <div
          id="time-attendance-employee-attendance-mobile-filter-date-range-div"
          data-cy="time-attendance-employee-attendance-mobile-filter-date-range-div"
          className="flex justify-between gap-2 flex-wrap"
        >
          <div
            data-cy="time-attendance-employee-attendance-mobile-filter-status-select-div"
            className="w-[140px] sm:w-[160px]"
          >
            <Form.Item
              data-cy="time-attendance-employee-attendance-mobile-filter-status-select-form-item"
              name="employmentStatus"
              className="mb-0"
            >
              <Select
                id="time-attendance-employee-attendance-mobile-filter-status-select"
                data-cy="time-attendance-employee-attendance-mobile-filter-status-select"
                placeholder="Status"
                className="h-8"
                value={employmentStatus}
                onChange={handleEmploymentStatusChange}
                options={[
                  {
                    value: TIMESHEET_EMPLOYMENT_STATUS_ACTIVE,
                    label: 'Active',
                  },
                  {
                    value: TIMESHEET_EMPLOYMENT_STATUS_INACTIVE,
                    label: 'Inactive',
                  },
                ]}
              />
            </Form.Item>
          </div>
          <div
            data-cy="time-attendance-employee-attendance-mobile-filter-employee-select-div"
            className="w-1/2 sm:w-1/3 flex-1 min-w-[160px]"
          >
            <Form.Item
              data-cy="time-attendance-employee-attendance-mobile-filter-employee-select-form-item"
              name="employeeId"
              className="mb-0"
            >
              <Select
                id="time-attendance-employee-attendance-mobile-filter-employee-select"
                data-cy="time-attendance-employee-attendance-mobile-filter-employee-select"
                placeholder="Search Employee"
                allowClear
                className="h-8"
                options={employeeOptions}
                showSearch
                optionFilterProp="label"
                onChange={(value) => {
                  form.setFieldsValue({ employeeId: value });
                  onChange(getFilterValues());
                }}
                filterOption={(input, option) =>
                  (typeof option?.label === 'string'
                    ? option.label.toLowerCase()
                    : ''
                  ).includes(input.toLowerCase())
                }
                suffixIcon={
                  <div
                    data-cy="time-attendance-employee-attendance-mobile-filter-employee-select-suffix-icon-div"
                    className="text-gray-400 border-l p-2"
                  >
                    <SearchOutlined />
                  </div>
                }
              />
            </Form.Item>
          </div>

          <div
            className="flex items-center gap-2"
            id="time-attendance-employee-attendance-filter-actions"
            data-cy="time-attendance-employee-attendance-filter-actions"
          >
            {isMobile ? (
              <Tooltip title="Calculate Absent">
                <span data-cy="time-attendance-employee-attendance-calculate-absent-tooltip-wrapper">
                  <Button
                    type="primary"
                    size="large"
                    className="w-10 h-10 p-0 flex items-center justify-center text-base font-normal text-white"
                    id="time-attendance-employee-attendance-calculate-absent-button"
                    data-cy="time-attendance-employee-attendance-calculate-absent-button"
                    icon={<ReloadOutlined />}
                    loading={isCalculatingAbsent}
                    onClick={handleCalculateAbsent}
                    disabled={isInactiveView}
                    aria-label="Calculate Absent"
                  />
                </span>
              </Tooltip>
            ) : (
              <Button
                type="primary"
                size="large"
                className="h-8 px-4 flex items-center justify-center text-base font-normal text-white"
                id="time-attendance-employee-attendance-calculate-absent-button"
                data-cy="time-attendance-employee-attendance-calculate-absent-button"
                icon={<ReloadOutlined />}
                loading={isCalculatingAbsent}
                onClick={handleCalculateAbsent}
                disabled={isInactiveView}
              >
                Calculate Absent
              </Button>
            )}
            <Dropdown
              dropdownRender={filterDropdown}
              trigger={['click']}
              open={isShowMobileFilters}
              onOpenChange={handleOpenChange}
              destroyPopupOnHide={false}
              data-cy="time-attendance-employee-attendance-mobile-filter-dropdown"
            >
              <Button
                className={`h-8 rounded-md flex items-center justify-center border border-[#d9d9d9] text-base font-normal text-[#4d4d4d]`}
                id="time-attendance-employee-attendance-mobile-filter-toggle-button"
                data-cy="time-attendance-employee-attendance-mobile-filter-toggle-button"
                icon={
                  <FilterAltOutlinedIcon className="text-[#374151] text-base" />
                }
              >
                Filter
              </Button>
            </Dropdown>
          </div>
        </div>
      </div>
    </Form>
  );
};

export default TableFilter;
