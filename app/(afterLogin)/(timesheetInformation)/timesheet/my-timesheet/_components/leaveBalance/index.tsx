import LeaveBalanceCard from './balanceCard';
import LeaveBalanceCardSkeleton from './balanceCardSkeleton';

import { useGetLeaveBalance } from '@/store/server/features/timesheet/leaveBalance/queries';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { useIsMobile } from '@/hooks/useIsMobile';

const SKELETON_CARD_COUNT = 3;

const LeaveBalance = () => {
  const { userId } = useAuthenticationStore();
  const { data } = useGetLeaveBalance(userId, '');
  const { isMobile } = useIsMobile();

  const filteredItems =
    data?.items?.items?.filter((item: any) => item.leaveType) || [];
  const hasData = data != null;
  const showSkeleton = !hasData;

  return (
    <>
      <div
        className={`${isMobile ? 'text-sm' : 'text-xl'} font-bold text-gray-900 mb-4`}
        id="time-attendance-leave-balance-title"
        data-cy="time-attendance-leave-balance-title"
      >
        Leave Balance
      </div>
      <div
        className="relative"
        id="time-attendance-leave-balance-swiper-container"
        data-cy="time-attendance-leave-balance-swiper-container"
      >
        <div
          className="flex items-center"
          id="time-attendance-leave-balance-swiper-wrapper"
          data-cy="time-attendance-leave-balance-swiper-wrapper"
        >
          <div
            className="w-full overflow-x-auto overflow-y-hidden [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            id="time-attendance-leave-balance-swiper-slides-container"
            data-cy="time-attendance-leave-balance-swiper-slides-container"
          >
            {showSkeleton ? (
              <div
                className="flex w-max min-w-full gap-7 pr-1"
                data-cy="time-attendance-leave-balance-cards-row"
              >
                {Array.from({ length: SKELETON_CARD_COUNT }).map(
                  (unusedSlide, i) => {
                    void unusedSlide;
                    return (
                      <div
                        key={i}
                        className="shrink-0 w-[280px] sm:w-[320px] md:w-[340px]"
                        data-cy={`time-attendance-leave-balance-skeleton-slide-${i}`}
                      >
                        <LeaveBalanceCardSkeleton />
                      </div>
                    );
                  },
                )}
              </div>
            ) : (
              <div
                className="flex w-max min-w-full gap-7 pr-1"
                id="time-attendance-leave-balance-scroll-row"
                data-cy="time-attendance-leave-balance-scroll-row"
              >
                {filteredItems.map((item: any) => (
                  <div
                    data-cy={`time-attendance-leave-balance-slide-${item.id}`}
                    key={item.id}
                    className="shrink-0 w-[280px] sm:w-[320px] md:w-[340px]"
                  >
                    <LeaveBalanceCard
                      title={item?.leaveType?.title ?? ''}
                      available={parseFloat(
                        (item.totalBalance ?? 0).toFixed(1),
                      )}
                      entitled={item?.entitledDays ?? item?.entitled ?? 0}
                      used={item?.usedDays ?? item?.utilized ?? 0}
                      carried={item?.carriedOver ?? item?.carried ?? 0}
                      data-cy={`time-attendance-leave-balance-card-content-id-${item.id}`}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default LeaveBalance;
