import DeleteModal from '@/components/common/deleteConfirmationModal';
import { useDeleteApprovalWorkFLow } from '@/store/server/features/approver/mutation';
import { useGetDepartments } from '@/store/server/features/employees/employeeManagment/department/queries';
import { useGetAllUsers } from '@/store/server/features/employees/employeeManagment/queries';
import { Button, Tooltip } from 'antd';
import Image from 'next/image';
import React from 'react';
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
  const { data: employeeData } = useGetAllUsers();
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
          <Tooltip title={'Add Approver'}>
            <Button
              id={`editUserButton${item?.id}`}
              className="bg-green-500 px-[8%] text-white disabled:bg-gray-400 "
              onClick={() => {
                setAddModal(true);
                setSelectedItem(item);
                setLevel(1);
                setApproverType(
                  item?.approvalWorkflowType ? item?.approvalWorkflowType : '-',
                );
              }}
            >
              <FaPlus />
            </Button>
          </Tooltip>
          <Tooltip title={'Edit Approver'}>
            <Button
              id={`editUserButton${item?.id}`}
              className="bg-sky-600 px-[8%] text-white disabled:bg-gray-400 "
              onClick={() => {
                setEditModal(true);
                setSelectedItem(item);
                setLevel(item?.approvers ? item?.approvers?.length : '-');
                setWorkflowApplies(item?.entityType ? item?.entityType : '-');
                setApproverType(
                  item?.approvalWorkflowType ? item?.approvalWorkflowType : '-',
                );
              }}
            >
              <FaPencil />
            </Button>
          </Tooltip>
          <Tooltip title={'Delete Employee'}>
            <Button
              id={`deleteUserButton${item?.id}`}
              className="bg-red-600 px-[8%] text-white disabled:bg-gray-400"
              onClick={() => {
                setDeleteModal(true);
                setDeletedItem(item?.id);
              }}
            >
              <RiDeleteBin6Line />
            </Button>
          </Tooltip>
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
      <ApproverListTable
        data={data}
        isEmployeeLoading={isEmployeeLoading}
        allFilterData={allFilterData}
        onPageChange={onPageChange}
        pageSize={pageSize}
      />
    </div>
  );
};

export default ApprovalTable;
