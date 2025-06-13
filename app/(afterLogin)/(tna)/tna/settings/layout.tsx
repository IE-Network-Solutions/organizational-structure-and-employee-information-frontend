'use client';
import { SidebarMenuItem } from '@/types/sidebarMenu';
import { CiCalendarDate } from 'react-icons/ci';
import { FC, ReactNode } from 'react';
import PageHeader from '@/components/common/pageHeader/pageHeader';
import SidebarMenu from '@/components/sidebarMenu';
import BlockWrapper from '@/components/common/blockWrapper/blockWrapper';
import { TbLayoutList } from 'react-icons/tb';
import { usePathname } from 'next/navigation';

interface TnaSettingsLayoutProps {
  children: ReactNode;
}

const TnaSettingsLayout: FC<TnaSettingsLayoutProps> = ({ children }) => {
  const pathname = usePathname();
  const menuItems = new SidebarMenuItem([
    {
      item: {
        key: 'course-category',
        icon: (
          <div
            className={`lg:flex items-center gap-2 ${pathname.includes('/tna/settings/course-category') ? 'lg:ml-4' : ''}`}
          >
            <CiCalendarDate
              className={`hidden lg:block ${pathname.includes('/tna/settings/course-category') ? 'text-[#1677FF]' : ''}`}
            />
            <p className="menu-item-label">Course Category</p>
          </div>
        ),
        className: 'px-1',
      },
      link: '/tna/settings/course-category',
    },
    {
      item: {
        key: 'tna-category',
        icon: (
          <div
            className={`lg:flex items-center gap-2 ${pathname.includes('/tna/settings/tna-category') ? 'lg:ml-4' : ''}`}
          >
            <CiCalendarDate
              className={`hidden lg:block ${pathname.includes('/tna/settings/tna-category') ? 'text-[#1677FF]' : ''}`}
            />
            <p className="menu-item-label">TNA Category</p>
          </div>
        ),
        className: 'px-1',
      },
      link: '/tna/settings/tna-category',
    },
    {
      item: {
        key: 'commitment-rule',
        icon: (
          <div
            className={`lg:flex items-center gap-2 ${pathname.includes('/tna/settings/commitment-rule') ? 'lg:ml-4' : ''}`}
          >
            <CiCalendarDate
              className={`hidden lg:block ${pathname.includes('/tna/settings/commitment-rule') ? 'text-[#1677FF]' : ''}`}
            />
            <p className="menu-item-label">Commitment Rule</p>
          </div>
        ),
        className: 'px-1',
      },
      link: '/tna/settings/commitment-rule',
    },
    {
      item: {
        key: 'approvals',
        icon: (
          <div
            className={`lg:flex items-center gap-2 ${pathname.includes('/tna/settings/approvals') ? 'lg:ml-4' : ''}`}
          >
            <TbLayoutList
              className={`hidden lg:block ${pathname.includes('/tna/settings/approvals') ? 'text-[#1677FF]' : ''}`}
            />
            <p className="menu-item-label">Approval Workflow</p>
          </div>
        ),
        className: 'px-1',
      },
      link: '/tna/settings/approvals',
    },
  ]);
  return (
    <div className="min-h-screen bg-[#fafafa] p-3">
      <div className="h-auto w-auto">
        <PageHeader
          title="Settings"
          description="Training & Learning Settings"
        ></PageHeader>

        <div className="flex flex-col lg:flex-row gap-6 mt-3">
          <SidebarMenu menuItems={menuItems} />

          <BlockWrapper className="flex-1 h-max overflow-x-auto bg-[#fafafa] p-0">
            {children}
          </BlockWrapper>
        </div>
      </div>
    </div>
  );
};

export default TnaSettingsLayout;
