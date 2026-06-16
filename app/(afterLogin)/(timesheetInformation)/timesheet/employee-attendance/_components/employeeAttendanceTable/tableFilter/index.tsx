import React, { FC } from 'react';
import {
  Col,
  DatePicker,
  Form,
  Row,
  Select,
  Dropdown,
  Button,
  Tooltip,
} from 'antd';
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
import dayjs from 'dayjs';
import { CommonObject } from '@/types/commons/commonObject';
import { useGetAllUsers } from '@/store/server/features/employees/employeeManagment/queries';
import { useGetBreakTypes } from '@/store/server/features/timesheet/breakType/queries';
import { useEmployeeAttendanceStore } from '@/store/uistate/features/timesheet/employeeAtendance';
import {
  useSyncZktAttendance,
  useSyncZktBreak,
} from '@/store/server/features/timesheet/attendance/mutation';
import FilterAltOutlinedIcon from '@mui/icons-material/FilterAltOutlined';
import { useIsMobile } from '@/hooks/useIsMobile';

interface TableFilterProps {
  onChange: (val: CommonObject) => void;
}

const TableFilter: FC<TableFilterProps> = ({ onChange }) => {
  const [form] = Form.useForm();
  const { isMobile } = useIsMobile();
  const { data: employeeData } = useGetAllUsers();
  const { data: breakTypeData } = useGetBreakTypes();
  const { isShowMobileFilters, setIsShowMobileFilters, filter } =
    useEmployeeAttendanceStore();
  const { mutate: syncZktAttendance, isLoading: isSyncingZkt } =
    useSyncZktAttendance();
  const { mutate: syncZktBreak, isLoading: isSyncingZktBreak } =
    useSyncZktBreak();

  const getSyncDateFilter = () => {
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

  const getSyncBreakTypeId = () =>
    filter?.breakTypeId || form.getFieldValue('breakTypeId');

  const selectedBreakTypeId = getSyncBreakTypeId();
  const isBreakZktSync = Boolean(selectedBreakTypeId);
  const syncLabel = isBreakZktSync
    ? 'Sync break from Attendance Machine'
    : 'Sync from Attendance Machine';

  const handleSyncZkt = () => {
    const dateFilter = getSyncDateFilter();
    const breakTypeId = getSyncBreakTypeId();

    if (breakTypeId) {
      syncZktBreak({ breakTypeId, filter: dateFilter });
      return;
    }

    syncZktAttendance(dateFilter);
  };

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

  const clockInMethodOptions = [
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
  ];

  const clockOutMethodOptions = [
    {
      value: AttendanceCheckOutSource.IMPORTED,
      label: attendanceCheckOutSourceLabels[AttendanceCheckOutSource.IMPORTED],
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
        attendanceCheckOutSourceLabels[AttendanceCheckOutSource.SYSTEM_UPDATED],
    },
  ];

  const labelClassName = 'text-sm font-medium text-gray-800 mb-2 block';
  const selectClassName = 'w-full h-10 rounded-md border-gray-300';

  const getFilterValues = (): CommonObject => {
    const values = { ...form.getFieldsValue() };
    if (values.startDate && values.endDate) {
      values.date = [values.startDate, values.endDate];
    }
    return values;
  };

  const MobileFilters = () => (
    <div
      className="bg-white rounded-lg border border-gray-200 min-w-[320px] sm:max-w-[420px] overflow-hidden"
      id="time-attendance-employee-attendance-mobile-filter-menu"
      data-cy="time-attendance-employee-attendance-mobile-filter-menu"
    >
      {/* Header */}
      <div
        className="px-6 pt-5 pb-1 relative"
        id="time-attendance-employee-attendance-mobile-filter-header"
        data-cy="time-attendance-employee-attendance-mobile-filter-header"
      >
        <button
          id="time-attendance-employee-attendance-mobile-filter-close-button"
          data-cy="time-attendance-employee-attendance-mobile-filter-close-button"
          type="button"
          onClick={() => setIsShowMobileFilters(false)}
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

      {/* Filter fields */}
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
                  onChange={(value) => {
                    form.setFieldsValue({ type: value });
                    onChange(getFilterValues());
                  }}
                  value={form.getFieldValue('type')}
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
              id="time-attendance-employee-attendance-mobile-filter-employee-select-div"
              data-cy="time-attendance-employee-attendance-mobile-filter-employee-select-div"
              className="mb-4"
            >
              <label
                id="time-attendance-employee-attendance-mobile-filter-employee-select-label"
                data-cy="time-attendance-employee-attendance-mobile-filter-employee-select-label"
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
                  placeholder="Start Date"
                  format={DATE_FORMAT}
                  id="time-attendance-history-table-filter-mobile-start-date-picker"
                  data-cy="time-attendance-history-table-filter-mobile-start-date-picker"
                />
              </Form.Item>
            </div>
          </Col>
          <Col lg={12} md={12} sm={24} xs={24}>
            <div
              id="time-attendance-employee-attendance-mobile-filter-employee-select-div"
              data-cy="time-attendance-employee-attendance-mobile-filter-employee-select-div"
              className="mb-4"
            >
              <label
                id="time-attendance-employee-attendance-mobile-filter-end-date-label"
                data-cy="time-attendance-employee-attendance-mobile-filter-employee-select-label"
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
                  placeholder="End Date"
                  format={DATE_FORMAT}
                  id="time-attendance-history-table-filter-mobile-end-date-picker"
                  data-cy="time-attendance-history-table-filter-mobile-end-date-picker"
                />
              </Form.Item>
            </div>
          </Col>
        </Row>
        <div
          data-cy="-components-employeeattendancetable-tablefilter-index-tsx-index-div-115"
          className="mt-1"
        >
          <label
            data-cy="-components-employeeattendancetable-tablefilter-index-tsx-index-p-116"
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
              onChange={(value) => {
                form.setFieldsValue({ breakTypeId: value });
                onChange(getFilterValues());
              }}
              value={form.getFieldValue('breakTypeId')}
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
                  onChange={(value) => {
                    form.setFieldsValue({ checkInSource: value });
                    onChange(getFilterValues());
                  }}
                  value={form.getFieldValue('checkInSource')}
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
                  onChange={(value) => {
                    form.setFieldsValue({ checkOutSource: value });
                    onChange(getFilterValues());
                  }}
                  value={form.getFieldValue('checkOutSource')}
                  id="time-attendance-employee-attendance-mobile-filter-check-out-method-select"
                  data-cy="time-attendance-employee-attendance-mobile-filter-check-out-method-select"
                />
              </Form.Item>
            </div>
          </Col>
        </Row>
      </div>

      {/* Footer */}
      <div
        data-cy="time-attendance-employee-attendance-mobile-filter-footer"
        className="px-6 py-4 flex justify-end gap-2"
      >
        <Button
          onClick={() => {
            form.resetFields();
            onChange({});
          }}
          className="h-8 border-[#d9d9d9] text-sm font-normal text-[#4d4d4d]"
          data-cy="time-attendance-employee-attendance-mobile-filter-reset"
        >
          Reset
        </Button>
        <Button
          type="primary"
          className="h-8 font-normal text-sm text-white"
          onClick={() => {
            setIsShowMobileFilters(false);
          }}
          data-cy="time-attendance-employee-attendance-mobile-filter-save"
        >
          Save Filter
        </Button>
      </div>
    </div>
  );

  return (
    <Form
      form={form}
      onFieldsChange={() => onChange(getFilterValues())}
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
          className="flex justify-between"
        >
          <div
            data-cy="time-attendance-employee-attendance-mobile-filter-employee-select-div"
            className="w-1/2 sm:w-1/3 "
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
                value={form.getFieldValue('employeeId')}
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
              <Tooltip title={syncLabel}>
                <span>
                  <Button
                    type="primary"
                    size="large"
                    className="w-10 h-10 p-0 flex items-center justify-center text-base font-normal text-white"
                    id="time-attendance-employee-attendance-sync-zkt-button"
                    data-cy={
                      isBreakZktSync
                        ? 'time-attendance-employee-attendance-sync-zkt-break-button'
                        : 'time-attendance-employee-attendance-sync-zkt-button'
                    }
                    icon={<ReloadOutlined />}
                    loading={isSyncingZkt || isSyncingZktBreak}
                    onClick={handleSyncZkt}
                    aria-label={syncLabel}
                  />
                </span>
              </Tooltip>
            ) : (
              <Button
                type="primary"
                size="large"
                className="h-10 text-base font-normal text-white"
                id="time-attendance-employee-attendance-sync-zkt-button"
                data-cy={
                  isBreakZktSync
                    ? 'time-attendance-employee-attendance-sync-zkt-break-button'
                    : 'time-attendance-employee-attendance-sync-zkt-button'
                }
                loading={isSyncingZkt || isSyncingZktBreak}
                onClick={handleSyncZkt}
                aria-label={syncLabel}
              >
                {syncLabel}
              </Button>
            )}
            <Dropdown
              overlay={<MobileFilters />}
              trigger={['click']}
              open={isShowMobileFilters}
              onOpenChange={setIsShowMobileFilters}
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
