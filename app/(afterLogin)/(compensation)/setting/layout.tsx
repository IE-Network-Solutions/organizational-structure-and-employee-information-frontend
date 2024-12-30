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

const CompensationSettingLayout: FC<TimesheetSettingsLayoutProps> = ({
  children,
}) => {
  const menuItems = new SidebarMenuItem([
    {
      item: {
        key: 'allowanceType',
        icon: <CiCalendarDate />,
        label: <p className="menu-item-label">Allowance Type</p>,
        className: 'px-1',
      },
      link: '/settings/allowanceType',
    },
    {
      item: {
        key: 'benefitType',
        icon: <CiCalendarDate />,
        label: <p className="menu-item-label">Benefit Type</p>,
        className: 'px-1',
      },
      link: '/settings/benefitType',
    },
  ]);

  return (
    <div className="h-auto w-auto pr-6 pb-6 pl-3">
      <PageHeader
        title="Settings"
        description="Compensation Settings"
      ></PageHeader>

      <div className="flex gap-6 mt-8">
        <SidebarMenu menuItems={menuItems} />

        <BlockWrapper className="flex-1 h-max">{children}</BlockWrapper>
      </div>
    </div>
  );
};

export default CompensationSettingLayout;