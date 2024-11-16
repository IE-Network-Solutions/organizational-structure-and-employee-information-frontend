'use client';
import React from 'react';
import {
  Button,
  Card,
  Col,
  Form,
  Popconfirm,
  Row,
  Select,
  Space,
  Avatar,
} from 'antd';
import CustomDrawerLayout from '@/components/common/customDrawer';
import { useCreateSuccessionPlan } from '@/store/server/features/organization-development/SuccessionPlan/mutation';
import {
  useSuccessionPlanStore,
  useCriticalPositionStore,
} from '@/store/uistate/features/organizationalDevelopment/SuccessionPlan';
import { useGetAllUsers } from '@/store/server/features/employees/employeeManagment/queries';

const CreateSuccessionPlan = () => {
  const { data: users } = useGetAllUsers();
  const [form] = Form.useForm();
  const { mutate: createSuccessionPlan, isLoading } = useCreateSuccessionPlan();
  const { criticalPositionId, setCriticalPositionId } =
    useCriticalPositionStore();
  const { setSuccessorId, setOpen } = useSuccessionPlanStore();
  const { open, successor } = useSuccessionPlanStore.getState();

  const modalHeader = (
    <div className="flex justify-center text-xl font-extrabold text-gray-800 p-4">
      Succession Plan
    </div>
  );

  const options = users
    ? users.items.map((user: any) => ({
        value: user.id,
        label: (
          <Space size="small">
            <Avatar
              src={
                user?.profileImage && typeof user?.profileImage === 'string'
                  ? (() => {
                      try {
                        const parsed = JSON.parse(user.profileImage);
                        return parsed.url && parsed.url.startsWith('http')
                          ? parsed.url
                          : Avatar;
                      } catch {
                        return user.profileImage.startsWith('http')
                          ? user.profileImage
                          : Avatar;
                      }
                    })()
                  : Avatar
              }
            />
            {user.firstName}
          </Space>
        ),
      }))
    : [];

  const handleCancel = () => {
    form.resetFields();
    setOpen(false);
  };

  const handlSuccessor = (value: string) => {
    setSuccessorId(value);
  };

  const handleSubmit = (values: any) => {
    createSuccessionPlan({ successor: values, criticalPositionId });
    setCriticalPositionId('');
    form.resetFields();
    setOpen(false);
  };

  return (
    open && (
      <CustomDrawerLayout
        open={open}
        onClose={handleCancel}
        modalHeader={modalHeader}
        width="40%"
      >
        <Form
          form={form}
          name="dependencies"
          autoComplete="off"
          style={{ maxWidth: '100%' }}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Card>
            <Row gutter={16}>
              <Col xs={24} sm={24}>
                <Form.Item
                  className="font-semibold text-xs"
                  name={'successor'}
                  rules={[
                    {
                      required: true,
                      message: 'Please select atleast one successor',
                    },
                  ]}
                  label={
                    <>
                      Successor{' '}
                      <span style={{ color: 'red', font: 'bold' }}>*</span>
                    </>
                  }
                >
                  <Select
                    id={'selectStatusChartType'}
                    placeholder="Select Successor"
                    allowClear
                    mode="multiple"
                    className="w-full h-[50px] my-4"
                    value={successor}
                    onChange={handlSuccessor}
                    maxTagCount={3}
                    dropdownStyle={{ maxHeight: 500, overflow: 'auto' }}
                    showSearch
                    filterOption={(input, option) => {
                      const label = option?.label;
                      if (React.isValidElement(label)) {
                        const userName = label.props.children[1];
                        return userName
                          .toLowerCase()
                          .includes(input.toLowerCase());
                      }

                      return false;
                    }}
                    options={options}
                    style={{ height: 'auto' }}
                  ></Select>
                </Form.Item>
              </Col>
            </Row>
          </Card>
          <Row gutter={16} className="mt-40">
            <Col xs={24} sm={12} className="flex justify-end items-end">
              <Popconfirm
                title="reset all you filled"
                description="Are you sure to reset all fields value ?"
                okText="Yes"
                onConfirm={handleCancel}
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
              <Button
                loading={isLoading}
                htmlType="submit"
                name="createActionButton"
                id="createActionButtonId"
                className="px-6 py-3 text-xs font-bold rounded-md"
                type="primary"
              >
                Submit
              </Button>
            </Col>
          </Row>
        </Form>
      </CustomDrawerLayout>
    )
  );
};

export default CreateSuccessionPlan;
