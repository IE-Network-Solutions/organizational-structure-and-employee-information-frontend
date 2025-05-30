'use client';
import { FC, ReactNode } from 'react';
import { CiCalendarDate } from 'react-icons/ci';
import PageHeader from '@/components/common/pageHeader/pageHeader';
import BlockWrapper from '@/components/common/blockWrapper/blockWrapper';
import { SidebarMenuItem } from '@/types/sidebarMenu';
import SidebarMenu from '@/components/sidebarMenu';
import { usePathname } from 'next/navigation';

interface TimesheetSettingsLayoutProps {
  children: ReactNode;
}

const CompensationSettingLayout: FC<TimesheetSettingsLayoutProps> = ({
  children,
}) => {
  const pathname = usePathname();
  const menuItems = new SidebarMenuItem([
    {
      item: {
        key: 'allowanceType',
        icon: (
          <div
            className={`lg:flex items-center gap-2 ${pathname.includes('/compensationSetting/allowanceType') ? 'lg:ml-4' : ''}`}
          >
            <CiCalendarDate
              className={`hidden lg:inline ${pathname.includes('/compensationSetting/allowanceType') ? 'text-[#1677FF]' : ''}`}
            />
            <p className="menu-item-label">Allowance Type</p>
          </div>
        ),
        className: 'px-1',
      },
      link: '/compensationSetting/allowanceType',
    },
    {
      item: {
        key: 'benefitType',
        icon: (
          <div
            className={`lg:flex items-center gap-2 ${pathname.includes('/compensationSetting/benefitType') ? 'lg:ml-4' : ''}`}
          >
            <CiCalendarDate
              className={`hidden lg:inline ${pathname.includes('/compensationSetting/benefitType') ? 'text-[#1677FF]' : ''}`}
            />
            <p className="menu-item-label">Benefit Type</p>
          </div>
        ),
        className: 'px-1',
      },
      link: '/compensationSetting/benefitType',
    },
    {
      item: {
        key: 'deductionType',
        icon: (
          <div
            className={`lg:flex items-center gap-2 ${pathname.includes('/compensationSetting/deductionType') ? 'lg:ml-4' : ''}`}
          >
            <CiCalendarDate
              className={`hidden lg:inline ${pathname.includes('/compensationSetting/deductionType') ? 'text-[#1677FF]' : ''}`}
            />
            <p className="menu-item-label">Deduction Type</p>
          </div>
        ),
        className: 'px-1',
      },
      link: '/compensationSetting/deductionType',
    },
  ]);

  return (
    <div className="min-h-screen bg-[#fafafa] p-3">
      <div className="h-auto w-auto ">
        <PageHeader
          title="Settings"
          description="Compensation Settings"
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

export default CompensationSettingLayout;
