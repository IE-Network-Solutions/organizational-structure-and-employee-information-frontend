'use client';
import { FC, ReactNode, useEffect, useState } from 'react';
import { CiCalendarDate } from 'react-icons/ci';
import PageHeader from '@/components/common/pageHeader/pageHeader';
import BlockWrapper from '@/components/common/blockWrapper/blockWrapper';
import SidebarMenu from '@/components/sidebarMenu';
import { useFetchBenefits } from '@/store/server/features/compensation/benefit/queries';
import { SidebarMenuItem } from '@/types/sidebarMenu';

interface TimesheetSettingsLayoutProps {
  children: ReactNode;
}

const BenefitLayout: FC<TimesheetSettingsLayoutProps> = ({ children }) => {
  const { data } = useFetchBenefits();
  const [menuItems, setMenuItems] = useState<any>([]);

  useEffect(() => {
    if (data) {
      const filteredData = data.filter(
        (item: any) => item.type === 'DEDUCTION',
      );
      const dynamicMenuItems =
        filteredData?.map((deduction: any) => ({
          item: {
            key: deduction.id,
            icon: <CiCalendarDate />,
            label: (
              <p className="menu-item-label">
                {deduction.name || 'Unnamed Allowance'}
              </p>
            ),
            className: 'px-1',
          },
          link: `/deduction/${deduction.id}`,
        })) || [];

      const allAllowanceItem = {
        item: {
          key: 'allAllowance',
          icon: <CiCalendarDate />,
          label: <p className="menu-item-label">All Deductions</p>,
          className: 'px-1',
        },
        link: '/deduction/allDeduction',
      };

      setMenuItems([allAllowanceItem, ...dynamicMenuItems]);
    }
  }, [data]);

  const sidebarMenuItems = new SidebarMenuItem(menuItems);

  return (
    <div className="h-auto w-auto pr-6 pb-6 pl-3">
      <PageHeader title="Deduction" description="Deduction" />

      <div className="flex gap-6 mt-8">
        <SidebarMenu menuItems={sidebarMenuItems} />

        <BlockWrapper className="flex-1 h-max">{children}</BlockWrapper>
      </div>
    </div>
  );
};

export default BenefitLayout;
