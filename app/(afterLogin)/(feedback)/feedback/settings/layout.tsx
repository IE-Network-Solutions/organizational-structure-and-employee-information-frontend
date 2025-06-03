'use client';
import { FC, ReactNode } from 'react';
import PageHeader from '@/components/common/pageHeader/pageHeader';
import BlockWrapper from '@/components/common/blockWrapper/blockWrapper';
import { SidebarMenuItem } from '@/types/sidebarMenu';
import SidebarMenu from '@/components/sidebarMenu';
import { GoQuestion } from 'react-icons/go';
import { RiFeedbackLine } from 'react-icons/ri';
import { CiCalendarDate } from 'react-icons/ci';
import { IoListSharp } from 'react-icons/io5';
import { usePathname } from 'next/navigation';

interface TimesheetSettingsLayoutProps {
  children: ReactNode;
}

const CFRSettingLayout: FC<TimesheetSettingsLayoutProps> = ({ children }) => {
  const pathname = usePathname();
  const menuItems = new SidebarMenuItem([
    {
      item: {
        key: 'define-feedback',
        icon: (
          <div
            className={`lg:flex items-center gap-2 ${pathname.includes('/feedback/settings/define-feedback') ? 'lg:ml-4' : ''}`}
          >
            <RiFeedbackLine
              className={`hidden lg:block ${pathname.includes('/feedback/settings/define-feedback') ? 'text-[#1677FF]' : ''}`}
            />
            <p className="menu-item-label">Define Feedback</p>
          </div>
        ),
        className: 'px-1',
      },
      link: '/feedback/settings/define-feedback',
    },
    {
      item: {
        key: 'define-questions',
        icon: (
          <div
            className={`lg:flex items-center gap-2 ${pathname.includes('/feedback/settings/define-questions') ? 'lg:ml-4' : ''}`}
          >
            <GoQuestion
              className={`hidden lg:block ${pathname.includes('/feedback/settings/define-questions') ? 'text-[#1677FF]' : ''}`}
            />
            <p className="menu-item-label">Define Questions</p>
          </div>
        ),
        className: 'px-1',
      },
      link: '/feedback/settings/define-questions',
    },

    // {
    //   item: {
    //     key: 'feedback',
    //     icon: <CiCalendarDate />,
    //     label: <p className="menu-item-label">Feedback</p>,
    //     className: 'px-1',
    //   },
    //   link: '/feedback/settings/feedback',
    // },
    {
      item: {
        key: 'recognition',
        icon: (
          <div
            className={`lg:flex items-center gap-2 ${pathname.includes('/feedback/settings/recognition') ? 'lg:ml-4' : ''}`}
          >
            <CiCalendarDate
              className={`hidden lg:block ${pathname.includes('/feedback/settings/recognition') ? 'text-[#1677FF]' : ''}`}
            />
            <p className="menu-item-label">Recognition</p>
          </div>
        ),
        className: 'px-1',
      },
      link: '/feedback/settings/recognition',
    },
    {
      item: {
        key: 'target-achievement',
        icon: (
          <div
            className={`lg:flex items-center gap-2 ${pathname.includes('/feedback/settings/target-achievement') ? 'lg:ml-4' : ''}`}
          >
            <CiCalendarDate
              className={`hidden lg:block ${pathname.includes('/feedback/settings/target-achievement') ? 'text-[#1677FF]' : ''}`}
            />
            <p className="menu-item-label">Target Achievement</p>
          </div>
        ),
        className: 'px-1',
      },
      link: '/feedback/settings/target-achievement',
    },
    {
      item: {
        key: 'meeting-type',

        icon: (
          <div
            className={`lg:flex items-center gap-2 ${
              pathname.includes('/feedback/settings/define-meeting-type')
                ? 'lg:ml-4'
                : ''
            }`}
          >
            <IoListSharp
              className={`hidden lg:block ${pathname.includes('/feedback/settings/define-meeting-type') ? 'text-[#1677FF]' : ''}`}
            />
            <p className="menu-item-label">Meeting Type</p>
          </div>
        ),

        className: 'px-1',
      },
      link: '/feedback/settings/define-meeting-type',
    },
  ]);

  return (
    <div className="min-h-screen bg-[#fafafa] p-3">
      <div className="h-auto w-auto">
        <PageHeader
          title="Settings"
          description="Organizational development settings"
        ></PageHeader>

        <div className=" flex flex-col lg:flex-row gap-6 mt-3">
          <SidebarMenu menuItems={menuItems} />

          <BlockWrapper className="flex-1 h-max bg-[#fafafa] p-0">
            {children}
          </BlockWrapper>
        </div>
      </div>
    </div>
  );
};

export default CFRSettingLayout;
