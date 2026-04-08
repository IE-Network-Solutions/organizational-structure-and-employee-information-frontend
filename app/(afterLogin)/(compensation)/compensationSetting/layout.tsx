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
  const path = pathname ?? '';
  const menuItems = new SidebarMenuItem([
    {
      item: {
        key: 'allowanceType',
        icon: (
          <div
            className={`lg:flex items-center gap-2 ${path.includes('/compensationSetting/allowanceType') ? 'lg:ml-4' : ''}`}
            data-cy="compensation-settings-menu-allowance-type"
          >
            <CiCalendarDate
              className={`hidden lg:inline ${path.includes('/compensationSetting/allowanceType') ? 'text-[#1677FF]' : ''}`}
              data-cy="compensation-settings-menu-allowance-type-icon"
            />
            <p
              className="menu-item-label"
              data-cy="compensation-settings-menu-allowance-type-text"
            >
              Allowance Type
            </p>
          </div>
        ),
      },
      link: '/compensationSetting/allowanceType',
    },
    {
      item: {
        key: 'benefitType',
        icon: (
          <div
            className={`lg:flex items-center gap-2 ${path.includes('/compensationSetting/benefitType') ? 'lg:ml-4' : ''}`}
            data-cy="compensation-settings-menu-benefit-type"
          >
            <CiCalendarDate
              className={`hidden lg:inline ${path.includes('/compensationSetting/benefitType') ? 'text-[#1677FF]' : ''}`}
              data-cy="compensation-settings-menu-benefit-type-icon"
            />
            <p
              className="menu-item-label"
              data-cy="compensation-settings-menu-benefit-type-text"
            >
              Benefit Type
            </p>
          </div>
        ),
      },
      link: '/compensationSetting/benefitType',
    },
    {
      item: {
        key: 'deductionType',
        icon: (
          <div
            className={`lg:flex items-center gap-2 ${path.includes('/compensationSetting/deductionType') ? 'lg:ml-4' : ''}`}
            data-cy="compensation-settings-menu-deduction-type"
          >
            <CiCalendarDate
              className={`hidden lg:inline ${path.includes('/compensationSetting/deductionType') ? 'text-[#1677FF]' : ''}`}
              data-cy="compensation-settings-menu-deduction-type-icon"
            />
            <p
              className="menu-item-label"
              data-cy="compensation-settings-menu-deduction-type-text"
            >
              Deduction Type
            </p>
          </div>
        ),
      },
      link: '/compensationSetting/deductionType',
    },
  ]);

  return (
    <div
      className="min-h-screen bg-[#f5f5f5]"
      id="compensation-settings-layout-wrapper"
      data-cy="compensation-settings-layout-wrapper"
    >
      <div
        className="h-auto w-auto bg-[#f5f5f5]"
        id="compensation-settings-layout-body"
        data-cy="compensation-settings-layout-body"
      >
        <PageHeader
          title="Settings"
          description="Compensation Settings"
          className="hidden sm:block"
          horizontalPadding="0px"
          data-cy="compensation-settings-layout-header-title"
        />
        <div
          className="flex flex-col lg:flex-row gap-3 sm:gap-6"
          id="compensation-settings-layout-content"
          data-cy="compensation-settings-layout-content"
        >
          <SidebarMenu
            menuItems={menuItems}
            data-cy="compensation-settings-layout-sidebar-menu"
          />
          <BlockWrapper
            className="flex-1 h-max overflow-x-auto sm:mr-4"
            data-cy="compensation-settings-layout-block-wrapper-content"
          >
            {children}
          </BlockWrapper>
        </div>
      </div>
    </div>
  );
};

export default CompensationSettingLayout;
