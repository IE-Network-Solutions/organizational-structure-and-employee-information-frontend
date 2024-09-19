'use client';
import React from 'react';
import { classNames } from '@/utils/classNames';

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
  return (
    <div className="flex justify-between items-center">
      <div className="flex-1">
        <h2
          className={classNames('text-gray-900', {
            'text-2xl': size === 'medium',
            'text-xl': size === 'small',
          })}
        >
          {title}
        </h2>
        {description && (
          <div className="mt-2 text-sm text-gray-600 font-medium">
            {description}
          </div>
        )}
      </div>
      <div>{children}</div>
    </div>
  );
};

export default PageHeader;
