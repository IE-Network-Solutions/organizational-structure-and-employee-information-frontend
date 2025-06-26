// components/CardList.tsx
import { FC, useState } from 'react';
import { Avatar, Button } from 'antd';
import { FaAngleLeft, FaAngleRight } from 'react-icons/fa';
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

      <div className="overflow-x-auto min-h-20 scrollbar-none m-2">
        {visibleCards?.length > 0 ? (
          <div className="flex flex-row gap-3 px-3 items-center">
            {totalCards > cardsPerPage && currentPersonIndex > 0 ? (
              <Button
                onClick={handlePrevious}
                icon={<FaAngleLeft />}
                className="bg-light_purple w-5 h-5 rounded-full flex items-center justify-center border-none"
              />
            ) : (
              <div className="w-5"></div>
            )}

            {visibleCards?.map((item: any, index: number) => (
              <div
                className="flex flex-col items-center gap-2 min-w-24"
                key={index}
              >
                {item?.user?.profileImage ? (
                  <Avatar
                    src={item?.user?.profileImage}
                    alt={`${item?.user?.firstName || ''}`}
                    className="w-16 h-16 rounded-full"
                  />
                ) : (
                  <Avatar
                    icon={<UserOutlined size={40} />}
                    className="w-16 h-16 rounded-full"
                  />
                )}
                <p className="font-normal text-center text-sm">
                  {`${item?.user?.firstName || ''} ${item?.user?.middleName || ''}`}
                </p>
              </div>
            ))}

            {totalCards > cardsPerPage && currentPersonIndex < maxIndex ? (
              <Button
                onClick={handleNext}
                icon={<FaAngleRight />}
                className="bg-light_purple w-5 h-5 rounded-full flex items-center justify-center border-none"
              />
            ) : (
              <div className="w-5"></div>
            )}
          </div>
        ) : (
          <div className="text-sm font-light flex h-full justify-center items-center ">
            No {type} today
          </div>
        )}
      </div>
    </div>
  );
};

export default CardList;
