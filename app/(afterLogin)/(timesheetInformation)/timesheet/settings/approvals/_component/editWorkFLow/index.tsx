import CustomDrawerLayout from '@/components/common/customDrawer';
import DeleteModal from '@/components/common/deleteConfirmationModal';
import {
  useDeleteApprover,
  useDeleteParallelApprover,
  useUpdateAssignedUserMutation,
} from '@/store/server/features/approver/mutation';
import { useGetDepartments } from '@/store/server/features/employees/employeeManagment/department/queries';
import { useGetAllUsers } from '@/store/server/features/employees/employeeManagment/queries';
import { useApprovalStore } from '@/store/uistate/features/approval';
import { Button, Form, Input, Radio, Row, Select, Tooltip } from 'antd';
import { useEffect } from 'react';
import { RiDeleteBin6Line } from 'react-icons/ri';

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
  const customFieldsDrawerHeader = 'Edit Approval WorkFLow';

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
    <CustomDrawerLayout
      open={editModal}
      modalHeader={customFieldsDrawerHeader}
      onClose={onClose}
      width="40%"
      footer={null}
    >
      <div className="pb-[60px]">
        <Form
          form={form}
          onFinish={handleSubmit}
          layout="vertical"
          initialValues={{
            workFlownName: selectedItem?.name,
            description: selectedItem?.description,
            workflowAppliesType: selectedItem?.entityType,
            workflowAppliesId: selectedItem?.entityId
              ? selectedItem?.entityType === 'Department'
                ? department?.find(
                    (item: any) => item.id === selectedItem?.entityId,
                  )?.name
                : selectedItem?.entityType === 'Hierarchy'
                  ? department?.find(
                      (item: any) => item.id === selectedItem?.entityId,
                    )?.name
                  : selectedItem?.entityType === 'User'
                    ? users?.items?.find(
                        (item: any) => item.id === selectedItem?.entityId,
                      )?.firstName +
                      '  ' +
                      users?.items?.find(
                        (item: any) => item.id === selectedItem?.entityId,
                      )?.middleName
                    : selectedItem?.entityId
              : '-',

            ...initialValues,
          }}
        >
          <Form.Item
            className="text-lg font-bold mt-3 mb-1"
            name="workFlownName"
            label="WorkFlow Name"
            rules={[
              { required: true, message: 'Please enter a workFlow name!' },
            ]}
          >
            <Input disabled placeholder="Enter WorkFlow Name" />
          </Form.Item>

          <Form.Item
            className="text-lg font-bold mt-3 mb-1"
            name="description"
            label="Description"
            rules={[{ required: true, message: 'Please enter a description!' }]}
          >
            <Input.TextArea placeholder="Enter Description" disabled />
          </Form.Item>

          <Form.Item
            className="text-lg font-bold mt-3"
            name="workflowAppliesType"
            label="Workflow Applies Type"
            rules={[
              { required: true, message: 'Please select a workflow option!' },
            ]}
          >
            <Radio.Group disabled>
              <Radio value="Department">Department</Radio>
              <Radio value="Hierarchy">Hierarchy</Radio>
              <Radio value="User">User</Radio>
            </Radio.Group>
          </Form.Item>

          <Form.Item className="text-lg font-bold" name="workflowAppliesId">
            <Select
              className="min-w-52 mb-1"
              allowClear
              style={{ width: 120 }}
              disabled
              placeholder={`Select ${workflowApplies ? workflowApplies : ''}`}
            />
          </Form.Item>

          {Array.from({ length: level }).map(
            /* eslint-disable-next-line @typescript-eslint/naming-convention */ (
              _,
              index,
            ) => (
              <div key={index} className="px-10 my-1">
                <div>Level: {index + 1}</div>{' '}
                <div className=" flex justify-between items-center">
                  <Form.Item
                    className="font-semibold text-xs"
                    name={`assignedUser_${index}`}
                    label={`Assign User for Level ${index + 1}`}
                    rules={[
                      { required: true, message: 'Please select a user!' },
                    ]}
                  >
                    <Select
                      className="min-w-52 my-3"
                      mode={
                        approverType === 'Parallel' ? 'multiple' : undefined
                      }
                      style={{ width: 120 }}
                      onDeselect={(value) => handleDeselect(value, index)}
                      onChange={(value) =>
                        handleUserChange(value as string, index)
                      }
                      placeholder="Select User"
                      options={users?.items?.map((list: any) => ({
                        value: list?.id,
                        label: `${list?.firstName} ${list?.lastName}`,
                      }))}
                    />
                  </Form.Item>
                  {approverType !== 'Parallel' && (
                    <Tooltip title={'Delete Employee'}>
                      <Button
                        id={`deleteUserButton${index}`}
                        className="bg-red-600 px-[8%] text-white disabled:bg-gray-400"
                        onClick={() => {
                          const userId = form.getFieldValue(
                            `assignedUser_${index}`,
                          );
                          setDeleteModal(true);
                          setDeletedApprover(userId);
                        }}
                      >
                        <RiDeleteBin6Line />
                      </Button>
                    </Tooltip>
                  )}
                </div>
              </div>
            ),
          )}

          <Form.Item>
            <Row className="flex justify-end gap-3">
              <Button type="primary" htmlType="submit">
                Submit
              </Button>
            </Row>
          </Form.Item>
        </Form>
      </div>
      <DeleteModal
        open={deleteModal}
        onConfirm={() => handleDeleteConfirm(deletedApprover, selectedItem?.id)}
        onCancel={() => setDeleteModal(false)}
      />
    </CustomDrawerLayout>
  );
};

export default EditWorkFLow;
