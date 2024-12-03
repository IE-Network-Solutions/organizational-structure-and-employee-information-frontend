'use client';

import React, { ReactNode } from 'react';
import CustomBreadcrumb from '@/components/common/breadCramp';
import CustomButton from '@/components/common/buttons/customButton';
import BlockWrapper from '@/components/common/blockWrapper/blockWrapper';
import { FaPlus } from 'react-icons/fa';

// Define prop types for tabLandingLayout
interface TabLandingLayoutProps {
  title: string | any;
  subtitle?: string | any;
  buttonTitle: string;
  buttonIcon?: ReactNode;
  onClickHandler: () => void;
  id: string;
  children?: ReactNode;
  allowSearch?: boolean;
  searchFields?: any[];
  handleSearchChange?: () => void;
}

const TabLandingLayout: React.FC<TabLandingLayoutProps> = ({
  title,
  subtitle,
  buttonTitle,
  buttonIcon,
  onClickHandler,
  id,
  children,
}) => {
  return (
    <div className="min-h-screen h-auto w-full p-4">
      <BlockWrapper>
        <div className="flex flex-wrap justify-between items-center">
          <CustomBreadcrumb title={title} subtitle={subtitle ?? ''} />
          <div className="flex flex-wrap justify-start items-center my-4 gap-4 md:gap-8">
            <CustomButton
              title={buttonTitle}
              id={`${id}-createButtonId`}
              icon={buttonIcon ?? <FaPlus />}
              onClick={onClickHandler}
              className="text-xs bg-blue-600 hover:bg-blue-700 h-4"
            />
          </div>
        </div>
        <div className="w-full h-auto">{children}</div>
      </BlockWrapper>
    </div>
  );
};

export default TabLandingLayout;
