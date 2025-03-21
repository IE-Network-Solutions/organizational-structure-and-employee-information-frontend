'use client';

import React, { useEffect } from 'react';
import { Form, Input, Select, Modal, Button } from 'antd';
import {
  GroupPermissionkey,
  Permission,
} from '@/types/dashboard/adminManagement';

import { useSettingStore } from '@/store/uistate/features/employees/settings/rolePermission';
import {
  useAddPermissionGroup,
  useUpdatePermissionGroup,
} from '@/store/server/features/employees/settings/groupPermission/mutations';
import { useGetPermissions } from '@/store/server/features/employees/settings/permission/queries';
const GroupPermission = () => {
  const {
    selectedPermissionGroup,
    pageSize,
    setSelectedPermissionGroup,
    permissionCurrentPage,
    setCurrentModal,
    currentModal,
  } = useSettingStore();
  const { mutate: createPermissionGroupMutation, isLoading: createLoading } =
    useAddPermissionGroup();
  const { mutate: updatePermissionGroupMutation, isLoading: updateLoaing } =
    useUpdatePermissionGroup();
  const { data: permissionData } = useGetPermissions(
    permissionCurrentPage,
    pageSize,
  );
  const [form] = Form.useForm();
  useEffect(() => {
    if (currentModal === 'editModal' && selectedPermissionGroup) {
      form.setFieldsValue({
        id: selectedPermissionGroup?.id,
        name: selectedPermissionGroup?.name,
        description: selectedPermissionGroup?.description,
        permissions: selectedPermissionGroup?.permissions?.map(
          (item: Permission) => ({ label: item.name ?? 'N/A', value: item.id }),
        ),
      });
    }
  }, [currentModal, selectedPermissionGroup, form]);

  const children: JSX.Element[] = [];
  permissionData?.items?.forEach((item: Permission) => {
    children.push(
      <Select.Option key={item.id} className="p-2 text-xs">
        {item.name ?? 'N/A'}
      </Select.Option>,
    );
  });
  const onFinish = async (values: GroupPermissionkey) => {
    createPermissionGroupMutation(values, {
      onSuccess: () => {
        setCurrentModal(null);
        form.resetFields();
      },
    });
  };

  const onUpdatePermissionGroupData = (values: GroupPermissionkey) => {
    updatePermissionGroupMutation(values, {
      onSuccess: () => {
        setCurrentModal(null);
        form.resetFields();
      },
    });
  };
  const modalTitle = (
    <div className="flex w-full justify-center items-center text-md font-extrabold">
      {currentModal !== 'editModal' ? 'Add Group' : 'Update Group'}
    </div>
  );
  return (
    <Modal
      width="70%" // Default width for small screens
      className="max-w-4xl mx-auto" // Center modal and set maximum width
      title={modalTitle}
      style={{ top: '10%', width: '90%', maxWidth: '700px' }}
      open={currentModal === 'createModal' || currentModal === 'editModal'}
      footer={null}
      onCancel={() => {
        form.resetFields();
        setSelectedPermissionGroup(null);
        setCurrentModal(null);
      }}
    >
      <Form
        form={form}
        name="basic"
        layout="vertical"
        onFinish={
          currentModal === 'editModal' ? onUpdatePermissionGroupData : onFinish
        }
      >
        <div className="grid gap-2">
          {currentModal === 'editModal' && (
            <Form.Item name="id">
              <Input type="hidden" />
            </Form.Item>
          )}
          <div>
            <Form.Item
              name="name"
              label={
                <p className="text-xs font-bold text-gray-600">Group name</p>
              }
              rules={[{ required: true, message: 'Enter group name!' }]}
            >
              <Input
                id="groupNameId"
                className="h-10 text-xs text-gray-600"
                placeholder="Enter group name"
              />
            </Form.Item>
          </div>
          <div>
            <Form.Item
              name="description"
              label={
                <p className="text-xs font-bold text-gray-600">
                  Group Description
                </p>
              }
              rules={[{ required: true, message: 'Enter role description!' }]}
            >
              <Input
                id="groupDescriptionId"
                className="h-10 text-xs text-gray-600"
                placeholder="Enter role description"
              />
            </Form.Item>
          </div>
          <div id="groupPermissionId">
            <Form.Item
              name="permissions"
              label={
                <p className="text-xs font-bold text-gray-600">Permission</p>
              }
              rules={[
                { required: true, message: 'Select the Permission List!' },
              ]}
            >
              <Select
                id="groupPermissionId"
                mode="multiple"
                size="large"
                placeholder="Please select"
                onChange={() => {}}
                style={{ width: '100%' }}
              >
                {children}
              </Select>
            </Form.Item>
          </div>
        </div>
        <Form.Item wrapperCol={{ span: 24, md: { span: 12, offset: 6 } }}>
          <div className="w-full flex flex-col md:flex-row justify-center items-center gap-4 sm:gap-6 md:gap-8 lg:gap-10 mt-6 sm:mt-8 md:mt-10 lg:mt-12">
            <Button
              id="cancelModalButton"
              className="px-4 py-2 sm:px-6 sm:py-3 md:px-8 md:py-4 text-xs sm:text-sm font-bold"
              onClick={() => {
                setCurrentModal(null);
                form.resetFields();
              }}
            >
              Cancel
            </Button>
            <Button
              id="actionCreatedButton"
              className="px-4 py-2 sm:px-6 sm:py-3 md:px-8 md:py-4 text-xs sm:text-sm font-bold"
              htmlType="submit"
              type="primary"
              loading={
                currentModal === 'editModal' ? updateLoaing : createLoading
              }
            >
              {currentModal !== 'editModal' ? 'Create' : 'Update'}
            </Button>
          </div>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default GroupPermission;
