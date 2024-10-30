'use client';
import React, { useState, useEffect } from 'react';
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
import Stepper from '@/components/common/stepper';
import {
  useCreateCriticalPosition,
  useUpdateCriticalPosition,
} from '@/store/server/features/organization-development/SuccessionPlan/mutation';
import {
  useCriticalPositionStore,
  useCriticalPositionRecordStore,
} from '@/store/uistate/features/organizationalDevelopment/SuccessionPlan';

const { Option } = Select;

const CreateCriticalPosition = () => {
  const [form] = Form.useForm();
  const [responsibilityInput, setResponsibilityInput] = useState('');
  const { mutate: createCriticalPosition, isLoading } =
    useCreateCriticalPosition();
  const { mutate: updateCriticalPosition } = useUpdateCriticalPosition();
  const { record, clearRecord, isEditing, setIsEditing } =
    useCriticalPositionRecordStore();
  const {
    setCurrent,
    setOpen,
    addCriteria,
    current,
    open,
    criteria,
    setCriteria,
    removeCriteria,
    resetCriticalPositionData,
  } = useCriticalPositionStore();

  useEffect(() => {
    if (isEditing && record) {
      form.setFieldsValue({
        name: record.name,
        jobTitleId: record.jobTitleId,
        description: record.description,
        requiredSkills: record.requiredSkills,
        requiredExperience: record.requiredExperience,
      });
      setCriteria(record.criteria.map((res: any) => res.criterion));
    } else {
      form.resetFields();
      clearRecord();
    }
  }, [isEditing, record]);

  const handleAddResponsibility = () => {
    if (responsibilityInput && !criteria.includes(responsibilityInput)) {
      addCriteria(responsibilityInput);
      setResponsibilityInput('');
    }
  };

  const handleCancel = () => {
    form.resetFields();
    clearRecord();
    setCriteria([]);
    resetCriticalPositionData();
    setIsEditing(false);
    setOpen(false);
  };

  const handleSubmit = (values: any) => {
    const data = {
      ...values,
      criteria,
      requiredExperience: Number(values.requiredExperience),
    };
    if (isEditing) {
      updateCriticalPosition({ values: data, id: record?.id || '' });
    } else {
      createCriticalPosition({ values: data });
    }
    handleCancel();
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
        onClose={handleCancel}
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
          onFinish={handleSubmit}
        >
          <Card hidden={current !== 0}>
            <Row gutter={16}>
              <Col xs={24} sm={24}>
                <Form.Item
                  className="font-semibold text-xs"
                  name="name"
                  label="Critical Position Name"
                  rules={[
                    {
                      required: true,
                      message: 'Please enter the position name',
                    },
                  ]}
                >
                  <Input
                    placeholder={'Enter Critical Position Name'}
                    className="mt-4"
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col xs={24} sm={24}>
                <Form.Item
                  className="font-semibold text-xs"
                  name={'jobTitleId'}
                  label={'Job Title'}
                  rules={[
                    { required: true, message: 'Please select a job title' },
                  ]}
                >
                  <Select
                    id={'selectStatusChartType'}
                    placeholder="Select Job Title"
                    allowClear
                    className="w-full h-[48px] my-4"
                  >
                    <Option
                      key="active"
                      value={'c3f5d4b8-2f1e-4e68-9b7d-7b1e5b8f9c0d'}
                    >
                      Job 1
                    </Option>
                    <Option
                      key="inactive"
                      value={'c3f5d4c9-2f1e-4e68-9b7d-7b1e5b8f9c0d'}
                    >
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
                  rules={[
                    {
                      required: true,
                      validator: (s, value) => {
                        if (!value || value.length === 0) {
                          return Promise.reject(
                            new Error('Please add at least one skill'),
                          );
                        }
                        return Promise.resolve();
                      },
                    },
                  ]}
                >
                  <Select
                    mode="tags"
                    open={false}
                    className="mt-4"
                    style={{ width: '100%' }}
                    placeholder="Enter skills"
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
                      required: true,
                      message: 'Please enter experience level',
                    },
                    {
                      validator: (s, value) => {
                        if (value !== undefined && value < 0) {
                          return Promise.reject(
                            new Error('Experience must be 0 or above'),
                          );
                        }
                        return Promise.resolve();
                      },
                    },
                  ]}
                >
                  <Input type="number" placeholder={'5'} className="mt-4" />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <p className="font-semibold text-s mb-2 ml-2">
                Role Responsibility
              </p>
              {criteria.map((criterion, index) => (
                <React.Fragment key={`${criterion}-${index}`}>
                  <Col xs={20} sm={20}>
                    <Tag className="w-full h-6 mb-4">{criterion}</Tag>
                  </Col>
                  <Col xs={4} sm={4} className="flex justify-center">
                    <Button
                      type="primary"
                      className="h-6"
                      danger
                      onClick={() => removeCriteria(criterion)}
                    >
                      <FaMinus />
                    </Button>
                  </Col>
                </React.Fragment>
              ))}
            </Row>
            <Row gutter={16}>
              <Col xs={20} sm={20}>
                <Form.Item
                  className="font-semibold text-xs"
                  name="responsibilities"
                  rules={[
                    {
                      validator: () => {
                        if (!criteria || criteria.length === 0) {
                          return Promise.reject(
                            new Error('Please add at least one responsibility'),
                          );
                        }
                        return Promise.resolve();
                      },
                    },
                  ]}
                >
                  <Input
                    className="mt-2"
                    onChange={(e) => setResponsibilityInput(e.target.value)}
                    placeholder="Enter a responsibility"
                  />
                </Form.Item>
              </Col>
              <Col xs={4} sm={4} className="flex justify-center">
                <Button
                  type="primary"
                  className="mt-2"
                  onClick={() => {
                    handleAddResponsibility();
                    form.validateFields(['responsibilities']);
                  }}
                >
                  <FaPlus />
                </Button>
              </Col>
            </Row>
          </Card>
          <Row gutter={16} className="mt-40">
            <Col xs={24} sm={12} className="flex justify-end items-end">
              <Popconfirm
                title="reset all you filled"
                description="Are you sure to reset all fields value ?"
                onConfirm={handleCancel}
                okText="Yes"
                cancelText="No"
              >
                <Button
                  name="cancelSidebarButtonId"
                  className="px-6 py-3 text-xs font-bold rounded-md"
                >
                  Cancel
                </Button>
              </Popconfirm>
            </Col>
            <Col xs={24} sm={12}>
              {current == 0 ? (
                <>
                  <Button
                    name="nextStepper"
                    id="nextStepperButton"
                    className="px-6 py-3 text-xs font-bold rounded-md"
                    type="primary"
                    onClick={(event) => {
                      event.preventDefault();
                      setCurrent(1);
                    }}
                  >
                    Next
                  </Button>
                </>
              ) : (
                <Button
                  loading={isLoading}
                  htmlType="submit"
                  name="createActionButton"
                  id="createActionButtonId"
                  className="px-6 py-3 text-xs font-bold rounded-md"
                  type="primary"
                >
                  {isEditing ? 'Update' : 'Create'}
                </Button>
              )}
            </Col>
          </Row>
        </Form>
      </CustomDrawerLayout>
    )
  );
};

export default CreateCriticalPosition;
