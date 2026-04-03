'use client';

import { useDeleteApprovalWorkFLow } from '@/store/server/features/approver/mutation';
import { useGetAllUsers } from '@/store/server/features/employees/employeeManagment/queries';
import { Button, Dropdown, Popconfirm, Skeleton, Tooltip } from 'antd';
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
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';

const toSlug = (value: string | number | null | undefined) =>
  String(value ?? 'na')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

/** First + last name when both exist; otherwise other name parts (no truncation). */
const getAssigneeFullName = (userInfo: any) => {
  if (!userInfo) return 'User not found';
  const firstLast = [userInfo.firstName, userInfo.lastName]
    .map((s: string) => String(s ?? '').trim())
    .filter(Boolean)
    .join(' ');
  if (firstLast) return firstLast;
  const fallback = [userInfo.firstName, userInfo.middleName, userInfo.lastName]
    .map((s: string) => String(s ?? '').trim())
    .filter(Boolean)
    .join(' ');
  return fallback || 'User not found';
};

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

  const onPageChange = (page: number, newPageSize?: number) => {
    setUserCurrentPage(page);
    if (newPageSize) {
      setPageSize(newPageSize);
    }
  };

  const onDesktopPageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setUserCurrentPage(1);
  };

  const onMobilePaginationChange = (page: number, size: number) => {
    setUserCurrentPage(page);
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
          className="text-sm font-normal text-[#595959]"
        >
          -
        </span>
      );
    }

    const seen = new Set<string>();
    const uniqueApprovers = approvers.filter((a: any) => {
      const userId = String(a?.userId ?? '');
      if (!userId) return false;
      if (seen.has(userId)) return false;
      seen.add(userId);
      return true;
    });

    return (
      <div
        id={`settings-payroll-approvals-card-assignees-list-${itemSlug}`}
        data-cy={`settings-payroll-approvals-card-assignees-list-${itemSlug}`}
        className="flex flex-wrap items-center gap-2"
      >
        {uniqueApprovers.map((employee: any, empIndex: number) => {
          const userInfo = getEmployeeInformation(employee?.userId);
          const fullName = getAssigneeFullName(userInfo);

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
                className="flex max-w-full min-w-0 items-center gap-1.5 rounded border border-[#D9D9D9] bg-white px-2 py-1"
              >
                {userInfo ? (
                  <UserAvatar userId={employee?.userId} />
                ) : (
                  <div
                    id={`settings-payroll-approvals-card-assignee-fallback-avatar-${itemSlug}-${empIndex}`}
                    data-cy={`settings-payroll-approvals-card-assignee-fallback-avatar-${itemSlug}-${empIndex}`}
                    className="relative w-6 h-6 rounded-full overflow-hidden bg-[#f0f0f0]"
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
                  className="min-w-0 whitespace-normal break-words text-xs font-normal leading-snug text-[#595959] sm:text-sm"
                >
                  {fullName}
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
      {editModal && (
        <EditWorkFLow data-cy="settings-payroll-approvals-edit-workflow" />
      )}
      {addModal && (
        <AddApprover data-cy="settings-payroll-approvals-add-approver" />
      )}
      <div
        id="settings-payroll-approvals-card-shell"
        data-cy="settings-payroll-approvals-card-shell"
      >
        <div
          id="settings-payroll-approvals-card-grid"
          data-cy="settings-payroll-approvals-card-grid"
          className="grid grid-cols-1 lg:grid-cols-2 gap-4"
        >
          {(allFilterData?.items ?? []).flatMap((item: any, index: number) => {
            const baseSlug = toSlug(item?.id ?? index);
            const approvers = Array.isArray(item?.approvers)
              ? item.approvers
              : [];
            const levelCount = new Set(
              approvers
                .map((a: any) => Number(a?.stepOrder ?? 0))
                .filter((n: number) => Number.isFinite(n) && n > 0),
            ).size;
            const itemSlug = baseSlug;
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
                key={`${item?.id ?? index}`}
                id={`settings-payroll-approvals-card-${itemSlug}`}
                data-cy={`settings-payroll-approvals-card-${itemSlug}`}
                className="flex flex-col gap-3 rounded-[8px] border border-[#D9D9D9] bg-white p-3 shadow-none"
              >
                <div
                  id={`settings-payroll-approvals-card-top-${itemSlug}`}
                  data-cy={`settings-payroll-approvals-card-top-${itemSlug}`}
                  className="flex items-start justify-between gap-2"
                >
                  <span
                    id={`settings-payroll-approvals-card-level-${itemSlug}`}
                    data-cy={`settings-payroll-approvals-card-level-${itemSlug}`}
                    className="inline-flex items-center rounded border border-[#D9D9D9] bg-white px-2 py-0.5 text-xs font-normal text-[#595959]"
                  >
                    Levels: {levelCount}
                  </span>

                  <div
                    className="shrink-0"
                    data-cy={`settings-payroll-approvals-card-more-slot-${itemSlug}`}
                  >
                    <AccessGuard
                      permissions={[
                        Permissions.UpdateApprover,
                        Permissions.DeleteApprover,
                        Permissions.CreateApprover,
                      ]}
                      id={`settings-payroll-approvals-card-more-guard-${itemSlug}`}
                      data-cy={`settings-payroll-approvals-card-more-guard-${itemSlug}`}
                    >
                      <Popconfirm
                        title={
                          <span className="text-base font-semibold text-gray-900">
                            Delete Approval
                          </span>
                        }
                        description="Are you sure you want to delete this approval workflow? This action cannot be undone."
                        open={deleteModal && deletedItem === item?.id}
                        onConfirm={() => handleDeleteConfirm(deletedItem)}
                        onCancel={() => setDeleteModal(false)}
                        okText="Delete"
                        cancelText="Cancel"
                        okButtonProps={{
                          danger: true,
                          className: 'px-5 h-9 text-sm font-medium',
                        }}
                        cancelButtonProps={{
                          className:
                            'px-5 h-9 text-sm font-medium border-gray-300',
                        }}
                        placement={isMobile ? 'bottom' : 'bottomLeft'}
                        icon={null}
                        overlayStyle={{
                          width: isMobile ? 'calc(100vw - 32px)' : 420,
                          maxWidth: 420,
                        }}
                        id={`settings-payroll-approvals-card-delete-popconfirm-${itemSlug}`}
                        data-cy={`settings-payroll-approvals-card-delete-popconfirm-${itemSlug}`}
                      >
                        <Dropdown
                          menu={{ items: menuItems }}
                          trigger={['click']}
                          placement="bottomRight"
                          data-cy={`settings-payroll-approvals-card-more-dropdown-${itemSlug}`}
                        >
                          <Button
                            type="default"
                            className="w-8 h-8 border border-[#D9D9D9]"
                            id={`settings-payroll-approvals-card-more-button-${itemSlug}`}
                            data-cy={`settings-payroll-approvals-card-more-button-${itemSlug}`}
                            aria-label="More actions"
                          >
                            <MoreHorizIcon
                              data-cy={`settings-payroll-approvals-card-more-icon-${itemSlug}`}
                            />
                          </Button>
                        </Dropdown>
                      </Popconfirm>
                    </AccessGuard>
                  </div>
                </div>

                <p
                  id={`settings-payroll-approvals-card-title-${itemSlug}`}
                  data-cy={`settings-payroll-approvals-card-title-${itemSlug}`}
                  className="mb-2 mt-3 text-base font-normal leading-tight text-black"
                >
                  {item?.name || '-'}
                </p>

                <div
                  id={`settings-payroll-approvals-card-divider-${itemSlug}`}
                  data-cy={`settings-payroll-approvals-card-divider-${itemSlug}`}
                  className="border-t border-gray-200 my-1"
                />

                <div
                  id={`settings-payroll-approvals-card-assigned-row-${itemSlug}`}
                  data-cy={`settings-payroll-approvals-card-assigned-row-${itemSlug}`}
                  className="flex flex-wrap items-center gap-2"
                >
                  <span
                    id={`settings-payroll-approvals-card-assigned-label-${itemSlug}`}
                    data-cy={`settings-payroll-approvals-card-assigned-label-${itemSlug}`}
                    className="mr-1 text-sm font-normal text-[#595959]"
                  >
                    Assigned To:
                  </span>
                  {renderAssignees(approvers, itemSlug)}
                </div>
              </div>
            );
          })}

          {!isEmployeeLoading && (allFilterData?.items ?? []).length === 0 && (
            <div
              id="settings-payroll-approvals-empty-state"
              data-cy="settings-payroll-approvals-empty-state"
              className="col-span-full py-10 text-center text-sm font-normal text-[#595959]"
            >
              No approval workflows found.
            </div>
          )}
        </div>

        <div
          id="settings-payroll-approvals-pagination-container"
          data-cy="settings-payroll-approvals-pagination-container"
          className="mt-4 flex flex-col items-center justify-between gap-4 pt-4 text-sm sm:flex-row"
        >
          {isMobile || isTablet ? (
            <CustomMobilePagination
              currentPage={userCurrentPage}
              totalResults={allFilterData?.meta?.totalItems ?? 0}
              pageSize={pageSize}
              onChange={onMobilePaginationChange}
              onShowSizeChange={onMobilePaginationChange}
              id="settings-payroll-approvals-mobile-pagination"
              data-cy="settings-payroll-approvals-mobile-pagination"
            />
          ) : (
            <CustomPagination
              current={userCurrentPage}
              total={allFilterData?.meta?.totalItems ?? 0}
              pageSize={pageSize}
              onChange={onPageChange}
              onShowSizeChange={onDesktopPageSizeChange}
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
