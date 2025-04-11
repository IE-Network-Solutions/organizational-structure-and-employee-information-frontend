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
import { LiaFileDownloadSolid } from 'react-icons/lia';
import NotificationMessage from '@/components/common/notification/notificationMessage';
import { useDownloadEmployeeOkrScore } from '@/store/server/features/okrplanning/okr/objective/mutations';

const OKR: React.FC<any> = () => {
  const { userId } = useAuthenticationStore();
  const [open, setOpen] = useState(false);
  const { pageSize, currentPage, searchObjParams, okrTab, sessionIds } =
    useOKRStore();
  const showDrawer = () => {
    setOpen(true);
  };
  const onClose = () => {
    setOpen(false);
  };
  const { mutate: downloadEmployeeOkrScore, isLoading: empOkrScoreLoading } =
    useDownloadEmployeeOkrScore();

  const { data: userObjectives } = useGetUserObjective(
    userId,
    pageSize,
    currentPage,
    searchObjParams?.metricTypeId,
  );
  function handleDownload() {
    if (okrTab == 1) {
      NotificationMessage.warning({
        message: 'Message',
        description: 'You can Only download All employees OKR',
      });
    } else if (okrTab == 2) {
      NotificationMessage.warning({
        message: 'Message',
        description: 'You can Only download All employees OKR',
      });
    } else if (okrTab == 3) {
      NotificationMessage.warning({
        message: 'Message',
        description: 'You can Only download All employees OKR',
      });
    } else if (okrTab == 4) {
      downloadEmployeeOkrScore(
        {
          sessions: sessionIds,
          userId: searchObjParams?.userId,
          departmentId: searchObjParams?.departmentId,
        },
        {
          onSuccess: () => {
            NotificationMessage.success({
              message: 'All Employee Okr Score',
              description: 'Exported Successfully',
            });
          },
        },
      );
    }
  }
  return (
    <div className="h-auto w-full p-4">
      <div className="flex flex-wrap justify-between items-center">
        <CustomBreadcrumb
          title="Objective"
          subtitle="Employee's objective setting up"
        />
        <div className="flex flex-wrap justify-start items-center my-4 gap-4 md:gap-8">
          <AccessGuard permissions={[Permissions.ViewOkrReports]}>
            <CustomButton
              loading={empOkrScoreLoading}
              title="Download"
              id="createUserButton"
              icon={<LiaFileDownloadSolid size={20} className="mr-2" />}
              onClick={handleDownload}
              className="bg-white text-black hover:bg-black hover:text-white border-2 border-black"
            />
          </AccessGuard>
          {userObjectives?.items?.length === 0 ||
          userObjectives?.items?.some(
            (item: any) => item?.isClosed == false,
          ) ? (
            <div className="py-4 flex justify-center items-center gap-4">
              <CustomButton
                loading={empOkrScoreLoading}
                title="Download"
                icon={<LiaFileDownloadSolid size={20} className="mr-2" />}
                type="default"
                onClick={handleDownload}
              />
              <CustomButton
                title="Set Objective"
                id="createUserButton"
                icon={<FaPlus className="mr-2" />}
                onClick={showDrawer}
                className="bg-blue-600 hover:bg-blue-700"
              />
            </div>
          ) : (
            ''
          )}
        </div>
      </div>
      <Dashboard />
      <OkrDrawer open={open} onClose={onClose} />
    </div>
  );
};

export default OKR;
