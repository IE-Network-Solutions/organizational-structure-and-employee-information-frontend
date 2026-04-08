'use client';

import React from 'react';
import { Button, Form, FormInstance, InputNumber, Radio } from 'antd';
import { EmploymentType } from '@/types/enumTypes';
import { TaRequiredMark } from '../../../../_components/taRequiredMark';

interface HiringOfferStepProps {
  form: FormInstance;
  stepChange: (value: number) => void;
  close: () => void;
}

const HiringOfferStep: React.FC<HiringOfferStepProps> = ({
  form,
  stepChange,
  close,
}) => {
  const labelClass =
    'inline-flex items-center gap-1.5 text-sm font-normal text-[#030712]';

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
      className="flex min-h-[440px] flex-col"
      data-cy="talent-acquisition-create-job-hiring-offer-step"
    >
      <div
        className="mt-6 mx-auto w-full max-w-[478px] rounded-lg border border-[#E5E7EB] bg-white px-4 py-4 shadow-none [&_.ant-form-item]:!mb-4 [&_.ant-form-item:last-child]:!mb-0"
        data-cy="talent-acquisition-create-job-hiring-offer-form-container"
      >
        <div
          className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2"
          data-cy="talent-acquisition-create-job-hiring-offer-fields"
        >
          <Form.Item
            name="employmentType"
            label={
              <span
                className={labelClass}
                data-cy="talent-acquisition-create-job-label-job-type"
              >
                Job Type
                <TaRequiredMark data-cy="talent-acquisition-create-job-required-job-type" />
              </span>
            }
            rules={[{ required: true, message: 'Please select job type!' }]}
          >
            <Radio.Group
              className="flex gap-2 [&_.ant-radio-wrapper]:!m-0 [&_.ant-radio-wrapper]:flex [&_.ant-radio-wrapper]:h-10 [&_.ant-radio-wrapper]:w-[112px] [&_.ant-radio-wrapper]:shrink-0 [&_.ant-radio-wrapper]:items-center [&_.ant-radio-wrapper]:justify-center [&_.ant-radio-wrapper]:whitespace-nowrap [&_.ant-radio-wrapper]:rounded-md [&_.ant-radio-wrapper]:border [&_.ant-radio-wrapper]:border-[#D9D9D9] [&_.ant-radio-wrapper]:bg-white [&_.ant-radio-wrapper]:px-3 [&_.ant-radio-wrapper]:text-[14px] [&_.ant-radio-wrapper]:font-normal [&_.ant-radio-wrapper]:text-[rgba(0,0,0,0.7)] [&_.ant-radio-wrapper]:shadow-none"
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
                className={labelClass}
                data-cy="talent-acquisition-create-job-label-quantity"
              >
                Quantity
                <TaRequiredMark data-cy="talent-acquisition-create-job-required-quantity" />
              </span>
            }
            rules={[{ required: true, message: 'Please input quantity!' }]}
            className="sm:[&_.ant-form-item-control-input-content]:flex sm:[&_.ant-form-item-control-input-content]:justify-end"
          >
            <InputNumber
              placeholder="0"
              className="!h-10 !w-full sm:!max-w-[199px] rounded-md"
              min={0}
              data-cy="talent-acquisition-create-job-input-quantity"
            />
          </Form.Item>

          <Form.Item
            name="yearOfExperience"
            label={
              <span
                className={labelClass}
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
              className="!h-10 !w-full sm:!max-w-[199px] rounded-md"
              min={0}
              data-cy="talent-acquisition-create-job-input-years-experience"
            />
          </Form.Item>

          <Form.Item
            name="compensation"
            label={
              <span
                className={labelClass}
                data-cy="talent-acquisition-create-job-label-compensation"
              >
                Compensation
                <TaRequiredMark data-cy="talent-acquisition-create-job-required-compensation" />
              </span>
            }
            rules={[{ required: true, message: 'Please input compensation!' }]}
            className="sm:[&_.ant-form-item-control-input-content]:flex sm:[&_.ant-form-item-control-input-content]:justify-end"
          >
            <InputNumber
              placeholder="0"
              className="!h-10 !w-full sm:!max-w-[199px] rounded-md"
              min={0}
              data-cy="talent-acquisition-create-job-input-compensation"
            />
          </Form.Item>
        </div>
      </div>

      <div
        className="mt-auto flex justify-end gap-2 pt-4"
        data-cy="talent-acquisition-create-job-hiring-offer-actions"
      >
        <Button
          onClick={close}
          className="!h-8 min-w-[72px] !rounded-md !border-[#D9D9D9] !bg-white !px-4 !text-[14px] !font-normal !text-[rgba(0,0,0,0.7)] hover:!border-[#1E40AF] hover:!text-[#1E40AF]"
          data-cy="talent-acquisition-create-job-button-cancel-step2"
        >
          Cancel
        </Button>
        <Button
          type="primary"
          onClick={handleContinue}
          className="!h-8 min-w-[76px] !rounded-md !border !border-solid !border-[#1E40AF] !bg-[#1E40AF] !px-4 !text-[14px] !font-normal !text-white hover:!border-[#1D4ED8] hover:!bg-[#1D4ED8]"
          data-cy="talent-acquisition-create-job-button-continue-step2"
        >
          Continue
        </Button>
      </div>
    </div>
  );
};

export default HiringOfferStep;
