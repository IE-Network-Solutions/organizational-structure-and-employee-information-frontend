import CustomButton from '@/components/common/buttons/customButton';
import CustomDrawerLayout from '@/components/common/customDrawer';
import NotificationMessage from '@/components/common/notification/notificationMessage';
import { Form, Input, InputNumber, Select, Radio } from 'antd';
import React, { useEffect } from 'react';

const { TextArea } = Input;
const { Option } = Select;

interface CheckInRule {
  id: string;
  name: string;
  description: string;
  ruleAppliesTo: string;
  planningPeriod: string;
  ruleType: string;
  frequency: number;
  operation: string;
  action: string;
  category: string;
}

interface CheckInRuleDrawerProps {
  open: boolean;
  onClose: () => void;
  checkInRule?: CheckInRule | null;
}

const CheckInRuleDrawer: React.FC<CheckInRuleDrawerProps> = ({
  open,
  onClose,
  checkInRule,
}) => {
  const [form] = Form.useForm();

  const handleDrawerClose = () => {
    form.resetFields(); // Reset all form fields
    onClose();
  };

  const onFinish = (values: any) => {
    try {
      // TODO: Implement API call to create/update check-in rule
      console.log('Creating/Updating check-in rule:', values);
      
      if (checkInRule) {
        // Update existing rule
        console.log('Updating rule with ID:', checkInRule.id);
      } else {
        // Create new rule
        console.log('Creating new rule');
      }
      
      handleDrawerClose();
      NotificationMessage.success({
        message: checkInRule ? 'Check-in Rule Updated Successfully' : 'Check-in Rule Created Successfully',
      });
    } catch (error) {
      console.error('Error saving check-in rule:', error);
      NotificationMessage.error({
        message: 'Failed to save check-in rule',
      });
    }
  };

  // Set form values when CheckInRule changes
  useEffect(() => {
    if (checkInRule) {
      form.setFieldsValue(checkInRule); // Set form fields with CheckInRule values
    } else {
      form.resetFields(); // Reset form if CheckInRule is null
    }
  }, [checkInRule, form]);

  const modalHeader = (
    <div className="flex justify-center text-xl font-extrabold text-gray-800 p-4">
      {checkInRule ? 'Edit Check-in Rule' : 'Create Check-in Rule'}
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
        htmlType="submit"
        title={checkInRule ? 'Update' : 'Create'}
        type="primary"
        onClick={() => form.submit()}
      />
    </div>
  );

  return (
    <CustomDrawerLayout
      open={open}
      onClose={handleDrawerClose}
      modalHeader={modalHeader}
      footer={footer}
      width="40%"
    >
      <div className="overflow-hidden">
        <Form 
          form={form} 
          onFinish={onFinish} 
          layout="vertical"
          initialValues={{
            ruleType: 'Time-Based',
            action: 'Reprimand',
            category: 'KPI',
          }}
          className="space-y-6"
        >
          <Form.Item
            label="Name*"
            name="name"
            rules={[{ required: true, message: 'Please enter name of rule' }]}
          >
            <Input className="h-12" placeholder="Please enter name of rule" />
          </Form.Item>

          <Form.Item
            label="Description"
            name="description"
          >
            <TextArea 
              rows={3} 
              placeholder="Enter description for the rule"
              className="resize-none"
            />
          </Form.Item>

          <Form.Item
            label="Rule Applies To*"
            name="ruleAppliesTo"
            rules={[{ required: true, message: 'Please select what the rule applies to' }]}
          >
            <Select placeholder="Select what the rule applies to" className="h-12">
              <Option value="Plan">Plan</Option>
              <Option value="Objective">Objective</Option>
              <Option value="KeyResult">Key Result</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Planning Period*"
            name="planningPeriod"
            rules={[{ required: true, message: 'Please select planning period' }]}
          >
            <Select placeholder="Select planning period" className="h-12">
              <Option value="Daily">Daily</Option>
              <Option value="Weekly">Weekly</Option>
              <Option value="Monthly">Monthly</Option>
              <Option value="Quarterly">Quarterly</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Rule Type"
            name="ruleType"
          >
            <Radio.Group>
              <Radio value="Time-Based">Time-Based</Radio>
              <Radio value="Achievement-Based">Achievement-Based</Radio>
              <Radio value="Both">Both</Radio>
            </Radio.Group>
          </Form.Item>

          <Form.Item
            label="Frequency*"
            name="frequency"
            rules={[{ required: true, message: 'Please enter frequency' }]}
          >
            <InputNumber
              placeholder="Enter the number of times"
              min={1}
              className="w-full h-12"
            />
          </Form.Item>

          <Form.Item
            label="Operation*"
            name="operation"
            rules={[{ required: true, message: 'Please select operation' }]}
          >
            <Select placeholder="Select Operation" className="h-12">
              <Option value="check-in">Check-in</Option>
              <Option value="review">Review</Option>
              <Option value="evaluation">Evaluation</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Action*"
            name="action"
            rules={[{ required: true, message: 'Please select action' }]}
          >
            <Select placeholder="Select action" className="h-12">
              <Option value="Reprimand">Reprimand</Option>
              <Option value="Appreciation">Appreciation</Option>
              <Option value="Warning">Warning</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Category*"
            name="category"
            rules={[{ required: true, message: 'Please select category' }]}
          >
            <Select placeholder="Select category" className="h-12">
              <Option value="KPI">KPI</Option>
              <Option value="Milestone">Milestone</Option>
              <Option value="Task">Task</Option>
            </Select>
          </Form.Item>
        </Form>
      </div>

      <style jsx>{`
        .ant-drawer-body {
          overflow: hidden !important;
        }
        .ant-drawer-content-wrapper {
          overflow: hidden !important;
        }
      `}</style>
    </CustomDrawerLayout>
  );
};

export default CheckInRuleDrawer; 