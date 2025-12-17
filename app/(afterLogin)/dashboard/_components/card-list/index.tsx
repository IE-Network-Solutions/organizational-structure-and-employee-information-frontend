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
    <div
      className="bg-white rounded-lg p-1 h-[150px] shadow-lg"
      data-cy="dashboard-card-list-container"
    >
      <div
        className="text-lg font-bold gap-3 flex items-center px-3  "
        data-cy="dashboard-card-list-title"
      >
        <span
          className="mr-2 text-2xl"
          data-cy="dashboard-card-list-title-emoji"
        >
          🎉{' '}
        </span>
        <span data-cy="dashboard-card-list-title-text">{title}</span>
      </div>

      <div
        className=" min-h-20 m-2 flex items-center justify-center"
        data-cy="dashboard-card-list-content"
      >
        {visibleCards?.length > 0 ? (
          <div
            className="flex flex-row gap-1 2xl:gap-3 2xl:px-3 items-center "
            data-cy="dashboard-card-list-cards"
          >
            {totalCards > cardsPerPage && currentPersonIndex > 0 ? (
              <Button
                onClick={handlePrevious}
                icon={
                  <FaArrowLeft data-cy="dashboard-card-list-previous-icon" />
                }
                className="bg-gray-100 w-5 h-5 rounded-full flex items-center justify-center border-none"
                data-cy="dashboard-card-list-previous-button"
              />
            ) : (
              <div
                className="w-5"
                data-cy="dashboard-card-list-previous-placeholder"
              ></div>
            )}

            {visibleCards?.map((item: any, index: number) => (
              <div
                className="flex flex-col items-center 2xl:gap-1 2xl:min-w-24 "
                key={index}
                data-cy={`dashboard-card-list-card-${index}`}
              >
                {item?.user?.profileImage ? (
                  <Avatar
                    src={item?.user?.profileImage}
                    alt={`${item?.user?.firstName || ''}`}
                    className="w-10 2xl:w-16 h-10 2xl:h-16 rounded-full"
                    data-cy={`dashboard-card-list-card-avatar-${index}`}
                  />
                ) : (
                  <Avatar
                    icon={
                      <UserOutlined
                        size={40}
                        data-cy={`dashboard-card-list-card-avatar-icon-${index}`}
                      />
                    }
                    className="w-10 2xl:w-16 h-10 2xl:h-16 rounded-full"
                    data-cy={`dashboard-card-list-card-avatar-default-${index}`}
                  />
                )}
                <p
                  className="font-normal text-center text-[11px]"
                  data-cy={`dashboard-card-list-card-name-${index}`}
                >
                  <span data-cy={`dashboard-card-list-card-name-text-${index}`}>
                    {`${item?.user?.firstName || ''} ${item?.user?.middleName || ''}`}
                  </span>
                </p>
              </div>
            ))}

            {totalCards > cardsPerPage && currentPersonIndex < maxIndex ? (
              <Button
                onClick={handleNext}
                icon={<FaArrowRight data-cy="dashboard-card-list-next-icon" />}
                className="bg-gray-100 w-5 h-5 rounded-full flex items-center justify-center border-none"
                data-cy="dashboard-card-list-next-button"
              />
            ) : (
              <div
                className="w-5"
                data-cy="dashboard-card-list-next-placeholder"
              ></div>
            )}
          </div>
        ) : (
          <div
            className="text-sm font-light flex min-h-20 justify-center items-center "
            data-cy="dashboard-card-list-empty"
          >
            <span data-cy="dashboard-card-list-empty-text">
              No {type} today
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default CardList;
