'use client';

import React, { ReactNode } from 'react';
import classNames from 'classnames';
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
  /** Break out of nav inner padding for a full-width divider; header and body use horizontal inset. */
  flushHorizontal?: boolean;
  /** Desktop primary action (e.g. Create Meeting): full `className` for `CustomButton`. */
  primaryActionButtonClassName?: string;
  /** Label typography on desktop primary `CustomButton` (default semibold). */
  primaryActionTextClassName?: string;
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
  flushHorizontal = false,
  primaryActionButtonClassName,
  primaryActionTextClassName = 'text-sm font-semibold',
}) => {
  const { isMobile } = useIsMobile();
  const desktopPrimaryClass =
    primaryActionButtonClassName ??
    'bg-blue-600 hover:bg-blue-700 h-11 px-6 rounded-lg border-none';

  return (
    <div
      className={classNames(
        'min-h-screen h-auto bg-white',
        flushHorizontal
          ? 'pt-8 pb-4 px-0 overflow-x-hidden -mx-2 w-[calc(100%+16px)] md:-mx-6 md:w-[calc(100%+48px)]'
          : 'w-full p-4',
      )}
      data-cy="tab-landing-layout"
    >
      <BlockWrapper className="bg-white ">
        <div
          data-cy="organizational-structure-and-employee-information-frontend-components-tablanding-index-tsx-index-div-48"
          className={classNames(
            'flex justify-between items-center mb-6',
            flushHorizontal && 'px-2 md:px-6',
          )}
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
                        className={desktopPrimaryClass}
                        textClassName={primaryActionTextClassName}
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
          className={classNames(
            'w-full h-auto border-t border-gray-100',
            // Flush body: no extra inset so split layout (e.g. Meetings) uses full width; header row keeps px-2/md:px-6 above.
            flushHorizontal ? 'pt-0 px-0' : 'pt-6',
          )}
        >
          {children}
        </div>
      </BlockWrapper>
    </div>
  );
};

export default TabLandingLayout;
