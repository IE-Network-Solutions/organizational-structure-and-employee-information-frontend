'use client';
import { FC, ReactNode, useEffect, useState } from 'react';
import { Card, ConfigProvider, Menu, MenuProps } from 'antd';
import { TbLayoutList } from 'react-icons/tb';
import { usePathname, useRouter } from 'next/navigation';
import { FaBomb } from 'react-icons/fa';

interface OkrSettingsLayoutProps {
  children: ReactNode;
}

type MenuItem = Required<MenuProps>['items'][number];

type MenuItemType = {
  item: MenuItem;
  link: string;
};

class NMenuItem {
  items: MenuItemType[];
  constructor(items: MenuItemType[]) {
    this.items = items;
  }

  get onlyItems(): MenuItem[] {
    return this.items.map((item) => item.item);
  }

  findItem(itemKey: string): MenuItemType {
    const iComponent = this.items.find((item) => item.item!.key === itemKey);
    return iComponent ? iComponent : this.items[0];
  }
}

const PayrollSettingsLayout: FC<OkrSettingsLayoutProps> = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [currentItem, setCurrentItem] = useState<string>('');
  const menuItems = new NMenuItem([
    {
      item: {
        key: 'tax-rule',
        icon: (
          <TbLayoutList
            className={
              currentItem === 'tax-rule' ? 'text-[#4DAEF0]' : 'text-gray-500'
            }
          />
        ),
        label: <p className="font-bold text-sm text-gray-900">Tax Rule</p>,
        className: currentItem === 'tax-rule' ? 'px-4' : 'px-1',
      },
      link: '/settings/tax-rule',
    },
    {
      item: {
        key: 'pension',
        icon: (
          <TbLayoutList
            className={
              currentItem === 'pension' ? 'text-[#4DAEF0]' : 'text-gray-500'
            }
          />
        ),
        label: <p className="font-bold text-sm text-gray-900">Pension</p>,
        className: currentItem === 'planning-assignation' ? 'px-4' : 'px-1',
      },
      link: '/settings/pension',
    },
    {
      item: {
        key: 'pay-period',
        icon: (
          <FaBomb
            className={
              currentItem === 'pey-period' ? 'text-[#4DAEF0]' : 'text-gray-500'
            }
          />
        ),
        label: <p className="font-bold text-sm text-gray-900">Pay Period</p>,
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

  const onMenuClick = (e: any) => {
    const key = e['key'] as string;
    router.push(menuItems.findItem(key).link);
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 w-full h-auto">
      <div className="flex justify-start">
        <Card className="shadow-none" bordered={false}>
          <p className="font-bold text-lg md:text-xl lg:text-3xl">Setting</p>
          <p className="text-gray-400 text-sm md:text-base">Payroll Settings</p>
        </Card>
      </div>
      <div className="flex flex-col md:flex-row gap-4 md:gap-6 mt-6 md:mt-8">
        <ConfigProvider
          theme={{
            components: {
              Menu: {
                itemHeight: 56,
                itemPaddingInline: 0,
                itemMarginInline: 0,
                itemMarginBlock: 16,
                itemActiveBg: '#F8F8F8',
                itemHoverBg: 'rgba(248,248,248,0.92)',
              },
            },
          }}
        >
          <Menu
            className="w-full md:w-[250px] lg:w-[300px] rounded-2xl py-2 px-6 h-max border border-gray-300"
            items={menuItems.onlyItems}
            mode="inline"
            selectedKeys={[currentItem]}
            onClick={onMenuClick}
          />
        </ConfigProvider>

        <div className="w-full border border-gray-300 rounded-2xl">
          {children}
        </div>
      </div>
    </div>
  );
};

export default PayrollSettingsLayout;
