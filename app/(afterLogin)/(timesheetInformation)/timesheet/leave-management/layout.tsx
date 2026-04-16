'use client';
import { FC, ReactNode } from 'react';
import BlockWrapper from '@/components/common/blockWrapper/blockWrapper';

interface TimesheetSettingsLayoutProps {
  children: ReactNode;
}

const NewSettingsLayout: FC<TimesheetSettingsLayoutProps> = ({ children }) => {
  return (
    <div
      id="time-attendance-leave-management-layout-container"
      data-cy="time-attendance-leave-management-layout-container"
      className="h-auto w-auto px-0 pb-6 sm:bg-white"
    >
      <BlockWrapper
        data-cy="time-attendance-leave-management-layout-block-wrapper"
        className="flex-1 h-max"
      >
        {children}
      </BlockWrapper>
    </div>
  );
};

export default NewSettingsLayout;
