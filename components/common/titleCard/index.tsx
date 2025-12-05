import type React from 'react';

interface TitleProps {
  title: string;
}

const TitleCard: React.FC<TitleProps> = ({ title }) => {
  return (
    <div
      className="my-6 flex items-center justify-center bg-transparent"
      data-cy="title-card-container"
    >
      <div
        className="mx-4 flex items-center justify-center"
        data-cy="title-card-content"
      >
        <div className="flex items-center" data-cy="title-card-left-decoration">
          <div
            className="h-[2px] w-12 sm:w-20 flex-grow bg-primary bg-gradient-to-r from-white via-blue-500 to-primary"
            data-cy="title-card-left-line"
          ></div>
          <span
            className="h-3 w-3 sm:h-4 sm:w-4 rounded-full bg-primary"
            data-cy="title-card-left-dot"
          ></span>
        </div>
        <h2
          className="mx-2 text-xs sm:text-xl font-bold text-primary"
          data-cy="title-card-title"
        >
          {title}
        </h2>
        <div
          className="flex items-center"
          data-cy="title-card-right-decoration"
        >
          <span
            className="h-3 w-3 sm:h-4 sm:w-4 rounded-full bg-primary"
            data-cy="title-card-right-dot"
          ></span>
          <div
            className="h-[2px] w-12 sm:w-20 flex-grow bg-primary bg-gradient-to-l from-white via-blue-500 to-primary"
            data-cy="title-card-right-line"
          ></div>
        </div>
      </div>
    </div>
  );
};

export default TitleCard;
