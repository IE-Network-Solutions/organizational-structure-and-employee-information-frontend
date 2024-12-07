'use client';
import { FC, ReactNode } from 'react';
import { CiCalendarDate } from 'react-icons/ci';
import PageHeader from '@/components/common/pageHeader/pageHeader';
import BlockWrapper from '@/components/common/blockWrapper/blockWrapper';
import { SidebarMenuItem } from '@/types/sidebarMenu';
import SidebarMenu from '@/components/sidebarMenu';

interface TimesheetSettingsLayoutProps {
  children: ReactNode;
}

const CFRSettingLayout: FC<TimesheetSettingsLayoutProps> = ({ children }) => {
  const menuItems = new SidebarMenuItem([
    {
      item: {
        key: 'feedback',
        icon: <CiCalendarDate />,
        label: <p className="menu-item-label">Feedback</p>,
        className: 'px-1',
      },
      link: '/feedback/settings/feedback',
    },
    {
      item: {
        key: 'recognition-setting',
        icon: <CiCalendarDate />,
        label: <p className="menu-item-label">Recognition</p>,
        className: 'px-1',
      },
      link: '/feedback/settings/recognition',
    },
  ]);

  return (
    <div className="h-auto w-auto pr-6 pb-6 pl-3">
      <PageHeader
        title="Settings"
        description="Organizational development settings"
      ></PageHeader>

      <div className="flex gap-6 mt-8">
        <SidebarMenu menuItems={menuItems} />

        <BlockWrapper className="flex-1 h-max">{children}</BlockWrapper>
      </div>
    </div>
  );
};

export default CFRSettingLayout;
