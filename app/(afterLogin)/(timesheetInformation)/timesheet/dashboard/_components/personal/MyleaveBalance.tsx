import { Card, Skeleton, Spin, Tag } from 'antd';
import React from 'react';
import { useGetUserLeaveBalance } from '@/store/server/features/timesheet/dashboard/queries';
import { TimeAndAttendaceDashboardStore } from '@/store/uistate/features/timesheet/dashboard';
import { useGetLeaveBalance } from '@/store/server/features/timesheet/leaveBalance/queries';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';

const MyleaveBalance: React.FC = () => {
  const { userId } = useAuthenticationStore();
  const { leaveTypeId, startDate, endDate, setLeaveTypeId } =
    TimeAndAttendaceDashboardStore();
  const { data: userLeaveBalance, isLoading: userLeaveBalanceLoading } =
    useGetUserLeaveBalance(
      userId as string,
      leaveTypeId || '',
      startDate || '',
      endDate || '',
    );
  const { data: leaveBalance, isLoading: leaveBalanceLoading } =
    useGetLeaveBalance(userId as string, '');
  const statusColors: { [key: string]: string } = {
    approved: 'text-green-500 bg-green-500/20',
    pending: 'text-yellow-500 bg-yellow-500/20',
    rejected: 'text-red-500 bg-red-500/20',
    cancelled: 'text-gray-500 bg-gray-500/20',
  };
  return (
    <div>
      <h2 className="text-lg font-bold mb-2">My Leave Balance</h2>
      <div className="flex gap-4 overflow-x-auto scrollbar-none pb-2">
        {leaveBalanceLoading && <Skeleton active />}
        {leaveBalance?.items?.items?.map((item: any, index: number) => (
          <Card
            bodyStyle={{ padding: '10px' }}
            key={index}
            className={`min-w-60 flex-shrink-0  ${leaveTypeId === item.leaveTypeId ? 'shadow-md' : ''}`}
            onClick={() =>
              leaveTypeId
                ? setLeaveTypeId('')
                : setLeaveTypeId(item.leaveTypeId)
            }
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
          bodyStyle={{ padding: '16px' }}
          className="shadow-sm rounded-lg col-span-3 h-fit"
          loading={userLeaveBalanceLoading}
        >
          <div className="space-y-3">
            <div className="flex items-center gap-4 py-2 border-b border-gray-200">
              <span className="text-sm text-gray-600 text-right w-24">Entitled</span>
              <span className="font-bold text-lg">{userLeaveBalance?.data?.totals?.totalEntitledDays || 0}</span>
            </div>
            <div className="flex items-center gap-4 py-2 border-b border-gray-200">
              <span className="text-sm text-gray-600 text-right w-24">Accrued</span>
              <span className="font-bold text-lg">{userLeaveBalance?.data?.totals?.totalAccrued || 0}</span>
            </div>
            <div className="flex items-center gap-4 py-2 border-b border-gray-200">
              <span className="text-sm text-gray-600 text-right w-24">Carried over</span>
              <span className="font-bold text-lg">{userLeaveBalance?.data?.totals?.totalCarriedOver || 0}</span>
            </div>
            <div className="flex items-center gap-4  py-2">
              <p className="text-sm text-gray-600 text-right w-24">Total Utilized</p>
              <span className="font-bold text-lg">{userLeaveBalance?.data?.totals?.totalUtilizedLeaves || 0}</span>
            </div>
          </div>
        </Card>

        <Card
          bodyStyle={{ padding: '10px' }}
          className="shadow col-span-9 space-y-2 "
          title={" Utilization"}
        >

          <div className="flex flex-col gap-2 h-36 overflow-y-auto scrollbar-none">
            <Spin spinning={userLeaveBalanceLoading}>
              <div className="flex flex-col gap-2 h-36 overflow-y-auto scrollbar-none">
                {userLeaveBalanceLoading && <Skeleton active />}
                {userLeaveBalance?.data?.utilizedLeaves.length > 0 ? (
                  userLeaveBalance?.data?.utilizedLeaves.map((leave: any) => (
                    <div
                      key={leave.leaveRequestId}
                      className="border rounded-md p-2"
                    >
                      <div className="flex flex-row gap-2 items-center justify-between">
                        <div>
                          <p className="text-xs">
                            <b>
                              {leave.totalDays}{' '}
                              {leave.totalDays > 1 ? 'Days' : 'Day'}
                            </b>
                          </p>
                          <p className="text-xs">
                            {new Date(leave.startDate).toLocaleDateString(
                              'en-GB',
                              {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric',
                              },
                            )}{' '}
                            -{' '}
                            {new Date(leave.endDate).toLocaleDateString(
                              'en-GB',
                              {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric',
                              },
                            )}
                          </p>
                        </div>
                        <div className="flex flex-col justify-end items-end">
                          <p className="text-xs">
                            Requested on{' '}
                            <strong>
                              {' '}
                              {new Date(leave.createdAt).toLocaleDateString(
                                'en-GB',
                                {
                                  day: 'numeric',
                                  month: 'long',
                                  year: 'numeric',
                                },
                              )}
                            </strong>{' '}
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
                  <div className="flex justify-center items-center h-36">
                    <p className="text-gray-500 text-[14px] font-semibold">
                      No Recored Found
                    </p>
                  </div>
                )}
              </div>
            </Spin>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default MyleaveBalance;
