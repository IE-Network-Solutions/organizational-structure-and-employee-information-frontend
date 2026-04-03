'use client';

import CustomButton from '@/components/common/buttons/customButton';
import CustomDrawerLayout from '@/components/common/customDrawer';
import { useGetAllUsers } from '@/store/server/features/okrplanning/okr/users/queries';
import { useGetOkrRule } from '@/store/server/features/okrplanning/monitoring-evaluation/okr-rule/queries';
import { useAssignAverageOkrRuleToUser } from '@/store/server/features/okrplanning/monitoring-evaluation/okr-rule/mutations';
import { useAssignAverageOkrRuleStore } from '@/store/uistate/features/okrplanning/monitoring-evaluation/assign-average-okr-rule';
import { Avatar, Form, Select } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import React, { useEffect, useMemo } from 'react';

interface AssignAverageOkrRuleDrawerProps {
  open: boolean;
  onClose: () => void;
}

const SELECT_ALL_VALUE = '__SELECT_ALL__';

const AssignAverageOkrRuleDrawer: React.FC<AssignAverageOkrRuleDrawerProps> = ({
  open,
  onClose,
}) => {
  const { data: allUsers, isLoading: usersLoading } = useGetAllUsers();
  const { data: okrRulesData, isLoading: rulesLoading } = useGetOkrRule();
  const { mutate: assignRule, isLoading: assignLoading } =
    useAssignAverageOkrRuleToUser();
  const { editContext, setEditContext } = useAssignAverageOkrRuleStore();
  const [form] = Form.useForm();

  useEffect(() => {
    if (!open) {
      return;
    }
    if (editContext) {
      form.setFieldsValue({
        userIds: [editContext.userId],
        averageOkrRuleId: editContext.averageOkrRuleId,
      });
    } else {
      form.resetFields();
    }
  }, [open, editContext, form]);

  const handleDrawerClose = () => {
    form.resetFields();
    setEditContext(null);
    onClose();
  };

  const renderEmployeeOption = (option: any) => (
    <div
      className="flex items-center gap-2"
      id={`okr-assign-average-okr-rule-drawer-employee-option-${option.id}`}
      data-cy={`okr-assign-average-okr-rule-drawer-employee-option-${option.id}`}
    >
      <Avatar
        size={20}
        icon={
          <UserOutlined
            data-cy={`okr-assign-average-okr-rule-drawer-employee-option-avatar-icon-${option.id}`}
          />
        }
        data-cy={`okr-assign-average-okr-rule-drawer-employee-option-avatar-${option.id}`}
      />
      <span
        id={`okr-assign-average-okr-rule-drawer-employee-option-name-${option.id}`}
        data-cy={`okr-assign-average-okr-rule-drawer-employee-option-name-${option.id}`}
      >
        {option.firstName} {option.middleName} {option.lastName}
      </span>
    </div>
  );

  const isActiveUser = (user: any) => {
    const deleted = user?.deletedAt !== null && user?.deletedAt !== undefined;
    const inactive =
      user?.employee_status === 'inactive' ||
      user?.employee_status === 'terminated';
    return !deleted && !inactive;
  };

  const isDepartmentLead = (user: any) =>
    Boolean(
      user?.employeeJobInformation?.find((job: any) => job?.isPositionActive)
        ?.departmentLeadOrNot,
    );

  const filteredUsers = useMemo(() => {
    const users = allUsers?.items ?? [];
    const leads = users.filter(
      (user: any) => isActiveUser(user) && isDepartmentLead(user),
    );
    if (editContext?.userId) {
      const assigned = users.find((u: any) => u.id === editContext.userId);
      if (
        assigned &&
        !leads.some((u: any) => u.id === editContext.userId)
      ) {
        return [...leads, assigned];
      }
    }
    return leads;
  }, [allUsers?.items, editContext?.userId]);

  const onFinish = (values: {
    userIds: string[];
    averageOkrRuleId: string;
  }) => {
    assignRule(values, {
      onSuccess: () => {
        handleDrawerClose();
      },
    });
  };

  const modalHeader = (
    <div
      className="flex justify-center text-xl font-extrabold text-gray-800 p-4"
      id="okr-assign-average-okr-rule-drawer-header"
      data-cy="okr-assign-average-okr-rule-drawer-header"
    >
      <span
        id="okr-assign-average-okr-rule-drawer-header-title"
        data-cy="okr-assign-average-okr-rule-drawer-header-title"
      >
        {editContext ? 'Update assignment' : 'Assign OKR rule'}
      </span>
    </div>
  );

  const footer = (
    <div
      className="w-full flex justify-center items-center gap-4 pt-8"
      id="okr-assign-average-okr-rule-drawer-footer"
      data-cy="okr-assign-average-okr-rule-drawer-footer"
    >
      <CustomButton
        type="default"
        title="Cancel"
        onClick={handleDrawerClose}
        style={{ marginRight: 8 }}
        id="okr-assign-average-okr-rule-drawer-cancel-button"
        data-cy="okr-assign-average-okr-rule-drawer-cancel-button"
      />
      <CustomButton
        onClick={() => form.submit()}
        title={editContext ? 'Update' : 'Assign'}
        type="primary"
        loading={assignLoading}
        id="okr-assign-average-okr-rule-drawer-submit-button"
        data-cy="okr-assign-average-okr-rule-drawer-submit-button"
      />
    </div>
  );

  const rules = okrRulesData?.items ?? [];
  const allFilteredUserIds = filteredUsers.map((user: any) => user.id);

  const handleUserSelectChange = (selectedValues: string[]) => {
    if (selectedValues.includes(SELECT_ALL_VALUE)) {
      form.setFieldsValue({ userIds: allFilteredUserIds });
      return;
    }
    form.setFieldsValue({ userIds: selectedValues });
  };

  return (
    <CustomDrawerLayout
      open={open}
      onClose={handleDrawerClose}
      modalHeader={modalHeader}
      footer={footer}
      width="30%"
      data-cy="okr-assign-average-okr-rule-drawer"
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        autoComplete="off"
        id="okr-assign-average-okr-rule-drawer-form"
        data-cy="okr-assign-average-okr-rule-drawer-form"
      >
        <Form.Item
          name="userIds"
          label="Department leads"
          rules={[
            {
              required: true,
              message: 'Please select at least one department lead',
            },
          ]}
          id="okr-assign-average-okr-rule-drawer-user-field"
          data-cy="okr-assign-average-okr-rule-drawer-user-field"
        >
          <Select
            mode="multiple"
            showSearch
            allowClear
            placeholder="Select department leads"
            optionLabelProp="label"
            optionFilterProp="label"
            loading={usersLoading}
            onChange={handleUserSelectChange}
            id="okr-assign-average-okr-rule-drawer-user-select"
            data-cy="okr-assign-average-okr-rule-drawer-user-select"
          >
            <Select.Option
              key={SELECT_ALL_VALUE}
              value={SELECT_ALL_VALUE}
              disabled={filteredUsers.length === 0}
              label="Select all"
              id="okr-assign-average-okr-rule-drawer-user-option-select-all"
              data-cy="okr-assign-average-okr-rule-drawer-user-option-select-all"
            >
              Select all
            </Select.Option>
            {filteredUsers?.map((option: any) => (
              <Select.Option
                key={option.id}
                value={option.id}
                label={`${option.firstName ?? ''} ${option.middleName ?? ''} ${option.lastName ?? ''}`}
                id={`okr-assign-average-okr-rule-drawer-user-option-${option.id}`}
                data-cy={`okr-assign-average-okr-rule-drawer-user-option-${option.id}`}
              >
                {renderEmployeeOption(option)}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="averageOkrRuleId"
          label="Average OKR rule"
          rules={[{ required: true, message: 'Please select a rule' }]}
          id="okr-assign-average-okr-rule-drawer-rule-field"
          data-cy="okr-assign-average-okr-rule-drawer-rule-field"
        >
          <Select
            showSearch
            placeholder="Select rule"
            optionFilterProp="children"
            loading={rulesLoading}
            id="okr-assign-average-okr-rule-drawer-rule-select"
            data-cy="okr-assign-average-okr-rule-drawer-rule-select"
          >
            {rules.map((rule) => (
              <Select.Option
                key={rule.id}
                value={rule.id}
                id={`okr-assign-average-okr-rule-drawer-rule-option-${rule.id}`}
                data-cy={`okr-assign-average-okr-rule-drawer-rule-option-${rule.id}`}
              >
                {rule.title || 'Untitled rule'}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
      </Form>
    </CustomDrawerLayout>
  );
};

export default AssignAverageOkrRuleDrawer;
