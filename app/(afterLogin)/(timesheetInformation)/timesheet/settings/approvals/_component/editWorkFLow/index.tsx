import EditApproverComponent from '@/components/Approval/editApprover';
import {
  useDeleteApprover,
  useDeleteParallelApprover,
  useUpdateAssignedUserMutation,
} from '@/store/server/features/approver/mutation';
import { useGetDepartments } from '@/store/server/features/employees/employeeManagment/department/queries';
import { useGetAllUsers } from '@/store/server/features/employees/employeeManagment/queries';
import { useApprovalStore } from '@/store/uistate/features/approval';
import { Form } from 'antd';
import { useEffect } from 'react';

const EditWorkFLow = () => {
  const {
    editModal,
    selectedItem,
    level,
    workflowApplies,
    approverType,
    selections,
    deleteModal,
    deletedApprover,
    setDeleteModal,
    setDeletedApprover,
    setEditModal,
    setLevel,
    setSelections,
  } = useApprovalStore();
  const { data: department } = useGetDepartments();
  const { data: users } = useGetAllUsers();
  const { mutate: EditApprover } = useUpdateAssignedUserMutation();

  const { mutate: deleteApprover } = useDeleteApprover();
  const { mutate: deleteParallelApprover } = useDeleteParallelApprover();

  const [form] = Form.useForm();

  const onClose = () => {
    setEditModal(false);
  };

  const handleUserChange = (value: string, index: number) => {
    const updatedSelections = [...selections.SectionItemType];
    updatedSelections[index] = { ...updatedSelections[index], user: value };
    setSelections({ SectionItemType: updatedSelections });
  };

  const handleSubmit = () => {
    const formValues = form.getFieldsValue();
    const jsonPayload = selections.SectionItemType.flatMap(
      /* eslint-disable-next-line @typescript-eslint/naming-convention */ (
        _,
        idx,
      ) => {
        const approver = selectedItem?.approvers[idx];
        const userIds = formValues[`assignedUser_${idx}`];

        if (Array.isArray(userIds)) {
          return userIds.map((userId) => {
            const app = selectedItem?.approvers?.find(
              (app) =>
                app?.userId === userId && parseInt(app?.stepOrder) == idx + 1,
            );
            return app
              ? { stepOrder: idx + 1, userId, id: app?.id }
              : {
                  stepOrder: idx + 1,
                  userId,
                };
          });
        }
        return [
          {
            id: approver?.id,
            stepOrder: Number(approver?.stepOrder),
            userId: userIds,
          },
        ];
      },
    );

    EditApprover(
      { values: { approvalWorkflowId: selectedItem?.id, steps: jsonPayload } },
      {
        onSuccess: () => {
          setEditModal(false);
        },
      },
    );
  };

  const initialValues = selectedItem?.approvers.reduce(
    (acc: Record<string, any>, item: any, index: number) => {
      if (approverType !== 'Parallel') {
        acc[`assignedUser_${index}`] = item.userId;
        acc[`level_${index}`] = item.stepOrder;
      } else {
        const stepIndex = item.stepOrder - 1;
        if (!acc[`assignedUser_${stepIndex}`]) {
          acc[`assignedUser_${stepIndex}`] = [];
        }
        acc[`assignedUser_${stepIndex}`].push(item.userId);
      }
      return acc;
    },
    {},
  );

  useEffect(() => {
    if (approverType === 'Parallel') {
      if (initialValues && Object.keys(initialValues).length !== level) {
        setLevel(Object.keys(initialValues).length);
      }
    }
  }, [initialValues, level]);

  const handleDeselect = (value: string, index: number) => {
    const user = selectedItem?.approvers?.find(
      (item: any) => item.stepOrder === index + 1 && item.userId === value,
    );
    if (user) {
      deleteParallelApprover(user.id);
    }
  };
  const handleDeleteConfirm = (id: string, workFlowId: string) => {
    const user = selectedItem?.approvers?.find(
      (item: any) => item.userId === id,
    );
    if (user) {
      setDeleteModal(false);
      deleteApprover({
        id: user?.id,
        workFlowId: { approvalWorkflowId: workFlowId },
      });
    }
  };
  return (
    <EditApproverComponent
      editModal={editModal}
      handleSubmit={handleSubmit}
      form={form}
      onClose={onClose}
      customFieldsDrawerHeader={'Edit Approval WorkFLow'}
      selectedItem={selectedItem}
      department={department}
      users={users}
      level={level}
      workflowApplies={workflowApplies}
      initialValues={initialValues}
      approverType={approverType}
      handleUserChange={handleUserChange}
      handleDeselect={handleDeselect}
      handleDeleteConfirm={handleDeleteConfirm}
      deleteModal={deleteModal}
      deletedApprover={deletedApprover}
      setDeleteModal={setDeleteModal}
      setDeletedApprover={setDeletedApprover}
    />
  );
};

export default EditWorkFLow;
