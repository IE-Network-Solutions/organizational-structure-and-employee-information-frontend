import { useState } from 'react';
import { Swiper as SwiperType } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';
import LeaveBalanceCard from './balanceCard';

import 'swiper/css';
import 'swiper/css/navigation';
import { Navigation } from 'swiper/modules';
import { Button } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import { useGetLeaveBalance } from '@/store/server/features/timesheet/leaveBalance/queries';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { useIsMobile } from '@/hooks/useIsMobile';

const LeaveBalance = () => {
  const { userId } = useAuthenticationStore();
  const [swiper, setSwiper] = useState<SwiperType>();
  const [isBeginning, setIsBeginning] = useState(true);
  const [isEnd, setIsEnd] = useState(false);
  const { data } = useGetLeaveBalance(userId, '');
  const { isMobile } = useIsMobile();

  if (!data) {
    return '';
  }

  const filteredItems =
    data.items?.items?.filter((item: any) => item.leaveType) || [];
  const hasMultipleItems = filteredItems.length > 1;

  return (
    <>
      <div
        className={`${isMobile ? 'text-sm' : 'text-2xl'} font-bold text-gray-900 mb-2.5 p-3`}
        id="time-attendance-leave-balance-title"
        data-cy="time-attendance-leave-balance-title"
      >
        Leave Balances
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
          {hasMultipleItems && !isBeginning && (
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
            className="w-full overflow-hidden px-12"
            id="time-attendance-leave-balance-swiper-slides-container"
            data-cy="time-attendance-leave-balance-swiper-slides-container"
          >
            <Swiper
              className="w-full"
              id="swiperId"
              data-cy="time-attendance-leave-balance-swiper-id"
              slidesPerView="auto"
              spaceBetween={16}
              modules={[Navigation]}
              breakpoints={{
                0: {
                  slidesPerView: 1.2,
                },
                480: {
                  slidesPerView: 2.2,
                },
                768: {
                  slidesPerView: 3.2,
                },
                1024: {
                  slidesPerView: 4,
                },
              }}
              onInit={(swiper) => {
                setSwiper(swiper);
                setIsBeginning(swiper.isBeginning);
                setIsEnd(swiper.isEnd);
              }}
              onSlideChange={(swiper) => {
                setIsBeginning(swiper.isBeginning);
                setIsEnd(swiper.isEnd);
              }}
            >
              {filteredItems.map((item: any) => (
                <SwiperSlide data-cy={`time-attendance-leave-balance-slide-${item.id}`} key={item.id}>
                  <LeaveBalanceCard
                    title={item?.leaveType?.title ?? ''}
                    duration={parseFloat(item.totalBalance.toFixed(1))}
                    data-cy={`time-attendance-leave-balance-card-content-id-${item.id}`}
                  />
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
          {hasMultipleItems && !isEnd && (
            <Button
              className="absolute right-2 z-10 w-8 h-full flex items-center justify-center hover:bg-gray-50/50 border-none"
              type="text"
              id="time-attendance-leave-balance-next-button"
              data-cy="time-attendance-leave-balance-next-button"
              icon={
                <RightOutlined data-cy="time-attendance-leave-balance-card-right-button-icon" className="text-gray-600 text-xl hover:text-primary transition-colors" />
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
