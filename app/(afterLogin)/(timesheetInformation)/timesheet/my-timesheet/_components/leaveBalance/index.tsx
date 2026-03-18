import { Swiper, SwiperSlide } from 'swiper/react';
import LeaveBalanceCard from './balanceCard';
import LeaveBalanceCardSkeleton from './balanceCardSkeleton';

import 'swiper/css';
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
            className="w-full overflow-hidden"
            id="time-attendance-leave-balance-swiper-slides-container"
            data-cy="time-attendance-leave-balance-swiper-slides-container"
          >
            {showSkeleton ? (
              <Swiper
                className="w-full"
                spaceBetween={28}
                breakpoints={{
                  0: { slidesPerView: 1 },
                  640: { slidesPerView: 2 },
                  1024: { slidesPerView: 3.5 },
                  1920: { slidesPerView: 3.5 },
                }}
              >
                {Array.from({ length: SKELETON_CARD_COUNT }).map(
                  (unusedSlide, i) => {
                    void unusedSlide;
                    return (
                      <SwiperSlide
                        key={i}
                        data-cy={`time-attendance-leave-balance-skeleton-slide-${i}`}
                      >
                        <LeaveBalanceCardSkeleton />
                      </SwiperSlide>
                    );
                  },
                )}
              </Swiper>
            ) : (
              <Swiper
                className="w-full"
                id="swiperId"
                data-cy="time-attendance-leave-balance-swiper-id"
                spaceBetween={28}
                breakpoints={{
                  0: { slidesPerView: 1.5 },
                  640: { slidesPerView: 2 },
                  1024: { slidesPerView: 3.5 },
                  1920: { slidesPerView: 3.5 },
                }}
              >
                {filteredItems.map((item: any) => (
                  <SwiperSlide
                    data-cy={`time-attendance-leave-balance-slide-${item.id}`}
                    key={item.id}
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
                  </SwiperSlide>
                ))}
              </Swiper>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default LeaveBalance;
