import { Card, DatePicker, Form, Input, Select, Skeleton, Tag, Empty, Spin } from 'antd';
import React from 'react';
import { SearchOutlined } from '@ant-design/icons';
import { useSearchParams } from 'next/navigation';
import { useGetUserLeaveBalance } from '@/store/server/features/timesheet/dashboard/queries';
import { useGetLeaveBalance } from '@/store/server/features/timesheet/leaveBalance/queries';
import { TimeAndAttendaceDashboardStore } from '@/store/uistate/features/timesheet/dashboard';
import { useGetEmployees } from '@/store/server/features/employees/employeeManagment/queries';
const { Option } = Select;
const UserLeaveBalance: React.FC = () => {
  const [form] = Form.useForm();
  const searchParams = useSearchParams();
  const userId = searchParams.get('user');
  const { setLeaveTypeId, leaveTypeId, startDate, endDate, setStartDate, setEndDate, setUserIdOnLeaveBalance, userIdOnLeaveBalance } = TimeAndAttendaceDashboardStore();

  const { data: userLeaveBalance, isLoading: userLeaveBalanceLoading } = useGetUserLeaveBalance(userIdOnLeaveBalance ? userIdOnLeaveBalance : userId as string, leaveTypeId || '', startDate || '', endDate || '');
  const { data: leaveBalance, isLoading: leaveBalanceLoading } = useGetLeaveBalance(userIdOnLeaveBalance ? userIdOnLeaveBalance : userId as string, '');
  console.log(userLeaveBalance, 'userLeaveBalance');

  const statusColors: { [key: string]: string } = {
    approved: "text-green-500 bg-green-500/20",
    pending: "text-yellow-500 bg-yellow-500/20",
    rejected: "text-red-500 bg-red-500/20",
    cancelled: "text-gray-500 bg-gray-500/20",
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
        <Form.Item name="employee" className="col-span-6">

          <Select
            showSearch
            placeholder="Select employee"
            allowClear
            filterOption={(input: any, option: any) =>
              (option?.label ?? '')
                ?.toLowerCase()
                .includes(input.toLowerCase())
            }
            options={employeeOptions}

            className='w-full  h-10 '
            onChange={(value: any) => setUserIdOnLeaveBalance(value)}
          />
        </Form.Item>
        <Form.Item name="type" className="w-full  col-span-3">
          <Select
            showSearch
            placeholder="Select Leave Type"
            allowClear
            filterOption={(input: any, option: any) =>
              (option?.label ?? '')
                ?.toLowerCase()
                .includes(input.toLowerCase())
            }
            options={leaveOptions}
            maxTagCount={1}
            className="w-full h-10"
            onChange={(value) => setLeaveTypeId(value)}
          />
        </Form.Item>

        <Form.Item name="date" className="w-full  col-span-3 ">
          <DatePicker.RangePicker
            size="large"
            className="rounded-md w-full h-10"
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
            className={`min-w-60 flex-shrink-0  ${leaveTypeId === item.leaveTypeId ? 'shadow-md' : ''}`}
            onClick={() => leaveTypeId ? setLeaveTypeId('') : setLeaveTypeId(item.leaveTypeId)}
          >
            <div className="flex flex-row justify-between">
              <div>
                <p className="font-medium text-xs">{item.leaveType.title}</p>
                <Tag
                  className={`font-medium border-none ${item.leaveType.isFixed
                    ? 'bg-[#b2b2ff] text-blue'
                    : 'bg-green-200 text-green-700'
                    }`}
                >
                  {item.leaveType.isFixed ? 'Fixed' : 'Incremental'}
                </Tag>
              </div>
              <div className="">
                <div className="text-xl font-semibold text-blue ">
                  <span className="">
                    {Math.round(item.totalBalance * 100) / 100}
                  </span>
                  <span className="text-[10px]">days</span>
                </div>
                <div className="text-sm font-semibold text-black ">
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
          bodyStyle={{ padding: '10px' }}
          className="shadow col-span-3 space-y-2 h-44"
          loading={userLeaveBalanceLoading}
        >
          <div className="flex flex-row gap-2 items-center justify-between border-b border-gray-300 pb-2 mb-2">
            <p className="font-normal text-sm w-28">Entitled</p>
            <p className="font-semibold text-[16px]">{userLeaveBalance?.data?.totals?.totalEntitledDays}</p>
          </div>
          <div className="flex flex-row gap-2 items-center justify-between border-b border-gray-300 pb-2 mb-2">
            <p className="font-normal text-sm w-28">Accrued</p>
            <p className="font-semibold text-[16px]">{userLeaveBalance?.data?.totals?.totalAccrued}</p>
          </div>
          <div className="flex flex-row gap-2 items-center justify-between border-b border-gray-300 pb-2 mb-2 ">
            <p className="font-normal text-sm w-28">Carried over</p>
            <p className="font-semibold text-[16px]">{userLeaveBalance?.data?.totals?.totalCarriedOver}</p>
          </div>
          <div className="flex flex-row gap-2 items-center justify-between border-b border-gray-300 pb-2 mb-2">
            <p className="font-normal text-sm w-28">Total Utilized</p>
            <p className="font-semibold text-[16px]">{userLeaveBalance?.data?.totals?.totalUtilizedLeaves}</p>
          </div>
        </Card>

        <Card
          bodyStyle={{ padding: '10px' }}
          className="shadow col-span-9 space-y-2 "
        >
          <p className="font-medium text-xs mb-2 border-b border-gray-300">
            Utilization
          </p>
          <Spin spinning={userLeaveBalanceLoading}>
            <div className="flex flex-col gap-2 h-96 overflow-y-auto scrollbar-none">
              {userLeaveBalanceLoading && <Skeleton active />}
              {userLeaveBalance?.data?.utilizedLeaves.length > 0 ? (
                userLeaveBalance?.data?.utilizedLeaves.map((leave: any) => (
                  <div key={leave.leaveRequestId} className="border rounded-md p-2">
                    <div className="flex flex-row gap-2 items-center justify-between">
                      <div>
                        <p className="text-xs">
                          <b>{leave.totalDays} {leave.totalDays > 1 ? 'Days' : 'Day'}</b>
                        </p>
                        <p className="text-xs">
                          {new Date(leave.startDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })} - {new Date(leave.endDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                      </div>
                      <div className="flex flex-col justify-end items-end">
                        <p className="text-xs">
                          Requested on <strong> {new Date(leave.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</strong>{' '}
                        </p>
                        <Tag
                          style={{ marginInlineEnd: 0 }}
                          className={`${statusColors[leave.status.toLowerCase()] || 'text-gray-500 bg-gray-500/20'} font-semibold border-none text-xs capitalize`}
                        >
                          {leave.status}
                        </Tag>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className='flex justify-center items-center h-96'>
                  <p className='text-gray-500 text-[14px] font-semibold'>No Recored Found</p>
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
