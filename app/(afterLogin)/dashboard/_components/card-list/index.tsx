// components/CardList.tsx
import { FC, useState } from 'react';
import { Avatar, Button } from 'antd';
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import { BirthDayData } from '@/store/server/features/dashboard/birthday/queries';
import { WorkAnniversaryData } from '@/store/server/features/dashboard/work-anniversary/queries';
import { UserOutlined } from '@ant-design/icons';

interface CardListProps {
  title: string;
  people: BirthDayData[] | WorkAnniversaryData[];
  loading: boolean;
  type: string;
}
const CardList: FC<CardListProps> = ({ title, people, type }) => {
  const [currentPersonIndex, setCurrentPersonIndex] = useState(0);
  const cardsPerPage = 3;

  const totalCards = people?.length || 0;
  const maxIndex = totalCards - cardsPerPage;

  const handlePrevious = () => {
    setCurrentPersonIndex((prev) => Math.max(prev - 1, 0));
  };

  const handleNext = () => {
    setCurrentPersonIndex((prev) => Math.min(prev + 1, maxIndex));
  };

  const visibleCards = people?.slice(
    currentPersonIndex,
    currentPersonIndex + cardsPerPage,
  );
  return (
    <div className="bg-white rounded-lg p-1 h-[150px]">
      <div className="text-lg font-bold gap-3 flex items-center px-3  ">
        <span className="mr-2 text-2xl">🎉 </span>
        {title}
      </div>

      <div className=" min-h-20 m-2 flex items-center justify-center">
        {visibleCards?.length > 0 ? (
          <div className="flex flex-row gap-1 2xl:gap-3 2xl:px-3 items-center ">
            {totalCards > cardsPerPage && currentPersonIndex > 0 ? (
              <Button
                onClick={handlePrevious}
                icon={<FaArrowLeft />}
                className="bg-gray-100 w-5 h-5 rounded-full flex items-center justify-center border-none"
              />
            ) : (
              <div className="w-5"></div>
            )}

            {visibleCards?.map((item: any, index: number) => (
              <div
                className="flex flex-col items-center 2xl:gap-1 2xl:min-w-24 "
                key={index}
              >
                {item?.user?.profileImage ? (
                  <Avatar
                    src={item?.user?.profileImage}
                    alt={`${item?.user?.firstName || ''}`}
                    className="w-10 2xl:w-16 h-10 2xl:h-16 rounded-full"
                  />
                ) : (
                  <Avatar
                    icon={<UserOutlined size={40} />}
                    className="w-10 2xl:w-16 h-10 2xl:h-16 rounded-full"
                  />
                )}
                <p className="font-normal text-center text-[11px]">
                  {`${item?.user?.firstName || ''} ${item?.user?.middleName || ''}`}
                </p>
              </div>
            ))}

            {totalCards > cardsPerPage && currentPersonIndex < maxIndex ? (
              <Button
                onClick={handleNext}
                icon={<FaArrowRight />}
                className="bg-gray-100 w-5 h-5 rounded-full flex items-center justify-center border-none"
              />
            ) : (
              <div className="w-5"></div>
            )}
          </div>
        ) : (
          <div className="text-sm font-light flex min-h-20 justify-center items-center ">
            No {type} today
          </div>
        )}
      </div>
    </div>
  );
};

export default CardList;
