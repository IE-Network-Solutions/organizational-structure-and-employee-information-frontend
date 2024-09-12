'use client';
import { SidebarMenuItem } from '@/types/sidebarMenu';
import { CiCalendarDate } from 'react-icons/ci';
import { FC, ReactNode } from 'react';
import PageHeader from '@/components/common/pageHeader/pageHeader';
import SidebarMenu from '@/components/sidebarMenu';
import BlockWrapper from '@/components/common/blockWrapper/blockWrapper';

interface TnaSettingsLayoutProps {
  children: ReactNode;
}

const TnaSettingsLayout: FC<TnaSettingsLayoutProps> = ({ children }) => {
  const menuItems = new SidebarMenuItem([
    {
      item: {
        key: 'course-category',
        icon: <CiCalendarDate />,
        label: <p className="menu-item-label">Course Category</p>,
        className: 'px-1',
      },
      link: '/tna/settings/course-category',
    },
    {
      item: {
        key: 'tna-category',
        icon: <CiCalendarDate />,
        label: <p className="menu-item-label">TNA Category</p>,
        className: 'px-1',
      },
      link: '/tna/settings/tna-category',
    },
    {
      item: {
        key: 'commitment-rule',
        icon: <CiCalendarDate />,
        label: <p className="menu-item-label">Commitment Rule</p>,
        className: 'px-1',
      },
      link: '/tna/settings/commitment-rule',
    },
  ]);
  return (
    <div className="h-auto w-auto pr-6 pb-6 pl-3">
      <PageHeader
        title="Settings"
        description="Training & Learning Settings"
      ></PageHeader>

      <div className="flex gap-6 mt-8">
        <SidebarMenu menuItems={menuItems} />

        <BlockWrapper className="flex-1 h-max">{children}</BlockWrapper>
      </div>
    </div>
  );
};

export default TnaSettingsLayout;
