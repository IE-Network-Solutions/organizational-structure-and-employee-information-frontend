'use client';

import React, { useCallback, useEffect, useMemo } from 'react';
import { useSettingsAddButton } from '../SettingsAddButtonContext';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
import { useGetAllUsers } from '@/store/server/features/employees/employeeManagment/queries';
import { useApprovalFilter } from '@/store/server/features/approver/queries';
import { useDeleteApprovalWorkFLow } from '@/store/server/features/approver/mutation';
import { useApprovalStore } from '@/store/uistate/features/approval';
import { APPROVALTYPES } from '@/types/enumTypes';
import DeleteModal from '@/components/common/deleteConfirmationModal';
import AddApprover from '@/app/(afterLogin)/(timesheetInformation)/timesheet/settings/approvals/_component/addApprover';
import EditWorkFLow from '@/app/(afterLogin)/(timesheetInformation)/timesheet/settings/approvals/_component/editWorkFLow';
import ApprovalWorkflowModal from './_components';
import WorkflowCard from './_components/WorkflowCard';
import { ApprovalWorkflowItem } from './_components/types';
import SkeletonLoading from '@/components/common/loadings/skeletonLoading';

const WORKFLOW_PAGE_SIZE = 100;

const CandidateApprovalWorkflow = () => {
  const { setAddAction, setAddLabel } = useSettingsAddButton();
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const {
    addModal,
    editModal,
    deleteModal,
    deletedItem,
    setAddModal,
    setEditModal,
    setDeleteModal,
    setDeletedItem,
    setSelectedItem,
    setLevel,
    setWorkflowApplies,
    setApproverType,
  } = useApprovalStore();

  const { data: usersData } = useGetAllUsers();
  const users = usersData?.items || [];
  const { mutate: deleteWorkflow, isLoading: deleteLoading } =
    useDeleteApprovalWorkFLow();

  const { data: approvalData, isLoading } = useApprovalFilter(
    WORKFLOW_PAGE_SIZE,
    1,
    '',
    '',
    '',
    APPROVALTYPES.CANDIDATE,
  );

  const workflows = useMemo<ApprovalWorkflowItem[]>(() => {
    return (approvalData?.items ?? []).map((item: any) => {
      const sortedApprovers = [...(item?.approvers ?? [])].sort(
        (a, b) => a.stepOrder - b.stepOrder,
      );

      return {
        id: item.id,
        name: item.name,
        level: sortedApprovers.length,
        approvers: item.approvers,
        approvalWorkflowType: item.approvalWorkflowType,
        entityType: item.entityType,
        entityId: item.entityId,
        approvalType: item.approvalType,
        assignees: sortedApprovers.map((approver: any) => {
          const user = users.find(
            (entry: { id: string }) => entry.id === approver.userId,
          );
          const name = user
            ? `${user.firstName || ''} ${user.middleName || ''} ${user.lastName || ''}`.trim()
            : approver.userId;

          return { id: approver.userId, name: name || approver.userId };
        }),
      };
    });
  }, [approvalData?.items, users]);

  const canCreate = AccessGuard.checkAccess({
    permissions: [Permissions.CreateApplicationStage],
  });

  const handleOpen = useCallback(() => {
    setIsModalOpen(true);
  }, []);

  const handleMenuAction = useCallback(
    (key: 'add' | 'edit' | 'delete', workflowItem: ApprovalWorkflowItem) => {
      const rawItem = approvalData?.items?.find(
        (item: { id: string }) => item.id === workflowItem.id,
      );

      if (key === 'add') {
        setAddModal(true);
        setSelectedItem(rawItem ?? workflowItem);
        setLevel(1);
        setApproverType(
          workflowItem?.approvalWorkflowType
            ? workflowItem.approvalWorkflowType
            : '-',
        );
      }

      if (key === 'edit') {
        setEditModal(true);
        setSelectedItem(rawItem ?? workflowItem);
        setLevel(workflowItem?.approvers ? workflowItem.approvers.length : 0);
        setWorkflowApplies(
          workflowItem?.entityType ? workflowItem.entityType : '-',
        );
        setApproverType(
          workflowItem?.approvalWorkflowType
            ? workflowItem.approvalWorkflowType
            : '-',
        );
      }

      if (key === 'delete') {
        setDeleteModal(true);
        setDeletedItem(workflowItem.id);
      }
    },
    [
      approvalData?.items,
      setAddModal,
      setApproverType,
      setDeletedItem,
      setDeleteModal,
      setEditModal,
      setLevel,
      setSelectedItem,
      setWorkflowApplies,
    ],
  );

  const handleDeleteConfirm = useCallback(
    (id: string) => {
      deleteWorkflow(id, {
        onSuccess: () => {
          setDeleteModal(false);
        },
      });
    },
    [deleteWorkflow, setDeleteModal],
  );

  useEffect(() => {
    if (canCreate) {
      setAddAction(() => handleOpen);
      setAddLabel('Create Workflow');
    }
    return () => {
      setAddAction(null);
      setAddLabel(null);
    };
  }, [setAddAction, setAddLabel, canCreate, handleOpen]);

  return (
    <div
      className="rounded-lg bg-white h-full"
      data-cy="recruitment-approval-workflow-page-container"
    >
      {isLoading ? (
        <div
          data-cy="recruitment-approval-workflow-skeleton"
          className="flex justify-center py-12"
        >
          <SkeletonLoading count={6} />
        </div>
      ) : (
        <div
          className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full"
          data-cy="recruitment-approval-workflow-grid"
        >
          {workflows.map((workflow) => (
            <WorkflowCard
              key={workflow.id}
              workflow={workflow}
              onMenuAction={handleMenuAction}
            />
          ))}
        </div>
      )}

      <DeleteModal
        loading={deleteLoading}
        open={deleteModal}
        onConfirm={() => handleDeleteConfirm(deletedItem)}
        onCancel={() => setDeleteModal(false)}
        data-cy="recruitment-approval-workflow-delete-modal"
      />
      {editModal && (
        <EditWorkFLow data-cy="recruitment-approval-workflow-edit-modal" />
      )}
      {addModal && (
        <AddApprover data-cy="recruitment-approval-workflow-add-approver-modal" />
      )}

      <ApprovalWorkflowModal
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
      />
    </div>
  );
};

export default CandidateApprovalWorkflow;
