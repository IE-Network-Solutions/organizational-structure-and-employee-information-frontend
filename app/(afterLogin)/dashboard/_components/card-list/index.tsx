// components/CardList.tsx
import { FC, useEffect, useRef, useState } from 'react';
import { Avatar, Button, Card, Carousel, Skeleton } from 'antd';
import type { CarouselRef } from 'antd/es/carousel';
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
  /** Compact height for stacking under Planning */
  compact?: boolean;
}

const CardListSkeleton: FC = () => (
  <>
    <div
      className="flex items-center justify-between px-4 pt-3 pb-1"
      data-cy="dashboard-card-list-skeleton-header"
    >
      <div
        className="flex items-center gap-2"
        data-cy="dashboard-card-list-skeleton-header-left"
      >
        <Skeleton.Avatar
          active
          shape="square"
          size={34}
          className="!rounded-sm"
        />
        <Skeleton.Input active size="small" className="!h-4 !w-28 !min-w-0" />
      </div>
      <Skeleton.Input active size="small" className="!h-5 !w-8 !min-w-0" />
    </div>
    <div
      className="flex-1 px-4 pb-2 flex items-center justify-center relative min-h-0 max-w-[260px] md:max-w-none"
      data-cy="dashboard-card-list-skeleton-body"
    >
      <div
        className="w-full flex flex-col items-center gap-2 py-0.5"
        data-cy="dashboard-card-list-skeleton-body-content"
      >
        <Skeleton.Avatar active size={44} />
        <Skeleton.Input active size="small" className="!h-4 !w-24 !min-w-0" />
        <Skeleton.Input active size="small" className="!h-3 !w-32 !min-w-0" />
      </div>
    </div>
  </>
);

const PersonSlide: FC<{ person: CardPerson; slideIndex: number }> = ({
  person,
  slideIndex,
}) => (
  <div
    className="flex flex-col items-center gap-1 mx-auto max-w-[260px] md:max-w-none py-0.5"
    data-cy={`dashboard-card-list-card-${slideIndex}`}
  >
    {person.user?.profileImage ? (
      <Avatar
        size={48}
        src={person.user.profileImage}
        alt={`${person.user.firstName || ''}`}
        className="w-12 2xl:w-12 h-10 2xl:h-12 rounded-full"
        data-cy="dashboard-card-list-card-avatar"
      />
    ) : (
      <Avatar
        size={48}
        icon={<UserOutlined data-cy="dashboard-card-list-card-avatar-icon" />}
        className="w-12 2xl:w-12 h-10 2xl:h-12 rounded-full"
        data-cy="dashboard-card-list-card-avatar-default"
      />
    )}

    <p
      className="font-medium text-center text-[12px] text-gray-900"
      data-cy="dashboard-card-list-card-name"
    >
      {`${person.user?.firstName || ''} ${person.user?.middleName || ''}`.trim()}
    </p>

    <p
      className="text-[11px] text-gray-500 text-center"
      data-cy="dashboard-card-list-card-position"
    >
      {person.user?.employeeJobInformation?.[0]?.position?.name || ''}
    </p>
  </div>
);

const CardList: FC<CardListProps> = ({
  title,
  people,
  type,
  loading,
  compact = false,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  /** Desktop: show prev/next on hover only. Touch / coarse pointer: always show (no hover). */
  const [useHoverOnlyNav, setUseHoverOnlyNav] = useState(false);
  const carouselRef = useRef<CarouselRef>(null);

  const totalCards = people?.length || 0;
  const maxIndex = Math.max(0, totalCards - 1);

  useEffect(() => {
    const mq = window.matchMedia('(hover: hover) and (pointer: fine)');
    const sync = () => setUseHoverOnlyNav(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  const showNavButtons = totalCards > 1 && (!useHoverOnlyNav || isHovered);

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
    carouselRef.current?.prev();
  };

  const handleNext = () => {
    carouselRef.current?.next();
  };

  return (
    <Card
      bordered={false}
      bodyStyle={{ padding: 0 }}
      className={`p-3 bg-white rounded-lg border border-[#E5E7EB] shadow-none flex flex-col ${
        compact
          ? 'min-h-[160px] h-[160px]'
          : 'min-h-[160px] h-auto sm:h-[160px]'
      }`}
      data-cy="dashboard-card-list-container"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {loading ? (
        <CardListSkeleton />
      ) : (
        <>
          <div
            className="flex items-center justify-between pb-2"
            data-cy="dashboard-card-list-title"
          >
            <div
              className="flex items-center gap-2"
              data-cy="dashboard-card-list-title-left"
            >
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
              className="inline-flex justify-center items-center w-[22px] h-[22px] border border-gray-200 rounded-[4px] text-xs font-normal bg-gray-100/40 text-black"
              data-cy="dashboard-card-list-count-tag"
            >
              {people?.length || 0}
            </span>
          </div>

          <div
            className="flex-1  pb-2 flex items-center justify-center relative min-h-0 max-w-[260px] md:max-w-none"
            data-cy="dashboard-card-list-content"
          >
            {totalCards > 0 ? (
              <div
                className="w-full relative dashboard-card-list-carousel touch-pan-x"
                data-cy="dashboard-card-list-cards"
              >
                {showNavButtons && (
                  <>
                    <Button
                      htmlType="button"
                      onClick={handlePrevious}
                      icon={
                        <MdKeyboardArrowLeft data-cy="dashboard-card-list-previous-icon" />
                      }
                      disabled={currentSlide === 0}
                      className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-sm w-8 h-8 min-w-8 min-h-8 rounded-md flex items-center justify-center border border-gray-200 hover:border-[#E6F7FF] touch-manipulation"
                      data-cy="dashboard-card-list-previous-button"
                    />
                    <Button
                      htmlType="button"
                      onClick={handleNext}
                      icon={
                        <MdKeyboardArrowRight data-cy="dashboard-card-list-next-icon" />
                      }
                      disabled={currentSlide >= maxIndex}
                      className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-sm w-8 h-8 min-w-8 min-h-8 rounded-md flex items-center justify-center border border-gray-200 hover:border-[#E6F7FF] touch-manipulation"
                      data-cy="dashboard-card-list-next-button"
                    />
                  </>
                )}

                <Carousel
                  ref={carouselRef}
                  infinite={false}
                  dots={totalCards > 1}
                  dotPosition="bottom"
                  speed={450}
                  draggable
                  afterChange={setCurrentSlide}
                  rootClassName="dashboard-card-list-ant-carousel"
                  className={`[&_.slick-dots]:!-bottom-3 [&_.slick-dots_li_button]:!h-1.5 [&_.slick-dots_li_button]:!w-1.5 [&_.slick-dots_li.slick-active_button]:!w-2 ${totalCards > 1 ? '[&_.slick-slide]:!px-7' : ''}`}
                >
                  {people.map((person, index) => (
                    <div
                      key={index}
                      data-cy={`dashboard-card-list-slide-${index}`}
                    >
                      <PersonSlide person={person} slideIndex={index} />
                    </div>
                  ))}
                </Carousel>
              </div>
            ) : (
              <div
                className="text-sm font-light flex min-h-20 justify-center items-center"
                data-cy="dashboard-card-list-empty"
              >
                <span data-cy="dashboard-card-list-empty-text">
                  No {type} today
                </span>
              </div>
            )}
          </div>
        </>
      )}
    </Card>
  );
};

export default CardList;
