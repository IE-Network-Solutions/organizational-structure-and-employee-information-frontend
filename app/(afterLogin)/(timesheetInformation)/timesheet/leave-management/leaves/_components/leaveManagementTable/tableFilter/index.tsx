'use client';
import {
  Button,
  Col,
  DatePicker,
  Form,
  Modal,
  Popover,
  Row,
  Select,
} from 'antd';
import { CommonObject } from '@/types/commons/commonObject';
import React, { FC, useLayoutEffect, useRef, useState } from 'react';
import { DATE_FORMAT } from '@/utils/constants';
import { formatToOptions } from '@/helpers/formatTo';
import { LeaveRequestStatusOption } from '@/types/timesheet/settings';
import { MdKeyboardArrowDown, MdOutlineFilterAlt } from 'react-icons/md';
import { SearchOutlined } from '@ant-design/icons';
import { useGetAllUsers } from '@/store/server/features/employees/employeeManagment/queries';
import {
  useGetDepartments,
  useGetDepartmentUsersAllLevels,
} from '@/store/server/features/employees/employeeManagment/department/queries';
import { useGetLeaveTypes } from '@/store/server/features/timesheet/leaveType/queries';
import { Dayjs } from 'dayjs';
import { useIsMobile } from '@/hooks/useIsMobile';

interface LeaveManagementTableFilterProps {
  onChange: (val: CommonObject) => void;
}

const LeaveManagementTableFilter: FC<LeaveManagementTableFilterProps> = ({
  onChange,
}) => {
  const { isMobile } = useIsMobile();
  const { data: leaveTypesData } = useGetLeaveTypes();
  const { data: departmentsData } = useGetDepartments();
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<
    string | undefined
  >(undefined);
  const { data: departmentUsersData } = useGetDepartmentUsersAllLevels(
    selectedDepartmentId ?? null,
  );
  const [form] = Form.useForm();
  const { data: users } = useGetAllUsers();
  const [filterPopoverOpen, setFilterPopoverOpen] = useState(false);
  const [modalTopOffset, setModalTopOffset] = useState(0);
  const filterRootRef = useRef<HTMLDivElement>(null);
  const FILTER_ROOT_ID = 'time-attendance-leave-management-filter-root';

  useLayoutEffect(() => {
    if (!isMobile || !filterPopoverOpen || !filterRootRef.current) return;
    const el = filterRootRef.current;
    const container = el.parentElement;
    const rect =
      container?.getBoundingClientRect?.() ?? el.getBoundingClientRect();
    setModalTopOffset(rect.bottom);
  }, [isMobile, filterPopoverOpen]);

  const departments = Array.isArray(departmentsData)
    ? departmentsData
    : (departmentsData?.items ?? []);

  const departmentUsers: { id?: string }[] = Array.isArray(departmentUsersData)
    ? departmentUsersData
    : (departmentUsersData?.items ?? []);

  const notifyChange = (values?: CommonObject) => {
    const vals = values ?? form.getFieldsValue();
    const payload: CommonObject = { ...vals };
    if (payload.departmentId && departmentUsers?.length) {
      payload.userIds = departmentUsers
        .map((user: { id?: string }) => user.id)
        .filter(Boolean);
    } else {
      payload.userIds = undefined;
    }
    onChange(payload);
  };

  const handleSaveFilter = async () => {
    try {
      await form.validateFields();
      notifyChange();
      setFilterPopoverOpen(false);
    } catch {
      // Validation failed; form shows errors
    }
  };

  const handleReset = () => {
    form.resetFields();
    notifyChange({
      type: undefined,
      departmentId: undefined,
      status: undefined,
      userIds: undefined,
      dateRange: undefined,
    });
    setFilterPopoverOpen(false);
  };

  /* Figma filter modal width (node 2623-3958): 424px on desktop; full width in modal on mobile.
   * Use maxHeight + overflow-y-auto so when table has no/few rows the popover isn't clipped
   * and Start Date, End Date and actions stay visible (scrollable if needed). */
  const filterContent = (
    <div
      className="box-border relative px-4 py-3 overflow-y-auto overflow-x-hidden"
      style={
        isMobile
          ? undefined
          : { width: 424, maxHeight: 'min(480px, calc(100vh - 120px))' }
      }
      id="time-attendance-leave-management-filter-popover-content"
      data-cy="time-attendance-leave-management-filter-popover-content"
    >
      <div
        className="mb-4"
        data-cy="time-attendance-leave-management-filter-header"
      >
        <h3
          className="text-lg font-semibold text-gray-900 m-0"
          data-cy="time-attendance-leave-management-filter-title"
        >
          Filter
        </h3>
        <p
          className="text-sm text-gray-500 mt-0.5 mb-0"
          data-cy="time-attendance-leave-management-filter-subtitle"
        >
          Select All filters that apply
        </p>
      </div>
      <Form
        form={form}
        layout="vertical"
        id="time-attendance-leave-management-filter-form"
        data-cy="time-attendance-leave-management-filter-form"
      >
        <Form.Item
          label="Leave Type"
          id="time-attendance-leave-management-filter-type-form-item"
          name="type"
          data-cy="time-attendance-leave-management-filter-type-form-item"
        >
          <Select
            className="w-full"
            placeholder="Select Leave type"
            allowClear
            suffixIcon={
              <MdKeyboardArrowDown
                data-cy="time-attendance-leave-management-filter-type-select-suffix-icon"
                size={16}
                className="text-gray-900"
              />
            }
            options={formatToOptions(
              leaveTypesData?.items ?? [],
              'title',
              'id',
            )}
            id="time-attendance-leave-management-filter-type-select"
            data-cy="time-attendance-leave-management-filter-type-select"
          />
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Department"
              name="departmentId"
              data-cy="time-attendance-leave-management-filter-department-form-item"
            >
              <Select
                className="w-full"
                placeholder="Select Department"
                allowClear
                showSearch
                optionFilterProp="label"
                suffixIcon={
                  <MdKeyboardArrowDown
                    data-cy="time-attendance-leave-management-filter-department-select-suffix-icon"
                    size={16}
                    className="text-gray-900"
                  />
                }
                options={departments.map((d: { id: string; name: string }) => ({
                  value: d.id,
                  label: d.name,
                }))}
                onChange={(value) => {
                  setSelectedDepartmentId(value || undefined);
                  form.setFieldsValue({ departmentId: value });
                }}
                id="time-attendance-leave-management-filter-department-select"
                data-cy="time-attendance-leave-management-filter-department-select"
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Leave Status"
              id="time-attendance-leave-management-filter-status-form-item"
              name="status"
              data-cy="time-attendance-leave-management-filter-status-form-item"
            >
              <Select
                className="w-full"
                placeholder="Select Status"
                allowClear
                suffixIcon={
                  <MdKeyboardArrowDown
                    data-cy="time-attendance-leave-management-filter-status-select-suffix-icon"
                    size={16}
                    className="text-gray-900"
                  />
                }
                options={LeaveRequestStatusOption}
                id="time-attendance-leave-management-filter-status-select"
                data-cy="time-attendance-leave-management-filter-status-select"
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Start Date"
              name="dateFrom"
              dependencies={['dateTo']}
              id="time-attendance-leave-management-filter-start-date-form-item"
              data-cy="time-attendance-leave-management-filter-start-date-form-item"
              rules={[
                ({ getFieldValue }) => ({
                  /* eslint-disable @typescript-eslint/naming-convention */
                  validator(_: unknown, value: Dayjs) {
                    /* eslint-enable @typescript-eslint/naming-convention */
                    const end = getFieldValue('dateTo') as Dayjs | undefined;
                    if (end && !value) {
                      return Promise.reject(
                        new Error('Please select start date'),
                      );
                    }
                    if (
                      !value ||
                      !end ||
                      value.isBefore(end) ||
                      value.isSame(end, 'day')
                    ) {
                      return Promise.resolve();
                    }
                    return Promise.reject(
                      new Error('Start date must be before end date'),
                    );
                  },
                }),
              ]}
            >
              <DatePicker
                className="w-full"
                format={DATE_FORMAT}
                placeholder="Start date"
                getPopupContainer={(node) =>
                  node?.closest?.(`#${FILTER_ROOT_ID}`) ??
                  document.getElementById(FILTER_ROOT_ID) ??
                  document.body
                }
                id="time-attendance-leave-management-filter-start-date-picker"
                data-cy="time-attendance-leave-management-filter-start-date-picker"
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="End Date"
              name="dateTo"
              dependencies={['dateFrom']}
              id="time-attendance-leave-management-filter-end-date-form-item"
              data-cy="time-attendance-leave-management-filter-end-date-form-item"
              rules={[
                ({ getFieldValue }) => ({
                  /* eslint-disable @typescript-eslint/naming-convention */
                  validator(_: unknown, value: Dayjs) {
                    /* eslint-enable @typescript-eslint/naming-convention */
                    const start = getFieldValue('dateFrom') as
                      | Dayjs
                      | undefined;
                    if (start && !value) {
                      return Promise.reject(
                        new Error('Please select end date'),
                      );
                    }
                    if (
                      !value ||
                      !start ||
                      value.isAfter(start) ||
                      value.isSame(start, 'day')
                    ) {
                      return Promise.resolve();
                    }
                    return Promise.reject(
                      new Error('End date must be after start date'),
                    );
                  },
                }),
              ]}
            >
              <DatePicker
                className="w-full"
                format={DATE_FORMAT}
                placeholder="End date"
                getPopupContainer={(node) =>
                  node?.closest?.(`#${FILTER_ROOT_ID}`) ??
                  document.getElementById(FILTER_ROOT_ID) ??
                  document.body
                }
                id="time-attendance-leave-management-filter-end-date-picker"
                data-cy="time-attendance-leave-management-filter-end-date-picker"
              />
            </Form.Item>
          </Col>
        </Row>

        <div
          className="flex justify-end gap-2 pt-2"
          data-cy="time-attendance-leave-management-filter-actions"
        >
          <Button
            onClick={handleReset}
            className="transition-colors hover:bg-gray-100 hover:border-gray-300 active:bg-gray-200 active:border-gray-400"
            data-cy="time-attendance-leave-management-filter-reset-button"
          >
            Reset
          </Button>
          <Button
            type="primary"
            onClick={handleSaveFilter}
            className="transition-colors hover:opacity-90 hover:brightness-110 active:opacity-95 active:brightness-105"
            data-cy="time-attendance-leave-management-filter-save-button"
          >
            Save Filter
          </Button>
        </div>
      </Form>
    </div>
  );

  return (
    <Form
      form={form}
      onValuesChange={(changed, all) => {
        if (Object.keys(changed).includes('searchEmployee')) {
          notifyChange(all);
        }
      }}
    >
      <div
        ref={filterRootRef}
        id={FILTER_ROOT_ID}
        className="flex flex-wrap items-center justify-between gap-4 mb-0"
        data-cy="time-attendance-leave-management-filter-row"
      >
        <div
          className="w-[300px] max-w-md"
          data-cy="time-attendance-leave-management-filter-search-wrapper"
        >
          <Form.Item name="searchEmployee" className="mb-0">
            <Select
              showSearch
              placeholder="Search Employee"
              allowClear
              optionFilterProp="label"
              options={users?.items?.map((list: any) => ({
                value: list?.id,
                label:
                  `${list?.firstName ?? ''} ${list?.middleName ?? ''} ${list?.lastName ?? ''}`.trim(),
              }))}
              className="h-10 border-gray-100"
              suffixIcon={
                <div
                  data-cy="time-attendance-leave-management-search-employee-suffix-icon-container"
                  className="flex items-center justify-center h-10 border-l border-gray-200  "
                >
                  <SearchOutlined
                    data-cy="time-attendance-leave-management-search-employee-suffix-icon"
                    className="text-gray-600 ml-2"
                  />
                </div>
              }
              id="time-attendance-leave-management-search-employee"
              data-cy="time-attendance-leave-management-search-employee"
            />
          </Form.Item>
        </div>

        {isMobile ? (
          <>
            <Button
              className="h-10 flex items-center gap-2 border border-gray-200 text-gray-700 bg-white transition-colors hover:border-[#4096FF] hover:text-[#4096FF] hover:[&_.ant-btn-icon]:text-[#4096FF] active:border-[#4096FF] active:text-[#4096FF] active:[&_.ant-btn-icon]:text-[#4096FF] active:bg-blue-50"
              id="time-attendance-leave-management-filter-button"
              data-cy="time-attendance-leave-management-filter-button"
              icon={
                <MdOutlineFilterAlt
                  data-cy="time-attendance-leave-management-filter-button-icon"
                  className="text-gray-600"
                />
              }
              onClick={() => {
                if (filterRootRef.current) {
                  const el = filterRootRef.current;
                  const container = el.parentElement;
                  const rect = (container?.getBoundingClientRect?.() ??
                    el.getBoundingClientRect()) as DOMRect;
                  setModalTopOffset(rect.bottom);
                }
                setFilterPopoverOpen(true);
              }}
            >
              Filter
            </Button>
            <Modal
              open={filterPopoverOpen}
              onCancel={() => setFilterPopoverOpen(false)}
              centered={false}
              width="calc(100vw - 32px)"
              footer={null}
              title={null}
              style={{
                position: 'fixed',
                top: modalTopOffset,
                left: 16,
                right: 16,
                margin: 0,
                maxWidth: 'calc(100vw - 32px)',
                paddingBottom: 0,
              }}
              styles={{
                body: { padding: 0 },
                wrapper: {
                  alignItems: 'flex-start',
                  justifyContent: 'flex-start',
                  paddingTop: 0,
                  overflow: 'auto',
                },
                content: {
                  marginTop: 0,
                  maxHeight: `calc(100vh - ${modalTopOffset}px - 16px)`,
                },
              }}
              className="leave-management-filter-modal sm:max-w-[424px]"
              data-cy="time-attendance-leave-management-filter-modal"
            >
              {filterContent}
            </Modal>
          </>
        ) : (
          <Popover
            content={filterContent}
            trigger="click"
            open={filterPopoverOpen}
            onOpenChange={setFilterPopoverOpen}
            placement="bottomRight"
            align={{
              offset: [0, 4],
              overflow: { adjustX: true, adjustY: true },
            }}
            getPopupContainer={() => document.body}
            data-cy="time-attendance-leave-management-filter-popover"
          >
            <Button
              className="h-10 flex items-center gap-2 border border-gray-200 text-gray-700 bg-white transition-colors hover:border-[#4096FF] hover:text-[#4096FF] hover:[&_.ant-btn-icon]:text-[#4096FF]"
              id="time-attendance-leave-management-filter-button"
              data-cy="time-attendance-leave-management-filter-button"
              icon={
                <MdOutlineFilterAlt
                  data-cy="time-attendance-leave-management-filter-button-icon"
                  className="text-gray-600"
                />
              }
            >
              Filter
            </Button>
          </Popover>
        )}
      </div>
    </Form>
  );
};

export default LeaveManagementTableFilter;
