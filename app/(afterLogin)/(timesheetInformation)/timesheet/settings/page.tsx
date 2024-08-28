'use client';
import PageHeader from '@/components/common/pageHeader/pageHeader';
import { TbLayoutList } from 'react-icons/tb';
import { ConfigProvider, Menu } from 'antd';
import type { MenuProps } from 'antd';
import BlockWrapper from '@/components/common/blockWrapper/blockWrapper';
import { ReactNode, useState } from 'react';
import AllowedAreas from '@/app/(afterLogin)/(timesheetInformation)/timesheet/settings/_components/allowedAreas';
import { classNames } from '@/utils/classNames';

type MenuItem = Required<MenuProps>['items'][number];

type MenuItemComponent = MenuItem & {
  itemComponent: ReactNode;
};

const TimesheetSettings = () => {
  const [currentItem, setCurrentItem] = useState<string>('allowed-areas');

  const menuItems: MenuItemComponent[] = [
    {
      key: 'allowed-areas',
      label: (
        <div className="flex items-center gap-1.5">
          <TbLayoutList
            className={classNames('', {
              'text-[#4DAEF0]': currentItem === 'allowed-areas',
              'text-gray-500': currentItem !== 'allowed-areas',
            })}
          />
          <p className="font-bold text-sm text-gray-900">Allowed Areas</p>
        </div>
      ),
      className: currentItem === 'allowed-areas' ? 'px-4' : 'px-1',
      itemComponent: <AllowedAreas />,
    },
    {
      key: 'allowed-areas-2',
      label: (
        <div className="flex items-center gap-1.5">
          <TbLayoutList
            className={classNames('', {
              'text-[#4DAEF0]': currentItem === 'allowed-areas-2',
              'text-gray-500': currentItem !== 'allowed-areas-2',
            })}
          />
          <p className="font-bold text-sm text-gray-900">Allowed Areas 2</p>
        </div>
      ),
      className: currentItem === 'allowed-areas-2' ? 'px-4' : 'px-1',
      itemComponent: <AllowedAreas />,
    },
  ];

  const itemComponent = () =>
    menuItems.find((item) => item.key === currentItem)!.itemComponent;

  return (
    <div className="h-auto w-auto pr-6 pb-6 pl-3">
      <PageHeader
        title="Settings"
        description="Settings yout Leave here"
      ></PageHeader>

      <div className="flex gap-6 mt-8">
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
            className="w-[300px] rounded-2xl py-2 px-6 h-max"
            items={menuItems}
            mode="inline"
            defaultSelectedKeys={[currentItem]}
            onClick={(e) => setCurrentItem(e.key)}
          />
        </ConfigProvider>

        <BlockWrapper className="flex-1 h-max">{itemComponent()}</BlockWrapper>
      </div>
    </div>
  );
};

export default TimesheetSettings;
