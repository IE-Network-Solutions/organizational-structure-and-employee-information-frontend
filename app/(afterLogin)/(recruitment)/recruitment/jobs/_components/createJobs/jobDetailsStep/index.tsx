'use client';

import React from 'react';
import {
  Button,
  DatePicker,
  Form,
  FormInstance,
  Input,
  Radio,
  Select,
} from 'antd';
import { useGetDepartments } from '@/store/server/features/employees/employeeManagment/department/queries';
import { LocationType } from '@/types/enumTypes';
import TextEditor from '@/components/form/textEditor';

const { Option } = Select;

interface JobDetailsStepProps {
  form: FormInstance;
  close: () => void;
  stepChange: (value: number) => void;
}

const JobDetailsStep: React.FC<JobDetailsStepProps> = ({
  form,
  close,
  stepChange,
}) => {
  const { data: departments, isLoading: isDepartmentLoading } =
    useGetDepartments();

  const handleContinue = async () => {
    try {
      await form.validateFields([
        'jobTitle',
        'department',
        'jobLocation',
        'jobStatus',
        'jobDeadline',
        'description',
      ]);
      stepChange(1);
    } catch {}
  };

  return (
    <div className="p-2" data-cy="talent-acquisition-create-job-details-step">
      <div
        className="mx-auto max-w-4xl rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
        data-cy="talent-acquisition-create-job-details-form-container"
      >
        {/* Row 1: Job Name full width */}
        <Form.Item
          name="jobTitle"
          label={
            <span
              className="text-sm font-semibold text-gray-700"
              data-cy="talent-acquisition-create-job-label-job-title"
            >
              Job Name{' '}
              <span
                className="text-red-500"
                data-cy="talent-acquisition-create-job-required-job-title"
              >
                *
              </span>
            </span>
          }
          rules={[{ required: true, message: 'Please input the job name!' }]}
        >
          <Input
            placeholder="Job Name"
            className="h-11 rounded-lg"
            allowClear
            data-cy="talent-acquisition-create-job-input-job-title"
          />
        </Form.Item>

        {/* Row 2: Department and Location side by side */}
        <div
          className="grid grid-cols-1 gap-6 sm:grid-cols-2"
          data-cy="talent-acquisition-create-job-details-row-department-location"
        >
          <Form.Item
            name="department"
            label={
              <span
                className="text-sm font-semibold text-gray-700"
                data-cy="talent-acquisition-create-job-label-department"
              >
                Department{' '}
                <span
                  className="text-red-500"
                  data-cy="talent-acquisition-create-job-required-department"
                >
                  *
                </span>
              </span>
            }
            rules={[
              { required: true, message: 'Please select the department!' },
            ]}
          >
            <Select
              placeholder="Department"
              className="h-11 rounded-lg"
              loading={isDepartmentLoading}
              allowClear
              data-cy="talent-acquisition-create-job-select-department"
            >
              {departments?.map((dep: any) => (
                <Option key={dep?.id} value={dep?.id}>
                  {dep?.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="jobLocation"
            label={
              <span
                className="text-sm font-semibold text-gray-700"
                data-cy="talent-acquisition-create-job-label-location"
              >
                Location{' '}
                <span
                  className="text-red-500"
                  data-cy="talent-acquisition-create-job-required-location"
                >
                  *
                </span>
              </span>
            }
            rules={[{ required: true, message: 'Please select the location!' }]}
          >
            <Radio.Group
              className="flex flex-wrap gap-3 [&_.ant-radio-wrapper]:!m-0 [&_.ant-radio-wrapper]:flex [&_.ant-radio-wrapper]:h-11 [&_.ant-radio-wrapper]:items-center [&_.ant-radio-wrapper]:rounded-lg [&_.ant-radio-wrapper]:border [&_.ant-radio-wrapper]:border-gray-300 [&_.ant-radio-wrapper]:bg-white [&_.ant-radio-wrapper]:px-4 [&_.ant-radio-wrapper]:shadow-none [&_.ant-radio-wrapper-checked]:!border-[#6366F1] [&_.ant-radio-wrapper-checked]:!bg-[#6366F1] [&_.ant-radio-wrapper-checked]:!text-white [&_.ant-radio-wrapper-checked_.ant-radio-inner]:!border-white [&_.ant-radio-wrapper-checked_.ant-radio-inner::after]:!bg-white"
              data-cy="talent-acquisition-create-job-radio-location"
            >
              <Radio value={LocationType.ONSITE}>Onsite</Radio>
              <Radio value={LocationType.REMOTE}>Remote</Radio>
              <Radio value={LocationType.HYBRID}>Hybrid</Radio>
            </Radio.Group>
          </Form.Item>
        </div>

        {/* Row 3: Job Status and Expected Closing Date side by side */}
        <div
          className="grid grid-cols-1 gap-6 sm:grid-cols-2"
          data-cy="talent-acquisition-create-job-details-row-status-deadline"
        >
          <Form.Item
            name="jobStatus"
            label={
              <span
                className="text-sm font-semibold text-gray-700"
                data-cy="talent-acquisition-create-job-label-status"
              >
                Job Status{' '}
                <span
                  className="text-red-500"
                  data-cy="talent-acquisition-create-job-required-status"
                >
                  *
                </span>
              </span>
            }
            rules={[
              { required: true, message: 'Please select the job status!' },
            ]}
          >
            <Radio.Group
              className="flex flex-wrap gap-3 [&_.ant-radio-wrapper]:!m-0 [&_.ant-radio-wrapper]:flex [&_.ant-radio-wrapper]:h-11 [&_.ant-radio-wrapper]:items-center [&_.ant-radio-wrapper]:rounded-lg [&_.ant-radio-wrapper]:border [&_.ant-radio-wrapper]:border-gray-300 [&_.ant-radio-wrapper]:bg-white [&_.ant-radio-wrapper]:px-4 [&_.ant-radio-wrapper]:shadow-none [&_.ant-radio-wrapper-checked]:!border [&_.ant-radio-wrapper-checked]:!border-transparent [&_.ant-radio-wrapper-checked]:!border-b-2 [&_.ant-radio-wrapper-checked]:!border-b-[#6366F1] [&_.ant-radio-wrapper-checked]:!bg-white [&_.ant-radio-wrapper-checked]:!text-gray-800"
              data-cy="talent-acquisition-create-job-radio-status"
            >
              <Radio value="Open">Open</Radio>
              <Radio value="Closed">Close</Radio>
            </Radio.Group>
          </Form.Item>
          <Form.Item
            name="jobDeadline"
            label={
              <span
                className="text-sm font-semibold text-gray-700"
                data-cy="talent-acquisition-create-job-label-deadline"
              >
                Expected Closing Date{' '}
                <span
                  className="text-red-500"
                  data-cy="talent-acquisition-create-job-required-deadline"
                >
                  *
                </span>
              </span>
            }
            rules={[{ required: true, message: 'Please select the date!' }]}
          >
            <DatePicker
              className="w-full h-11 rounded-lg"
              placeholder="Select date"
              data-cy="talent-acquisition-create-job-date-picker-deadline"
            />
          </Form.Item>
        </div>

        {/* Row 4: Description full width, small size */}
        <Form.Item
          name="description"
          label={
            <span
              className="text-sm font-semibold text-gray-700"
              data-cy="talent-acquisition-create-job-label-description"
            >
              Description{' '}
              <span
                className="text-red-500"
                data-cy="talent-acquisition-create-job-required-description"
              >
                *
              </span>
            </span>
          }
          rules={[
            {
              required: true,
              message: 'Please input the description!',
            },
            {
              validator: (rule, value) => {
                const text = value
                  ? String(value)
                      .replace(/<[^>]*>/g, '')
                      .trim()
                  : '';
                if (!text)
                  return Promise.reject(
                    new Error('Please input the description!'),
                  );
                return Promise.resolve();
              },
            },
          ]}
        >
          <TextEditor
            placeholder="Job description"
            className="[&_.ql-container]:!min-h-[100px] [&_.ql-editor]:!min-h-[100px] [&_.ql-editor]:max-h-[120px]"
            data-cy="talent-acquisition-create-job-text-editor-description"
          />
        </Form.Item>
      </div>

      <div
        className="mt-6 flex justify-end gap-3"
        data-cy="talent-acquisition-create-job-details-step-actions"
      >
        <Button
          onClick={close}
          className="h-11 min-w-[100px] rounded-lg border-gray-300 text-gray-700"
          data-cy="talent-acquisition-create-job-button-cancel"
        >
          Cancel
        </Button>
        <Button
          type="primary"
          onClick={handleContinue}
          className="h-11 min-w-[100px] rounded-lg !bg-[#6366F1] hover:!bg-[#4F46E5]"
          data-cy="talent-acquisition-create-job-button-continue"
        >
          Continue
        </Button>
      </div>
    </div>
  );
};

export default JobDetailsStep;
