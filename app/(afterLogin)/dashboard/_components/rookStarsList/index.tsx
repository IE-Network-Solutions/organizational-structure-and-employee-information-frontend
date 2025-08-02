'use client';
import { RookStarsListProps } from '@/types/dashboard/okr';
import { Avatar, Button, Tooltip } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { LuCrown } from 'react-icons/lu';
import { useState } from 'react';
import { FaAngleLeft, FaAngleRight } from 'react-icons/fa';

const RookStarsList: React.FC<RookStarsListProps> = ({ title, data }) => {
  const [currentPersonIndex, setCurrentPersonIndex] = useState(0);
  const cardsPerPage = 3;

  const totalCards = data?.length || 0;
  const maxIndex = totalCards - cardsPerPage;

  const handlePrevious = () => {
    setCurrentPersonIndex((prev) => Math.max(prev - 1, 0));
  };

  const handleNext = () => {
    setCurrentPersonIndex((prev) => Math.min(prev + 1, maxIndex));
  };

  const visibleCards = data?.slice(
    currentPersonIndex,
    currentPersonIndex + cardsPerPage,
  );

  return (
    <div className="bg-white rounded-lg p-1   ">
      <div className="text-base lg:text-lg font-bold gap-3 flex items-center px-3  ">
        <LuCrown className="text-primary" />
        Best {title} Board
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
                className="flex flex-col items-center gap-2 w-full "
                key={index}
              >
                {item?.user?.profileImage ? (
                  <Avatar
                    src={item?.user?.profileImage}
                    alt={`${item?.user?.firstName || ''}`}
                    className="2xl:w-16 w-12 2xl:h-16 h-12 rounded-full"
                  />
                ) : (
                  <Avatar
                    icon={<UserOutlined size={40} />}
                    className="2xl:w-16 w-12 2xl:h-16 h-12 rounded-full"
                  />
                )}
                <p className="font-normal text-center text-[10px] 2xl:text-xs">
                  <Tooltip
                    title={`${item?.user?.firstName || ''} ${item?.user?.middleName || ''} ${item?.user?.lastName || ''}`}
                  >
                    {`${item?.user?.firstName || ''} ${item?.user?.middleName || ''} ${item?.user?.lastName || ''}`
                      .length > 8
                      ? `${item?.user?.firstName || ''} ${item?.user?.middleName || ''} ${item?.user?.lastName || ''}`.slice(
                          0,
                          8,
                        ) + '...'
                      : `${item?.user?.firstName || ''} ${item?.user?.middleName || ''} ${item?.user?.lastName || ''}`}
                  </Tooltip>
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
          <div className="text-lg font-light flex min-h-24 justify-center items-center ">
            <div className=""> No rockstar {title} of the Week</div>
          </div>
        )}
      </div>
    </div>
  );
};
export default RookStarsList;
