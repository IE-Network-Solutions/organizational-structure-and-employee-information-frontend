'use client';

import DeleteModal from '@/components/common/deleteConfirmationModal';
import { useDeleteApprovalWorkFLow } from '@/store/server/features/approver/mutation';
import { useGetDepartments } from '@/store/server/features/employees/employeeManagment/department/queries';
import { useGetAllUsers } from '@/store/server/features/employees/employeeManagment/queries';
import { Button, Tooltip, Skeleton } from 'antd';
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
import ApproverListTable from '@/components/Approval/ApprovalListTable';
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
  const { data: department } = useGetDepartments();
  const MAX_NAME_LENGTH = 10;
  const MAX_EMAIL_LENGTH = 5;
  const getEmployeeInformation = (id: string) => {
    const user = employeeData?.items?.find((item: any) => item.id === id);
    return user;
  };
  const getDepartmentInformation = (id: string) => {
    const departments = department?.find((item: any) => item.id === id);
    return departments;
  };
  const { mutate: deleteApproval } = useDeleteApprovalWorkFLow();
  const { data: allFilterData, isLoading: isEmployeeLoading } =
    useApprovalFilter(
      pageSize,
      userCurrentPage,
      searchParams?.entityType ? searchParams.entityType : '',
      searchParams?.entityId ? searchParams.entityId : '',
      searchParams?.name || '',
      APPROVALTYPES.BRANCHREQUEST,
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
    <div className="flex items-center gap-2">
      <Skeleton.Avatar active size="small" shape="circle" />
      <div className="flex flex-col gap-1">
        <Skeleton.Input active size="small" style={{ width: 80, height: 14 }} />
        <Skeleton.Input active size="small" style={{ width: 60, height: 12 }} />
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
      <div className="relative w-6 h-6 rounded-full overflow-hidden bg-gray-200">
        <Image
          src={getImageSrc() || '/placeholder.svg'}
          alt="User avatar"
          layout="fill"
          className="object-cover"
          onError={() => setImageError(true)}
        />
      </div>
    );
  };

  const data = allFilterData?.items?.map((item: any, index: number) => {
    const rowSlug = toSlug(item?.id ?? index);
    return {
      key: index,
      workflow_name: item?.name ? item?.name : '-',
      applied_to: item?.entityId
        ? item?.entityType === 'Department'
          ? getDepartmentInformation(item?.entityId)?.name
          : item?.entityType === 'Hierarchy'
            ? getDepartmentInformation(item?.entityId)?.name
            : item?.entityType === 'User'
              ? getEmployeeInformation(item?.entityId)?.firstName +
                '  ' +
                getEmployeeInformation(item?.entityId)?.middleName
              : item?.entityId
        : '-',

      assigned: (
        <div
          className="flex flex-col gap-2 max-h-20 overflow-y-auto"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            overflow: 'hidden',
            overflowY: 'scroll',
          }}
        >
          {isUserDataLoading ? (
            // Show skeleton loaders while user data is loading
            <>
              <UserInfoSkeleton />
              <UserInfoSkeleton />
            </>
          ) : (
            item?.approvers?.map((employee: any, empIndex: number) => {
              const userInfo = getEmployeeInformation(employee?.userId);

              if (!userInfo) {
                return (
                  <div key={empIndex} className="flex items-center gap-2">
                    <div className="relative w-6 h-6 rounded-full overflow-hidden bg-gray-200">
                      <Image
                        src={Avatar || '/placeholder.svg'}
                        alt="Default avatar"
                        layout="fill"
                        className="object-cover"
                      />
                    </div>
                    <div className="flex flex-col justify-center">
                      <p className="text-gray-400">User not found</p>
                      <p className="font-extralight text-[12px] text-gray-400">
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
                    <div>
                      {fullName}
                      <br />
                      {userInfo.email}
                    </div>
                  }
                >
                  <div
                    className="flex items-center flex-wrap sm:flex-row gap-2"
                    id={`settings-approvals-row-assignee-${rowSlug}-${empIndex}`}
                    data-cy={`settings-approvals-row-assignee-${rowSlug}-${empIndex}`}
                  >
                    <UserAvatar
                      userId={employee?.userId}
                      data-cy={`settings-approvals-row-assignee-avatar-${rowSlug}-${empIndex}`}
                    />
                    <div
                      className="flex flex-wrap flex-col justify-center"
                      data-cy={`settings-approvals-row-assignee-info-${rowSlug}-${empIndex}`}
                    >
                      <p
                        id={`settings-approvals-row-assignee-name-${rowSlug}-${empIndex}`}
                        data-cy={`settings-approvals-row-assignee-name-${rowSlug}-${empIndex}`}
                      >
                        {displayName || '-'}
                      </p>
                      <p
                        className="font-extralight text-[12px]"
                        id={`settings-approvals-row-assignee-email-${rowSlug}-${empIndex}`}
                        data-cy={`settings-approvals-row-assignee-email-${rowSlug}-${empIndex}`}
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
          className="flex gap-4 text-white"
          id={`settings-approvals-row-actions-${rowSlug}`}
          data-cy={`settings-approvals-row-actions-${rowSlug}`}
        >
          <AccessGuard
            permissions={[Permissions.CreateApprover]}
            id={`settings-approvals-row-add-guard-${rowSlug}`}
            data-cy={`settings-approvals-row-add-guard-${rowSlug}`}
          >
            <Tooltip
              title={'Add Approver'}
              id={`settings-approvals-row-tooltip=${rowSlug}`}
              data-cy={`settings-approvals-tooltip=${rowSlug}`}
            >
              <Button
                id={`editUserButton${item?.id}`}
                className="bg-green-500 px-[8%] text-white disabled:bg-gray-400 border-none"
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
                data-cy={`settings-approvals-row-add-btn-${rowSlug}`}
              >
                <FaPlus
                  id={`settings-approvals-row-add-icon-${rowSlug}`}
                  data-cy={`settings-approvals-row-add-icon-${rowSlug}`}
                />
              </Button>
            </Tooltip>
          </AccessGuard>
          <AccessGuard
            permissions={[Permissions.UpdateApprover]}
            id={`settings-approvals-row-edit-guard-${rowSlug}`}
            data-cy={`settings-approvals-row-edit-guard-${rowSlug}`}
          >
            <Tooltip
              title={'Edit Approver'}
              id={`settings-approvals-row-edit-btn-${rowSlug}`}
              data-cy={`settings-approvals-row-edit-btn-${rowSlug}`}
            >
              <Button
                id={`editUserButton${item?.id}`}
                className="bg-sky-600 px-[8%] text-white disabled:bg-gray-400 border-none"
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
                data-cy={`settings-approvals-row-edit-btn-${rowSlug}`}
              >
                <FaPencil
                  id={`settings-approvals-row-edit-icon-${rowSlug}`}
                  data-cy={`settings-approvals-row-edit-icon-${rowSlug}`}
                />
              </Button>
            </Tooltip>
          </AccessGuard>
          <AccessGuard
            permissions={[Permissions.DeleteApprover]}
            id={`settings-approvals-row-delete-guard-${rowSlug}`}
            data-cy={`settings-approvals-row-delete-guard-${rowSlug}`}
          >
            <Tooltip
              title={'Delete Employee'}
              id={`settings-approvals-row-delete-btn-${rowSlug}`}
              data-cy={`settings-approvals-row-delete-btn-${rowSlug}`}
            >
              <Button
                id={`deleteUserButton${item?.id}`}
                className="bg-red-600 px-[8%] text-white disabled:bg-gray-400 border-none"
                onClick={() => {
                  setDeleteModal(true);
                  setDeletedItem(item?.id);
                }}
                data-cy={`settings-approvals-row-delete-btn-${rowSlug}`}
              >
                <RiDeleteBin6Line
                  id={`settings-approvals-row-delete-icon-${rowSlug}`}
                  data-cy={`settings-approvals-row-delete-icon-${rowSlug}`}
                />
              </Button>
            </Tooltip>
          </AccessGuard>
        </div>
      ),
    };
  });

  return (
    <div
      id="settings-approvals-table-container"
      data-cy="settings-approvals-table-container"
    >
      <DeleteModal
        open={deleteModal}
        onConfirm={() => handleDeleteConfirm(deletedItem)}
        onCancel={() => setDeleteModal(false)}
      />
      {editModal && <EditWorkFLow data-cy="settings-approvals-edit-workflow" />}
      {addModal && <AddApprover data-cy="settings-approvals-add-approver" />}
      <ApproverListTable
        data={data}
        isEmployeeLoading={isEmployeeLoading}
        allFilterData={allFilterData}
        onPageChange={onPageChange}
        pageSize={pageSize}
        data-cy="settings-approvals-table-component"
      />
    </div>
  );
};

export default ApprovalTable;
