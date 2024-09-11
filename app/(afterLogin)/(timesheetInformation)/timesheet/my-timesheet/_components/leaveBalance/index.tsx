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
import { localUserID } from '@/utils/constants';

const LeaveBalance = () => {
  const [swiper, setSwiper] = useState<SwiperType>();
  const { data } = useGetLeaveBalance(localUserID);

  if (!data) {
    return '';
  }

  return (
    <>
      <div className="text-2xl font-bold text-gray-900 mb-2.5">
        Leave Balances
      </div>
      <div className="flex items-center">
        {data.items.length > 4 && (
          <div className="w-10 flex flex-col justify-center">
            <Button
              className="w-6 h-6"
              type="text"
              icon={<LeftOutlined size={16} className="text-gray-900" />}
              onClick={() => swiper?.slidePrev()}
            />
          </div>
        )}
        <Swiper
          className="flex-1"
          slidesPerView={4}
          spaceBetween={16}
          modules={[Navigation]}
          loop={true}
          onInit={(swiper) => {
            setSwiper(swiper);
          }}
        >
          {data.items.map((item) => (
            <SwiperSlide key={item.id}>
              <LeaveBalanceCard
                title={item?.leaveType?.title ?? ''}
                duration={item.totalBalance}
              />
            </SwiperSlide>
          ))}
        </Swiper>

        {data.items.length > 4 && (
          <div className="w-10 h-full flex flex-col justify-center items-end">
            <Button
              className="w-6 h-6"
              type="text"
              icon={<RightOutlined size={16} className="text-gray-900" />}
              onClick={() => swiper?.slideNext()}
            />
          </div>
        )}
      </div>
    </>
  );
};

export default LeaveBalance;
