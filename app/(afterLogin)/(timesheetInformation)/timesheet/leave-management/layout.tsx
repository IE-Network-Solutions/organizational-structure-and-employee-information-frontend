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
      className="h-auto bg-[#F5F5F5] sm:bg-white pb-6"
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
