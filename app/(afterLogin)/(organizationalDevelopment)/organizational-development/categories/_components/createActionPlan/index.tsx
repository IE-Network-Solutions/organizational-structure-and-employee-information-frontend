import React from 'react';
import { Button, Col, Form, Input, Popconfirm, Row, Select} from 'antd';
import CustomDrawerLayout from '@/components/common/customDrawer';
import NotificationMessage from '@/components/common/notification/notificationMessage';
import { useAddEmployee } from '@/store/server/features/employees/employeeManagment/mutations';
import { useEmployeeManagementStore } from '@/store/uistate/features/employees/employeeManagment';
import { validateName } from '@/utils/validation';
import { FaPlus } from 'react-icons/fa';
import { useOrganizationalDevelopment } from '@/store/uistate/features/organizationalDevelopment';

const {Option}=Select;

const CreateActionPlan = (props: any) => {
  const [form] = Form.useForm();
  const {open,setOpen } = useEmployeeManagementStore();
  const {numberOfActionPlan,setNumberOfActionPlan } = useOrganizationalDevelopment();


  const modalHeader = (
    <div className="flex justify-center text-xl font-extrabold text-gray-800 p-4">
      Add New Action Plan
    </div>
  );

  const plusOnClickHandler = () => {
   setNumberOfActionPlan(numberOfActionPlan+1)
  };
  const handleCreateAction = () => {
    // setNumberOfActionPlan(numberOfActionPlan+1)
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
          onFinish={handleCreateAction}
          onFinishFailed={() =>
            NotificationMessage.error({
              message: 'Something wrong or unfilled',
              description: 'please back and check the unfilled fields',
            })
          }
        >
      {Array.from({ length: numberOfActionPlan }, (_, index) => (
        <><Row gutter={16}>
            <Col xs={24} sm={24}>
              <Form.Item
                className="font-semibold text-xs"
                name={`actionPlan${index+1}`}
                label={`Action plan ${index+1}`}
                id={`actionPlanId${index+1}`}
                rules={[
                  {
                    validator: (rule, value) =>
                      !validateName('name', value)
                        ? Promise.resolve()
                        : Promise.reject(
                            new Error(validateName('name', value) || ''),
                          ),
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
                name={`description${index+1}`}
                label={`Description`}
                id={`actionPlanDescription${index+1}`}
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
        <Row gutter={16}>
            <Col xs={24} sm={24}>
              <Form.Item
                className="font-semibold text-xs"
                name={`responsiblePerson${index+1}`}
                label={`Responsible Person`}
                id={`responsiblePersonId${index+1}`}
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
        </>
      ))}
        <Row gutter={16} className='my-5'>
          <Col className='flex justify-center' xs={24} sm={24}>
            <Button type='primary' onClick={plusOnClickHandler}><FaPlus/></Button>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col xs={24} sm={12} className='flex justify-end'>
          <Popconfirm
            title="reset all you field"
            description="Are you sure to reset all fields value ?"
            onConfirm={()=>setOpen(false)}
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
        </Form>
      </CustomDrawerLayout>
    )
  );
};

export default CreateActionPlan;
