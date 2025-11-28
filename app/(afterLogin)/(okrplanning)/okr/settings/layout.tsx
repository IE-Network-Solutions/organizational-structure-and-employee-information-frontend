'use client';

import React, { useState, useEffect } from 'react';
import { TbLayoutList, TbTargetArrow } from 'react-icons/tb';
import { usePathname } from 'next/navigation';
import { BiCheckDouble } from 'react-icons/bi';
import PageHeader from '@/components/common/pageHeader/pageHeader';
import SidebarMenu from '@/components/sidebarMenu';
import { SidebarMenuItem } from '@/types/sidebarMenu';
import { useMediaQuery } from 'react-responsive';
import { TbTarget, TbAward, TbShieldCheck, TbEdit } from 'react-icons/tb';
import { HiOutlineBriefcase } from 'react-icons/hi';

interface OkrSettingsLayoutProps {
  children: React.ReactNode;
}

const OkrSettingsLayout: React.FC<OkrSettingsLayoutProps> = ({ children }) => {
  const pathname = usePathname();
  const [currentItem, setCurrentItem] = useState<string>('');
  const isMobile = useMediaQuery({ maxWidth: 1024 });

  const menuItems = new SidebarMenuItem([
    {
      item: {
        key: 'planning-period',
        icon: !isMobile ? (
          <TbLayoutList data-cy="okr-settings-layout-planning-period-icon-display-icon"
            className={
              currentItem === 'planning-period'
                ? 'text-[#4DAEF0]'
                : 'text-gray-500'
            }
          />
        ) : null,
        label: (
          <p className="font-bold text-sm text-gray-900" data-cy="okr-settings-layout-planning-period-label-display-label">Planning Period</p>
        ),
        className: currentItem === 'planning-period' ? 'px-4' : 'px-1',
      },
      link: '/okr/settings/planning-period',
    },
    {
      item: {
        key: 'planning-assignation',
        icon: !isMobile ? (
          <TbLayoutList data-cy="okr-settings-layout-planning-assignation-icon-display-icon"
            className={
              currentItem === 'planning-assignation'
                ? 'text-[#4DAEF0]'
                : 'text-gray-500'
            }
          />
        ) : null,
        label: (
          <p className="font-bold text-sm text-gray-900" data-cy="okr-settings-layout-planning-assignation-label-display-label">
            Planning Assignation
          </p>
        ),
        className: currentItem === 'planning-assignation' ? 'px-4' : 'px-1',
      },
      link: '/okr/settings/planning-assignation',
    },
    {
      item: {
        key: 'define-okr-rule',
        icon: !isMobile ? (
          <TbTargetArrow data-cy="okr-settings-layout-define-okr-rule-icon-display-icon"
            className={
              currentItem === 'define-okr-rule'
                ? 'text-[#4DAEF0]'
                : 'text-gray-500'
            }
          />
        ) : null,
        label: (
          <p className="font-bold text-sm text-gray-900" data-cy="okr-settings-layout-define-okr-rule-label-display-label">Define OKR Rule</p>
        ),
        className: currentItem === 'define-okr-rule' ? 'px-4' : 'px-1',
      },
      link: '/okr/settings/define-okr-rule',
    },
    {
      item: {
        key: 'criteria-management',
        icon: !isMobile ? (
          <TbTarget data-cy="okr-settings-layout-criteria-management-icon-display-icon"
            className={
              currentItem === 'criteria-management'
                ? 'text-[#4DAEF0]'
                : 'text-gray-500'
            }
          />
        ) : null,
        label: (
          <p className="font-bold text-sm text-gray-900" data-cy="okr-settings-layout-criteria-management-label-display-label">Criteria Management</p>
        ),
        className: currentItem === 'criteria-management' ? 'px-4' : 'px-1',
      },
      link: '/okr/settings/criteria-management',
    },
    {
      item: {
        key: 'target-assignment',
        icon: !isMobile ? (
          <HiOutlineBriefcase data-cy="okr-settings-layout-target-assignment-icon-display-icon"
            className={
              currentItem === 'target-assignment'
                ? 'text-[#4DAEF0]'
                : 'text-gray-500'
            }
          />
        ) : null,
        label: (
          <p className="font-bold text-sm text-gray-900" data-cy="okr-settings-layout-target-assignment-label-display-label">Target Assignment</p>
        ),
        className: currentItem === 'target-assignment' ? 'px-4' : 'px-1',
      },
      link: '/okr/settings/target-assignment',
    },
    {
      item: {
        key: 'define-appreciation',
        icon: !isMobile ? (
          <TbAward data-cy="okr-settings-layout-define-appreciation-icon-display-icon"
            className={
              currentItem === 'define-appreciation'
                ? 'text-[#4DAEF0]'
                : 'text-gray-500'
            }
          />
        ) : null,
        label: (
          <p className="font-bold text-sm text-gray-900" data-cy="okr-settings-layout-define-appreciation-label-display-label">Define Appreciation</p>
        ),
        className: currentItem === 'define-appreciation' ? 'px-4' : 'px-1',
      },
      link: '/okr/settings/define-appreciation',
    },
    {
      item: {
        key: 'define-reprimand',
        icon: !isMobile ? (
          <TbShieldCheck data-cy="okr-settings-layout-define-reprimand-icon-display-icon"
            className={
              currentItem === 'define-reprimand'
                ? 'text-[#4DAEF0]'
                : 'text-gray-500'
            }
          />
        ) : null,
        label: (
          <p className="font-bold text-sm text-gray-900" data-cy="okr-settings-layout-define-reprimand-label-display-label">Define Reprimand</p>
        ),
        className: currentItem === 'define-reprimand' ? 'px-4' : 'px-1',
      },
      link: '/okr/settings/define-reprimand',
    },
    {
      item: {
        key: 'edit-access',
        icon: !isMobile ? (
          <TbEdit data-cy="okr-settings-layout-edit-access-icon-display-icon"
            className={
              currentItem === 'edit-access' ? 'text-[#4DAEF0]' : 'text-gray-500'
            }
          />
        ) : null,
        label: <p className="font-bold text-sm text-gray-900" data-cy="okr-settings-layout-edit-access-label-display-label">Edit Access</p>,
        className: currentItem === 'edit-access' ? 'px-4' : 'px-1',
      },
      link: '/okr/settings/edit-access',
    },
    {
      item: {
        key: 'check-in-rule',
        icon: !isMobile ? (
          <BiCheckDouble data-cy="okr-settings-layout-check-in-rule-icon-display-icon"
            className={
              currentItem === 'check-in-rule'
                ? 'text-[#4DAEF0]'
                : 'text-gray-500'
            }
          />
        ) : null,
        label: <p className="font-bold text-sm text-gray-900" data-cy="okr-settings-layout-check-in-rule-label-display-label">Check-in Rule</p>,
        className: currentItem === 'check-in-rule' ? 'px-4' : 'px-1',
      },
      link: '/okr/settings/check-in-rule',
    },
  ]);

  useEffect(() => {
    const pathSegments = pathname.split('/').filter(Boolean);
    const lastKey = pathSegments[pathSegments.length - 1];

    setCurrentItem(lastKey);
  }, [pathname]);

  return (
    <div
      className="min-h-screen bg-[#fafafa] p-3"
      id="okr-settings-layout-container-display-div"
      data-cy="okr-settings-layout-container-display-div"
    >
      <div
        className=" w-full h-auto"
        id="okr-settings-layout-wrapper-display-div"
        data-cy="okr-settings-layout-wrapper-display-div"
      >
        <PageHeader
          title="Settings"
          description="OKR Settings"
        
          data-cy="okr-settings-layout-header-display-header"
        ></PageHeader>
        <div
          className="flex  flex-col lg:flex-row gap-6 mt-3"
          id="okr-settings-layout-content-display-div"
          data-cy="okr-settings-layout-content-display-div"
        >
          <SidebarMenu
            menuItems={menuItems}
       
            data-cy="okr-settings-layout-sidebar-display-menu"
          />
          <div
            className="w-full  rounded-2xl overflow-x-auto bg-[#fafafa] p-0"
            id="okr-settings-layout-children-wrapper-display-div"
            data-cy="okr-settings-layout-children-wrapper-display-div"
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OkrSettingsLayout;
