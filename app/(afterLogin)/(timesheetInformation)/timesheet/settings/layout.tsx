'use client';
import { FC, ReactNode } from 'react';
import { CiCalendarDate } from 'react-icons/ci';
import { FiFileText } from 'react-icons/fi';
import PageHeader from '@/components/common/pageHeader/pageHeader';
import BlockWrapper from '@/components/common/blockWrapper/blockWrapper';
import { SidebarMenuItem } from '@/types/sidebarMenu';
import SidebarMenu from '@/components/sidebarMenu';
import { GrTransaction } from 'react-icons/gr';
import { IoArrowUndoCircleOutline } from 'react-icons/io5';
import { PiUserCircleCheck } from 'react-icons/pi';

import { IoTimeOutline } from 'react-icons/io5';
import { GoKey } from 'react-icons/go';
import { AiOutlineImport } from 'react-icons/ai';
import { BsFileBreak } from 'react-icons/bs';

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
        icon: <CiCalendarDate className="hidden lg:block" />,
        label: <p className="menu-item-label">Closed Date</p>,
        className: 'px-1',
      },
      link: '/timesheet/settings/closed-date',
    },
    {
      item: {
        key: 'break-type',
        icon: <BsFileBreak className="hidden lg:block" />,
        label: <p className="menu-item-label">Break Type</p>,
        className: 'px-1',
      },
      link: '/timesheet/settings/break-type',
    },
    {
      item: {
        key: 'leave-types-and-policies',
        icon: <FiFileText className="hidden lg:block" />,
        label: <p className="menu-item-label">Leave Types & Policies</p>,
        className: 'px-1',
      },
      link: '/timesheet/settings/leave-types-and-policies',
    },
    {
      item: {
        key: 'allowed-areas',
        icon: <GoKey className="hidden lg:block" />,
        label: <p className="menu-item-label">Allowed Areas</p>,
        className: 'px-1',
      },
      link: '/timesheet/settings/allowed-areas',
    },
    {
      item: {
        key: 'attendance-rules',
        icon: <IoTimeOutline className="hidden lg:block" />,
        label: <p className="menu-item-label">Attendance Rules</p>,
        className: 'px-1',
      },
      link: '/timesheet/settings/attendance-rules',
    },
    {
      item: {
        key: 'imported-logs',
        icon: <AiOutlineImport className="hidden lg:block" />,
        label: <p className="menu-item-label">Imported Logs</p>,
        className: 'px-1',
      },
      link: '/timesheet/settings/imported-logs',
    },
    {
      item: {
        key: 'accrual-rule',
        icon: <GrTransaction className="hidden lg:block" />,
        label: <p className="menu-item-label">Accrual Rule</p>,
        className: 'px-1',
      },
      link: '/timesheet/settings/accrual-rule',
    },
    {
      item: {
        key: 'carry-over-rule',
        icon: <IoArrowUndoCircleOutline className="hidden lg:block" />,
        label: <p className="menu-item-label">Carry-over Rule</p>,
        className: 'px-1',
      },
      link: '/timesheet/settings/carry-over-rule',
    },

    {
      item: {
        key: 'approvals',
        icon: <PiUserCircleCheck className="hidden lg:block" />,
        label: <p className="menu-item-label">Approval Workflow</p>,
        className: 'px-1',
      },
      link: '/timesheet/settings/approvals',
    },
    {
      item: {
        key: 'time-zone',
        icon: <IoTimeOutline className="hidden lg:block" />,
        label: <p className="menu-item-label">Time Zone</p>,
        className: 'px-1',
      },
      link: '/timesheet/settings/time-zone',
    },
  ]);

  return (
    <div className="min-h-screen bg-[#fafafa] p-3">
      <div className="h-auto w-auto">
        <PageHeader
          title="Settings"
          description="Settings for timesheet management"
        ></PageHeader>

        <div className="flex flex-col lg:flex-row gap-6 mt-3 ">
          <SidebarMenu menuItems={menuItems} />

          <BlockWrapper className="flex-1 h-max overflow-x-auto bg-[#fafafa] p-0 ">
            {children}
          </BlockWrapper>
        </div>
      </div>
    </div>
  );
};

export default TimesheetSettingsLayout;
