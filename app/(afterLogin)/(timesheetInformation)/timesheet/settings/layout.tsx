'use client';
import { FC, ReactNode, useEffect, useState } from 'react';
import { ConfigProvider, Menu, MenuProps } from 'antd';
import { CiCalendarDate } from 'react-icons/ci';
import { classNames } from '@/utils/classNames';
import { FiFileText } from 'react-icons/fi';
import { TbLayoutList } from 'react-icons/tb';
import PageHeader from '@/components/common/pageHeader/pageHeader';
import BlockWrapper from '@/components/common/blockWrapper/blockWrapper';
import { usePathname, useRouter } from 'next/navigation';

interface TimesheetSettingsLayoutProps {
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

const TimesheetSettingsLayout: FC<TimesheetSettingsLayoutProps> = ({
  children,
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const [currentItem, setCurrentItem] = useState<string>('');
  const menuItems = new NMenuItem([
    {
      item: {
        key: 'closed-date',
        icon: (
          <CiCalendarDate
            className={classNames('', {
              'text-[#4DAEF0]': currentItem === 'closed-date',
              'text-gray-500': currentItem !== 'closed-date',
            })}
          />
        ),
        label: <p className="font-bold text-sm text-gray-900">Closed Date</p>,
        className: currentItem === 'closed-date' ? 'px-4' : 'px-1',
      },
      link: '/timesheet/settings/closed-date',
    },
    {
      item: {
        key: 'leave-types-and-policies',
        icon: (
          <FiFileText
            className={classNames('', {
              'text-[#4DAEF0]': currentItem === 'leave-types-adn-policies',
              'text-gray-500': currentItem !== 'leave-types-adn-policies',
            })}
          />
        ),
        label: (
          <p className="font-bold text-sm text-gray-900">
            Leave Types & Policies
          </p>
        ),
        className: currentItem === 'leave-types-adn-policies' ? 'px-4' : 'px-1',
      },
      link: '/timesheet/settings/leave-types-and-policies',
    },
    {
      item: {
        key: 'allowed-areas',
        icon: (
          <TbLayoutList
            className={classNames('', {
              'text-[#4DAEF0]': currentItem === 'allowed-areas',
              'text-gray-500': currentItem !== 'allowed-areas',
            })}
          />
        ),
        label: <p className="font-bold text-sm text-gray-900">Allowed Areas</p>,
        className: currentItem === 'allowed-areas' ? 'px-4' : 'px-1',
      },
      link: '/timesheet/settings/allowed-areas',
    },
    {
      item: {
        key: 'attendance-rules',
        icon: (
          <TbLayoutList
            className={classNames('', {
              'text-[#4DAEF0]': currentItem === 'attendance-rules',
              'text-gray-500': currentItem !== 'attendance-rules',
            })}
          />
        ),
        label: (
          <p className="font-bold text-sm text-gray-900">Attendance Rules</p>
        ),
        className: currentItem === 'attendance-rules' ? 'px-4' : 'px-1',
      },
      link: '/timesheet/settings/attendance-rules',
    },
    {
      item: {
        key: 'imported-logs',
        icon: (
          <TbLayoutList
            className={classNames('', {
              'text-[#4DAEF0]': currentItem === 'imported-logs',
              'text-gray-500': currentItem !== 'imported-logs',
            })}
          />
        ),
        label: <p className="font-bold text-sm text-gray-900">Imported Logs</p>,
        className: currentItem === 'imported-logs' ? 'px-4' : 'px-1',
      },
      link: '/timesheet/settings/imported-logs',
    },
    {
      item: {
        key: 'accrual-rule',
        icon: (
          <TbLayoutList
            className={classNames('', {
              'text-[#4DAEF0]': currentItem === 'accrual-rule',
              'text-gray-500': currentItem !== 'accrual-rule',
            })}
          />
        ),
        label: <p className="font-bold text-sm text-gray-900">Accrual Rule</p>,
        className: currentItem === 'accrual-rule' ? 'px-4' : 'px-1',
      },
      link: '/timesheet/settings/accrual-rule',
    },
    {
      item: {
        key: 'carry-over-rule',
        icon: (
          <TbLayoutList
            className={classNames('', {
              'text-[#4DAEF0]': currentItem === 'carry-over-rule',
              'text-gray-500': currentItem !== 'carry-over-rule',
            })}
          />
        ),
        label: (
          <p className="font-bold text-sm text-gray-900">Carry-over Rule</p>
        ),
        className: currentItem === 'carry-over-rule' ? 'px-4' : 'px-1',
      },
      link: '/timesheet/settings/carry-over-rule',
    },
    {
      item: {
        key: 'approval-levels',
        icon: (
          <TbLayoutList
            className={classNames('', {
              'text-[#4DAEF0]': currentItem === 'approval-levels',
              'text-gray-500': currentItem !== 'approval-levels',
            })}
          />
        ),
        label: (
          <p className="font-bold text-sm text-gray-900">Approval Levels</p>
        ),
        className: currentItem === 'approval-levels' ? 'px-4' : 'px-1',
      },
      link: '/timesheet/settings/approval-levels',
    },
    {
      item: {
        key: 'leave-request',
        icon: (
          <TbLayoutList
            className={classNames('', {
              'text-[#4DAEF0]': currentItem === 'leave-request',
              'text-gray-500': currentItem !== 'leave-request',
            })}
          />
        ),
        label: (
          <p className="font-bold text-sm text-gray-900">Leave Requests</p>
        ),
        className: currentItem === 'leave-request' ? 'px-4' : 'px-1',
      },
      link: '/timesheet/settings/leave-request',
    },
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
            items={menuItems.onlyItems}
            mode="inline"
            selectedKeys={[currentItem]}
            onClick={onMenuClick}
          />
        </ConfigProvider>

        <BlockWrapper className="flex-1 h-max">{children}</BlockWrapper>
      </div>
    </div>
  );
};

export default TimesheetSettingsLayout;
