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
      <div className="mx-1 text-sm">
        {Array.isArray(logData) &&
          logData
            ?.sort((a, b) => a.stepOrder - b.stepOrder)
            ?.map((approvalCard: ApprovalRecord, idx: number) => (
              <ApprovalStatusCard
                key={idx}
                data={approvalCard}
                userName={userData}
                userImage={userImage}
              />
            ))}
      </div>
    );
  };
  return (
    <div className="page-wrap">
      <BlockWrapper>
        <PageHeader
          title={
            <div className="flex items-center gap-1 ">
              <Button
                icon={<FaArrowLeftLong size={18} />}
                className="text-gray-900 bg-transparent shadow-none"
                id="tnaDetailActionButtonId"
                type="primary"
                size="small"
                onClick={router.back}
              />{' '}
              Details
            </div>
          }
        />
        {!data?.items?.length ? (
          <div className="flex justify-center">
            <Spin />
          </div>
        ) : (
          <Spin spinning={isFetching}>
            <div className="mt-6 rounded-lg border border-gray-200 p-6">
              <div className="border-b border-gray-200 text-lg font-semibold text-gray-900 pb-4 mb-8">
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
                  />
                ) : (
                  '-'
                )}
              </div>

              <div>
                <div className="flex gap-2.5 text-sm mb-4">
                  <div className="w-1/3 text-gray-600">Requester</div>
                  <div className="flex-1 ">
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
                    />
                  </div>
                </div>

                <div className="flex gap-2.5 mb-4 text-sm font-semibold">
                  <div className="w-1/3  text-gray-600">Training</div>
                  <div className="flex-1">
                    {data.items[0].trainingNeedCategory?.name}
                  </div>
                </div>

                <div className="flex gap-2.5 mb-4 text-sm">
                  <div className="w-1/3 text-gray-600">Status</div>
                  <div className="flex-1">
                    <StatusBadge
                      theme={
                        TrainingNeedAssessmentStatusBadgeTheme[
                          data.items[0].status
                        ]
                      }
                    >
                      {data.items[0].status}
                    </StatusBadge>
                  </div>
                </div>

                <div className="flex gap-2.5 text-sm mb-4">
                  <div className="w-1/3 text-gray-600">Cert-Status</div>
                  <div className="flex-1">
                    <StatusBadge
                      theme={
                        TrainingNeedAssessmentCertStatusBadgeTheme[
                          data.items[0].certStatus
                        ]
                      }
                    >
                      {data.items[0].certStatus}
                    </StatusBadge>
                  </div>
                </div>

                <div className="flex gap-2.5 text-sm mb-4">
                  <div className="w-1/3 text-gray-600">Completed on</div>
                  <div className="flex-1">
                    {data.items[0].completedAt
                      ? dayjs(data.items[0].completedAt).format(DATE_FORMAT)
                      : '-'}
                  </div>
                </div>

                <div className="flex gap-2.5 mb-4">
                  <div className="w-1/3 text-gray-600">Attachments</div>
                  <div className="flex-1 flex items-center gap-2.5 flex-wrap">
                    {data.items[0].trainingProofs?.map((proof) =>
                      proof.attachmentFile ? (
                        <FileButton
                          key={proof.id}
                          fileName={
                            formatLinkToUploadFile(proof.attachmentFile).name
                          }
                          link={proof.attachmentFile}
                        />
                      ) : null,
                    )}
                  </div>
                </div>

                <div className="flex gap-2.5 text-sm">
                  <div className="w-[200px] text-gray-600">
                    Detailed information
                  </div>
                  <div className="flex-1 font-semibold">
                    {data.items[0].detail}
                  </div>
                </div>
              </div>

              <div className="border-b border-gray-200 text-lg font-semibold text-gray-900 pb-4 mb-8">
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
                  />
                ) : (
                  '-'
                )}
              </div>
              <div>
                <div className="text-lg font-semibold text-gray-900">
                  Approval Levels Status
                </div>

                <div className="my-2.5">
                  <ApprovalStatusesInfo />
                </div>
                <ApprovalList
                  id={data.items[0].id}
                  approvalWorkflowId={data.items[0].approvalWorkflowId}
                />
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <AccessGuard permissions={[Permissions.UpdateTna]}>
                <CustomButton
                  title="Update TNA"
                  type="primary"
                  id="tnaUpdateCustomButtonId"
                  icon={<FiEdit2 size={16} />}
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

      <TnaUpdateSidebar />
    </div>
  );
};

export default TnaDetailPage;
