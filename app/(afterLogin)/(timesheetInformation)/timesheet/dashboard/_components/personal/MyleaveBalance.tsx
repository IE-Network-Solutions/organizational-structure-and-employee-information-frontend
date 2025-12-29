import { Card, Select, Skeleton, Spin, Tag, Tooltip } from 'antd';
import React from 'react';
import { useGetUserLeaveBalance } from '@/store/server/features/timesheet/dashboard/queries';
import { TimeAndAttendaceDashboardStore } from '@/store/uistate/features/timesheet/dashboard';
import { useGetLeaveBalance } from '@/store/server/features/timesheet/leaveBalance/queries';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import dayjs from 'dayjs';
import { useGetLeaveBalanceExpiring } from '@/store/server/features/timesheet/leaveExpiry/queries';
const MyleaveBalance: React.FC = () => {
  const { userId } = useAuthenticationStore();

  const {
    leaveTypeId,
    startDate,
    endDate,
    setLeaveTypeId,
    monthsAheadOnLeaveBalanceExpiring,
    setMonthsAheadOnLeaveBalanceExpiring,
  } = TimeAndAttendaceDashboardStore();
  const { data: userLeaveBalance, isLoading: userLeaveBalanceLoading } =
    useGetUserLeaveBalance(
      userId as string,
      leaveTypeId || '',
      startDate || '',
      endDate || '',
    );
  const { data: leaveBalance, isLoading: leaveBalanceLoading } =
    useGetLeaveBalance(userId as string, '');
  const { data: leaveBalanceExpiring, isLoading: leaveBalanceExpiringLoading } =
    useGetLeaveBalanceExpiring(
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

  return (
    <div
      id="time-attendance-personal-leave-balance-container-view"
      data-cy="time-attendance-personal-leave-balance-container-view"
    >
      <h2
        className="text-[24px] font-bold mb-4"
        id="time-attendance-personal-leave-balance-title-heading"
        data-cy="time-attendance-personal-leave-balance-title-heading"
      >
        My Leave Balance
      </h2>
      <div
        className="flex gap-4 overflow-x-auto scrollbar-none pb-2"
        id="time-attendance-personal-leave-balance-cards-container"
        data-cy="time-attendance-personal-leave-balance-cards-container"
      >
        {leaveBalanceLoading && (
          <Skeleton
            active
            data-cy="time-attendance-personal-leave-balance-cards-skeleton"
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
            id={`time-attendance-personal-leave-balance-card-${index}-display-card`}
            data-cy={`time-attendance-personal-leave-balance-card-${index}-display-card`}
          >
            <div
              className="flex justify-between items-center py-5 cursor-pointer"
              id={`time-attendance-personal-leave-balance-card-${index}-content-row`}
              data-cy={`time-attendance-personal-leave-balance-card-${index}-content-row`}
            >
              <div
                id={`time-attendance-personal-leave-balance-card-${index}-info-column`}
                data-cy={`time-attendance-personal-leave-balance-card-${index}-info-column`}
              >
                <Tooltip
                  title={item.leaveType.title}
                  id={`time-attendance-personal-leave-balance-card-${index}-title-tooltip`}
                  data-cy={`time-attendance-personal-leave-balance-card-${index}-title-tooltip`}
                >
                  <p
                    className="font-bold text-xs capitalize mb-1"
                    id={`time-attendance-personal-leave-balance-card-${index}-title-text`}
                    data-cy={`time-attendance-personal-leave-balance-card-${index}-title-text`}
                  >
                    {item.leaveType.title?.slice(0, 15)}...
                  </p>
                </Tooltip>
                <Tag
                  className={`font-bold border-none py-0.5 ${
                    item?.leaveType?.isFixed
                      ? 'bg-[#B2B2FF] text-[#3636F0]'
                      : 'bg-[#55C79033] text-[#0CAF60]'
                  }`}
                  id={`time-attendance-personal-leave-balance-card-${index}-type-tag`}
                  data-cy={`time-attendance-personal-leave-balance-card-${index}-type-tag`}
                >
                  {item?.leaveType?.isFixed ? 'Fixed' : 'Incremental'}
                </Tag>
              </div>
              <div
                className=""
                id={`time-attendance-personal-leave-balance-card-${index}-balance-column`}
                data-cy={`time-attendance-personal-leave-balance-card-${index}-balance-column`}
              >
                <div
                  className="text-xl font-bold text-[#3636F0] "
                  id={`time-attendance-personal-leave-balance-card-${index}-balance-value`}
                  data-cy={`time-attendance-personal-leave-balance-card-${index}-balance-value`}
                >
                  <span
                    className=""
                    id={`time-attendance-personal-leave-balance-card-${index}-balance-days-number`}
                    data-cy={`time-attendance-personal-leave-balance-card-${index}-balance-days-number`}
                  >
                    {Math.round(item.totalBalance)}
                  </span>
                  <span
                    className="text-[10px] mr-2 font-bold "
                    id={`time-attendance-personal-leave-balance-card-${index}-balance-days-label`}
                    data-cy={`time-attendance-personal-leave-balance-card-${index}-balance-days-label`}
                  >
                    days
                  </span>
                </div>
                <div
                  className="text-sm font-medium text-black "
                  id={`time-attendance-personal-leave-balance-card-${index}-availability-text`}
                  data-cy={`time-attendance-personal-leave-balance-card-${index}-availability-text`}
                >
                  Avaliable
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
      {/* Entitlement and Utilization */}
      <div
        className="grid grid-cols-12 gap-4 mt-4"
        id="time-attendance-personal-leave-balance-summary-grid"
        data-cy="time-attendance-personal-leave-balance-summary-grid"
      >
        <Card
          bodyStyle={{ padding: '0px' }}
          className="shadow-sm rounded-lg md:col-span-3 col-span-12 h-fit"
          loading={userLeaveBalanceLoading}
          id="time-attendance-personal-leave-balance-totals-card"
          data-cy="time-attendance-personal-leave-balance-totals-card"
        >
          <div
            className="flex flex-col"
            id="time-attendance-personal-leave-balance-totals-column"
            data-cy="time-attendance-personal-leave-balance-totals-column"
          >
            <div
              className="py-4 border-b border[3px] border-gray-200"
              id="time-attendance-personal-leave-balance-entitled-row"
              data-cy="time-attendance-personal-leave-balance-entitled-row"
            >
              <div
                className="flex items-center justify-center gap-4 px-4"
                id="time-attendance-personal-leave-balance-entitled-content"
                data-cy="time-attendance-personal-leave-balance-entitled-content"
              >
                <span
                  className="text-[16px] text-black font-medium text-right w-32"
                  id="time-attendance-personal-leave-balance-entitled-label"
                  data-cy="time-attendance-personal-leave-balance-entitled-label"
                >
                  Entitled
                </span>
                <span
                  className="text-[16px] font-bold text-black w-20"
                  id="time-attendance-personal-leave-balance-entitled-value"
                  data-cy="time-attendance-personal-leave-balance-entitled-value"
                >
                  {Number(
                    userLeaveBalance?.data?.totals?.totalEntitledDays,
                  )?.toLocaleString() || 0}
                </span>
              </div>
            </div>
            <div
              className="py-4 border-b border[3px] border-gray-200"
              id="time-attendance-personal-leave-balance-accured-row"
              data-cy="time-attendance-personal-leave-balance-accured-row"
            >
              <div
                className="flex items-center justify-center gap-4 px-4"
                id="time-attendance-personal-leave-balance-accured-content"
                data-cy="time-attendance-personal-leave-balance-accured-content"
              >
                <span
                  className="text-[16px] text-black font-medium text-right w-32"
                  id="time-attendance-personal-leave-balance-accured-label"
                  data-cy="time-attendance-personal-leave-balance-accured-label"
                >
                  Accured
                </span>
                <span
                  className="text-[16px] font-bold text-black w-20"
                  id="time-attendance-personal-leave-balance-accured-value"
                  data-cy="time-attendance-personal-leave-balance-accured-value"
                >
                  {Number(
                    userLeaveBalance?.data?.totals?.totalAccrued,
                  )?.toLocaleString() || 0}
                </span>
              </div>
            </div>
            <div
              className="py-4 border-b border[3px] border-gray-200"
              id="time-attendance-personal-leave-balance-carried-row"
              data-cy="time-attendance-personal-leave-balance-carried-row"
            >
              <div
                className="flex items-center justify-center gap-4 px-4"
                id="time-attendance-personal-leave-balance-carried-content"
                data-cy="time-attendance-personal-leave-balance-carried-content"
              >
                <span
                  className="text-[16px] text-black font-medium text-right w-32"
                  id="time-attendance-personal-leave-balance-carried-label"
                  data-cy="time-attendance-personal-leave-balance-carried-label"
                >
                  Carried over
                </span>
                <span
                  className="text-[16px] font-bold text-black w-20"
                  id="time-attendance-personal-leave-balance-carried-value"
                  data-cy="time-attendance-personal-leave-balance-carried-value"
                >
                  {Number(
                    userLeaveBalance?.data?.totals?.totalCarriedOver,
                  )?.toLocaleString() || 0}
                </span>
              </div>
            </div>
            <div
              className="py-4 md:border-b border-r border[3px] border-gray-200"
              id="time-attendance-personal-leave-balance-utilized-row"
              data-cy="time-attendance-personal-leave-balance-utilized-row"
            >
              <div
                className="flex items-center justify-center gap-4 px-4"
                id="time-attendance-personal-leave-balance-utilized-content"
                data-cy="time-attendance-personal-leave-balance-utilized-content"
              >
                <span
                  className="text-[16px] text-black font-medium text-right w-32"
                  id="time-attendance-personal-leave-balance-utilized-label"
                  data-cy="time-attendance-personal-leave-balance-utilized-label"
                >
                  Total Utilized
                </span>
                <span
                  className="text-[16px] font-bold text-black w-20"
                  id="time-attendance-personal-leave-balance-utilized-value"
                  data-cy="time-attendance-personal-leave-balance-utilized-value"
                >
                  {Number(
                    userLeaveBalance?.data?.totals?.totalUtilizedLeaves,
                  )?.toLocaleString() || 0}
                </span>
              </div>
            </div>
            <div
              className="py-4"
              id="time-attendance-personal-leave-balance-expiring-row"
              data-cy="time-attendance-personal-leave-balance-expiring-row"
            >
              <div
                className="flex items-center justify-center md:gap-4 gap-2 md:px-4 px-2  "
                id="time-attendance-personal-leave-balance-expiring-content"
                data-cy="time-attendance-personal-leave-balance-expiring-content"
              >
                <span
                  className="md:text-[16px] text-[10px] text-black font-medium text-right md:w-32"
                  id="time-attendance-personal-leave-balance-expiring-label"
                  data-cy="time-attendance-personal-leave-balance-expiring-label"
                >
                  About to expire
                </span>
                <span
                  className="md:text-[16px] text-[14px] font-bold text-black md:w-20"
                  id="time-attendance-personal-leave-balance-expiring-value"
                  data-cy="time-attendance-personal-leave-balance-expiring-value"
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
                id="time-attendance-personal-leave-balance-expiring-select-row"
                data-cy="time-attendance-personal-leave-balance-expiring-select-row"
              >
                <Select
                  loading={leaveBalanceExpiringLoading}
                  value={Number(monthsAheadOnLeaveBalanceExpiring)}
                  size="small"
                  className="w-30"
                  onSelect={(value: number) => {
                    setMonthsAheadOnLeaveBalanceExpiring(String(value));
                  }}
                  id="time-attendance-personal-leave-balance-expiring-select"
                  data-cy="time-attendance-personal-leave-balance-expiring-select"
                >
                  {/*  eslint-disable-next-line @typescript-eslint/naming-convention */}
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                    /*  eslint-enable-next-line @typescript-eslint/naming-convention */
                    <Select.Option
                      key={month}
                      value={month}
                      label={`${month} ${month === 1 ? 'Month' : 'Months'}`}
                      id={`time-attendance-personal-leave-balance-expiring-option-${month}`}
                      data-cy={`time-attendance-personal-leave-balance-expiring-option-${month}`}
                    >
                      In {month} {month === 1 ? 'Month' : 'Months'}
                    </Select.Option>
                  ))}
                </Select>
              </div>
            </div>
          </div>
        </Card>

        {/* Utilization Card */}
        <Card
          bodyStyle={{ padding: '16px 20px' }}
          className="shadow-sm md:col-span-9 col-span-12 mb-5"
          title={
            <span
              id="time-attendance-personal-leave-balance-utilization-title-text"
              data-cy="time-attendance-personal-leave-balance-utilization-title-text"
              className="text-[12px] font-bold text-black"
            >
              Utilization
            </span>
          }
          id="time-attendance-personal-leave-balance-utilization-card"
          data-cy="time-attendance-personal-leave-balance-utilization-card"
        >
          <Spin
            spinning={userLeaveBalanceLoading}
            data-cy="time-attendance-personal-leave-balance-utilization-spin"
          >
            <div
              className="flex flex-col space-y-2 h-36 overflow-y-auto scrollbar-none pr-2"
              id="time-attendance-personal-leave-balance-utilization-scroll"
              data-cy="time-attendance-personal-leave-balance-utilization-scroll"
            >
              {userLeaveBalanceLoading && (
                <Skeleton
                  active
                  data-cy="time-attendance-personal-leave-balance-utilization-skeleton"
                />
              )}
              {userLeaveBalance?.data?.utilizedLeaves.length > 0 ? (
                userLeaveBalance?.data?.utilizedLeaves.map((leave: any) => (
                  <div
                    key={leave.leaveRequestId}
                    className="border border-gray-200 rounded-xl pb-1"
                    id={`time-attendance-personal-leave-balance-utilization-record-${leave.leaveRequestId}`}
                    data-cy={`time-attendance-personal-leave-balance-utilization-record-${leave.leaveRequestId}`}
                  >
                    <div
                      className="flex items-start justify-between px-4 py-2"
                      id={`time-attendance-personal-leave-balance-utilization-record-${leave.leaveRequestId}-content-row`}
                      data-cy={`time-attendance-personal-leave-balance-utilization-record-${leave.leaveRequestId}-content-row`}
                    >
                      <div
                        className="space-y-1"
                        id={`time-attendance-personal-leave-balance-utilization-record-${leave.leaveRequestId}-details-column`}
                        data-cy={`time-attendance-personal-leave-balance-utilization-record-${leave.leaveRequestId}-details-column`}
                      >
                        <div
                          className="flex items-center"
                          id={`time-attendance-personal-leave-balance-utilization-record-${leave.leaveRequestId}-days-row`}
                          data-cy={`time-attendance-personal-leave-balance-utilization-record-${leave.leaveRequestId}-days-row`}
                        >
                          <span
                            className="text-[16px] font-bold text-black"
                            id={`time-attendance-personal-leave-balance-utilization-record-${leave.leaveRequestId}-days-text`}
                            data-cy={`time-attendance-personal-leave-balance-utilization-record-${leave.leaveRequestId}-days-text`}
                          >
                            {leave.totalDays}{' '}
                            {leave.totalDays > 1 ? 'Days' : 'Day'}
                          </span>
                        </div>
                        <p
                          className="text-[14px] text-[#111827] font-regular"
                          id={`time-attendance-personal-leave-balance-utilization-record-${leave.leaveRequestId}-date-range-text`}
                          data-cy={`time-attendance-personal-leave-balance-utilization-record-${leave.leaveRequestId}-date-range-text`}
                        >
                          {dayjs(leave.startDate).format('DD MMM YYYY')} -{' '}
                          {dayjs(leave.endDate).format('DD MMM YYYY')}
                        </p>
                      </div>
                      <div
                        className="text-right space-y-1"
                        id={`time-attendance-personal-leave-balance-utilization-record-${leave.leaveRequestId}-meta-column`}
                        data-cy={`time-attendance-personal-leave-balance-utilization-record-${leave.leaveRequestId}-meta-column`}
                      >
                        <p
                          className="text-[14px] text-[#111827] font-regular"
                          id={`time-attendance-personal-leave-balance-utilization-record-${leave.leaveRequestId}-requested-text`}
                          data-cy={`time-attendance-personal-leave-balance-utilization-record-${leave.leaveRequestId}-requested-text`}
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
                          id={`time-attendance-personal-leave-balance-utilization-record-${leave.leaveRequestId}-status-tag`}
                          data-cy={`time-attendance-personal-leave-balance-utilization-record-${leave.leaveRequestId}-status-tag`}
                        >
                          {leave.status}
                        </Tag>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div
                  className="flex justify-center items-center h-96"
                  id="time-attendance-personal-leave-balance-utilization-empty-state"
                  data-cy="time-attendance-personal-leave-balance-utilization-empty-state"
                >
                  <p
                    className="text-gray-500 text-[14px] font-medium"
                    id="time-attendance-personal-leave-balance-utilization-empty-text"
                    data-cy="time-attendance-personal-leave-balance-utilization-empty-text"
                  >
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

export default MyleaveBalance;
