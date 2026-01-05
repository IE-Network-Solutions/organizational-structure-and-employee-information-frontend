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
    getTargetById;
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
    } else if (!currentId) {
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
      departmentId: values.department || null,
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
        <span
          className="text-xl font-semibold"
          id="okr-assign-target-drawer-header-title"
          data-cy="okr-assign-target-drawer-header-title"
        >
          {currentId ? 'Update Target' : 'Assign Target'}
        </span>
      }
      width="30%"
      footer={
        <div
          className="flex justify-center items-center w-full h-full"
          id="okr-assign-target-drawer-footer"
          data-cy="okr-assign-target-drawer-footer"
        >
          <div
            className="flex justify-between items-center gap-4"
            id="okr-assign-target-drawer-footer-buttons"
            data-cy="okr-assign-target-drawer-footer-buttons"
          >
            <CustomButton
              type="default"
              title="Cancel"
              onClick={() => {
                form.resetFields();
                closeDrawer();
                resetState();
              }}
              id="okr-assign-target-drawer-cancel-button"
              data-cy="okr-assign-target-drawer-cancel-button"
            />
            <CustomButton
              title={currentId ? 'Update' : 'Assign'}
              onClick={() => form.submit()}
              loading={currentId ? isUpdateLoading : isCreateLoading}
              id="okr-assign-target-drawer-submit-button"
              data-cy="okr-assign-target-drawer-submit-button"
            />
          </div>
        </div>
      }
      data-cy="okr-assign-target-drawer"
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onSubmit}
        className="space-y-4"
        id="okr-assign-target-drawer-form"
        data-cy="okr-assign-target-drawer-form"
      >
        <Form.Item
          label="Department"
          name="department"
          id="okr-assign-target-drawer-department-field"
          data-cy="okr-assign-target-drawer-department-field"
        >
          <Select
            placeholder="Select Department"
            onChange={handleDepartmentChange}
            className="w-full h-12"
            allowClear
            id="okr-assign-target-drawer-department-select"
            data-cy="okr-assign-target-drawer-department-select"
          >
            {departmentData?.map((dept: any) => (
              <Option
                key={dept.id}
                value={dept.id}
                id={`okr-assign-target-drawer-department-option-${dept.id}`}
                data-cy={`okr-assign-target-drawer-department-option-${dept.id}`}
              >
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
          id="okr-assign-target-drawer-criteria-field"
          data-cy="okr-assign-target-drawer-criteria-field"
        >
          <Select
            placeholder="Select criteria"
            onChange={handleCriteriaChange}
            className="flex-1 h-12"
            id="okr-assign-target-drawer-criteria-select"
            data-cy="okr-assign-target-drawer-criteria-select"
          >
            {criteriaData?.items?.map((criteria: any) => (
              <Option
                key={criteria.id}
                value={criteria.id}
                id={`okr-assign-target-drawer-criteria-option-${criteria.id}`}
                data-cy={`okr-assign-target-drawer-criteria-option-${criteria.id}`}
              >
                {criteria.name}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="month"
          label="Month"
          rules={[{ required: true, message: 'Please select a month!' }]}
          id="okr-assign-target-drawer-month-field"
          data-cy="okr-assign-target-drawer-month-field"
        >
          <Select
            className="h-12"
            mode={currentId ? undefined : 'multiple'} // Single selection when currentId exists
            placeholder="Select a month"
            onChange={
              (value) => setSelectedMonths(currentId ? [value] : value) // Normalize to an array
            }
            id="okr-assign-target-drawer-month-select"
            data-cy="okr-assign-target-drawer-month-select"
          >
            {activeSessionData?.months?.map((month: any) => (
              <Option
                key={month.id}
                value={month.name}
                id={`okr-assign-target-drawer-month-option-${month.id}`}
                data-cy={`okr-assign-target-drawer-month-option-${month.id}`}
              >
                {month.name}
              </Option>
            ))}
          </Select>
        </Form.Item>

        {selectedMonths?.map((month) => (
          <div
            key={month}
            className="flex items-center gap-4"
            id={`okr-assign-target-drawer-month-block-${month}`}
            data-cy={`okr-assign-target-drawer-month-block-${month}`}
          >
            <Form.Item
              id={`okr-assign-target-drawer-month-label-field-${month}`}
              data-cy={`okr-assign-target-drawer-month-label-field-${month}`}
            >
              <Input
                value={month}
                disabled
                className="flex-1 h-12"
                id={`okr-assign-target-drawer-month-label-input-${month}`}
                data-cy={`okr-assign-target-drawer-month-label-input-${month}`}
              />
            </Form.Item>
            <Form.Item
              name={`${month}`}
              className="flex-1"
              rules={[{ required: true, message: 'Enter the weight here!' }]}
              id={`okr-assign-target-drawer-month-weight-field-${month}`}
              data-cy={`okr-assign-target-drawer-month-weight-field-${month}`}
            >
              <Input
                placeholder="Enter Weight"
                type="number"
                min={0}
                max={100}
                className="h-12"
                id={`okr-assign-target-drawer-month-weight-input-${month}`}
                data-cy={`okr-assign-target-drawer-month-weight-input-${month}`}
              />
            </Form.Item>
          </div>
        ))}
      </Form>
    </CustomDrawerLayout>
  );
};

export default AssignTargetDrawer;
