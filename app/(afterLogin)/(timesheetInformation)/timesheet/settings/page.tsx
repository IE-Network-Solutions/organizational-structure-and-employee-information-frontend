'use client';
import PageHeader from '@/components/common/pageHeader/pageHeader';
import { TbLayoutList } from 'react-icons/tb';
import { ConfigProvider, Menu } from 'antd';
import type { MenuProps } from 'antd';
import BlockWrapper from '@/components/common/blockWrapper/blockWrapper';
import { ReactNode, useState } from 'react';
import AllowedAreas from './_components/allowedAreas';
import { classNames } from '@/utils/classNames';
import AttendanceRules from './_components/attendanceRules';
import ImportedLogs from './_components/importedLogs';
import AccrualRule from './_components/accrualRule';
import CarryOverRule from './_components/carryOverRule';
import { FiFileText } from 'react-icons/fi';
import LeaveTypesAndPolicies from './_components/leaveTypesAndPolicies';
import { CiCalendarDate } from 'react-icons/ci';
import ClosedDate from './_components/closedDate';

type MenuItem = Required<MenuProps>['items'][number];

type MenuItemComponent = MenuItem & {
  itemComponent: ReactNode;
};

const TimesheetSettings = () => {
  const [currentItem, setCurrentItem] = useState<string>('closed-date');

  const menuItems: MenuItemComponent[] = [
    {
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
      itemComponent: <ClosedDate />,
    },
    {
      key: 'leave-types-adn-policies',
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
      itemComponent: <LeaveTypesAndPolicies />,
    },
    {
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
      itemComponent: <AllowedAreas />,
    },
    {
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
      itemComponent: <AttendanceRules />,
    },
    {
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
      itemComponent: <ImportedLogs />,
    },
    {
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
      itemComponent: <AccrualRule />,
    },
    {
      key: 'carry-over-rule',
      icon: (
        <TbLayoutList
          className={classNames('', {
            'text-[#4DAEF0]': currentItem === 'carry-over-rule',
            'text-gray-500': currentItem !== 'carry-over-rule',
          })}
        />
      ),
      label: <p className="font-bold text-sm text-gray-900">Carry-over Rule</p>,
      className: currentItem === 'carry-over-rule' ? 'px-4' : 'px-1',
      itemComponent: <CarryOverRule />,
    },
  ];

  const itemComponent = () => {
    const item = menuItems.find((item) => item.key === currentItem);
    return item ? item.itemComponent : menuItems[0].itemComponent;
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
