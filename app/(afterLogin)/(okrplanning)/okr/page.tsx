'use client';
import CustomBreadcrumb from '@/components/common/breadCramp';
import React, { useState } from 'react';
import { FaPlus } from 'react-icons/fa';
import OkrDrawer from './_components/okrDrawer';
import Dashboard from './_components/dashboard';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
import CustomButton from '@/components/common/buttons/customButton';
import { useGetUserObjective } from '@/store/server/features/okrplanning/okr/objective/queries';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { useOKRStore } from '@/store/uistate/features/okrplanning/okr';
const OKR: React.FC<any> = () => {
  const { userId } = useAuthenticationStore();
  const [open, setOpen] = useState(false);
  const { pageSize, currentPage, searchObjParams } = useOKRStore();
  const showDrawer = () => {
    setOpen(true);
  };
  const onClose = () => {
    setOpen(false);
  };

  const { data: userObjectives } = useGetUserObjective(
    userId,
    pageSize,
    currentPage,
    searchObjParams?.metricTypeId,
  );

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
          {userObjectives?.items?.some(
            (item: any) => item?.isClosed === false,
          ) && (
            <CustomButton
              title="Set Objective"
              id="createUserButton"
              icon={<FaPlus className="mr-2" />}
              onClick={showDrawer}
              className="bg-blue-600 hover:bg-blue-700"
            />
          )}
        </div>
      </div>
      <Dashboard />
      <OkrDrawer open={open} onClose={onClose} />
    </div>
  );
};

export default OKR;
