'use client';
import { FC, ReactNode } from 'react';
import BlockWrapper from '@/components/common/blockWrapper/blockWrapper';
import { SidebarMenuItem } from '@/types/sidebarMenu';
import TopbarMenu from '@/components/topbarMenu';
import { HiQueueList } from 'react-icons/hi2';
import { FaRegCalendarMinus } from 'react-icons/fa';
interface TimesheetSettingsLayoutProps {
  children: ReactNode;
}

const NewSettingsLayout: FC<TimesheetSettingsLayoutProps> = ({ children }) => {
  const menuItems = new SidebarMenuItem([
    {
      item: {
        key: 'leaves',
        icon: (
          <FaRegCalendarMinus data-cy="time-attendance-leave-management-leaves-icon" />
        ),
        label: (
          <p
            id="time-attendance-leave-management-leaves-label"
            data-cy="time-attendance-leave-management-leaves-label"
            className="menu-item-label"
          >
            Leave Management
          </p>
        ),
        className: 'px-1',
      },
      link: '/timesheet/leave-management/leaves',
    },
    {
      item: {
        key: 'leave-balance',
        icon: (
          <HiQueueList data-cy="time-attendance-leave-management-leave-balance-icon" />
        ),
        label: (
          <p
            id="time-attendance-leave-management-leave-balance-label"
            data-cy="time-attendance-leave-management-leave-balance-label"
            className="menu-item-label"
          >
            Leave Balance
          </p>
        ),
        className: 'px-1',
      },
      link: '/timesheet/leave-management/leave-balance',
    },
  ]);

  return (
    <div
      id="time-attendance-leave-management-layout-container"
      data-cy="time-attendance-leave-management-layout-container"
      className="h-auto w-auto bg-[#F5F5F5] sm:bg-white pr-3 pb-6 pl-6 sm:pl-3"
    >
      <TopbarMenu
        data-cy="time-attendance-leave-management-layout-topbar-menu"
        menuItems={menuItems}
      />
      <div
        id="time-attendance-leave-management-layout-content-container"
        data-cy="time-attendance-leave-management-layout-content-container"
        className="flex flex-col gap-6 mt-8"
      ></div>
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
