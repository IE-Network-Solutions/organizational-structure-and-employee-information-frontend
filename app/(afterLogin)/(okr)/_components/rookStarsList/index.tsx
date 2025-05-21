'use client';
import { useGetRockStars } from '@/store/server/features/okrplanning/okr/dashboard/queries';
import { RookStarsListProps } from '@/types/dashboard/okr';
import { Avatar, Button } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { LuCrown } from 'react-icons/lu';
import { useState } from 'react';
import { FaAngleLeft, FaAngleRight } from 'react-icons/fa';

const RookStarsList: React.FC<RookStarsListProps> = ({
  title,
  planningPeriodId,
}) => {
  const dameData: any = [
    {
      report_reportScore: '85%',
      user: {
        profileImage:
          'https://files.ienetworks.co/view/production/9b320d7d-bece-4dd4-bb87-dd226f70daef/surafelmain.jpg',
        firstName: 'Alice',
        middleName: 'Johnson',
        role: {
          name: 'Developer',
        },
      },
    },
    {
      report_reportScore: '42%',
      user: {
        profileImage:
          'https://files.ienetworks.co/view/production/9b320d7d-bece-4dd4-bb87-dd226f70daef/msg303358723-356583.jpg',
        firstName: 'Charlie',
        middleName: 'puth',
        role: {
          name: 'tester',
        },
      },
    },
    {
      report_reportScore: '92%',
      user: {
        profileImage:
          'https://files.ienetworks.co/view/production/9b320d7d-bece-4dd4-bb87-dd226f70daef/surafelmain.jpg',
        firstName: 'Bob',
        middleName: 'Smith',
        role: {
          name: 'Project Manager',
        },
      },
    },

    {
      report_reportScore: '78%',
      user: {
        profileImage: null,
        firstName: 'new',
        middleName: 'test',
        role: {
          name: 'BI',
        },
      },
    },
    {
      report_reportScore: '78%',
      user: {
        profileImage: null,
        firstName: 'new',
        middleName: 'test',
        role: {
          name: 'BI',
        },
      },
    },
    {
      report_reportScore: '78%',
      user: {
        profileImage: null,
        firstName: 'new',
        middleName: 'test',
        role: {
          name: 'BI',
        },
      },
    },
    {
      report_reportScore: '78%',
      user: {
        profileImage: null,
        firstName: 'new',
        middleName: 'test',
        role: {
          name: 'BI',
        },
      },
    },
    {
      report_reportScore: '78%',
      user: {
        profileImage: null,
        firstName: 'new',
        middleName: 'test',
        role: {
          name: 'BI',
        },
      },
    },
  ];

  const [currentPersonIndex, setCurrentPersonIndex] = useState(0);
  const cardsPerPage = 3;

  const totalCards = dameData?.length || 0;
  const maxIndex = totalCards - cardsPerPage;

  const handlePrevious = () => {
    setCurrentPersonIndex((prev) => Math.max(prev - 1, 0));
  };

  const handleNext = () => {
    setCurrentPersonIndex((prev) => Math.min(prev + 1, maxIndex));
  };

  const visibleCards = dameData?.slice(
    currentPersonIndex,
    currentPersonIndex + cardsPerPage,
  );

  return (
    <div className="bg-white rounded-lg p-1">
      <div className="text-2xl font-bold gap-3 flex items-center px-3  ">
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
                  {`${item?.user?.firstName || ''} ${item?.user?.middleName || ''} ${item?.user?.lastName || ''}`}
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
            No rockstar {title} of the Week
          </div>
        )}
      </div>
    </div>
  );
};
export default RookStarsList;
