import React from 'react';
import { Button, Card, Col, Form, Input, Popconfirm, Row, Select} from 'antd';
import { FaPlus } from 'react-icons/fa';
import CustomDrawerLayout from '@/components/common/customDrawer';
import { validateName } from '@/utils/validation';
import { DataItem } from '@/store/server/features/organization-development/categories/interface';
import { useCreateActionPlan } from '@/store/server/features/organization-development/categories/mutation';
import { useOrganizationalDevelopment } from '@/store/uistate/features/organizationalDevelopment';
import Stepper from '@/components/common/stepper';
const {Option}=Select;
const CreateCriticalPostion = (props: any) => {
  const [form] = Form.useForm();
  const {numberOfActionPlan,setNumberOfActionPlan,setCurrent,numberOfRoleResponseblity,setNumberOfRoleResponseblity,current,open,setOpen } = useOrganizationalDevelopment();
  const {mutate:createActionPlan,isLoading}=useCreateActionPlan();
  const modalHeader = (
    <div className="flex justify-center text-xl font-extrabold text-gray-800 p-4">
      Critical Position
    </div>
  );
  const plusOnClickHandler = () => {
    setNumberOfRoleResponseblity(numberOfRoleResponseblity+1)
  };
  const handleCancel = () => {
    form.resetFields();
    setOpen(false);
    setNumberOfActionPlan(1);
   };
  const handleCreateActionPlan = (values:DataItem[]) => {
    createActionPlan(values)
   };  return (
    open && (
      <CustomDrawerLayout
        open={open}
        onClose={props?.onClose}
        modalHeader={modalHeader}
        width="40%"
      >
        <Stepper numberOfSteps={2} setCurrent={setCurrent} current={current}/>
        <Form
          form={form}
          name="dependencies"
          autoComplete="off"
          style={{ maxWidth: '100%' }}
          layout="vertical"
          onFinish={handleCreateActionPlan}
        >
        <Card hidden={current!==0}>
          <Row gutter={16}>
              <Col xs={24} sm={24}>
                <Form.Item
                  className="font-semibold text-xs"
                  name='critical Position'
                  label='Critical Position'
                  id='responsiblePersonId'
                  rules={[
                    {
                      validator: (rule, value) =>
                        !validateName('Middle Name', value)
                          ? Promise.resolve()
                          : Promise.reject(
                              new Error(validateName('Middle Name', value) || ''),
                            ),
                    },
                  ]}
                >
                  <Select
                      id={`selectStatusChartType`}
                      placeholder="All Status"
                      allowClear
                      className="w-full h-[48px] my-4"
                    >
                      <Option key="active" value={"pieChart"}>
                      Person 1
                      </Option>
                      <Option key="inactive" value={"lineGraph"}>
                      Person 2
                      </Option>
                  </Select>
                </Form.Item>
              </Col>
          </Row>
          <Row gutter={16}>
              <Col xs={24} sm={24}>
                <Form.Item
                  className="font-semibold text-xs"
                  name={'jobTitle'}
                  label={`Job title`}
                  id={`responsiblePersonId`}
                  rules={[
                    {
                      validator: (rule, value) =>
                        !validateName('Middle Name', value)
                          ? Promise.resolve()
                          : Promise.reject(
                              new Error(validateName('Middle Name', value) || ''),
                            ),
                    },
                  ]}
                >
                  <Select
                      id={`selectStatusChartType`}
                      placeholder="All Status"
                      allowClear
                      className="w-full h-[48px] my-4"
                    >
                      <Option key="active" value={"pieChart"}>
                      Person 1
                      </Option>
                      <Option key="inactive" value={"lineGraph"}>
                      Person 2
                      </Option>
                  </Select>
                </Form.Item>
              </Col>
          </Row>
          <Row gutter={16}>
              <Col xs={24} sm={24}>
                <Form.Item
                  className="font-semibold text-xs"
                  name='aboutTheRole'
                  label={`About the role`}
                  id={`actionPlanDescription`}
                  rules={[
                    {
                      validator: (rule, value) =>
                        !validateName('Middle Name', value)
                          ? Promise.resolve()
                          : Promise.reject(
                              new Error(validateName(`Responsible person for action plan`, value) || ''),
                            ),
                    },
                  ]}
                >
                  <Input.TextArea rows={6} />
                </Form.Item>
              </Col>
          </Row>
        </Card>
        <Card hidden={current!==1}>
          <Row gutter={16}>
              <Col xs={24} sm={24}>
                <Form.Item
                  className="font-semibold text-xs"
                  name='requiredSkills'
                  label='Required Skills/Criterias'
                  id='responsiblePersonId'
                  rules={[
                    {
                      validator: (rule, value) =>
                        !validateName('Middle Name', value)
                          ? Promise.resolve()
                          : Promise.reject(
                              new Error(validateName('Middle Name', value) || ''),
                            ),
                    },
                  ]}
                >
                  <Select
                      id={`selectStatusChartType`}
                      placeholder="All Status"
                      allowClear
                      className="w-full h-[48px] my-4"
                    >
                      <Option key="active" value={"pieChart"}>
                      Person 1
                      </Option>
                      <Option key="inactive" value={"lineGraph"}>
                      Person 2
                      </Option>
                  </Select>
                </Form.Item>
              </Col>
          </Row>
          <Row gutter={16}>
              <Col xs={24} sm={24}>
                <Form.Item
                  className="font-semibold text-xs"
                  name='experianceRequired'
                  label='Experiance Required'
                  id='responsiblePersonId'
                  rules={[
                    {
                      validator: (rule, value) =>
                        !validateName('Middle Name', value)
                          ? Promise.resolve()
                          : Promise.reject(
                              new Error(validateName('Middle Name', value) || ''),
                            ),
                    },
                  ]}
                >
                  <Select
                      id={`selectStatusChartType`}
                      placeholder="All Status"
                      allowClear
                      className="w-full h-[48px] my-4"
                    >
                      <Option key="active" value={"pieChart"}>
                      Person 1
                      </Option>
                      <Option key="inactive" value={"lineGraph"}>
                      Person 2
                      </Option>
                  </Select>
                </Form.Item>
              </Col>
          </Row>
          {Array.from({ length: numberOfRoleResponseblity }, (_, index) => (
            <Row>
              <Col xs={24} sm={20}>
                <Form.Item
                  className="font-semibold text-xs"
                  name={[`${index+1}`, 'roleResponsiblities']}
                  label='Role Responsiblities'
                  id={`responsiblePersonId${index}`}
                  rules={[
                    {
                      validator: (rule, value) =>
                        !validateName('Role Responsiblities', value)
                          ? Promise.resolve()
                          : Promise.reject(
                              new Error(validateName('Role Responsiblities', value) || ''),
                            ),
                    },
                  ]}
                >
                  <Input/>
                </Form.Item>
              </Col>
            </Row>))}
          <Row gutter={16}>
              <Col xs={24} sm={20}>
                <Form.Item
                  className="font-semibold text-xs"
                  name={[`0`, 'roleResponsiblities']}
                  label='Role Responsiblities'
                  id='responsiblePersonId'
                  rules={[
                    {
                      validator: (rule, value) =>
                        !validateName('Role Responsiblities', value)
                          ? Promise.resolve()
                          : Promise.reject(
                              new Error(validateName('Role Responsiblities', value) || ''),
                            ),
                    },
                  ]}
                >
                  <Input/>
                </Form.Item>
              </Col>
            <Col className='flex justify-center mt-4' xs={24} sm={4}>
              <Button type='primary' onClick={plusOnClickHandler}><FaPlus/></Button>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col xs={24} sm={12} className='flex justify-end'>
            <Popconfirm
              title="reset all you filled"
              description="Are you sure to reset all fields value ?"
              onConfirm={handleCancel}
              okText="Yes"
              cancelText="No"
            >
              <Button name="cancelSidebarButtonId" className='p-4' danger>
                Cancel
              </Button>
            </Popconfirm>
            </Col>
            <Col xs={24} sm={12}>
            <Button
              loading={isLoading}
              htmlType='submit'
              name="createActionButton"
              id="createActionButtonId"
              className="px-6 py-3 text-xs font-bold"
              type='primary'
            >
              Create
            </Button>
            </Col>
          </Row>
        </Card>
        </Form>
      </CustomDrawerLayout>
    )
  );
};

export default CreateCriticalPostion;
