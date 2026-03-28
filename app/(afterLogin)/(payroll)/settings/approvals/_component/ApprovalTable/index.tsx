'use client';

import DeleteModal from '@/components/common/deleteConfirmationModal';
import { useDeleteApprovalWorkFLow } from '@/store/server/features/approver/mutation';
import { useGetAllUsers } from '@/store/server/features/employees/employeeManagment/queries';
import { Button, Tooltip, Skeleton } from 'antd';
import Image from 'next/image';
import { useState } from 'react';
import { FaPencil } from 'react-icons/fa6';
import { GENDER_NEUTRAL_AVATAR_URL } from '@/constants/publicImageUrls';
import { FaPlus } from 'react-icons/fa';
import { RiDeleteBin6Line } from 'react-icons/ri';
import { APPROVALTYPES } from '@/types/enumTypes';
import { useApprovalBranchStore } from '@/store/uistate/features/employees/branchTransfer/workflow';
import EditWorkFLow from '../editWorkFLow';
import AddApprover from '../addApprover';
import PayrollApprovalTable from '../payrollApprovalTable';
import { useApprovalFilter } from '@/store/server/features/approver/queries';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';

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
  const MAX_NAME_LENGTH = 10;
  const MAX_EMAIL_LENGTH = 5;
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
        return GENDER_NEUTRAL_AVATAR_URL;
      }

      if (typeof userInfo.profileImage === 'string') {
        try {
          const parsed = JSON.parse(userInfo.profileImage);
          return parsed.url && parsed.url.startsWith('http')
            ? parsed.url
            : GENDER_NEUTRAL_AVATAR_URL;
        } catch {
          return userInfo.profileImage.startsWith('http')
            ? userInfo.profileImage
            : GENDER_NEUTRAL_AVATAR_URL;
        }
      }
      return GENDER_NEUTRAL_AVATAR_URL;
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

  const data = allFilterData?.items?.map((item: any, index: number) => {
    const rowSlug = toSlug(item?.id ?? index);
    return {
      key: index,
      workflow_name: item?.name ? item?.name : '-',

      assigned: (
        <div
          className="flex flex-col gap-2 max-h-20 overflow-y-auto"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            overflow: 'hidden',
            overflowY: 'scroll',
          }}
          id={`settings-payroll-approvals-row-assignee-${rowSlug}`}
          data-cy={`settings-payroll-approvals-row-assignee-${rowSlug}`}
        >
          {isUserDataLoading ? (
            // Show skeleton loaders while user data is loading
            <>
              <UserInfoSkeleton data-cy="settings-payroll-approvals-row-assignee-skeleton" />
              <UserInfoSkeleton data-cy="settings-payroll-approvals-row-assignee-skeleton" />
            </>
          ) : (
            item?.approvers?.map((employee: any, empIndex: number) => {
              const userInfo = getEmployeeInformation(employee?.userId);

              if (!userInfo) {
                return (
                  <div
                    key={empIndex}
                    className="flex items-center gap-2"
                    id={`settings-payroll-approvals-row-assignee-${rowSlug}-${empIndex}`}
                    data-cy={`settings-payroll-approvals-row-assignee-${rowSlug}-${empIndex}`}
                  >
                    <div
                      className="relative w-6 h-6 rounded-full overflow-hidden bg-gray-200"
                      id={`settings-payroll-approvals-row-assignee-avatar-${rowSlug}-${empIndex}`}
                      data-cy={`settings-payroll-approvals-row-assignee-avatar-${rowSlug}-${empIndex}`}
                    >
                      <Image
                        src={GENDER_NEUTRAL_AVATAR_URL || '/placeholder.svg'}
                        alt="Default avatar"
                        layout="fill"
                        className="object-cover"
                        id={`settings-payroll-approvals-row-assignee-avatar-image-${rowSlug}-${empIndex}`}
                        data-cy={`settings-payroll-approvals-row-assignee-avatar-image-${rowSlug}-${empIndex}`}
                      />
                    </div>
                    <div
                      className="flex flex-col justify-center"
                      id={`settings-payroll-approvals-row-assignee-info-${rowSlug}-${empIndex}`}
                      data-cy={`settings-payroll-approvals-row-assignee-info-${rowSlug}-${empIndex}`}
                    >
                      <p
                        className="text-gray-400"
                        id={`settings-payroll-approvals-row-assignee-name-${rowSlug}-${empIndex}`}
                        data-cy={`settings-payroll-approvals-row-assignee-name-${rowSlug}-${empIndex}`}
                      >
                        User not found
                      </p>
                      <p
                        className="font-extralight text-[12px] text-gray-400"
                        id={`settings-payroll-approvals-row-assignee-email-${rowSlug}-${empIndex}`}
                        data-cy={`settings-payroll-approvals-row-assignee-email-${rowSlug}-${empIndex}`}
                      >
                        -
                      </p>
                    </div>
                  </div>
                );
              }

              const fullName = userInfo.firstName + '  ' + userInfo.middleName;
              const shortEmail = userInfo.email;
              const displayName =
                fullName?.length > MAX_NAME_LENGTH
                  ? fullName.slice(0, MAX_NAME_LENGTH) + '...'
                  : fullName;
              const displayEmail =
                shortEmail?.length > MAX_EMAIL_LENGTH
                  ? shortEmail.slice(0, MAX_EMAIL_LENGTH) + '...'
                  : shortEmail;

              return (
                <Tooltip
                  key={empIndex}
                  title={
                    <div data-cy="approvals-component-approvaltable-index-tsx-index-div-242">
                      {fullName}
                      <br data-cy="approvals-component-approvaltable-index-tsx-index-br-244" />
                      {userInfo.email}
                    </div>
                  }
                  id={`settings-payroll-approvals-row-assignee-tooltip-${rowSlug}-${empIndex}`}
                  data-cy={`settings-payroll-approvals-row-assignee-tooltip-${rowSlug}-${empIndex}`}
                >
                  <div
                    className="flex items-center flex-wrap sm:flex-row gap-2"
                    id={`settings-payroll-approvals-row-assignee-${rowSlug}-${empIndex}`}
                    data-cy={`settings-payroll-approvals-row-assignee-${rowSlug}-${empIndex}`}
                  >
                    <UserAvatar
                      userId={employee?.userId}
                      data-cy={`settings-payroll-approvals-row-assignee-avatar-${rowSlug}-${empIndex}`}
                    />
                    <div
                      className="flex flex-wrap flex-col justify-center"
                      id={`settings-payroll-approvals-row-assignee-info-${rowSlug}-${empIndex}`}
                      data-cy={`settings-payroll-approvals-row-assignee-info-${rowSlug}-${empIndex}`}
                    >
                      <p
                        id={`settings-payroll-approvals-row-assignee-name-${rowSlug}-${empIndex}`}
                        data-cy={`settings-payroll-approvals-row-assignee-name-${rowSlug}-${empIndex}`}
                      >
                        {displayName || '-'}
                      </p>
                      <p
                        className="font-extralight text-[12px]"
                        id={`settings-payroll-approvals-row-assignee-email-${rowSlug}-${empIndex}`}
                        data-cy={`settings-payroll-approvals-row-assignee-email-${rowSlug}-${empIndex}`}
                      >
                        {displayEmail || '-'}
                      </p>
                    </div>
                  </div>
                </Tooltip>
              );
            })
          )}
        </div>
      ),
      level: item?.approvers ? item?.approvers?.length : '-',
      action: (
        <div
          className="flex gap-1 text-white"
          id={`settings-payroll-approvals-row-actions-${rowSlug}`}
          data-cy={`settings-payroll-approvals-row-actions-${rowSlug}`}
        >
          <AccessGuard
            permissions={[Permissions.UpdateApprover]}
            id={`settings-payroll-approvals-row-edit-guard-${rowSlug}`}
            data-cy={`settings-payroll-approvals-row-edit-guard-${rowSlug}`}
          >
            <Tooltip
              title={'Edit Approver'}
              id={`settings-payroll-approvals-row-edit-btn-${rowSlug}`}
              data-cy={`settings-payroll-approvals-row-edit-btn-${rowSlug}`}
            >
              <Button
                id={`editUserButton${item?.id}`}
                className="bg-[#2f78ee] text-white border-none w-7 h-7"
                onClick={() => {
                  setEditModal(true);
                  setSelectedItem(item);
                  setLevel(item?.approvers ? item?.approvers?.length : '-');
                  setWorkflowApplies(item?.entityType ? item?.entityType : '-');
                  setApproverType(
                    item?.approvalWorkflowType
                      ? item?.approvalWorkflowType
                      : '-',
                  );
                }}
                data-cy={`settings-payroll-approvals-row-edit-btn-${rowSlug}`}
                icon={
                  <FaPencil
                    id={`settings-payroll-approvals-row-edit-icon-${rowSlug}`}
                    data-cy={`settings-payroll-approvals-row-edit-icon-${rowSlug}`}
                  />
                }
              />
            </Tooltip>
          </AccessGuard>
          <AccessGuard
            permissions={[Permissions.DeleteApprover]}
            id={`settings-payroll-approvals-row-delete-guard-${rowSlug}`}
            data-cy={`settings-payroll-approvals-row-delete-guard-${rowSlug}`}
          >
            <Tooltip
              title={'Delete Employee'}
              id={`settings-payroll-approvals-row-delete-btn-${rowSlug}`}
              data-cy={`settings-approvals-row-delete-btn-${rowSlug}`}
            >
              <Button
                id={`deleteUserButton${item?.id}`}
                className="bg-red-600 w-7 h-7 text-white border-none"
                onClick={() => {
                  setDeleteModal(true);
                  setDeletedItem(item?.id);
                }}
                data-cy={`settings-payroll-approvals-row-delete-btn-${rowSlug}`}
                icon={
                  <RiDeleteBin6Line
                    id={`settings-payroll-approvals-row-delete-icon-${rowSlug}`}
                    data-cy={`settings-payroll-approvals-row-delete-icon-${rowSlug}`}
                  />
                }
              />
            </Tooltip>
          </AccessGuard>
          <AccessGuard
            permissions={[Permissions.CreateApprover]}
            id={`settings-payroll-approvals-row-add-guard-${rowSlug}`}
            data-cy={`settings-payroll-approvals-row-add-guard-${rowSlug}`}
          >
            <Tooltip
              title={'Add Approver'}
              id={`settings-payroll-approvals-row-tooltip=${rowSlug}`}
              data-cy={`settings-payroll-approvals-tooltip=${rowSlug}`}
            >
              <Button
                id={`editUserButton${item?.id}`}
                className="bg-[#2f78ee] w-7 h-7 text-white border-none"
                onClick={() => {
                  setAddModal(true);
                  setSelectedItem(item);
                  setLevel(1);
                  setApproverType(
                    item?.approvalWorkflowType
                      ? item?.approvalWorkflowType
                      : '-',
                  );
                }}
                data-cy={`settings-payroll-approvals-row-add-btn-${rowSlug}`}
                icon={
                  <FaPlus
                    id={`settings-payroll-approvals-row-add-icon-${rowSlug}`}
                    data-cy={`settings-payroll-approvals-row-add-icon-${rowSlug}`}
                  />
                }
              />
            </Tooltip>
          </AccessGuard>
        </div>
      ),
    };
  });

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
      <PayrollApprovalTable
        data={data}
        isEmployeeLoading={isEmployeeLoading}
        allFilterData={allFilterData}
        onPageChange={onPageChange}
        pageSize={pageSize}
        data-cy="settings-payroll-approvals-table-component"
      />
    </div>
  );
};

export default ApprovalTable;
