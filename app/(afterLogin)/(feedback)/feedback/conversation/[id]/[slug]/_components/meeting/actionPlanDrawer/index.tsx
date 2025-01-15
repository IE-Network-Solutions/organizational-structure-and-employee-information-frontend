import React from 'react';
import {
  Drawer,
  Form,
  Card,
  Row,
  Col,
  Input,
  Select,
  Button,
  DatePicker,
  Popconfirm,
} from 'antd';
import { TiDeleteOutline } from 'react-icons/ti';
import { FaPlus } from 'react-icons/fa';
import Image from 'next/image';
import { useOrganizationalDevelopment } from '@/store/uistate/features/organizationalDevelopment';

const { Option } = Select;

interface ActionPlanDrawerProps {
  form: any;
  handleCreateBiWeeklyWithActionPlan: (values: any) => void;
  handleCancel: () => void;
  allUserData: any;
  userDataLoading: boolean;
}

const ActionPlanDrawer: React.FC<ActionPlanDrawerProps> = ({
  form,
  handleCreateBiWeeklyWithActionPlan,
  handleCancel,
  allUserData,
  userDataLoading,
}) => {
  const {
    numberOfActionPlan,
    setNumberOfActionPlan,
    setChildrenDrawer,
    childrenDrawer,
  } = useOrganizationalDevelopment();

  const plusOnClickHandler = () => {
    setNumberOfActionPlan(numberOfActionPlan + 1);
  };

  const onChildrenDrawerClose = () => {
    setChildrenDrawer(false);
  };
  return (
    <Drawer
      title="Create Action Plan"
      width="30%"
      closable={false}
      onClose={onChildrenDrawerClose}
      open={childrenDrawer}
    >
      <Form
        form={form}
        name="dependencies"
        autoComplete="off"
        layout="vertical"
        onFinish={handleCreateBiWeeklyWithActionPlan}
      >
        {Array.from(
          { length: numberOfActionPlan },
          (notused, index) => (
            <Card
              key={index}
              title={
                <div
                  className="flex justify-end text-red-600 cursor-pointer"
                  onClick={() => {
                    const currentValues = form.getFieldsValue();
                    const updatedValues = Array.from({
                      length: numberOfActionPlan,
                    })
                      .map((notused, i) => currentValues[i])
                      .filter((notused, i) => i !== index);
                    // Update the form values and adjust `numberOfActionPlan`
                    form.setFieldsValue(updatedValues);
                    setNumberOfActionPlan(numberOfActionPlan - 1);
                  }}
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
                      { required: true, message: 'Action title is required' },
                      {
                        max: 40,
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
                    label="Comment"
                    id={`actionPlanDescription${index + 1}`}
                    rules={[
                      { required: true, message: 'Comment is required' },
                      {
                        max: 40,
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
                    label="Responsible Person"
                    id={`responsiblePersonId${index + 1}`}
                    rules={[
                      {
                        required: true,
                        message: 'Responsible Person is required',
                      },
                    ]}
                  >
                    <Select
                      id="selectStatusChartType"
                      placeholder="Responsible Person"
                      allowClear
                      loading={userDataLoading}
                      className="w-full my-4"
                    >
                      {allUserData?.items?.map((item: any) => (
                        <Option key={item.id} value={item.id}>
                          <div className="flex space-x-3 p-1 rounded">
                            <Image
                              src={item?.profileImage ?? '/default-avatar.png'}
                              alt="profile"
                              className="rounded-full w-4 h-4 mt-2"
                              width={15}
                              height={15}
                            />
                            <span className="flex justify-center items-center">
                              {item?.firstName + ' ' + (item?.middleName ?? '')}
                            </span>
                          </div>
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col xs={24} sm={10}>
                  <Form.Item
                    className="font-semibold text-xs w-full"
                    name={[`${index}`, 'status']}
                    label="Status"
                    id={`statusId${index + 1}`}
                    rules={[{ required: true, message: 'Status is required' }]}
                  >
                    <Select
                      placeholder="Select status"
                      allowClear
                      className="w-full"
                    >
                      <Option key="pending" value="pending">
                        Pending
                      </Option>
                      <Option key="completed" value="completed">
                        Solved
                      </Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    className="font-semibold text-xs w-full"
                    name={[`${index}`, 'deadline']}
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
          ),
          /* eslint-enable @typescript-eslint/naming-convention */
        )}
        <Row gutter={16} className="my-5">
          <Col className="flex justify-center" xs={24} sm={24}>
            <Button
              type="primary"
              className="text-xs px-8 text-white"
              onClick={plusOnClickHandler}
            >
              <FaPlus />
            </Button>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col xs={24} sm={12} className="flex justify-end">
            <Popconfirm
              title="Reset all fields"
              description="Are you sure you want to reset all fields?"
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
    </Drawer>
  );
};

export default ActionPlanDrawer;
