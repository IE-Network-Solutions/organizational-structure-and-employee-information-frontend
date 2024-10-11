'use client';
import { HierarchyList } from '@/store/server/features/approver/interface';
import { useCreateApproverMutation } from '@/store/server/features/approver/mutation';
import { useGetDepartments } from '@/store/server/features/employees/employeeManagment/department/queries';
import { useGetAllUsers } from '@/store/server/features/employees/employeeManagment/queries';
import { useApprovalStore } from '@/store/uistate/features/approval';
import { Select, Button, Form, Row, Input, Radio } from 'antd';
import { RadioChangeEvent } from 'antd/lib';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

const ApprovalSetting: React.FC<any> = () => {
  const { mutate: CreateApprover, isSuccess } = useCreateApproverMutation();
  const { data: department } = useGetDepartments();
  const { data: users } = useGetAllUsers();
  const [form] = Form.useForm();
  const router = useRouter();
  const {
    approverType,
    level,
    setLevel,
    setWorkflowApplies,
    workflowApplies,
    selections,
    setSelections,
  } = useApprovalStore();

  const onRadioChange = (e: RadioChangeEvent) => {
    setWorkflowApplies(e.target.value);
  };

  const handleUserChange = (value: string, index: number) => {
    const updatedSelections = [...selections.SectionItemType];
    updatedSelections[index] = { ...updatedSelections[index], user: value };
    setSelections({ SectionItemType: updatedSelections });
  };

  const handleLevelChange = (value: number) => {
    setLevel(value);
    const updatedSelections = Array.from({ length: value }, (_, index) => {
      return selections.SectionItemType[index] || { user: null };
    });
    setSelections({ SectionItemType: updatedSelections });
  };

  useEffect(() => {
    isSuccess && form.resetFields();
  }, [isSuccess]);

  const handleSubmit = () => {
    const name = form.getFieldValue('workFlownName');
    const description = form.getFieldValue('description');
    const workflowAppliesId = form.getFieldValue('workflowAppliesId');

    const jsonPayload = {
      name: name,
      description: description,
      entityType: workflowApplies,
      entityId: workflowAppliesId,
      approvalType: 'Leave',
      approvalWorkflowType:
        approverType === 'Sequential'
          ? 'Sequential'
          : approverType === 'Parallel'
            ? 'Parallel'
            : approverType === 'Conditional'
              ? 'Range'
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

    CreateApprover(
      { values: jsonPayload },
      {
        onSuccess: () => {
          router.push('/approval/approvalList');
        },
      },
    );
  };

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

  return (
    <div>
      <div className="mb-10">
        <div className="text-2xl font-bold ">
          {approverType === 'Sequential'
            ? 'Leave '
            : approverType === 'Parallel'
              ? 'TNA '
              : approverType === 'Conditional'
                ? 'Purchasing Approval '
                : ' '}
          Approval Setting
        </div>
      </div>

      <Form form={form} onFinish={handleSubmit} layout="vertical">
        <Form.Item
          className="text-lg  font-bold mt-3 mb-1"
          name="workFlownName"
          label="WorkFlow Name"
          rules={[{ required: true, message: 'Please enter a workFlow name!' }]}
        >
          <Input className="w-full h-10" placeholder="Enter WorkFlow Name" />
        </Form.Item>
        <div className="font-medium mb-3 text-gray-500">WorkfLow Name </div>

        <Form.Item
          className="text-lg font-bold mt-3 mb-1"
          name="description"
          label="Description"
          rules={[{ required: true, message: 'Please enter a description!' }]}
        >
          <Input.TextArea placeholder="Enter Description" />
        </Form.Item>

        <Form.Item
          className="text-lg font-bold mt-3"
          name="workflowAppliesType"
          label="Workflow Applies Type"
          rules={[
            { required: true, message: 'Please select a workflow option!' },
          ]}
        >
          <Radio.Group onChange={onRadioChange}>
            <Radio value={'Department'}>Department</Radio>
            <Radio value={'Hierarchy'}>Hierarchy</Radio>
            <Radio value={'User'}>User</Radio>
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
        >
          <Select
            className="w-full h-10 mb-1"
            allowClear
            style={{ width: 120 }}
            placeholder={`Select ${workflowApplies ? workflowApplies : ''} `}
            options={(() => {
              if (workflowApplies === 'Department') {
                return (
                  department?.map((list: any) => ({
                    value: list?.id,
                    label: list?.name,
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
                  users?.items?.map((list: any) => ({
                    value: list?.id,
                    label: `${list?.firstName} ${list?.lastName}`,
                  })) || []
                );
              } else {
                return [];
              }
            })()}
          />
        </Form.Item>
        <div className="font-medium mb-3 text-gray-500">
          Select to which {workflowApplies} this workflow applies to.
        </div>
        <div className="my-3">
          <div className="text-lg font-bold ">Level</div>
          <Select
            className="w-full h-10 m-1"
            style={{ width: 120 }}
            onChange={handleLevelChange}
            defaultValue={1}
            placeholder="Select Levels"
            options={Array.from({ length: 9 }, (_, i) => ({
              value: i + 1,
              label: `${i + 1}`,
            }))}
          />

          <div className="font-medium mb-3 text-gray-500">
            This is the specific approval stage or level within the process
          </div>
        </div>

        {Array.from({ length: level }).map((_, index) => (
          <div key={index} className="px-10 my-1">
            <div>Level: {index + 1}</div>
            <Form.Item
              className="font-semibold text-xs"
              name={`assignedUser_${index}`}
              label={`Assign User `}
              rules={[{ required: true, message: 'Please select a user!' }]}
            >
              <Select
                className="w-full h-10 my-3"
                allowClear
                mode={approverType === 'Parallel' ? 'multiple' : undefined}
                style={{ width: 120 }}
                onChange={(value) => handleUserChange(value as string, index)}
                placeholder="Select User"
                options={users?.items?.map((list: any) => ({
                  value: list?.id,
                  label: `${list?.firstName} ${list?.lastName}`,
                }))}
              />
            </Form.Item>
          </div>
        ))}

        <Form.Item>
          <Row className="flex justify-end gap-3">
            <Button type="primary" htmlType="submit">
              Submit
            </Button>
          </Row>
        </Form.Item>
      </Form>
    </div>
  );
};

export default ApprovalSetting;
