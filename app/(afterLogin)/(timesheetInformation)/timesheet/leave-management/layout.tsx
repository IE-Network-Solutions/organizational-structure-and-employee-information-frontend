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
        icon: <FaRegCalendarMinus />,
        label: <p className="menu-item-label">Leave Management</p>,
        className: 'px-1',
      },
      link: '/timesheet/leave-management/leaves',
    },
    {
      item: {
        key: 'leave-balance',
        icon: <HiQueueList />,
        label: <p className="menu-item-label">Leave Balance</p>,
        className: 'px-1',
      },
      link: '/timesheet/leave-management/leave-balance',
    },
  ]);

  return (
    <div className="h-auto w-auto bg-gray-100 sm:bg-white pr-3 pb-6 pl-6 sm:pl-3">
      <div className=" flex justify-between">
        <div className=""></div>
        <TopbarMenu menuItems={menuItems} />
      </div>
      <div className="flex flex-col gap-6 mt-8"></div>
      <BlockWrapper className="flex-1 h-max">{children}</BlockWrapper>
    </div>
  );
};

export default NewSettingsLayout;
