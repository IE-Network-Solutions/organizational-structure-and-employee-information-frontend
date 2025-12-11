import { useLeaveManagementStore } from '@/store/uistate/features/timesheet/leaveManagement';
import CustomDrawerLayout from '@/components/common/customDrawer';
import { Col, Divider, Row, Spin } from 'antd';
import { classNames } from '@/utils/classNames';
import { TbFileDownload } from 'react-icons/tb';
import CustomDrawerFooterButton, {
  CustomDrawerFooterButtonProps,
} from '@/components/common/customDrawer/customDrawerFooterButton';
import CustomDrawerHeader from '@/components/common/customDrawer/customDrawerHeader';
import ApprovalStatusesInfo from '@/components/common/approvalStatuses/approvalStatusesInfo';
import ApprovalStatusCard from '@/components/common/approvalStatuses/approvalStatusCard';
import UserCard from '@/components/common/userCard/userCard';
import { LeaveRequestStatus } from '@/types/timesheet/settings';
import dayjs from 'dayjs';
import { DATE_FORMAT } from '@/utils/constants';
import { formatLinkToUploadFile } from '@/helpers/formatTo';
import {
  useGetSingleApprovalLog,
  useGetSingleLeaveRequest,
} from '@/store/server/features/timesheet/leaveRequest/queries';
import { useGetAllUsers } from '@/store/server/features/employees/employeeManagment/queries';
import Image from 'next/image';

const LeaveRequestManagementSidebar = () => {
  const {
    isShowLeaveRequestManagementSidebar: isShow,
    setIsShowLeaveRequestManagementSidebar: setIsShow,
    leaveRequestId,
    setLeaveRequestId,
    leaveRequestWorkflowId,
    setLeaveRequestWorkflowId,
  } = useLeaveManagementStore();

  const { data: leaveData, isLoading } = useGetSingleLeaveRequest(
    leaveRequestId ?? '',
  );
  const { data: logData } = useGetSingleApprovalLog(
    leaveRequestId ?? '',
    leaveRequestWorkflowId ?? '',
  );
  const { data: employeeData } = useGetAllUsers();
  const userData = (id: string) => {
    const user = employeeData?.items?.find((item: any) => item.id === id);
    return `${user?.firstName || ''} ${user?.middleName || ''} ${user?.lastName || ''}`.trim();
  };
  const userImage = (id: string) => {
    const user = employeeData?.items?.find((item: any) => item.id === id);
    return user?.profileImage;
  };
  const onClose = () => {
    setLeaveRequestId(null);
    setLeaveRequestWorkflowId(null);
    setIsShow(false);
  };

  const footerModalItems: CustomDrawerFooterButtonProps[] = [
    {
      label: 'Close',
      key: 'close',
      className: 'h-[40px] sm:h-[56px] text-base',
      size: 'large',
      onClick: () => {
        onClose();
      },
    },
  ];

  const labelClass = 'text-sm text-gray-900 font-medium mb-2.5';
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
  return (
    isShow && (
        <CustomDrawerLayout
          data-cy="time-attendance-leave-management-sidebar"
          open={isShow}
          onClose={() => onClose()}
          modalHeader={
            <CustomDrawerHeader
              data-cy="time-attendance-leave-management-sidebar-header"
            >
              Leave Request Management
            </CustomDrawerHeader>
          }
          footer={
            <div
              className="p-4"
              id="time-attendance-leave-management-sidebar-footer"
              data-cy="time-attendance-leave-management-sidebar-footer"
            >
              <CustomDrawerFooterButton data-cy="time-attendance-leave-management-sidebar-footer-buttons" buttons={footerModalItems} />
            </div>
          }
          width="40%"
          customMobileHeight="90vh"
        >
          {!leaveData ? (
            <div
              className="flex justify-center py-10"
              id="time-attendance-leave-management-sidebar-loading"
              data-cy="time-attendance-leave-management-sidebar-loading"
            >
              <Spin data-cy="time-attendance-leave-management-sidebar-loading-spin" />
            </div>
          ) : (
            <Spin
              spinning={isLoading}
              data-cy="time-attendance-leave-management-sidebar-spin"
            >
              <div
                className="flex items-center gap-[15px] mb-8"
                id="time-attendance-leave-management-sidebar-requester-section"
                data-cy="time-attendance-leave-management-sidebar-requester-section"
              >
                <div id="time-attendance-leave-management-sidebar-requester-label" data-cy="time-attendance-leave-management-sidebar-requester-label" className="text-xs text-gray-900">Requester:</div>
                <UserCard
                  data-cy="time-attendance-leave-management-sidebar-requester-card"
                  data={leaveData}
                  name={
                    leaveData?.items?.userId &&
                    userData(String(leaveData?.items?.userId))
                  }
                  profileImage={
                    leaveData?.items?.userId &&
                    userImage(String(leaveData?.items?.userId))
                  }
                  size="small"
                />
              </div>
              <Row data-cy="time-attendance-leave-management-sidebar-leave-type-row" gutter={[32, 32]}>
                <Col span={8} id="time-attendance-leave-management-sidebar-leave-type-col" data-cy="time-attendance-leave-management-sidebar-leave-type-col">
                  <div id="time-attendance-leave-management-sidebar-leave-type-label" data-cy="time-attendance-leave-management-sidebar-leave-type-label" className={labelClass}>Leave Type</div>
                  <div
                    id="time-attendance-leave-management-sidebar-leave-type-value"
                    data-cy="time-attendance-leave-management-sidebar-leave-type-value"
                    className={classNames(labelClass, undefined, [
                      'font-semibold',
                      'mb-0',
                    ])}
                  >
                    {leaveData?.items?.leaveType
                      ? typeof leaveData?.items?.leaveType !== 'string'
                        ? leaveData?.items?.leaveType.title
                        : ''
                      : ''}
                  </div>
                </Col>
                <Col data-cy="time-attendance-leave-management-sidebar-date-col" span={8}>
                  <div id="time-attendance-leave-management-sidebar-date-label" data-cy="time-attendance-leave-management-sidebar-date-label" className={labelClass}>Date</div>
                  <div
                    id="time-attendance-leave-management-sidebar-date-value"
                    data-cy="time-attendance-leave-management-sidebar-date-value"
                    className={classNames(labelClass, undefined, [
                      'font-semibold',
                      'mb-0',
                    ])}
                  >
                    {dayjs(leaveData?.items?.startAt).format(DATE_FORMAT)} -
                    &nbsp;
                    {dayjs(leaveData?.items?.endAt).format(DATE_FORMAT)}
                  </div>
                </Col>
                <Col data-cy="time-attendance-leave-management-sidebar-total-days-col" span={8}>
                  <div id="time-attendance-leave-management-sidebar-total-days-label" data-cy="time-attendance-leave-management-sidebar-total-days-label" className={labelClass}>Total Days</div>
                  <div
                    id="time-attendance-leave-management-sidebar-total-days-value"
                    data-cy="time-attendance-leave-management-sidebar-total-days-value"
                    className={classNames(labelClass, undefined, [
                      'font-semibold',
                      'mb-0',
                    ])}
                  >
                    {leaveData?.items?.days ? leaveData?.items?.days : ''}
                  </div>
                </Col>

                {leaveData?.items?.justificationDocument && (
                  <Col data-cy="time-attendance-leave-management-sidebar-attachment-col" span={24}>
                    <div
                      className={labelClass}
                      id="time-attendance-leave-management-sidebar-attachment-label"
                      data-cy="time-attendance-leave-management-sidebar-attachment-label"
                    >
                      Attachment <span id="time-attendance-leave-management-sidebar-attachment-label-asterisk" data-cy="time-attendance-leave-management-sidebar-attachment-label-asterisk" className="text-error">*</span>
                    </div>
                    <a
                      href={leaveData?.items?.justificationDocument}
                      target="_blank"
                      className="w-full h-[54px] border border-gray-200 rounded-[10px] flex items-center justify-between px-5 text-gray-900"
                      id="time-attendance-leave-management-sidebar-attachment-link"
                      data-cy="time-attendance-leave-management-sidebar-attachment-link"
                    >
                      <div id="time-attendance-leave-management-sidebar-attachment-link-name" data-cy="time-attendance-leave-management-sidebar-attachment-link-name" className="text-sm font-medium">
                        {
                          formatLinkToUploadFile(
                            leaveData?.items?.justificationDocument,
                          ).name
                        }
                      </div>

                      <TbFileDownload data-cy="time-attendance-leave-management-sidebar-attachment-link-icon" size={20} />
                    </a>
                  </Col>
                )}
              </Row>
              <Divider data-cy="time-attendance-leave-management-sidebar-approval-levels-status-divider" className="my-8 h-[5px] bg-gray-200" />
              <div
                id="time-attendance-leave-management-sidebar-approval-section"
                data-cy="time-attendance-leave-management-sidebar-approval-section"
              >
                <div id="time-attendance-leave-management-sidebar-approval-levels-status-label" data-cy="time-attendance-leave-management-sidebar-approval-levels-status-label" className="text-lg font-semibold text-gray-900">
                  Approval Levels Status
                </div>

                <div id="time-attendance-leave-management-sidebar-approval-levels-status-info" data-cy="time-attendance-leave-management-sidebar-approval-levels-status-info" className="my-2.5">
                  <ApprovalStatusesInfo data-cy="time-attendance-leave-management-sidebar-approval-levels-status-info-component"  />
                </div>
                {Array.isArray(logData) &&
                  logData
                    ?.sort((a, b) => a.stepOrder - b.stepOrder)
                    ?.map((approvalCard: ApprovalRecord, idx: number) => (
                      <ApprovalStatusCard
                        data-cy="time-attendance-leave-management-sidebar-approval-levels-status-card"
                        key={idx}
                        data={approvalCard}
                        userName={userData}
                        userImage={userImage}
                      />
                    ))}
              </div>
              <Divider data-cy="time-attendance-leave-management-sidebar-approval-levels-status-divider" className="my-8 h-[5px] bg-gray-200" />

              <div
                id="time-attendance-leave-management-sidebar-overall-status-section"
                data-cy="time-attendance-leave-management-sidebar-overall-status-section"
              >
                <div
                  className="flex items-center justify-between mt-5 mb-4"
                  id="time-attendance-leave-management-sidebar-overall-status-header"
                  data-cy="time-attendance-leave-management-sidebar-overall-status-header"
                >
                  <div id="time-attendance-leave-management-sidebar-overall-status-label" data-cy="time-attendance-leave-management-sidebar-overall-status-label" className="text-sm font-semibold text-gray-900">
                    Over All Status
                  </div>
                  <div id="time-attendance-leave-management-sidebar-overall-status-value" data-cy="time-attendance-leave-management-sidebar-overall-status-value" className="text-sm font-semibold text-gray-900 flex gap-2">
                    {leaveData?.items?.status}
                    <Image
                      data-cy="time-attendance-leave-management-sidebar-overall-status-image"
                      width={24}
                      height={24}
                      src={
                      leaveData?.items?.status === LeaveRequestStatus?.APPROVED
                          ? '/icons/status/verify.svg'
                          : leaveData?.items?.status ===
                              LeaveRequestStatus?.PENDING
                            ? '/icons/status/information.svg'
                            : leaveData?.items?.status ===
                                LeaveRequestStatus?.DECLINED
                              ? '/icons/status/reject.svg'
                              : ''
                      }
                      alt={leaveData?.items?.status}
                    />
                  </div>
                </div>
              </div>
            </Spin>
          )}
        </CustomDrawerLayout>
    )
  );
};

export default LeaveRequestManagementSidebar;
