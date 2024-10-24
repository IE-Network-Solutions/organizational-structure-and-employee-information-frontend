// components/CardList.tsx
import { FC, useState } from 'react';
import PersonCard from '../person-card';
import { Button, Card, Empty } from 'antd';
import { FaAngleLeft, FaAngleRight } from 'react-icons/fa';
import { BirthDayData } from '@/store/server/features/dashboard/birthday/queries';
import { WorkAnniversaryData } from '@/store/server/features/dashboard/work-anniversary/queries';
import dayjs from 'dayjs';

interface CardListProps {
  title: string;
  people: BirthDayData[] | WorkAnniversaryData[];
  loading: boolean;
  type: string;
}

const CardList: FC<CardListProps> = ({ title, people, loading, type }) => {
  const [currentPersonIndex, setCurrentPersonIndex] = useState(0); // I used useState it because of i use same component for birthday and work anniversary

  const handleNext = () => {
    if (people && currentPersonIndex < people?.length - 1) {
      setCurrentPersonIndex(currentPersonIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentPersonIndex > 0) {
      setCurrentPersonIndex(currentPersonIndex - 1);
    }
  };
  const workAnniversary = dayjs().diff(
    dayjs(people[currentPersonIndex]?.joinedDate),
    'year',
  );

  return (
    <Card
      bodyStyle={{ padding: '6px' }}
      loading={loading}
      className="bg-white p-2 rounded-lg   w-full md:max-h-48"
    >
      <div className="flex items-center ">
        <span className="mr-2 text-2xl">🎉</span>
        <div className="flex justify-between items-center w-full">
          <h4 className="text-sm font-semibold">{title}</h4>
          {type === 'anniversary' && (
            <div className="bg-light_purple py-1 px-2 text-purple rounded-lg text-xs font-semibold">{`${workAnniversary} ${workAnniversary == 1 ? 'Year' : 'Years'}`}</div>
          )}
        </div>
      </div>

      {people?.length ? (
        <div className="">
          <PersonCard
            name={people[currentPersonIndex]?.user?.firstName || ''}
            imgSrc={people[currentPersonIndex]?.user?.profileImage || ''}
          />
          <div className="flex justify-center items-center gap-2 ">
            <Button
              onClick={handlePrevious}
              disabled={currentPersonIndex === 0}
              icon={<FaAngleLeft />}
              className="bg-light_purple w-5 h-5 rounded-full flex items-center justify-center border-none"
            />
            <h2 className="text-xs font-semibold  ">{people?.length}</h2>
            <Button
              onClick={handleNext}
              disabled={currentPersonIndex === people?.length - 1}
              icon={<FaAngleRight />}
              className="bg-light_purple w-5 h-5  rounded-full flex items-center justify-center border-none"
            />
          </div>
        </div>
      ) : (
        <Empty />
      )}
    </Card>
  );
};

export default CardList;
