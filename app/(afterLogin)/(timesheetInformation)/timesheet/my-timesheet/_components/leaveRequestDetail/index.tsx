import { useMyTimesheetStore } from '@/store/uistate/features/timesheet/myTimesheet';
import {
  Avatar,
  Button,
  Checkbox,
  Col,
  DatePicker,
  Form,
  Input,
  Modal,
  Row,
  Select,
  Skeleton,
  Steps,
  Tag,
  Tooltip,
} from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { LeaveRequestStatus } from '@/types/timesheet/settings';
import React, { useEffect, useMemo } from 'react';
import { useGetAllUsers } from '@/store/server/features/employees/employeeManagment/queries';
import {
  useGetSingleApproval,
  useGetSingleApprovalLog,
  useGetSingleLeaveRequest,
} from '@/store/server/features/timesheet/leaveRequest/queries';
import {
  useDeleteLeaveRequest,
  useSetLeaveRequest,
} from '@/store/server/features/timesheet/leaveRequest/mutation';
import { useGetLeaveTypes } from '@/store/server/features/timesheet/leaveType/queries';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { useAllApproval } from '@/store/server/features/approver/queries';
import { APPROVALTYPES } from '@/types/enumTypes';
import dayjs from 'dayjs';
import { DATE_FORMAT } from '@/utils/constants';
import { formatLinkToUploadFile, formatToOptions } from '@/helpers/formatTo';
import ApprovalStatusCardSkeleton from '@/components/common/approvalStatuses/approvalStatusCardSkeleton';
import { SingleLogRequest } from '@/types/timesheet/settings';
import CustomLabel from '@/components/form/customLabel/customLabel';
import CustomUpload from '@/components/form/customUpload';
import { InboxOutlined } from '@ant-design/icons';
import { MdKeyboardArrowDown } from 'react-icons/md';

const LeaveRequestDetail = () => {
  const {
    isShowLeaveRequestDetail,
    leaveRequestSidebarData,
    setLeaveRequestSidebarData,
    leaveRequestSidebarWorkflowData,
    setLeaveRequestSidebarWorkflowData,
    setIsShowLeaveRequestDetail,
  } = useMyTimesheetStore();
  const { mutate: deleteLeaveRequest } = useDeleteLeaveRequest();
  const { mutate: updateLeaveRequest, isLoading: isUpdating } =
    useSetLeaveRequest();
  const { userId } = useAuthenticationStore();
  const { data: employeeData } = useGetAllUsers();
  const { data: leaveTypesData } = useGetLeaveTypes();
  const currentUser = employeeData?.items?.find(
    (item: any) => item.id === userId,
  ) as any;
  const departmentId =
    currentUser?.employeeJobInformation?.[0]?.departmentId ?? '';
  const { data: approvalDepartmentData } = useAllApproval(
    departmentId,
    APPROVALTYPES?.LEAVE,
  );
  const { data: approvalUserData } = useAllApproval(
    userId ?? '',
    APPROVALTYPES?.LEAVE,
  );
  const [form] = Form.useForm();

  const userImage = (id: string) => {
    const user = employeeData?.items?.find((item: any) => item.id === id);
    return user?.profileImage;
  };

  const userName = (id: string) => {
    const user = employeeData?.items?.find((item: any) => item.id === id);
    if (!user) return '';
    return (
      [user?.firstName, user?.middleName, user?.lastName]
        .filter(Boolean)
        .join(' ')
        .trim() || 'Unknown'
    );
  };

  const onClose = () => {
    form.resetFields();
    setLeaveRequestSidebarData(null);
    setLeaveRequestSidebarWorkflowData(null);
    setIsShowLeaveRequestDetail(false);
  };

  const { data: leaveData, isLoading } = useGetSingleLeaveRequest(
    leaveRequestSidebarData ?? '',
  );

  const { data: logData, isLoading: isLogDataLoading } =
    useGetSingleApprovalLog(
      leaveRequestSidebarData ?? '',
      leaveRequestSidebarWorkflowData ?? '',
    );

  const { data: approverLog } = useGetSingleApproval(
    leaveRequestSidebarData ?? '',
  );

  // Merge data from both endpoints to show historical approvers who took action
  const enrichedApprovalData = useMemo(() => {
    if (!logData || !Array.isArray(logData)) return [];

    // Handle both response formats: direct array or wrapped in items
    const historicalLogs = Array.isArray(approverLog)
      ? approverLog
      : approverLog?.items || [];

    return logData.map((approval: ApprovalRecord) => {
      // Find matching historical record from approverLog array
      // Match by stepOrder to find who actually took action
      const historicalRecord = historicalLogs.find(
        (log: SingleLogRequest) => log.stepOrder === approval.stepOrder,
      );

      // If historical record exists with action taken, use it
      const hasActionTaken =
        historicalRecord &&
        (historicalRecord.action === 'Approved' ||
          historicalRecord.action === 'Rejected');

      return {
        ...approval,
        approvedUserId: historicalRecord?.approvedUserId,
        status: hasActionTaken
          ? historicalRecord.action === 'Approved'
            ? 'Approved'
            : 'Rejected'
          : approval.status,
        displayUserId: hasActionTaken
          ? historicalRecord.approvedUserId
          : approval.userId,
        approvalComments:
          historicalRecord?.approvalComments ?? approval.approvalComments,
        _historicalRecord: historicalRecord,
      };
    });
  }, [logData, approverLog]);

  // Sorted copy for rendering (never mutate enrichedApprovalData in render)
  const sortedApprovalData = useMemo(
    () =>
      [...(enrichedApprovalData ?? [])].sort(
        (a, b) => a.stepOrder - b.stepOrder,
      ),
    [enrichedApprovalData],
  );

  const statusTagConfig: Record<
    LeaveRequestStatus,
    { color: string; label: string }
  > = {
    [LeaveRequestStatus.PENDING]: { color: 'orange', label: 'Pending' },
    [LeaveRequestStatus.APPROVED]: { color: 'blue', label: 'Approved' },
    [LeaveRequestStatus.DECLINED]: { color: 'red', label: 'Rejected' },
  };

  const disableActions =
    leaveData?.items?.status === LeaveRequestStatus.APPROVED ||
    leaveData?.items?.status === LeaveRequestStatus.DECLINED;

  // Disable edit when any approval step has been acted on (approval has started)
  const approvalHasStarted = sortedApprovalData.some(
    (step) => step.status !== 'Pending',
  );

  const handleCancelRequest = () => {
    if (!leaveRequestSidebarData) return;
    Modal.confirm({
      title: 'Cancel request',
      content: 'Are you sure you want to cancel this leave request?',
      okText: 'Yes, cancel',
      cancelText: 'No',
      okButtonProps: { danger: true },
      onOk: () => {
        deleteLeaveRequest(leaveRequestSidebarData, {
          onSuccess: () => onClose(),
        });
      },
    });
  };

  // Populate form when leave data is loaded (modal opens with editable form)
  useEffect(() => {
    if (!leaveData?.items) return;
    const item = leaveData.items;
    form.setFieldsValue({
      type:
        typeof item.leaveType !== 'string' && item.leaveType?.id
          ? item.leaveType.id
          : undefined,
      isHalfday: !!item.isHalfday,
      startDate: item.startAt ? dayjs(item.startAt) : undefined,
      endDate: item.endAt ? dayjs(item.endAt) : undefined,
      note: item.justificationNote ?? '',
      delegatee:
        typeof item.delegatee !== 'string' && item.delegatee?.id
          ? (item.delegatee as any).id
          : (item.delegatee as string) || undefined,
      attachment: item.justificationDocument
        ? [
            {
              ...formatLinkToUploadFile(item.justificationDocument),
              url: item.justificationDocument,
            },
          ]
        : undefined,
    });
  }, [leaveData?.items, form]);

  const onFinishEdit = () => {
    const value = form.getFieldsValue();
    const item = leaveData?.items;
    if (!item || !userId) return;
    updateLeaveRequest(
      {
        item: {
          ...item,
          leaveType: value.type,
          delegatee: value.delegatee,
          isHalfday: !!value.isHalfday,
          startAt: dayjs(value.startDate).format('YYYY-MM-DD'),
          endAt: dayjs(value.endDate).format('YYYY-MM-DD'),
          justificationDocument: value.attachment?.length
            ? (value.attachment[0]?.response ?? item.justificationDocument)
            : item.justificationDocument,
          justificationNote: value.note,
          status: LeaveRequestStatus.PENDING,
          approvalWorkflowId:
            item.approvalWorkflowId ??
            approvalUserData?.[0]?.id ??
            approvalDepartmentData?.[0]?.id,
          approvalType: 'Leave',
        },
        userId,
      },
      {},
    );
  };

  const validateDates = () => {
    const startDate = form.getFieldValue('startDate');
    const endDate = form.getFieldValue('endDate');
    if (startDate && endDate && dayjs(startDate).isAfter(dayjs(endDate))) {
      return Promise.reject(new Error('End date must be after start date'));
    }
    return Promise.resolve();
  };
  const handleDateChange = () => form.validateFields(['startDate', 'endDate']);

  const typeOptions = () =>
    formatToOptions(leaveTypesData?.items ?? [], 'title', 'id');
  const itemClass =
    'text-xs [&_.ant-form-item-label]:mb-1.5 [&_.ant-form-item-label]:font-normal';
  const controlClass = 'w-full';

  const rejectedStep = useMemo(
    () => enrichedApprovalData?.find((a) => a.status === 'Rejected'),
    [enrichedApprovalData],
  );

  // Rejection reason: try multiple possible API shapes (comment, commentText, content, or top-level on log)
  const rejectionComment = useMemo(() => {
    if (!rejectedStep) return '';
    const comments = (rejectedStep as any).approvalComments;
    const firstComment = Array.isArray(comments) ? comments[0] : comments;
    const fromComment =
      firstComment?.comment ??
      firstComment?.commentText ??
      firstComment?.content ??
      (typeof firstComment === 'string' ? firstComment : '') ??
      '';
    if (fromComment) return fromComment;
    const hist = (rejectedStep as any)._historicalRecord;
    return (
      hist?.comment ?? hist?.rejectionReason ?? hist?.rejectionComment ?? ''
    );
  }, [rejectedStep]);

  const rejectionUserId =
    rejectedStep?.displayUserId ??
    rejectedStep?.approvedUserId ??
    rejectedStep?.userId;

  type ApprovalRecord = {
    approverId: string; // UUID
    userId: string; // UUID - Current approver assigned
    approvedUserId?: string; // UUID - Historical: who actually took action
    displayUserId?: string; // UUID - Which userId to display
    stepOrder: number;
    status: 'Approved' | 'Rejected' | 'Pending'; // Adjust enum as needed
    conditionField: string | null;
    conditionRangeValue: string | null;
    tenantId: string; // UUID
    approvalLogId: string | null; // UUID
    requestId: string; // UUID
    approvalWorkflowId: string; // UUID
    action: 'Approved' | 'Rejected'; // Adjust enum as needed
    approvalComments: any;
  };

  const leaveTypeTitle =
    leaveData?.items?.leaveType && typeof leaveData.items.leaveType !== 'string'
      ? leaveData.items.leaveType.title
      : '';
  const statusConfig =
    leaveData?.items?.status != null
      ? statusTagConfig[leaveData.items.status as LeaveRequestStatus]
      : { color: 'default', label: '' };
  const daysLabel =
    leaveData?.items?.days != null
      ? `${leaveData.items.days} Day${leaveData.items.days !== 1 ? 's' : ''}`
      : '';

  return (
    <Modal
      open={isShowLeaveRequestDetail}
      onCancel={onClose}
      footer={null}
      width={560}
      closable
      destroyOnClose
      data-cy="time-attendance-leave-request-detail-modal"
      className="leave-request-detail-modal"
    >
      {!leaveData ? (
        <div
          className="flex justify-center py-10"
          data-cy="time-attendance-leave-request-detail-loading"
        >
          <Skeleton
            active
            data-cy="time-attendance-leave-request-detail-loading-spin"
          />
        </div>
      ) : (
        <Skeleton
          loading={isLoading || isUpdating}
          active
          data-cy="time-attendance-leave-request-detail-content-spin"
        >
          {/* Title: leave type name; subtitle: X Days + status tag */}
          <div
            className="mb-6"
            data-cy="time-attendance-leave-request-detail-header-section"
          >
            <h2
              className="text-xl font-bold text-gray-900 mb-1"
              data-cy="time-attendance-leave-request-detail-header"
            >
              {leaveTypeTitle || 'Leave Request'}
            </h2>
            <div
              className="flex items-center gap-2 flex-wrap"
              data-cy="time-attendance-leave-request-detail-days-and-status"
            >
              <span
                className="text-sm text-gray-500"
                data-cy="time-attendance-leave-request-detail-days-label"
              >
                {daysLabel}
              </span>
              <Tag
                color={statusConfig.color}
                data-cy="time-attendance-leave-request-detail-status-tag"
              >
                {statusConfig.label}
              </Tag>
            </div>
          </div>

          {/* Approval Stages: Ant Design Steps with Avatars */}
          <div
            className="mb-1"
            data-cy="time-attendance-leave-request-detail-approval-stages"
          >
            <div
              className="text-sm font-semibold text-gray-900"
              data-cy="time-attendance-leave-request-detail-approval-stages-title"
            >
              Approval Stages
            </div>
            {isLogDataLoading ? (
              <div
                className="flex items-center gap-2"
                data-cy="time-attendance-leave-request-detail-approval-stages-skeleton"
              >
                {Array.from({ length: 4 }).map((unusedPlaceholder, idx) => {
                  void unusedPlaceholder;
                  return (
                    <ApprovalStatusCardSkeleton
                      key={`skeleton-${idx}`}
                      dataCyPrefix={`time-attendance-leave-request-detail-approval-skeleton-${idx}`}
                    />
                  );
                })}
              </div>
            ) : (
              <div
                className="w-[70%] min-h-[72px] pt-4 -ml-9"
                data-cy="time-attendance-leave-request-detail-approval-steps"
              >
                <Steps
                  direction="horizontal"
                  labelPlacement="vertical"
                  size="default"
                  responsive={false}
                  current={(() => {
                    const idx = sortedApprovalData.findIndex(
                      (s) => s.status === 'Pending',
                    );
                    return idx >= 0 ? idx : sortedApprovalData.length;
                  })()}
                >
                  {sortedApprovalData.map(
                    (step: ApprovalRecord, index: number) => {
                      const displayUserId =
                        step.displayUserId ??
                        step.approvedUserId ??
                        step.userId;
                      const stepStatus:
                        | 'wait'
                        | 'process'
                        | 'finish'
                        | 'error' =
                        step.status === 'Approved'
                          ? 'finish'
                          : step.status === 'Rejected'
                            ? 'error'
                            : 'process';
                      // Only the first Pending step gets dashed blue; if any step is Rejected, there is no "current" pending
                      const hasRejected = sortedApprovalData.some(
                        (s) => s.status === 'Rejected',
                      );
                      const currentPendingIndex = hasRejected
                        ? -1
                        : sortedApprovalData.findIndex(
                            (s) => s.status === 'Pending',
                          );

                      return (
                        <Steps.Step
                          className="m-[-4px] p-0"
                          key={step.stepOrder}
                          status={stepStatus}
                          icon={
                            <Tooltip
                              title={
                                displayUserId
                                  ? userName(String(displayUserId))
                                  : 'Unknown'
                              }
                              placement="bottom"
                            >
                              <span
                                className="inline-flex"
                                data-cy={`time-attendance-leave-request-detail-approval-avatar-wrap-${step.stepOrder}`}
                              >
                                <Avatar
                                  size={36}
                                  src={
                                    displayUserId
                                      ? userImage(String(displayUserId))
                                      : undefined
                                  }
                                  icon={<UserOutlined />}
                                  data-cy={`time-attendance-leave-request-detail-approval-avatar-${step.stepOrder}`}
                                  style={{
                                    border:
                                      index === currentPendingIndex
                                        ? '3px dashed #1E40AF' // dashed only for current pending step
                                        : `3px solid ${
                                            step.status === 'Rejected'
                                              ? '#dc2626' // red for rejected
                                              : step.status === 'Approved'
                                                ? '#1E40AF' // primary for approved
                                                : '#9CA3AF' // gray for upcoming pending steps
                                          }`,
                                  }}
                                />
                              </span>
                            </Tooltip>
                          }
                        />
                      );
                    },
                  )}
                </Steps>
              </div>
            )}
          </div>

          {/* Rejection Reason (only when rejected) */}
          {leaveData?.items?.status === LeaveRequestStatus.DECLINED &&
            (rejectionComment || rejectionUserId) && (
              <div
                className="mb-6 p-4 rounded-lg border-2 border-red-200 bg-red-50"
                data-cy="time-attendance-leave-request-detail-rejection-reason"
              >
                <div
                  className="flex items-start gap-3"
                  data-cy="time-attendance-leave-request-detail-rejection-reason-content"
                >
                  {rejectionUserId && (
                    <Tooltip title={userName(String(rejectionUserId))}>
                      <div
                        className="rounded-full w-10 h-10 shrink-0 ring-2 ring-red-500 overflow-hidden bg-gray-100 flex items-center justify-center"
                        data-cy="time-attendance-leave-request-detail-rejection-avatar"
                      >
                        <Avatar
                          size={40}
                          src={userImage(String(rejectionUserId))}
                          icon={<UserOutlined />}
                          className="!flex !items-center !justify-center"
                        />
                      </div>
                    </Tooltip>
                  )}
                  <div data-cy="time-attendance-leave-request-detail-rejection-reason-text">
                    <div
                      className="text-sm font-semibold text-gray-900 mb-1"
                      data-cy="time-attendance-leave-request-detail-rejection-reason-label"
                    >
                      Rejection Reason
                    </div>
                    <div
                      className="text-sm text-gray-700"
                      data-cy="time-attendance-leave-request-detail-rejection-reason-body"
                    >
                      {rejectionComment || 'No reason provided.'}
                    </div>
                  </div>
                </div>
              </div>
            )}

          {/* Editable form (always shown) */}
          <Form
            form={form}
            layout="vertical"
            requiredMark={CustomLabel}
            onFinish={onFinishEdit}
            className="mt-2"
          >
            <Form.Item
              name="type"
              label="Leave Type"
              rules={[{ required: true }]}
              className={itemClass}
            >
              <Select
                className={controlClass}
                size="middle"
                options={typeOptions()}
                placeholder="Select Leave Type"
                suffixIcon={
                  <MdKeyboardArrowDown size={16} className="text-gray-900" />
                }
              />
            </Form.Item>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="startDate"
                  label="Start Date"
                  rules={[{ required: true }, { validator: validateDates }]}
                  className={itemClass}
                >
                  <DatePicker
                    className={controlClass}
                    size="middle"
                    onChange={handleDateChange}
                    format={DATE_FORMAT}
                    disabled={disableActions || approvalHasStarted}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="endDate"
                  label="End Date"
                  rules={[{ required: true }, { validator: validateDates }]}
                  className={itemClass}
                >
                  <DatePicker
                    className={controlClass}
                    size="middle"
                    onChange={handleDateChange}
                    format={DATE_FORMAT}
                    disabled={disableActions || approvalHasStarted}
                  />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item
              name="isHalfday"
              valuePropName="checked"
              className={itemClass}
            >
              <Checkbox>Half Date</Checkbox>
            </Form.Item>
            <Form.Item
              name="note"
              label="Reason"
              rules={[{ required: true }]}
              className={itemClass}
            >
              <Input.TextArea
                rows={4}
                size="middle"
                className="w-full"
                placeholder="Reason"
              />
            </Form.Item>
            <Form.Item name="delegatee" label="Delegate" className={itemClass}>
              <Select
                showSearch
                size="middle"
                placeholder="Select Delegate"
                className={controlClass}
                allowClear
                filterOption={(input: string, option: any) =>
                  (option?.label ?? '')
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
                options={employeeData?.items?.map((item: any) => ({
                  value: item?.id,
                  label: [item?.firstName, item?.middleName, item?.lastName]
                    .filter(Boolean)
                    .join(' '),
                }))}
              />
            </Form.Item>
            <Form.Item
              name="attachment"
              label="Attachment (optional)"
              valuePropName="fileList"
              className={itemClass}
              getValueFromEvent={(e) => (Array.isArray(e) ? e : e?.fileList)}
            >
              <CustomUpload
                className="w-full"
                accept=".pdf,.docx,.png,.jpeg,.jpg"
                name="attachment"
                mode="draggable"
                maxCount={1}
                icon={
                  <InboxOutlined
                    style={{ fontSize: 40 }}
                    className="text-primary"
                  />
                }
                title="Click or drag file to this area to upload"
                dragTitleClassName="font-normal text-sm text-gray-700"
                dragSubtitleClassName="font-normal text-sm text-gray-500"
                showDragSubtitle={false}
                showUploadList={{ showDownloadIcon: true }}
                data-cy="time-attendance-leave-request-detail-attachment-upload"
              />
            </Form.Item>
          </Form>

          {/* Footer */}
          <div
            className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-200"
            data-cy="time-attendance-leave-request-detail-footer-actions"
          >
            <Button
              danger
              onClick={handleCancelRequest}
              disabled={disableActions}
              data-cy="time-attendance-leave-request-detail-cancel-request-button"
            >
              Cancel Request
            </Button>
            <Button
              type="primary"
              loading={isUpdating}
              disabled={disableActions || approvalHasStarted}
              onClick={() => form.submit()}
              data-cy="time-attendance-leave-request-detail-edit-request-button"
            >
              Edit Request
            </Button>
          </div>
        </Skeleton>
      )}
    </Modal>
  );
};

export default LeaveRequestDetail;
