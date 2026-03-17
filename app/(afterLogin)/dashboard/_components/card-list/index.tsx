// components/CardList.tsx
import { FC, useEffect, useState } from 'react';
import { Avatar, Button, Badge, Card } from 'antd';
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import { UserOutlined } from '@ant-design/icons';
import {
  MdOutlineCake,
  MdCardGiftcard,
  MdOutlineEmojiEvents,
  MdStarOutline,
  MdKeyboardArrowLeft,
  MdKeyboardArrowRight,
} from 'react-icons/md';

interface CardPerson {
  user?: {
    firstName?: string;
    middleName?: string | null;
    profileImage?: string | null;
  };
}

interface CardListProps {
  title: string;
  people: CardPerson[];
  loading: boolean;
  type: string;
}
const CardList: FC<CardListProps> = ({ title, people, type, loading }) => {
  const [currentPersonIndex, setCurrentPersonIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const cardsPerPage = 1;

  const totalCards = people?.length || 0;
  const maxIndex = totalCards - cardsPerPage;

  const getHeaderIcon = () => {
    switch (type) {
      case 'birthday':
        return {
          icon: <MdOutlineCake />,
          bg: 'bg-[#FFF0F6]',
          text: 'text-[#F759AB]',
        };
      case 'anniversary':
        return {
          icon: <MdCardGiftcard />,
          bg: 'bg-[#F6FFED]',
          text: 'text-[#52C41A]',
        };
      case 'Leader':
        return {
          icon: <MdOutlineEmojiEvents />,
          bg: 'bg-[#FFFBE6]',
          text: 'text-[#FAAD14]',
        };
      case 'Employee':
        return {
          icon: <MdStarOutline />,
          bg: 'bg-[#E6F7FF]',
          text: 'text-primary',
        };
      default:
        return {
          icon: <MdOutlineCake />,
          bg: 'bg-gray-100',
          text: 'text-gray-500',
        };
    }
  };

  const { icon, bg, text } = getHeaderIcon();

  const handlePrevious = () => {
    if (currentPersonIndex === 0) return;
    setCurrentPersonIndex((prev) => Math.max(prev - 1, 0));
  };

  const handleNext = () => {
    if (currentPersonIndex >= maxIndex) return;
    setCurrentPersonIndex((prev) => Math.min(prev + 1, maxIndex));
  };

  useEffect(() => {
    if (!totalCards) return;
    setIsAnimating(true);
    const timeout = setTimeout(() => setIsAnimating(false), 200);
    return () => clearTimeout(timeout);
  }, [currentPersonIndex, totalCards]);

  const visibleCards = people?.slice(
    currentPersonIndex,
    currentPersonIndex + cardsPerPage,
  );
  return (
    <Card
      bordered={false}
      bodyStyle={{ padding: 0 }}
      loading={loading}
      className="bg-white rounded-lg border border-[#E5E7EB] shadow-none h-[150px] flex flex-col"
      data-cy="dashboard-card-list-container"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className="flex items-center justify-between px-4 pt-3 pb-1"
        data-cy="dashboard-card-list-title"
      >
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center justify-center w-7 h-7 rounded-sm text-lg ${bg} ${text}`}
            data-cy="dashboard-card-list-title-emoji"
          >
            {icon}
          </span>
          <span
            className="text-sm font-semibold text-gray-900"
            data-cy="dashboard-card-list-title-text"
          >
            {title}
          </span>
        </div>
        <span
          className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-gray-100 text-gray-700"
          data-cy="dashboard-card-list-count-tag"
        >
          {people?.length || 0}
        </span>
      </div>

      <div
        className="flex-1 px-4 pb-3 flex items-center justify-center relative"
        data-cy="dashboard-card-list-content"
      >
        {visibleCards?.length > 0 ? (
          <div
            className="w-full flex items-center justify-between"
            data-cy="dashboard-card-list-cards"
          >
            {isHovered &&
              <Button
                onClick={handlePrevious}
                icon={
                  <MdKeyboardArrowLeft data-cy="dashboard-card-list-previous-icon" />
                }
                disabled={
                  !(
                    isHovered &&
                    totalCards > cardsPerPage &&
                    currentPersonIndex > 0
                  )
                }
                className="bg-white shadow-sm w-6 h-6 rounded-md flex items-center justify-center border border-gray-200 hover:border-primary"
                data-cy="dashboard-card-list-previous-button"
              />
            }

            {visibleCards?.map((item: any, index: number) => (
              <div
                key={`${currentPersonIndex}-${index}`}
                className={`flex flex-col items-center gap-1 mx-auto transition-all duration-200 ease-out transform ${
                  isAnimating ? 'opacity-0 translate-y-1' : 'opacity-100 translate-y-0'
                }`}
                data-cy={`dashboard-card-list-card-${index}`}
              >
                {item?.user?.profileImage ? (
                  <Avatar
                    src={item?.user?.profileImage}
                    alt={`${item?.user?.firstName || ''}`}
                    className="w-10 2xl:w-12 h-10 2xl:h-12 rounded-full"
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
                    className="w-10 2xl:w-12 h-10 2xl:h-12 rounded-full"
                    data-cy={`dashboard-card-list-card-avatar-default-${index}`}
                  />
                )}
                <p
                  className="font-medium text-center text-[12px] text-gray-900"
                  data-cy={`dashboard-card-list-card-name-${index}`}
                >
                  <span data-cy={`dashboard-card-list-card-name-text-${index}`}>
                    {`${item?.user?.firstName || ''} ${item?.user?.middleName || ''}`}
                  </span>
                </p>
                <p className="text-[11px] text-gray-500 text-center">
                  Product Designer
                </p>
              </div>
            ))}
            {isHovered &&
              <Button
                onClick={handleNext}
                icon={<MdKeyboardArrowRight data-cy="dashboard-card-list-next-icon" />}
                className="bg-white shadow-sm w-6 h-6 rounded-md flex items-center justify-center border border-gray-200 hover:border-primary"
                data-cy="dashboard-card-list-next-button"
                disabled={
                  !(

                    totalCards > cardsPerPage &&
                    currentPersonIndex < maxIndex
                  )
                }
              />
            }
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
    </Card>
  );
};

export default CardList;
