'use client';

import React, { useState } from 'react';
import {
  Form,
  Input,
  DatePicker,
  TimePicker,
  Select,
  Steps,
  Button,
} from 'antd';
import { IoCheckmarkSharp } from 'react-icons/io5';
import CreateActionPlan from '@/app/(afterLogin)/(feedback)/feedback/categories/[id]/survey/[slug]/_components/createActionPlan';
import { useOrganizationalDevelopment } from '@/store/uistate/features/organizationalDevelopment';
import NotificationMessage from '@/components/common/notification/notificationMessage';
import { ConversationStore } from '@/store/uistate/features/conversation';
import TextEditor from '@/components/form/textEditor';
import { FaPlus } from 'react-icons/fa';
import { useGetQuestionSetByConversationId } from '@/store/server/features/conversation/questionSet/queries';
import { FieldType } from '@/types/enumTypes';
import MultipleChoiceField from '@/app/(afterLogin)/(feedback)/feedback/categories/[id]/survey/[slug]/_components/questions/multipleChoiceField';
import ShortTextField from '@/app/(afterLogin)/(feedback)/feedback/categories/[id]/survey/[slug]/_components/questions/shortTextField';
import CheckboxField from '@/app/(afterLogin)/(feedback)/feedback/categories/[id]/survey/[slug]/_components/questions/checkboxField';
import ParagraphField from '@/app/(afterLogin)/(feedback)/feedback/categories/[id]/survey/[slug]/_components/questions/paragraphField';
import TimeField from '@/app/(afterLogin)/(feedback)/feedback/categories/[id]/survey/[slug]/_components/questions/timeField';
import DropdownField from '@/app/(afterLogin)/(feedback)/feedback/categories/[id]/survey/[slug]/_components/questions/dropdownField';
import RadioField from '@/app/(afterLogin)/(feedback)/feedback/categories/[id]/survey/[slug]/_components/questions/radioField';

const { Step } = Steps;
const { Option } = Select;

const CreateMeeting = ({ id }: { id: string }) => {
  const [form] = Form.useForm();
  const { setCurrent, current } = ConversationStore();

  const {data:questionSet}=useGetQuestionSetByConversationId(id);
  
  const { setOpen } = useOrganizationalDevelopment();
  const [currentStep, setCurrentStep] = useState(0);

  const handleCreateBiWeekly = async () => {
    try {
      // Validate all fields in the form
      await form.validateFields();
      const allValues = form.getFieldsValue(true);
    } catch (error) {
      // If validation fails, you can handle it here
      console.error("Validation failed:", error);
    }
  };


console.log(questionSet,"questionSet");

  const customDot = (step: number) => (
    <div
      className={`border-2 rounded-full h-8 w-8 flex items-center justify-center
         ${
           current >= step
             ? 'bg-indigo-700 text-white'
             : 'bg-white border-gray-300 text-gray-500'
         }`}
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
      NotificationMessage.error({
        message: 'something unfilled check the field',
        description: 'check back and try again !!',
      });
    }
  };

  return (
    <>
      <Steps
        current={currentStep}
        size="small"
        // onChange={onChange}
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
        className="text-black "
      >
        {currentStep === 0 && (
          <>
            <Form.Item
              name="biWeeklyName"
              label={
                <span className="text-black text-sm font-semibold">
                  Bi-weekly Meeting Name
                </span>
              }
              rules={[
                {
                  required: true,
                  message: 'Please enter the bi-weekly meeting name',
                },
              ]}
            >
              <Input
                name="biWeeklyName"
                placeholder="Enter the meeting name"
                className="text-black text-sm font-semibold"
              />
            </Form.Item>

            <div className="flex gap-4">
              <Form.Item
                name="meetingDate"
                label={
                  <span className="text-black text-sm font-semibold">
                    Date of Meeting
                  </span>
                }
                rules={[
                  {
                    required: true,
                    message: 'Please select the date of the meeting',
                  },
                ]}
                style={{ flex: 1 }}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>

              <Form.Item
                name="meetingTime"
                label={
                  <span className="text-black text-sm font-semibold">
                    Time of Meeting
                  </span>
                }
                rules={[
                  {
                    required: true,
                    message: 'Please select the time of the meeting',
                  },
                ]}
                style={{ flex: 1 }}
              >
                <TimePicker  style={{ width: '100%' }} />
              </Form.Item>
            </div>

            <Form.Item
              name="department"
              label={
                <span className="text-black text-sm font-semibold">
                  Department
                </span>
              }
              rules={[
                { required: true, message: 'Please enter the department name' },
              ]}
            >
              <Select
                placeholder="Select a department"
                className="text-black text-sm font-semibold"
              >
                <Option value="colleague1">department 1</Option>
                <Option value="colleague2">department 2</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="biWeeklyWith"
              label={
                <span className="text-black text-sm font-semibold">
                  Bi-weekly With
                </span>
              }
              rules={[
                {
                  required: true,
                  message: 'Please select the person for bi-weekly meeting',
                },
              ]}
            >
              <Select
                placeholder="Select a colleague"
                className="text-black text-sm font-semibold"
              >
                <Option value="colleague1">Colleague 1</Option>
                <Option value="colleague2">Colleague 2</Option>
                <Option value="colleague3">Colleague 3</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="meetingObjective"
              label={
                <span className="text-gray-950 font-semibold text-sm">
                  Meeting Objective
                </span>
              }
              rules={[
                {
                  required: true,
                  message: 'Please enter the meeting objective',
                },
              ]}
            >
              <Input.TextArea
                rows={4}
                placeholder="Enter the meeting objective"
                className="text-black font-semibold text-sm"
              />
            </Form.Item>

            <div className="flex justify-center">
              <Button
                onClick={() => form.resetFields()}
                style={{ marginRight: 8 }}
              >
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
              label={
                <span className="text-black text-sm font-semibold">
                  Attendee
                </span>
              }
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
            {questionSet?.conversationsQuestions?.map((q:any, index:number) => (
              <Form.Item
                  name={q.id}
                  key={q.id}
                  labelCol={{ span: 24 }}
                  wrapperCol={{ span: 24 }}
                  label={q.question}
                  className="mx-3 mb-8"
                >
                  <TimeField disabled={false} className='w-full' />
           </Form.Item>
              ))}
          </>
        )}
      </Form>
      <CreateActionPlan
        onClose={() => {
          setOpen(false);
        }}
      />
    </>
  );
};

export default CreateMeeting;
