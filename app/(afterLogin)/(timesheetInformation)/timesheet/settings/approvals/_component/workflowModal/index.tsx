import {
  useCreateApproverMutation,
  useDeleteApprovalWorkFLow,
} from '@/store/server/features/approver/mutation';
import { useApprovalStore } from '@/store/uistate/features/approval';
import { Button, Form, Input, Modal, Radio, Row, Select } from 'antd';
import { FaRegCircle } from 'react-icons/fa';
import { APPROVALTYPES } from '@/types/enumTypes';
import { RadioChangeEvent } from 'antd/lib';
import { useGetDepartments } from '@/store/server/features/employees/employeeManagment/department/queries';
import { HierarchyList } from '@/store/server/features/approver/interface';
import { useGetAllUsers } from '@/store/server/features/employees/employeeManagment/queries';
import { useEffect } from 'react';
import { useGetAllApprovalWorkflow } from '@/store/server/features/approver/queries';

interface Department {
  id: string;
  name: string;
}

interface User {
  id: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
}

const WorkflowModal = ({
  open,
  onCancel,
  onChange,
  currentWorkFlow,
}: {
  open: boolean;
  onCancel: () => void;
  onChange: (a: string) => void;
  currentWorkFlow: string;
}) => {
  const HierarchyList: HierarchyList[] = [
    {
      id: '1',
      name: 'CEO',
    },
    {
      id: '2',
      name: 'CXO',
    },
    {
      id: '3',
      name: 'Manager',
    },
    {
      id: '4',
      name: 'Team Leader',
    },
    {
      id: '5',
      name: 'Senior Developer',
    },
    {
      id: '6',
      name: 'Junior Developer',
    },
    {
      id: '7',
      name: 'Intern',
    },
  ];
  const {
    approverType,
    level,
    setLevel,
    setWorkflowApplies,
    workflowApplies,
    selections,
    setSelections,
    workflowUserId,
    setWorkflowUserId,
    setDepartmentApproval,
    setAddDepartmentApproval,
    setIsCreated,
  } = useApprovalStore();

  const isSequentialSelected = approverType === 'Sequential';
  const isParallelSelected = approverType === 'Parallel';
  const isConditionalSelected = approverType === 'Conditional';
  const { mutate: CreateApprover } = useCreateApproverMutation();
  const { data: department } = useGetDepartments();
  const { data: users } = useGetAllUsers();
  const { data: approvalWorkflowData } = useGetAllApprovalWorkflow();
  const { mutate: deleteWorkflow } = useDeleteApprovalWorkFLow();

  const [form] = Form.useForm();

  // Populate form when modal opens with current workflow data
  useEffect(() => {
    if (open && currentWorkFlow && workflowApplies) {
      // Find the current workflow to get entityId
      const currentWorkflow = approvalWorkflowData?.items?.find(
        (item: any) => item.id === currentWorkFlow,
      );

      if (currentWorkflow) {
        // Set the form fields
        const formValues: any = {
          workflowAppliesType: workflowApplies,
        };

        // Set the workflowAppliesId field if entityId exists
        if (currentWorkflow.entityId) {
          formValues.workflowAppliesId = currentWorkflow.entityId;
          setWorkflowUserId(currentWorkflow.entityId);
        }

        form.setFieldsValue(formValues);
      }
    }
  }, [
    open,
    currentWorkFlow,
    workflowApplies,
    approvalWorkflowData,
    form,
    setWorkflowUserId,
  ]);

  const createFlag = () => {
    setIsCreated(true);
  };

  const handleSubmit = () => {
    const name = form.getFieldValue('workFlownName');
    const description = form.getFieldValue('description');
    const workflowAppliesId = form.getFieldValue('workflowAppliesId');

    const jsonPayload = {
      name: name,
      description: description,
      entityType: workflowApplies,
      entityId: workflowAppliesId,
      approvalType: APPROVALTYPES.LEAVE,
      approvalWorkflowType:
        approverType === 'Sequential'
          ? 'Sequential'
          : approverType === 'Parallel'
            ? 'Parallel'
            : approverType === 'Conditional'
              ? '  '
              : ' ',
      steps: selections.SectionItemType.flatMap((selection, idx) => {
        const users = Array.isArray(selection.user)
          ? selection.user
          : [selection.user];
        return users.map((userId) => ({
          stepOrder: idx + 1,
          userId: userId,
        }));
      }),
    };

    setAddDepartmentApproval(false);
    setDepartmentApproval(false);

    deleteWorkflow(currentWorkFlow, {
      onSuccess: () => {
        CreateApprover(
          { values: jsonPayload },
          {
            onSuccess: () => {
              setAddDepartmentApproval(false);
              setDepartmentApproval(false);
              onCancel();
            },
          },
        );
      },
    });
  };

  const onRadioChange = (e: RadioChangeEvent) => {
    setWorkflowApplies(e.target.value);
    form.setFieldsValue({ workflowAppliesId: null });
    setWorkflowUserId(null);
  };

  const handleWorkflowUserChange = (value: string) => {
    setWorkflowUserId(value);
  };

  const handleLevelChange = (value: number) => {
    setLevel(value);
    const updatedSelections = Array.from(
      { length: value },
      /* eslint-disable-next-line @typescript-eslint/naming-convention */ (
        _,
        index,
      ) => {
        return selections.SectionItemType[index] || { user: null };
      },
    );
    setSelections({ SectionItemType: updatedSelections });
  };

  const handleUserChange = (value: string, index: number) => {
    const updatedSelections = [...selections.SectionItemType];
    updatedSelections[index] = { ...updatedSelections[index], user: value };
    setSelections({ SectionItemType: updatedSelections });
  };

  const handleWorkflowModalCancel = () => {
    onCancel();
    form.resetFields();
    setDepartmentApproval(false);
  };

  return (
    <Modal
      open={open}
      onCancel={handleWorkflowModalCancel}
      title={
        <p className="text-xl font-semibold">
          In order to remove this workflow you have to transfer this workflow to
          another workflow
        </p>
      }
      footer={null}
      centered
      width={930}
      data-cy="approval-workflow-modal"
    >
      <Form form={form} onFinish={handleSubmit} layout="vertical">
        <Form.Item
          className="text-lg  font-bold mt-3 mb-1"
          name="workFlownName"
          rules={[{ required: true }]}
          label="Choose Approval Type"
          data-cy="approval-workflow-name"
          id="approval-workflow-name"
        >
          <div
            className="flex flex-col md:flex-row md:justify-between gap-4"
            data-cy="approval-workflow-type"
            id="approval-workflow-type"
          >
            <div
              className="flex flex-col gap-1"
              data-cy="approval-workflow-type-sequential"
              id="approval-workflow-type-sequential"
            >
              <Button
                data-cy="approval-workflow-type-sequential-button"
                id="approval-workflow-type-sequential-button"
                className={`py-5 text-lg gap-1 w-full flex justify-between px-5 rounded-lg ${
                  isSequentialSelected
                    ? 'border-2 border-green-500 bg-white'
                    : 'border border-gray-200 bg-white'
                }`}
                onClick={() => onChange('Sequential')}
              >
                Sequential Approval
                {isSequentialSelected ? (
                  <FaRegCircle
                    className="w-5 h-5 text-blue-600"
                    style={{
                      fill: 'white',
                      stroke: 'currentColor',
                      strokeWidth: '2',
                    }}
                  />
                ) : (
                  <FaRegCircle className="w-5 h-5 text-gray-400" />
                )}
              </Button>
            </div>
            <div
              className="flex flex-col gap-1"
              data-cy="approval-workflow-type-parallel"
              id="approval-workflow-type-parallel"
            >
              <Button
                data-cy="approval-workflow-type-parallel-button"
                id="approval-workflow-type-parallel-button"
                className={`py-5 text-lg gap-1 w-full flex justify-between px-5 rounded-lg ${
                  isParallelSelected
                    ? 'border-2 border-green-500 bg-white'
                    : 'border border-gray-200 bg-white'
                }`}
                onClick={() => onChange('Parallel')}
              >
                Parallel Approval
                {isParallelSelected ? (
                  <FaRegCircle
                    className="w-5 h-5 text-blue-600"
                    style={{
                      fill: 'white',
                      stroke: 'currentColor',
                      strokeWidth: '2',
                    }}
                  />
                ) : (
                  <FaRegCircle className="w-5 h-5 text-gray-400" />
                )}
              </Button>
            </div>
            <div
              className="flex flex-col gap-1 opacity-60 cursor-not-allowed"
              data-cy="approval-workflow-conditional"
              id="approval-workflow-conditional"
            >
              <Button
                data-cy="approval-workflow-conditional-button"
                id="approval-workflow-conditional-button"
                disabled
                className={`py-5 text-lg gap-1 w-full flex justify-between px-5 rounded-lg ${
                  isConditionalSelected
                    ? 'border-2 border-green-500 bg-white'
                    : 'border border-gray-200 bg-white'
                }`}
                onClick={() => onChange('Conditional')}
              >
                Conditional Approval
                {isConditionalSelected ? (
                  <FaRegCircle
                    className="w-5 h-5 text-blue-600"
                    style={{
                      fill: 'white',
                      stroke: 'currentColor',
                      strokeWidth: '2',
                    }}
                  />
                ) : (
                  <FaRegCircle className="w-5 h-5 text-gray-400" />
                )}
              </Button>
            </div>
          </div>
        </Form.Item>
        <Form.Item
          className="text-lg  font-bold mt-3 mb-1"
          name="workFlownName"
          label="WorkFlow Name"
          rules={[{ required: true, message: 'Please enter a workFlow name!' }]}
          data-cy="approval-workflow-name"
          id="approval-workflow-name"
        >
          <Input
            data-cy="approval-workflow-name-input"
            id="approval-workflow-name-input"
            className="w-full h-10"
            placeholder="Enter WorkFlow Name"
          />
        </Form.Item>
        <div
          data-cy="approval-workflow-name-label"
          id="approval-workflow-name-label"
          className="font-medium mb-3 text-gray-500"
        >
          WorkfLow Name
        </div>

        <Form.Item
          className="text-lg font-bold mt-3 mb-1"
          name="description"
          label="Description"
          rules={[{ required: true, message: 'Please enter a description!' }]}
          data-cy="approval-workflow-description"
          id="approval-workflow-description"
        >
          <Input.TextArea
            data-cy="approval-workflow-description-input"
            id="approval-workflow-description-input"
            placeholder="Enter Description"
          />
        </Form.Item>

        <Form.Item
          className="text-lg font-bold mt-3"
          name="workflowAppliesType"
          label="Workflow Applies Type"
          rules={[
            { required: true, message: 'Please select a workflow option!' },
          ]}
          data-cy="approval-workflow-applies-type"
          id="approval-workflow-applies-type"
        >
          <Radio.Group onChange={onRadioChange} value={workflowApplies}>
            <Radio
              data-cy="approval-workflow-applies-type-department"
              id="approval-workflow-applies-type-department"
              value={'Department'}
            >
              Department
            </Radio>
            <Radio
              data-cy="approval-workflow-applies-type-hierarchy"
              id="approval-workflow-applies-type-hierarchy"
              disabled
              value={'Hierarchy'}
            >
              Hierarchy
            </Radio>
            <Radio
              data-cy="approval-workflow-applies-type-user"
              id="approval-workflow-applies-type-user"
              value={'User'}
            >
              User
            </Radio>
          </Radio.Group>
        </Form.Item>

        <Form.Item
          className="text-lg font-bold"
          name="workflowAppliesId"
          rules={[
            {
              required: true,
              message: `Please select ${workflowApplies ? workflowApplies : ''}!`,
            },
          ]}
          data-cy="approval-workflow-applies-id"
          id="approval-workflow-applies-id"
        >
          <Select
            disabled={
              workflowApplies === 'Department' ||
              workflowApplies === 'Hierarchy' ||
              workflowApplies === 'User'
            }
            data-cy="approval-workflow-applies-id-select"
            id="approval-workflow-applies-id-select"
            className="w-full h-10 mb-1"
            allowClear
            showSearch
            optionFilterProp="label"
            style={{ width: 120 }}
            placeholder={`Select ${workflowApplies ? workflowApplies : ''} `}
            onChange={handleWorkflowUserChange}
            options={(() => {
              if (workflowApplies === 'Department') {
                return (
                  department?.map((list: Department) => ({
                    value: list.id,
                    label: list.name,
                  })) || []
                );
              } else if (workflowApplies === 'Hierarchy') {
                return (
                  HierarchyList.map((list) => ({
                    value: list.name,
                    label: list.name,
                  })) || []
                );
              } else if (workflowApplies === 'User') {
                return (
                  users?.items?.map((list: User) => ({
                    value: list.id,
                    label:
                      `${list.firstName ? list.firstName : ''} ${list.middleName ? list.middleName : ''} ${list.lastName ? list.lastName : ''}`.trim(),
                  })) || []
                );
              } else {
                return [];
              }
            })()}
          />
        </Form.Item>
        <div
          data-cy="approval-workflow-applies-id-label"
          id="approval-workflow-applies-id-label"
          className="font-medium mb-3 text-gray-500"
        >
          Select to which {workflowApplies} this workflow applies to.
        </div>
        <div
          data-cy="approval-workflow-number-of-level-label"
          id="approval-workflow-number-of-level-label"
          className="my-3"
        >
          <div
            data-cy="approval-workflow-number-of-level-label-text"
            id="approval-workflow-number-of-level-label-text"
            className="text-lg font-bold "
          >
            Number Of Level
          </div>
          <Select
            data-cy="approval-workflow-number-of-level-select"
            id="approval-workflow-number-of-level-select"
            showSearch
            optionFilterProp="label"
            className="w-full h-10 m-1"
            style={{ width: 120 }}
            onChange={handleLevelChange}
            defaultValue={1}
            placeholder="Select Levels"
            options={Array.from(
              { length: 9 },
              /* eslint-disable-next-line @typescript-eslint/naming-convention */ (
                _,
                i,
              ) => ({
                value: i + 1,
                label: `${i + 1}`,
              }),
            )}
          />

          <div
            data-cy="approval-workflow-number-of-level-label-text"
            id="approval-workflow-number-of-level-label-text"
            className="font-medium mb-3 text-gray-500"
          >
            Select Number of specific approval stage or level within the process
          </div>
        </div>

        {Array.from({ length: level }).map(
          /* eslint-disable-next-line @typescript-eslint/naming-convention */ (
            _,
            index,
          ) => (
            <div
              data-cy="approval-workflow-level"
              id="approval-workflow-level"
              key={index}
              className="px-10 my-1"
            >
              <div>Level: {index + 1}</div>
              <Form.Item
                data-cy="approval-workflow-assigned-user"
                id="approval-workflow-assigned-user"
                className="font-semibold text-xs"
                name={`assignedUser_${index}`}
                label={`Assign User `}
                rules={[
                  { required: true, message: 'Please select a user!' },
                  {
                    /* eslint-disable-next-line @typescript-eslint/naming-convention */
                    validator: (_, value) => {
                      /* eslint-enable @typescript-eslint/naming-convention */

                      if (
                        workflowApplies === 'User' &&
                        value === workflowUserId
                      ) {
                        return Promise.reject(
                          'Cannot select the same user as both workflow target and approver',
                        );
                      }
                      return Promise.resolve();
                    },
                  },
                ]}
              >
                <Select
                  data-cy="approval-workflow-assigned-user-select"
                  id="approval-workflow-assigned-user-select"
                  className="w-full  my-3"
                  allowClear
                  showSearch
                  optionFilterProp="label"
                  mode={approverType === 'Parallel' ? 'multiple' : undefined}
                  style={{ width: 120 }}
                  onChange={(value) => handleUserChange(value as string, index)}
                  placeholder="Select User"
                  options={users?.items
                    ?.filter(
                      (user: User) =>
                        workflowApplies !== 'User' ||
                        user.id !== workflowUserId,
                    )
                    ?.map((list: User) => ({
                      value: list.id,
                      label:
                        `${list.firstName ? list.firstName : ''} ${list.middleName ? list.middleName : ''} ${list.lastName ? list.lastName : ''}`.trim(),
                    }))}
                />
              </Form.Item>
            </div>
          ),
        )}

        <Form.Item
          data-cy="approval-workflow-submit-button"
          id="approval-workflow-submit-button"
        >
          <Row
            data-cy="approval-workflow-submit-button-row"
            id="approval-workflow-submit-button-row"
            className="flex justify-end gap-3"
          >
            <Button
              data-cy="approval-workflow-submit-button"
              id="approval-workflow-submit-button"
              type="primary"
              htmlType="submit"
              onClick={createFlag}
            >
              Submit
            </Button>
          </Row>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default WorkflowModal;
