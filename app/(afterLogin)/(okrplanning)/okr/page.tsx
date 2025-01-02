'use client';
import CustomBreadcrumb from '@/components/common/breadCramp';
import CustomButton from '@/components/common/buttons/customButton';
import React, { useState } from 'react';
import { AiOutlineFileAdd } from 'react-icons/ai';
import { FaPlus } from 'react-icons/fa';
import OkrDrawer from './_components/okrDrawer';
import Dashboard from './_components/dashboard';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
const OKR: React.FC<any> = () => {
  const [open, setOpen] = useState(false);
  const showDrawer = () => {
    setOpen(true);
  };
  const onClose = () => {
    setOpen(false);
  };

  return (
    <div className="h-auto w-full p-4">
      <div className="flex flex-wrap justify-between items-center">
        <CustomBreadcrumb
          title="Objective"
          subtitle="Employee's objective setting up"
        />
        <div className="flex flex-wrap justify-start items-center my-4 gap-4 md:gap-8">
          <AccessGuard permissions={[Permissions.ViewOkrReports]}>
            {/* <CustomButton
              title="Download"
              id="createUserButton"
              icon={<AiOutlineFileAdd size={20} className="mr-2" />}
              onClick={showDrawer}
              className="bg-white text-black hover:bg-black hover:text-white border-2 border-black"
            /> */}
          </AccessGuard>
          <CustomButton
            title="Set Objective"
            id="createUserButton"
            icon={<FaPlus className="mr-2" />}
            onClick={showDrawer}
            className="bg-blue-600 hover:bg-blue-700"
          />
        </div>
      </div>
      <Dashboard />
      <OkrDrawer open={open} onClose={onClose} />
    </div>
  );
};

export default OKR;
