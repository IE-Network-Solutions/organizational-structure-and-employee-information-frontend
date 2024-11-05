'use client';

import React, { useState } from 'react';
import { Form, Input, DatePicker, TimePicker, Select, Steps, Button } from 'antd';
import { IoCheckmarkSharp } from 'react-icons/io5';
import { ConversationStore } from '@/store/uistate/features/feedback/conversation';
import RichTextEditor from '@/components/common/reachText';

const { Step } = Steps;
const { Option } = Select;

const CreateMeeting = (props: any) => {
  const [form] = Form.useForm();
  const { setCurrent, current } = ConversationStore();
  const [currentStep, setCurrentStep] = useState(0);

  const handleCreateBiWeekly = (values: any) => {
    // Handle form submission logic
    console.log(values);
    form.resetFields();
    setCurrentStep(0); // Reset to the first step after submission
  };

  const onChange = (value: number) => {
    setCurrent(value);
  };

  const customDot = (step: number) => (
    <div
      className={`border-2 rounded-full h-8 w-8 flex items-center justify-center ${current >= step ? 'bg-indigo-700 text-white' : 'bg-white border-gray-300 text-gray-500'}`}
    >
      <div style={{ fontSize: '24px', lineHeight: '24px' }}>
        {current >= step ? (
          <IoCheckmarkSharp className="text-xs font-bold" />
        ) : (
          '•'
        )}
      </div>
    </div>
  );

  const handleContinue = async () => {
    try {
      // Validate fields of the current step
      await form.validateFields();
      setCurrentStep(1); // Move to the next step if validation passes
    } catch (error) {
      console.log('Validation Failed:', error);
    }
  };

  return (
    <>
      <Steps
        current={currentStep}
        size="small"
        onChange={onChange}
        className="flex justify-center my-6 sm:my-10"
      >
        <Step icon={customDot(0)} />
        <Step icon={customDot(1)} />
      </Steps>

      <Form
        form={form}
        name="createMeetingForm"
        autoComplete="off"
        layout="vertical"
        onFinish={handleCreateBiWeekly}
        style={{ maxWidth: '100%' }}
        className='text-black '
      >
        {currentStep === 0 && (
          <>
            <Form.Item
              name="biWeeklyName"
              label={<span className="text-black text-sm font-semibold">Bi-weekly Meeting Name</span>}
              rules={[{ required: true, message: 'Please enter the bi-weekly meeting name' }]}
            >
              <Input placeholder="Enter the meeting name" className="text-black text-sm font-semibold" />
            </Form.Item>

            <div className="flex gap-4">
              <Form.Item
                name="meetingDate"
                label={<span className="text-black text-sm font-semibold">Date of Meeting</span>}
                rules={[{ required: true, message: 'Please select the date of the meeting' }]}
                style={{ flex: 1 }}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>

              <Form.Item
                name="meetingTime"
                label={<span className="text-black text-sm font-semibold">Time of Meeting</span>}
                rules={[{ required: true, message: 'Please select the time of the meeting' }]}
                style={{ flex: 1 }}
              >
                <TimePicker style={{ width: '100%' }} />
              </Form.Item>
            </div>

            <Form.Item
              name="department"
              label={<span className="text-black text-sm font-semibold">Department</span>}
              rules={[{ required: true, message: 'Please enter the department name' }]}
            >
              <Select placeholder="Select a department" className="text-black text-sm font-semibold">
                <Option value="colleague1">department 1</Option>
                <Option value="colleague2">department 2</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="biWeeklyWith"
              label={<span className="text-black text-sm font-semibold">Bi-weekly With</span>}
              rules={[{ required: true, message: 'Please select the person for bi-weekly meeting' }]}
            >
              <Select placeholder="Select a colleague" className="text-black text-sm font-semibold">
                <Option value="colleague1">Colleague 1</Option>
                <Option value="colleague2">Colleague 2</Option>
                <Option value="colleague3">Colleague 3</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="meetingObjective"
              label={<span className="text-gray-950 font-semibold text-sm font-semibold">Meeting Objective</span>}
              rules={[{ required: true, message: 'Please enter the meeting objective' }]}
            >
              <Input.TextArea
                rows={4}
                placeholder="Enter the meeting objective"
                className="text-black font-semibold text-sm"
              />
            </Form.Item>

            <div className="flex justify-center">
              <Button onClick={() => form.resetFields()} style={{ marginRight: 8 }}>
                Cancel
              </Button>
              <Button type="primary" onClick={handleContinue}>
                Continue
              </Button>
            </div>
          </>
        )}

        {currentStep === 1 && (
          <>
            <Form.Item
              name="attendee"
              label={<span className="text-black text-sm font-semibold">Attendee</span>}
              rules={[{ required: true, message: 'Please select an attendee' }]}
            >
              <Select
                placeholder="Select attendee"
                className="text-black text-sm font-semibold"
                options={[
                  { value: 'employee1', label: 'Employee 1' },
                  { value: 'employee2', label: 'Employee 2' },
                  { value: 'employee3', label: 'Employee 3' },
                ]}
              />
            </Form.Item>

            <Form.Item
              name="okrScore"
              label={<span className="text-black text-sm font-semibold">OKR Score</span>}
              rules={[{ required: true, message: 'Please enter OKR Score' }]}
            >
              <RichTextEditor onChange={(content: any) => console.log(content)} />
            </Form.Item>

            <Form.Item
              name="staffDevelopment"
              label={<span className="text-black text-sm font-semibold">Staff Development</span>}
              rules={[{ required: true, message: 'Please enter details on staff development' }]}
            >
              <RichTextEditor onChange={(content: any) => console.log(content)} />
            </Form.Item>

            <Form.Item
              name="changesIssues"
              label={<span className="text-black text-sm font-semibold">Changes/Issues</span>}
              rules={[{ required: true, message: 'Please enter any changes or issues' }]}
            >
              <RichTextEditor onChange={(content: any) => console.log(content)} />
            </Form.Item>

            <Form.Item
              name="alignmentWithCompany"
              label={<span className="text-black text-sm font-semibold">Alignment with the Company</span>}
              rules={[{ required: true, message: 'Please enter alignment with the company' }]}
            >
              <RichTextEditor onChange={(content: any) => console.log(content)} />
            </Form.Item>

            <div className="flex justify-center">
              <Button onClick={() => setCurrentStep(0)} style={{ marginRight: 8 }}>
                Back
              </Button>
              <Button htmlType='submit' type='primary'>
                Submit
              </Button>
            </div>
          </>
        )}
      </Form>
    </>
  );
};

export default CreateMeeting;
