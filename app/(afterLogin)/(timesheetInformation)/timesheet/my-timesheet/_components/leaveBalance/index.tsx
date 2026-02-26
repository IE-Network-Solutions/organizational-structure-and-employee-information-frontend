import { useState } from 'react';
import { Swiper as SwiperType } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';
import LeaveBalanceCard from './balanceCard';
import LeaveBalanceCardSkeleton from './balanceCardSkeleton';

import 'swiper/css';
import 'swiper/css/navigation';
import { Navigation } from 'swiper/modules';
import { Button } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import { useGetLeaveBalance } from '@/store/server/features/timesheet/leaveBalance/queries';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { useIsMobile } from '@/hooks/useIsMobile';

const SKELETON_CARD_COUNT = 3;

const LeaveBalance = () => {
  const { userId } = useAuthenticationStore();
  const [swiper, setSwiper] = useState<SwiperType>();
  const [isBeginning, setIsBeginning] = useState(true);
  const [isEnd, setIsEnd] = useState(false);
  const { data } = useGetLeaveBalance(userId, '');
  const { isMobile } = useIsMobile();

  const filteredItems =
    data?.items?.items?.filter((item: any) => item.leaveType) || [];
  const hasMultipleItems = filteredItems.length > 1;
  const hasData = data != null;
  const showSkeleton = !hasData;

  return (
    <>
      <div
        className={`${isMobile ? 'text-sm' : 'text-xl'} font-bold text-gray-900  p-3 pb-0`}
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
          {!showSkeleton && hasMultipleItems && !isBeginning && (
            <Button
              className="absolute left-2 z-10 w-8 h-full flex items-center justify-center hover:bg-gray-50/50 border-none"
              type="text"
              id="leaveBalanceCardLeftId"
              data-cy="time-attendance-leave-balance-card-left-button"
              icon={
                <LeftOutlined className="text-gray-600 text-xl hover:text-primary transition-colors" />
              }
              onClick={() => swiper?.slidePrev()}
            />
          )}
          <div
            className="w-full overflow-hidden px-3"
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
                modules={[Navigation]}
                slidesPerView={3.5}
                breakpoints={{
                  0: { slidesPerView: 1.5 },
                  640: { slidesPerView: 2 },
                  1024: { slidesPerView: 3.5 },
                  1920: { slidesPerView: 3.5 },
                }}
                onInit={(s) => {
                  setSwiper(s);
                  setIsBeginning(s.isBeginning);
                  setIsEnd(s.isEnd);
                }}
                onSlideChange={(s) => {
                  setIsBeginning(s.isBeginning);
                  setIsEnd(s.isEnd);
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
          {!showSkeleton && hasMultipleItems && !isEnd && (
            <Button
              className="absolute right-2 z-10 w-8 h-full flex items-center justify-center hover:bg-gray-50/50 border-none"
              type="text"
              id="time-attendance-leave-balance-next-button"
              data-cy="time-attendance-leave-balance-next-button"
              icon={
                <RightOutlined
                  data-cy="time-attendance-leave-balance-card-right-button-icon"
                  className="text-gray-600 text-xl hover:text-primary transition-colors"
                />
              }
              onClick={() => swiper?.slideNext()}
            />
          )}
        </div>
      </div>
    </>
  );
};

export default LeaveBalance;
