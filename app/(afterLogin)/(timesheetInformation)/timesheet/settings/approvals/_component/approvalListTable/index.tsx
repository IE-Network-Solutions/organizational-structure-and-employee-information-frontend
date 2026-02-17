'use client';
import Image from 'next/image';
import { RiDeleteBin6Line } from 'react-icons/ri';
import { Button, Form, Modal, Select, Tooltip } from 'antd';
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
import { useEffect, useState } from 'react';
import EditWorkFLow from '../editWorkFLow';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
import ApproverListTable from '@/components/Approval/ApprovalListTable';
import { APPROVALTYPES, commonClass } from '@/types/enumTypes';
import { IoMdSwap } from 'react-icons/io';
import WorkflowModal from '../workflowModal';

const ApprovalListTable = () => {
  const { data: employeeData, isLoading: isEmployeeDataLoading } =
    useGetAllUsers();
  const { data: department, isLoading: isDepartmentLoading } =
    useGetDepartments();
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
    setDepartmentApproval,
    approverType,
  } = useApprovalStore();
  const [workflowModal, setWorkflowModal] = useState(false);
  const { searchParams } = useApprovalStore();
  const { data: allFilterData, isLoading: isEmployeeLoading } =
    useApprovalFilter(
      pageSize,
      userCurrentPage,
      searchParams?.entityType ? searchParams.entityType : '',
      searchParams?.entityId ? searchParams.entityId : '',
      searchParams?.name || '',
      APPROVALTYPES.LEAVE,
    );

  // Check if all required data is loaded
  const isDataLoading =
    isEmployeeLoading || isEmployeeDataLoading || isDepartmentLoading;

  const { data: leaveRequestData } =
    useGetAllLeaveRequestByWorkFlowId(deletedItem);

  const { data: approvalWorkflowData } = useGetAllApprovalWorkflow();
  const { mutate: deleteWorkflow, isLoading: deleteLoading } =
    useDeleteApprovalWorkFLow();
  const { mutate: updateWorkflow, isLoading: updateLoading } =
    useUpdateLeaverequestApprovalWorkFlow();

  const getEmployeeInformation = (id: string) => {
    if (!employeeData?.items || isEmployeeDataLoading) return null;
    const user = employeeData.items.find((item: any) => item.id === id);
    return user;
  };
  const getDepartmentInformation = (id: string) => {
    if (!department || isDepartmentLoading) return null;
    const departments = department.find((item: any) => item.id === id);
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

  useEffect(() => {
    if (transferModal) {
      form.resetFields();
      if (deletedItem) {
        form.setFieldsValue({
          currentWorkFlow: deletedItem,
          workflow: undefined,
        });
      }
    }
  }, [transferModal, deletedItem, form]);

  const data =
    !isDataLoading && allFilterData?.items
      ? allFilterData.items.map((item: any, index: number) => {
          const employeeInfo = getEmployeeInformation(item?.entityId);
          const departmentInfo = getDepartmentInformation(item?.entityId);

          let appliedToValue = '-';
          if (item?.entityId) {
            if (
              item?.entityType === 'Department' ||
              item?.entityType === 'Hierarchy'
            ) {
              appliedToValue = departmentInfo?.name || '-';
            } else if (item?.entityType === 'User') {
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

          return {
            key: index,
            workflow_name: item?.name ? item?.name : '-',
            applied_to: appliedToValue,

            assigned: (
              <div
                className="flex flex-col gap-2 max-h-20 overflow-y-auto"
                style={{
                  scrollbarWidth: 'none',
                  msOverflowStyle: 'none',
                  overflow: 'hidden',
                  overflowY: 'scroll',
                }}
                id={`time-attendance-settings-approvals-table-row-${index}-assigned-container`}
                data-cy={`time-attendance-settings-approvals-table-row-${index}-assigned-container`}
              >
                {[...(item?.approvers ?? [])]
                  .sort((a, b) => a.stepOrder - b.stepOrder)
                  ?.map((employee: any, empIndex: number) => {
                    const employeeInfo = getEmployeeInformation(
                      employee?.userId,
                    );
                    const firstName = employeeInfo?.firstName || '';
                    const middleName = employeeInfo?.middleName || '';
                    const email = employeeInfo?.email || '';

                    const fullName =
                      firstName && middleName
                        ? `${firstName} ${middleName}`
                        : firstName || middleName || 'Unknown User';

                    const displayName =
                      fullName?.length > MAX_NAME_LENGTH
                        ? fullName.slice(0, MAX_NAME_LENGTH) + '...'
                        : fullName;
                    const displayEmail =
                      email?.length > MAX_EMAIL_LENGTH
                        ? email.slice(0, MAX_EMAIL_LENGTH) + '...'
                        : email;

                    return (
                      <Tooltip
                        key={empIndex}
                        title={
                          <div
                            id={`time-attendance-settings-approvals-table-row-${index}-assigned-${empIndex}-tooltip`}
                            data-cy={`time-attendance-settings-approvals-table-row-${index}-assigned-${empIndex}-tooltip`}
                          >
                            {fullName}
                            <br data-cy="approvals-component-approvallisttable-index-tsx-index-br-217" />
                            {email}
                          </div>
                        }
                        data-cy={`time-attendance-settings-approvals-table-row-${index}-assigned-${empIndex}-tooltip-wrapper`}
                      >
                        <div
                          className="flex items-center flex-wrap sm:flex-row gap-2"
                          id={`time-attendance-settings-approvals-table-row-${index}-assigned-${empIndex}-container`}
                          data-cy={`time-attendance-settings-approvals-table-row-${index}-assigned-${empIndex}-container`}
                        >
                          <div
                            className="relative w-6 h-6 rounded-full overflow-hidden"
                            id={`time-attendance-settings-approvals-table-row-${index}-assigned-${empIndex}-avatar-container`}
                            data-cy={`time-attendance-settings-approvals-table-row-${index}-assigned-${empIndex}-avatar-container`}
                          >
                            <Image
                              src={
                                employeeInfo?.profileImage &&
                                typeof employeeInfo.profileImage === 'string'
                                  ? (() => {
                                      try {
                                        const parsed = JSON.parse(
                                          employeeInfo.profileImage,
                                        );
                                        return parsed.url &&
                                          parsed.url.startsWith('http')
                                          ? parsed.url
                                          : Avatar;
                                      } catch {
                                        return employeeInfo.profileImage.startsWith(
                                          'http',
                                        )
                                          ? employeeInfo.profileImage
                                          : Avatar;
                                      }
                                    })()
                                  : Avatar
                              }
                              alt="Description of image"
                              layout="fill"
                              className="object-cover"
                              data-cy={`time-attendance-settings-approvals-table-row-${index}-assigned-${empIndex}-avatar`}
                            />
                          </div>
                          <div
                            className="flex flex-wrap flex-col justify-center"
                            id={`time-attendance-settings-approvals-table-row-${index}-assigned-${empIndex}-info`}
                            data-cy={`time-attendance-settings-approvals-table-row-${index}-assigned-${empIndex}-info`}
                          >
                            <p
                              id={`time-attendance-settings-approvals-table-row-${index}-assigned-${empIndex}-name`}
                              data-cy={`time-attendance-settings-approvals-table-row-${index}-assigned-${empIndex}-name`}
                            >
                              {displayName}
                            </p>
                            <p
                              className="font-extralight text-[12px]"
                              id={`time-attendance-settings-approvals-table-row-${index}-assigned-${empIndex}-email`}
                              data-cy={`time-attendance-settings-approvals-table-row-${index}-assigned-${empIndex}-email`}
                            >
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
                ? (item?.approvers ?? []).length > 0
                  ? Math.max(
                      ...(item?.approvers ?? []).map(
                        (item: any) => item.stepOrder,
                      ),
                    )
                  : 0
                : item?.approvers?.length
              : '-',
            action: (
              <div
                className="flex gap-4 text-white"
                id={`time-attendance-settings-approvals-table-row-${index}-actions-container`}
                data-cy={`time-attendance-settings-approvals-table-row-${index}-actions-container`}
              >
                <AccessGuard
                  permissions={[Permissions.CreateApprover]}
                  data-cy={`time-attendance-settings-approvals-table-row-${index}-add-approver-access-guard`}
                >
                  <Tooltip
                    title={'Add Approver'}
                    data-cy={`time-attendance-settings-approvals-table-row-${index}-add-approver-tooltip`}
                  >
                    <Button
                      id={`time-attendance-settings-approvals-table-row-${index}-add-approver-button`}
                      data-cy={`time-attendance-settings-approvals-table-row-${index}-add-approver-button`}
                      className="bg-green-500 px-[8%] text-white disabled:bg-gray-400 border-none "
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
                      <FaPlus
                        data-cy={`time-attendance-settings-approvals-table-row-${index}-add-approver-button-icon`}
                      />
                    </Button>
                  </Tooltip>
                </AccessGuard>
                <AccessGuard
                  permissions={[Permissions.UpdateApprover]}
                  data-cy={`time-attendance-settings-approvals-table-row-${index}-edit-approver-access-guard`}
                >
                  <Tooltip
                    title={'Edit Approver'}
                    data-cy={`time-attendance-settings-approvals-table-row-${index}-edit-approver-tooltip`}
                  >
                    <Button
                      id={`editUserButton${item?.id}`}
                      data-cy={`time-attendance-settings-approvals-table-row-${index}-edit-approver-button-id`}
                      className="bg-sky-600 px-[8%] text-white disabled:bg-gray-400 border-none "
                      onClick={() => {
                        setEditModal(true);
                        setSelectedItem(item);
                        setLevel(
                          item?.approvers ? item?.approvers?.length : '-',
                        );
                        setWorkflowApplies(
                          item?.entityType ? item?.entityType : '-',
                        );
                        setApproverType(
                          item?.approvalWorkflowType
                            ? item?.approvalWorkflowType
                            : '-',
                        );
                      }}
                    >
                      <FaPencil
                        data-cy={`time-attendance-settings-approvals-table-row-${index}-edit-approver-button-icon`}
                      />
                    </Button>
                  </Tooltip>
                </AccessGuard>
                <AccessGuard
                  permissions={[Permissions.DeleteApprover]}
                  data-cy={`time-attendance-settings-approvals-table-row-${index}-delete-approver-access-guard`}
                >
                  <Tooltip
                    title={'Delete Employee'}
                    data-cy={`time-attendance-settings-approvals-table-row-${index}-delete-approver-tooltip`}
                  >
                    <Button
                      id={`deleteUserButton${item?.id}`}
                      data-cy={`time-attendance-settings-approvals-table-row-${index}-delete-approver-button-id`}
                      className="bg-red-600 px-[8%] text-white disabled:bg-gray-400 border-none "
                      onClick={() => {
                        setDeleteModal(true);
                        setDeletedItem(item?.id);
                      }}
                    >
                      <RiDeleteBin6Line
                        data-cy={`time-attendance-settings-approvals-table-row-${index}-delete-approver-button-icon`}
                      />
                    </Button>
                  </Tooltip>
                </AccessGuard>
              </div>
            ),
          };
        })
      : [];
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
  };

  const onChange = (value: string) => {
    setApproverType(value);
    if (approverType) {
      setDepartmentApproval(true);
    }
  };

  const handleCreateNewWorkflow = () => {
    // Find the current workflow from allFilterData
    const currentWorkflow = allFilterData?.items?.find(
      (item: any) => item.id === deletedItem,
    );

    // Set the workflowApplies type from the current workflow
    if (currentWorkflow?.entityType) {
      setWorkflowApplies(currentWorkflow.entityType);
    }

    setWorkflowModal(true);
  };

  const handleWorkflowModalCancel = () => {
    setWorkflowModal(false);
    setApproverType(null);
    setDepartmentApproval(false);
  };

  const handleTransferModalCancel = () => {
    setTransferModal(false);
    form.resetFields();
    setApproverType(null);
    setDepartmentApproval(false);
  };

  return (
    <div
      className="mt-2"
      id="time-attendance-settings-approvals-table-wrapper"
      data-cy="time-attendance-settings-approvals-table-wrapper"
    >
      <DeleteModal
        loading={deleteLoading}
        open={deleteModal}
        onConfirm={() => handleDeleteConfirm(deletedItem)}
        onCancel={() => setDeleteModal(false)}
        data-cy="time-attendance-settings-approvals-table-delete-modal"
      />
      {editModal && (
        <EditWorkFLow data-cy="time-attendance-settings-approvals-table-edit-workflow" />
      )}
      {addModal && (
        <AddApprover data-cy="time-attendance-settings-approvals-table-add-approver" />
      )}
      <ApproverListTable
        data={isDataLoading ? [] : data}
        isEmployeeLoading={isDataLoading}
        allFilterData={allFilterData}
        onPageChange={onPageChange}
        pageSize={pageSize}
        data-cy="time-attendance-settings-approvals-table-list"
      />

      <Modal
        title={
          <p
            className={`${commonClass} text-xl font-semibold`}
            id="time-attendance-settings-approvals-table-transfer-modal-title"
            data-cy="time-attendance-settings-approvals-table-transfer-modal-title"
          >
            In order to remove this workflow you have to transfer this workflow
            to another workflow
          </p>
        }
        open={transferModal}
        onCancel={handleTransferModalCancel}
        footer={null}
        data-cy="time-attendance-settings-approvals-table-transfer-modal"
        centered
        className="p-5"
        width={930}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{
            currentWorkFlow: deletedItem,
          }}
          id="time-attendance-settings-approvals-table-transfer-modal-form"
          data-cy="time-attendance-settings-approvals-table-transfer-modal-form"
        >
          <div
            className="flex flex-col md:flex-row md:justify-between gap-4"
            id="time-attendance-settings-approvals-table-transfer-modal-form-fields"
            data-cy="time-attendance-settings-approvals-table-transfer-modal-form-fields"
          >
            <Form.Item
              label={
                <span
                  data-cy="approvals-component-approvallisttable-index-tsx-index-span-511"
                  className={`${commonClass}`}
                >
                  Current Workflow
                </span>
              }
              name="currentWorkFlow"
              rules={[{ required: true, message: 'Please enter a value!' }]}
              id="time-attendance-settings-approvals-table-transfer-modal-current-workflow"
              data-cy="time-attendance-settings-approvals-table-transfer-modal-current-workflow"
              className="w-full"
            >
              <Select
                className="h-10"
                disabled
                placeholder="Select Workflow"
                options={approvalWorkflowData?.items
                  ?.filter(
                    (item: any) => item.approvalType === APPROVALTYPES.LEAVE,
                  )
                  ?.map((item: any) => ({
                    label: item.name,
                    value: item.id,
                  }))}
                id="time-attendance-settings-approvals-table-transfer-modal-current-workflow-select"
                data-cy="time-attendance-settings-approvals-table-transfer-modal-current-workflow-select"
              />
            </Form.Item>

            <div
              className="flex justify-center items-center text-2xl"
              id="time-attendance-settings-approvals-table-transfer-modal-swap-icon-container"
              data-cy="time-attendance-settings-approvals-table-transfer-modal-swap-icon-container"
            >
              <IoMdSwap data-cy="time-attendance-settings-approvals-table-transfer-modal-swap-icon" />
            </div>

            <Form.Item
              label={
                <span
                  data-cy="approvals-component-approvallisttable-index-tsx-index-span-544"
                  className={`${commonClass}`}
                >
                  Select Workflow
                </span>
              }
              name="workflow"
              rules={[{ required: true, message: 'Please select a workflow!' }]}
              id="time-attendance-settings-approvals-table-transfer-modal-workflow"
              data-cy="time-attendance-settings-approvals-table-transfer-modal-workflow"
              className="w-full"
            >
              <Select
                className="h-10"
                placeholder="Select Workflow"
                allowClear
                showSearch
                optionFilterProp="label"
                options={approvalWorkflowData?.items
                  ?.filter(
                    (item: any) => item.approvalType === APPROVALTYPES.LEAVE,
                  )
                  ?.map((item: any) => ({
                    label: item.name,
                    value: item.id,
                  }))}
                id="time-attendance-settings-approvals-table-transfer-modal-workflow-select"
                data-cy="time-attendance-settings-approvals-table-transfer-modal-workflow-select"
              />
            </Form.Item>
          </div>

          {/* Action Buttons */}
          <Form.Item
            id="time-attendance-settings-approvals-table-transfer-modal-actions"
            data-cy="time-attendance-settings-approvals-table-transfer-modal-actions"
          >
            <div
              className="flex flex-col md:flex-row md:justify-between gap-4 mt-4"
              id="time-attendance-settings-approvals-table-transfer-modal-buttons"
              data-cy="time-attendance-settings-approvals-table-transfer-modal-buttons"
            >
              <div
                data-cy="time-attendance-settings-approvals-table-transfer-modal-create-button-container"
                id="time-attendance-settings-approvals-table-transfer-modal-create-button-container"
              >
                <Button
                  data-cy="time-attendance-settings-approvals-table-transfer-modal-create-button"
                  id="time-attendance-settings-approvals-table-transfer-modal-create-button"
                  className="text-sm px-10 h-10"
                  type="primary"
                  onClick={handleCreateNewWorkflow}
                >
                  Create New
                </Button>
              </div>
              <div
                data-cy="approvals-component-approvallisttable-index-tsx-index-div-595"
                className="sm:space-x-8 space-x-2"
              >
                <Button
                  className={`${commonClass} px-10 h-10`}
                  type="default"
                  htmlType="reset"
                  id="time-attendance-settings-approvals-table-transfer-modal-reset-button"
                  data-cy="time-attendance-settings-approvals-table-transfer-modal-reset-button"
                >
                  Reset
                </Button>
                <Button
                  loading={updateLoading}
                  className="text-sm px-10 h-10"
                  type="primary"
                  htmlType="submit"
                  id="time-attendance-settings-approvals-table-transfer-modal-transfer-button"
                  data-cy="time-attendance-settings-approvals-table-transfer-modal-transfer-button"
                >
                  Transfer
                </Button>
              </div>
            </div>
          </Form.Item>
        </Form>
      </Modal>
      <WorkflowModal
        open={workflowModal}
        onCancel={handleWorkflowModalCancel}
        onChange={onChange}
        currentWorkFlow={deletedItem}
      />
    </div>
  );
};

export default ApprovalListTable;
