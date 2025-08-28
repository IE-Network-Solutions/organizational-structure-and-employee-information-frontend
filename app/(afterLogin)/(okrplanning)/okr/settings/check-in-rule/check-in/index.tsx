'use client';

import React, { useEffect } from 'react';
import { Form, Input, Select, InputNumber, Switch, Drawer, Button } from 'antd';
import { useCreateCheckInRule, useUpdateCheckInRule } from '@/store/server/features/okrplanning/monitoring-evaluation/check-in-rule/mutations';
import { CheckInRule } from '@/types/okr/check-in-rule';
import { useDefaultPlanningPeriods } from '@/store/server/features/okrPlanningAndReporting/queries';
import { PlanningPeriod } from '@/store/uistate/features/okrplanning/okrSetting/interface';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { useQueryClient } from 'react-query';
import { useFetchAllFeedbackTypes } from '@/store/server/features/feedback/feedbackType/queries';
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
  const { tenantId } = useAuthenticationStore();
  const queryClient = useQueryClient();

  const handleDrawerClose = () => {
    form.resetFields();
    onClose();
  };

  const onFinish = (values: any) => {

    // Add tenantId to the form values
    const formData = {
      ...values,
      tenantId: tenantId
    };
    
    if (checkInRule?.id) {
      updateCheckInRule(
        { ...formData, id: checkInRule.id },
        {
          onSuccess: () => {
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
        }
      );
    } else {
      createCheckInRule(formData, {
        onSuccess: () => {
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
      });
    }
  };

  // Set form values when CheckInRule changes
  useEffect(() => {
    if (checkInRule) {
      // For planning period, we need to ensure the ID exists in the options
      const formValues = { ...checkInRule };
      
      // If we have planning periods data and a planning period ID, verify it exists
      if (planningPeriodsData?.items && checkInRule.planningPeriodId) {
        const periodExists = planningPeriodsData.items.find(
          (period: PlanningPeriod) => period.id === checkInRule.planningPeriodId
        );
        
        // Only set the planning period ID if it exists in the current options
        if (!periodExists) {
          formValues.planningPeriodId = undefined;
        }
      }
      
      form.setFieldsValue(formValues);
    } else {
      form.resetFields();
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
            timeBased: false,
            achievementBased: false,
            frequency: 1,
          }}
          className="space-y-6"
        >
          <Form.Item
            label="Rule Name"
            name="name"
            rules={[
              { required: true, message: 'Please enter the rule name' },
            ]}
          >
            <Input className="h-12" placeholder="Enter rule name" />
          </Form.Item>

          <Form.Item
            label="Description"
            name="description"
          >
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
              { required: true, message: 'Please select what the rule applies to' },
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
                String(option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
            />
          </Form.Item>

          <div className="flex gap-4 w-full">
            <Form.Item
              label="Time Based"
              name="timeBased"
              className="w-full"
            >
              <Switch />
            </Form.Item>

            <Form.Item
              label="Achievement Based"
              name="achievementBased"
              className="w-full"
            >
              <Switch />
            </Form.Item>
          </div>

          <Form.Item
            label="Frequency"
            name="frequency"
            rules={[
              { required: true, message: 'Please enter frequency' },
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
            label="Operation"
            name="operation"
            rules={[
              { required: true, message: 'Please select operation' },
            ]}
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
            label="Action"
            name="action"
            rules={[
              { required: true, message: 'Please select action' },
            ]}
          >
            <Select
              className="h-12"
              placeholder="Select action"
              options={[
                { value: 'Appreciation', label: 'Appreciation' },
                { value: 'Reprimand', label: 'Reprimand' },
              ]}
            />
          </Form.Item>

          <Form.Item
            label="Category"
            name="categoryId"
            rules={[
              { required: true, message: 'Please select category' },
            ]}
          >
            <Select
              className="h-12"
              placeholder="Select category"
              options={
                feedbackTypesData?.items?.map((feedbackType: FeedbackTypeItems) => ({
                  value: feedbackType.id,
                  label: feedbackType.category,
                })) || []
              }
            />
          </Form.Item>

          {/* Action Buttons - Now inside the form container */}
          <div className="w-full flex justify-center items-center gap-4 pt-8 border-t border-gray-200">
            <Button onClick={handleDrawerClose}>
              Cancel
            </Button>
            <Form.Item className="mb-0">
              <Button
                htmlType="submit"
                type="primary"
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
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