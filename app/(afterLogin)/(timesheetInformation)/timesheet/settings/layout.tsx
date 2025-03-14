'use client';
import { FC, ReactNode } from 'react';
import { CiCalendarDate } from 'react-icons/ci';
import { FiFileText } from 'react-icons/fi';
import { TbLayoutList } from 'react-icons/tb';
import PageHeader from '@/components/common/pageHeader/pageHeader';
import BlockWrapper from '@/components/common/blockWrapper/blockWrapper';
import { SidebarMenuItem } from '@/types/sidebarMenu';
import SidebarMenu from '@/components/sidebarMenu';

interface TimesheetSettingsLayoutProps {
  children: ReactNode;
}

const TimesheetSettingsLayout: FC<TimesheetSettingsLayoutProps> = ({
  children,
}) => {
  const menuItems = new SidebarMenuItem([
    {
      item: {
        key: 'closed-date',
        icon: <CiCalendarDate />,
        label: <p className="menu-item-label">Closed Date</p>,
        className: 'px-1',
      },
      link: '/timesheet/settings/closed-date',
    },
    {
      item: {
        key: 'break-type',
        icon: <CiCalendarDate />,
        label: <p className="menu-item-label">Break Type</p>,
        className: 'px-1',
      },
      link: '/timesheet/settings/break-type',
    },
    {
      item: {
        key: 'leave-types-and-policies',
        icon: <FiFileText />,
        label: <p className="menu-item-label">Leave Types & Policies</p>,
      },
      link: '/timesheet/settings/leave-types-and-policies',
    },
    {
      item: {
        key: 'allowed-areas',
        icon: <TbLayoutList />,
        label: <p className="menu-item-label">Allowed Areas</p>,
      },
      link: '/timesheet/settings/allowed-areas',
    },
    {
      item: {
        key: 'attendance-rules',
        icon: <TbLayoutList />,
        label: <p className="menu-item-label">Attendance Rules</p>,
      },
      link: '/timesheet/settings/attendance-rules',
    },
    {
      item: {
        key: 'imported-logs',
        icon: <TbLayoutList />,
        label: <p className="menu-item-label">Imported Logs</p>,
      },
      link: '/timesheet/settings/imported-logs',
    },
    {
      item: {
        key: 'accrual-rule',
        icon: <TbLayoutList />,
        label: <p className="menu-item-label">Accrual Rule</p>,
      },
      link: '/timesheet/settings/accrual-rule',
    },
    {
      item: {
        key: 'carry-over-rule',
        icon: <TbLayoutList />,
        label: <p className="menu-item-label">Carry-over Rule</p>,
      },
      link: '/timesheet/settings/carry-over-rule',
    },

    {
      item: {
        key: 'approval-workflow',
        icon: <TbLayoutList />,
        label: <p className="menu-item-label">Approval Workflow</p>,
      },
      link: '/timesheet/settings/approvals',
    },
    {
      item: {
        key: 'time-zone',
        icon: <TbLayoutList />,
        label: <p className="menu-item-label">Time Zone</p>,
      },
      link: '/timesheet/settings/time-zone',
    },
  ]);

  return (
    <div className="h-auto w-auto pr-6 pb-6 pl-3">
      <PageHeader
        title="Settings"
        description="Settings yout Leave here"
      ></PageHeader>

      <div className="flex gap-6 mt-8">
        <SidebarMenu menuItems={menuItems} />

        <BlockWrapper className="flex-1 h-max">{children}</BlockWrapper>
      </div>
    </div>
  );
};

export default TimesheetSettingsLayout;
