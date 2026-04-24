'use client';
import Image from 'next/image';
import { RiDeleteBin6Line } from 'react-icons/ri';
import { Button, Dropdown, Form, Modal, Select, Avatar, Tooltip } from 'antd';
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
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import { UserOutlined } from '@ant-design/icons';

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
      searchParams?.approvalType || [APPROVALTYPES.LEAVE, 'WorkFromHome'],
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

  const MAX_NAME_LENGTH = 40;
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

  const groupedWorkflowItems =
    !isDataLoading && allFilterData?.items
      ? Object.values(
          allFilterData.items.reduce((acc: Record<string, any>, item: any) => {
            const key = `${item?.entityType || ''}::${item?.entityId || ''}`;
            const existingGroup = acc[key];
            if (!existingGroup) {
              acc[key] = {
                ...item,
                workflows: [item],
              };
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
            const showTimelineConnector =
              workflowItem?.approvalWorkflowType !== 'Parallel';

            return (
              <div
                data-cy={`time-attendance-settings-approvals-table-row-${index}-approval-type-${workflowIdx}-approvers`}
                className="w-full overflow-x-auto"
              >
                <div
                  className="flex min-w-max items-center gap-1.5 py-1"
                  data-cy={`time-attendance-settings-approvals-table-row-${index}-approval-type-${workflowIdx}-approvers-row`}
                >
                  {sortedApprovers?.map((employee: any, empIndex: number) => {
                    const employeeInfo = getEmployeeInformation(
                      employee?.userId,
                    );
                    const firstName = employeeInfo?.firstName || '';
                    const middleName = employeeInfo?.middleName || '';

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
                        data-cy={`time-attendance-settings-approvals-table-row-${index}-assigned-${workflowIdx}-${empIndex}-flow-item`}
                      >
                        {empIndex > 0 && (
                          <>
                            {showTimelineConnector ? (
                              <div
                                className="mx-0.5 inline-flex h-5 min-w-6 items-center justify-center rounded-full border border-[#E3E7FF] bg-[#F7F8FF] px-1 text-[11px] font-semibold text-[#5B67D9]"
                                data-cy={`time-attendance-settings-approvals-table-row-${index}-assigned-${workflowIdx}-${empIndex}-connector-arrow`}
                              >
                                →
                              </div>
                            ) : (
                              <div
                                className="mx-0.5 inline-flex h-2 w-2 rounded-full bg-[#D9DEF8]"
                                data-cy={`time-attendance-settings-approvals-table-row-${index}-assigned-${workflowIdx}-${empIndex}-connector-dot`}
                              />
                            )}
                          </>
                        )}
                        <Tooltip
                          title={displayName}
                          placement="top"
                          data-cy={`time-attendance-settings-approvals-table-row-${index}-assigned-${workflowIdx}-${empIndex}-tooltip`}
                        >
                          <div
                            className="relative h-9 w-9 rounded-full overflow-hidden ring-2 ring-[#EEF0FF] hover:ring-[#C9D0FF] transition-colors cursor-pointer shadow-[0_1px_2px_rgba(16,24,40,0.08)]"
                            id={`time-attendance-settings-approvals-table-row-${index}-assigned-${workflowIdx}-${empIndex}-avatar-container`}
                            data-cy={`time-attendance-settings-approvals-table-row-${index}-assigned-${workflowIdx}-${empIndex}-avatar-container`}
                          >
                            {(() => {
                              const raw = employeeInfo?.profileImage;
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
                              }

                              return avatarSrc ? (
                                <Image
                                  src={avatarSrc}
                                  alt={displayName || 'User profile'}
                                  fill
                                  className="object-cover"
                                  data-cy={`time-attendance-settings-approvals-table-row-${index}-assigned-${workflowIdx}-${empIndex}-avatar`}
                                />
                              ) : (
                                <div
                                  data-cy={`time-attendance-settings-approvals-table-row-${index}-assigned-${workflowIdx}-${empIndex}-avatar-default-container`}
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
                        data-cy={`time-attendance-settings-approvals-table-row-${index}-workflow-${workflowIdx}-add-approver-label`}
                      >
                        Add Approver
                      </span>
                    ),
                    icon: (
                      <FaPlus
                        data-cy={`time-attendance-settings-approvals-table-row-${index}-workflow-${workflowIdx}-add-approver-icon`}
                      />
                    ),
                  }
                : null,
              canEdit
                ? {
                    key: 'edit',
                    label: (
                      <span
                        data-cy={`time-attendance-settings-approvals-table-row-${index}-workflow-${workflowIdx}-edit-approver-label`}
                      >
                        Edit Approver
                      </span>
                    ),
                    icon: (
                      <FaPencil
                        data-cy={`time-attendance-settings-approvals-table-row-${index}-workflow-${workflowIdx}-edit-approver-icon`}
                      />
                    ),
                  }
                : null,
              canDelete
                ? {
                    key: 'delete',
                    label: (
                      <span
                        data-cy={`time-attendance-settings-approvals-table-row-${index}-workflow-${workflowIdx}-delete-approver-label`}
                      >
                        Delete Workflow
                      </span>
                    ),
                    icon: (
                      <RiDeleteBin6Line
                        data-cy={`time-attendance-settings-approvals-table-row-${index}-workflow-${workflowIdx}-delete-approver-icon`}
                      />
                    ),
                  }
                : null,
            ].filter(Boolean);

            if (!menuItems.length) {
              return (
                <span
                  data-cy={`time-attendance-settings-approvals-table-row-${index}-workflow-${workflowIdx}-no-actions`}
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
                data-cy={`time-attendance-settings-approvals-table-row-${index}-workflow-${workflowIdx}-actions-dropdown`}
              >
                <Button
                  type="default"
                  className="h-8 w-8 border-0 bg-[#FAFAFA] shadow-none hover:!bg-[#F2F2F2]"
                  data-cy={`time-attendance-settings-approvals-table-row-${index}-workflow-${workflowIdx}-actions-trigger`}
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
                id={`time-attendance-settings-approvals-table-row-${index}-assigned-container`}
                data-cy={`time-attendance-settings-approvals-table-row-${index}-assigned-container`}
              >
                {workflowsForCard.map(
                  (workflowItem: any, workflowIdx: number) => (
                    <div
                      key={workflowItem?.id || workflowIdx}
                      data-cy={`time-attendance-settings-approvals-table-row-${index}-approval-type-${workflowIdx}-section`}
                      className="w-full rounded-lg p-3 bg-[#FAFAFA] flex flex-col gap-2"
                    >
                      <div
                        className="flex items-start justify-between gap-2"
                        data-cy={`time-attendance-settings-approvals-table-row-${index}-approval-type-${workflowIdx}-section-header`}
                      >
                        <div
                          className="flex flex-col"
                          data-cy={`time-attendance-settings-approvals-table-row-${index}-approval-type-${workflowIdx}-titles`}
                        >
                          <span
                            data-cy={`time-attendance-settings-approvals-table-row-${index}-approval-type-${workflowIdx}-label`}
                            className="text-xs text-gray-500"
                          >
                            {workflowItem?.approvalType || '-'}
                          </span>
                          <span
                            data-cy={`time-attendance-settings-approvals-table-row-${index}-approval-type-${workflowIdx}-workflow-name`}
                            className="text-xs font-medium text-[#2f2f2f]"
                          >
                            {workflowItem?.name || '-'}
                          </span>
                        </div>
                        <div
                          className="flex justify-end"
                          data-cy={`time-attendance-settings-approvals-table-row-${index}-approval-type-${workflowIdx}-actions`}
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
                : '-',
            action: (
              <span
                data-cy={`time-attendance-settings-approvals-table-row-${index}-no-header-action`}
              />
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
