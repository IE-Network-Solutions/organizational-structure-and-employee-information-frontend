'use client';
import CustomBreadcrumb from '@/components/common/breadCramp';
import { useRouter } from 'next/navigation';
import React from 'react';
import { GiHamburgerMenu } from 'react-icons/gi';
import { LuFolderSync } from 'react-icons/lu';

const ApprovalLayout: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const router = useRouter();

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  return (
    <div className="">
      <CustomBreadcrumb
        title="Approval Set-Up"
        subtitle="Your Approval Setting "
        className="mb-3"
      />
      <div className=" flex">
        <aside className="w-1/4  mx-3 ">
          <div className="bg-white py-5 rounded-2xl ">
            <ul>
              <li className={'mb-3 mx-3  border-[2px] rounded-xl px-3 py-4'}>
                <div
                  className="block text-sm xl:text-lg font-semibold overflow-hidden cursor-pointer"
                  onClick={() => handleNavigation('/approval/approvalList')}
                >
                  <div className="flex gap-2 items-center">
                    <GiHamburgerMenu /> Approval Workflow
                  </div>
                </div>
              </li>
              <li className={' mx-3  border-[2px] rounded-xl px-3 py-4'}>
                <div
                  className="block text-sm xl:text-lg font-semibold overflow-hidden cursor-pointer"
                  onClick={() => handleNavigation('/approval-log')}
                >
                  <div className="flex gap-2 items-center">
                    <LuFolderSync /> Approval Log
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </aside>

        <main className="w-3/4 bg-white p-8 mx-3 rounded-2xl">{children}</main>
      </div>
    </div>
  );
};

export default ApprovalLayout;
