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
    <div className="flex items-center justify-start gap-2 ">
      <div>
        {option?.profileImage ? (
          <Avatar size={20} src={option?.profileImage} />
        ) : (
          <Avatar size={20}>
            {option?.firstName[0]?.toUpperCase()}
            {option?.middleName[0]?.toUpperCase()}
            {option?.lastName[0]?.toUpperCase()}
          </Avatar>
        )}
      </div>
      {option?.firstName + ' ' + option?.middleName}
  );

  const customTagRender = (props: any) => {
    const { label, closable, onClose } = props;
    return (
      <div className="flex gap-1 items-center bg-gray-100 p-2 rounded-lg mx-1 my-1 ">
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
        planningPeriods: selectedPlanningUser.items.map(
          (item) => item.planningPeriodId,
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
            optionFilterProp="label"
            filterOption={(input, option) =>
              (option?.label as string)
                ?.toLowerCase()
                .includes(input.toLowerCase())
            }
            className="h-12"
            tagRender={customTagRender}
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
            className="h-12"
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
