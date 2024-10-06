import React, { useState } from 'react';
import { Button, Card, Col, Tag, Form, Input, Popconfirm, Row, Select } from 'antd';
import { FaPlus } from 'react-icons/fa';
import CustomDrawerLayout from '@/components/common/customDrawer';
import { validateName } from '@/utils/validation';
import { DataItem } from '@/store/server/features/organization-development/categories/interface';
import { useCreateCriticalPosition } from '@/store/server/features/organization-development/SuccessionPlan/mutation';
import { useOrganizationalDevelopment } from '@/store/uistate/features/organizationalDevelopment';
import Stepper from '@/components/common/stepper';
const { Option } = Select;
const CreateCriticalPostion = (props: any) => {
  const [form] = Form.useForm();
  const {
    setCurrent,
    numberOfRoleResponseblity,
    setNumberOfRoleResponseblity,
    current,
    open,
    setOpen,
  } = useOrganizationalDevelopment();
  const { mutate: createCriticalPosition, isLoading } =
    useCreateCriticalPosition();
  const modalHeader = (
    <div className="flex justify-center text-xl font-extrabold text-gray-800 p-4">
      Critical Position
    </div>
  );

  const [responsibilities, setResponsibilities] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState('');

  // Handle adding new responsibility
  const addResponsibility = () => {
    if (inputValue.trim() !== '') {
      setResponsibilities([...responsibilities, inputValue]);
      setInputValue('');  // Clear input after adding
    }
  };

  // Handle removing responsibility
  const removeResponsibility = (removedResponsibility: string) => {
    setResponsibilities(responsibilities.filter((responsibility) => responsibility != removedResponsibility));
  };

  const handleCancel = () => {
    form.resetFields();
    setOpen(false);
    setResponsibilities([]);
  };
  //This function needs to be updated by the new mutation function i am about to create for succession.
  const handleCreateActionPlan = (values: any) => {
    console.log("Form values::::::::",{...values, responsibilities});
    // createCriticalPosition({ values: values });
  };
  return (
    open && (
      <CustomDrawerLayout
        open={open}
        onClose={props?.onClose}
        modalHeader={modalHeader}
        width="40%"
      >
        <Stepper numberOfSteps={2} setCurrent={setCurrent} current={current} />
        <Form
          form={form}
          name="dependencies"
          autoComplete="off"
          style={{ maxWidth: '100%' }}
          layout="vertical"
          onFinish={handleCreateActionPlan}
        >
          <Card hidden={current !== 0}>
            <Row gutter={16}>
              <Col xs={24} sm={24}>
                <Form.Item
                  className="font-semibold text-xs"
                  name="criticalPositionName"
                  label="Critical Position Name"
                >
                  <Input placeholder={'Enter Name'} className="mt-4" />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col xs={24} sm={24}>
                <Form.Item
                  className="font-semibold text-xs"
                  name={'jobTitle'}
                  label={"Job Title"}
                >
                  <Select
                    id={`selectStatusChartType`}
                    placeholder="Select Job Title"
                    allowClear
                    className="w-full h-[48px] my-4"
                  >
                    <Option key="active" value={'pieChart'}>
                      Job 1
                    </Option>
                    <Option key="inactive" value={'lineGraph'}>
                      Job 2
                    </Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col xs={24} sm={24}>
                <Form.Item
                  className="font-semibold text-xs"
                  name="aboutTheRole"
                  label={"About the role"}
                >
                  <Input.TextArea placeholder={'Enter Role Discription'} className="mt-4" rows={6} />
                </Form.Item>
              </Col>
            </Row>
          </Card>
          <Card hidden={current !== 1}>
            <Row gutter={16}>
              <Col xs={24} sm={24}>
                <Form.Item
                  className="font-semibold text-xs"
                  name="requiredSkills"
                  label="Required Skills/Criterias"
                >
                  <Select
                    mode="tags"
                    className='mt-4'
                    style={{ width: '100%' }}
                    placeholder="Enter skills"
                    tokenSeparators={[',']}
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col xs={24} sm={24}>
                <Form.Item
                  className="font-semibold text-xs"
                  name="requiredExperiance"
                  label="Required Experiance"
                  rules={[
                    {
                      validator: (rule, value) => {
                        if (value < 0) {
                          return Promise.reject(new Error('Experience must be 0 or above'));
                        }
                        return Promise.resolve();
                      },
                    },
                  ]}
                >
                  <Input type='number' placeholder={'5'} className="mt-4" />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <p className="font-semibold text-s mb-2 ml-2">Role Responsibility</p>
              {responsibilities.map((responsibility, index) => (
                <Col xs={20} sm={20}>
                <Tag
                  className='w-full h-6 mb-4'
                  key={index}
                >
                  {responsibility}
                </Tag>
                </Col>
              ))}

            </Row>
            <Row gutter={16}>
              <Col  xs={20} sm={20}>
              <Form.Item className='font-semibold text-xs' >
                <Input
                  className="mt-2"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Enter a responsibility"
                />
                </Form.Item>
              </Col>
              <Col xs={4} sm={4} className="flex justify-center">
                <Button type="primary" className="mt-2" onClick={addResponsibility}>
                  <FaPlus />
                </Button>
              </Col>
            </Row>
            </Card>
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

export default CreateCriticalPostion;
