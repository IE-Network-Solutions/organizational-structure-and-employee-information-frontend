'use client';
import React, { useMemo, useState } from 'react';
import AddIcon from '@mui/icons-material/Add';
import OkrDrawer from './_components/okrDrawer';
import Dashboard from './_components/dashboard';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
import { useGetUserObjective } from '@/store/server/features/okrplanning/okr/objective/queries';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { useOKRStore } from '@/store/uistate/features/okrplanning/okr';
import { LiaFileDownloadSolid } from 'react-icons/lia';
import NotificationMessage from '@/components/common/notification/notificationMessage';
import { useDownloadEmployeeOkrScore } from '@/store/server/features/okrplanning/okr/objective/mutations';
import { useIsMobile } from '@/hooks/useIsMobile';
import { useOkrSetting } from '@/hooks/useOkrSetting';
import OkrModeSelectionModal from './_components/okrModeSelectionModal';
import CustomBreadcrumb from '@/components/common/breadCramp';
import { Button } from 'antd';
import Link from 'next/link';
import { toKeyResultDeadlineFilter } from './_constants/okrStatusPills';

const OKR: React.FC<any> = () => {
  const { userId } = useAuthenticationStore();
  const [open, setOpen] = useState(false);
  const {
    pageSize,
    currentPage,
    searchObjParams,
    employeeSearchObjParams,
    okrTab,
    employeeSessionIds,
    okrStatusPillId,
    fiscalYearId,
    sessionIds,
  } = useOKRStore();

  const keyResultDeadlineFilter = useMemo(
    () =>
      String(okrTab) === '1'
        ? toKeyResultDeadlineFilter(okrStatusPillId)
        : undefined,
    [okrStatusPillId, okrTab],
  );

  // OKR Mode Selection Integration
  const { showModal, saveOkrMode, refetch } = useOkrSetting();

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
    fiscalYearId,
    sessionIds,
    keyResultDeadlineFilter,
  );

  const { isMobile } = useIsMobile();

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
          sessions: employeeSessionIds,
          userId: employeeSearchObjParams?.userId,
          departmentId: employeeSearchObjParams?.departmentId,
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
    <div id="okr-page-div-container" data-cy="okr-page-div-container">
      <div id="okr-page-div-header" data-cy="okr-page-div-header">
        <div data-cy="okr-page-header-content">
          <CustomBreadcrumb
            titleClassName="!text-gray-900"
            title={
              <span
                data-cy="okr-breadcrumb"
                className="text-2xl font-bold text-gray-900"
              >
                Objectives
              </span>
            }
            subtitle={
              <nav
                aria-label="Breadcrumb"
                className="flex text-sm font-medium text-gray-500 mt-1"
                data-cy="okr-breadcrumb-nav"
              >
                <ol
                  className="flex items-center space-x-2"
                  data-cy="okr-breadcrumb-list"
                >
                  <li data-cy="okr-breadcrumb-item-okr">
                    <Link
                      className=" !text-gray-800"
                      href="/okr/dashboard"
                      data-cy="okr-breadcrumb-link"
                    >
                      OKR
                    </Link>
                  </li>
                  <li data-cy="okr-breadcrumb-item-separator">
                    <span
                      className="text-gray-400"
                      data-cy="okr-breadcrumb-separator"
                    >
                      /
                    </span>
                  </li>
                  <li data-cy="okr-breadcrumb-item-objectives">
                    <span
                      className="text-gray-900"
                      data-cy="okr-breadcrumb-current"
                    >
                      Objectives
                    </span>
                  </li>
                </ol>
              </nav>
            }
            titleExtra={
              userObjectives?.items?.length === 0 ||
              userObjectives?.items?.some(
                (item: any) => item?.isClosed == false,
              ) ? (
                <div
                  id="okr-page-div-buttons"
                  data-cy="okr-page-div-buttons"
                  className="flex items-center gap-4"
                >
                  <AccessGuard
                    data-cy="okr-page-access-guard"
                    permissions={[Permissions.ViewOkrReports]}
                  >
                    <Button
                      type="default"
                      size={isMobile ? 'small' : 'middle'}
                      loading={empOkrScoreLoading}
                      id="okr-page-button-download"
                      data-cy="okr-page-button-download"
                      icon={
                        <LiaFileDownloadSolid
                          id="okr-page-button-download-icon"
                          data-cy="okr-page-button-download-icon"
                          size={isMobile ? 14 : 20}
                        />
                      }
                      onClick={handleDownload}
                      className={
                        isMobile
                          ? 'h-8 w-8 min-w-8 p-0 flex items-center justify-center'
                          : 'w-[164px] min-w-[164px] !h-[40px] flex items-center justify-center'
                      }
                    >
                      {!isMobile && 'Download'}
                    </Button>
                  </AccessGuard>
                  <Button
                    type="primary"
                    size={isMobile ? 'small' : 'middle'}
                    id="createUserButton"
                    data-cy="okr-page-button-create-user"
                    icon={
                      <AddIcon
                        id="okr-page-button-create-user-icon"
                        data-cy="okr-page-button-create-user-icon"
                        sx={{ fontSize: isMobile ? 14 : 20, color: '#1E40AF' }}
                      />
                    }
                    onClick={showDrawer}
                    className={
                      isMobile
                        ? 'bg-okr-primary hover:!bg-blue-700 h-8 w-8 min-w-8 p-0 flex items-center justify-center'
                        : 'bg-okr-primary hover:!bg-blue-700 inline-flex items-center justify-center rounded-lg shadow-sm !text-[#FFFFFF] hover:!text-[#FFFFFF] w-[164px] min-w-[164px] !h-[40px]'
                    }
                  >
                    {!isMobile && 'Create Objective'}
                  </Button>
                </div>
              ) : undefined
            }
          />
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
