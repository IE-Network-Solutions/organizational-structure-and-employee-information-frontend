'use client';

import React from 'react';
import { Button, Form, FormInstance, InputNumber, Radio } from 'antd';
import { EmploymentType } from '@/types/enumTypes';

interface HiringOfferStepProps {
  form: FormInstance;
  stepChange: (value: number) => void;
}

const HiringOfferStep: React.FC<HiringOfferStepProps> = ({ form, stepChange }) => {
  const handleBack = () => stepChange(0);
  const handleContinue = async () => {
    try {
      await form.validateFields([
        'employmentType',
        'quantity',
        'yearOfExperience',
        'compensation',
      ]);
      stepChange(2);
    } catch {}
  };

  return (
    <div className="p-2" data-cy="talent-acquisition-create-job-hiring-offer-step">
      <div className="mx-auto max-w-2xl rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <Form.Item
            name="employmentType"
            label={
              <span className="text-sm font-semibold text-gray-700">
                Job Type <span className="text-red-500">*</span>
              </span>
            }
            rules={[{ required: true, message: 'Please select job type!' }]}
          >
            <Radio.Group
              className="flex flex-wrap gap-3 [&_.ant-radio-wrapper]:!m-0 [&_.ant-radio-wrapper]:flex [&_.ant-radio-wrapper]:h-11 [&_.ant-radio-wrapper]:items-center [&_.ant-radio-wrapper]:rounded-lg [&_.ant-radio-wrapper]:border [&_.ant-radio-wrapper]:border-gray-300 [&_.ant-radio-wrapper]:bg-white [&_.ant-radio-wrapper]:px-4 [&_.ant-radio-wrapper]:shadow-none [&_.ant-radio-wrapper-checked]:!border-[#6366F1] [&_.ant-radio-wrapper-checked]:!bg-[#6366F1] [&_.ant-radio-wrapper-checked]:!text-white [&_.ant-radio-wrapper-checked_.ant-radio-inner]:!border-white [&_.ant-radio-wrapper-checked_.ant-radio-inner::after]:!bg-white"
              data-cy="talent-acquisition-create-job-radio-employment-type"
            >
              <Radio value={EmploymentType.FULLTIME}>Full-time</Radio>
              <Radio value={EmploymentType.PARTTIME}>Part-time</Radio>
            </Radio.Group>
          </Form.Item>

          <Form.Item
            name="quantity"
            label={
              <span className="text-sm font-semibold text-gray-700">
                Quantity <span className="text-red-500">*</span>
              </span>
            }
            rules={[{ required: true, message: 'Please input quantity!' }]}
          >
            <InputNumber
              placeholder="0"
              className="w-full h-11 rounded-lg"
              min={0}
              data-cy="talent-acquisition-create-job-input-quantity"
            />
          </Form.Item>

          <Form.Item
            name="yearOfExperience"
            label={
              <span className="text-sm font-semibold text-gray-700">
                Years of experience <span className="text-red-500">*</span>
              </span>
            }
            rules={[
              { required: true, message: 'Please input years of experience!' },
              {
                type: 'number',
                transform: (v) => (v ? Number(v) : v),
              },
            ]}
          >
            <InputNumber
              placeholder="0"
              className="w-full h-11 rounded-lg"
              min={0}
              data-cy="talent-acquisition-create-job-input-years-experience"
            />
          </Form.Item>

          <Form.Item
            name="compensation"
            label={
              <span className="text-sm font-semibold text-gray-700">
                Compensation <span className="text-red-500">*</span>
              </span>
            }
            rules={[{ required: true, message: 'Please input compensation!' }]}
          >
            <InputNumber
              placeholder="0"
              className="w-full h-11 rounded-lg"
              min={0}
              data-cy="talent-acquisition-create-job-input-compensation"
            />
          </Form.Item>
        </div>
      </div>

      <div className="mt-6 flex justify-end gap-3">
        <Button
          onClick={handleBack}
          className="h-11 min-w-[100px] rounded-lg border-gray-300 text-gray-700"
          data-cy="talent-acquisition-create-job-button-back"
        >
          Back
        </Button>
        <Button
          type="primary"
          onClick={handleContinue}
          className="h-11 min-w-[100px] rounded-lg !bg-[#6366F1] hover:!bg-[#4F46E5]"
          data-cy="talent-acquisition-create-job-button-continue-step2"
        >
          Continue
        </Button>
      </div>
    </div>
  );
};

export default HiringOfferStep;
