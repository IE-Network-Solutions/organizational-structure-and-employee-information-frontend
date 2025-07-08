'use client';
import { SidebarMenuItem } from '@/types/sidebarMenu';
import { CiCalendarDate } from 'react-icons/ci';
import { FC, ReactNode } from 'react';
import PageHeader from '@/components/common/pageHeader/pageHeader';
import SidebarMenu from '@/components/sidebarMenu';
import BlockWrapper from '@/components/common/blockWrapper/blockWrapper';
import { TbLayoutList } from 'react-icons/tb';

interface TnaSettingsLayoutProps {
  children: ReactNode;
}

const TnaSettingsLayout: FC<TnaSettingsLayoutProps> = ({ children }) => {
  const menuItems = new SidebarMenuItem([
    {
      item: {
        key: 'course-category',
        icon: <CiCalendarDate className="hidden lg:block" />,
        label: <p className="menu-item-label">Course Category</p>,
        className: 'px-1',
      },
      link: '/tna/settings/course-category',
    },
    {
      item: {
        key: 'tna-category',
        icon: <CiCalendarDate className="hidden lg:block" />,
        label: <p className="menu-item-label">TNA Category</p>,
        className: 'px-1',
      },
      link: '/tna/settings/tna-category',
    },
    {
      item: {
        key: 'commitment-rule',
        icon: <CiCalendarDate className="hidden lg:block" />,
        label: <p className="menu-item-label">Commitment Rule</p>,
        className: 'px-1',
      },
      link: '/tna/settings/commitment-rule',
    },
    {
      item: {
        key: 'approval-workflow',
        icon: <TbLayoutList className="hidden lg:block" />,
        label: <p className="menu-item-label">Approval Workflow</p>,
        className: 'px-1',
      },
      link: '/tna/settings/approvals',
    },
  ]);
  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="page-wrap">
        <PageHeader
          title="Settings"
          description="Training & Learning Settings"
        ></PageHeader>

        <div className="flex flex-col lg:flex-row gap-6 mt-8">
          <SidebarMenu menuItems={menuItems} />

          <BlockWrapper className="flex-1 h-max overflow-x-auto">
            {children}
          </BlockWrapper>
        </div>
      </div>
    </div>
  );
};

export default TnaSettingsLayout;
