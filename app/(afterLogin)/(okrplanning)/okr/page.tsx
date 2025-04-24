'use client';
import CustomBreadcrumb from '@/components/common/breadCramp';
import React, { useEffect, useState } from 'react';
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
import { GlobalStateStore } from '@/store/uistate/features/global';
import { useIsMobile } from '@/hooks/useIsMobile';

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

 const { isMobile, isTablet } = useIsMobile();

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
    <div className={`h-auto w-full ${isMobile ? 'p-0' : 'p-4'}`}>
      <div className="flex flex-wrap justify-between items-center">
        <CustomBreadcrumb
          title="Objective"
          subtitle="Employee's objective setting up"
        />
        <div className="flex flex-wrap justify-start items-center my-4 gap-4 md:gap-8">
          {userObjectives?.items?.length === 0 ||
          userObjectives?.items?.some(
            (item: any) => item?.isClosed == false,
          ) ? (
            <div className="py-4 px-2 flex justify-center items-center gap-4">
              <AccessGuard permissions={[Permissions.ViewOkrReports]}>
                <CustomButton
                  size={isMobile ? "small" : "middle"}
                  loading={empOkrScoreLoading}
                  title={isMobile ? '': 'Download'}
                  isTitleHidden={isMobile ? true : false}
                  icon={<LiaFileDownloadSolid size={isMobile ? 14 : 20} 
                  className={isMobile ? "mr-0" : "mr-2"} />}
                  className={`bg-blue-600 hover:bg-blue-700 ${
                    isMobile
                      ? 'py-1 h-8 w-8 flex items-center justify-center'
                      : isTablet
                      ? 'h-11 px-4 py-3'
                      : 'h-14 px-6 py-6'
                  }`}
                  type="default"
                  onClick={handleDownload}
                />
              </AccessGuard>
              <CustomButton
                size={isMobile ? "small" : "middle"}
                title={isMobile ? '' : 'Set Objective'}
                isTitleHidden={isMobile ? true : false}
                id="createUserButton"
                icon={<FaPlus size={isMobile ? 14 : 20} className={isMobile ? 'mr-0' : 'mr-2'} />}
                onClick={showDrawer}
                className={`bg-blue-600 hover:bg-blue-700 ${
                  isMobile
                    ? 'py-1 h-8 w-8 flex items-center justify-center'
                    : isTablet
                    ? 'h-11 px-4 py-3'
                    : 'h-14 px-6 py-6'
                }`}              
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
