'use client';

import React from 'react';
import { Button, Form, FormInstance, InputNumber, Radio } from 'antd';
import { EmploymentType } from '@/types/enumTypes';
import { TaRequiredMark } from '../../../../_components/taRequiredMark';

interface HiringOfferStepProps {
  form: FormInstance;
  stepChange: (value: number) => void;
}

const HiringOfferStep: React.FC<HiringOfferStepProps> = ({
  form,
  stepChange,
}) => {
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
    <div
      className="p-2"
      data-cy="talent-acquisition-create-job-hiring-offer-step"
    >
      <div
        className="mx-auto max-w-2xl rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
        data-cy="talent-acquisition-create-job-hiring-offer-form-container"
      >
        <div
          className="grid grid-cols-1 gap-6 sm:grid-cols-2"
          data-cy="talent-acquisition-create-job-hiring-offer-fields"
        >
          <Form.Item
            name="employmentType"
            label={
              <span
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-700"
                data-cy="talent-acquisition-create-job-label-job-type"
              >
                Job Type
                <TaRequiredMark data-cy="talent-acquisition-create-job-required-job-type" />
              </span>
            }
            rules={[{ required: true, message: 'Please select job type!' }]}
          >
            <Radio.Group
              className="flex flex-wrap gap-3 [&_.ant-radio-wrapper]:!m-0 [&_.ant-radio-wrapper]:flex [&_.ant-radio-wrapper]:h-11 [&_.ant-radio-wrapper]:items-center [&_.ant-radio-wrapper]:rounded-lg [&_.ant-radio-wrapper]:border [&_.ant-radio-wrapper]:border-gray-300 [&_.ant-radio-wrapper]:bg-white [&_.ant-radio-wrapper]:px-4 [&_.ant-radio-wrapper]:shadow-none"
              data-cy="talent-acquisition-create-job-radio-employment-type"
            >
              <Radio value={EmploymentType.FULLTIME}>Full-time</Radio>
              <Radio value={EmploymentType.PARTTIME}>Part-time</Radio>
            </Radio.Group>
          </Form.Item>

          <Form.Item
            name="quantity"
            label={
              <span
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-700"
                data-cy="talent-acquisition-create-job-label-quantity"
              >
                Quantity
                <TaRequiredMark data-cy="talent-acquisition-create-job-required-quantity" />
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
              <span
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-700"
                data-cy="talent-acquisition-create-job-label-years-experience"
              >
                Years of experience
                <TaRequiredMark data-cy="talent-acquisition-create-job-required-years" />
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
              <span
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-700"
                data-cy="talent-acquisition-create-job-label-compensation"
              >
                Compensation
                <TaRequiredMark data-cy="talent-acquisition-create-job-required-compensation" />
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

      <div
        className="mt-6 flex justify-end gap-2"
        data-cy="talent-acquisition-create-job-hiring-offer-actions"
      >
        <Button
          onClick={handleBack}
          className="!h-9 min-w-[100px] !border-[#D9D9D9] !bg-white !px-4 !text-[14px] !font-normal !text-[rgba(0,0,0,0.7)] hover:!border-[#1E40AF] hover:!text-[#1E40AF]"
          data-cy="talent-acquisition-create-job-button-back"
        >
          Back
        </Button>
        <Button
          type="primary"
          onClick={handleContinue}
          className="!h-9 min-w-[100px] !border !border-solid !border-[#1E40AF] !bg-[#1E40AF] !px-4 !text-[14px] !font-normal !text-white hover:!border-[#1D4ED8] hover:!bg-[#1D4ED8]"
          data-cy="talent-acquisition-create-job-button-continue-step2"
        >
          Continue
        </Button>
      </div>
    </div>
  );
};

export default HiringOfferStep;
