'use client';

import { useMemo } from 'react';
import { Form, Select, Tag } from 'antd';
import CustomDrawerLayout from '@/components/common/customDrawer';
import CustomDrawerHeader from '@/components/common/customDrawer/customDrawerHeader';
import CustomDrawerFooterButton, {
  CustomDrawerFooterButtonProps,
} from '@/components/common/customDrawer/customDrawerFooterButton';
import { useWorkScheduleUiStore } from '@/store/uistate/features/timesheet/workSchedule';
import {
  useGetAssignments,
  useGetBlueprint,
  useGetMockEmployees,
} from '@/store/server/features/timesheet/workSchedule/queries';
import {
  useAssignEmployees,
  useUnassignEmployee,
} from '@/store/server/features/timesheet/workSchedule/mutation';
import { getEmployeeDisplayName } from '@/store/server/features/timesheet/workSchedule/mockService';

const AssignEmployeesDrawer = () => {
  const { isAssignDrawerOpen, selectedBlueprintId, closeAssignDrawer } =
    useWorkScheduleUiStore();
  const [form] = Form.useForm();
  const { data: employees = [] } = useGetMockEmployees();
  const { data: blueprint } = useGetBlueprint(selectedBlueprintId);
  const { data: assignments = [] } = useGetAssignments(
    selectedBlueprintId ?? undefined,
  );
  const { mutate: assignEmployees, isLoading: isAssigning } =
    useAssignEmployees();
  const { mutate: unassignEmployee, isLoading: isUnassigning } =
    useUnassignEmployee();

  const assignedUserIds = useMemo(
    () => assignments.map((item) => item.userId),
    [assignments],
  );

  const availableEmployees = employees.filter(
    (item) => !assignedUserIds.includes(item.id),
  );

  const onClose = () => {
    form.resetFields();
    closeAssignDrawer();
  };

  const footerButtons: CustomDrawerFooterButtonProps[] = [
    {
      label: 'Cancel',
      key: 'cancel',
      className: 'h-[40px] text-sm border-1 border-[#D9D9D9] text-[#4d4d4d]',
      size: 'large',
      onClick: onClose,
      id: 'time-attendance-settings-work-schedule-assign-cancel',
      'data-cy': 'time-attendance-settings-work-schedule-assign-cancel',
    },
    {
      label: 'Assign',
      key: 'assign',
      className: 'h-[40px] text-sm',
      size: 'large',
      type: 'primary',
      loading: isAssigning,
      onClick: () => form.submit(),
      id: 'time-attendance-settings-work-schedule-assign-submit',
      'data-cy': 'time-attendance-settings-work-schedule-assign-submit',
    },
  ];

  const handleFinish = (values: { userIds: string[] }) => {
    if (!selectedBlueprintId) return;
    assignEmployees(
      {
        blueprintId: selectedBlueprintId,
        userIds: values.userIds || [],
      },
      {
        onSuccess: () => {
          form.resetFields();
        },
      },
    );
  };

  return (
    <CustomDrawerLayout
      open={isAssignDrawerOpen}
      onClose={onClose}
      width="40%"
      modalHeader={
        <CustomDrawerHeader>
          Assign employees
          {blueprint ? ` · ${blueprint.title}` : ''}
        </CustomDrawerHeader>
      }
      footer={
        <CustomDrawerFooterButton
          className="w-full bg-[#fff] flex justify-between space-x-5 p-4"
          buttons={footerButtons}
        />
      }
    >
      <div data-cy="time-attendance-settings-work-schedule-assign-drawer">
        <p
          className="text-sm text-gray-500 mb-4"
          data-cy="time-attendance-settings-work-schedule-assign-help"
        >
          {blueprint?.hasShifts
            ? 'Assigning employees will generate shift cards for every configured shift on each active weekday.'
            : 'No shifts configured. Employees keep the day hours only — no swappable shift cards will be generated.'}
        </p>
        <Form layout="vertical" form={form} onFinish={handleFinish}>
          <Form.Item
            name="userIds"
            label="Employees"
            rules={[
              { required: true, message: 'Select at least one employee' },
            ]}
          >
            <Select
              mode="multiple"
              placeholder="Select mock employees"
              options={availableEmployees.map((item) => ({
                value: item.id,
                label: `${getEmployeeDisplayName(item)} · ${item.jobTitle}`,
              }))}
              data-cy="time-attendance-settings-work-schedule-assign-select"
            />
          </Form.Item>
        </Form>

        <div
          className="mt-4"
          data-cy="time-attendance-settings-work-schedule-assign-current"
        >
          <p
            className="text-sm font-semibold text-[#4d4d4d] mb-2"
            data-cy="time-attendance-settings-work-schedule-assign-current-title"
          >
            Currently assigned
          </p>
          {assignments.length === 0 && (
            <p
              className="text-sm text-gray-500"
              data-cy="time-attendance-settings-work-schedule-assign-empty"
            >
              No employees assigned yet.
            </p>
          )}
          <div
            className="flex flex-col gap-2"
            data-cy="time-attendance-settings-work-schedule-assign-list"
          >
            {assignments.map((assignment) => {
              const employee = employees.find(
                (item) => item.id === assignment.userId,
              );
              if (!employee) return null;
              return (
                <div
                  key={assignment.id}
                  className="flex items-center justify-between border border-gray-200 rounded-lg px-3 py-2"
                  data-cy={`time-attendance-settings-work-schedule-assign-item-${assignment.id}`}
                >
                  <div
                    data-cy={`time-attendance-settings-work-schedule-assign-item-info-${assignment.id}`}
                  >
                    <p
                      className="mb-0 text-sm font-medium text-[#4d4d4d]"
                      data-cy={`time-attendance-settings-work-schedule-assign-item-name-${assignment.id}`}
                    >
                      {getEmployeeDisplayName(employee)}
                    </p>
                    <p
                      className="mb-0 text-xs text-gray-500"
                      data-cy={`time-attendance-settings-work-schedule-assign-item-role-${assignment.id}`}
                    >
                      {employee.jobTitle}
                    </p>
                  </div>
                  <Tag
                    className="cursor-pointer"
                    color="error"
                    onClick={() =>
                      selectedBlueprintId &&
                      unassignEmployee({
                        blueprintId: selectedBlueprintId,
                        userId: employee.id,
                      })
                    }
                  >
                    {isUnassigning ? 'Removing...' : 'Unassign'}
                  </Tag>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </CustomDrawerLayout>
  );
};

export default AssignEmployeesDrawer;
