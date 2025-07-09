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
  const { data } = useGetLeaveBalance(userId, '');
  const { isMobile } = useIsMobile();
  if (!data) {
    return '';
  }
  return (
    <>
      <div
        className={`${isMobile ? 'text-sm' : 'text-2xl'} font-bold text-gray-900 mb-2.5 p-3`}
      >
        Leave Balances
      </div>
      <div className="relative">
        <div className="flex items-center">
          {data.items.length > 1 && (
            <Button
              className="absolute left-2 z-10 w-8 h-full flex items-center justify-center hover:bg-gray-50/50 border-none"
              type="text"
              id="leaveBalanceCardLeftId"
              icon={
                <LeftOutlined className="text-gray-600 text-xl hover:text-primary transition-colors" />
              }
              onClick={() => swiper?.slidePrev()}
            />
          )}
          <div className="w-full overflow-hidden px-12">
            <Swiper
              className="w-full"
              id="swiperId"
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
              }}
            >
              {data.items?.items
                .filter((item: any) => item.leaveType)
                .map((item: any) => (
                  <SwiperSlide key={item.id}>
                    <LeaveBalanceCard
                      title={item?.leaveType?.title ?? ''}
                      duration={parseFloat(item.totalBalance.toFixed(1))}
                    />
                  </SwiperSlide>
                ))}
            </Swiper>
          </div>
          {data.items?.items?.length > 1 && (
            <Button
              className="absolute right-2 z-10 w-8 h-full flex items-center justify-center hover:bg-gray-50/50 border-none"
              type="text"
              icon={
                <RightOutlined className="text-gray-600 text-xl hover:text-primary transition-colors" />
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
