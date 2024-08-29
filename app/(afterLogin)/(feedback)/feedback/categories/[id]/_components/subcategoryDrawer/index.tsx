'use client';
import CustomButton from '@/components/common/buttons/customButton';
import CustomDrawerLayout from '@/components/common/customDrawer';
import { useCategoriesManagementStore } from '@/store/uistate/features/feedback/categories';
import { Col, DatePicker, Form, Input, Row, Select, Switch } from 'antd';
import TextArea from 'antd/es/input/TextArea';
import React from 'react';
import { CalendarOutlined } from '@ant-design/icons';

const { Option } = Select;
const SubcategoryDrawer: React.FC<any> = (props) => {
  const { open, setOpen } = useCategoriesManagementStore();

  const drawerHeader = (
    <div className="flex justify-center text-xl font-extrabold text-gray-800 p-4">
      Create Category
    </div>
  );
  const handleCloseDrawer = () => {
    setOpen(false);
  };

  return (
    open && (
      <CustomDrawerLayout
        open={open}
        onClose={props?.onClose}
        modalHeader={drawerHeader}
        width="40%"
      >
        <div className="flex flex-col h-full">
          <Form layout="vertical">
            <Form.Item
              id="categoryName"
              label={
                <span className="text-md my-2 font-semibold text-gray-700">
                  Survey name
                </span>
              }
              name="name"
              rules={[
                {
                  required: true,
                  message: 'Please input the category name!',
                },
              ]}
            >
              <Input
                allowClear
                size="large"
                placeholder="Enter category name"
                className="text-sm w-full h-10"
              />
            </Form.Item>
            <Form.Item
              id="categoryDescription"
              label={
                <span className="text-md my-2 font-semibold text-gray-700">
                  Survey Description
                </span>
              }
              name="description"
              rules={[
                {
                  required: true,
                  message: 'Please input the category description!',
                },
              ]}
            >
              <TextArea
                allowClear
                rows={4}
                placeholder="Enter category description"
              />
            </Form.Item>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="surveyStartDate"
                  label={
                    <span className="text-md my-2 font-semibold text-gray-700">
                      Survey Start Date
                    </span>
                  }
                  className="w-full h-10"
                  rules={[
                    { required: true, message: 'Please select start date' },
                  ]}
                >
                  <DatePicker
                    allowClear
                    style={{ width: '100%' }}
                    placeholder="Select Start Date"
                    className="w-full h-10"
                    suffixIcon={<CalendarOutlined />}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="surveyEndDate"
                  label={
                    <span className="text-md my-2 font-semibold text-gray-700">
                      Survey End Date
                    </span>
                  }
                  className="w-full h-10"
                  rules={[
                    { required: true, message: 'Please select end date' },
                  ]}
                >
                  <DatePicker
                    allowClear
                    style={{ width: '100%' }}
                    placeholder="Select End Date"
                    className="w-full h-10"
                    suffixIcon={<CalendarOutlined />}
                  />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item
              label={
                <span className="text-md my-2 font-semibold text-gray-700">
                  Survey Group
                </span>
              }
            >
              <Select
                id=""
                allowClear
                placeholder="Select Employees"
                className="w-full h-10"
              >
                <Option>Option 1</Option>
              </Select>
            </Form.Item>
            <Form.Item
              name="Select"
              label={
                <span className="text-md my-2 font-semibold text-gray-700">
                  Allow to be anonymous
                </span>
              }
              rules={[
                {
                  required: true,
                  message: 'Please switch anonymous',
                },
              ]}
            >
              <Switch />
            </Form.Item>
          </Form>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <CustomButton
              title="Cancel"
              type="primary"
              className="bg-white text-black border-[1px] border-gray-300 px-10"
              onClick={handleCloseDrawer}
            />
            <CustomButton title="Submit" className="px-10" />
          </div>
        </div>
      </CustomDrawerLayout>
    )
  );
};

export default SubcategoryDrawer;
