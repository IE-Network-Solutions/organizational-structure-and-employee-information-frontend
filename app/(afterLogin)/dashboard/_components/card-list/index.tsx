// components/CardList.tsx
import { FC, useEffect, useState } from 'react';
import { Avatar, Button, Card } from 'antd';
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
    employeeJobInformation?: Array<{ position?: { name?: string } }>;
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
  // Direction is set by click handlers so left/right arrows always match.
  const [direction, setDirection] = useState<'next' | 'prev'>('next');

  const cardsPerPage = 1;
  const totalCards = people?.length || 0;
  const maxIndex = totalCards - cardsPerPage;

  useEffect(() => {
    if (!totalCards) return;
    setIsAnimating(true);
    // Match the CSS transition duration for a smooth finish.
    const timeout = setTimeout(() => setIsAnimating(false), 900);
    return () => clearTimeout(timeout);
  }, [currentPersonIndex, totalCards]);

  const getHeaderIcon = () => {
    switch (type) {
      case 'birthday':
        return { icon: <MdOutlineCake />, bg: 'bg-[#FFF0F6]', text: 'text-[#F759AB]' };
      case 'anniversary':
        return { icon: <MdCardGiftcard />, bg: 'bg-[#F6FFED]', text: 'text-[#52C41A]' };
      case 'Leader':
        return { icon: <MdOutlineEmojiEvents />, bg: 'bg-[#FFFBE6]', text: 'text-[#FAAD14]' };
      case 'Employee':
        return { icon: <MdStarOutline />, bg: 'bg-[#E6F7FF]', text: 'text-primary' };
      default:
        return { icon: <MdOutlineCake />, bg: 'bg-gray-100', text: 'text-gray-500' };
    }
  };

  const { icon, bg, text } = getHeaderIcon();

  const handlePrevious = () => {
    if (currentPersonIndex === 0) return;
    setDirection('prev');
    setCurrentPersonIndex((prev) => Math.max(prev - 1, 0));
  };

  const handleNext = () => {
    if (currentPersonIndex >= maxIndex) return;
    setDirection('next');
    setCurrentPersonIndex((prev) => Math.min(prev + 1, maxIndex));
  };

  const visiblePerson = people[currentPersonIndex];

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
      <div className="flex items-center justify-between px-4 pt-3 pb-1" data-cy="dashboard-card-list-title">
        <div className="flex items-center gap-2" data-cy="dashboard-card-list-title-left">
          <span
            className={`inline-flex items-center justify-center w-7 h-7 rounded-sm text-lg ${bg} ${text}`}
            data-cy="dashboard-card-list-title-emoji"
          >
            {icon}
          </span>
          <span className="text-sm font-semibold text-gray-900" data-cy="dashboard-card-list-title-text">
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

      <div className="flex-1 px-4 pb-3 flex items-center justify-center relative" data-cy="dashboard-card-list-content">
        {totalCards > 0 && visiblePerson ? (
          <div className="w-full relative overflow-hidden" data-cy="dashboard-card-list-cards">
            {/* Navigation buttons */}
            {isHovered && totalCards > 1 && (
              <>
                <Button
                  onClick={handlePrevious}
                  icon={<MdKeyboardArrowLeft data-cy="dashboard-card-list-previous-icon" />}
                  disabled={currentPersonIndex === 0}
                  className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-sm w-8 h-8 rounded-md flex items-center justify-center border border-gray-200 hover:border-primary"
                  data-cy="dashboard-card-list-previous-button"
                />
                <Button
                  onClick={handleNext}
                  icon={<MdKeyboardArrowRight data-cy="dashboard-card-list-next-icon" />}
                  disabled={currentPersonIndex >= maxIndex}
                  className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-sm w-8 h-8 rounded-md flex items-center justify-center border border-gray-200 hover:border-primary"
                  data-cy="dashboard-card-list-next-button"
                />
              </>
            )}

            {/* Sliding card */}
            <div
              key={currentPersonIndex}
              className={`
                flex flex-col items-center gap-1 mx-auto w-full
                transition-all duration-[900ms] ease-[cubic-bezier(0.4,0,0.2,1)]
                ${isAnimating
                  ? direction === 'next'
                    ? 'translate-x-[90%] opacity-0 scale-95'
                    : '-translate-x-[90%] opacity-0 scale-95'
                  : 'translate-x-0 opacity-100 scale-100'
                }
              `}
              data-cy={`dashboard-card-list-card-${currentPersonIndex}`}
            >
              {visiblePerson.user?.profileImage ? (
                <Avatar
                  src={visiblePerson.user.profileImage}
                  alt={`${visiblePerson.user.firstName || ''}`}
                  className="w-10 2xl:w-12 h-10 2xl:h-12 rounded-full"
                  data-cy="dashboard-card-list-card-avatar"
                />
              ) : (
                <Avatar
                  icon={<UserOutlined data-cy="dashboard-card-list-card-avatar-icon" />}
                  className="w-10 2xl:w-12 h-10 2xl:h-12 rounded-full"
                  data-cy="dashboard-card-list-card-avatar-default"
                />
              )}

              <p className="font-medium text-center text-[12px] text-gray-900" data-cy="dashboard-card-list-card-name">
                {`${visiblePerson.user?.firstName || ''} ${visiblePerson.user?.middleName || ''}`.trim()}
              </p>

              <p className="text-[11px] text-gray-500 text-center" data-cy="dashboard-card-list-card-position">
                {visiblePerson.user?.employeeJobInformation?.[0]?.position?.name || ''}
              </p>
            </div>
          </div>
        ) : (
          <div className="text-sm font-light flex min-h-20 justify-center items-center" data-cy="dashboard-card-list-empty">
            <span data-cy="dashboard-card-list-empty-text">No {type} today</span>
          </div>
        )}
      </div>
    </Card>
  );
};

export default CardList;