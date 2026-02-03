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
import { useIsMobile } from '@/hooks/useIsMobile';
import { useOkrSetting } from '@/hooks/useOkrSetting';
import OkrModeSelectionModal from './_components/okrModeSelectionModal';
import { Spin } from 'antd';

const OKR: React.FC<any> = () => {
  const { userId } = useAuthenticationStore();
  const [open, setOpen] = useState(false);
  const { pageSize, currentPage, searchObjParams, okrTab, sessionIds } =
    useOKRStore();

  // OKR Mode Selection Integration
  const {
    isLoading: isOkrLoading,
    showModal,
    saveOkrMode,
    refetch,
  } = useOkrSetting();

  const handleOkrModeSuccess = async () => {
    // The saveOkrMode function already handles closing the modal and updating state
    // This callback is called after the modal's internal save completes
    // Refetch to ensure everything is in sync
    await refetch();
  };
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
  // Show loading state while checking OKR setting
  if (isOkrLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  // Show modal if setting doesn't exist
  if (showModal) {
    return (
      <>
        <OkrModeSelectionModal
          open={showModal}
          onSuccess={handleOkrModeSuccess}
          saveOkrMode={saveOkrMode}
        />
      </>
    );
  }

  return (
    <div
      id="okr-page-div-container"
      data-cy="okr-page-div-container"
      className={`h-auto w-full ${isMobile ? 'p-0' : 'p-4'}`}
    >
      <div
        id="okr-page-div-header"
        data-cy="okr-page-div-header"
        className={`${isMobile && 'mx-5 mt-6'} flex flex-wrap justify-between items-center`}
      >
        <CustomBreadcrumb
          data-cy="okr-breadcrumb"
          title="Objective"
          subtitle="Employee's objective setting up"
        />
        <div
          id="okr-page-div-buttons"
          data-cy="okr-page-div-buttons"
          className="flex flex-wrap justify-start items-center my-4 gap-4 md:gap-8"
        >
          {userObjectives?.items?.length === 0 ||
          userObjectives?.items?.some(
            (item: any) => item?.isClosed == false,
          ) ? (
            <div
              id="okr-page-div-buttons-content"
              data-cy="okr-page-div-buttons-content"
              className="py-4 px-2 flex justify-center items-center gap-4"
            >
              <AccessGuard
                data-cy="okr-page-access-guard"
                permissions={[Permissions.ViewOkrReports]}
              >
                <CustomButton
                  id="okr-page-button-download"
                  data-cy="okr-page-button-download"
                  size={isMobile ? 'small' : 'middle'}
                  loading={empOkrScoreLoading}
                  title={isMobile ? '' : 'Download'}
                  isTitleHidden={isMobile ? true : false}
                  icon={
                    <LiaFileDownloadSolid
                      id="okr-page-button-download-icon"
                      data-cy="okr-page-button-download-icon"
                      size={isMobile ? 14 : 20}
                      className={`text-black ${isMobile ? 'mr-0' : 'mr-2'}`}
                    />
                  }
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
                size={isMobile ? 'small' : 'middle'}
                title={isMobile ? '' : 'Set Objective'}
                isTitleHidden={isMobile ? true : false}
                id="createUserButton"
                data-cy="okr-page-button-create-user"
                icon={
                  <FaPlus
                    id="okr-page-button-create-user-icon"
                    data-cy="okr-page-button-create-user-icon"
                    size={isMobile ? 14 : 20}
                    className={isMobile ? 'mr-0' : 'mr-2'}
                  />
                }
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
      {/* Future: Conditional Rendering Based on OKR Mode
          When implementing conditional rendering:
          - Use okrMode from store to show/hide features
          - Example: {okrMode === 'Advanced' && <AdvancedFeature />}
          - Example: {okrMode === 'Basic' && <BasicFeature />}
      */}
      <Dashboard data-cy="okr-page-dashboard" />
      <OkrDrawer data-cy="okr-page-drawer" open={open} onClose={onClose} />
    </div>
  );
};

export default OKR;
