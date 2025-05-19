'use client';
import { FC, ReactNode, useEffect, useState } from 'react';
import { TbLayoutList, TbTargetArrow } from 'react-icons/tb';
import { HiOutlineBriefcase } from 'react-icons/hi2';
import { usePathname } from 'next/navigation';
import { RiAwardFill } from 'react-icons/ri';
import { FaUserEdit } from 'react-icons/fa';
import PageHeader from '@/components/common/pageHeader/pageHeader';
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

const OkrSettingsLayout: FC<OkrSettingsLayoutProps> = ({ children }) => {
  const pathname = usePathname();
  const [currentItem, setCurrentItem] = useState<string>('');
  const isMobile = useMediaQuery({ maxWidth: 1024 });

  const menuItems = new SidebarMenuItem([
    {
      item: {
        key: 'planning-period',
        icon: !isMobile ? (
          <TbLayoutList
            className={
              currentItem === 'planning-period'
                ? 'text-[#4DAEF0]'
                : 'text-gray-500'
            }
          />
        ) : null,
        label: (
          <p className="font-bold text-sm text-gray-900">Planning Period</p>
        ),
        className: currentItem === 'planning-period' ? 'px-4' : 'px-1',
      },
      link: '/okr/settings/planning-period',
    },
    {
      item: {
        key: 'planning-assignation',
        icon: !isMobile ? (
          <TbLayoutList
            className={
              currentItem === 'planning-assignation'
                ? 'text-[#4DAEF0]'
                : 'text-gray-500'
            }
          />
        ) : null,
        label: (
          <p className="font-bold text-sm text-gray-900">
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
          <TbTargetArrow
            className={
              currentItem === 'define-okr-rule'
                ? 'text-[#4DAEF0]'
                : 'text-gray-500'
            }
          />
        ) : null,
        label: (
          <p className="font-bold text-sm text-gray-900">Define OKR Rule</p>
        ),
        className: currentItem === 'define-okr-rule' ? 'px-4' : 'px-1',
      },
      link: '/okr/settings/define-okr-rule',
    },
    {
      item: {
        key: 'criteria-management',
        icon: !isMobile ? (
          <RiAwardFill
            className={
              currentItem === 'criteria-management'
                ? 'text-[#4DAEF0]'
                : 'text-gray-500'
            }
          />
        ) : null,
        label: (
          <p className="font-bold text-sm text-gray-900">Criteria Management</p>
        ),
        className: currentItem === 'criteria-management' ? 'px-4' : 'px-1',
      },
      link: '/okr/settings/criteria-management',
    },
    {
      item: {
        key: 'target-assignment',
        icon: !isMobile ? (
          <HiOutlineBriefcase
            className={
              currentItem === 'target-assignment'
                ? 'text-[#4DAEF0]'
                : 'text-gray-500'
            }
          />
        ) : null,
        label: (
          <p className="font-bold text-sm text-gray-900">Target Assignment</p>
        ),
        className: currentItem === 'target-assignment' ? 'px-4' : 'px-1',
      },
      link: '/okr/settings/target-assignment',
    },
    {
      item: {
        key: 'edit-access',
        icon: !isMobile ? (
          <FaUserEdit
            className={
              currentItem === 'edit-access' ? 'text-[#4DAEF0]' : 'text-gray-500'
            }
          />
        ) : null,
        label: <p className="font-bold text-sm text-gray-900">Edit Access</p>,
        className: currentItem === 'edit-access' ? 'px-4' : 'px-1',
      },
      link: '/okr/settings/edit-access',
    },
  ]);

  // {
  //   item: {
  //     key: 'define-appreciation',
  //     icon: (
  //       <RiAwardFill
  //         className={
  //           currentItem === 'define-appreciation'
  //             ? 'text-[#4DAEF0]'
  //             : 'text-gray-500'
  //         }
  //       />
  //     ),
  //     label: (
  //       <p className="font-bold text-sm text-gray-900">Define Appreciation</p>
  //     ),
  //     className: currentItem === 'define-appreciation' ? 'px-4' : 'px-1',
  //   },
  //   link: '/okr/settings/define-appreciation',
  // },
  // {
  //   item: {
  //     key: 'define-reprimand',
  //     icon: (
  //       <FaBomb
  //         className={
  //           currentItem === 'define-reprimand'
  //             ? 'text-[#4DAEF0]'
  //             : 'text-gray-500'
  //         }
  //       />
  //     ),
  //     label: (
  //       <p className="font-bold text-sm text-gray-900">Define Reprimand</p>
  //     ),
  //     className: currentItem === 'define-reprimand' ? 'px-4' : 'px-1',
  //   },
  //   link: '/okr/settings/define-reprimand',
  // },

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
    <div className="min-h-screen bg-[#fafafa] p-3">
      <div className=" w-full h-auto">
        <PageHeader title="Settings" description="OKR Settings"></PageHeader>
        <div className="flex  flex-col lg:flex-row gap-6 mt-3">
          <SidebarMenu menuItems={menuItems} />
          <div className="w-full  rounded-2xl overflow-x-auto bg-[#fafafa] p-0">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OkrSettingsLayout;
