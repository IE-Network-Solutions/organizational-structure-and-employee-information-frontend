import React, { useEffect } from 'react';
import { Select, Input, Form } from 'antd';
import CustomDrawerLayout from '@/components/common/customDrawer';
import useDrawerStore from '@/store/uistate/features/okrplanning/okrSetting/assignTargetDrawerStore';
import CustomButton from '@/components/common/buttons/customButton';
import { useGetCriteriaTargets } from '@/store/server/features/okrplanning/okr/criteria/queries';
import { useGetDepartmentsWithUsers } from '@/store/server/features/employees/employeeManagment/department/queries';
import {
  useGetActiveSession,
  useGetTargetAssignmentById,
} from '@/store/server/features/okrplanning/okr/target/queries';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import {
  useCreateAssignTarget,
  useUpdateAssignedTargets,
} from '@/store/server/features/okrplanning/okr/target/mutation';

const { Option } = Select;

const AssignTargetDrawer: React.FC = () => {
  const { data: criteriaData } = useGetCriteriaTargets();
  const { data: departmentData } = useGetDepartmentsWithUsers();
  const { data: activeSessionData } = useGetActiveSession();
  const {
    mutate: createAssignTarget,
    isLoading: isCreateLoading,
    isSuccess: isCreateSuccess,
  } = useCreateAssignTarget();
  const {
    mutate: updateAssignedTarget,
    isLoading: isUpdateLoading,
    isSuccess: isUpdateSuccess,
  } = useUpdateAssignedTargets();
  const [form] = Form.useForm();
  const {
    isDrawerVisible,
    closeDrawer,
    currentId,
    setSelectedMonths,
    selectedMonths,
  } = useDrawerStore();
  const { userId } = useAuthenticationStore();
  const { data: getTargetById } = useGetTargetAssignmentById(currentId || '');

  const resetState = () => {
    form.resetFields();
    setSelectedMonths([]);
    form.setFieldsValue({
      department: '',
      criteria: '',
      month: [],
    });
  };
  useEffect(() => {
    if (currentId && getTargetById) {
      form.setFieldsValue({
        department: getTargetById.departmentId,
        criteria: getTargetById.vpCriteriaId,
        month: [getTargetById.month],
        [getTargetById.month]: getTargetById.target,
      });
      setSelectedMonths([getTargetById.month]);
    } else if (!currentId && !getTargetById) {
      // If there's no `clientId` or `currentId`, select all active months
      const allActiveMonths =
        activeSessionData?.months?.map((month: any) => month.name) || [];
      form.setFieldsValue({
        month: allActiveMonths,
      });
      setSelectedMonths(allActiveMonths);
    }
  }, [currentId, getTargetById, activeSessionData]);

  useEffect(() => {
    if (isCreateSuccess || isUpdateSuccess) {
      resetState();
      closeDrawer();
    }
  }, [isCreateSuccess, isUpdateSuccess]);

  const onSubmit = (values: any) => {
    const target = values.month.map((month: string) => ({
      month,
      target: values[month],
    }));

    const payload: Record<string, any> = {
      departmentId: values.department,
      vpCriteriaId: values.criteria,
      target,
      ...(getTargetById && currentId
        ? { updatedBy: userId }
        : { createdBy: userId }),
    };

    if (getTargetById && currentId) {
      updateAssignedTarget({ id: currentId, values: payload });
    } else {
      createAssignTarget(payload);
    }
  };

  const handleDepartmentChange = () => {};
  const handleCriteriaChange = () => {};

  return (
    <CustomDrawerLayout
      open={isDrawerVisible}
      onClose={closeDrawer}
      modalHeader={
        <span className="text-xl font-semibold">
          {currentId ? 'Update Target' : 'Assign Target'}
        </span>
      }
      width="700px"
      footer={
        <div className="flex justify-center items-center w-full h-full">
          <div className="flex justify-between items-center gap-4">
            <CustomButton
              type="default"
              title="Cancel"
              onClick={() => {
                form.resetFields();
                closeDrawer();
                resetState();
              }}
            />
            <CustomButton
              title={currentId ? 'Update' : 'Assign'}
              onClick={() => form.submit()}
              loading={currentId ? isUpdateLoading : isCreateLoading}
            />
          </div>
        </div>
      }
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onSubmit}
        className="space-y-4"
      >
        <Form.Item label="Department" name="department">
          <Select
            placeholder="Select Department"
            onChange={handleDepartmentChange}
            className="w-full h-12"
          >
            {departmentData?.map((dept: any) => (
              <Option key={dept.id} value={dept.id}>
                {dept.name}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          label="Choose Criteria"
          name="criteria"
          rules={[
            { required: true, message: 'Please select at least one criteria' },
          ]}
        >
          <Select
            placeholder="Select criteria"
            onChange={handleCriteriaChange}
            className="flex-1 h-12"
          >
            {criteriaData?.items?.map((criteria: any) => (
              <Option key={criteria.id} value={criteria.id}>
                {criteria.name}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="month"
          label="Month"
          rules={[{ required: true, message: 'Please select a month!' }]}
        >
          <Select
            className="h-12"
            mode={currentId ? undefined : 'multiple'} // Single selection when currentId exists
            placeholder="Select a month"
            onChange={
              (value) => setSelectedMonths(currentId ? [value] : value) // Normalize to an array
            }
          >
            {activeSessionData?.months?.map((month: any) => (
              <Option key={month.id} value={month.name}>
                {month.name}
              </Option>
            ))}
          </Select>
        </Form.Item>

        {selectedMonths?.map((month) => (
          <div key={month} className="flex items-center gap-4">
            <Form.Item>
              <Input value={month} disabled className="flex-1 h-12" />
            </Form.Item>
            <Form.Item
              name={`${month}`}
              className="flex-1"
              rules={[{ required: true, message: 'Enter the weight here!' }]}
            >
              <Input
                placeholder="Enter Weight"
                type="number"
                min={0}
                max={100}
                className="h-12"
              />
            </Form.Item>
          </div>
        ))}
      </Form>
    </CustomDrawerLayout>
  );
};

export default AssignTargetDrawer;
