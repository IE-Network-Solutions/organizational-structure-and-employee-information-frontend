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
    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
      <Avatar size={20} icon={<UserOutlined />} />
      {option.firstName} {option.middleName} {option.lastName}
    </div>
  );

  const customTagRender = (props: any) => {
    const { label, closable, onClose } = props;
    return (
      <div className="flex gap-1 items-center bg-gray-100 p-2 rounded-lg mx-1 my-1">
        <Avatar size={20} icon={<UserOutlined />} />
        <span>{label}</span>
        {closable && (
          <span onClick={onClose} className="text-black text-xs cursor-pointer">
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
          (item: PlanningPeriodItem) => item.id,
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
    <div className="flex justify-center text-xl font-extrabold text-gray-800 p-4">
      Assign
    </div>
  );
  const footer = (
    <div className="w-full flex justify-center items-center gap-4 pt-8">
      <CustomButton
        type="default"
        title="Cancel"
        onClick={handleDrawerClose}
        style={{ marginRight: 8 }}
      />
      <CustomButton
        onClick={() => form.submit()}
        title={selectedPlanningUser ? 'Edit' : 'Add'}
        type="primary"
        loading={isLoading || editLoading}
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
    >
      <Form
        form={form}
        name="reprimandForm"
        layout="vertical"
        onFinish={selectedPlanningUser ? onUpdate : onFinish}
        autoComplete="off"
      >
        {/* Select Employee */}
        <Form.Item
          name="userIds"
          label="Select Assignee"
          rules={[{ required: true, message: 'Please select employees' }]}
        >
          <Select
            mode="multiple"
            allowClear
            placeholder="Select Employees"
            optionLabelProp="label"
            tagRender={customTagRender}
            optionFilterProp="label"
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
        >
          <Select
            mode="multiple"
            placeholder="Select Plans"
            dropdownClassName="bg-white shadow-lg rounded-md"
          >
            {allPlanningperiod?.items
              ?.filter((all) => all.isActive === true)
              .map((planning, index) => (
                <Option key={index} value={planning?.id}>
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
