'use client';
import CustomButton from '@/components/common/buttons/customButton';
import CustomDrawerLayout from '@/components/common/customDrawer';
import { useGetAllUsers } from '@/store/server/features/okrplanning/okr/users/queries';
import { Form, Select, Avatar } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import React, { useEffect } from 'react';
import { useGetAllPlanningPeriods } from '@/store/server/features/employees/planning/planningPeriod/queries';
import {
  useAssignPlanningPeriodToUsers,
  useUpdateAssignPlanningPeriodToUsers,
} from '@/store/server/features/employees/planning/planningPeriod/mutation';
import { useOKRSettingStore } from '@/store/uistate/features/okrplanning/okrSetting';
import { PlanningPeriodItem } from '@/store/uistate/features/okrplanning/okrSetting/interface';
interface RepDrawerProps {
  open: boolean;
  onClose: () => void;
}

const PlanningAssignationDrawer: React.FC<RepDrawerProps> = ({
  open,
  onClose,
}) => {
  const { data: allUsers } = useGetAllUsers();
  const { data: allPlanningperiod } = useGetAllPlanningPeriods();
  const { mutate: planAssign, isLoading } = useAssignPlanningPeriodToUsers();
  const { mutate: editAssign, isLoading: editLoading } =
    useUpdateAssignPlanningPeriodToUsers();

  const { selectedPlanningUser } = useOKRSettingStore();

  const { Option } = Select;
  const [form] = Form.useForm();

  const renderEmployeeOption = (option: any) => (
    <div
      style={{ display: 'flex', alignItems: 'center', gap: 4 }}
      id={`okr-planning-assignation-drawer-employee-option-${option.id}`}
      data-cy={`okr-planning-assignation-drawer-employee-option-${option.id}`}
    >
      <Avatar
        size={20}
        icon={<UserOutlined data-cy={`okr-planning-assignation-drawer-employee-option-avatar-icon-${option.id}`} />}
      
        data-cy={`okr-planning-assignation-drawer-employee-option-avatar-${option.id}`}
      />
      <span
        id={`okr-planning-assignation-drawer-employee-option-name-${option.id}`}
        data-cy={`okr-planning-assignation-drawer-employee-option-name-${option.id}`}
      >
        {option.firstName} {option.middleName} {option.lastName}
      </span>
    </div>
  );

  const customTagRender = (props: any) => {
    const { label, closable, onClose } = props;
    return (
      <div
        className="flex gap-1 items-center bg-gray-100 p-2 rounded-lg mx-1 my-1"
        id="okr-planning-assignation-drawer-selected-user-tag"
        data-cy="okr-planning-assignation-drawer-selected-user-tag"
      >
        <Avatar
          size={20}
          icon={<UserOutlined data-cy={`okr-planning-assignation-drawer-selected-user-tag-avatar-icon`} />}
       
          data-cy="okr-planning-assignation-drawer-selected-user-tag-avatar"
        />
        <span
          id="okr-planning-assignation-drawer-selected-user-tag-label"
          data-cy="okr-planning-assignation-drawer-selected-user-tag-label"
        >
          {label}
        </span>
        {closable && (
          <span
            onClick={onClose}
            className="text-black text-xs cursor-pointer"
            id="okr-planning-assignation-drawer-selected-user-tag-close"
            data-cy="okr-planning-assignation-drawer-selected-user-tag-close"
          >
            ✖
          </span>
        )}
      </div>
    );
  };

  useEffect(() => {
    if (selectedPlanningUser) {
      form.setFieldsValue({
        userIds: [selectedPlanningUser.userId], // Wrapping userId in an array to match the expected structure
        planningPeriods: selectedPlanningUser.planningPeriod.map(
          (item: PlanningPeriodItem) => item.planningPeriodId,
        ),
      });
    } else {
      form.resetFields();
    }
  }, [selectedPlanningUser, form]);

  const onFinish = (values: any) => {
    planAssign(values, {
      onSuccess: () => {
        handleDrawerClose();
      },
    });
    // const value = { ...values, issuerId: userId };
  };

  const onUpdate = (values: any) => {
    editAssign(values, {
      onSuccess: () => {
        handleDrawerClose();
      },
    });
    // const value = { ...values, issuerId: userId };
  };

  const handleDrawerClose = () => {
    form.resetFields(); // Reset all form fields
    onClose();
  };

  const modalHeader = (
    <div
      className="flex justify-center text-xl font-extrabold text-gray-800 p-4"
      id="okr-planning-assignation-drawer-header"
      data-cy="okr-planning-assignation-drawer-header"
    >
      <span
        id="okr-planning-assignation-drawer-header-title"
        data-cy="okr-planning-assignation-drawer-header-title"
      >
        Assign
      </span>
    </div>
  );
  const footer = (
    <div
      className="w-full flex justify-center items-center gap-4 pt-8"
      id="okr-planning-assignation-drawer-footer"
      data-cy="okr-planning-assignation-drawer-footer"
    >
      <CustomButton
        type="default"
        title="Cancel"
        onClick={handleDrawerClose}
        style={{ marginRight: 8 }}
        id="okr-planning-assignation-drawer-cancel-button"
        data-cy="okr-planning-assignation-drawer-cancel-button"
      />
      <CustomButton
        onClick={() => form.submit()}
        title={selectedPlanningUser ? 'Edit' : 'Add'}
        type="primary"
        loading={isLoading || editLoading}
        id="okr-planning-assignation-drawer-submit-button"
        data-cy="okr-planning-assignation-drawer-submit-button"
      />
    </div>
  );

  return (
    <CustomDrawerLayout
      open={open}
      onClose={handleDrawerClose}
      modalHeader={modalHeader}
      footer={footer}
      width="30%"
    
      data-cy="okr-planning-assignation-drawer"
    >
      <Form
        form={form}
        name="reprimandForm"
        layout="vertical"
        onFinish={selectedPlanningUser ? onUpdate : onFinish}
        autoComplete="off"
        id="okr-planning-assignation-drawer-form"
        data-cy="okr-planning-assignation-drawer-form"
      >
        {/* Select Employee */}
        <Form.Item
          name="userIds"
          label="Select Assignee"
          rules={[{ required: true, message: 'Please select employees' }]}
          id="okr-planning-assignation-drawer-assignee-field"
          data-cy="okr-planning-assignation-drawer-assignee-field"
        >
          <Select
            mode="multiple"
            allowClear
            placeholder="Select Employees"
            optionLabelProp="label"
            tagRender={customTagRender}
            optionFilterProp="label"
            id="okr-planning-assignation-drawer-assignee-select"
            data-cy="okr-planning-assignation-drawer-assignee-select"
          >
            {allUsers?.items.map((option: any) => (
              <Select.Option
                key={option.id}
                value={option.id}
                label={
                  option.firstName +
                  ' ' +
                  option.middleName +
                  ' ' +
                  option.lastName
                }
                id={`okr-planning-assignation-drawer-assignee-option-${option.id}`}
                data-cy={`okr-planning-assignation-drawer-assignee-option-${option.id}`}
              >
                {renderEmployeeOption(option)}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="planningPeriods"
          label="Assigned Planning periods"
          rules={[{ required: true, message: 'Please Assigned Plan' }]}
          id="okr-planning-assignation-drawer-plans-field"
          data-cy="okr-planning-assignation-drawer-plans-field"
        >
          <Select
            mode="multiple"
            placeholder="Select Plans"
            dropdownClassName="bg-white shadow-lg rounded-md"
            id="okr-planning-assignation-drawer-plans-select"
            data-cy="okr-planning-assignation-drawer-plans-select"
          >
            {allPlanningperiod?.items
              ?.filter((all) => all.isActive === true)
              .map((planning, index) => (
                <Option
                  key={index}
                  value={planning?.id}
                  id={`okr-planning-assignation-drawer-plan-option-${planning?.id}`}
                  data-cy={`okr-planning-assignation-drawer-plan-option-${planning?.id}`}
                >
                  {planning.name}
                </Option>
              ))}
          </Select>
        </Form.Item>
      </Form>
    </CustomDrawerLayout>
  );
};
export default PlanningAssignationDrawer;
