'use client';
import { useApprovalStore } from '@/store/uistate/features/approval';
import React, { useEffect } from 'react';
import { useGetDepartments } from '@/store/server/features/employees/employeeManagment/department/queries';
import { useGetAllUsers } from '@/store/server/features/employees/employeeManagment/queries';
import { Select, Button, Form, Row, Input, Radio } from 'antd';
import { RadioChangeEvent } from 'antd/lib';
import { HierarchyList } from '@/store/server/features/approver/interface';

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

const ApprovalWorkFlowSettingComponent = ({
  handleSubmit,
  isSuccess,
  form,
  title,
}: {
  handleSubmit: (a: string) => void;
  isSuccess: boolean;
  form: any;
  title?: string;
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
  useEffect(() => {
    isSuccess && form.resetFields();
  }, [isSuccess]);

  const { data: department } = useGetDepartments();
  const { data: users } = useGetAllUsers();
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
  } = useApprovalStore();

  const onRadioChange = (e: RadioChangeEvent) => {
    setWorkflowApplies(e.target.value);
    form.setFieldsValue({ workflowAppliesId: null });
    setWorkflowUserId(null);
  };

  const handleWorkflowUserChange = (value: string) => {
    setWorkflowUserId(value);
  };

  const handleUserChange = (value: string, index: number) => {
    const updatedSelections = [...selections.SectionItemType];
    updatedSelections[index] = { ...updatedSelections[index], user: value };
    setSelections({ SectionItemType: updatedSelections });
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
  return (
    <div>
      <div className="mb-10">
        <div className="text-2xl font-bold ">
          {title
            ? title
            : approverType === 'Sequential'
              ? 'Sequential '
              : approverType === 'Parallel'
                ? 'Parallel '
                : approverType === 'Conditional'
                  ? 'Conditional '
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
            <Radio disabled value={'Hierarchy'}>
              Hierarchy
            </Radio>
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
        <div className="font-medium mb-3 text-gray-500">
          Select to which {workflowApplies} this workflow applies to.
        </div>
        <div className="my-3">
          <div className="text-lg font-bold ">Number Of Level</div>
          <Select
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

          <div className="font-medium mb-3 text-gray-500">
            Select Number of specific approval stage or level within the process
          </div>
        </div>

        {Array.from({ length: level }).map(
          /* eslint-disable-next-line @typescript-eslint/naming-convention */ (
            _,
            index,
          ) => (
            <div key={index} className="px-10 my-1">
              <div>Level: {index + 1}</div>
              <Form.Item
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

export default ApprovalWorkFlowSettingComponent;
