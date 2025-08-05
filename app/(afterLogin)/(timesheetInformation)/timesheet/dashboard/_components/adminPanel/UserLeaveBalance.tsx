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
                    className={`font-bold border-none py-0.5 ${item.leaveType.isFixed
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

          {/* Utilization Card */}
          <Card
            bodyStyle={{ padding: '0px' }}
            className="shadow-sm md:col-span-9 col-span-12 mb-5 "
            title={
              <span className="text-xs sm:text-sm font-bold text-black">
                Utilization
              </span>
            }
          >
            <Spin spinning={userLeaveBalanceLoading}>
              <div className="flex flex-col space-y-3 h-64 sm:h-80 lg:h-[440px] overflow-y-auto scrollbar-none md:pr-2 pr-0 md:px-5 px-1 md:py-4 py-2">
                {userLeaveBalanceLoading && <Skeleton active />}
                {userLeaveBalance?.data?.utilizedLeaves.length > 0 ? (
                  userLeaveBalance?.data?.utilizedLeaves.map((leave: any) => (
                    <div
                      key={leave.leaveRequestId}
                      className="border border-gray-200 rounded-xl pb-1"
                    >
                      <div className="flex items-start justify-between px-4 py-2">
                        <div className="space-y-1">
                          <div className="flex items-center">
                            <span className="md:text-[16px] font-bold text-black">
                              {leave.totalDays}{' '}
                              {leave.totalDays > 1 ? 'Days' : 'Day'}
                            </span>
                          </div>
                          <p className="md:text-[14px] text-[12px] text-[#111827] font-regular">
                            {dayjs(leave.startDate).format('DD MMM YYYY')} -{' '}
                            {dayjs(leave.endDate).format('DD MMM YYYY')}
                          </p>
                        </div>
                        <div className="text-right space-y-1">
                          <p className="md:text-[14px] text-[12px] text-[#111827] font-regular">
                            Requested:{' '}
                            {dayjs(leave.createdAt).format('DD MMM YYYY')}
                          </p>
                          <Tag
                            style={{ marginInlineEnd: 0 }}
                            className={`${statusColors[leave.status.toLowerCase()] ||
                              'text-gray-500 bg-gray-500/20'
                              } font-bold border-none text-[12px] px-3 py-0.5  h-6 rounded-md capitalize`}
                          >
                            {leave.status}
                          </Tag>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex justify-center items-center h-96">
                    <p className="text-gray-500 text-[14px] font-medium">
                      No Record Found
                    </p>
                  </div>
                )}
              </div>
            </Spin>
          </Card>
        </div>
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
