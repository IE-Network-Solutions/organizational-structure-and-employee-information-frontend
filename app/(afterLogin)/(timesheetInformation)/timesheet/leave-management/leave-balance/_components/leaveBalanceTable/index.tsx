'use client';
import { useLeaveBalanceStore } from '@/store/uistate/features/timesheet/leaveBalance';
import { useGetLeaveBalance } from '@/store/server/features/timesheet/leaveBalance/queries';
import EmptyState from '@/components/empty';

const LEAVE_BALANCE_CARD_SKELETON_KEYS = [0, 1, 2, 3, 4, 5] as const;

const LeaveBalanceCardSkeleton: React.FC<{ index: number }> = ({ index }) => (
  <div
    className="animate-pulse rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
    id={`time-attendance-leave-balance-card-skeleton-${index}`}
    data-cy={`time-attendance-leave-balance-card-skeleton-${index}`}
    aria-hidden
  >
    <div
      data-cy="time-attendance-leave-balance-card-skeleton-header"
      className="mb-3 flex items-center justify-between gap-2"
    >
      <div
        data-cy="time-attendance-leave-balance-card-skeleton-header-left"
        className="h-5 w-full max-w-[200px] rounded bg-gray-200"
      />
    </div>

    <div
      data-cy="time-attendance-leave-balance-card-skeleton-stats"
      className="mb-2 flex justify-between gap-2"
    >
      <div
        data-cy="time-attendance-leave-balance-card-skeleton-stats-left"
        className="flex flex-1 flex-col gap-1"
      >
        <div
          data-cy="time-attendance-leave-balance-card-skeleton-stats-left-value"
          className="h-7 w-40 max-w-[85%] rounded bg-gray-200"
        />
      </div>
      <div
        data-cy="time-attendance-leave-balance-card-skeleton-stats-right-value"
        className="h-5 w-28 shrink-0 self-end rounded bg-gray-200"
      />
    </div>

    <div
      data-cy="time-attendance-leave-balance-card-skeleton-progress"
      className="mb-4 h-2 w-full rounded-full bg-gray-200"
    />

    <div
      data-cy="time-attendance-leave-balance-card-skeleton-stats-grid"
      className="grid grid-cols-4 gap-2 text-center"
    >
      {[0, 1, 2, 3].map((col) => (
        <div
          key={col}
          data-cy={`time-attendance-leave-balance-card-skeleton-stats-grid-item-${col}`}
          className="flex flex-col items-center gap-2"
        >
          <div
            data-cy={`time-attendance-leave-balance-card-skeleton-stats-grid-item-${col}-value`}
            className="h-5 w-10 rounded bg-gray-200"
          />
          <div
            data-cy={`time-attendance-leave-balance-card-skeleton-stats-grid-item-${col}-label`}
            className="h-3 w-16 rounded bg-gray-200"
          />
        </div>
      ))}
    </div>
  </div>
);

const LeaveBalanceTable: React.FC = () => {
  const { selectedUserId, leaveTypeId } = useLeaveBalanceStore();
  const { data: leaveBalanceData, isLoading: leaveBalanceIsLoading } =
    useGetLeaveBalance(selectedUserId, leaveTypeId);

  let itemsArray: any[] = [];
  if (Array.isArray(leaveBalanceData?.items)) {
    itemsArray = leaveBalanceData.items;
  } else if (
    leaveBalanceData?.items &&
    typeof leaveBalanceData.items === 'object' &&
    Array.isArray((leaveBalanceData.items as any)?.items)
  ) {
    itemsArray = (leaveBalanceData.items as any).items;
  }
  const dataSource = itemsArray.map((item, index) => {
    // Get cash value directly from the item
    const cashValue = item?.cashValue || 0;
    return {
      key: index,
      userId: item?.userId,
      leaveType: item?.leaveType?.title || '-',
      accrued: parseFloat(item?.accrued.toFixed(1)) || 0,
      balance: parseFloat(item?.balance.toFixed(1)) || 0,
      carriedOver: parseFloat(item?.carriedOver.toFixed(1)) || 0,
      totalBalance: parseFloat(item?.totalBalance.toFixed(1)) || 0,
      utilizedLeave: parseFloat(item?.utilizedLeave.toFixed(1)) || 0,
      cashValue: parseFloat(cashValue.toFixed(2)),
    };
  });
  const employeeId =
    dataSource?.[0]?.userId || leaveBalanceData?.items?.items?.[0]?.userId;

  return (
    <>
      {employeeId && (
        <div
          id="time-attendance-leave-balance-employee-summary"
          data-cy="time-attendance-leave-balance-employee-summary"
        >
          {/* <EmpRender userId={employeeId} /> */}
        </div>
      )}
      <div
        className="w-full rounded-lg border border-gray-200 p-3 mt-2"
        id="time-attendance-leave-balance-table-scroll-wrapper"
        data-cy="time-attendance-leave-balance-table-scroll-wrapper"
      >
        {leaveBalanceIsLoading ? (
          <div
            className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3"
            id="time-attendance-leave-balance-cards-skeleton-grid"
            data-cy="time-attendance-leave-balance-cards-skeleton-grid"
          >
            {LEAVE_BALANCE_CARD_SKELETON_KEYS.map((i) => (
              <LeaveBalanceCardSkeleton key={i} index={i} />
            ))}
          </div>
        ) : (
          <div
            id="time-attendance-leave-balance-table"
            data-cy="time-attendance-leave-balance-table"
          >
            {!selectedUserId ? (
              <h3
                className="py-8 text-center text-gray-500"
                data-cy="leave-balance-select-user-empty-state"
              >
                <EmptyState
                  title="Please Select User"
                  description="Please select a user to view leave balance"
                />
              </h3>
            ) : dataSource.length === 0 ? (
              <h3
                className="py-8 text-center text-gray-500"
                data-cy="leave-balance-no-data-empty-state"
              >
                No leave balance found
              </h3>
            ) : (
              <div
                className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3"
                id="time-attendance-leave-balance-cards-grid"
                data-cy="time-attendance-leave-balance-cards-grid"
              >
                {dataSource.map((item) => {
                  const progressPercent =
                    item.totalBalance > 0
                      ? Math.min(
                          (item.utilizedLeave /
                            (item.totalBalance + item.utilizedLeave)) *
                            100,
                          100,
                        )
                      : 0;

                  return (
                    <div
                      key={item.key}
                      className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
                      id={`time-attendance-leave-balance-card-${item.key}`}
                      data-cy={`time-attendance-leave-balance-card-${item.key}`}
                    >
                      <div
                        data-cy="time-attendance-leave-balance-card-header"
                        className="mb-3 flex items-center justify-between gap-2"
                      >
                        <h3
                          data-cy="time-attendance-leave-balance-card-header-title"
                          className="text-base font-bold text-black"
                        >
                          {item.leaveType}
                        </h3>
                      </div>

                      <div
                        data-cy="time-attendance-leave-balance-card-stats"
                        className="flex justify-between mb-2 "
                      >
                        <span
                          data-cy="time-attendance-leave-balance-card-stats-total-balance"
                          className="text-[20px] font-bold leading-none text-black opacity-65"
                        >
                          {item.totalBalance}
                          <span
                            data-cy="time-attendance-leave-balance-card-stats-total-balance-label"
                            className="ml-1 text-sm font-normal text-black opacity-65"
                          >
                            Days net balance
                          </span>
                        </span>
                        <span
                          data-cy="time-attendance-leave-balance-card-stats-entitled"
                          className="text-sm font-bold text-black opacity-70"
                        >
                          Entitled: {item.totalBalance + item.utilizedLeave}
                        </span>
                      </div>

                      <div
                        data-cy="time-attendance-leave-balance-card-progress"
                        className="mb-4 h-2 w-full rounded-full bg-gray-200"
                      >
                        <div
                          data-cy="time-attendance-leave-balance-card-progress-bar"
                          className="h-2 rounded-full bg-[#2155CD]"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>

                      <div
                        data-cy="time-attendance-leave-balance-card-stats-grid"
                        className="grid grid-cols-4 gap-2 text-center"
                      >
                        <div data-cy="time-attendance-leave-balance-card-stats-grid-item-accrued">
                          <p
                            data-cy="time-attendance-leave-balance-card-stats-grid-item-accrued-value"
                            className="text-base font-bold text-black opacity-70"
                          >
                            {item.accrued}
                          </p>
                          <p
                            data-cy="time-attendance-leave-balance-card-stats-grid-item-accrued-label"
                            className="text-sm font-normal text-black opacity-65"
                          >
                            Accrued
                          </p>
                        </div>
                        <div data-cy="time-attendance-leave-balance-card-stats-grid-item-carried-over">
                          <p
                            data-cy="time-attendance-leave-balance-card-stats-grid-item-carried-over-value"
                            className="text-base font-bold text-black opacity-70"
                          >
                            {item.carriedOver}
                          </p>
                          <p
                            data-cy="time-attendance-leave-balance-card-stats-grid-item-carried-over-label"
                            className="text-sm font-normal text-black opacity-65"
                          >
                            Carried Over
                          </p>
                        </div>
                        <div data-cy="time-attendance-leave-balance-card-stats-grid-item-utilized-leave">
                          <p
                            data-cy="time-attendance-leave-balance-card-stats-grid-item-utilized-leave-value"
                            className="text-base font-bold text-black opacity-70"
                          >
                            {item.utilizedLeave}
                          </p>
                          <p
                            data-cy="time-attendance-leave-balance-card-stats-grid-item-utilized-leave-label"
                            className="text-sm font-normal text-black opacity-65"
                          >
                            Utilized
                          </p>
                        </div>
                        <div data-cy="time-attendance-leave-balance-card-stats-grid-item-cash-value">
                          <p
                            data-cy="time-attendance-leave-balance-card-stats-grid-item-cash-value-value"
                            className="text-base font-bold text-black opacity-70"
                          >
                            {item.cashValue}
                          </p>
                          <p
                            data-cy="time-attendance-leave-balance-card-stats-grid-item-cash-value-label"
                            className="text-sm font-normal text-black opacity-65"
                          >
                            Cash Value
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default LeaveBalanceTable;
