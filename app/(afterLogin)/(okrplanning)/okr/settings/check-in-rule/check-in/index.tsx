'use client';

import React, { useEffect, useState } from 'react';
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
import { useGetWorkSchedules } from '@/store/server/features/employees/employeeManagment/workSchedule/queries';
import { FeedbackTypeItems } from '@/store/server/features/CFR/conversation/action-plan/interface';

interface CheckInRuleDrawerProps {
  open: boolean;
  onClose: () => void;
  checkInRule: Partial<CheckInRule> | null;
  onSuccess?: () => void;
}

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
  const { data: workSchedulesData } = useGetWorkSchedules();
  const { tenantId } = useAuthenticationStore();
  const queryClient = useQueryClient();
  const [selectedCategoryId, setSelectedCategoryId] = useState<
    string | undefined
  >();
  const [ruleType, setRuleType] = useState<
    'time-based' | 'achievement-based' | 'both'
  >('time-based');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [, setSelectedWorkScheduleId] = useState<string | undefined>();
  const [workScheduleDays, setWorkScheduleDays] = useState<any[]>([]);
  const [applicableDays, setApplicableDays] = useState<Record<string, boolean>>(
    {},
  );

  const handleDrawerClose = () => {
    form.resetFields();
    setSelectedCategoryId(undefined);
    setSelectedWorkScheduleId(undefined);
    setWorkScheduleDays([]);
    setApplicableDays({});
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

  const handleWorkScheduleChange = (workScheduleId: string) => {
    setSelectedWorkScheduleId(workScheduleId);

    // Find the selected work schedule and set its days
    const selectedWorkSchedule = workSchedulesData?.items?.find(
      (schedule: any) => schedule.id === workScheduleId,
    );

    if (selectedWorkSchedule?.detail) {
      setWorkScheduleDays(selectedWorkSchedule.detail);

      // Clear all existing form fields for applicable days first
      const currentFormValues = form.getFieldsValue();
      const fieldsToReset: any = {};

      // Reset all existing applicable day fields
      Object.keys(currentFormValues).forEach((key) => {
        if (
          key.startsWith('isApplicable_') ||
          key.startsWith('startTime_') ||
          key.startsWith('endTime_')
        ) {
          fieldsToReset[key] = undefined;
        }
      });

      // Initialize form values - show ALL days from work schedule
      const initialValues: any = { ...fieldsToReset };
      const applicableDaysState: Record<string, boolean> = {};

      // Always show all days from the selected work schedule
      selectedWorkSchedule.detail.forEach((dayDetail: any) => {
        // Initialize all days as not applicable by default
        initialValues[`isApplicable_${dayDetail.id}`] = false;
        applicableDaysState[dayDetail.id] = false;

        // Set default times from work schedule for all days
        if (dayDetail.startTime) {
          initialValues[`startTime_${dayDetail.id}`] = dayjs(
            dayDetail.startTime,
            'HH:mm',
          );
        }
        if (dayDetail.endTime) {
          initialValues[`endTime_${dayDetail.id}`] = dayjs(
            dayDetail.endTime,
            'HH:mm',
          );
        }
      });

      // If we're editing and have existing targetDate data, populate the previously selected days
      if (
        checkInRule &&
        checkInRule.targetDate &&
        checkInRule.targetDate.length > 0
      ) {
        // First, preserve times for previously selected days
        const preservedTimes: Record<
          string,
          { startTime?: string; endTime?: string }
        > = {};
        checkInRule.targetDate.forEach((timeEntry: any) => {
          const dayId = timeEntry.dayId || timeEntry.date;

          // Find matching day in the new work schedule
          const matchingDay = selectedWorkSchedule.detail.find(
            (day: any) =>
              day.id === dayId ||
              day.day === timeEntry.date ||
              day.dayOfWeek === timeEntry.date,
          );

          if (matchingDay) {
            // Store the times for this day
            const startTime = timeEntry.startTime || timeEntry.start;
            const endTime = timeEntry.endTime || timeEntry.end;

            if (startTime || endTime) {
              preservedTimes[matchingDay.id] = {
                startTime: startTime,
                endTime: endTime,
              };
            }
          }
        });

        // Now set ALL days based on working day status from the NEW work schedule
        // This ensures we use the working day status from the newly selected work schedule
        selectedWorkSchedule.detail.forEach((dayDetail: any) => {
          const isWorkingDay =
            dayDetail.workDay === true ||
            dayDetail.isWorkingDay === true ||
            dayDetail.applicable === true;

          // Set switch based on working day status from new work schedule
          initialValues[`isApplicable_${dayDetail.id}`] = isWorkingDay;
          applicableDaysState[dayDetail.id] = isWorkingDay;

          // Use preserved times if available, otherwise use work schedule default times
          if (preservedTimes[dayDetail.id]) {
            if (preservedTimes[dayDetail.id].startTime) {
              initialValues[`startTime_${dayDetail.id}`] = dayjs(
                preservedTimes[dayDetail.id].startTime,
                'HH:mm',
              );
            }
            if (preservedTimes[dayDetail.id].endTime) {
              initialValues[`endTime_${dayDetail.id}`] = dayjs(
                preservedTimes[dayDetail.id].endTime,
                'HH:mm',
              );
            }
          } else {
            // Use work schedule default times
            if (dayDetail.startTime) {
              initialValues[`startTime_${dayDetail.id}`] = dayjs(
                dayDetail.startTime,
                'HH:mm',
              );
            }
            if (dayDetail.endTime) {
              initialValues[`endTime_${dayDetail.id}`] = dayjs(
                dayDetail.endTime,
                'HH:mm',
              );
            }
          }
        });
      } else {
        // If creating new, turn on switches only for working days
        selectedWorkSchedule.detail.forEach((dayDetail: any) => {
          const isWorkingDay =
            dayDetail.workDay === true ||
            dayDetail.isWorkingDay === true ||
            dayDetail.applicable === true;

          initialValues[`isApplicable_${dayDetail.id}`] = isWorkingDay;
          applicableDaysState[dayDetail.id] = isWorkingDay;
        });
      }

      // Set the form values and applicable days state
      form.setFieldsValue(initialValues);
      setApplicableDays(applicableDaysState);
    } else {
      setWorkScheduleDays([]);
      setApplicableDays({});
    }
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

    // Only include work schedule and target date if rule type requires it
    if (ruleType === 'time-based' || ruleType === 'both') {
      formData.workScheduleId = values.workScheduleId;
      formData.targetDate = (() => {
        // Use the selected work schedule days
        if (!workScheduleDays.length) {
          return null;
        }

        // Create targetDate array with selected applicable days and their times
        const targetDateArray = workScheduleDays
          .filter((dayDetail: any) => {
            const isApplicable = values[`isApplicable_${dayDetail.id}`];
            return isApplicable;
          })
          .map((dayDetail: any) => {
            const startTime = values[`startTime_${dayDetail.id}`]
              ? values[`startTime_${dayDetail.id}`].format('hh:mm A')
              : dayDetail.startTime;
            const endTime = values[`endTime_${dayDetail.id}`]
              ? values[`endTime_${dayDetail.id}`].format('hh:mm A')
              : dayDetail.endTime;

            const dayData = {
              date: dayDetail.day || dayDetail.dayOfWeek || 'Monday',
              dayId: dayDetail.id,
              startTime: startTime,
              endTime: endTime,
            };

            return dayData;
          });

        return targetDateArray;
      })();
    } else {
      // Explicitly set to null for achievement-based rules to clear from database
      formData.workScheduleId = null;
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

      // Set work schedule if it exists in the checkInRule
      const checkInRuleWithWorkSchedule = checkInRule as any;
      if (checkInRuleWithWorkSchedule.workScheduleId) {
        setSelectedWorkScheduleId(checkInRuleWithWorkSchedule.workScheduleId);

        // Try to find the work schedule in the available data
        const selectedWorkSchedule = workSchedulesData?.items?.find(
          (schedule: any) =>
            schedule.id === checkInRuleWithWorkSchedule.workScheduleId,
        );

        if (selectedWorkSchedule?.detail) {
          setWorkScheduleDays(selectedWorkSchedule.detail);

          // Convert time strings to dayjs objects for TimePickers and set applicable day toggles
          const applicableDaysState: Record<string, boolean> = {};

          // Initialize all days from work schedule as not applicable
          selectedWorkSchedule.detail.forEach((dayDetail: any) => {
            formValues[`isApplicable_${dayDetail.id}`] = false;
            applicableDaysState[dayDetail.id] = false;

            // Set default times from work schedule for all days
            if (dayDetail.startTime) {
              formValues[`startTime_${dayDetail.id}`] = dayjs(
                dayDetail.startTime,
                'HH:mm',
              );
            }
            if (dayDetail.endTime) {
              formValues[`endTime_${dayDetail.id}`] = dayjs(
                dayDetail.endTime,
                'HH:mm',
              );
            }
          });

          // Only populate days that exist in the database with their switches ON and times
          if (checkInRule.targetDate && checkInRule.targetDate.length > 0) {
            checkInRule.targetDate.forEach((timeEntry: any) => {
              const dayId = timeEntry.dayId || timeEntry.date;

              // Find matching day in work schedule by dayId or by date/day name
              const matchingDay = selectedWorkSchedule.detail.find(
                (day: any) =>
                  day.id === dayId ||
                  day.day === timeEntry.date ||
                  day.dayOfWeek === timeEntry.date,
              );

              if (matchingDay) {
                // Set the applicable day toggle to true for days that have time entries
                formValues[`isApplicable_${matchingDay.id}`] = true;
                applicableDaysState[matchingDay.id] = true;

                // Handle both startTime/endTime and start/end properties
                const startTime = timeEntry.startTime || timeEntry.start;
                const endTime = timeEntry.endTime || timeEntry.end;

                if (startTime) {
                  // Handle both 12-hour (hh:mm A) and 24-hour (HH:mm) formats
                  const timeFormat = startTime.includes('AM') || startTime.includes('PM') ? 'hh:mm A' : 'HH:mm';
                  formValues[`startTime_${matchingDay.id}`] = dayjs(
                    startTime,
                    timeFormat,
                  );
                }
                if (endTime) {
                  // Handle both 12-hour (hh:mm A) and 24-hour (HH:mm) formats
                  const timeFormat = endTime.includes('AM') || endTime.includes('PM') ? 'hh:mm A' : 'HH:mm';
                  formValues[`endTime_${matchingDay.id}`] = dayjs(
                    endTime,
                    timeFormat,
                  );
                }
              } else {
              }
            });
          }

          // Set applicable days state
          setApplicableDays(applicableDaysState);
        }
      }

      form.setFieldsValue(formValues);
    } else {
      form.resetFields();
      setRuleType('time-based');
      setSelectedCategoryId(undefined);
      setSelectedWorkScheduleId(undefined);
      setWorkScheduleDays([]);
      setApplicableDays({});
    }
  }, [checkInRule, form, planningPeriodsData]);

  // Separate useEffect to handle work schedule loading when workSchedulesData becomes available
  useEffect(() => {
    if (checkInRule && workSchedulesData?.items) {
      const checkInRuleWithWorkSchedule = checkInRule as any;
      if (
        checkInRuleWithWorkSchedule.workScheduleId &&
        !workScheduleDays.length
      ) {
        const selectedWorkSchedule = workSchedulesData.items.find(
          (schedule: any) =>
            schedule.id === checkInRuleWithWorkSchedule.workScheduleId,
        );

        if (selectedWorkSchedule?.detail) {
          setWorkScheduleDays(selectedWorkSchedule.detail);

          // Convert time strings to dayjs objects for TimePickers and set applicable day toggles
          const formValues: any = {};
          const applicableDaysState: Record<string, boolean> = {};

          // Initialize all days from work schedule as not applicable
          selectedWorkSchedule.detail.forEach((dayDetail: any) => {
            formValues[`isApplicable_${dayDetail.id}`] = false;
            applicableDaysState[dayDetail.id] = false;

            // Set default times from work schedule for all days
            if (dayDetail.startTime) {
              formValues[`startTime_${dayDetail.id}`] = dayjs(
                dayDetail.startTime,
                'HH:mm',
              );
            }
            if (dayDetail.endTime) {
              formValues[`endTime_${dayDetail.id}`] = dayjs(
                dayDetail.endTime,
                'HH:mm',
              );
            }
          });

          // Only populate days that exist in the database with their switches ON and times
          if (checkInRule.targetDate && checkInRule.targetDate.length > 0) {
            checkInRule.targetDate.forEach((timeEntry: any) => {
              const dayId = timeEntry.dayId || timeEntry.date;

              // Find matching day in work schedule by dayId or by date/day name
              const matchingDay = selectedWorkSchedule.detail.find(
                (day: any) =>
                  day.id === dayId ||
                  day.day === timeEntry.date ||
                  day.dayOfWeek === timeEntry.date,
              );

              if (matchingDay) {
                // Set the applicable day toggle to true for days that have time entries
                formValues[`isApplicable_${matchingDay.id}`] = true;
                applicableDaysState[matchingDay.id] = true;

                // Handle both startTime/endTime and start/end properties
                const startTime = timeEntry.startTime || timeEntry.start;
                const endTime = timeEntry.endTime || timeEntry.end;

                if (startTime) {
                  // Handle both 12-hour (hh:mm A) and 24-hour (HH:mm) formats
                  const timeFormat = startTime.includes('AM') || startTime.includes('PM') ? 'hh:mm A' : 'HH:mm';
                  formValues[`startTime_${matchingDay.id}`] = dayjs(
                    startTime,
                    timeFormat,
                  );
                }
                if (endTime) {
                  // Handle both 12-hour (hh:mm A) and 24-hour (HH:mm) formats
                  const timeFormat = endTime.includes('AM') || endTime.includes('PM') ? 'hh:mm A' : 'HH:mm';
                  formValues[`endTime_${matchingDay.id}`] = dayjs(
                    endTime,
                    timeFormat,
                  );
                }
              } else {
              }
            });
          }

          // Set applicable days state and update form values
          setApplicableDays(applicableDaysState);
          form.setFieldsValue(formValues);
        }
      }
    }
  }, [workSchedulesData?.items, checkInRule, form, workScheduleDays.length]);

  const modalHeader = (
    <div className="flex justify-center text-xl font-extrabold text-gray-800 p-4">
      {checkInRule ? 'Edit Check-in Rule' : 'Create Check-in Rule'}
    </div>
  );

  return (
    <Drawer
      open={open}
      onClose={handleDrawerClose}
      title={modalHeader}
      width="40%"
    >
      <div className="overflow-hidden">
        <Form
          form={form}
          onFinish={onFinish}
          layout="vertical"
          initialValues={{
            ruleType: 'time-based',
            frequency: 1,
          }}
          className="space-y-6"
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
          >
            <Input className="h-12" placeholder="Enter rule name" />
          </Form.Item>

          <Form.Item label="Description" name="description">
            <Input.TextArea
              rows={3}
              className="h-12"
              placeholder="Enter description (optional)"
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
                <span className="text-gray-700">{option.label}</span>
              )}
              dropdownStyle={{
                border: 'none',
                boxShadow: 'none',
                borderRadius: '0',
              }}
              dropdownClassName="no-border-dropdown"
            />
          </Form.Item>

          <Form.Item
            label="Planning Period"
            name="planningPeriodId"
            rules={[
              { required: true, message: 'Please select planning period' },
            ]}
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
          >
            <InputNumber
              type="number"
              min={1}
              className="w-full h-12"
              placeholder="Enter frequency"
            />
          </Form.Item>

          <Form.Item
            label="Rule Type"
            name="ruleType"
            rules={[{ required: true, message: 'Please select rule type' }]}
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
                  // Achievement-based doesn't need work schedule or target date
                  form.setFieldValue('workScheduleId', undefined);
                  setSelectedWorkScheduleId(undefined);
                  setWorkScheduleDays([]);
                  setApplicableDays({});
                }
                // For 'both', we keep all fields as they are
              }}
              className="w-full"
            >
              <div className="flex flex-col md:flex-row gap-2 md:gap-4 w-full">
                <Radio value="time-based" className="flex-1">
                  <div className="text-center">
                    <div className="font-medium text-sm md:text-base">
                      Time-Based
                    </div>
                  </div>
                </Radio>
                <Radio value="achievement-based" className="flex-1">
                  <div className="text-center">
                    <div className="font-medium text-sm md:text-base">
                      Achievement-Based
                    </div>
                  </div>
                </Radio>
                <Radio value="both" className="flex-1">
                  <div className="text-center">
                    <div className="font-medium text-sm md:text-base">Both</div>
                  </div>
                </Radio>
              </div>
            </Radio.Group>
          </Form.Item>

          {/* Work Schedule Selection - shown for Time-Based or Both rule types */}
          {(ruleType === 'time-based' || ruleType === 'both') && (
            <Form.Item
              label="Work Schedule *"
              name="workScheduleId"
              rules={[
                { required: true, message: 'Please select work schedule' },
              ]}
            >
              <Select
                className="h-12"
                placeholder="Select work schedule"
                onChange={handleWorkScheduleChange}
                options={
                  workSchedulesData?.items?.map((schedule: any) => ({
                    value: schedule.id,
                    label: schedule.name,
                  })) || []
                }
              />
            </Form.Item>
          )}

          {/* Target Value - shown when Achievement-Based or Both is selected */}
          {(ruleType === 'achievement-based' || ruleType === 'both') && (
            <div className="space-y-4">
              {/* Target Value */}
              <Form.Item
                className="px-4 md:px-12"
                label="Target Value *"
                name="targetValue"
                rules={[
                  { required: true, message: 'Please enter target value' },
                  {
                    type: 'number',
                    min: 1,
                    message: 'Target value must be at least 1',
                  },
                ]}
              >
                <InputNumber
                  type="number"
                  min={1}
                  className="w-full h-12"
                  placeholder="Enter target value"
                />
              </Form.Item>
            </div>
          )}

          {/* Time-Based Settings - shown when Time-Based or Both is selected */}
          {(ruleType === 'time-based' || ruleType === 'both') && (
            <div className="space-y-4">
              {/* Applicable Days with Start/End Time */}
              {workScheduleDays.length > 0 && (
                <Form.Item label="Applicable Days" name="applicableDays">
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 space-y-2">
                    <div className="text-xs text-gray-500 mb-1">
                      Select days and set times
                    </div>

                    {/* Time Labels Header */}
                    <div className="flex items-center justify-end pr-3">
                      <div className="flex items-center space-x-2">
                        <div className="w-20 text-center">
                          <span className="text-xs text-gray-600 font-medium">
                            Start
                          </span>
                        </div>
                        <div className="w-4 text-center">
                          <span className="text-xs text-gray-300">-</span>
                        </div>
                        <div className="w-20 text-center">
                          <span className="text-xs text-gray-600 font-medium">
                            End
                          </span>
                        </div>
                      </div>
                    </div>

                    {workScheduleDays.map((dayDetail: any, index: number) => {
                      const dayName =
                        dayDetail.day ||
                        dayDetail.dayOfWeek ||
                        `Day ${index + 1}`;
                      const isApplicable =
                        applicableDays[dayDetail.id] || false;

                      return (
                        <div
                          key={index}
                          className={`flex items-center justify-between py-2 px-3 rounded-md border text-sm ${
                            isApplicable
                              ? 'bg-white border-blue-200'
                              : 'bg-gray-50 border-gray-200'
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <Form.Item
                              name={`isApplicable_${dayDetail.id}`}
                              valuePropName="checked"
                              className="mb-0"
                            >
                              <Switch
                                size="small"
                                checkedChildren="✓"
                                unCheckedChildren="—"
                                onChange={(checked) =>
                                  handleToggleChange(dayDetail.id, checked)
                                }
                              />
                            </Form.Item>
                            <span
                              className={`font-medium ${
                                isApplicable ? 'text-gray-800' : 'text-gray-500'
                              }`}
                            >
                              {dayName}
                            </span>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Form.Item
                              name={`startTime_${dayDetail.id}`}
                              className="mb-0"
                            >
                              <TimePicker
                                className={`h-7 w-20 ${
                                  isApplicable
                                    ? 'bg-white border-gray-300'
                                    : 'bg-gray-100 border-gray-200'
                                }`}
                                placeholder="9:00 AM"
                                format="h:mm A"
                                minuteStep={15}
                                showNow={false}
                                use12Hours={true}
                                size="small"
                                disabled={!isApplicable}
                              />
                            </Form.Item>

                            <span className="text-gray-300 text-sm">-</span>

                            <Form.Item
                              name={`endTime_${dayDetail.id}`}
                              className="mb-0"
                            >
                              <TimePicker
                                className={`h-7 w-20 ${
                                  isApplicable
                                    ? 'bg-white border-gray-300'
                                    : 'bg-gray-100 border-gray-200'
                                }`}
                                placeholder="5:00 PM"
                                format="h:mm A"
                                minuteStep={15}
                                showNow={false}
                                use12Hours={true}
                                size="small"
                                disabled={!isApplicable}
                              />
                            </Form.Item>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Form.Item>
              )}
            </div>
          )}

          {/* Operation - shown for Achievement-Based or Both rule types */}
          {(ruleType === 'achievement-based' || ruleType === 'both') && (
            <Form.Item
              label="Operation"
              name="operation"
              rules={[{ required: true, message: 'Please select operation' }]}
            >
              <Select
                className="h-12"
                placeholder="Select operation"
                options={[
                  { value: '>', label: '>' },
                  { value: '<', label: '<' },
                  { value: '=', label: '=' },
                ]}
              />
            </Form.Item>
          )}

          <Form.Item
            label="Category"
            name="categoryId"
            rules={[{ required: true, message: 'Please select category' }]}
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
            />
          </Form.Item>

          <Form.Item
            label="Feedback"
            name="feedbackId"
            rules={[{ required: true, message: 'Please select feedback' }]}
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
            />
          </Form.Item>

          {/* Action Buttons - Now inside the form container */}
          <div className="w-full flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-4 pt-8 border-t border-gray-200">
            <Button onClick={handleDrawerClose} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Form.Item className="mb-0 w-full sm:w-auto">
              <Button
                htmlType="submit"
                type="primary"
                loading={isSubmitting}
                disabled={isSubmitting}
                className="w-full sm:w-auto px-6 py-2"
              >
                {checkInRule ? 'Update' : 'Create'}
              </Button>
            </Form.Item>
          </div>
        </Form>
      </div>
      <style jsx>{`
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
      `}</style>
    </Drawer>
  );
};

export default CheckInRuleDrawer;
