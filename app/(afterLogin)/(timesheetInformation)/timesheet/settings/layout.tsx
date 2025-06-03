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
import { usePathname } from 'next/navigation';

interface TimesheetSettingsLayoutProps {
  children: ReactNode;
}

const TimesheetSettingsLayout: FC<TimesheetSettingsLayoutProps> = ({
  children,
}) => {
  const pathname = usePathname();
  const menuItems = new SidebarMenuItem([
    {
      item: {
        key: 'closed-date',
        icon: (
          <div
            className={`lg:flex items-center gap-2 ${pathname.includes('/timesheet/settings/closed-date') ? 'lg:ml-4' : ''}`}
          >
            <CiCalendarDate
              className={`hidden lg:block ${pathname.includes('/timesheet/settings/closed-date') ? 'text-[#1677FF]' : ''}`}
            />
            <p className="menu-item-label ">Closed Date</p>
          </div>
        ),
        className: 'px-1',
      },
      link: '/timesheet/settings/closed-date',
    },
    {
      item: {
        key: 'break-type',
        icon: (
          <div
            className={`lg:flex items-center gap-2 ${pathname.includes('/timesheet/settings/break-type') ? 'lg:ml-4' : ''}`}
          >
            <BsFileBreak
              className={`hidden lg:block ${pathname.includes('/timesheet/settings/break-type') ? 'text-[#1677FF]' : ''}`}
            />
            <p className="menu-item-label ">Break Type</p>
          </div>
        ),
        className: 'px-1',
      },
      link: '/timesheet/settings/break-type',
    },
    {
      item: {
        key: 'leave-types-and-policies',
        icon: (
          <div
            className={`lg:flex items-center gap-2 ${pathname.includes('/timesheet/settings/leave-types-and-policies') ? 'lg:ml-4' : ''}`}
          >
            <FiFileText
              className={`hidden lg:block ${pathname.includes('/timesheet/settings/leave-types-and-policies') ? 'text-[#1677FF]' : ''}`}
            />
            <p className="menu-item-label ">Leave Types & Policies</p>
          </div>
        ),
        className: 'px-1',
      },
      link: '/timesheet/settings/leave-types-and-policies',
    },
    {
      item: {
        key: 'allowed-areas',
        icon: (
          <div
            className={`lg:flex items-center gap-2 ${pathname.includes('/timesheet/settings/allowed-areas') ? 'lg:ml-4' : ''}`}
          >
            <GoKey
              className={`hidden lg:block ${pathname.includes('/timesheet/settings/allowed-areas') ? 'text-[#1677FF]' : ''}`}
            />
            <p className="menu-item-label ">Allowed Areas</p>
          </div>
        ),
        className: 'px-1',
      },
      link: '/timesheet/settings/allowed-areas',
    },
    {
      item: {
        key: 'attendance-rules',
        icon: (
          <div
            className={`lg:flex items-center gap-2 ${pathname.includes('/timesheet/settings/attendance-rules') ? 'lg:ml-4' : ''}`}
          >
            <IoTimeOutline
              className={`hidden lg:block ${pathname.includes('/timesheet/settings/attendance-rules') ? 'text-[#1677FF]' : ''}`}
            />
            <p className="menu-item-label ">Attendance Rules</p>
          </div>
        ),
        className: 'px-1',
      },
      link: '/timesheet/settings/attendance-rules',
    },
    {
      item: {
        key: 'imported-logs',
        icon: (
          <div
            className={`lg:flex items-center gap-2 ${pathname.includes('/timesheet/settings/imported-logs') ? 'lg:ml-4' : ''}`}
          >
            <AiOutlineImport
              className={`hidden lg:block ${pathname.includes('/timesheet/settings/imported-logs') ? 'text-[#1677FF]' : ''}`}
            />
            <p className="menu-item-label ">Imported Logs</p>
          </div>
        ),
        className: 'px-1',
      },
      link: '/timesheet/settings/imported-logs',
    },
    {
      item: {
        key: 'accrual-rule',
        icon: (
          <div
            className={`lg:flex items-center gap-2 ${pathname.includes('/timesheet/settings/accrual-rule') ? 'lg:ml-4' : ''}`}
          >
            <GrTransaction
              className={`hidden lg:block ${pathname.includes('/timesheet/settings/accrual-rule') ? 'text-[#1677FF]' : ''}`}
            />
            <p className="menu-item-label ">Accrual Rule</p>
          </div>
        ),
        className: 'px-1',
      },
      link: '/timesheet/settings/accrual-rule',
    },
    {
      item: {
        key: 'carry-over-rule',
        icon: (
          <div
            className={`lg:flex items-center gap-2 ${pathname.includes('/timesheet/settings/carry-over-rule') ? 'lg:ml-4' : ''}`}
          >
            <IoArrowUndoCircleOutline
              className={`hidden lg:block ${pathname.includes('/timesheet/settings/carry-over-rule') ? 'text-[#1677FF]' : ''}`}
            />
            <p className="menu-item-label ">Carry-over Rule</p>
          </div>
        ),
        className: 'px-1',
      },
      link: '/timesheet/settings/carry-over-rule',
    },

    {
      item: {
        key: 'approvals',
        icon: (
          <div
            className={`lg:flex items-center gap-2 ${pathname.includes('/timesheet/settings/approvals') ? 'lg:ml-4' : ''}`}
          >
            <PiUserCircleCheck
              className={`hidden lg:block ${pathname.includes('/timesheet/settings/approvals') ? 'text-[#1677FF]' : ''}`}
            />
            <p className="menu-item-label ">Approval Workflow</p>
          </div>
        ),
        className: 'px-1',
      },
      link: '/timesheet/settings/approvals',
    },
    {
      item: {
        key: 'time-zone',
        icon: (
          <div
            className={`lg:flex items-center gap-2 ${pathname.includes('/timesheet/settings/time-zone') ? 'lg:ml-4' : ''}`}
          >
            <IoTimeOutline
              className={`hidden lg:block ${pathname.includes('/timesheet/settings/time-zone') ? 'text-[#1677FF]' : ''}`}
            />
            <p className="menu-item-label ">Time Zone</p>
          </div>
        ),
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
