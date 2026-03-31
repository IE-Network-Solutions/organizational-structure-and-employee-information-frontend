'use client';

import DeleteModal from '@/components/common/deleteConfirmationModal';
import { useDeleteApprovalWorkFLow } from '@/store/server/features/approver/mutation';
import { useGetAllUsers } from '@/store/server/features/employees/employeeManagment/queries';
import { Dropdown, Skeleton, Tooltip } from 'antd';
import type { MenuProps } from 'antd';
import Image from 'next/image';
import { useState } from 'react';
import { FaPencil } from 'react-icons/fa6';
import Avatar from '@/public/gender_neutral_avatar.jpg';
import { FaPlus } from 'react-icons/fa';
import { RiDeleteBin6Line } from 'react-icons/ri';
import { APPROVALTYPES } from '@/types/enumTypes';
import { useApprovalBranchStore } from '@/store/uistate/features/employees/branchTransfer/workflow';
import EditWorkFLow from '../editWorkFLow';
import AddApprover from '../addApprover';
import { useApprovalFilter } from '@/store/server/features/approver/queries';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
import CustomPagination from '@/components/customPagination';
import { CustomMobilePagination } from '@/components/customPagination/mobilePagination';
import { useIsMobile } from '@/hooks/useIsMobile';
import { MoreOutlined } from '@ant-design/icons';

const toSlug = (value: string | number | null | undefined) =>
  String(value ?? 'na')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

const ApprovalTable = () => {
  const {
    userCurrentPage,
    pageSize,
    deleteModal,
    editModal,
    addModal,
    deletedItem,
    setLevel,
    setDeletedItem,
    setUserCurrentPage,
    setPageSize,
    setDeleteModal,
    setSelectedItem,
    setEditModal,
    setAddModal,
    setWorkflowApplies,
    setApproverType,
    searchParams,
  } = useApprovalBranchStore();
  const { data: employeeData, isLoading: isUserDataLoading } = useGetAllUsers();
  const { isMobile, isTablet } = useIsMobile();
  const MAX_NAME_LENGTH = 10;
  //const MAX_EMAIL_LENGTH = 5;
  const getEmployeeInformation = (id: string) => {
    const user = employeeData?.items?.find((item: any) => item.id === id);
    return user;
  };

  const { mutate: deleteApproval } = useDeleteApprovalWorkFLow();
  const { data: allFilterData, isLoading: isEmployeeLoading } =
    useApprovalFilter(
      pageSize,
      userCurrentPage,
      searchParams?.entityType ? searchParams.entityType : '',
      searchParams?.entityId ? searchParams.entityId : '',
      searchParams?.name || '',
      APPROVALTYPES.PAYROLL,
    );
  const onPageChange = (page: number, pageSize?: number) => {
    setUserCurrentPage(page);
    if (pageSize) {
      setPageSize(pageSize);
    }
  };

  const onPageSizeChange = (current: number, size: number) => {
    setUserCurrentPage(current);
    setPageSize(size);
  };
  const handleDeleteConfirm = (id: string) => {
    setDeleteModal(false);
    deleteApproval(id);
  };

  const UserInfoSkeleton = () => (
    <div
      className="flex items-center gap-2"
      id="settings-payroll-approvals-row-assignee-skeleton"
      data-cy="settings-payroll-approvals-row-assignee-skeleton"
    >
      <Skeleton.Avatar
        active
        size="small"
        shape="circle"
        data-cy="settings-payroll-approvals-row-assignee-skeleton-avatar"
      />
      <div
        className="flex flex-col gap-1"
        id="settings-payroll-approvals-row-assignee-skeleton-info"
        data-cy="settings-payroll-approvals-row-assignee-skeleton-info"
      >
        <Skeleton.Input
          active
          size="small"
          style={{ width: 80, height: 14 }}
          data-cy="settings-payroll-approvals-row-assignee-skeleton-name"
        />
        <Skeleton.Input
          active
          size="small"
          style={{ width: 60, height: 12 }}
          data-cy="settings-payroll-approvals-row-assignee-skeleton-email"
        />
      </div>
    </div>
  );

  const UserAvatar = ({ userId }: { userId: string }) => {
    const [imageError, setImageError] = useState(false);
    const userInfo = getEmployeeInformation(userId);

    const getImageSrc = () => {
      if (imageError || !userInfo?.profileImage) {
        return Avatar;
      }

      if (typeof userInfo.profileImage === 'string') {
        try {
          const parsed = JSON.parse(userInfo.profileImage);
          return parsed.url && parsed.url.startsWith('http')
            ? parsed.url
            : Avatar;
        } catch {
          return userInfo.profileImage.startsWith('http')
            ? userInfo.profileImage
            : Avatar;
        }
      }
      return Avatar;
    };

    return (
      <div
        className="relative w-6 h-6 rounded-full overflow-hidden bg-gray-200"
        id="settings-payroll-approvals-row-assignee-avatar"
        data-cy="settings-payroll-approvals-row-assignee-avatar"
      >
        <Image
          src={getImageSrc() || '/placeholder.svg'}
          alt="User avatar"
          layout="fill"
          className="object-cover"
          onError={() => setImageError(true)}
          id={`settings-payroll-approvals-row-assignee-avatar-image-${userId}`}
          data-cy={`settings-payroll-approvals-row-assignee-avatar-image-${userId}`}
        />
      </div>
    );
  };

  const handleOpenEdit = (item: any) => {
    setEditModal(true);
    setSelectedItem(item);
    setLevel(item?.approvers ? item?.approvers?.length : '-');
    setWorkflowApplies(item?.entityType ? item?.entityType : '-');
    setApproverType(
      item?.approvalWorkflowType ? item?.approvalWorkflowType : '-',
    );
  };

  const handleOpenAdd = (item: any) => {
    setAddModal(true);
    setSelectedItem(item);
    setLevel(1);
    setApproverType(
      item?.approvalWorkflowType ? item?.approvalWorkflowType : '-',
    );
  };

  const renderAssignees = (approvers: any[], itemSlug: string) => {
    if (isUserDataLoading) {
      return (
        <div
          id={`settings-payroll-approvals-card-assignees-loading-${itemSlug}`}
          data-cy={`settings-payroll-approvals-card-assignees-loading-${itemSlug}`}
          className="flex flex-col gap-2"
        >
          <UserInfoSkeleton />
          <UserInfoSkeleton />
        </div>
      );
    }

    if (approvers.length === 0) {
      return (
        <span
          id={`settings-payroll-approvals-card-assignees-empty-${itemSlug}`}
          data-cy={`settings-payroll-approvals-card-assignees-empty-${itemSlug}`}
          className="text-sm text-gray-400"
        >
          -
        </span>
      );
    }

    return (
      <div
        id={`settings-payroll-approvals-card-assignees-list-${itemSlug}`}
        data-cy={`settings-payroll-approvals-card-assignees-list-${itemSlug}`}
        className="flex flex-wrap items-center gap-2"
      >
        {approvers.map((employee: any, empIndex: number) => {
          const userInfo = getEmployeeInformation(employee?.userId);
          const fullName = userInfo
            ? `${userInfo.firstName ?? ''} ${userInfo.middleName ?? ''}`.trim()
            : 'User not found';

          const displayName =
            fullName.length > MAX_NAME_LENGTH
              ? fullName.slice(0, MAX_NAME_LENGTH) + '...'
              : fullName;

          return (
            <Tooltip
              key={`${employee?.userId ?? empIndex}-${empIndex}`}
              title={
                <div
                  id={`settings-payroll-approvals-card-assignee-tooltip-${itemSlug}-${empIndex}`}
                  data-cy={`settings-payroll-approvals-card-assignee-tooltip-${itemSlug}-${empIndex}`}
                >
                  {fullName}
                </div>
              }
            >
              <div
                id={`settings-payroll-approvals-card-assignee-chip-${itemSlug}-${empIndex}`}
                data-cy={`settings-payroll-approvals-card-assignee-chip-${itemSlug}-${empIndex}`}
                className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-md px-2 py-1 shadow-sm"
              >
                {userInfo ? (
                  <UserAvatar userId={employee?.userId} />
                ) : (
                  <div
                    id={`settings-payroll-approvals-card-assignee-fallback-avatar-${itemSlug}-${empIndex}`}
                    data-cy={`settings-payroll-approvals-card-assignee-fallback-avatar-${itemSlug}-${empIndex}`}
                    className="relative w-5 h-5 rounded-full overflow-hidden bg-gray-200 border border-gray-200"
                  >
                    <Image
                      src={Avatar || '/placeholder.svg'}
                      alt="Default avatar"
                      layout="fill"
                      className="object-cover"
                      id={`settings-payroll-approvals-card-assignee-fallback-avatar-image-${itemSlug}-${empIndex}`}
                      data-cy={`settings-payroll-approvals-card-assignee-fallback-avatar-image-${itemSlug}-${empIndex}`}
                    />
                  </div>
                )}
                <span
                  id={`settings-payroll-approvals-card-assignee-name-${itemSlug}-${empIndex}`}
                  data-cy={`settings-payroll-approvals-card-assignee-name-${itemSlug}-${empIndex}`}
                  className="text-sm text-gray-600 truncate"
                >
                  {displayName}
                </span>
              </div>
            </Tooltip>
          );
        })}
      </div>
    );
  };

  return (
    <div
      id="settings-payroll-approvals-table-container"
      data-cy="settings-payroll-approvals-table-container"
    >
      <DeleteModal
        open={deleteModal}
        onConfirm={() => handleDeleteConfirm(deletedItem)}
        onCancel={() => setDeleteModal(false)}
        data-cy="settings-payroll-approvals-delete-modal"
      />
      {editModal && (
        <EditWorkFLow data-cy="settings-payroll-approvals-edit-workflow" />
      )}
      {addModal && (
        <AddApprover data-cy="settings-payroll-approvals-add-approver" />
      )}
      <div
        id="settings-payroll-approvals-card-shell"
        data-cy="settings-payroll-approvals-card-shell"
        className="p-6"
      >
        <div
          id="settings-payroll-approvals-card-grid"
          data-cy="settings-payroll-approvals-card-grid"
          className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-8"
        >
          {(allFilterData?.items ?? []).flatMap((item: any, index: number) => {
            const baseSlug = toSlug(item?.id ?? index);
            const approvers = Array.isArray(item?.approvers)
              ? item.approvers
              : [];

            // Group assignees by stepOrder so we render one card per level
            const grouped = new Map<number, any[]>();
            for (const a of approvers) {
              const level = Number(a?.stepOrder ?? 0);
              const next = grouped.get(level) ?? [];
              next.push(a);
              grouped.set(level, next);
            }

            const levels = Array.from(grouped.keys())
              .filter((l) => l > 0)
              .sort((a, b) => a - b);
            const effectiveLevels = levels.length > 0 ? levels : [1];

            return effectiveLevels.map((level) => {
              const levelApprovers = grouped.get(level) ?? [];
              const itemSlug = `${baseSlug}-level-${level}`;

              const menuItems: MenuProps['items'] = [
                {
                  key: 'edit',
                  label: (
                    <span
                      id={`settings-payroll-approvals-card-menu-edit-text-${itemSlug}`}
                      data-cy={`settings-payroll-approvals-card-menu-edit-text-${itemSlug}`}
                    >
                      Edit Approver
                    </span>
                  ),
                  icon: (
                    <FaPencil
                      id={`settings-payroll-approvals-card-menu-edit-icon-${itemSlug}`}
                      data-cy={`settings-payroll-approvals-card-menu-edit-icon-${itemSlug}`}
                    />
                  ),
                  onClick: () => handleOpenEdit(item),
                },
                {
                  key: 'add',
                  label: (
                    <span
                      id={`settings-payroll-approvals-card-menu-add-text-${itemSlug}`}
                      data-cy={`settings-payroll-approvals-card-menu-add-text-${itemSlug}`}
                    >
                      Add Approver
                    </span>
                  ),
                  icon: (
                    <FaPlus
                      id={`settings-payroll-approvals-card-menu-add-icon-${itemSlug}`}
                      data-cy={`settings-payroll-approvals-card-menu-add-icon-${itemSlug}`}
                    />
                  ),
                  onClick: () => handleOpenAdd(item),
                },
                {
                  key: 'delete',
                  label: (
                    <span
                      id={`settings-payroll-approvals-card-menu-delete-text-${itemSlug}`}
                      data-cy={`settings-payroll-approvals-card-menu-delete-text-${itemSlug}`}
                    >
                      Delete
                    </span>
                  ),
                  icon: (
                    <RiDeleteBin6Line
                      id={`settings-payroll-approvals-card-menu-delete-icon-${itemSlug}`}
                      data-cy={`settings-payroll-approvals-card-menu-delete-icon-${itemSlug}`}
                    />
                  ),
                  onClick: () => {
                    setDeleteModal(true);
                    setDeletedItem(item?.id);
                  },
                },
              ];

              return (
                <div
                  key={`${item?.id ?? index}-${level}`}
                  id={`settings-payroll-approvals-card-${itemSlug}`}
                  data-cy={`settings-payroll-approvals-card-${itemSlug}`}
                  className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm flex flex-col gap-3"
                >
                  <div
                    id={`settings-payroll-approvals-card-top-${itemSlug}`}
                    data-cy={`settings-payroll-approvals-card-top-${itemSlug}`}
                    className="flex justify-between items-start"
                  >
                    <span
                      id={`settings-payroll-approvals-card-level-${itemSlug}`}
                      data-cy={`settings-payroll-approvals-card-level-${itemSlug}`}
                      className="text-xs font-medium text-gray-600 bg-gray-50 border border-gray-200 px-2 py-1 rounded-md"
                    >
                      Level: {level}
                    </span>

                    <AccessGuard
                      permissions={[
                        Permissions.UpdateApprover,
                        Permissions.DeleteApprover,
                        Permissions.CreateApprover,
                      ]}
                      id={`settings-payroll-approvals-card-more-guard-${itemSlug}`}
                      data-cy={`settings-payroll-approvals-card-more-guard-${itemSlug}`}
                    >
                      <Dropdown
                        menu={{ items: menuItems }}
                        trigger={['click']}
                        placement="bottomRight"
                        data-cy={`settings-payroll-approvals-card-more-dropdown-${itemSlug}`}
                      >
                        <button
                          id={`settings-payroll-approvals-card-more-button-${itemSlug}`}
                          data-cy={`settings-payroll-approvals-card-more-button-${itemSlug}`}
                          className="text-gray-400 border border-gray-200 rounded px-2 py-1 hover:bg-gray-50 transition-colors flex items-center justify-center"
                          type="button"
                          aria-label="More actions"
                        >
                          <MoreOutlined
                            id={`settings-payroll-approvals-card-more-icon-${itemSlug}`}
                            data-cy={`settings-payroll-approvals-card-more-icon-${itemSlug}`}
                            rotate={90}
                            style={{ fontSize: 18 }}
                          />
                        </button>
                      </Dropdown>
                    </AccessGuard>
                  </div>

                  <div
                    id={`settings-payroll-approvals-card-title-${itemSlug}`}
                    data-cy={`settings-payroll-approvals-card-title-${itemSlug}`}
                    className="font-semibold text-gray-800 text-[15px] mt-1"
                  >
                    {item?.name || '-'}
                  </div>

                  <div
                    id={`settings-payroll-approvals-card-divider-${itemSlug}`}
                    data-cy={`settings-payroll-approvals-card-divider-${itemSlug}`}
                    className="border-t border-gray-100 my-1"
                  />

                  <div
                    id={`settings-payroll-approvals-card-assigned-row-${itemSlug}`}
                    data-cy={`settings-payroll-approvals-card-assigned-row-${itemSlug}`}
                    className="flex flex-wrap items-center gap-2"
                  >
                    <span
                      id={`settings-payroll-approvals-card-assigned-label-${itemSlug}`}
                      data-cy={`settings-payroll-approvals-card-assigned-label-${itemSlug}`}
                      className="text-sm font-medium text-gray-800 mr-1"
                    >
                      Assigned To:
                    </span>
                    {renderAssignees(levelApprovers, itemSlug)}
                  </div>
                </div>
              );
            });
          })}

          {!isEmployeeLoading && (allFilterData?.items ?? []).length === 0 && (
            <div
              id="settings-payroll-approvals-empty-state"
              data-cy="settings-payroll-approvals-empty-state"
              className="col-span-full text-center text-gray-500 py-10"
            >
              No approval workflows found.
            </div>
          )}
        </div>

        <div
          id="settings-payroll-approvals-pagination-container"
          data-cy="settings-payroll-approvals-pagination-container"
          className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm"
        >
          {isMobile || isTablet ? (
            <CustomMobilePagination
              currentPage={userCurrentPage}
              totalResults={allFilterData?.meta?.totalItems ?? 0}
              pageSize={pageSize}
              onChange={onPageChange}
              onShowSizeChange={onPageSizeChange}
              id="settings-payroll-approvals-mobile-pagination"
              data-cy="settings-payroll-approvals-mobile-pagination"
            />
          ) : (
            <CustomPagination
              current={userCurrentPage}
              total={allFilterData?.meta?.totalItems ?? 0}
              pageSize={pageSize}
              onChange={onPageChange}
              onShowSizeChange={(newPageSize) => onPageChange(1, newPageSize)}
              id="settings-payroll-approvals-desktop-pagination"
              data-cy="settings-payroll-approvals-desktop-pagination"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ApprovalTable;
