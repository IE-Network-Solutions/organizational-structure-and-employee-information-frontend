import React from 'react';
import { Button, Card, Col, Form, Input, Popconfirm, Row, Select } from 'antd';
import CustomDrawerLayout from '@/components/common/customDrawer';
import { FaPlus } from 'react-icons/fa';
import { useOrganizationalDevelopment } from '@/store/uistate/features/organizationalDevelopment';
import { useCreateActionPlan } from '@/store/server/features/organization-development/categories/mutation';
import { DataItem } from '@/store/server/features/organization-development/categories/interface';
import { useGetAllUsers } from '@/store/server/features/employees/employeeManagment/queries';
import { TiDeleteOutline } from 'react-icons/ti';

const { Option } = Select;

const CreateActionPlan = (props: any) => {
  const [form] = Form.useForm();
  const { numberOfActionPlan, setNumberOfActionPlan, open, setOpen } =
    useOrganizationalDevelopment();
  const { mutate: createActionPlanData, isLoading } = useCreateActionPlan();
  const { data: employeeData, isLoading: userLoading } = useGetAllUsers();
  // const {data:actionPlanData}=useGetAllActionPlan("8aa45ab7-87e9-4d12-bb1b-fa613cf91411");

  const modalHeader = (
    <div className="flex justify-center text-xl font-extrabold text-gray-800 p-4">
      Add New Action Plan
    </div>
  );

  const plusOnClickHandler = () => {
    setNumberOfActionPlan(numberOfActionPlan + 1);
  };
  const handleCancel = () => {
    form.resetFields();
    setOpen(false);
    setNumberOfActionPlan(1);
  };
  const handleCreateActionPlan = (values: DataItem[]) => {
    const arrayOfObjects = Object.keys(values).map((key: any) => values[key]);
    createActionPlanData(arrayOfObjects, {
      onSuccess: () => {
        form.resetFields();
        setOpen(false);
      },
    });
  };

  return (
    open && (
      <CustomDrawerLayout
        open={open}
        onClose={props?.onClose}
        modalHeader={modalHeader}
        width="40%"
      >
        <Form
          form={form}
          name="dependencies"
          autoComplete="off"
          style={{ maxWidth: '100%' }}
          layout="vertical"
          onFinish={handleCreateActionPlan}
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
                    name={[`${index}`, 'actionToBeTaken']}
                    label={`Action plan ${index + 1}`}
                    id={`actionPlanId${index + 1}`}
                    rules={[
                      { required: true, message: 'action title is required' },
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
                    name={[`${index}`, 'description']}
                    label={`Description`}
                    id={`actionPlanDescription${index + 1}`}
                    rules={[
                      { required: true, message: 'description is required' },
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
                    name={[`${index}`, 'responsiblePerson']}
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
                      loading={userLoading}
                      className="w-full my-4"
                    >
                      {employeeData?.items?.map((item: any) => (
                        <Option key="active" value={item.id}>
                          <div className="flex space-x-3 p-1 rounded">
                            <img
                              src={`${item?.profileImage}`}
                              alt="pep"
                              className="rounded-full w-4 h-4 mt-2"
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
              <Row gutter={16}>
                <Col xs={24} sm={24}>
                  <Form.Item
                    className="font-semibold text-xs"
                    name={[`${index}`, 'status']}
                    label={`Status`}
                    id={`statusId${index + 1}`}
                    rules={[
                      {
                        required: true,
                        message: 'Status required',
                      },
                    ]}
                  >
                    <Select
                      id={`selectStatusChartType`}
                      placeholder="select status"
                      allowClear
                      className="w-full my-4"
                    >
                      <Option key="active" value={'pending'}>
                        Pending
                      </Option>
                      <Option key="active" value={'solved'}>
                        Solved
                      </Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
            </Card>
          ))}
          <Row gutter={16} className="my-5">
            <Col className="flex justify-center" xs={24} sm={24}>
              <Button type="primary" onClick={plusOnClickHandler}>
                <FaPlus />
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
                loading={isLoading}
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
      </CustomDrawerLayout>
    )
  );
};

export default CreateActionPlan;
