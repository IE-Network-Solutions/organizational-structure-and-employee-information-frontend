import React, { useState } from 'react';
import { Swiper as SwiperType } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';
import LeaveBalanceCard from './balanceCard';

import 'swiper/css';
import 'swiper/css/navigation';
import { Navigation } from 'swiper/modules';
import { Button } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';

const LeaveBalance = () => {
  const [swiper, setSwiper] = useState<SwiperType>();
  const data = [
    {
      title: 'Annual',
      duration: '3 Days',
    },
    {
      title: 'Engagement',
      duration: '3 Days',
    },
    {
      title: 'Sick Leave',
      duration: '1 Days',
    },
    {
      title: 'Wedding',
      duration: '2 Days',
    },
    {
      title: 'One More',
      duration: '1 Days',
    },
  ];

  return (
    <>
      <div className="text-2xl font-bold text-gray-900 mb-2.5">
        Leave Balances
      </div>
      <div className="flex items-center">
        <div className="w-10 flex flex-col justify-center">
          <Button
            className="w-6 h-6"
            type="text"
            icon={<LeftOutlined size={16} className="text-gray-900" />}
            onClick={() => swiper?.slidePrev()}
          />
        </div>
        <Swiper
          className="flex-1"
          slidesPerView={4}
          spaceBetween={16}
          modules={[Navigation]}
          onInit={(swiper) => {
            setSwiper(swiper);
          }}
        >
          {data.map((item) => (
            <SwiperSlide key={item.title}>
              <LeaveBalanceCard title={item.title} duration={item.duration} />
            </SwiperSlide>
          ))}
        </Swiper>
        <div className="w-10 h-full flex flex-col justify-center items-end">
          <Button
            className="w-6 h-6"
            type="text"
            icon={<RightOutlined size={16} className="text-gray-900" />}
            onClick={() => swiper?.slideNext()}
          />
        </div>
      </div>
    </>
  );
};

export default LeaveBalance;
