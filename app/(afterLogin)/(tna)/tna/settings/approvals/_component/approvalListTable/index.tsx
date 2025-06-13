import ApproverListTableComponent from '@/components/Approval/ApprovalListTable';
import React from 'react';
import { useApprovalFilter } from '@/store/server/features/approver/queries';
import { useApprovalTNAStore } from '@/store/uistate/features/tna/settings/approval';
import { APPROVALTYPES } from '@/types/enumTypes';
import { useGetAllUsers } from '@/store/server/features/employees/employeeManagment/queries';
import { useGetDepartments } from '@/store/server/features/employees/employeeManagment/department/queries';
import Image from 'next/image';
import Avatar from '@/public/gender_neutral_avatar.jpg';
import { Button, Tooltip } from 'antd';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
import { FaPencil } from 'react-icons/fa6';
import { RiDeleteBin6Line } from 'react-icons/ri';
import { FaPlus } from 'react-icons/fa';
import DeleteModal from '@/components/common/deleteConfirmationModal';
import { useDeleteApprovalWorkFLow } from '@/store/server/features/approver/mutation';
import EditWorkFLow from '../editWorkFlow';
import AddApprover from '../addApprover';

const ApprovalListTable = () => {
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
  const { data: employeeData } = useGetAllUsers();
  const { data: department } = useGetDepartments();
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
      searchParams?.name || '',
      APPROVALTYPES.TNA,
    );

  const onPageChange = (page: number, pageSize?: number) => {
    setUserCurrentPage(page);
    if (pageSize) {
      setPageSize(pageSize);
    }
  };
  const getDepartmentInformation = (id: string) => {
    const departments = department?.find((item: any) => item.id === id);
    return departments;
  };
  const handleDeleteConfirm = (id: string) => {
    setDeleteModal(false);
    deleteApproval(id);
  };
  const data = allFilterData?.items?.map((item: any, index: number) => {
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
          {item?.approvers?.map((employee: any, empIndex: number) => {
            const fullName =
              getEmployeeInformation(employee?.userId)?.firstName +
              '  ' +
              getEmployeeInformation(employee?.userId)?.middleName;
            const shortEmail = getEmployeeInformation(employee?.userId)?.email;
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
                    {getEmployeeInformation(employee?.userId)?.email}
                  </div>
                }
              >
                <div className="flex items-center flex-wrap sm:flex-row gap-2">
                  <div className="relative w-6 h-6 rounded-full overflow-hidden">
                    <Image
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
                                  : Avatar;
                              } catch {
                                return getEmployeeInformation(
                                  employee?.userId,
                                )?.profileImage.startsWith('http')
                                  ? getEmployeeInformation(employee?.userId)
                                      ?.profileImage
                                  : Avatar;
                              }
                            })()
                          : Avatar
                      }
                      alt="Description of image"
                      layout="fill"
                      className="object-cover"
                    />
                  </div>
                  <div className="flex flex-wrap flex-col justify-center">
                    <p>{displayName}</p>
                    <p className="font-extralight text-[12px]">
                      {displayEmail}
                    </p>
                  </div>
                </div>
              </Tooltip>
            );
          })}
        </div>
      ),
      level: item?.approvers ? item?.approvers?.length : '-',
      action: (
        <div className="flex gap-4 text-white">
          <AccessGuard permissions={[Permissions.CreateApprover]}>
            <Tooltip title={'Add Approver'}>
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
              >
                <FaPlus />
              </Button>
            </Tooltip>
          </AccessGuard>
          <AccessGuard permissions={[Permissions.UpdateApprover]}>
            <Tooltip title={'Edit Approver'}>
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
              >
                <FaPencil />
              </Button>
            </Tooltip>
          </AccessGuard>
          <AccessGuard permissions={[Permissions.DeleteApprover]}>
            <Tooltip title={'Delete Employee'}>
              <Button
                id={`deleteUserButton${item?.id}`}
                className="bg-red-600 px-[8%] text-white disabled:bg-gray-400 border-none"
                onClick={() => {
                  setDeleteModal(true);
                  setDeletedItem(item?.id);
                }}
              >
                <RiDeleteBin6Line />
              </Button>
            </Tooltip>
          </AccessGuard>
        </div>
      ),
    };
  });
  return (
    <div>
      <DeleteModal
        open={deleteModal}
        onConfirm={() => handleDeleteConfirm(deletedItem)}
        onCancel={() => setDeleteModal(false)}
      />
      {editModal && <EditWorkFLow />}
      {addModal && <AddApprover />}
      <ApproverListTableComponent
        data={data}
        isEmployeeLoading={isEmployeeLoading}
        allFilterData={allFilterData}
        onPageChange={onPageChange}
        pageSize={pageSize}
      />
    </div>
  );
};

export default ApprovalListTable;
