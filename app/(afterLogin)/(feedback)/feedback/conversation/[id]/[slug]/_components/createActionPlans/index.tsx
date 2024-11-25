import { useGetAllUsers } from '@/store/server/features/employees/employeeManagment/queries';
import { useOrganizationalDevelopment } from '@/store/uistate/features/organizationalDevelopment';
import { Avatar, Button, Card, Col, DatePicker, Form, Input, Popconfirm, Row, Select } from 'antd'
import { useForm } from 'antd/es/form/Form'
import Image from 'next/image';
import React from 'react'
import { FaPlus } from 'react-icons/fa';
import { TiDeleteOutline } from 'react-icons/ti';
const { Option } = Select;

interface PropsData {
  slug: string;
  onFinish: (data: any) => void;
}

const CreateActionPlans: React.FC<PropsData> = ({ slug, onFinish }) => {
    const { data: allUserData,isLoading:userDataLoading } =useGetAllUsers();
    const { setOpen,open } = useOrganizationalDevelopment();

    const [form2]=useForm();
    const {
        numberOfActionPlan,
        setNumberOfActionPlan,
        setSelectedEditActionPlan,
        } = useOrganizationalDevelopment();

        const plusOnClickHandler = () => {
            setNumberOfActionPlan(numberOfActionPlan + 1);
          };
          const handleCancel = () => {
            form2.resetFields();
            setOpen(false);
            setSelectedEditActionPlan(null);
            setNumberOfActionPlan(1);
          };
  return (
  <Form
    form={form2}
    name="dependencies"
    autoComplete="off"
    style={{ maxWidth: '100%' }}
    layout="vertical"
    onFinish={onFinish}
  >
    {/* eslint-disable @typescript-eslint/naming-convention  */}

        <Form.Item
          name='conversationInstanceId' // Use `name` instead of `id` for form binding
          initialValue={slug} // Set the initial value of the input field
          hidden // Hide the Form.Item and its input field
        >
          <Input />
        </Form.Item>
        <Row gutter={16}>
          <Col xs={24} sm={24}>
            <Form.Item
              className="font-semibold text-xs"
              name='issue'
              label='Action plan'
              id='actionPlanId'
              rules={[
                { required: true, message: 'action title is required' },
                {
                  max: 40, // Set the maximum number of characters allowed
                  message: 'Action title cannot exceed 40 characters',
                },
              ]}
            >
              <Input />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col xs={24} sm={24}>
            <Form.Item
              className="font-semibold text-xs"
              name='comment'
              label={`Comment`}
              id={`actionPlanDescription`}
              rules={[
                { required: true, message: 'Comment is required' },
                {
                  max: 40, // Set the maximum number of characters allowed
                  message: 'Comment cannot exceed 40 characters',
                },
              ]}
            >
              <Input.TextArea rows={6} />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col xs={24} sm={24}>
            <Form.Item
              className="font-semibold text-xs"
              name='assigneeId'
              label={`Responsible Person`}
              id={`responsiblePersonId`}
              rules={[
                {
                  required: true,
                  message: 'Responsible Person is required',
                },
              ]}
            >
              <Select
                id={`selectStatusChartType`}
                placeholder="Responsible Person"
                allowClear
                loading={userDataLoading}
                className="w-full my-4"
              >
                {allUserData?.items?.map((item: any) => (
                  <Option key="active" value={item.id}>
                    <div className="flex space-x-3 p-1 rounded">
                      <Image
                        src={item?.profileImage ?? Avatar}
                        alt="pep"
                        className="rounded-full w-4 h-4 mt-2"
                        width={15}
                        height={15}
                      />
                      <span className="flex justify-center items-center">
                        {item?.firstName + ' ' + ' ' + item?.middleName}
                      </span>
                    </div>
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16} align="middle" justify="start">
        <Col xs={24} sm={10}>
          <Form.Item
            className="font-semibold text-xs w-full"
            name='status'
            label="Status"
            id={`statusId`}
            rules={[
              {
                required: true,
                message: 'Status is required',
              },
            ]}
          >
            <Select
              id="selectStatusChartType"
              placeholder="Select status"
              allowClear
              className="w-full"
            >
              <Option key="pending" value="pending">
                Pending
              </Option>
              <Option key="solved" value="solved">
                Solved
              </Option>
            </Select>
          </Form.Item>
        </Col>
        <Col xs={24} sm={12}>
          <Form.Item
            className="font-semibold text-xs w-full"
            name='deadline'
            label={`Deadline`}
            id={`deadlineActionId`}
            rules={[
              { required: true, message: 'Deadline is required' },
            ]}
          >
            <DatePicker className="w-full" />
          </Form.Item>
        </Col>
      </Row>
    <Row gutter={16}>
      <Col xs={24} sm={12} className="flex justify-end">
        <Popconfirm
          title="reset all you filled"
          description="Are you sure to reset all fields value ?"
          onConfirm={handleCancel}
          okText="Yes"
          cancelText="No"
        >
          <Button name="cancelSidebarButtonId" className="p-4" danger>
            Cancel
          </Button>
        </Popconfirm>
      </Col>
      <Col xs={24} sm={12}>
        <Button
          // loading={isLoading}
          htmlType="submit"
          name="createActionButton"
          id="createActionButtonId"
          className="px-6 py-3 text-xs font-bold"
          type="primary"
        >
          Create
        </Button>
      </Col>
    </Row>
  </Form>
  )
}

export default CreateActionPlans