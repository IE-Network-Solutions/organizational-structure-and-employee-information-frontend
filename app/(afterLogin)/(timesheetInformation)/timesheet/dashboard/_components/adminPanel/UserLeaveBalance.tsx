import {
  Card,
  DatePicker,
  Form,
  Select,
  Skeleton,
  Tag,
  Spin,
  Tooltip,
} from 'antd';
import React from 'react';
import { useSearchParams } from 'next/navigation';
import { useGetUserLeaveBalance } from '@/store/server/features/timesheet/dashboard/queries';
import { useGetLeaveBalance } from '@/store/server/features/timesheet/leaveBalance/queries';
import { TimeAndAttendaceDashboardStore } from '@/store/uistate/features/timesheet/dashboard';
import { useGetEmployees } from '@/store/server/features/employees/employeeManagment/queries';
import dayjs from 'dayjs';

const UserLeaveBalance: React.FC = () => {
  const [form] = Form.useForm();
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
  return (
    <div>
      <Form
        form={form}
        layout="inline"
        className="grid grid-cols-12 gap-4 mb-4"
      >
        <Form.Item name="employee" className="col-span-6 bg-none">
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
          />
        </Form.Item>
        <Form.Item name="type" className="w-full  col-span-3">
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
          />
        </Form.Item>

        <Form.Item name="date" className="w-full  col-span-3 ">
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
          />
        </Form.Item>
      </Form>
      <div className="flex gap-4 overflow-x-auto scrollbar-none pb-2">
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
                <div className="text-sm font-medium text-black ">Avaliable</div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Entitlement and Utilization */}
      <div className="grid grid-cols-12 gap-4 mt-4">
        <Card
          bodyStyle={{ padding: '0px' }}
          className="shadow-sm rounded-lg col-span-3 h-fit"
          loading={userLeaveBalanceLoading}
        >
          <div className="flex flex-col">
            <div className="py-4 border-b border[3px] border-gray-200">
              <div className="flex items-center justify-center gap-4 px-4">
                <span className="text-[16px] text-black font-medium text-right w-32">
                  Entitled
                </span>
                <span className="text-[16px] font-bold text-black w-20">
                  {Number(
                    userLeaveBalance?.data?.totals?.totalEntitledDays,
                  )?.toLocaleString() || 0}
                </span>
              </div>
            </div>
            <div className="py-4 border-b border[3px] border-gray-200">
              <div className="flex items-center justify-center gap-4 px-4">
                <span className="text-[16px] text-black font-medium text-right w-32">
                  Accured
                </span>
                <span className="text-[16px] font-bold text-black w-20">
                  {Number(
                    userLeaveBalance?.data?.totals?.totalAccrued,
                  )?.toLocaleString() || 0}
                </span>
              </div>
            </div>
            <div className="py-4 border-b border[3px] border-gray-200">
              <div className="flex items-center justify-center gap-4 px-4">
                <span className="text-[16px] text-black font-medium text-right w-32">
                  Carried over
                </span>
                <span className="text-[16px] font-bold text-black w-20">

                  {Number(
                    userLeaveBalance?.data?.totals?.totalCarriedOver,
                  )?.toLocaleString() || 0}
                </span>
              </div>
            </div>
            <div className="py-4">
              <div className="flex items-center justify-center gap-4 px-4">
                <span className="text-[16px] text-black font-medium text-right w-32">
                  Total Utilized
                </span>
                <span className="text-[16px] font-bold text-black w-20">
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
        >
          <Spin spinning={userLeaveBalanceLoading}>
            <div className="flex flex-col space-y-2 h-[440px] overflow-y-auto scrollbar-none pr-2">
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
                          <span className="text-[16px] font-bold text-black">
                            {leave.totalDays}{' '}
                            {leave.totalDays > 1 ? 'Days' : 'Day'}
                          </span>
                        </div>
                        <p className="text-[14px] text-[#111827] font-regular">
                          {dayjs(leave.startDate).format('DD MMM YYYY')} -{' '}
                          {dayjs(leave.endDate).format('DD MMM YYYY')}
                        </p>
                      </div>
                      <div className="text-right space-y-1">
                        <p className="text-[14px] text-[#111827] font-regular">
                          Requested:{' '}
                          {dayjs(leave.createdAt).format('DD MMM YYYY')}
                        </p>
                        <Tag
                          style={{ marginInlineEnd: 0 }}
                          className={`${
                            statusColors[leave.status.toLowerCase()] ||
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
  );
};

export default UserLeaveBalance;
