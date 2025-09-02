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

  const handleDrawerClose = () => {
    form.resetFields();
    setSelectedCategoryId(undefined);
    onClose();
  };

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategoryId(categoryId);
    // Clear the feedback selection when category changes
    form.setFieldValue('feedbackId', undefined);
  };

  // // Function to get work schedule with highest length
  // const getWorkScheduleWithHighestLength = () => {
  //   if (!workSchedulesData?.items || workSchedulesData.items.length === 0) {
  //     return null;
  //   }

  //   return workSchedulesData.items.reduce((highest, current) => {
  //     const currentLength = current.detail?.length || 0;
  //     const highestLength = highest.detail?.length || 0;
  //     return currentLength > highestLength ? current : highest;
  //   });
  // };

  const onFinish = (values: any) => {
    setIsSubmitting(true); // Start loading

    // Transform form values to match backend expectations
    const formData = {
      name: values.name?.trim() || '',
      description: values.description?.trim() || '',
      appliesTo: values.appliesTo,
      planningPeriodId: values.planningPeriodId,
      timeBased: ruleType === 'time-based' || ruleType === 'both',
      achievementBased: ruleType === 'achievement-based' || ruleType === 'both',
      frequency: parseInt(values.frequency) || 1,
      operation: values.operation,
      tenantId: tenantId,
      categoryId: values.categoryId,
      feedbackId: values.feedbackId,
      target: values.targetValue ? parseFloat(values.targetValue) : undefined,
      targetDate:
        ruleType === 'time-based' || ruleType === 'both'
          ? (() => {
              // Get the work schedule with highest working days
              const workScheduleWithHighestLength =
                workSchedulesData?.items?.reduce(
                  (highest: any, current: any) => {
                    if (!highest || !current?.detail) return current;

                    const highestWorkingDays = highest.detail.filter(
                      (day: any) => day.workDay,
                    ).length;
                    const currentWorkingDays = current.detail.filter(
                      (day: any) => day.workDay,
                    ).length;

                    return currentWorkingDays > highestWorkingDays
                      ? current
                      : highest;
                  },
                  null,
                );

              if (!workScheduleWithHighestLength?.detail) return null;

              // Create targetDate array with all working days and selected time
              return workScheduleWithHighestLength.detail
                .filter((dayDetail: any) => dayDetail.workDay)
                .map((dayDetail: any) => ({
                  date: dayDetail.day || dayDetail.dayOfWeek || 'Monday', // Use actual day from work schedule
                  time: values.time ? values.time.format('HH:mm') : null,
                }));
            })()
          : null,
    };

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

      // Convert time string to dayjs object for TimePicker
      if (checkInRule.targetDate && checkInRule.targetDate.length > 0) {
        // Get the first time entry from targetDate array
        const firstTimeEntry = checkInRule.targetDate[0];
        if (firstTimeEntry?.time) {
          // Convert time string (HH:mm format) to dayjs object
          formValues.time = dayjs(firstTimeEntry.time, 'HH:mm');
        }
      }

      // Map target property to targetValue form field
      if (checkInRule.target !== undefined) {
        formValues.targetValue = checkInRule.target;
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

      form.setFieldsValue(formValues);
    } else {
      form.resetFields();
      setRuleType('time-based');
      setSelectedCategoryId(undefined);
    }
  }, [checkInRule, form, planningPeriodsData]);

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

          <Form.Item
            label="Rule Type"
            name="ruleType"
            rules={[{ required: true, message: 'Please select rule type' }]}
          >
            <Radio.Group
              value={ruleType}
              onChange={(e) => {
                setRuleType(e.target.value);
                form.setFieldValue('ruleType', e.target.value);
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
            <div className="space-y-4  ">
              {/* Time Picker */}
              <Form.Item
                className="px-4 md:px-8"
                label="Time *"
                name="time"
                rules={[{ required: true, message: 'Please pick time' }]}
              >
                <TimePicker
                  className="h-12 w-full"
                  placeholder="Pick Time"
                  format="hh:mm A"
                  minuteStep={15}
                  showNow={false}
                  use12Hours
                />
              </Form.Item>

              {/* Applicable Days */}
              <Form.Item label="Applicable Day" name="applicableDays">
                <div className="space-y-1">
                  {(() => {
                    // Find the work schedule with the highest number of working days
                    const workScheduleWithHighestLength =
                      workSchedulesData?.items?.reduce(
                        (highest: any, current: any) => {
                          if (!highest || !current?.detail) return current;

                          const highestWorkingDays = highest.detail.filter(
                            (day: any) => day.workDay,
                          ).length;
                          const currentWorkingDays = current.detail.filter(
                            (day: any) => day.workDay,
                          ).length;

                          return currentWorkingDays > highestWorkingDays
                            ? current
                            : highest;
                        },
                        null,
                      );

                    if (!workScheduleWithHighestLength?.detail) {
                      return (
                        <div className="text-gray-500">
                          No work schedule available
                        </div>
                      );
                    }

                    return workScheduleWithHighestLength.detail.map(
                      (dayDetail: any, index: number) => {
                        const dayName =
                          dayDetail.day ||
                          dayDetail.dayOfWeek ||
                          `Day ${index + 1}`;
                        const isWorkingDay = dayDetail.workDay || false;

                        return (
                          <div
                            key={index}
                            className="flex items-center justify-start py-2.5 px-4 md:px-16"
                          >
                            <Switch
                              checked={isWorkingDay}
                              disabled
                              size="small"
                              className="mr-2"
                              checkedChildren="✓"
                              unCheckedChildren="—"
                            />
                            <span className="text-gray-700 text-sm">
                              {dayName}
                            </span>
                          </div>
                        );
                      },
                    );
                  })()}
                </div>
              </Form.Item>
            </div>
          )}

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
