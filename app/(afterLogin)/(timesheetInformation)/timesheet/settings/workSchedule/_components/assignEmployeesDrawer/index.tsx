'use client';

import { useEffect, useMemo } from 'react';
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
import { useGetAllUsers } from '@/store/server/features/employees/employeeManagment/queries';
import { formatTimeRange } from '@/store/server/features/timesheet/workSchedule/helpers';

const EMPTY_MOCK_EMPLOYEES: NonNullable<
  ReturnType<typeof useGetMockEmployees>['data']
> = [];
const EMPTY_ASSIGNMENTS: NonNullable<
  ReturnType<typeof useGetAssignments>['data']
> = [];
const EMPTY_SHIFT_IDS: string[] = [];

const AssignEmployeesDrawer = () => {
  const { isAssignDrawerOpen, selectedBlueprintId, closeAssignDrawer } =
    useWorkScheduleUiStore();
  const [form] = Form.useForm();
  const { data: mockEmployeesData } = useGetMockEmployees();
  const mockEmployees = mockEmployeesData ?? EMPTY_MOCK_EMPLOYEES;
  const { data: allUsers } = useGetAllUsers();
  const { data: blueprint } = useGetBlueprint(selectedBlueprintId);
  const { data: assignmentsData } = useGetAssignments(
    selectedBlueprintId ?? undefined,
  );
  const assignments = assignmentsData ?? EMPTY_ASSIGNMENTS;
  const { mutate: assignEmployees, isLoading: isAssigning } =
    useAssignEmployees();
  const { mutate: unassignEmployee, isLoading: isUnassigning } =
    useUnassignEmployee();
  const selectedShiftIds =
    Form.useWatch('shiftIds', form) ?? EMPTY_SHIFT_IDS;

  useEffect(() => {
    if (!isAssignDrawerOpen) {
      form.resetFields();
      return;
    }
    form.setFieldsValue({
      userIds: undefined,
      shiftIds: blueprint?.hasShifts
        ? (blueprint.shifts || []).map((shift) => shift.id)
        : [],
    });
  }, [isAssignDrawerOpen, blueprint, form]);

  const assignedUserIds = useMemo(
    () => assignments.map((item) => item.userId),
    [assignments],
  );

  const employeeOptions = useMemo(() => {
    const liveUsers = Array.isArray(allUsers) ? allUsers : [];
    if (liveUsers.length) {
      return liveUsers
        .filter((user: any) => user?.id && !assignedUserIds.includes(user.id))
        .map((user: any) => ({
          value: user.id,
          label:
            `${user.firstName || ''} ${user.middleName || ''} ${user.lastName || ''}`
              .replace(/\s+/g, ' ')
              .trim() ||
            user.email ||
            user.id,
          profile: {
            id: user.id,
            firstName: user.firstName || 'Employee',
            lastName: user.lastName || '',
            email: user.email || '',
            jobTitle: user.employeeJobInformation?.[0]?.position?.name || '',
          },
        }));
    }
    return mockEmployees
      .filter((item) => !assignedUserIds.includes(item.id))
      .map((item) => ({
        value: item.id,
        label: `${getEmployeeDisplayName(item)} · ${item.jobTitle}`,
        profile: item,
      }));
  }, [allUsers, mockEmployees, assignedUserIds]);

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

  const handleFinish = (values: { userIds: string[]; shiftIds?: string[] }) => {
    if (!selectedBlueprintId) return;
    const selectedProfiles = employeeOptions
      .filter((item) => (values.userIds || []).includes(item.value))
      .map((item) => item.profile);
    assignEmployees(
      {
        blueprintId: selectedBlueprintId,
        userIds: values.userIds || [],
        shiftIds: blueprint?.hasShifts ? values.shiftIds || [] : [],
        employees: selectedProfiles,
      },
      {
        onSuccess: () => {
          form.resetFields(['userIds']);
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
            ? 'Choose which shifts each employee should work. Only selected shifts will be generated.'
            : 'No shifts configured. Employees keep the day hours only.'}
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
              placeholder="Select employees"
              optionFilterProp="label"
              options={employeeOptions.map((item) => ({
                value: item.value,
                label: item.label,
              }))}
              data-cy="time-attendance-settings-work-schedule-assign-select"
            />
          </Form.Item>
          {blueprint?.hasShifts && (
            <Form.Item
              name="shiftIds"
              label="Shifts"
              rules={[
                {
                  required: true,
                  message: 'Select at least one shift',
                },
              ]}
              extra={
                selectedShiftIds.length
                  ? `${selectedShiftIds.length} of ${(blueprint.shifts || []).length} shifts selected`
                  : undefined
              }
            >
              <Select
                mode="multiple"
                placeholder="Select shifts"
                options={(blueprint.shifts || []).map((shift) => ({
                  value: shift.id,
                  label: `${shift.name} · ${formatTimeRange(shift.startTime, shift.endTime)}`,
                }))}
                data-cy="time-attendance-settings-work-schedule-assign-shifts"
              />
            </Form.Item>
          )}
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
              const employee =
                mockEmployees.find((item) => item.id === assignment.userId) ||
                (Array.isArray(allUsers)
                  ? allUsers.find((item: any) => item.id === assignment.userId)
                  : null);
              const name = employee
                ? 'firstName' in employee
                  ? getEmployeeDisplayName(employee as any)
                  : `${(employee as any).firstName || ''} ${(employee as any).lastName || ''}`.trim()
                : assignment.userId;
              const assignedShifts = (blueprint?.shifts || []).filter((shift) =>
                (assignment.shiftIds || []).includes(shift.id),
              );
              return (
                <div
                  key={assignment.id}
                  className="flex items-center justify-between gap-2 border border-gray-200 rounded-lg px-3 py-2"
                  data-cy={`time-attendance-settings-work-schedule-assign-item-${assignment.id}`}
                >
                  <div
                    className="min-w-0"
                    data-cy={`time-attendance-settings-work-schedule-assign-item-info-${assignment.id}`}
                  >
                    <p
                      className="mb-1 text-sm font-medium text-[#4d4d4d]"
                      data-cy={`time-attendance-settings-work-schedule-assign-item-name-${assignment.id}`}
                    >
                      {name}
                    </p>
                    <div
                      className="flex flex-wrap gap-1"
                      data-cy={`time-attendance-settings-work-schedule-assign-item-shifts-${assignment.id}`}
                    >
                      {assignedShifts.length > 0 ? (
                        assignedShifts.map((shift) => (
                          <Tag
                            key={shift.id}
                            color="blue"
                            className="!m-0 !text-[11px]"
                          >
                            {shift.name}
                          </Tag>
                        ))
                      ) : (
                        <Tag className="!m-0 !text-[11px]">Day hours only</Tag>
                      )}
                    </div>
                  </div>
                  <Tag
                    className="cursor-pointer shrink-0"
                    color="error"
                    onClick={() =>
                      selectedBlueprintId &&
                      unassignEmployee({
                        blueprintId: selectedBlueprintId,
                        userId: assignment.userId,
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
