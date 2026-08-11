'use client';
import Image from 'next/image';
import { RiDeleteBin6Line } from 'react-icons/ri';
import { Avatar, Button, Dropdown, Tooltip } from 'antd';
import { FaPencil } from 'react-icons/fa6';
import { FaPlus } from 'react-icons/fa';
import { UserOutlined } from '@ant-design/icons';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import { useApprovalFilter } from '@/store/server/features/approver/queries';
import { useDeleteApprovalWorkFLow } from '@/store/server/features/approver/mutation';
import { useApprovalTNAStore } from '@/store/uistate/features/tna/settings/approval';
import { useApprovalStore } from '@/store/uistate/features/approval';
import { useGetAllUsers } from '@/store/server/features/employees/employeeManagment/queries';
import { useGetDepartments } from '@/store/server/features/employees/employeeManagment/department/queries';
import DeleteModal from '@/components/common/deleteConfirmationModal';
import ApproverListTable from '@/components/Approval/ApprovalListTable';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
import { APPROVALTYPES } from '@/types/enumTypes';
import {
  findDepartmentById,
  isDepartmentEntityType,
  isUserEntityType,
} from '@/utils/approval/departmentHelpers';
import EmptyState from '@/components/empty';
import EditWorkFLow from '../editWorkFlow';
import AddApprover from '../addApprover';
import TnaApprovalsPageSkeleton from '../tnaApprovalsPageSkeleton';

const MAX_NAME_LENGTH = 40;

const ApprovalListTable = () => {
  const { data: employeeData, isLoading: isEmployeeDataLoading } =
    useGetAllUsers();
  const { data: department, isLoading: isDepartmentLoading } =
    useGetDepartments();
  const {
    userCurrentPage,
    pageSize,
    searchParams,
    deleteModal,
    deletedItem,
    editModal,
    addModal,
    setDeleteModal,
    setUserCurrentPage,
    setPageSize,
    setLevel,
    setAddModal,
    setSelectedItem,
    setEditModal,
    setWorkflowApplies,
    setDeletedItem,
    setApproverType,
  } = useApprovalTNAStore();
  const { setOpenModal } = useApprovalStore();

  const { data: allFilterData, isLoading: isApprovalListLoading } =
    useApprovalFilter(
      pageSize,
      userCurrentPage,
      searchParams?.entityType ? searchParams.entityType : '',
      searchParams?.entityId ? searchParams.entityId : '',
      searchParams?.name || '',
      APPROVALTYPES.TNA,
    );

  const { mutate: deleteApproval, isLoading: deleteLoading } =
    useDeleteApprovalWorkFLow();

  const isDataLoading =
    isApprovalListLoading || isEmployeeDataLoading || isDepartmentLoading;

  const getEmployeeInformation = (id: string) => {
    if (!employeeData?.items || isEmployeeDataLoading) return null;
    return employeeData.items.find((item: any) => item.id === id);
  };
  const getDepartmentInformation = (id: string) => {
    if (!department || isDepartmentLoading) return null;
    return findDepartmentById(department, id);
  };

  const hasActiveFilters = Boolean(
    searchParams.name?.trim() ||
    searchParams.entityType ||
    searchParams.entityId,
  );
  const canCreateApprovalWorkflow = AccessGuard.checkAccess({
    permissions: [Permissions.CreateApprovalWorkFlow],
  });
  const goToWorkflowSetup = () => {
    setApproverType('');
    setOpenModal(true);
  };

  const onPageChange = (page: number, pageSize?: number) => {
    setUserCurrentPage(page);
    if (pageSize) {
      setPageSize(pageSize);
    }
  };
  const handleDeleteConfirm = (id: string) => {
    deleteApproval(id, { onSuccess: () => setDeleteModal(false) });
  };

  /**
   * One card per entity, every workflow that targets it nested inside — the
   * same grouping timesheet uses, so a department with several workflows reads
   * as one row rather than several near-identical cards.
   */
  const groupedWorkflowItems =
    !isDataLoading && allFilterData?.items
      ? Object.values(
          allFilterData.items.reduce((acc: Record<string, any>, item: any) => {
            const key = `${item?.entityType || ''}::${item?.entityId || ''}`;
            const existingGroup = acc[key];
            if (!existingGroup) {
              acc[key] = { ...item, workflows: [item] };
              return acc;
            }
            const existingUpdatedAt = new Date(
              existingGroup?.updatedAt || existingGroup?.createdAt || 0,
            ).getTime();
            const currentUpdatedAt = new Date(
              item?.updatedAt || item?.createdAt || 0,
            ).getTime();
            existingGroup.workflows = [
              ...(existingGroup.workflows || []),
              item,
            ];
            // Keep base group fields from the most recently updated workflow.
            if (currentUpdatedAt >= existingUpdatedAt) {
              acc[key] = {
                ...existingGroup,
                ...item,
                workflows: existingGroup.workflows,
              };
            }

            return acc;
          }, {}),
        )
      : [];

  const data =
    !isDataLoading && groupedWorkflowItems
      ? groupedWorkflowItems.map((item: any, index: number) => {
          const employeeInfo = getEmployeeInformation(item?.entityId);
          const departmentInfo = getDepartmentInformation(item?.entityId);

          let appliedToValue = '-';
          if (item?.entityId) {
            if (isDepartmentEntityType(item?.entityType)) {
              appliedToValue = departmentInfo?.name || '-';
            } else if (isUserEntityType(item?.entityType)) {
              const firstName = employeeInfo?.firstName || '';
              const middleName = employeeInfo?.middleName || '';
              appliedToValue =
                firstName && middleName
                  ? `${firstName} ${middleName}`
                  : firstName || middleName || '-';
            } else {
              appliedToValue = item?.entityId;
            }
          }

          const workflowsForCard =
            Array.isArray(item?.workflows) && item.workflows.length > 0
              ? item.workflows
              : [item];

          const renderApproverPills = (
            workflowItem: any,
            workflowIdx: number,
          ) => {
            const sortedApprovers = [...(workflowItem?.approvers ?? [])].sort(
              (a, b) => a.stepOrder - b.stepOrder,
            );
            // Parallel approvers have no order, so they get dots, not arrows.
            const showTimelineConnector =
              workflowItem?.approvalWorkflowType !== 'Parallel';

            return (
              <div
                data-cy={`tna-settings-approvals-table-row-${index}-approval-type-${workflowIdx}-approvers`}
                className="w-full overflow-x-auto"
              >
                <div
                  className="flex min-w-max items-center gap-1.5 py-1"
                  data-cy={`tna-settings-approvals-table-row-${index}-approval-type-${workflowIdx}-approvers-row`}
                >
<<<<<<< HEAD
                  {sortedApprovers?.map((employee: any, empIndex: number) => {
                    const approverInfo = getEmployeeInformation(
                      employee?.userId,
                    );
                    const firstName = approverInfo?.firstName || '';
                    const middleName = approverInfo?.middleName || '';

                    const fullName =
                      firstName && middleName
                        ? `${firstName} ${middleName}`
                        : firstName || middleName || 'Unknown User';

                    const displayName =
                      fullName?.length > MAX_NAME_LENGTH
                        ? fullName.slice(0, MAX_NAME_LENGTH) + '...'
                        : fullName;

                    return (
                      <div
                        key={empIndex}
                        className="flex items-center"
                        data-cy={`tna-settings-approvals-table-row-${index}-assigned-${workflowIdx}-${empIndex}-flow-item`}
                      >
                        {empIndex > 0 && (
                          <>
                            {showTimelineConnector ? (
                              <div
                                className="mx-0.5 inline-flex h-5 min-w-6 items-center justify-center rounded-full border border-[#E3E7FF] bg-[#F7F8FF] px-1 text-[11px] font-semibold text-[#5B67D9]"
                                data-cy={`tna-settings-approvals-table-row-${index}-assigned-${workflowIdx}-${empIndex}-connector-arrow`}
                              >
                                →
                              </div>
                            ) : (
                              <div
                                className="mx-0.5 inline-flex h-2 w-2 rounded-full bg-[#D9DEF8]"
                                data-cy={`tna-settings-approvals-table-row-${index}-assigned-${workflowIdx}-${empIndex}-connector-dot`}
                              />
                            )}
                          </>
                        )}
                        <Tooltip
                          title={displayName}
                          placement="top"
                          data-cy={`tna-settings-approvals-table-row-${index}-assigned-${workflowIdx}-${empIndex}-tooltip`}
                        >
                          <div
                            className="relative h-9 w-9 rounded-full overflow-hidden ring-2 ring-[#EEF0FF] hover:ring-[#C9D0FF] transition-colors cursor-pointer shadow-[0_1px_2px_rgba(16,24,40,0.08)]"
                            id={`tna-settings-approvals-table-row-${index}-assigned-${workflowIdx}-${empIndex}-avatar-container`}
                            data-cy={`tna-settings-approvals-table-row-${index}-assigned-${workflowIdx}-${empIndex}-avatar-container`}
                          >
                            {(() => {
                              const raw = approverInfo?.profileImage;
                              let avatarSrc: string | null = null;

                              if (typeof raw === 'string' && raw.trim()) {
                                try {
                                  const parsed = JSON.parse(raw);
                                  if (
                                    parsed?.url &&
                                    typeof parsed.url === 'string' &&
                                    parsed.url.startsWith('http')
                                  ) {
                                    avatarSrc = parsed.url;
                                  }
                                } catch {
                                  if (raw.startsWith('http')) avatarSrc = raw;
                                }
=======
                  <div
                    className="relative w-6 h-6 rounded-full overflow-hidden"
                    id={`tnaApprovalListTableAssignedImageContainer${item?.id}_${empIndex}Id`}
                    data-cy={`tna-approval-list-table-assigned-image-container-${item?.id}-${empIndex}`}
                  >
                    <Image
                      unoptimized
                      src={
                        getEmployeeInformation(employee?.userId)
                          ?.profileImage &&
                        typeof getEmployeeInformation(employee?.userId)
                          ?.profileImage === 'string'
                          ? (() => {
                              try {
                                const parsed = JSON.parse(
                                  getEmployeeInformation(employee?.userId)
                                    ?.profileImage,
                                );
                                return parsed.url &&
                                  parsed.url.startsWith('http')
                                  ? parsed.url
                                  : GENDER_NEUTRAL_AVATAR_URL;
                              } catch {
                                return getEmployeeInformation(
                                  employee?.userId,
                                )?.profileImage.startsWith('http')
                                  ? getEmployeeInformation(employee?.userId)
                                      ?.profileImage
                                  : GENDER_NEUTRAL_AVATAR_URL;
>>>>>>> f563c9fb3ad6783a745f2097bffbd9f8f246d7ab
                              }

                              return avatarSrc ? (
                                <Image
                                  src={avatarSrc}
                                  alt={displayName || 'User profile'}
                                  fill
                                  className="object-cover"
                                  data-cy={`tna-settings-approvals-table-row-${index}-assigned-${workflowIdx}-${empIndex}-avatar`}
                                />
                              ) : (
                                <div
                                  data-cy={`tna-settings-approvals-table-row-${index}-assigned-${workflowIdx}-${empIndex}-avatar-default-container`}
                                  className="h-full w-full flex items-center justify-center bg-[#f0f0f0]"
                                >
                                  <Avatar size={30} icon={<UserOutlined />} />
                                </div>
                              );
                            })()}
                          </div>
                        </Tooltip>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          };

          const renderWorkflowAction = (
            workflowItem: any,
            workflowIdx: number,
          ) => {
            const canAdd = AccessGuard.checkAccess({
              permissions: [Permissions.CreateApprover],
            });
            const canEdit = AccessGuard.checkAccess({
              permissions: [Permissions.UpdateApprover],
            });
            const canDelete = AccessGuard.checkAccess({
              permissions: [Permissions.DeleteApprover],
            });

            const menuItems = [
              canAdd
                ? {
                    key: 'add',
                    label: (
                      <span
                        data-cy={`tna-settings-approvals-table-row-${index}-workflow-${workflowIdx}-add-approver-label`}
                      >
                        Add Approver
                      </span>
                    ),
                    icon: (
                      <FaPlus
                        data-cy={`tna-settings-approvals-table-row-${index}-workflow-${workflowIdx}-add-approver-icon`}
                      />
                    ),
                  }
                : null,
              canEdit
                ? {
                    key: 'edit',
                    label: (
                      <span
                        data-cy={`tna-settings-approvals-table-row-${index}-workflow-${workflowIdx}-edit-approver-label`}
                      >
                        Edit Approver
                      </span>
                    ),
                    icon: (
                      <FaPencil
                        data-cy={`tna-settings-approvals-table-row-${index}-workflow-${workflowIdx}-edit-approver-icon`}
                      />
                    ),
                  }
                : null,
              canDelete
                ? {
                    key: 'delete',
                    label: (
                      <span
                        data-cy={`tna-settings-approvals-table-row-${index}-workflow-${workflowIdx}-delete-approver-label`}
                      >
                        Delete Workflow
                      </span>
                    ),
                    icon: (
                      <RiDeleteBin6Line
                        data-cy={`tna-settings-approvals-table-row-${index}-workflow-${workflowIdx}-delete-approver-icon`}
                      />
                    ),
                  }
                : null,
            ].filter(Boolean);

            if (!menuItems.length) {
              return (
                <span
                  data-cy={`tna-settings-approvals-table-row-${index}-workflow-${workflowIdx}-no-actions`}
                />
              );
            }

            return (
              <Dropdown
                trigger={['click']}
                placement="bottomRight"
                menu={{
                  items: menuItems as any,
                  onClick: ({ key }) => {
                    if (key === 'add') {
                      setAddModal(true);
                      setSelectedItem(workflowItem);
                      setLevel(1);
                      setApproverType(
                        workflowItem?.approvalWorkflowType
                          ? workflowItem?.approvalWorkflowType
                          : '-',
                      );
                    }

                    if (key === 'edit') {
                      setEditModal(true);
                      setSelectedItem(workflowItem);
                      setLevel(
                        workflowItem?.approvers
                          ? workflowItem?.approvers?.length
                          : '-',
                      );
                      setWorkflowApplies(
                        workflowItem?.entityType
                          ? workflowItem?.entityType
                          : '-',
                      );
                      setApproverType(
                        workflowItem?.approvalWorkflowType
                          ? workflowItem?.approvalWorkflowType
                          : '-',
                      );
                    }

                    if (key === 'delete') {
                      setDeleteModal(true);
                      setDeletedItem(workflowItem?.id);
                    }
                  },
                }}
                data-cy={`tna-settings-approvals-table-row-${index}-workflow-${workflowIdx}-actions-dropdown`}
              >
                <Button
                  type="default"
                  className="h-8 w-8 border-0 bg-[#FAFAFA] shadow-none hover:!bg-[#F2F2F2]"
                  data-cy={`tna-settings-approvals-table-row-${index}-workflow-${workflowIdx}-actions-trigger`}
                >
                  <MoreHorizIcon />
                </Button>
              </Dropdown>
            );
          };

          return {
            key: index,
            workflow_name: '',
            applied_to: appliedToValue,

            assigned: (
              <div
                className="flex flex-col gap-3"
                id={`tna-settings-approvals-table-row-${index}-assigned-container`}
                data-cy={`tna-settings-approvals-table-row-${index}-assigned-container`}
              >
                {workflowsForCard.map(
                  (workflowItem: any, workflowIdx: number) => (
                    <div
                      key={workflowItem?.id || workflowIdx}
                      data-cy={`tna-settings-approvals-table-row-${index}-approval-type-${workflowIdx}-section`}
                      className="w-full rounded-lg p-3 bg-[#FAFAFA] flex flex-col gap-2"
                    >
                      <div
                        className="flex items-start justify-between gap-2"
                        data-cy={`tna-settings-approvals-table-row-${index}-approval-type-${workflowIdx}-section-header`}
                      >
                        <div
                          className="flex flex-col"
                          data-cy={`tna-settings-approvals-table-row-${index}-approval-type-${workflowIdx}-titles`}
                        >
                          <span
                            data-cy={`tna-settings-approvals-table-row-${index}-approval-type-${workflowIdx}-label`}
                            className="text-xs text-gray-500"
                          >
                            {workflowItem?.approvalType || '-'}
                          </span>
                          <span
                            data-cy={`tna-settings-approvals-table-row-${index}-approval-type-${workflowIdx}-workflow-name`}
                            className="text-xs font-medium text-[#2f2f2f]"
                          >
                            {workflowItem?.name || '-'}
                          </span>
                        </div>
                        <div
                          className="flex justify-end"
                          data-cy={`tna-settings-approvals-table-row-${index}-approval-type-${workflowIdx}-actions`}
                        >
                          {renderWorkflowAction(workflowItem, workflowIdx)}
                        </div>
                      </div>
                      {renderApproverPills(workflowItem, workflowIdx)}
                    </div>
                  ),
                )}
              </div>
            ),
            level:
              workflowsForCard.length > 0
                ? Math.max(
                    ...workflowsForCard.map((workflowItem: any) =>
                      workflowItem?.approvers
                        ? workflowItem?.approvalWorkflowType == 'Parallel'
                          ? (workflowItem?.approvers ?? []).length > 0
                            ? Math.max(
                                ...(workflowItem?.approvers ?? []).map(
                                  (approverItem: any) => approverItem.stepOrder,
                                ),
                              )
                            : 0
                          : workflowItem?.approvers?.length
                        : 0,
                    ),
                  )
                : 0,
            action: (
              <span
                data-cy={`tna-settings-approvals-table-row-${index}-no-header-action`}
              />
            ),
          };
        })
      : [];

  return (
    <div
      className="mt-2"
      id="tnaApprovalListTableContainerId"
      data-cy="tna-approval-list-table-container"
    >
      <DeleteModal
        loading={deleteLoading}
        open={deleteModal}
        onConfirm={() => handleDeleteConfirm(deletedItem)}
        onCancel={() => setDeleteModal(false)}
        data-cy="tna-approval-list-table-delete-modal"
      />
      {editModal && (
        <EditWorkFLow data-cy="tna-approval-list-table-edit-modal" />
      )}
      {addModal && <AddApprover data-cy="tna-approval-list-table-add-modal" />}

      {isDataLoading ? (
        <TnaApprovalsPageSkeleton />
      ) : data.length === 0 ? (
        <div
          className="w-full min-h-[240px] flex items-center justify-center mt-2"
          id="tnaApprovalsPageEmptyId"
          data-cy="tna-approvals-page-empty"
        >
          <EmptyState
            title={
              hasActiveFilters
                ? 'No approvals match your filters'
                : 'No approval workflows yet'
            }
            description={
              hasActiveFilters
                ? 'Try adjusting your search or filters.'
                : 'Set up an approval workflow to manage training approvals.'
            }
            actionText={canCreateApprovalWorkflow ? 'Set Approval' : undefined}
            onAction={canCreateApprovalWorkflow ? goToWorkflowSetup : undefined}
          />
        </div>
      ) : (
        <ApproverListTable
          data={data}
          isEmployeeLoading={isDataLoading}
          allFilterData={allFilterData}
          onPageChange={onPageChange}
          pageSize={pageSize}
          data-cy="tna-approval-list-table-component"
        />
      )}
    </div>
  );
};

export default ApprovalListTable;
