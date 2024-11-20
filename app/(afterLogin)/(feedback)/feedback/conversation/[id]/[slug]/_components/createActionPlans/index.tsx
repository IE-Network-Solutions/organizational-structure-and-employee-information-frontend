import { useGetAllUsers } from '@/store/server/features/employees/employeeManagment/queries';
import { useOrganizationalDevelopment } from '@/store/uistate/features/organizationalDevelopment';
import { Avatar, Button, Card, Col, DatePicker, Form, Input, Popconfirm, Row, Select } from 'antd'
import { useForm } from 'antd/es/form/Form'
import Image from 'next/image';
import React from 'react'
import { FaPlus } from 'react-icons/fa';
import { TiDeleteOutline } from 'react-icons/ti';
const { Option } = Select;
function Page({onFinish}:{onFinish:(data:any)=>void}) {
    const { data: allUserData,isLoading:userDataLoading } =useGetAllUsers();
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
            // form1.resetFields();
            // setOpen(false);
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
    {Array.from({ length: numberOfActionPlan }, (__, index) => (
      <Card
        key={index}
        title={
          <div
            className="flex justify-end text-red-600 cursor-pointer"
            onClick={() => setNumberOfActionPlan(numberOfActionPlan - 1)}
          >
            <TiDeleteOutline />
          </div>
        }
      >
        <Row gutter={16}>
          <Col xs={24} sm={24}>
            <Form.Item
              className="font-semibold text-xs"
              name={[`${index}`, 'issue']}
              label={`Action plan ${index + 1}`}
              id={`actionPlanId${index + 1}`}
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
              name={[`${index}`, 'comment']}
              label={`Comment`}
              id={`actionPlanDescription${index + 1}`}
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
              name={[`${index}`, 'assigneeId']}
              label={`Responsible Person`}
              id={`responsiblePersonId${index + 1}`}
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
            name={[`${index}`, 'status']}
            label="Status"
            id={`statusId${index + 1}`}
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
            name={[`${index}`, 'Deadline']}
            label={`Deadline ${index + 1}`}
            id={`deadlineActionId${index + 1}`}
            rules={[
              { required: true, message: 'Deadline is required' },
            ]}
          >
            <DatePicker className="w-full" />
          </Form.Item>
        </Col>
      </Row>

      </Card>
    ))}
    <Row gutter={16} className="my-5">
      <Col className="flex justify-center" xs={24} sm={24}>
        <Button type="primary" className='text-xs px-8 text-white' onClick={plusOnClickHandler}>
          <FaPlus  />
        </Button>
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

export default Page