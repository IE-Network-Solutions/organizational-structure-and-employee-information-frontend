import {
  Card,
  DatePicker,
  Form,
  Select,
  Skeleton,
  Tag,
  Spin,
  Tooltip,
  Modal,
} from 'antd';
import React, { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useGetUserLeaveBalance } from '@/store/server/features/timesheet/dashboard/queries';
import { useGetLeaveBalance } from '@/store/server/features/timesheet/leaveBalance/queries';
import { TimeAndAttendaceDashboardStore } from '@/store/uistate/features/timesheet/dashboard';
import { useGetEmployees } from '@/store/server/features/employees/employeeManagment/queries';
import dayjs from 'dayjs';
import CustomButton from '@/components/common/buttons/customButton';
import { LuSettings2 } from 'react-icons/lu';
import { useGetLeaveBalanceExpiring } from '@/store/server/features/timesheet/leaveExpiry/queries';

const UserLeaveBalance: React.FC = () => {
  const [form] = Form.useForm();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const searchParams = useSearchParams();
  const userId = searchParams.get('user');
  const {
    setLeaveTypeId,
    leaveTypeId,
    startDate,
    endDate,
    setStartDate,
    setEndDate,
    setUserIdOnLeaveBalance,
    userIdOnLeaveBalance,
    monthsAheadOnLeaveBalanceExpiring,
  } = TimeAndAttendaceDashboardStore();

  const { data: userLeaveBalance, isLoading: userLeaveBalanceLoading } =
    useGetUserLeaveBalance(
      userIdOnLeaveBalance ? userIdOnLeaveBalance : (userId as string),
      leaveTypeId || '',
      startDate || '',
      endDate || '',
    );
  const { data: leaveBalance, isLoading: leaveBalanceLoading } =
    useGetLeaveBalance(
      userIdOnLeaveBalance ? userIdOnLeaveBalance : (userId as string),
      '',
    );
  const {} = useGetLeaveBalanceExpiring(
    userId as string,
    leaveTypeId || '',
    monthsAheadOnLeaveBalanceExpiring,
  );

  const statusColors: { [key: string]: string } = {
    approved: 'text-[#3636F0] bg-[#B2B2FF]',
    pending: 'text-[#FFD023] bg-[#FFDE6533]',
    rejected: 'text-[#e03137] bg-[#f9d6d7]',
    cancelled: 'text-gray-500 bg-gray-500/20',
  };
  const leaveOptions = leaveBalance?.items?.items?.map((item: any) => ({
    label: item.leaveType.title,
    value: item.leaveTypeId,
  }));
  const { data: Employees } = useGetEmployees();
  const employeeOptions = Employees?.items?.map((i: any) => ({
    value: i.id,
    label: i?.firstName + ' ' + i?.middleName + ' ' + i?.lastName,
  }));
  return (
    <div
      id="time-attendance-user-leave-balance-layout-div"
      data-cy="time-attendance-user-leave-balance-layout-div"
    >
      <Form
        form={form}
        layout="inline"
        className="grid grid-cols-12 gap-4 mb-4"
        id="time-attendance-user-leave-balance-filter-form"
        data-cy="time-attendance-user-leave-balance-filter-form"
      >
        <Form.Item
          name="employee"
          className="col-span-6 bg-none"
          id="time-attendance-user-leave-balance-employee-form-item"
          data-cy="time-attendance-user-leave-balance-employee-form-item"
        >
          <Select
            showSearch
            placeholder="Select employee"
            allowClear
            filterOption={(input: any, option: any) =>
              (option?.label ?? '')?.toLowerCase().includes(input.toLowerCase())
            }
            options={employeeOptions}
            className="w-full  h-14 "
            onChange={(value: any) => setUserIdOnLeaveBalance(value)}
            id="time-attendance-user-leave-balance-employee-select"
            data-cy="time-attendance-user-leave-balance-employee-select"
          />
        </Form.Item>
        <Form.Item
          name="type"
          className="w-full  col-span-3"
          id="time-attendance-user-leave-balance-type-form-item"
          data-cy="time-attendance-user-leave-balance-type-form-item"
        >
          <Select
            showSearch
            placeholder="Select Leave Type"
            allowClear
            filterOption={(input: any, option: any) =>
              (option?.label ?? '')?.toLowerCase().includes(input.toLowerCase())
            }
            options={leaveOptions}
            className="w-full h-14 bg-transparent"
            onChange={(value) => setLeaveTypeId(value)}
            id="time-attendance-user-leave-balance-type-select"
            data-cy="time-attendance-user-leave-balance-type-select"
          />
        </Form.Item>

        <Form.Item
          name="date"
          className="w-full  col-span-3 "
          id="time-attendance-user-leave-balance-date-form-item"
          data-cy="time-attendance-user-leave-balance-date-form-item"
        >
          <DatePicker.RangePicker
            size="large"
            className="rounded-md w-full h-14 border-none"
            onChange={(value) => {
              if (value) {
                setStartDate(value[0] ? value[0].format('YYYY-MM-DD') : '');
                setEndDate(value[1] ? value[1].format('YYYY-MM-DD') : '');
              } else {
                setStartDate('');
                setEndDate('');
              }
            }}
            id="time-attendance-user-leave-balance-date-range-picker"
            data-cy="time-attendance-user-leave-balance-date-range-picker"
          />
        </Form.Item>
      </Form>
      <div
        className="flex gap-4 overflow-x-auto scrollbar-none pb-2"
        id="time-attendance-user-leave-balance-cards-container-div"
        data-cy="time-attendance-user-leave-balance-cards-container-div"
      >
        {leaveBalanceLoading && (
          <Skeleton
            active
            data-cy="time-attendance-user-leave-balance-cards-loading-skeleton"
          />
        )}
        {leaveBalance?.items?.items?.map((item: any, index: number) => (
          <Card
            bodyStyle={{ padding: '10px' }}
            key={index}
            className={`${leaveTypeId === item.leaveTypeId ? 'min-w-[209px] min-h-[102px]' : 'shadow-md min-w-[213px] min-h-[106px]'}`}
            onClick={() =>
              leaveTypeId
                ? setLeaveTypeId('')
                : setLeaveTypeId(item.leaveTypeId)
            }
            id={`time-attendance-user-leave-balance-type-card-${index}`}
            data-cy={`time-attendance-user-leave-balance-type-card-${index}`}
          >
            <div
              className="flex justify-between items-center py-5 cursor-pointer"
              id={`time-attendance-user-leave-balance-type-card-${index}-content-div`}
              data-cy={`time-attendance-user-leave-balance-type-card-${index}-content-div`}
            >
              <div
                id={`time-attendance-user-leave-balance-type-card-${index}-info-div`}
                data-cy={`time-attendance-user-leave-balance-type-card-${index}-info-div`}
              >
                <Tooltip
                  title={item.leaveType.title}
                  id={`time-attendance-user-leave-balance-type-card-${index}-tooltip`}
                  data-cy={`time-attendance-user-leave-balance-type-card-${index}-tooltip`}
                >
                  <p
                    className="font-bold text-xs capitalize mb-1"
                    id={`time-attendance-user-leave-balance-type-card-${index}-title-text`}
                    data-cy={`time-attendance-user-leave-balance-type-card-${index}-title-text`}
                  >
                    {item.leaveType.title?.slice(0, 15)}...
                  </p>
                </Tooltip>
                <Tag
                  className={`font-bold border-none py-0.5 ${
                    item.leaveType.isFixed
                      ? 'bg-[#B2B2FF] text-[#3636F0]'
                      : 'bg-[#55C79033] text-[#0CAF60]'
                  }`}
                  id={`time-attendance-user-leave-balance-type-card-${index}-mode-tag`}
                  data-cy={`time-attendance-user-leave-balance-type-card-${index}-mode-tag`}
                >
                  {item.leaveType.isFixed ? 'Fixed' : 'Incremental'}
                </Tag>
              </div>
              <div
                className=""
                id={`time-attendance-user-leave-balance-type-card-${index}-balance-div`}
                data-cy={`time-attendance-user-leave-balance-type-card-${index}-balance-div`}
              >
                <div
                  className="text-xl font-bold text-[#3636F0] "
                  id={`time-attendance-user-leave-balance-type-card-${index}-balance-value`}
                  data-cy={`time-attendance-user-leave-balance-type-card-${index}-balance-value`}
                >
                  <span id={`time-attendance-user-leave-balance-type-card-${index}-balance-value-text`} data-cy={`time-attendance-user-leave-balance-type-card-${index}-balance-value-text`} className="">
                    {Math.round(item.totalBalance)}
                  </span>
                  <span id={`time-attendance-user-leave-balance-type-card-${index}-balance-value-days-text`} data-cy={`time-attendance-user-leave-balance-type-card-${index}-balance-value-days-text`} className="text-[10px] mr-2 font-bold ">days</span>
                </div>
                <div
                  className="text-sm font-medium text-black "
                  id={`time-attendance-user-leave-balance-type-card-${index}-available-text`}
                  data-cy={`time-attendance-user-leave-balance-type-card-${index}-available-text`}
                >
                  Avaliable
                </div>
              </div>
            </div>
          </Card>
        ))}

  const MobileFilterContent = () => (
    <div className="flex flex-col gap-4">
      <h3 className="text-lg font-medium mb-2">Filter</h3>

      {/* Leave Type */}
      <div className="flex flex-col gap-2">
        <label className="text-sm text-gray-600">Leave Type</label>
        <Select
          showSearch
          placeholder="Select Leave Type"
          allowClear
          value={leaveTypeId}
          className="w-full h-12"
          onChange={(value) => setLeaveTypeId(value)}
          filterOption={(input: any, option: any) =>
            (option?.label ?? '')?.toLowerCase().includes(input.toLowerCase())
          }
          options={leaveOptions}
        />
      </div>

      {/* Date Range */}
      <div className="flex flex-col gap-2">
        <label className="text-sm text-gray-600">Date Range</label>
        <DatePicker.RangePicker
          allowClear
          className="w-full h-12"
          onChange={(value) => {
            if (value) {
              setStartDate(value[0] ? value[0].format('YYYY-MM-DD') : '');
              setEndDate(value[1] ? value[1].format('YYYY-MM-DD') : '');
            } else {
              setStartDate('');
              setEndDate('');
            }
          }}
        />
      </div>
    </div>
  );

      {/* Entitlement and Utilization */}
      <div
        className="grid grid-cols-12 gap-4 mt-4"
        id="time-attendance-user-leave-balance-summary-grid"
        data-cy="time-attendance-user-leave-balance-summary-grid"
      >
        <Card
          bodyStyle={{ padding: '0px' }}
          className="shadow-sm rounded-lg col-span-3 h-fit"
          loading={userLeaveBalanceLoading}
          id="time-attendance-user-leave-balance-totals-card"
          data-cy="time-attendance-user-leave-balance-totals-card"
        >
          <div
            className="flex flex-col"
            id="time-attendance-user-leave-balance-totals-container-div"
            data-cy="time-attendance-user-leave-balance-totals-container-div"
          >
            <div
              className="py-4 border-b border[3px] border-gray-200"
              id="time-attendance-user-leave-balance-entitled-row"
              data-cy="time-attendance-user-leave-balance-entitled-row"
            >
              <div
                className="flex items-center justify-center gap-4 px-4"
                id="time-attendance-user-leave-balance-entitled-content-div"
                data-cy="time-attendance-user-leave-balance-entitled-content-div"
              >
                <span
                  className="text-[16px] text-black font-medium text-right w-32"
                  id="time-attendance-user-leave-balance-entitled-label"
                  data-cy="time-attendance-user-leave-balance-entitled-label"
                >
                  Entitled
                </span>
                <span
                  className="text-[16px] font-bold text-black w-20"
                  id="time-attendance-user-leave-balance-entitled-value"
                  data-cy="time-attendance-user-leave-balance-entitled-value"
                >
                  {Number(
                    userLeaveBalance?.data?.totals?.totalEntitledDays,
                  )?.toLocaleString() || 0}
                </span>
              </div>
            </div>
            <div
              className="py-4 border-b border[3px] border-gray-200"
              id="time-attendance-user-leave-balance-accured-row"
              data-cy="time-attendance-user-leave-balance-accured-row"
            >
              <div
                className="flex items-center justify-center gap-4 px-4"
                id="time-attendance-user-leave-balance-accured-content-div"
                data-cy="time-attendance-user-leave-balance-accured-content-div"
              >
                <span
                  className="text-[16px] text-black font-medium text-right w-32"
                  id="time-attendance-user-leave-balance-accured-label"
                  data-cy="time-attendance-user-leave-balance-accured-label"
                >
                  Accured
                </span>
                <span
                  className="text-[16px] font-bold text-black w-20"
                  id="time-attendance-user-leave-balance-accured-value"
                  data-cy="time-attendance-user-leave-balance-accured-value"
                >
                  {Number(
                    userLeaveBalance?.data?.totals?.totalAccrued,
                  )?.toLocaleString() || 0}
                </span>
              </div>
            </div>
            <div
              className="py-4 border-b border[3px] border-gray-200"
              id="time-attendance-user-leave-balance-carried-row"
              data-cy="time-attendance-user-leave-balance-carried-row"
            >
              <div
                className="flex items-center justify-center gap-4 px-4"
                id="time-attendance-user-leave-balance-carried-content-div"
                data-cy="time-attendance-user-leave-balance-carried-content-div"
              >
                <span
                  className="text-[16px] text-black font-medium text-right w-32"
                  id="time-attendance-user-leave-balance-carried-label"
                  data-cy="time-attendance-user-leave-balance-carried-label"
                >
                  Carried over
                </span>
                <span
                  className="text-[16px] font-bold text-black w-20"
                  id="time-attendance-user-leave-balance-carried-value"
                  data-cy="time-attendance-user-leave-balance-carried-value"
                >
                  {Number(
                    userLeaveBalance?.data?.totals?.totalCarriedOver,
                  )?.toLocaleString() || 0}
                </span>
              </div>
            </div>
            <div
              className="py-4 md:border-b border-r border[3px] border-gray-200"
              id="time-attendance-user-leave-balance-utilized-row"
              data-cy="time-attendance-user-leave-balance-utilized-row"
            >
              <div
                className="flex items-center justify-center gap-4 px-4"
                id="time-attendance-user-leave-balance-utilized-content-div"
                data-cy="time-attendance-user-leave-balance-utilized-content-div"
              >
                <span
                  className="text-[16px] text-black font-medium text-right w-32"
                  id="time-attendance-user-leave-balance-utilized-label"
                  data-cy="time-attendance-user-leave-balance-utilized-label"
                >
                  Total Utilized
                </span>
                <span
                  className="text-[16px] font-bold text-black w-20"
                  id="time-attendance-user-leave-balance-utilized-value"
                  data-cy="time-attendance-user-leave-balance-utilized-value"
                >
                  {Number(
                    userLeaveBalance?.data?.totals?.totalUtilizedLeaves,
                  )?.toLocaleString() || 0}
                </span>
              </div>
            </div>
            <div
              className="py-4"
              id="time-attendance-user-leave-balance-expire-row"
              data-cy="time-attendance-user-leave-balance-expire-row"
            >
              <div
                className="flex items-center justify-center md:gap-4 gap-2 md:px-4 px-2  "
                id="time-attendance-user-leave-balance-expire-content-div"
                data-cy="time-attendance-user-leave-balance-expire-content-div"
              >
                <span
                  className="md:text-[16px] text-[10px] text-black font-medium text-right md:w-32"
                  id="time-attendance-user-leave-balance-expire-label"
                  data-cy="time-attendance-user-leave-balance-expire-label"
                >
                  About to expire
                </span>
                <span
                  className="md:text-[16px] text-[14px] font-bold text-black md:w-20"
                  id="time-attendance-user-leave-balance-expire-value"
                  data-cy="time-attendance-user-leave-balance-expire-value"
                >
                  {Number.isNaN(
                    Number(leaveBalanceExpiring?.totalExpiringAmount),
                  )
                    ? '-'
                    : Number(
                        leaveBalanceExpiring?.totalExpiringAmount,
                      )?.toLocaleString() || 0}
                </span>
              </div>
              <div
                className="flex items-center justify-center md:gap-4 gap-2 md:px-4 px-2"
                id="time-attendance-user-leave-balance-expire-select-div"
                data-cy="time-attendance-user-leave-balance-expire-select-div"
              >
                <Select
                  loading={leaveBalanceExpiringLoading}
                  value={Number(monthsAheadOnLeaveBalanceExpiring)}
                  size="small"
                  className="w-30"
                  onSelect={(value: number) => {
                    setMonthsAheadOnLeaveBalanceExpiring(String(value));
                  }}
                  id="time-attendance-user-leave-balance-expire-select"
                  data-cy="time-attendance-user-leave-balance-expire-select"
                >
                  {/*  eslint-disable-next-line @typescript-eslint/naming-convention */}
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                    /*  eslint-enable-next-line @typescript-eslint/naming-convention */
                    <Select.Option
                      key={month}
                      value={month}
                      label={`${month} ${month === 1 ? 'Month' : 'Months'}`}
                      id={`time-attendance-user-leave-balance-expire-option-${month}`}
                      data-cy={`time-attendance-user-leave-balance-expire-option-${month}`}
                    >
                      In {month} {month === 1 ? 'Month' : 'Months'}
                    </Select.Option>
                  ))}
                </Select>
  return (
    <div className="px-3 sm:px-0">
      <div className="flex flex-col gap-4">
        {/* Desktop Filters */}
        <div className="hidden md:block">
          <Form
            form={form}
            layout="inline"
            className="grid grid-cols-12 gap-4 mb-4"
          >
            <Form.Item name="employee" className="col-span-6 bg-none">
              <Select
                showSearch
                placeholder="Search Employee"
                allowClear
                filterOption={(input: any, option: any) =>
                  (option?.label ?? '')
                    ?.toLowerCase()
                    .includes(input.toLowerCase())
                }
                options={employeeOptions}
                className="w-full h-12"
                onChange={(value: any) => setUserIdOnLeaveBalance(value)}
              />
            </Form.Item>
            <Form.Item name="type" className="w-full col-span-3">
              <Select
                showSearch
                placeholder="Leave Type"
                allowClear
                value={leaveTypeId}
                filterOption={(input: any, option: any) =>
                  (option?.label ?? '')
                    ?.toLowerCase()
                    .includes(input.toLowerCase())
                }
                options={leaveOptions}
                className="w-full h-12"
                onChange={(value) => setLeaveTypeId(value)}
              />
            </Form.Item>
            <Form.Item name="date" className="w-full col-span-3">
              <DatePicker.RangePicker
                allowClear
                className="w-full h-12"
                onChange={(value) => {
                  if (value) {
                    setStartDate(value[0] ? value[0].format('YYYY-MM-DD') : '');
                    setEndDate(value[1] ? value[1].format('YYYY-MM-DD') : '');
                  } else {
                    setStartDate('');
                    setEndDate('');
                  }
                }}
              />
            </Form.Item>
          </Form>
        </div>

        {/* Mobile Filters */}
        <div className="md:hidden">
          <div className="flex justify-between gap-4 w-full mb-4">
            <div className="flex-1">
              <Select
                showSearch
                placeholder="Search Employee"
                className="w-full h-12"
                allowClear
                onChange={(value: any) => setUserIdOnLeaveBalance(value)}
                filterOption={(input: any, option: any) =>
                  (option?.label ?? '')
                    ?.toLowerCase()
                    .includes(input.toLowerCase())
                }
                options={employeeOptions}
              />
            </div>
            <div>
              <CustomButton
                type="default"
                size="small"
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 border rounded-lg h-10"
                title=""
                icon={<LuSettings2 size={20} />}
              />
            </div>
          </div>
        </div>

        {/* Leave Balance Cards */}
        <div className="flex gap-3 sm:gap-4 overflow-x-auto scrollbar-none pb-2">
          {leaveBalanceLoading && <Skeleton active />}
          {leaveBalance?.items?.items?.map((item: any, index: number) => (
            <Card
              bodyStyle={{ padding: '10px' }}
              key={index}
              className={`${leaveTypeId === item.leaveTypeId ? 'min-w-[209px] min-h-[102px]' : 'shadow-md min-w-[213px] min-h-[106px]'}`}
              onClick={() =>
                leaveTypeId
                  ? setLeaveTypeId('')
                  : setLeaveTypeId(item.leaveTypeId)
              }
            >
              <div className="flex justify-between items-center py-5 cursor-pointer">
                <div>
                  <Tooltip title={item.leaveType.title}>
                    <p className="font-bold text-xs capitalize mb-1">
                      {item.leaveType.title?.slice(0, 15)}...
                    </p>
                  </Tooltip>
                  <Tag
                    className={`font-bold border-none py-0.5 ${
                      item.leaveType.isFixed
                        ? 'bg-[#B2B2FF] text-[#3636F0]'
                        : 'bg-[#55C79033] text-[#0CAF60]'
                    }`}
                  >
                    {item.leaveType.isFixed ? 'Fixed' : 'Incremental'}
                  </Tag>
                </div>
                <div className="">
                  <div className="text-xl font-bold text-[#3636F0] ">
                    <span className="">{Math.round(item.totalBalance)}</span>
                    <span className="text-[10px] mr-2 font-bold ">days</span>
                  </div>
                  <div className="text-sm font-medium text-black ">
                    Avaliable
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Entitlement and Utilization */}
        <div className="grid grid-cols-12 gap-4 mt-4">
          <Card
            bodyStyle={{ padding: '0px' }}
            className="shadow-sm rounded-lg md:col-span-3 col-span-12 h-fit"
            loading={userLeaveBalanceLoading}
          >
            <div className="flex md:flex-col flex-row">
              <div className="py-4  md:border-b border-r border[3px] border-gray-200">
                <div className="flex items-center justify-center md:gap-4 gap-2 md:px-4 px-2">
                  <span className="md:text-[16px] text-[10px] text-black font-medium text-right md:w-32">
                    Entitled
                  </span>
                  <span className="md:text-[16px] text-[14px] font-bold text-black md:w-20">
                    {Number(
                      userLeaveBalance?.data?.totals?.totalEntitledDays,
                    )?.toLocaleString() || 0}
                  </span>
                </div>
              </div>
              <div className="py-4  md:border-b border-r border[3px] border-gray-200">
                <div className="flex items-center justify-center md:gap-4 gap-2 md:px-4 px-2">
                  <span className="md:text-[16px] text-[10px] text-black font-medium text-right md:w-32">
                    Accured
                  </span>
                  <span className="md:text-[16px] text-[14px] font-bold text-black md:w-20">
                    {Number(
                      userLeaveBalance?.data?.totals?.totalAccrued,
                    )?.toLocaleString() || 0}
                  </span>
                </div>
              </div>
              <div className="py-4  md:border-b border-r border[3px] border-gray-200">
                <div className="flex items-center justify-center md:gap-4 gap-2 md:px-4 px-2">
                  <span className="md:text-[16px] text-[10px] text-black font-medium text-right md:w-32">
                    Carried over
                  </span>
                  <span className="md:text-[16px] text-[14px] font-bold text-black md:w-20">
                    {Number(
                      userLeaveBalance?.data?.totals?.totalCarriedOver,
                    )?.toLocaleString() || 0}
                  </span>
                </div>
              </div>
              <div className="py-4">
                <div className="flex items-center justify-center md:gap-4 gap-2 md:px-4 px-2  ">
                  <span className="md:text-[16px] text-[10px] text-black font-medium text-right md:w-32">
                    Total Utilized
                  </span>
                  <span className="md:text-[16px] text-[14px] font-bold text-black md:w-20">
                    {Number(
                      userLeaveBalance?.data?.totals?.totalUtilizedLeaves,
                    )?.toLocaleString() || 0}
                  </span>
                </div>
              </div>
            </div>
          </Card>

        <Card
          bodyStyle={{ padding: '16px 24px' }}
          className="shadow-sm col-span-9 mb-5"
          title={
            <span className="text-[12px] font-bold text-black">
              Utilization
            </span>
          }
          id="time-attendance-user-leave-balance-utilization-card"
          data-cy="time-attendance-user-leave-balance-utilization-card"
        >
          <Spin
            spinning={userLeaveBalanceLoading}
            data-cy="time-attendance-user-leave-balance-utilization-spin"
          >
            <div
              className="flex flex-col space-y-2 h-[440px] overflow-y-auto scrollbar-none pr-2"
              id="time-attendance-user-leave-balance-utilization-scroll-div"
              data-cy="time-attendance-user-leave-balance-utilization-scroll-div"
            >
              {userLeaveBalanceLoading && (
                <Skeleton
                  active
                  data-cy="time-attendance-user-leave-balance-utilization-skeleton"
                />
              )}
              {userLeaveBalance?.data?.utilizedLeaves.length > 0 ? (
                userLeaveBalance?.data?.utilizedLeaves.map((leave: any) => (
                  <div
                    key={leave.leaveRequestId}
                    className="border border-gray-200 rounded-xl pb-1"
                    id={`time-attendance-user-leave-balance-utilization-card-${leave.leaveRequestId}`}
                    data-cy={`time-attendance-user-leave-balance-utilization-card-${leave.leaveRequestId}`}
                  >
                    <div
                      className="flex items-start justify-between px-4 py-2"
                      id={`time-attendance-user-leave-balance-utilization-card-${leave.leaveRequestId}-content-div`}
                      data-cy={`time-attendance-user-leave-balance-utilization-card-${leave.leaveRequestId}-content-div`}
                    >
                      <div
                        className="space-y-1"
                        id={`time-attendance-user-leave-balance-utilization-card-${leave.leaveRequestId}-details-column`}
                        data-cy={`time-attendance-user-leave-balance-utilization-card-${leave.leaveRequestId}-details-column`}
                      >
                        <div
                          className="flex items-center"
                          id={`time-attendance-user-leave-balance-utilization-card-${leave.leaveRequestId}-days-row`}
                          data-cy={`time-attendance-user-leave-balance-utilization-card-${leave.leaveRequestId}-days-row`}
                        >
                          <span
                            className="text-[16px] font-bold text-black"
                            id={`time-attendance-user-leave-balance-utilization-card-${leave.leaveRequestId}-days-text`}
                            data-cy={`time-attendance-user-leave-balance-utilization-card-${leave.leaveRequestId}-days-text`}
                          >
                            {leave.totalDays}{' '}
                            {leave.totalDays > 1 ? 'Days' : 'Day'}
                          </span>
                        </div>
                        <p
                          className="text-[14px] text-[#111827] font-regular"
                          id={`time-attendance-user-leave-balance-utilization-card-${leave.leaveRequestId}-date-range-text`}
                          data-cy={`time-attendance-user-leave-balance-utilization-card-${leave.leaveRequestId}-date-range-text`}
                        >
                          {dayjs(leave.startDate).format('DD MMM YYYY')} -{' '}
                          {dayjs(leave.endDate).format('DD MMM YYYY')}
                        </p>
                      </div>
                      <div
                        className="text-right space-y-1"
                        id={`time-attendance-user-leave-balance-utilization-card-${leave.leaveRequestId}-meta-column`}
                        data-cy={`time-attendance-user-leave-balance-utilization-card-${leave.leaveRequestId}-meta-column`}
                      >
                        <p
                          className="text-[14px] text-[#111827] font-regular"
                          id={`time-attendance-user-leave-balance-utilization-card-${leave.leaveRequestId}-requested-text`}
                          data-cy={`time-attendance-user-leave-balance-utilization-card-${leave.leaveRequestId}-requested-text`}
                        >
                          Requested:{' '}
                          {dayjs(leave.createdAt).format('DD MMM YYYY')}
                        </p>
                        <Tag
                          style={{ marginInlineEnd: 0 }}
                          className={`${
                            statusColors[leave.status.toLowerCase()] ||
                            'text-gray-500 bg-gray-500/20'
                          } font-bold border-none text-[12px] px-3 py-0.5  h-6 rounded-md capitalize`}
                          id={`time-attendance-user-leave-balance-utilization-card-${leave.leaveRequestId}-status-tag`}
                          data-cy={`time-attendance-user-leave-balance-utilization-card-${leave.leaveRequestId}-status-tag`}
                        >
                          {leave.status}
                        </Tag>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex justify-center items-center h-96">
                    <p className="text-gray-500 text-[14px] font-medium">
                      No Record Found
                    </p>
                  </div>
                ))
              ) : (
                <div
                  className="flex justify-center items-center h-96"
                  id="time-attendance-user-leave-balance-utilization-empty-div"
                  data-cy="time-attendance-user-leave-balance-utilization-empty-div"
                >
                  <p
                    className="text-gray-500 text-[14px] font-medium"
                    id="time-attendance-user-leave-balance-utilization-empty-text"
                    data-cy="time-attendance-user-leave-balance-utilization-empty-text"
                  >
                    No Record Found
                  </p>
                </div>
              )}
            </div>
          </Spin>
        </Card>
      </div>

      {/* Mobile Filter Modal */}
      <Modal
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={
          <div className="flex gap-2 justify-center mt-4">
            <CustomButton
              onClick={() => setIsModalOpen(false)}
              className="px-6 py-2 border rounded-lg text-sm text-gray-900"
              title="Cancel"
              type="default"
            />
            <CustomButton
              title="Apply Filter"
              type="primary"
              onClick={() => {
                setIsModalOpen(false);
              }}
              className="px-6 py-2 text-white rounded-lg text-sm"
            />
          </div>
        }
        className="!m-4 md:hidden"
        style={{
          top: '20%',
          transform: 'translateY(-50%)',
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
        width="90%"
        centered
      >
        <MobileFilterContent />
      </Modal>
    </div>
  );
};

export default UserLeaveBalance;
