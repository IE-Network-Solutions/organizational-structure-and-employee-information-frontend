'use client';

import React, { useEffect, useState, useMemo } from 'react';
import {
  Form,
  Input,
  Select,
  InputNumber,
  Switch,
  Drawer,
  Button,
  Radio,
  TimePicker,
  Avatar,
  Space,
  Spin,
} from 'antd';
import dayjs from 'dayjs';
import {
  useCreateCheckInRule,
  useUpdateCheckInRule,
} from '@/store/server/features/okrplanning/monitoring-evaluation/check-in-rule/mutations';
import { CheckInRule } from '@/types/okr/check-in-rule';
import { useDefaultPlanningPeriods } from '@/store/server/features/okrPlanningAndReporting/queries';
import { PlanningPeriod } from '@/store/uistate/features/okrplanning/okrSetting/interface';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { useQueryClient } from 'react-query';
import { useFetchAllFeedbackTypes } from '@/store/server/features/feedback/feedbackType/queries';
import { useGetAllFeedbackRecords } from '@/store/server/features/feedback/feedbackRecord/mutation';
import { useGetDepartmentsWithUsers } from '@/store/server/features/employees/employeeManagment/department/queries';
import { useGetEmployee } from '@/store/server/features/employees/employeeDetail/queries';
import { FeedbackTypeItems } from '@/store/server/features/CFR/conversation/action-plan/interface';

interface CheckInRuleDrawerProps {
  open: boolean;
  onClose: () => void;
  checkInRule: Partial<CheckInRule> | null;
  onSuccess?: () => void;
}

// EmployeeDetails component for user selection
const EmployeeDetails = ({
  empId,
  fallbackProfileImage,
}: {
  empId: string;
  fallbackProfileImage?: string;
}) => {
  const { data: userDetails, isLoading, error } = useGetEmployee(empId);

  if (isLoading)
    return (
      <>
        <Spin data-cy={`okr-checkin-rule-employee-details-spin-${empId}`} />
      </>
    );

  if (error || !userDetails) return '-';

  const userName =
    `${userDetails?.firstName} ${userDetails?.middleName} ${userDetails?.lastName} ` ||
    '-';
  const profileImage = fallbackProfileImage;

  return (
    <Space
      size="small"
      id={`okr-checkin-rule-employee-details-space-${empId}`}
      data-cy={`okr-checkin-rule-employee-details-space-${empId}`}
    >
      <Avatar
        src={profileImage}
        className="h-5 w-5"
        data-cy={`okr-checkin-rule-employee-details-avatar-${empId}`}
      />
      {userName}
    </Space>
  );
};

const CheckInRuleDrawer: React.FC<CheckInRuleDrawerProps> = ({
  open,
  onClose,
  checkInRule,
  onSuccess,
}) => {
  const [form] = Form.useForm();
  const { mutate: createCheckInRule } = useCreateCheckInRule();
  const { mutate: updateCheckInRule } = useUpdateCheckInRule();
  const { data: planningPeriodsData } = useDefaultPlanningPeriods();
  const { data: feedbackTypesData } = useFetchAllFeedbackTypes();
  const { mutate: getAllFeedback, data: feedbackData } =
    useGetAllFeedbackRecords();
  const { data: departmentData } = useGetDepartmentsWithUsers();
  const { tenantId } = useAuthenticationStore();
  const queryClient = useQueryClient();
  const [selectedCategoryId, setSelectedCategoryId] = useState<
    string | undefined
  >();
  const [ruleType, setRuleType] = useState<
    'time-based' | 'achievement-based' | 'both'
  >('time-based');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [applicableDays, setApplicableDays] = useState<Record<string, boolean>>(
    {},
  );
  const [selectedDepartmentIds, setSelectedDepartmentIds] = useState<string[]>(
    [],
  );
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
  const [userTypeFilter, setUserTypeFilter] = useState<
    'all' | 'team leads' | 'team members'
  >('all');
  const [selectedUsers, setSelectedUsers] = useState<any[]>([]);

  const handleDrawerClose = () => {
    form.resetFields();
    setSelectedCategoryId(undefined);
    setApplicableDays({});
    setStartDaySelection({});
    setEndDaySelection({});
    // Reset user selection state
    setSelectedDepartmentIds([]);
    setFilteredUsers([]);
    setUserTypeFilter('all');
    setSelectedUsers([]);
    onClose();
  };

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategoryId(categoryId);
    // Clear the feedback selection when category changes
    form.setFieldValue('feedbackId', undefined);
  };

  const handleToggleChange = (dayId: string, checked: boolean) => {
    setApplicableDays((prev) => ({
      ...prev,
      [dayId]: checked,
    }));

    // Clear time values when toggle is turned off
    if (!checked) {
      form.setFieldValue(`startTime_${dayId}`, undefined);
      form.setFieldValue(`endTime_${dayId}`, undefined);
    }
  };
  const weekDays = useMemo(
    () => [
      { id: 'monday', name: 'Monday' },
      { id: 'tuesday', name: 'Tuesday' },
      { id: 'wednesday', name: 'Wednesday' },
      { id: 'thursday', name: 'Thursday' },
      { id: 'friday', name: 'Friday' },
      { id: 'saturday', name: 'Saturday' },
      { id: 'sunday', name: 'Sunday' },
    ],
    [],
  );
  const [endDaySelection, setEndDaySelection] = useState<
    Record<string, string>
  >({});
  const [startDaySelection, setStartDaySelection] = useState<
    Record<string, string>
  >({});

  // User selection handlers
  const handleDepartmentChange = (departmentIds: string[]) => {
    setSelectedDepartmentIds(departmentIds);

    if (departmentIds.length === 0) {
      setFilteredUsers([]);
      setSelectedUsers([]);
      form.setFieldValue('selectedUserIds', []);
      return;
    }

    // Get all users from selected departments
    const allUsers: any[] = [];
    departmentIds.forEach((deptId) => {
      const department = departmentData?.find(
        (dept: any) => dept.id === deptId,
      );
      if (department?.users) {
        // Add department information to each user
        const usersWithDept = department.users.map((user: any) => ({
          ...user,
          departmentName: department.name,
          departmentId: department.id,
        }));
        allUsers.push(...usersWithDept);
      }
    });

    // Apply user type filter
    let filteredUsersList = allUsers;
    if (userTypeFilter !== 'all') {
      filteredUsersList = allUsers.filter((user: any) => {
        if (userTypeFilter === 'team leads') {
          return user?.employeeJobInformation?.find(
            (job: any) => job.isPositionActive,
          )?.departmentLeadOrNot;
        } else if (userTypeFilter === 'team members') {
          return !user?.employeeJobInformation?.find(
            (job: any) => job.isPositionActive,
          )?.departmentLeadOrNot;
        }
        return true;
      });
    }

    setFilteredUsers(filteredUsersList);

    // Automatically select all filtered users
    setSelectedUsers(filteredUsersList);
    form.setFieldValue(
      'selectedUserIds',
      filteredUsersList.map((user) => user.id),
    );
  };

  const handleUserTypeFilter = (
    filter: 'all' | 'team leads' | 'team members',
  ) => {
    setUserTypeFilter(filter);

    if (selectedDepartmentIds.length === 0) {
      return;
    }

    // Re-filter users with new filter
    const allUsers: any[] = [];
    selectedDepartmentIds.forEach((deptId) => {
      const department = departmentData?.find(
        (dept: any) => dept.id === deptId,
      );
      if (department?.users) {
        // Add department information to each user
        const usersWithDept = department.users.map((user: any) => ({
          ...user,
          departmentName: department.name,
          departmentId: department.id,
        }));
        allUsers.push(...usersWithDept);
      }
    });

    let filteredUsersList = allUsers;
    if (filter !== 'all') {
      filteredUsersList = allUsers.filter((user: any) => {
        if (filter === 'team leads') {
          return user?.employeeJobInformation?.find(
            (job: any) => job.isPositionActive,
          )?.departmentLeadOrNot;
        } else if (filter === 'team members') {
          return !user?.employeeJobInformation?.find(
            (job: any) => job.isPositionActive,
          )?.departmentLeadOrNot;
        }
        return true;
      });
    }

    setFilteredUsers(filteredUsersList);

    // Automatically select all filtered users
    setSelectedUsers(filteredUsersList);
    form.setFieldValue(
      'selectedUserIds',
      filteredUsersList.map((user) => user.id),
    );
  };

  const handleUserSelection = (selectedUserIds: string[]) => {
    // Get the full user objects for selected users
    const selectedUserObjects = filteredUsers.filter((user) =>
      selectedUserIds.includes(user.id),
    );
    setSelectedUsers(selectedUserObjects);
  };

  const handleEndDayChange = (startDayId: string, endDayId: string) => {
    setEndDaySelection((prev) => ({
      ...prev,
      [startDayId]: endDayId,
    }));

    // Clear validation error for end time when end day changes
    form.validateFields([`endTime_${startDayId}`]);
  };

  const handleStartDayChange = (dayId: string, startDayId: string) => {
    setStartDaySelection((prev) => ({
      ...prev,
      [dayId]: startDayId,
    }));

    // Trigger validation for end time when start day changes
    form.validateFields([`endTime_${dayId}`]);
  };

  const handleStartTimeChange = (dayId: string) => {
    // Trigger validation for end time when start time changes
    form.validateFields([`endTime_${dayId}`]);
  };

  const onFinish = (values: any) => {
    setIsSubmitting(true); // Start loading

    // Transform form values to match backend expectations
    const formData: any = {
      name: values.name?.trim() || '',
      description: values.description?.trim() || '',
      appliesTo: values.appliesTo,
      planningPeriodId: values.planningPeriodId,
      timeBased: ruleType === 'time-based' || ruleType === 'both',
      achievementBased: ruleType === 'achievement-based' || ruleType === 'both',
      frequency: parseInt(values.frequency) || 1,
      tenantId: tenantId,
      categoryId: values.categoryId,
      feedbackId: values.feedbackId,
      // User selection - only send the final user IDs
      userIds: selectedUsers.map((user) => user.id),
    };

    // Only include operation if rule type requires it
    if (ruleType === 'achievement-based' || ruleType === 'both') {
      formData.operation = values.operation;
    } else {
      // Explicitly set to null for time-based rules to clear from database
      formData.operation = null;
    }

    // Only include target if rule type requires it
    if (ruleType === 'achievement-based' || ruleType === 'both') {
      formData.target = values.targetValue
        ? parseFloat(values.targetValue)
        : undefined;
    } else {
      // Explicitly set to null for time-based rules to clear from database
      formData.target = null;
    }

    // Only include target date if rule type requires it
    if (ruleType === 'time-based' || ruleType === 'both') {
      formData.targetDate = (() => {
        // Create targetDate array with selected applicable days and their times
        const targetDateArray = weekDays
          .filter((day) => {
            const isApplicable = values[`isApplicable_${day.id}`];
            return isApplicable;
          })
          .map((day) => {
            // Get the start day (could be same day or previous day)
            const startDayId = startDaySelection[day.id] || day.id;

            const startTime = values[`startTime_${day.id}`]
              ? values[`startTime_${day.id}`].format('HH:mm')
              : '09:00';

            // Get the end day (could be same day or next day)
            const endDayId = endDaySelection[day.id] || day.id;

            const endTime = values[`endTime_${day.id}`]
              ? values[`endTime_${day.id}`].format('HH:mm')
              : '17:00';

            // Backend expects this exact format
            const dayData = {
              date: day.id, // "monday" - the day this rule applies to (the switched on day)
              startDay: startDayId, // "friday"
              startTime: startTime, // "17:30"
              endDay: endDayId, // "monday"
              endTime: endTime, // "07:30"
            };

            return dayData;
          });

        return targetDateArray;
      })();
    } else {
      // Explicitly set to null for achievement-based rules to clear from database
      formData.targetDate = null;
    }

    if (checkInRule?.id) {
      updateCheckInRule(
        { ...formData, id: checkInRule.id },
        {
          onSuccess: () => {
            setIsSubmitting(false); // Stop loading
            // More comprehensive query invalidation
            queryClient.invalidateQueries({ queryKey: ['checkInRule'] });
            queryClient.invalidateQueries({ queryKey: ['checkInRule', ''] });
            queryClient.refetchQueries({ queryKey: ['checkInRule'] });

            // Call parent onSuccess callback if provided
            if (onSuccess) {
              onSuccess();
            }

            // Longer delay to ensure backend processing and query refetch completes
            setTimeout(() => {
              handleDrawerClose();
            }, 1000);
          },
          onError: () => {
            setIsSubmitting(false); // Stop loading on error
          },
        },
      );
    } else {
      createCheckInRule(formData, {
        onSuccess: () => {
          setIsSubmitting(false); // Stop loading
          // More comprehensive query invalidation
          queryClient.invalidateQueries({ queryKey: ['checkInRule'] });
          queryClient.invalidateQueries({ queryKey: ['checkInRule', ''] });
          queryClient.refetchQueries({ queryKey: ['checkInRule'] });

          // Call parent onSuccess callback if provided
          if (onSuccess) {
            onSuccess();
          }

          // Longer delay to ensure backend processing and query refetch completes
          setTimeout(() => {
            handleDrawerClose();
          }, 1000);
        },
        onError: () => {
          setIsSubmitting(false); // Stop loading on error
        },
      });
    }
  };

  // Fetch feedback data when component mounts
  useEffect(() => {
    getAllFeedback();
  }, [getAllFeedback]);

  // Set form values when CheckInRule changes
  useEffect(() => {
    if (checkInRule) {
      // For planning period, we need to ensure the ID exists in the options
      const formValues: any = { ...checkInRule };

      // If we have planning periods data and a planning period ID, verify it exists
      if (planningPeriodsData?.items && checkInRule.planningPeriodId) {
        const periodExists = planningPeriodsData.items.find(
          (period: PlanningPeriod) =>
            period.id === checkInRule.planningPeriodId,
        );

        // Only set the planning period ID if it exists in the current options
        if (!periodExists) {
          formValues.planningPeriodId = undefined;
        }
      }

      // Map target property to targetValue form field
      if (checkInRule.target !== undefined) {
        formValues.targetValue = checkInRule.target;
      }

      // Ensure operation field is properly set for editing
      if (checkInRule.operation !== undefined) {
        formValues.operation = checkInRule.operation;
      }

      // Set selectedCategoryId for feedback filtering
      if (checkInRule.categoryId) {
        setSelectedCategoryId(checkInRule.categoryId);
      }

      // Determine rule type based on timeBased and achievementBased flags
      let determinedRuleType: 'time-based' | 'achievement-based' | 'both';
      if (checkInRule.timeBased && checkInRule.achievementBased) {
        determinedRuleType = 'both';
      } else if (checkInRule.timeBased) {
        determinedRuleType = 'time-based';
      } else if (checkInRule.achievementBased) {
        determinedRuleType = 'achievement-based';
      } else {
        determinedRuleType = 'time-based';
      }

      setRuleType(determinedRuleType);
      formValues.ruleType = determinedRuleType;

      // Set user selection fields if they exist
      if (checkInRule.selectedDepartmentIds) {
        formValues.selectedDepartmentIds = checkInRule.selectedDepartmentIds;
        setSelectedDepartmentIds(checkInRule.selectedDepartmentIds);
      }
      if (checkInRule.selectedUserIds) {
        formValues.selectedUserIds = checkInRule.selectedUserIds;
      }
      if (checkInRule.userTypeFilter) {
        formValues.userTypeFilter = checkInRule.userTypeFilter;
        setUserTypeFilter(checkInRule.userTypeFilter);
      }

      // Handle case where backend sends userIds instead of selectedUserIds
      if (checkInRule.userIds && !checkInRule.selectedUserIds) {
        formValues.selectedUserIds = checkInRule.userIds;
        // We'll set the department IDs in the useEffect that handles user population
      }

      // Set applicable days if targetDate exists in the checkInRule
      if (checkInRule.targetDate && checkInRule.targetDate.length > 0) {
        const applicableDaysState: Record<string, boolean> = {};

        // Initialize all days as not applicable
        weekDays.forEach((day) => {
          formValues[`isApplicable_${day.id}`] = false;
          applicableDaysState[day.id] = false;
        });

        // Populate days that exist in the database with their switches ON and times
        checkInRule.targetDate.forEach((timeEntry: any) => {
          // Backend format: { date: "monday", startDay: "friday", startTime: "17:30", endDay: "monday", endTime: "07:30" }
          const dayId = timeEntry.date; // The day this rule applies to (the switched on day)
          const startDayId = timeEntry.startDay;
          const endDayId = timeEntry.endDay;

          // Find matching day by date (the day this rule applies to)
          const matchingDay = weekDays.find((day) => day.id === dayId);

          if (matchingDay) {
            // Set the applicable day toggle to true for days that have time entries
            formValues[`isApplicable_${matchingDay.id}`] = true;
            applicableDaysState[matchingDay.id] = true;

            // Handle start time
            const startTime = timeEntry.startTime;
            if (startTime) {
              // Use only 24-hour format (HH:mm)
              formValues[`startTime_${matchingDay.id}`] = dayjs(
                startTime,
                'HH:mm',
              );
            }

            // Handle end time
            const endTime = timeEntry.endTime;
            if (endTime) {
              // Use only 24-hour format (HH:mm)
              formValues[`endTime_${matchingDay.id}`] = dayjs(endTime, 'HH:mm');
            }

            // Set start day selection
            if (startDayId) {
              setStartDaySelection((prev) => ({
                ...prev,
                [matchingDay.id]: startDayId,
              }));
            }

            // Set end day selection
            if (endDayId) {
              setEndDaySelection((prev) => ({
                ...prev,
                [matchingDay.id]: endDayId,
              }));
            }
          }
        });

        // Set applicable days state
        setApplicableDays(applicableDaysState);
      }

      // Use setTimeout to ensure form is fully populated before validation
      setTimeout(() => {
        form.setFieldsValue(formValues);
      }, 100);
    } else {
      form.resetFields();
      setRuleType('time-based');
      setSelectedCategoryId(undefined);
      setApplicableDays({});
    }
  }, [checkInRule, form, planningPeriodsData, weekDays]);

  // useEffect to populate filtered users when editing existing rules
  useEffect(() => {
    if (checkInRule && departmentData) {
      // If we have selectedDepartmentIds, use the existing logic
      if (
        checkInRule.selectedDepartmentIds &&
        checkInRule.selectedDepartmentIds.length > 0
      ) {
        const allUsers: any[] = [];
        checkInRule.selectedDepartmentIds.forEach((deptId) => {
          const department = departmentData.find(
            (dept: any) => dept.id === deptId,
          );
          if (department?.users) {
            // Add department information to each user
            const usersWithDept = department.users.map((user: any) => ({
              ...user,
              departmentName: department.name,
              departmentId: department.id,
            }));
            allUsers.push(...usersWithDept);
          }
        });

        // Apply user type filter - use same logic as VP configuration
        let filteredUsersList = allUsers;
        const currentUserTypeFilter = checkInRule.userTypeFilter || 'all';
        if (currentUserTypeFilter !== 'all') {
          filteredUsersList = allUsers.filter((user: any) => {
            if (currentUserTypeFilter === 'team leads') {
              return user?.employeeJobInformation?.find(
                (job: any) => job.isPositionActive,
              )?.departmentLeadOrNot;
            } else if (currentUserTypeFilter === 'team members') {
              return !user?.employeeJobInformation?.find(
                (job: any) => job.isPositionActive,
              )?.departmentLeadOrNot;
            }
            return true;
          });
        }

        setFilteredUsers(filteredUsersList);

        // Also populate selectedUsers state if there are selected user IDs
        const userIdsToSelect =
          checkInRule.selectedUserIds || checkInRule.userIds;

        if (userIdsToSelect && userIdsToSelect.length > 0) {
          const selectedUserObjects = filteredUsersList.filter((user) =>
            userIdsToSelect.includes(user.id),
          );

          setSelectedUsers(selectedUserObjects);
        }
      }
      // If we only have userIds but no selectedDepartmentIds, we need to find users from all departments
      else if (checkInRule.userIds && checkInRule.userIds.length > 0) {
        const allUsers: any[] = [];
        // Search through all departments to find the users
        departmentData.forEach((department: any) => {
          if (department?.users) {
            const usersWithDept = department.users.map((user: any) => ({
              ...user,
              departmentName: department.name,
              departmentId: department.id,
            }));
            allUsers.push(...usersWithDept);
          }
        });

        // Find the specific users that were selected
        const selectedUserObjects = allUsers.filter((user) =>
          checkInRule.userIds?.includes(user.id),
        );

        // Set the selected users
        setSelectedUsers(selectedUserObjects);

        // For filtered users, we can either show all users from the same departments as selected users,
        // or show all users. Let's show all users for now.
        setFilteredUsers(allUsers);

        // Set the department IDs based on the selected users' departments
        const uniqueDepartmentIds = [
          ...new Set(selectedUserObjects.map((user) => user.departmentId)),
        ];
        setSelectedDepartmentIds(uniqueDepartmentIds);

        // Update form values with inferred department IDs
        form.setFieldValue('selectedDepartmentIds', uniqueDepartmentIds);
      }
    }
  }, [checkInRule, departmentData, form]);

  const modalHeader = (
    <div
      className="flex justify-center text-xl font-extrabold text-gray-800 p-4"
      id="okr-checkin-rule-drawer-header-display-div"
      data-cy="okr-checkin-rule-drawer-header-display-div"
    >
      {checkInRule ? 'Edit Check-in Rule' : 'Create Check-in Rule'}
    </div>
  );

  return (
    <Drawer
      open={open}
      onClose={handleDrawerClose}
      title={modalHeader}
      width="40%"
      className="responsive-drawer"
      id="okr-checkin-rule-drawer-display-drawer"
      data-cy="okr-checkin-rule-drawer-display-drawer"
    >
      <div
        className="overflow-hidden"
        id="okr-checkin-rule-drawer-content-wrapper-display-div"
        data-cy="okr-checkin-rule-drawer-content-wrapper-display-div"
      >
        <Form
          form={form}
          onFinish={onFinish}
          layout="vertical"
          initialValues={{
            ruleType: 'time-based',
            frequency: 1,
          }}
          className="space-y-6"
          id="okr-checkin-rule-drawer-form-display-form"
          data-cy="okr-checkin-rule-drawer-form-display-form"
        >
          <Form.Item
            label="Rule Name"
            name="name"
            rules={[
              { required: true, message: 'Please enter the rule name' },
              {
                max: 500,
                message:
                  'Rule name must be shorter than or equal to 500 characters',
              },
            ]}
            id="okr-checkin-rule-drawer-form-name-item-display-item"
            data-cy="okr-checkin-rule-drawer-form-name-item-display-item"
          >
            <Input
              className="h-12"
              placeholder="Enter rule name"
              id="okr-checkin-rule-drawer-form-name-input-display-input"
              data-cy="okr-checkin-rule-drawer-form-name-input-display-input"
            />
          </Form.Item>

          <Form.Item
            label="Description"
            name="description"
            id="okr-checkin-rule-drawer-form-description-item-display-item"
            data-cy="okr-checkin-rule-drawer-form-description-item-display-item"
          >
            <Input.TextArea
              rows={3}
              className="h-12"
              placeholder="Enter description (optional)"
              id="okr-checkin-rule-drawer-form-description-textarea-display-textarea"
              data-cy="okr-checkin-rule-drawer-form-description-textarea-display-textarea"
            />
          </Form.Item>

          <Form.Item
            label="Rule Applies To"
            name="appliesTo"
            rules={[
              {
                required: true,
                message: 'Please select what the rule applies to',
              },
            ]}
            id="okr-checkin-rule-drawer-form-applies-to-item-display-item"
            data-cy="okr-checkin-rule-drawer-form-applies-to-item-display-item"
          >
            <Select
              className="h-12"
              placeholder="Select what the rule applies to"
              options={[
                { value: 'Plan', label: 'Plan' },
                { value: 'Report', label: 'Report' },
              ]}
              optionLabelProp="label"
              optionRender={(option) => (
                <span
                  className="text-gray-700"
                  id={`okr-checkin-rule-drawer-form-applies-to-option-${option.value}`}
                  data-cy={`okr-checkin-rule-drawer-form-applies-to-option-${option.value}`}
                >
                  {option.label}
                </span>
              )}
              dropdownStyle={{
                border: 'none',
                boxShadow: 'none',
                borderRadius: '0',
              }}
              dropdownClassName="no-border-dropdown"
              id="okr-checkin-rule-drawer-form-applies-to-select-display-select"
              data-cy="okr-checkin-rule-drawer-form-applies-to-select-display-select"
            />
          </Form.Item>

          {/* User Selection Fields */}
          <Form.Item
            label="Department"
            name="selectedDepartmentIds"
            id="okr-checkin-rule-drawer-form-department-item-display-item"
            data-cy="okr-checkin-rule-drawer-form-department-item-display-item"
          >
            <Select
              mode="multiple"
              className="h-12"
              placeholder="Select Department"
              onChange={handleDepartmentChange}
              showSearch
              optionFilterProp="label"
              filterOption={(input, option) =>
                String(option?.label ?? '')
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
              options={
                departmentData?.map((dept: any) => ({
                  value: dept.id,
                  label: dept.name,
                })) || []
              }
              id="okr-checkin-rule-drawer-form-department-select-display-select"
              data-cy="okr-checkin-rule-drawer-form-department-select-display-select"
            />
          </Form.Item>

          <Form.Item
            label="User Type Filter"
            name="userTypeFilter"
            id="okr-checkin-rule-drawer-form-user-type-filter-item-display-item"
            data-cy="okr-checkin-rule-drawer-form-user-type-filter-item-display-item"
          >
            <Select
              className="h-12"
              placeholder="Select User Type"
              onChange={handleUserTypeFilter}
              defaultValue="all"
              options={[
                { value: 'all', label: 'All' },
                { value: 'team leads', label: 'Team Leads' },
                { value: 'team members', label: 'Team Members' },
              ]}
              id="okr-checkin-rule-drawer-form-user-type-filter-select-display-select"
              data-cy="okr-checkin-rule-drawer-form-user-type-filter-select-display-select"
            />
          </Form.Item>

          {/* User Selection with Chips */}
          <Form.Item
            label={
              <span
                id="okr-checkin-rule-drawer-form-users-label-display-span"
                data-cy="okr-checkin-rule-drawer-form-users-label-display-span"
              >
                <span
                  className="text-red-500"
                  id="okr-checkin-rule-drawer-form-users-label-required-display-span"
                  data-cy="okr-checkin-rule-drawer-form-users-label-required-display-span"
                >
                  *
                </span>{' '}
                Users
              </span>
            }
            name="selectedUserIds"
            rules={[
              { required: true, message: 'Please select at least one user' },
            ]}
            id="okr-checkin-rule-drawer-form-users-item-display-item"
            data-cy="okr-checkin-rule-drawer-form-users-item-display-item"
          >
            <Select
              mode="multiple"
              className="h-auto min-h-12"
              placeholder="Select users"
              onChange={handleUserSelection}
              value={selectedUsers.map((user) => user.id)}
              dropdownStyle={{
                border: 'none',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                borderRadius: '8px',
              }}
              optionRender={(option) => (
                <div
                  className="flex items-center space-x-2 py-2"
                  id={`okr-checkin-rule-drawer-form-users-option-wrapper-${option.value}`}
                  data-cy={`okr-checkin-rule-drawer-form-users-option-wrapper-${option.value}`}
                >
                  <span
                    className="text-gray-700"
                    id={`okr-checkin-rule-drawer-form-users-option-label-${option.value}`}
                    data-cy={`okr-checkin-rule-drawer-form-users-option-label-${option.value}`}
                  >
                    {option.label}
                  </span>
                </div>
              )}
              tagRender={(props) => {
                const { label, closable, onClose } = props;
                return (
                  <div
                    className="inline-flex items-center bg-gray-100 rounded-md px-2 py-1 m-1 text-sm"
                    id={`okr-checkin-rule-drawer-form-users-tag-${label}`}
                    data-cy={`okr-checkin-rule-drawer-form-users-tag-${label}`}
                  >
                    <span
                      className="text-gray-700"
                      id={`okr-checkin-rule-drawer-form-users-tag-label-${label}`}
                      data-cy={`okr-checkin-rule-drawer-form-users-tag-label-${label}`}
                    >
                      {label}
                    </span>
                    {closable && (
                      <button
                        type="button"
                        onClick={onClose}
                        className="ml-2 text-gray-400 hover:text-gray-600"
                        id={`okr-checkin-rule-drawer-form-users-tag-close-${label}`}
                        data-cy={`okr-checkin-rule-drawer-form-users-tag-close-${label}`}
                      >
                        ×
                      </button>
                    )}
                  </div>
                );
              }}
              id="okr-checkin-rule-drawer-form-users-select-display-select"
              data-cy="okr-checkin-rule-drawer-form-users-select-display-select"
            >
              {filteredUsers.map((user: any) => (
                <Select.Option
                  key={user.id}
                  value={user.id}
                  id={`okr-checkin-rule-drawer-form-users-option-${user.id}`}
                  data-cy={`okr-checkin-rule-drawer-form-users-option-${user.id}`}
                >
                  <EmployeeDetails
                    data-cy="okr-checkin-rule-employee-details-display-employee-details"
                    empId={user.id}
                  />
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Planning Period"
            name="planningPeriodId"
            rules={[
              { required: true, message: 'Please select planning period' },
            ]}
            id="okr-checkin-rule-drawer-form-planning-period-item-display-item"
            data-cy="okr-checkin-rule-drawer-form-planning-period-item-display-item"
          >
            <Select
              className="h-12"
              placeholder="Select planning period"
              showSearch
              optionFilterProp="label"
              options={
                planningPeriodsData?.items?.map((period: PlanningPeriod) => ({
                  value: period.id,
                  label: period.name,
                })) || []
              }
              filterOption={(input, option) =>
                String(option?.label ?? '')
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
              id="okr-checkin-rule-drawer-form-planning-period-select-display-select"
              data-cy="okr-checkin-rule-drawer-form-planning-period-select-display-select"
            />
          </Form.Item>

          {/* Frequency - shown for ALL rule types */}
          <Form.Item
            label="Frequency *"
            name="frequency"
            rules={[
              { required: true, message: 'Please enter frequency' },
              {
                type: 'number',
                min: 1,
                message: 'Frequency must be at least 1',
              },
            ]}
            id="okr-checkin-rule-drawer-form-frequency-item-display-item"
            data-cy="okr-checkin-rule-drawer-form-frequency-item-display-item"
          >
            <InputNumber
              type="number"
              min={1}
              className="w-full h-12"
              placeholder="Enter frequency"
              id="okr-checkin-rule-drawer-form-frequency-input-display-input"
              data-cy="okr-checkin-rule-drawer-form-frequency-input-display-input"
            />
          </Form.Item>

          <Form.Item
            label="Rule Type"
            name="ruleType"
            rules={[{ required: true, message: 'Please select rule type' }]}
            id="okr-checkin-rule-drawer-form-rule-type-item-display-item"
            data-cy="okr-checkin-rule-drawer-form-rule-type-item-display-item"
          >
            <Radio.Group
              value={ruleType}
              onChange={(e) => {
                const newRuleType = e.target.value;
                setRuleType(newRuleType);
                form.setFieldValue('ruleType', newRuleType);

                // Clear fields that are not needed for the new rule type
                if (newRuleType === 'time-based') {
                  // Time-based doesn't need operation or target value
                  form.setFieldValue('operation', undefined);
                  form.setFieldValue('targetValue', undefined);
                } else if (newRuleType === 'achievement-based') {
                  // Achievement-based doesn't need target date
                  setApplicableDays({});
                }
                // For 'both', we keep all fields as they are
              }}
              className="w-full"
              id="okr-checkin-rule-drawer-form-rule-type-radio-group-display-radio-group"
              data-cy="okr-checkin-rule-drawer-form-rule-type-radio-group-display-radio-group"
            >
              <div
                className="grid grid-cols-1 sm:grid-cols-3 gap-2 w-full"
                id="okr-checkin-rule-drawer-form-rule-type-options-wrapper-display-div"
                data-cy="okr-checkin-rule-drawer-form-rule-type-options-wrapper-display-div"
              >
                <Radio
                  value="time-based"
                  className="w-full"
                  id="okr-checkin-rule-drawer-form-rule-type-radio-time-based-display-radio"
                  data-cy="okr-checkin-rule-drawer-form-rule-type-radio-time-based-display-radio"
                >
                  <div
                    className="text-center p-2"
                    id="okr-checkin-rule-drawer-form-rule-type-radio-time-based-content-display-div"
                    data-cy="okr-checkin-rule-drawer-form-rule-type-radio-time-based-content-display-div"
                  >
                    <div
                      className="font-medium text-sm sm:text-base"
                      id="okr-checkin-rule-drawer-form-rule-type-radio-time-based-label-display-div"
                      data-cy="okr-checkin-rule-drawer-form-rule-type-radio-time-based-label-display-div"
                    >
                      Time-Based
                    </div>
                  </div>
                </Radio>
                <Radio
                  value="achievement-based"
                  className="w-full"
                  id="okr-checkin-rule-drawer-form-rule-type-radio-achievement-based-display-radio"
                  data-cy="okr-checkin-rule-drawer-form-rule-type-radio-achievement-based-display-radio"
                >
                  <div
                    className="text-center p-2"
                    id="okr-checkin-rule-drawer-form-rule-type-radio-achievement-based-content-display-div"
                    data-cy="okr-checkin-rule-drawer-form-rule-type-radio-achievement-based-content-display-div"
                  >
                    <div
                      className="font-medium text-sm sm:text-base"
                      id="okr-checkin-rule-drawer-form-rule-type-radio-achievement-based-label-display-div"
                      data-cy="okr-checkin-rule-drawer-form-rule-type-radio-achievement-based-label-display-div"
                    >
                      Achievement-Based
                    </div>
                  </div>
                </Radio>
                <Radio
                  value="both"
                  className="w-full"
                  id="okr-checkin-rule-drawer-form-rule-type-radio-both-display-radio"
                  data-cy="okr-checkin-rule-drawer-form-rule-type-radio-both-display-radio"
                >
                  <div
                    className="text-center p-2"
                    id="okr-checkin-rule-drawer-form-rule-type-radio-both-content-display-div"
                    data-cy="okr-checkin-rule-drawer-form-rule-type-radio-both-content-display-div"
                  >
                    <div
                      className="font-medium text-sm sm:text-base"
                      id="okr-checkin-rule-drawer-form-rule-type-radio-both-label-display-div"
                      data-cy="okr-checkin-rule-drawer-form-rule-type-radio-both-label-display-div"
                    >
                      Both
                    </div>
                  </div>
                </Radio>
              </div>
            </Radio.Group>
          </Form.Item>

          {/* Target Value - shown when Achievement-Based or Both is selected */}
          {(ruleType === 'achievement-based' || ruleType === 'both') && (
            <div
              className="space-y-4"
              id="okr-checkin-rule-drawer-form-target-value-wrapper-display-div"
              data-cy="okr-checkin-rule-drawer-form-target-value-wrapper-display-div"
            >
              {/* Target Value */}
              <Form.Item
                key={`targetValue-${ruleType}`}
                className="px-4 md:px-12"
                label="Target Value *"
                name="targetValue"
                rules={[
                  {
                    required: true,
                    message: 'Please enter target value',
                    validator: (rule, value) => {
                      if (
                        value === undefined ||
                        value === null ||
                        value === ''
                      ) {
                        return Promise.reject(
                          new Error('Please enter target value'),
                        );
                      }
                      if (typeof value === 'number' && value < 1) {
                        return Promise.reject(
                          new Error('Target value must be at least 1'),
                        );
                      }
                      return Promise.resolve();
                    },
                  },
                ]}
                id="okr-checkin-rule-drawer-form-target-value-item-display-item"
                data-cy="okr-checkin-rule-drawer-form-target-value-item-display-item"
              >
                <InputNumber
                  key={`targetValue-input-${ruleType}`}
                  type="number"
                  min={1}
                  className="w-full h-12"
                  placeholder="Enter target value"
                  id="okr-checkin-rule-drawer-form-target-value-input-display-input"
                  data-cy="okr-checkin-rule-drawer-form-target-value-input-display-input"
                />
              </Form.Item>
            </div>
          )}

          {/* Time-Based Settings - shown when Time-Based or Both is selected */}
          {(ruleType === 'time-based' || ruleType === 'both') && (
            <div
              className="space-y-4"
              data-cy="okr-checkin-rule-time-based-settings-wrapper"
              id="okr-checkin-rule-time-based-settings-wrapper"
            >
              {/* Applicable Days with Start/End Time */}
              <Form.Item
                label="Applicable Days"
                name="applicableDays"
                data-cy="okr-checkin-rule-applicable-days-form-item"
                id="okr-checkin-rule-applicable-days-form-item"
              >
                <div
                  className="bg-gray-50 border border-gray-200 rounded-lg p-3 space-y-2"
                  data-cy="okr-checkin-rule-applicable-days-inner-wrapper"
                  id="okr-checkin-rule-applicable-days-inner-wrapper"
                >
                  <div
                    className="text-xs text-gray-500 mb-1"
                    data-cy="okr-checkin-rule-applicable-days-helper-label"
                    id="okr-checkin-rule-applicable-days-helper-label"
                  >
                    Select days and set times
                  </div>

                  {/* Time Labels Header - Hidden on mobile */}
                  <div
                    className="hidden sm:block"
                    data-cy="okr-checkin-rule-applicable-days-table-header-row-wrapper"
                    id="okr-checkin-rule-applicable-days-table-header-row-wrapper"
                  >
                    <div
                      className="grid grid-cols-6 gap-2 px-3 py-2"
                      data-cy="okr-checkin-rule-applicable-days-table-header-grid"
                      id="okr-checkin-rule-applicable-days-table-header-grid"
                    >
                      <div
                        className="col-span-1"
                        data-cy="okr-checkin-rule-applicable-days-th-day"
                      >
                        <span
                          className="text-xs text-gray-600 font-medium"
                          data-cy="okr-checkin-rule-applicable-days-th-day-label"
                        >
                          Day
                        </span>
                      </div>
                      <div
                        className="col-span-1 text-center"
                        data-cy="okr-checkin-rule-applicable-days-th-start-day"
                      >
                        <span
                          className="text-xs text-gray-600 font-medium"
                          data-cy="okr-checkin-rule-applicable-days-th-start-day-label"
                        >
                          Start Day
                        </span>
                      </div>
                      <div
                        className="col-span-1 text-center"
                        data-cy="okr-checkin-rule-applicable-days-th-start-time"
                      >
                        <span
                          className="text-xs text-gray-600 font-medium"
                          data-cy="okr-checkin-rule-applicable-days-th-start-time-label"
                        >
                          Start
                        </span>
                      </div>
                      <div
                        className="col-span-1 text-center"
                        data-cy="okr-checkin-rule-applicable-days-th-end-time"
                      >
                        <span
                          className="text-xs text-gray-600 font-medium"
                          data-cy="okr-checkin-rule-applicable-days-th-end-time-label"
                        >
                          End
                        </span>
                      </div>
                      <div
                        className="col-span-1 text-center"
                        data-cy="okr-checkin-rule-applicable-days-th-end-day"
                      >
                        <span
                          className="text-xs text-gray-600 font-medium"
                          data-cy="okr-checkin-rule-applicable-days-th-end-day-label"
                        >
                          End Day
                        </span>
                      </div>
                      <div
                        className="col-span-1"
                        data-cy="okr-checkin-rule-applicable-days-th-blank"
                      ></div>
                    </div>
                  </div>

                  {weekDays.map((day, index) => {
                    const isApplicable = applicableDays[day.id] || false;

                    return (
                      <div
                        key={index}
                        className={`${
                          isApplicable
                            ? 'bg-white border-blue-200'
                            : 'bg-gray-50 border-gray-200'
                        } rounded-md border`}
                        data-cy={`okr-checkin-rule-applicable-days-entry-row-${day.id}`}
                        id={`okr-checkin-rule-applicable-days-entry-row-${day.id}`}
                      >
                        {/* Desktop Layout - Responsive Grid */}
                        <div
                          className="hidden sm:block"
                          data-cy={`okr-checkin-rule-applicable-days-desktop-layout-${day.id}`}
                          id={`okr-checkin-rule-applicable-days-desktop-layout-${day.id}`}
                        >
                          <div
                            className="grid grid-cols-6 gap-2 px-3 py-2 items-center"
                            data-cy={`okr-checkin-rule-applicable-days-desktop-grid-${day.id}`}
                            id={`okr-checkin-rule-applicable-days-desktop-grid-${day.id}`}
                          >
                            {/* Day Name and Toggle */}
                            <div
                              className="col-span-1 flex items-center space-x-2"
                              data-cy={`okr-checkin-rule-applicable-days-toggle-col-${day.id}`}
                              id={`okr-checkin-rule-applicable-days-toggle-col-${day.id}`}
                            >
                              <Form.Item
                                name={`isApplicable_${day.id}`}
                                valuePropName="checked"
                                className="mb-0"
                                data-cy={`okr-checkin-rule-applicable-days-toggle-formitem-${day.id}`}
                                id={`okr-checkin-rule-applicable-days-toggle-formitem-${day.id}`}
                              >
                                <Switch
                                  size="small"
                                  checkedChildren="✓"
                                  unCheckedChildren="—"
                                  onChange={(checked) =>
                                    handleToggleChange(day.id, checked)
                                  }
                                  data-cy={`okr-checkin-rule-applicable-days-toggle-switch-${day.id}`}
                                />
                              </Form.Item>
                              <span
                                className={`font-medium text-sm truncate ${
                                  isApplicable
                                    ? 'text-gray-800'
                                    : 'text-gray-500'
                                }`}
                                data-cy={`okr-checkin-rule-applicable-days-dayname-${day.id}`}
                              >
                                {day.name}
                              </span>
                            </div>

                            {/* Start Day */}
                            <div
                              className="col-span-1"
                              data-cy={`okr-checkin-rule-applicable-days-start-day-col-${day.id}`}
                            >
                              <Select
                                className={`w-full h-8 ${
                                  isApplicable
                                    ? 'bg-white border-gray-300'
                                    : 'bg-gray-100 border-gray-200'
                                }`}
                                placeholder="Start Day"
                                value={startDaySelection[day.id] || day.id}
                                onChange={(value) =>
                                  handleStartDayChange(day.id, value)
                                }
                                disabled={!isApplicable}
                                size="small"
                                options={weekDays.map((d) => ({
                                  value: d.id,
                                  label: d.name.substring(0, 3), // Show Mon, Tue, etc.
                                }))}
                                data-cy={`okr-checkin-rule-applicable-days-start-day-select-${day.id}`}
                              />
                            </div>

                            {/* Start Time */}
                            <div
                              className="col-span-1"
                              data-cy={`okr-checkin-rule-applicable-days-start-time-col-${day.id}`}
                            >
                              <Form.Item
                                name={`startTime_${day.id}`}
                                className="mb-0"
                                data-cy={`okr-checkin-rule-applicable-days-start-time-formitem-${day.id}`}
                                id={`okr-checkin-rule-applicable-days-start-time-formitem-${day.id}`}
                              >
                                <TimePicker
                                  className={`w-full h-8 ${
                                    isApplicable
                                      ? 'bg-white border-gray-300'
                                      : 'bg-gray-100 border-gray-200'
                                  }`}
                                  placeholder="09:00"
                                  format="HH:mm"
                                  minuteStep={15}
                                  showNow={false}
                                  use12Hours={false}
                                  size="small"
                                  disabled={!isApplicable}
                                  onChange={() => handleStartTimeChange(day.id)}
                                  data-cy={`okr-checkin-rule-applicable-days-start-time-picker-${day.id}`}
                                />
                              </Form.Item>
                            </div>

                            {/* End Time */}
                            <div
                              className="col-span-1"
                              data-cy={`okr-checkin-rule-applicable-days-end-time-col-${day.id}`}
                            >
                              <Form.Item
                                name={`endTime_${day.id}`}
                                className="mb-0"
                                data-cy={`okr-checkin-rule-applicable-days-end-time-formitem-${day.id}`}
                                id={`okr-checkin-rule-applicable-days-end-time-formitem-${day.id}`}
                                rules={[
                                  {
                                    validator: (rule, value) => {
                                      if (!value || !isApplicable) {
                                        return Promise.resolve();
                                      }

                                      const startTime = form.getFieldValue(
                                        `startTime_${day.id}`,
                                      );
                                      const startDay =
                                        startDaySelection[day.id] || day.id;
                                      const endDay =
                                        endDaySelection[day.id] || day.id;

                                      // Only validate if start and end day are the same
                                      if (startDay === endDay && startTime) {
                                        const startTimeMinutes =
                                          startTime.hour() * 60 +
                                          startTime.minute();
                                        const endTimeMinutes =
                                          value.hour() * 60 + value.minute();

                                        if (
                                          endTimeMinutes <= startTimeMinutes
                                        ) {
                                          return Promise.reject(
                                            new Error(
                                              'End time must be greater than start time',
                                            ),
                                          );
                                        }
                                      }

                                      return Promise.resolve();
                                    },
                                  },
                                ]}
                              >
                                <TimePicker
                                  className={`w-full h-8 ${
                                    isApplicable
                                      ? 'bg-white border-gray-300'
                                      : 'bg-gray-100 border-gray-200'
                                  }`}
                                  placeholder="17:00"
                                  format="HH:mm"
                                  minuteStep={15}
                                  showNow={false}
                                  use12Hours={false}
                                  size="small"
                                  disabled={!isApplicable}
                                  data-cy={`okr-checkin-rule-applicable-days-end-time-picker-${day.id}`}
                                />
                              </Form.Item>
                            </div>

                            {/* End Day */}
                            <div
                              className="col-span-1"
                              data-cy={`okr-checkin-rule-applicable-days-end-day-col-${day.id}`}
                            >
                              <Select
                                className={`w-full h-8 ${
                                  isApplicable
                                    ? 'bg-white border-gray-300'
                                    : 'bg-gray-100 border-gray-200'
                                }`}
                                placeholder="End Day"
                                value={endDaySelection[day.id] || day.id}
                                onChange={(value) =>
                                  handleEndDayChange(day.id, value)
                                }
                                disabled={!isApplicable}
                                size="small"
                                options={weekDays.map((d) => ({
                                  value: d.id,
                                  label: d.name.substring(0, 3), // Show Mon, Tue, etc.
                                }))}
                                data-cy={`okr-checkin-rule-applicable-days-end-day-select-${day.id}`}
                              />
                            </div>

                            {/* Empty column for spacing */}
                            <div
                              className="col-span-1"
                              data-cy={`okr-checkin-rule-applicable-days-empty-col-${day.id}`}
                            ></div>
                          </div>
                        </div>

                        {/* Mobile Layout - Stacked */}
                        <div
                          className="sm:hidden p-3 space-y-3"
                          data-cy={`okr-checkin-rule-applicable-days-mobile-layout-${day.id}`}
                          id={`okr-checkin-rule-applicable-days-mobile-layout-${day.id}`}
                        >
                          <div
                            className="flex items-center justify-between"
                            data-cy={`okr-checkin-rule-applicable-days-mobile-row1-${day.id}`}
                            id={`okr-checkin-rule-applicable-days-mobile-row1-${day.id}`}
                          >
                            <div
                              className="flex items-center space-x-3"
                              data-cy={`okr-checkin-rule-applicable-days-mobile-name-toggle-${day.id}`}
                              id={`okr-checkin-rule-applicable-days-mobile-name-toggle-${day.id}`}
                            >
                              <Form.Item
                                name={`isApplicable_${day.id}`}
                                valuePropName="checked"
                                className="mb-0"
                                data-cy={`okr-checkin-rule-applicable-days-mobile-toggle-formitem-${day.id}`}
                                id={`okr-checkin-rule-applicable-days-mobile-toggle-formitem-${day.id}`}
                              >
                                <Switch
                                  size="small"
                                  checkedChildren="✓"
                                  unCheckedChildren="—"
                                  onChange={(checked) =>
                                    handleToggleChange(day.id, checked)
                                  }
                                  data-cy={`okr-checkin-rule-applicable-days-mobile-toggle-switch-${day.id}`}
                                />
                              </Form.Item>
                              <span
                                className={`font-medium text-sm ${
                                  isApplicable
                                    ? 'text-gray-800'
                                    : 'text-gray-500'
                                }`}
                                data-cy={`okr-checkin-rule-applicable-days-mobile-dayname-${day.id}`}
                              >
                                {day.name}
                              </span>
                            </div>
                          </div>

                          <div
                            className="grid grid-cols-2 gap-2"
                            data-cy={`okr-checkin-rule-applicable-days-mobile-grid-${day.id}`}
                            id={`okr-checkin-rule-applicable-days-mobile-grid-${day.id}`}
                          >
                            <div
                              data-cy={`okr-checkin-rule-applicable-days-mobile-start-day-${day.id}`}
                            >
                              <label
                                className="block text-xs text-gray-600 mb-1"
                                data-cy={`okr-checkin-rule-applicable-days-mobile-start-day-label-${day.id}`}
                              >
                                Start Day
                              </label>
                              <Select
                                className={`w-full h-8 ${
                                  isApplicable
                                    ? 'bg-white border-gray-300'
                                    : 'bg-gray-100 border-gray-200'
                                }`}
                                placeholder="Start Day"
                                value={startDaySelection[day.id] || day.id}
                                onChange={(value) =>
                                  handleStartDayChange(day.id, value)
                                }
                                disabled={!isApplicable}
                                size="small"
                                options={weekDays.map((d) => ({
                                  value: d.id,
                                  label: d.name.substring(0, 3),
                                }))}
                                data-cy={`okr-checkin-rule-applicable-days-mobile-start-day-select-${day.id}`}
                              />
                            </div>

                            <div
                              data-cy={`okr-checkin-rule-applicable-days-mobile-start-time-${day.id}`}
                            >
                              <label
                                className="block text-xs text-gray-600 mb-1"
                                data-cy={`okr-checkin-rule-applicable-days-mobile-start-time-label-${day.id}`}
                              >
                                Start Time
                              </label>
                              <Form.Item
                                name={`startTime_${day.id}`}
                                className="mb-0"
                                data-cy={`okr-checkin-rule-applicable-days-mobile-start-time-formitem-${day.id}`}
                                id={`okr-checkin-rule-applicable-days-mobile-start-time-formitem-${day.id}`}
                              >
                                <TimePicker
                                  className={`w-full h-8 ${
                                    isApplicable
                                      ? 'bg-white border-gray-300'
                                      : 'bg-gray-100 border-gray-200'
                                  }`}
                                  placeholder="09:00"
                                  format="HH:mm"
                                  minuteStep={15}
                                  showNow={false}
                                  use12Hours={false}
                                  size="small"
                                  disabled={!isApplicable}
                                  onChange={() => handleStartTimeChange(day.id)}
                                  data-cy={`okr-checkin-rule-applicable-days-mobile-start-time-picker-${day.id}`}
                                />
                              </Form.Item>
                            </div>

                            <div
                              data-cy={`okr-checkin-rule-applicable-days-mobile-end-time-${day.id}`}
                            >
                              <label
                                className="block text-xs text-gray-600 mb-1"
                                data-cy={`okr-checkin-rule-applicable-days-mobile-end-time-label-${day.id}`}
                              >
                                End Time
                              </label>
                              <Form.Item
                                name={`endTime_${day.id}`}
                                className="mb-0"
                                data-cy={`okr-checkin-rule-applicable-days-mobile-end-time-formitem-${day.id}`}
                                id={`okr-checkin-rule-applicable-days-mobile-end-time-formitem-${day.id}`}
                                rules={[
                                  {
                                    validator: (rule, value) => {
                                      if (!value || !isApplicable) {
                                        return Promise.resolve();
                                      }

                                      const startTime = form.getFieldValue(
                                        `startTime_${day.id}`,
                                      );
                                      const startDay =
                                        startDaySelection[day.id] || day.id;
                                      const endDay =
                                        endDaySelection[day.id] || day.id;

                                      // Only validate if start and end day are the same
                                      if (startDay === endDay && startTime) {
                                        const startTimeMinutes =
                                          startTime.hour() * 60 +
                                          startTime.minute();
                                        const endTimeMinutes =
                                          value.hour() * 60 + value.minute();

                                        if (
                                          endTimeMinutes <= startTimeMinutes
                                        ) {
                                          return Promise.reject(
                                            new Error(
                                              'End time must be greater than start time',
                                            ),
                                          );
                                        }
                                      }

                                      return Promise.resolve();
                                    },
                                  },
                                ]}
                              >
                                <TimePicker
                                  className={`w-full h-8 ${
                                    isApplicable
                                      ? 'bg-white border-gray-300'
                                      : 'bg-gray-100 border-gray-200'
                                  }`}
                                  placeholder="17:00"
                                  format="HH:mm"
                                  minuteStep={15}
                                  showNow={false}
                                  use12Hours={false}
                                  size="small"
                                  disabled={!isApplicable}
                                  data-cy={`okr-checkin-rule-applicable-days-mobile-end-time-picker-${day.id}`}
                                />
                              </Form.Item>
                            </div>

                            <div
                              data-cy={`okr-checkin-rule-applicable-days-mobile-end-day-${day.id}`}
                            >
                              <label
                                className="block text-xs text-gray-600 mb-1"
                                data-cy={`okr-checkin-rule-applicable-days-mobile-end-day-label-${day.id}`}
                              >
                                End Day
                              </label>
                              <Select
                                className={`w-full h-8 ${
                                  isApplicable
                                    ? 'bg-white border-gray-300'
                                    : 'bg-gray-100 border-gray-200'
                                }`}
                                placeholder="End Day"
                                value={endDaySelection[day.id] || day.id}
                                onChange={(value) =>
                                  handleEndDayChange(day.id, value)
                                }
                                disabled={!isApplicable}
                                size="small"
                                options={weekDays.map((d) => ({
                                  value: d.id,
                                  label: d.name.substring(0, 3),
                                }))}
                                data-cy={`okr-checkin-rule-applicable-days-mobile-end-day-select-${day.id}`}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Form.Item>
            </div>
          )}

          {/* Operation - shown for Achievement-Based or Both rule types */}
          {(ruleType === 'achievement-based' || ruleType === 'both') && (
            <Form.Item
              label="Operation"
              name="operation"
              rules={[{ required: true, message: 'Please select operation' }]}
              id="okr-checkin-rule-drawer-form-operation-item-display-item"
              data-cy="okr-checkin-rule-drawer-form-operation-item-display-item"
            >
              <Select
                className="h-12"
                placeholder="Select operation"
                options={[
                  { value: '>', label: '>' },
                  { value: '<', label: '<' },
                  { value: '=', label: '=' },
                ]}
                id="okr-checkin-rule-drawer-form-operation-select-display-select"
                data-cy="okr-checkin-rule-drawer-form-operation-select-display-select"
              />
            </Form.Item>
          )}

          <Form.Item
            label="Category"
            name="categoryId"
            rules={[{ required: true, message: 'Please select category' }]}
            id="okr-checkin-rule-drawer-form-category-item-display-item"
            data-cy="okr-checkin-rule-drawer-form-category-item-display-item"
          >
            <Select
              className="h-12"
              placeholder="Select category"
              onChange={handleCategoryChange}
              options={
                feedbackTypesData?.items?.map(
                  (feedbackType: FeedbackTypeItems) => ({
                    value: feedbackType.id,
                    label: feedbackType.category,
                  }),
                ) || []
              }
              id="okr-checkin-rule-drawer-form-category-select-display-select"
              data-cy="okr-checkin-rule-drawer-form-category-select-display-select"
            />
          </Form.Item>

          <Form.Item
            label="Feedback"
            name="feedbackId"
            rules={[{ required: true, message: 'Please select feedback' }]}
            id="okr-checkin-rule-drawer-form-feedback-item-display-item"
            data-cy="okr-checkin-rule-drawer-form-feedback-item-display-item"
          >
            <Select
              className="h-12"
              placeholder="Select feedback"
              options={
                feedbackData?.items
                  ?.filter((feedback: any) => {
                    // Only show feedback items that match the selected category
                    return feedback.feedbackTypeId === selectedCategoryId;
                  })
                  ?.map((feedback: any) => ({
                    value: feedback.id,
                    label: feedback.name || feedback.title || feedback.id,
                  })) || []
              }
              id="okr-checkin-rule-drawer-form-feedback-select-display-select"
              data-cy="okr-checkin-rule-drawer-form-feedback-select-display-select"
            />
          </Form.Item>

          {/* Action Buttons - Responsive */}
          <div
            className="w-full flex flex-col sm:flex-row justify-center items-stretch sm:items-center gap-3 pt-6 border-t border-gray-200"
            id="okr-checkin-rule-drawer-form-actions-wrapper-display-div"
            data-cy="okr-checkin-rule-drawer-form-actions-wrapper-display-div"
          >
            <Button
              onClick={handleDrawerClose}
              className="w-full sm:w-auto h-10 order-2 sm:order-1"
              id="okr-checkin-rule-drawer-form-cancel-button-display-button"
              data-cy="okr-checkin-rule-drawer-form-cancel-button-display-button"
            >
              Cancel
            </Button>
            <Form.Item
              className="mb-0 w-full sm:w-auto order-1 sm:order-2"
              id="okr-checkin-rule-drawer-form-submit-item-display-item"
              data-cy="okr-checkin-rule-drawer-form-submit-item-display-item"
            >
              <Button
                htmlType="submit"
                type="primary"
                loading={isSubmitting}
                disabled={isSubmitting}
                className="w-full sm:w-auto h-10 px-6"
                id="okr-checkin-rule-drawer-form-submit-button-display-button"
                data-cy="okr-checkin-rule-drawer-form-submit-button-display-button"
              >
                {checkInRule ? 'Update' : 'Create'}
              </Button>
            </Form.Item>
          </div>
        </Form>
      </div>
      <style jsx data-cy="okr-checkin-rule-checkin-style">{`
        .no-border-dropdown .ant-select-dropdown-menu-item {
          border: none !important;
          background: transparent !important;
          box-shadow: none !important;
        }
        .no-border-dropdown .ant-select-dropdown-menu-item:hover {
          background: #f5f5f5 !important;
          border: none !important;
        }
        .no-border-dropdown .ant-select-dropdown-menu-item-selected {
          background: #e6f7ff !important;
          border: none !important;
        }

        /* Responsive drawer styles */
        .responsive-drawer .ant-drawer-body {
          padding: 16px;
        }

        @media (max-width: 640px) {
          .responsive-drawer .ant-drawer-body {
            padding: 12px;
          }
        }

        /* Ensure form elements are responsive */
        .responsive-drawer .ant-form-item {
          margin-bottom: 16px;
        }

        @media (max-width: 640px) {
          .responsive-drawer .ant-form-item {
            margin-bottom: 12px;
          }
        }
      `}</style>
    </Drawer>
  );
};

export default CheckInRuleDrawer;
