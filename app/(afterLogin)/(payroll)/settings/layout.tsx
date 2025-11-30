'use client';
import { FC, ReactNode, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import PageHeader from '@/components/common/pageHeader/pageHeader';
import { MdOutlinePayments } from 'react-icons/md';
import { HiOutlineReceiptTax } from 'react-icons/hi';
import { GiSuspensionBridge } from 'react-icons/gi';
import SidebarMenu from '@/components/sidebarMenu';
import { SidebarMenuItem } from '@/types/sidebarMenu';
import { useMediaQuery } from 'react-responsive';

interface OkrSettingsLayoutProps {
  children: ReactNode;
}

// type MenuItem = Required<MenuProps>['items'][number];

// type MenuItemType = {
//   item: MenuItem;
//   link: string;

// };

// class NMenuItem {
//   items: MenuItemType[];
//   constructor(items: MenuItemType[]) {
//     this.items = items;
//   }

//   get onlyItems(): MenuItem[] {
//     return this.items.map((item) => item.item);
//   }

//   findItem(itemKey: string): MenuItemType {
//     const iComponent = this.items.find((item) => item.item!.key === itemKey);
//     return iComponent ? iComponent : this.items[0];
//   }
// }

const PayrollSettingsLayout: FC<OkrSettingsLayoutProps> = ({ children }) => {
  const pathname = usePathname();
  const [currentItem, setCurrentItem] = useState<string>('');
  const isMobile = useMediaQuery({ maxWidth: 1024 });

  const menuItems = new SidebarMenuItem([
    {
      item: {
        key: 'tax-rule',
        icon: !isMobile ? (
          <HiOutlineReceiptTax
            data-cy="payroll-settings-tax-rule-icon-view-icon"
            className={
              currentItem === 'tax-rule' ? 'text-[#4DAEF0]' : 'text-gray-500'
            }
          />
        ) : null,
        label: (
          <p
            data-cy="payroll-settings-tax-rule-label-view-text"
            className={`font-bold text-sm ${isMobile ? (currentItem === 'tax-rule' ? 'text-[#3738f0]' : 'text-gray-900') : 'text-gray-900'}`}
          >
            Tax Rule
          </p>
        ),
        className: currentItem === 'tax-rule' ? 'px-4' : 'px-1',
      },
      link: '/settings/tax-rule',
    },
    {
      item: {
        key: 'pension',
        icon: !isMobile ? (
          <GiSuspensionBridge
            data-cy="payroll-settings-pension-icon-view-icon"
            className={
              currentItem === 'pension' ? 'text-[#4DAEF0]' : 'text-gray-500'
            }
          />
        ) : null,
        label: (
          <p
            data-cy="payroll-settings-pension-label-view-text"
            className={`font-bold text-sm ${isMobile ? (currentItem === 'pension' ? 'text-[#3738f0]' : 'text-gray-900') : 'text-gray-900'}`}
          >
            Pension
          </p>
        ),
        className: currentItem === 'pension' ? 'px-4' : 'px-1',
      },
      link: '/settings/pension',
    },

    {
      item: {
        key: 'pay-period',
        icon: !isMobile ? (
          <MdOutlinePayments
            data-cy="payroll-settings-pay-period-icon-view-icon"
            className={
              currentItem === 'pay-period' ? 'text-[#4DAEF0]' : 'text-gray-500'
            }
          />
        ) : null,
        label: (
          <p
            data-cy="payroll-settings-pay-period-label-view-text"
            className={`font-bold text-sm ${isMobile ? (currentItem === 'pay-period' ? 'text-[#3738f0]' : 'text-gray-900') : 'text-gray-900'}`}
          >
            Pay Period
          </p>
        ),
        className: currentItem === 'pay-period' ? 'px-4' : 'px-1',
      },
      link: '/settings/pay-period',
    },
    // {
    //   item: {
    //     key: 'banks',
    //     icon: (
    //       <TbTargetArrow
    //         className={
    //           currentItem === 'banks' ? 'text-[#4DAEF0]' : 'text-gray-500'
    //         }
    //       />
    //     ),
    //     label: <p className="font-bold text-sm text-gray-900">Banks</p>,
    //     className: currentItem === 'banks' ? 'px-4' : 'px-1',
    //   },
    //   link: '/settings/banks',
    // },
  ]);

  useEffect(() => {
    const pathSegments = pathname.split('/').filter(Boolean);
    const lastKey = pathSegments[pathSegments.length - 1];

    setCurrentItem(lastKey);
  }, [pathname]);

  // const onMenuClick = (e: any) => {
  //   const key = e['key'] as string;
  //   router.push(menuItems.findItem(key).link);
  // };

  return (
    <div
      id="payroll-settings-page-view-container"
      data-cy="payroll-settings-page-view-container"
      className="min-h-screen bg-[#fafafa] p-3"
    >
      <div
        id="payroll-settings-page-content-view-container"
        data-cy="payroll-settings-page-content-view-container"
        className="w-full h-auto"
      >
        <div
          id="payroll-settings-page-header-view-container"
          data-cy="payroll-settings-page-header-view-container"
        >
          <PageHeader
            data-cy="payroll-settings-page-header-title-view-text"
            title="Settings"
            description="Payroll Settings"
          />
        </div>
        <div
          id="payroll-settings-layout-view-container"
          data-cy="payroll-settings-layout-view-container"
          className="flex  flex-col lg:flex-row gap-6 mt-3"
        >
          <div
            id="payroll-settings-sidebar-view-container"
            data-cy="payroll-settings-sidebar-view-container"
          >
            <SidebarMenu
              data-cy="payroll-settings-sidebar-menu-view-container"
              menuItems={menuItems}
            />
          </div>
          <div
            id="payroll-settings-content-view-container"
            data-cy="payroll-settings-content-view-container"
            className="w-full  rounded-2xl overflow-x-auto bg-[#fafafa]"
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PayrollSettingsLayout;
