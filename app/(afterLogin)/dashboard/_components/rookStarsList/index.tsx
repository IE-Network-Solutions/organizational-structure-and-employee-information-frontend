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
    <div
      className="bg-white rounded-lg p-1 shadow-lg"
      data-cy="dashboard-rook-stars-list-container"
    >
      {/* eslint-disable-next-line data-cy-required */}
      <div
        className="text-base lg:text-lg font-bold gap-3 flex items-center px-3  "
        data-cy="dashboard-rook-stars-list-title"
      >
        <LuCrown
          className="text-primary"
          data-cy="dashboard-rook-stars-list-title-icon"
        />
        <span data-cy="dashboard-rook-stars-list-title-text">
          Best {title} Board
        </span>
      </div>
      <div
        className="overflow-x-auto min-h-20 scrollbar-none m-2"
        data-cy="dashboard-rook-stars-list-content"
      >
        {visibleCards?.length > 0 ? (
          <div
            className="flex flex-row gap-3 px-3 items-center"
            data-cy="dashboard-rook-stars-list-cards"
          >
            {totalCards > cardsPerPage && currentPersonIndex > 0 ? (
              <Button
                onClick={handlePrevious}
                icon={
                  <FaAngleLeft data-cy="dashboard-rook-stars-list-previous-icon" />
                }
                className="bg-light_purple w-5 h-5 rounded-full flex items-center justify-center border-none"
                data-cy="dashboard-rook-stars-list-previous-button"
              />
            ) : (
              <div
                className="w-5"
                data-cy="dashboard-rook-stars-list-previous-placeholder"
              ></div>
            )}

            {visibleCards?.map((item: any, index: number) => (
              <div
                className="flex flex-col items-center gap-2 w-full "
                key={index}
                data-cy={`dashboard-rook-stars-list-card-${index}`}
              >
                {item?.user?.profileImage ? (
                  <Avatar
                    src={item?.user?.profileImage}
                    alt={`${item?.user?.firstName || ''}`}
                    className="2xl:w-16 w-12 2xl:h-16 h-12 rounded-full"
                    data-cy={`dashboard-rook-stars-list-card-avatar-${index}`}
                  />
                ) : (
                  <Avatar
                    icon={
                      <UserOutlined
                        size={40}
                        data-cy={`dashboard-rook-stars-list-card-avatar-icon-${index}`}
                      />
                    }
                    className="2xl:w-16 w-12 2xl:h-16 h-12 rounded-full"
                    data-cy={`dashboard-rook-stars-list-card-avatar-default-${index}`}
                  />
                )}
                <p
                  className="font-normal text-center text-[10px] 2xl:text-xs"
                  data-cy={`dashboard-rook-stars-list-card-name-${index}`}
                >
                  <Tooltip
                    title={`${item?.user?.firstName || ''} ${item?.user?.middleName || ''} ${item?.user?.lastName || ''}`}
                    data-cy={`dashboard-rook-stars-list-card-name-tooltip-${index}`}
                  >
                    <span
                      data-cy={`dashboard-rook-stars-list-card-name-text-${index}`}
                    >
                      {`${item?.user?.firstName || ''} ${item?.user?.middleName || ''} ${item?.user?.lastName || ''}`
                        .length > 8
                        ? `${item?.user?.firstName || ''} ${item?.user?.middleName || ''} ${item?.user?.lastName || ''}`.slice(
                            0,
                            8,
                          ) + '...'
                        : `${item?.user?.firstName || ''} ${item?.user?.middleName || ''} ${item?.user?.lastName || ''}`}
                    </span>
                  </Tooltip>
                </p>
              </div>
            ))}

            {totalCards > cardsPerPage && currentPersonIndex < maxIndex ? (
              <Button
                onClick={handleNext}
                icon={
                  <FaAngleRight data-cy="dashboard-rook-stars-list-next-icon" />
                }
                className="bg-light_purple w-5 h-5 rounded-full flex items-center justify-center border-none"
                data-cy="dashboard-rook-stars-list-next-button"
              />
            ) : (
              <div
                className="w-5"
                data-cy="dashboard-rook-stars-list-next-placeholder"
              ></div>
            )}
          </div>
        ) : (
          <div
            className="text-lg font-light flex min-h-24 justify-center items-center "
            data-cy="dashboard-rook-stars-list-empty"
          >
            <div className="" data-cy="dashboard-rook-stars-list-empty-text">
              <span data-cy="dashboard-rook-stars-list-empty-text-content">
                {' '}
                No rockstar {title} of the Week
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default RookStarsList;
