'use client';

import React, { useEffect } from 'react';
import { Button, Col, Form, Input, Row, Select } from 'antd';
import { useEmployeeManagmentStore } from '@/store/uistate/features/employees/employeeManagment';
import {
  useGetRole,
  useGetRolesWithOutPagination,
} from '@/store/server/features/employees/settings/role/queries';
import { validateEmailURL, validatePhoneNumber } from '@/utils/validation';
import CustomDrawerLayout from '@/components/common/customDrawer';
import {
  useAddEmployee,
  useUpdateEmployee,
} from '@/store/server/features/employees/employeeManagment/mutations';
const { Option } = Select;
const UserSidebar = (props: any) => {
  const {
    setOpen,
    setModalType,
    setSelectedItem,
    modalType,
    userCurrentPage,
    pageSize,
    open,
    prefix,
    setPrefix,
  } = useEmployeeManagmentStore();
  const [form] = Form.useForm();

  const { data: rolePermissionsData } = useGetRolesWithOutPagination();
  const { data: userListData } = useGetRole('865345678gfghd-nsdcbsd');
  const useCreateEmployeeMutation = useAddEmployee();
  const useUpdateEmployeeMutation = useUpdateEmployee();

  const prefixSelector = (
    <Form.Item name="prefix" noStyle>
      <Select
        disabled={true}
        defaultValue={prefix}
        onChange={(value) => setPrefix(value)}
        style={{ width: 80 }}
      >
        <Option value="+251">+251</Option>
        <Option value="87">+87</Option>
      </Select>
    </Form.Item>
  );

  useEffect(() => {
    form.setFieldsValue({
      id: userListData?.id,
      name: userListData?.name,
      email: userListData?.email,
      phone: userListData?.contactInformation?.phone?.substring(3),
      roleId:
        userListData?.role?.deletedAt === null ? userListData?.roleId : null,
    });
  }, [form, userListData]);

  const handleCreateUser = (values: any) => {
    const modifiedValues = {
      ...values,
      contactInformation: {
        phone: `${prefix}${values.phone}`,
      },
    };
    delete modifiedValues.prefix;
    delete modifiedValues.phone;
    useCreateEmployeeMutation.mutate({
      userCurrentPage,
      values: modifiedValues,
      pageSize,
      setOpen,
    });
    form.resetFields();
  };
  const handleUpdateUser = (values: any) => {
    const modifiedValues = {
      ...values,
      email: `${values?.email}`,
      contactInformation: {
        phone: `${prefix}${values?.phone}`,
      },
    };

    delete modifiedValues.prefix;
    delete modifiedValues.phone;
    useUpdateEmployeeMutation.mutate({
      values: modifiedValues,
      setOpen,
      userCurrentPage,
      pageSize,
    });
    // updateUser({
    //   values: modifiedValues,
    //   setOpen,
    //   userCurrentPage,
    //   pageSize,
    // });
    form.resetFields();
    setSelectedItem(null);
    setModalType(null);
  };
  const modalHeader = (
    <div className="flex justify-center text-xl font-extrabold text-gray-800 ">
      {modalType !== 'edit' ? 'Admin Creation' : 'Admin Edit'}
    </div>
  );
  return (
    open && (
      <CustomDrawerLayout
        open={open}
        onClose={props?.onClose}
        modalHeader={modalHeader}
      >
        <Form
          form={form}
          name="dependencies"
          autoComplete="off"
          style={{ maxWidth: '100%' }}
          layout="vertical"
          onFinish={modalType !== 'edit' ? handleCreateUser : handleUpdateUser}
        >
          <Row>
            {modalType === 'edit' && (
              <Form.Item name="id">
                <Input type="hidden" />
              </Form.Item>
            )}
          </Row>
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="name"
                label={
                  <p className="text-xs font-bold text-gray-600">Admin Name</p>
                }
                rules={[
                  { required: true, message: 'Enter group name!' },
                  { max: 30, message: 'Too long character!' },
                  { min: 5, message: 'Set more than 5 characters!' },
                  {
                    validator: (rule, value) =>
                      value && /\d/.test(value)
                        ? Promise.reject(
                            new Error('Name should not contain numbers!'),
                          )
                        : Promise.resolve(),
                  },
                ]}
              >
                <Input
                  id="adminNameId"
                  className="h-10 text-xs text-gray-600"
                  placeholder="Enter group name"
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="email"
                label={
                  <p className="text-xs font-bold text-gray-600">Admin Email</p>
                }
                rules={[{ validator: validateEmailURL }]}
              >
                <Input
                  id="adminEmailId"
                  type="email"
                  className="h-10 text-xs text-gray-600"
                  placeholder="Enter Email"
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="phone"
                label={
                  <p className="text-xs font-bold text-gray-600">
                    Phone Number
                  </p>
                }
                rules={[{ validator: validatePhoneNumber }]}
              >
                <Input
                  id="adminPhoneNumber"
                  className="h-10 text-xs text-gray-600"
                  addonBefore={prefixSelector}
                  placeholder="Phone Number"
                  type="tel"
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="roleId"
                label={
                  <p className="text-xs font-bold text-gray-600">User Type</p>
                }
                rules={[{ required: true, message: 'Please choose the type' }]}
              >
                <Select
                  className="h-10 text-xs font-bold text-gray-600"
                  placeholder="Please choose the type"
                  id="adminUserType"
                >
                  {rolePermissionsData?.items?.map((item: any) => (
                    <Option
                      key={item.id}
                      className="text-xs font-bold text-gray-600"
                      value={item.id}
                    >
                      {item.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Form.Item>
            <div className="w-full flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-6 mt-6 sm:mt-8">
              <Button
                name="cancelUserSidebarButton"
                id="cancelSidebarButtonId"
                className="px-6 py-3 text-xs font-bold"
                onClick={() => {
                  form.resetFields();
                  props?.onClose();
                }}
              >
                Cancel
              </Button>
              <Button
                id="sidebarActionCreate"
                className="px-6 py-3 text-xs font-bold"
                htmlType="submit"
                type="primary"
              >
                {modalType !== 'edit' ? 'Create' : 'Edit'}
              </Button>
            </div>
          </Form.Item>
        </Form>
      </CustomDrawerLayout>
    )
  );
};

export default UserSidebar;
