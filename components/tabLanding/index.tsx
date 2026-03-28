'use client';

import React, { ReactNode } from 'react';
import CustomBreadcrumb from '@/components/common/breadCramp';
import CustomButton from '@/components/common/buttons/customButton';
import BlockWrapper from '@/components/common/blockWrapper/blockWrapper';
import { FaPlus } from 'react-icons/fa';
import { Button, Tooltip } from 'antd';
import AccessGuard from '@/utils/permissionGuard';
import { useIsMobile } from '@/hooks/useIsMobile';

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
  const { isMobile } = useIsMobile();

  return (
    <div
      className="min-h-screen h-auto w-full bg-white p-4"
      data-cy="tab-landing-layout"
    >
      <BlockWrapper className="bg-white ">
        <div
          data-cy="organizational-structure-and-employee-information-frontend-components-tablanding-index-tsx-index-div-48"
          className="flex justify-between items-start mb-6"
        >
          <CustomBreadcrumb
            title={title}
            subtitle={subtitle ?? ''}
            isRecognition={true}
            compact={true}
          />
          <div
            data-cy="organizational-structure-and-employee-information-frontend-components-tablanding-index-tsx-index-div-54"
            className="flex items-center gap-4"
          >
            {!buttonDisabled
              ? buttonTitle && (
                  <AccessGuard permissions={permissionsData}>
                    {isMobile ? (
                      <Button
                        type="primary"
                        id={`${id}-createButtonId`}
                        icon={buttonIcon ?? <FaPlus />}
                        onClick={onClickHandler}
                        className="h-10 w-10 rounded-lg flex justify-center items-center bg-blue-600 hover:bg-blue-700"
                      />
                    ) : (
                      <CustomButton
                        title={buttonTitle}
                        id={`${id}-createButtonId`}
                        icon={buttonIcon ?? <FaPlus />}
                        onClick={onClickHandler}
                        className="bg-blue-600 hover:bg-blue-700 h-11 px-6 rounded-lg border-none"
                        textClassName="text-sm font-semibold"
                      />
                    )}
                  </AccessGuard>
                )
              : buttonTitle && (
                  <Tooltip
                    title={disabledMessage ?? ''}
                    placement="top"
                    overlayClassName="custom-tooltip"
                  >
                    {isMobile ? (
                      <Button
                        type="primary"
                        disabled
                        id={`${title}CustomButtonId`}
                        icon={buttonIcon ?? <FaPlus />}
                        className="h-14 w-14 rounded-lg flex justify-center items-center bg-blue-600 hover:bg-blue-700"
                      />
                    ) : (
                      <Button
                        type="primary"
                        disabled
                        id={`${title}CustomButtonId`}
                        icon={buttonIcon ?? <FaPlus />}
                        className={`h-14 px-6 py-6 rounded-lg flex justify-start items-center gap-2 text-xs bg-blue-600 hover:bg-blue-700`}
                      >
                        <div
                          data-cy="organizational-structure-and-employee-information-frontend-components-tablanding-index-tsx-index-div-99"
                          className="text-center text-base font-bold leading-normal tracking-tight"
                        >
                          {buttonTitle}
                        </div>
                      </Button>
                    )}
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
        <div
          data-cy="organizational-structure-and-employee-information-frontend-components-tablanding-index-tsx-index-div-120"
          className="w-full h-auto border-t border-gray-100 pt-6"
        >
          {children}
        </div>
      </BlockWrapper>
    </div>
  );
};

export default TabLandingLayout;
