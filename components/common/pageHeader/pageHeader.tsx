'use client';
import React from 'react';
import { classNames } from '@/utils/classNames';
import { Tooltip } from 'antd';
import { useIsMobile } from '@/hooks/useIsMobile';
interface PageHeaderProps {
  title: React.ReactNode;
  description?: string;
  children?: React.ReactNode;
  size?: 'small' | 'medium';
  toolTip?: string;
  horizontalPadding?: string;
  className?: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  size = 'medium',
  children,
  toolTip,
  horizontalPadding = 'px-2',
  className,
}) => {
  const { isMobile } = useIsMobile();
  return (
    <div
      className={`flex justify-between flex-wrap items-center ${horizontalPadding} ${className}`}
      data-cy="page-header-container"
    >
      <div
        className={`flex-1 ${horizontalPadding}`}
        data-cy="page-header-content"
      >
        {isMobile ? (
          <Tooltip
            title={toolTip}
            placement="top"
            data-cy="page-header-tooltip-mobile"
          >
            <h2
              className={classNames('text-gray-900 ', {
                'text-xl': size === 'medium',
                'text-lg': size === 'small',
              })}
              data-cy="page-header-title-mobile"
            >
              {title}
            </h2>
          </Tooltip>
        ) : (
          <Tooltip
            title={toolTip}
            placement="top"
            data-cy="page-header-tooltip"
          >
            <h2
              className={classNames('text-gray-900', {
                'text-2xl': size === 'medium',
                'text-xl': size === 'small',
              })}
              data-cy="page-header-title"
            >
              {title}
            </h2>
          </Tooltip>
        )}

        {description && (
          <div
            className="m-1 sm:mt-2 text-sm text-gray-600 font-medium"
            data-cy="page-header-description"
          >
            {description}
          </div>
        )}
      </div>
      <div className="mt-5" data-cy="page-header-children">
        {children}
      </div>
    </div>
  );
};

export default PageHeader;
