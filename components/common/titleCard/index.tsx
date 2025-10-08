import type React from 'react';

interface TitleProps {
  title: string;
}

const TitleCard: React.FC<TitleProps> = ({ title }) => {
  return (
    <div className="my-6 flex items-center justify-center bg-transparent">
      <div className="mx-4 flex items-center justify-center">
        <div className="flex items-center">
          <div className="h-[2px] w-12 sm:w-20 flex-grow bg-primary bg-gradient-to-r from-white via-blue-500 to-primary"></div>
          <span className="h-3 w-3 sm:h-4 sm:w-4 rounded-full bg-primary"></span>
        </div>
        <h2 className="mx-2 text-xs sm:text-xl font-bold text-primary">
          {title}
        </h2>
        <div className="flex items-center">
          <span className="h-3 w-3 sm:h-4 sm:w-4 rounded-full bg-primary"></span>
          <div className="h-[2px] w-12 sm:w-20 flex-grow bg-primary bg-gradient-to-l from-white via-blue-500 to-primary"></div>
        </div>
      </div>
    </div>
  );
};

export default TitleCard;
