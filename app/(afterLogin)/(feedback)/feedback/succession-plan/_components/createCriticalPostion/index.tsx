import React, { useState } from 'react';
import {
  Button,
  Card,
  Col,
  Tag,
  Form,
  Input,
  Popconfirm,
  Row,
  Select,
} from 'antd';
import { FaMinus, FaPlus } from 'react-icons/fa';
import CustomDrawerLayout from '@/components/common/customDrawer';
import { useCreateCriticalPosition } from '@/store/server/features/organization-development/SuccessionPlan/mutation';
import Stepper from '@/components/common/stepper';
import { useCriticalPositionStore } from '@/store/uistate/features/organizationalDevelopment/SuccessionPlan/index'
const { Option } = Select;

const CreateCriticalPostion = (props: any) => {

  const [form] = Form.useForm();
  const [ responsibilityInputValue, setResponsibilityInputValue ] = useState('');
  const { mutate: createCriticalPosition, isLoading } = useCreateCriticalPosition();

  const { setDescription, setCurrent, setOpen, setName, setJobTitleId, addResponsibility, setRequiredExperience, setRequiredSkills, removeResponsibility, resetCriticalPositionData } = useCriticalPositionStore();
  const {name, jobTitleId, current, open, description, requiredExperience, requiredSkills, responsibilities } = useCriticalPositionStore.getState();

  const handleName = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  };

  const handleJob = (value: string) => {
    setJobTitleId(value);
  }

  const handleDescription = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDescription(e.target.value);
  }

  const handleSkills = (value: string[]) => {
    setRequiredSkills(value);
  }

  const handleExperiance = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRequiredExperience(Number(e.target.value));
  }

  const handleResponsibility = () => {
    addResponsibility(responsibilityInputValue)
    setResponsibilityInputValue('');
  }

  const handleCancel = () => {
    form.resetFields();
    resetCriticalPositionData();
    setOpen(false);
  };

  const handleCreateCriticalPosition = () => {
    const criticalPositionData = {
      name,
      description,
      jobTitleId,
      requiredSkills,
      requiredExperience,
      responsibilities
    };
    createCriticalPosition({ values: criticalPositionData });
    resetCriticalPositionData();
    form.resetFields();
  };
  
  const modalHeader = (
    <div className="flex justify-center text-xl font-extrabold text-gray-800 p-4">
      Critical Position
    </div>
  );
  
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
          onFinish={handleCreateCriticalPosition}
        >
          <Card hidden={current !== 0}>
            <Row gutter={16}>
              <Col xs={24} sm={24}>
                <Form.Item
                  className="font-semibold text-xs"
                  name="name"
                  label="Critical Position Name"
                >
                  <Input 
                  placeholder={'Enter Critical Position Name'} 
                  className="mt-4"
                  value={name}
                  onChange={handleName}
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col xs={24} sm={24}>
                <Form.Item
                  className="font-semibold text-xs"
                  name={"jobTitleId"}
                  label={'Job Title'}
                >
                  <Select
                    id={"selectStatusChartType"}
                    placeholder="Select Job Title"
                    allowClear
                    className="w-full h-[48px] my-4"
                    value={jobTitleId}
                    onChange={handleJob}
                  >
                    <Option key="active" value={"c3f5d4b8-2f1e-4e68-9b7d-7b1e5b8f9c0d"}>
                      Job 1
                    </Option>
                    <Option key="inactive" value={"c3f5d4c9-2f1e-4e68-9b7d-7b1e5b8f9c0d"}>
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
                  name="description"
                  label={'About the role'}
                >
                  <Input.TextArea
                    placeholder={'Enter Role Discription'}
                    className="mt-4"
                    rows={6}
                    value={description}
                    onChange={handleDescription}
                  />
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
                    className="mt-4"
                    style={{ width: '100%' }}
                    placeholder="Enter skills"
                    tokenSeparators={[',']}
                    value={requiredSkills}
                    onChange={handleSkills}
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col xs={24} sm={24}>
                <Form.Item
                  className="font-semibold text-xs"
                  name="requiredExperience"
                  label="Required Experiance"
                  rules={[
                    {
                      validator: (rule, value) => {
                        if (value < 0) {
                          return Promise.reject(
                            new Error('Experience must be 0 or above'),
                          );
                        }
                        return Promise.resolve();
                      },
                    },
                  ]}
                >
                  <Input
                  type="number"
                  placeholder={'5'}
                  className="mt-4"
                  value={requiredExperience}
                  onChange={handleExperiance}
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <p className="font-semibold text-s mb-2 ml-2">
                Role Responsibility
              </p>
              {responsibilities.map((responsibility, index) => (
                <>
                  <Col xs={20} sm={20}>
                    <Tag className="w-full h-6 mb-4" key={index}>
                      {responsibility}
                    </Tag>
                  </Col>
                  <Col xs={4} sm={4} className="flex justify-center">
                    <Button
                      type="primary"
                      className="h-6"
                      danger
                      onClick={() => removeResponsibility(responsibility)}
                    >
                      <FaMinus />
                    </Button>
                  </Col>
                </>
              ))}
            </Row>
            <Row gutter={16}>
              <Col xs={20} sm={20}>
                <Form.Item className="font-semibold text-xs">
                  <Input
                    className="mt-2"
                    onChange={(e) => setResponsibilityInputValue(e.target.value)}
                    value={responsibilityInputValue}
                    placeholder="Enter a responsibility"
                  />
                </Form.Item>
              </Col>
              <Col xs={4} sm={4} className="flex justify-center">
                <Button
                  type="primary"
                  className="mt-2"
                  onClick={handleResponsibility}
                >
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
