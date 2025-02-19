'use client';
import Image from 'next/image';
import { RiDeleteBin6Line } from 'react-icons/ri';
import { Button, Form, Input, Modal, Select, Tooltip } from 'antd';
import Avatar from '@/public/gender_neutral_avatar.jpg';
import { FaPencil } from 'react-icons/fa6';
import {
  useApprovalFilter,
  useGetAllApprovalWorkflow,
  useGetAllLeaveRequestByWorkFlowId,
} from '@/store/server/features/approver/queries';
import { useApprovalStore } from '@/store/uistate/features/approval';
import DeleteModal from '@/components/common/deleteConfirmationModal';
import {
  useDeleteApprovalWorkFLow,
  useUpdateLeaverequestApprovalWorkFlow,
} from '@/store/server/features/approver/mutation';
import { useGetAllUsers } from '@/store/server/features/employees/employeeManagment/queries';
import { FaPlus } from 'react-icons/fa';
import { useGetDepartments } from '@/store/server/features/employees/employeeManagment/department/queries';
import AddApprover from '../addApprover';
import { useEffect } from 'react';
import EditWorkFLow from '../editWorkFLow';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
import ApproverListTable from '@/components/Approval/ApprovalListTable';
import { APPROVALTYPES, commonClass } from '@/types/enumTypes';
import { IoMdSwap } from 'react-icons/io';

const ApprovalListTable = () => {
  const { data: employeeData } = useGetAllUsers();
  const { data: department } = useGetDepartments();
  const { mutate: deleteApproval } = useDeleteApprovalWorkFLow();
  const {
    userCurrentPage,
    pageSize,
    deleteModal,
    editModal,
    transferModal,
    setTransferModal,
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
    selectedItem,
  } = useApprovalStore();
  const { searchParams } = useApprovalStore();
  const { data: allFilterData, isLoading: isEmployeeLoading } =
    useApprovalFilter(
      pageSize,
      userCurrentPage,
      searchParams?.entityType ? searchParams.entityType : '',
      searchParams?.name || '',
      APPROVALTYPES.LEAVE,
    );

  const { data: leaveRequestData } =
    useGetAllLeaveRequestByWorkFlowId(deletedItem);

  const { data: approvalWorkflowData } = useGetAllApprovalWorkflow();
  const { mutate: deleteWorkflow, isLoading: deleteLoading } =
    useDeleteApprovalWorkFLow();
  const { mutate: updateWorkflow, isLoading: updateLoading } =
    useUpdateLeaverequestApprovalWorkFlow();

  console.log(approvalWorkflowData, 'approvalWorkflowDataapprovalWorkflowData');

  console.log(leaveRequestData, 'leaveRequestData');
  const getEmployeeInformation = (id: string) => {
    const user = employeeData?.items?.find((item: any) => item.id === id);
    return user;
  };
  const getDepartmentInformation = (id: string) => {
    const departments = department?.find((item: any) => item.id === id);
    return departments;
  };

  const [form] = Form.useForm(); // Form instance
  const onFinish = (values: any) => {
    deleteWorkflow(values.currentWorkFlow, {
      onSuccess: () => {
        // Fix: Pass the correct structure for updateWorkflow
        updateWorkflow(
          {
            currentapprovalWorkflowId: values.currentWorkFlow,
            approvalWorkflowId: values.workflow,
          },
          {
            onSuccess: () => {
              setTransferModal(false);
            },
          },
        );
      },
    });
  };

  const onFinishFailed = (errorInfo: any) => {
    console.log('Form Submission Failed:', errorInfo);
  };

  const MAX_NAME_LENGTH = 10;
  const MAX_EMAIL_LENGTH = 5;
  useEffect(() => {
    if (allFilterData?.items && selectedItem?.id) {
      const foundItem = allFilterData?.items?.find(
        (item: any) => item.id === selectedItem?.id,
      );

      if (foundItem) {
        setSelectedItem(foundItem);
        setLevel(foundItem?.approvers ? foundItem?.approvers?.length : '-');
      }
    }
  }, [allFilterData?.items, selectedItem]);

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
          {[...item?.approvers]
            .sort((a, b) => a.stepOrder - b.stepOrder)
            ?.map((employee: any, empIndex: number) => {
              const fullName =
                getEmployeeInformation(employee?.userId)?.firstName +
                '  ' +
                getEmployeeInformation(employee?.userId)?.middleName;
              const shortEmail = getEmployeeInformation(
                employee?.userId,
              )?.email;
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
      level: item?.approvers
        ? item?.approvalWorkflowType == 'Parallel'
          ? Math.max(...item?.approvers.map((item: any) => item.stepOrder))
          : item?.approvers?.length
        : '-',
      action: (
        <div className="flex gap-4 text-white">
          <AccessGuard permissions={[Permissions.CreateApprover]}>
            <Tooltip title={'Add Approver'}>
              <Button
                id={`editUserButton${item?.id}`}
                className="bg-green-500 px-[8%] text-white disabled:bg-gray-400 "
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
                className="bg-sky-600 px-[8%] text-white disabled:bg-gray-400 "
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
                className="bg-red-600 px-[8%] text-white disabled:bg-gray-400"
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
  const onPageChange = (page: number, pageSize?: number) => {
    setUserCurrentPage(page);
    if (pageSize) {
      setPageSize(pageSize);
    }
  };
  const handleDeleteConfirm = (id: string) => {
    if (leaveRequestData?.items?.length > 0) {
      setDeleteModal(false);
      setTransferModal(true);
    } else {
      deleteWorkflow(id, {
        onSuccess: () => {
          setDeleteModal(false);
        },
      });
    }
    // setDeleteModal(false);
    // deleteApproval(id);
  };

  return (
    <div className="mt-2  pt-5">
      <DeleteModal
        loading={deleteLoading}
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

      <Modal
        title={
          <p className={`${commonClass}`}>
            Should be Transfer to Another WorkFlow
          </p>
        }
        open={transferModal}
        onCancel={() => setTransferModal(false)}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          initialValues={{
            currentWorkFlow: deletedItem,
          }}
        >
          <div className="flex items-center gap-4">
            <Form.Item
              label={<span className={`${commonClass}`}>Current Workflow</span>}
              name="currentWorkFlow"
              rules={[{ required: true, message: 'Please enter a value!' }]}
            >
              <Select
                disabled
                placeholder="Select Workflow"
                style={{ width: '200px' }}
                options={approvalWorkflowData?.items.map((item) => ({
                  label: item.name,
                  value: item.id, // ✅ Use `value` instead of `id`
                }))}
              />
            </Form.Item>

            <div className="flex justify-center items-center text-2xl">
              <IoMdSwap />
            </div>

            <Form.Item
              label={<span className={`${commonClass}`}>Select Workflow</span>}
              name="workflow"
              rules={[{ required: true, message: 'Please select a workflow!' }]}
            >
              <Select
                placeholder="Select Workflow"
                allowClear
                style={{ width: '200px' }}
                options={approvalWorkflowData?.items.map((item) => ({
                  label: item.name,
                  value: item.id,
                }))}
              />
            </Form.Item>
          </div>

          {/* Action Buttons */}
          <Form.Item>
            <div className="flex justify-end space-x-8">
              <Button
                loading={updateLoading}
                className="text-sm"
                type="primary"
                htmlType="submit"
              >
                Transfer
              </Button>
              <Button
                className={`${commonClass}`}
                type="dashed"
                danger
                htmlType="reset"
              >
                Reset
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ApprovalListTable;
