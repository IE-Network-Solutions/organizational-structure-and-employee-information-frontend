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
              <div className=" font-bold" title={allowance.name}>
                {allowance.name?.length > 15
                  ? allowance.name?.slice(0, 15) + '...'
                  : allowance.name || 'Unnamed Allowance'}
              </div>
            ),
            className: 'px-1',
          },
          link: `/benefit/${allowance.id}`,
        })) || [];

      const allAllowanceItem = {
        item: {
          key: 'variablePay',
          label: <div className=" font-bold">Variable Pay</div>,
          className: 'px-1',
        },
        link: '/benefit/variablePay',
      };

      setMenuItems([allAllowanceItem, ...dynamicMenuItems]);
    }
  }, [data]);

  const sidebarMenuItems = new SidebarMenuItem(menuItems);

  return (
    <div className="min-h-screen">
      <div className="h-auto w-auto bg-[#f5f5f5]">
        <PageHeader
          title="Benefit"
          description="Benefit"
          className="hidden sm:block"
        />

        <div className="flex flex-col lg:flex-row gap-0 sm:gap-6">
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
