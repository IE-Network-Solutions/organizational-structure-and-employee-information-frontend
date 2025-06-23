'use client';

import React, { ReactNode } from 'react';
import CustomBreadcrumb from '@/components/common/breadCramp';
import CustomButton from '@/components/common/buttons/customButton';
import BlockWrapper from '@/components/common/blockWrapper/blockWrapper';
import { FaPlus } from 'react-icons/fa';
import { Button, Tooltip } from 'antd';
import AccessGuard from '@/utils/permissionGuard';

interface TabLandingLayoutProps {
  title?: string | any;
  subtitle?: string | any;
  buttonTitle?: string | any;
  buttonIcon?: ReactNode;
  onClickHandler?: () => void;
  id: string;
  children?: ReactNode;
  allowSearch?: boolean;
  searchFields?: any[];
  disabledMessage?: string;
  buttonDisabled?: boolean;
  handleSearchChange?: () => void;
  permissionsData?: string[];
}

const TabLandingLayout: React.FC<TabLandingLayoutProps> = ({
  title,
  subtitle,
  buttonTitle,
  buttonIcon,
  onClickHandler,
  id,
  disabledMessage,
  buttonDisabled = false,
  children,
  permissionsData = [],
}) => {
  return (
    <div className="min-h-screen h-auto w-full bg-white p-4">
      <BlockWrapper className="bg-white ">
        <div className="flex flex-wrap justify-between items-center">
          <CustomBreadcrumb
            title={title}
            subtitle={subtitle ?? ''}
            isRecognition={true}
          />
          <div className="flex flex-wrap justify-start items-center my-4 gap-4 md:gap-8">
            {!buttonDisabled
              ? buttonTitle && (
                <AccessGuard permissions={permissionsData}>
                  <CustomButton
                    title={buttonTitle}
                    id={`${id}-createButtonId`}
                    icon={buttonIcon ?? <FaPlus />}
                    onClick={onClickHandler}
                    className="text-xs bg-blue-600 hover:bg-blue-700 h-14 w-5 sm:w-auto sm:px-5 px-6 py-6"
                  />
                </AccessGuard>
              )
              : buttonTitle && (
                <Tooltip
                  title={disabledMessage ?? ''}
                  placement="top"
                  overlayClassName="custom-tooltip"
                >
                  <Button
                    type="primary"
                    disabled
                    id={`${title}CustomButtonId`}
                    icon={buttonIcon ?? <FaPlus />}
                    className={`h-14 px-6 py-6 rounded-lg flex justify-start items-center gap-2 text-xs bg-blue-600 hover:bg-blue-700`}
                  >
                    <div className="text-center text-base font-bold font-['Manrope'] leading-normal tracking-tight">
                      {buttonTitle}
                    </div>
                  </Button>
                </Tooltip>
              )}
            {/* {buttonTitle && (
              <CustomButton
                title={buttonTitle}
                id={`${id}-createButtonId`}
                icon={buttonIcon ?? <FaPlus />}
                onClick={onClickHandler}
                className="text-xs bg-blue-600 hover:bg-blue-700 h-4"
              />
            )}
            {buttonDisabled && (
              
            )} */}
          </div>
        </div>
        <div className="w-full h-auto">{children}</div>
      </BlockWrapper>
    </div>
  );
};

export default TabLandingLayout;
