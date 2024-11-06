'use client';

import React, { ReactNode } from 'react';
import CustomBreadcrumb from '@/components/common/breadCramp';
import CustomButton from '@/components/common/buttons/customButton';
import BlockWrapper from '@/components/common/blockWrapper/blockWrapper';
import EmployeeSearch from '../common/search/employeeSearch';
import { useEmployeeManagementStore } from '@/store/uistate/features/employees/employeeManagment';
import { FaPlus } from 'react-icons/fa';

// Define prop types for tabLandingLayout
interface TabLandingLayoutProps {
  title: string;
  subtitle?: string;
  buttonTitle: string;
  buttonIcon?: ReactNode;
  onClickHandler: () => void;
  id: string;
  children?: ReactNode;
  allowSearch?:boolean;
}

const TabLandingLayout: React.FC<TabLandingLayoutProps> = ({
  title,
  subtitle,
  buttonTitle,
  buttonIcon,
  onClickHandler,
  id,
  children,
  allowSearch = true,
}) => {
  const { setOpen } = useEmployeeManagementStore();

  const showDrawer = () => setOpen(true);
  const onClose = () => setOpen(false);

  return (
    <div className="min-h-screen h-auto w-full p-4">
      <BlockWrapper>
        <div className="flex flex-wrap justify-between items-center">
          <CustomBreadcrumb title={title} subtitle={subtitle ?? ''} />
          <div className="flex flex-wrap justify-start items-center my-4 gap-4 md:gap-8">
            <CustomButton
              title={buttonTitle}
              id={`${id}-createButtonId`}
              icon={buttonIcon ?? <FaPlus/>}
              onClick={onClickHandler}
              className="bg-blue-600 hover:bg-blue-700"
            />
          </div>
        </div>
        <div className="w-full h-auto">
        {allowSearch && <EmployeeSearch />}
          {children}
        </div>
      </BlockWrapper>
    </div>
  );
};

export default TabLandingLayout;
