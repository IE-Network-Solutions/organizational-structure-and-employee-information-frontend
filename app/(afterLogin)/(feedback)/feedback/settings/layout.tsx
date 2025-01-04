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
        key: 'recognition',
        icon: <CiCalendarDate />,
        label: <p className="menu-item-label">Recognition</p>,
        className: 'px-1',
      },
      link: '/feedback/settings/recognition',
    },
    {
      item: {
        key: 'define-feedback',
        icon: <CiCalendarDate />,
        label: <p className="menu-item-label">Define Feedback</p>,
        className: 'px-1',
      },
      link: '/feedback/settings/define-feedback',
    },
    {
      item: {
        key: 'define-questions',
        icon: <CiCalendarDate />,
        label: <p className="menu-item-label">Define Questions</p>,
        className: 'px-1',
      },
      link: '/feedback/settings/define-questions',
    }
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
