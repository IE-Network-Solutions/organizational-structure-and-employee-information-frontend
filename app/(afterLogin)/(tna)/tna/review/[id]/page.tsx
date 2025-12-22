'use client';
import BlockWrapper from '@/components/common/blockWrapper/blockWrapper';
import { useParams, useRouter } from 'next/navigation';
import PageHeader from '@/components/common/pageHeader/pageHeader';
import { Button, Spin } from 'antd';
import { FaArrowLeftLong } from 'react-icons/fa6';
import UserCard from '@/components/common/userCard/userCard';
import { useGetTna } from '@/store/server/features/tna/review/queries';
import StatusBadge from '@/components/common/statusBadge/statusBadge';
import {
  TrainingNeedAssessmentCertStatus,
  TrainingNeedAssessmentCertStatusBadgeTheme,
  TrainingNeedAssessmentStatusBadgeTheme,
} from '@/types/tna/tna';
import dayjs from 'dayjs';
import { DATE_FORMAT } from '@/utils/constants';
import CustomButton from '@/components/common/buttons/customButton';
import { FiEdit2 } from 'react-icons/fi';
import React, { useEffect } from 'react';
import TnaUpdateSidebar from '@/app/(afterLogin)/(tna)/tna/review/[id]/_component/tnaUpdate';
import { useTnaReviewStore } from '@/store/uistate/features/tna/review';
import FileButton from '@/components/common/fileButton';
import { formatLinkToUploadFile } from '@/helpers/formatTo';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
import { useGetAllUsers } from '@/store/server/features/employees/employeeManagment/queries';
import ApprovalStatusCard from '@/components/common/approvalStatuses/approvalStatusCard';
import ApprovalStatusesInfo from '@/components/common/approvalStatuses/approvalStatusesInfo';
import { useGetSingleApprovalLog } from '@/store/server/features/timesheet/leaveRequest/queries';

const TnaDetailPage = () => {
  const {
    isShowTnaUpdateSidebar,
    setTnaId,
    searchQuery,
    setIsShowTnaUpdateSidebar,
  } = useTnaReviewStore();
  const router = useRouter();
  const { id } = useParams();
  const { data, isFetching, refetch } = useGetTna(
    {
      page: 1,
      limit: 1,
    },
    {
      filter: {
        id: [id as string],
      },
    },
    searchQuery,
    true,
    true,
  );

  useEffect(() => {
    if (!isShowTnaUpdateSidebar) {
      refetch();
    }
  }, [isShowTnaUpdateSidebar]);
  const { data: employeeData } = useGetAllUsers();

  const userData = (id: string) => {
    const user = employeeData?.items?.find((item: any) => item.id === id);
    return `${user?.firstName || ''} ${user?.middleName || ''} ${user?.lastName || ''}`.trim();
  };
  const userImage = (id: string) => {
    const user = employeeData?.items?.find((item: any) => item.id === id);
    return user?.profileImage;
  };
  type ApprovalRecord = {
    approverId: string; // UUID
    userId: string; // UUID
    stepOrder: number;
    status: 'Approved' | 'Rejected' | 'Pending'; // Adjust enum as needed
    conditionField: string | null;
    conditionRangeValue: string | null;
    tenantId: string; // UUID
    approvalLogId: string; // UUID
    requestId: string; // UUID
    approvalWorkflowId: string; // UUID
    action: 'Approved' | 'Rejected'; // Adjust enum as needed
    approvalComments: any;
  };
  const ApprovalList = ({
    id,
    approvalWorkflowId,
  }: {
    id: string;
    approvalWorkflowId: string;
  }) => {
    const { data: logData } = useGetSingleApprovalLog(
      id ?? '',
      approvalWorkflowId ?? '',
    );
    return (
      <div className="mx-1 text-sm" id="tnaReviewDetailApprovalListId" data-cy="tna-review-detail-approval-list">
        {Array.isArray(logData) &&
          logData
            ?.sort((a, b) => a.stepOrder - b.stepOrder)
            ?.map((approvalCard: ApprovalRecord, idx: number) => (
              <ApprovalStatusCard
                key={idx}
                data={approvalCard}
                userName={userData}
                userImage={userImage}
                data-cy={`tna-review-detail-approval-card-${idx}`}
              />
            ))}
      </div>
    );
  };
  return (
    <div className="page-wrap" id="tnaReviewDetailPageId" data-cy="tna-review-detail-page">
      <BlockWrapper data-cy="tna-review-detail-block-wrapper">
        <PageHeader
          title={
            <div className="flex items-center gap-1 " id="tnaReviewDetailPageHeaderTitleId" data-cy="tna-review-detail-page-header-title">
              <Button
                icon={<FaArrowLeftLong size={18} id="tnaReviewDetailPageHeaderBackIconId" data-cy="tna-review-detail-page-header-back-icon" />}
                className="text-gray-900 bg-transparent shadow-none"
                id="tnaDetailActionButtonId"
                data-cy="tna-detail-action-button"
                type="primary"
                size="small"
                onClick={router.back}
              />{' '}
              Details
            </div>
          }
          data-cy="tna-review-detail-page-header"
        />
        {!data?.items?.length ? (
          <div className="flex justify-center" data-cy="tna-review-detail-page-spinner" id="tnaReviewDetailPageSpinnerId">
            <Spin data-cy="tna-review-detail-page-spinner-component" />
          </div>
        ) : (
          <Spin spinning={isFetching} data-cy="tna-review-detail-page-spinner-component">
            <div className="mt-6 rounded-lg border border-gray-200 p-6" data-cy="tna-review-detail-page-content" id="tnaReviewDetailPageContentId">
              <div className="border-b border-gray-200 text-lg font-semibold text-gray-900 pb-4 mb-8" data-cy="tna-review-detail-page-user-card" id="tnaReviewDetailPageUserCardId">
                {data.items[0].assignedUserId ? (
                  <UserCard
                    data={data}
                    name={
                      data.items[0].assignedUserId &&
                      userData(String(data.items[0].assignedUserId))
                    }
                    profileImage={
                      data.items[0].assignedUserId &&
                      userImage(String(data.items[0].assignedUserId))
                    }
                    size="small"
                    data-cy="tna-review-detail-page-user-card-component"
                  />
                ) : (
                  '-'
                )}
              </div>

              <div id="tnaReviewDetailPageDetailsId" data-cy="tna-review-detail-page-details">
                <div className="flex gap-2.5 text-sm mb-4" id="tnaReviewDetailPageRequesterId" data-cy="tna-review-detail-page-requester">
                  <div className="w-1/3 text-gray-600" id="tnaReviewDetailPageRequesterLabelId" data-cy="tna-review-detail-page-requester-label">Requester</div>
                  <div className="flex-1 " id="tnaReviewDetailPageRequesterValueId" data-cy="tna-review-detail-page-requester-value">
                    <UserCard
                      data={data}
                      name={
                        data.items[0].assignedUserId &&
                        userData(String(data.items[0].assignedUserId))
                      }
                      profileImage={
                        data.items[0].assignedUserId &&
                        userImage(String(data.items[0].assignedUserId))
                      }
                      size="small"
                      data-cy="tna-review-detail-page-requester-user-card-component"
                    />
                  </div>
                </div>

                <div className="flex gap-2.5 mb-4 text-sm font-semibold" id="tnaReviewDetailPageTrainingId" data-cy="tna-review-detail-page-training">
                  <div className="w-1/3  text-gray-600" id="tnaReviewDetailPageTrainingLabelId" data-cy="tna-review-detail-page-training-label">Training</div>
                  <div className="flex-1" id="tnaReviewDetailPageTrainingValueId" data-cy="tna-review-detail-page-training-value">
                    {data.items[0].trainingNeedCategory?.name}
                  </div>
                </div>

                <div className="flex gap-2.5 mb-4 text-sm" id="tnaReviewDetailPageStatusId" data-cy="tna-review-detail-page-status">
                  <div className="w-1/3 text-gray-600" id="tnaReviewDetailPageStatusLabelId" data-cy="tna-review-detail-page-status-label">Status</div>
                  <div className="flex-1" id="tnaReviewDetailPageStatusValueId" data-cy="tna-review-detail-page-status-value">
                    <StatusBadge
                      theme={
                        TrainingNeedAssessmentStatusBadgeTheme[
                          data.items[0].status
                        ]
                      }
                      data-cy="tna-review-detail-page-status-badge-component"
                    >
                      {data.items[0].status}
                    </StatusBadge>
                  </div>
                </div>

                <div className="flex gap-2.5 text-sm mb-4" id="tnaReviewDetailPageCertStatusId" data-cy="tna-review-detail-page-cert-status">
                  <div className="w-1/3 text-gray-600" id="tnaReviewDetailPageCertStatusLabelId" data-cy="tna-review-detail-page-cert-status-label">Cert-Status</div>
                  <div className="flex-1" id="tnaReviewDetailPageCertStatusValueId" data-cy="tna-review-detail-page-cert-status-value">
                    <StatusBadge
                      theme={
                        TrainingNeedAssessmentCertStatusBadgeTheme[
                          data.items[0].certStatus
                        ]
                      }
                      data-cy="tna-review-detail-page-cert-status-badge-component"
                    >
                      {data.items[0].certStatus}
                    </StatusBadge>
                  </div>
                </div>

                <div className="flex gap-2.5 text-sm mb-4" id="tnaReviewDetailPageCompletedOnId" data-cy="tna-review-detail-page-completed-on">
                  <div className="w-1/3 text-gray-600" id="tnaReviewDetailPageCompletedOnLabelId" data-cy="tna-review-detail-page-completed-on-label">Completed on</div>
                  <div className="flex-1" id="tnaReviewDetailPageCompletedOnValueId" data-cy="tna-review-detail-page-completed-on-value">
                    {data.items[0].completedAt
                      ? dayjs(data.items[0].completedAt).format(DATE_FORMAT)
                      : '-'}
                  </div>
                </div>

                <div className="flex gap-2.5 mb-4" id="tnaReviewDetailPageAttachmentsId" data-cy="tna-review-detail-page-attachments">
                  <div className="w-1/3 text-gray-600" id="tnaReviewDetailPageAttachmentsLabelId" data-cy="tna-review-detail-page-attachments-label">Attachments</div>
                  <div className="flex-1 flex items-center gap-2.5 flex-wrap" id="tnaReviewDetailPageAttachmentsListId" data-cy="tna-review-detail-page-attachments-list">
                    {data.items[0].trainingProofs?.map((proof) =>
                      proof.attachmentFile ? (
                        <FileButton
                          key={proof.id}
                          fileName={
                            formatLinkToUploadFile(proof.attachmentFile).name
                          }
                          link={proof.attachmentFile}
                          data-cy={`tna-review-detail-page-attachment-${proof.id}`}
                        />
                      ) : null,
                    )}
                  </div>
                </div>

                <div className="flex gap-2.5 text-sm" id="tnaReviewDetailPageDetailInfoId" data-cy="tna-review-detail-page-detail-info">
                  <div className="w-[200px] text-gray-600" id="tnaReviewDetailPageDetailInfoLabelId" data-cy="tna-review-detail-page-detail-info-label">
                    Detailed information
                  </div>
                  <div className="flex-1 font-semibold" id="tnaReviewDetailPageDetailInfoValueId" data-cy="tna-review-detail-page-detail-info-value">
                    {data.items[0].detail}
                  </div>
                </div>
              </div>

              <div className="border-b border-gray-200 text-lg font-semibold text-gray-900 pb-4 mb-8" id="tnaReviewDetailPageApproverSectionId" data-cy="tna-review-detail-page-approver-section">
                {data.items[0].assignedUserId ? (
                  <UserCard
                    data={data}
                    name={
                      data.items[0].assignedUserId &&
                      userData(String(data.items[0].assignedUserId))
                    }
                    profileImage={
                      data.items[0].assignedUserId &&
                      userImage(String(data.items[0].assignedUserId))
                    }
                    size="small"
                    data-cy="tna-review-detail-page-approver-user-card-component"
                  />
                ) : (
                  '-'
                )}
              </div>
              <div id="tnaReviewDetailPageApprovalLevelsId" data-cy="tna-review-detail-page-approval-levels">
                <div className="text-lg font-semibold text-gray-900" id="tnaReviewDetailPageApprovalLevelsTitleId" data-cy="tna-review-detail-page-approval-levels-title">
                  Approval Levels Status
                </div>

                <div className="my-2.5" id="tnaReviewDetailPageApprovalStatusesInfoId" data-cy="tna-review-detail-page-approval-statuses-info">
                  <ApprovalStatusesInfo data-cy="tna-review-detail-page-approval-statuses-info-component" />
                </div>
                <ApprovalList
                  id={data.items[0].id}
                  approvalWorkflowId={data.items[0].approvalWorkflowId}
                  data-cy="tna-review-detail-page-approval-list"
                />
              </div>
            </div>

            <div className="flex justify-end mt-6" id="tnaReviewDetailPageActionsId" data-cy="tna-review-detail-page-actions">
              <AccessGuard permissions={[Permissions.UpdateTna]} id="tnaReviewDetailPageUpdateGuardId" data-cy="tna-review-detail-page-update-guard">
                <CustomButton
                  title="Update TNA"
                  type="primary"
                  id="tnaUpdateCustomButtonId"
                  data-cy="tna-update-custom-button"
                  icon={<FiEdit2 size={16} id="tnaReviewDetailPageUpdateIconId" data-cy="tna-review-detail-page-update-icon" />}
                  size="large"
                  disabled={
                    data.items[0].certStatus ===
                    TrainingNeedAssessmentCertStatus.COMPLETED
                  }
                  onClick={() => {
                    setTnaId(data.items[0].id);
                    setIsShowTnaUpdateSidebar(true);
                  }}
                />
              </AccessGuard>
            </div>
          </Spin>
        )}
      </BlockWrapper>

      <TnaUpdateSidebar data-cy="tna-review-detail-update-sidebar" />
    </div>
  );
};

export default TnaDetailPage;
