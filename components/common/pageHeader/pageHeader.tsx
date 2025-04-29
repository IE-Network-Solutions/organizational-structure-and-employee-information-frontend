'use client';
import React from 'react';
import { classNames } from '@/utils/classNames';
import { useMediaQuery } from 'react-responsive';

interface PageHeaderProps {
  title: React.ReactNode;
  description?: string;
  children?: React.ReactNode;
  size?: 'small' | 'medium';
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  size = 'medium',
  children,
}) => {
  const isSmallScreen = useMediaQuery({ maxWidth: 768 }); // Detect small screens

  return (
    <div className="flex justify-between flex-wrap items-center">
      <div className="flex-1">
        {isSmallScreen ? (
          <h2
            className={classNames('text-gray-900 mt-10', {
              'text-xl': size === 'medium',
              'text-lg': size === 'small',
            })}
          >
            {title}
          </h2>
        ) : (
          <h2
            className={classNames('text-gray-900', {
              'text-2xl': size === 'medium',
              'text-xl': size === 'small',
            })}
          >
            {title}
          </h2>
        )}

        {description && (
          <div className="m-1 sm:mt-2 text-sm text-gray-600 font-medium">
            {description}
          </div>
        )}
      </div>
      <div>{children}</div>
    </div>
  );
};

export default PageHeader;
