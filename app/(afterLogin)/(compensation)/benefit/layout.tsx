'use client';
import { FC, ReactNode, useEffect, useState } from 'react';
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
      const filteredData = data.filter((item: any) => item.type === 'MERIT');
      const dynamicMenuItems =
        filteredData?.map((allowance: any) => ({
          item: {
            key: allowance.id,
            label: (
              <p className="menu-item-label" title={allowance.name}>
                {allowance.name?.length > 15
                  ? allowance.name?.slice(0, 15) + '...'
                  : allowance.name || 'Unnamed Allowance'}
              </p>
            ),
            className: 'px-1',
          },
          link: `/benefit/${allowance.id}`,
        })) || [];

      const allAllowanceItem = {
        item: {
          key: 'variablePay',
          label: <p className="menu-item-label">Variable Pay</p>,
          className: 'px-1',
        },
        link: '/benefit/variablePay',
      };

      setMenuItems([allAllowanceItem, ...dynamicMenuItems]);
    }
  }, [data]);

  const sidebarMenuItems = new SidebarMenuItem(menuItems);

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="h-auto w-auto">
        <PageHeader title="Benefit" description="Benefit" />

        <div className="flex flex-col lg:flex-row gap-6 mt-8">
          <SidebarMenu menuItems={sidebarMenuItems} />

          <BlockWrapper className="flex-1 h-max overflow-x-auto">
            {children}
          </BlockWrapper>
        </div>
      </div>
    </div>
  );
};

export default BenefitLayout;
