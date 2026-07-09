'use client';

import React, { useMemo } from 'react';
import {
  Button,
  DatePicker,
  Form,
  FormInstance,
  Input,
  Radio,
  Select,
} from 'antd';
import dayjs from 'dayjs';
import { useGetDepartments } from '@/store/server/features/employees/employeeManagment/department/queries';
import { useGetAllUsers } from '@/store/server/features/employees/employeeManagment/queries';
import { LocationType } from '@/types/enumTypes';
import { TaRequiredMark } from '../../../../_components/taRequiredMark';

const { TextArea } = Input;

const { Option } = Select;

interface OrgUser {
  id: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
}

const getUserFullName = (user: OrgUser) =>
  `${user.firstName || ''} ${user.middleName || ''} ${user.lastName || ''}`.trim();

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
  const labelClass =
    'inline-flex items-center gap-1.5 text-sm font-normal text-[#030712]';

  const { data: departments, isLoading: isDepartmentLoading } =
    useGetDepartments();
  const { data: usersData, isLoading: isUsersLoading } = useGetAllUsers();

  const hiringManagerOptions = useMemo(
    () =>
      (usersData?.items || []).map((user: OrgUser) => ({
        value: user.id,
        label: getUserFullName(user),
      })),
    [usersData?.items],
  );

  const handleContinue = async () => {
    try {
      await form.validateFields([
        'jobTitle',
        'hiringManagerId',
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
    <div
      className="flex min-h-[440px] flex-col"
      data-cy="talent-acquisition-create-job-details-step"
    >
      <div
        className="mx-auto w-full max-w-[602px] rounded-lg border border-[#E5E7EB] bg-white px-4 py-4 shadow-none [&_.ant-form-item]:!mb-4 [&_.ant-form-item:last-child]:!mb-0"
        data-cy="talent-acquisition-create-job-details-form-container"
      >
        {/* Row 1: Job Name full width */}
        <Form.Item
          name="jobTitle"
          label={
            <span
              className={labelClass}
              data-cy="talent-acquisition-create-job-label-job-title"
            >
              Job Name
              <TaRequiredMark data-cy="talent-acquisition-create-job-required-job-title" />
            </span>
          }
          rules={[{ required: true, message: 'Please input the job name!' }]}
        >
          <Input
            placeholder="Job Name"
            className="h-10 rounded-md"
            allowClear
            data-cy="talent-acquisition-create-job-input-job-title"
          />
        </Form.Item>

        <Form.Item
          name="hiringManagerId"
          label={
            <span
              className={labelClass}
              data-cy="talent-acquisition-create-job-label-hiring-manager"
            >
              Hiring Manager
              <TaRequiredMark data-cy="talent-acquisition-create-job-required-hiring-manager" />
            </span>
          }
          rules={[
            { required: true, message: 'Please select a hiring manager!' },
          ]}
        >
          <Select
            showSearch
            placeholder="Select hiring manager"
            optionFilterProp="label"
            className="h-10 rounded-md [&_.ant-select-selector]:!h-10 [&_.ant-select-selector]:!min-h-10 [&_.ant-select-selector]:!rounded-md [&_.ant-select-selection-item]:!leading-[38px]"
            loading={isUsersLoading}
            allowClear
            options={hiringManagerOptions}
            data-cy="talent-acquisition-create-job-select-hiring-manager"
          />
        </Form.Item>

        {/* Row 2: Department and Location side by side */}
        <div
          className="grid grid-cols-1 gap-y-4 sm:grid-cols-[206px_1fr] sm:gap-x-5"
          data-cy="talent-acquisition-create-job-details-row-department-location"
        >
          <Form.Item
            name="department"
            label={
              <span
                className={labelClass}
                data-cy="talent-acquisition-create-job-label-department"
              >
                Department
                <TaRequiredMark data-cy="talent-acquisition-create-job-required-department" />
              </span>
            }
            rules={[
              { required: true, message: 'Please select the department!' },
            ]}
          >
            <Select
              placeholder="Department"
              className="h-10 rounded-md [&_.ant-select-selector]:!h-10 [&_.ant-select-selector]:!min-h-10 [&_.ant-select-selector]:!rounded-md [&_.ant-select-selection-item]:!leading-[38px]"
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
                className={labelClass}
                data-cy="talent-acquisition-create-job-label-location"
              >
                Location
                <TaRequiredMark data-cy="talent-acquisition-create-job-required-location" />
              </span>
            }
            rules={[{ required: true, message: 'Please select the location!' }]}
          >
            <Radio.Group
              className="grid grid-cols-3 gap-2 [&_.ant-radio-wrapper]:!m-0 [&_.ant-radio-wrapper]:!w-full [&_.ant-radio-wrapper]:flex [&_.ant-radio-wrapper]:h-10 [&_.ant-radio-wrapper]:items-center [&_.ant-radio-wrapper]:justify-center [&_.ant-radio-wrapper]:whitespace-nowrap [&_.ant-radio-wrapper]:rounded-md [&_.ant-radio-wrapper]:border [&_.ant-radio-wrapper]:border-[#D9D9D9] [&_.ant-radio-wrapper]:bg-white [&_.ant-radio-wrapper]:px-3 [&_.ant-radio-wrapper]:text-[14px] [&_.ant-radio-wrapper]:font-normal [&_.ant-radio-wrapper]:text-[rgba(0,0,0,0.7)] [&_.ant-radio-wrapper]:shadow-none"
              data-cy="talent-acquisition-create-job-radio-location"
            >
              <Radio value={LocationType.ONSITE}>Onsite</Radio>
              <Radio value={LocationType.REMOTE}>Remote</Radio>
              <Radio value={LocationType.HYBRID}>Hybrid</Radio>
            </Radio.Group>
          </Form.Item>
        </div>

        {/* Row 3: Job Status and Expected Closing Date – same column split as Row 2 */}
        <div
          className="grid grid-cols-1 gap-y-4 sm:grid-cols-[206px_1fr] sm:gap-x-5"
          data-cy="talent-acquisition-create-job-details-row-status-deadline"
        >
          <Form.Item
            name="jobStatus"
            label={
              <span
                className={labelClass}
                data-cy="talent-acquisition-create-job-label-status"
              >
                Job Status
                <TaRequiredMark data-cy="talent-acquisition-create-job-required-status" />
              </span>
            }
            rules={[
              { required: true, message: 'Please select the job status!' },
            ]}
          >
            <Radio.Group
              className="grid grid-cols-2 gap-2 [&_.ant-radio-wrapper]:!m-0 [&_.ant-radio-wrapper]:!w-full [&_.ant-radio-wrapper]:flex [&_.ant-radio-wrapper]:h-10 [&_.ant-radio-wrapper]:items-center [&_.ant-radio-wrapper]:justify-center [&_.ant-radio-wrapper]:whitespace-nowrap [&_.ant-radio-wrapper]:rounded-md [&_.ant-radio-wrapper]:border [&_.ant-radio-wrapper]:border-[#D9D9D9] [&_.ant-radio-wrapper]:bg-white [&_.ant-radio-wrapper]:px-3 [&_.ant-radio-wrapper]:text-[14px] [&_.ant-radio-wrapper]:font-normal [&_.ant-radio-wrapper]:text-[rgba(0,0,0,0.7)] [&_.ant-radio-wrapper]:shadow-none"
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
                className={labelClass}
                data-cy="talent-acquisition-create-job-label-deadline"
              >
                Expected Closing Date
                <TaRequiredMark data-cy="talent-acquisition-create-job-required-deadline" />
              </span>
            }
            rules={[
              { required: true, message: 'Please select the date!' },
              {
                validator: (validationRule, value) => {
                  void validationRule;
                  const today = dayjs().startOf('day');
                  if (!value) return Promise.resolve();
                  const picked = dayjs(value).startOf('day');
                  if (picked.isBefore(today)) {
                    return Promise.reject(
                      new Error(
                        'Expected end date cannot be before the current date!',
                      ),
                    );
                  }
                  return Promise.resolve();
                },
              },
            ]}
          >
            <DatePicker
              className="w-full h-10 rounded-md"
              placeholder="Select date"
              disabledDate={(current) => {
                if (!current) return false;
                return current.isBefore(dayjs().startOf('day'), 'day');
              }}
              data-cy="talent-acquisition-create-job-date-picker-deadline"
            />
          </Form.Item>
        </div>

        {/* Row 4: Description full width, small size */}
        <Form.Item
          name="description"
          label={
            <span
              className={labelClass}
              data-cy="talent-acquisition-create-job-label-description"
            >
              Description
              <TaRequiredMark data-cy="talent-acquisition-create-job-required-description" />
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
          <TextArea
            placeholder="Job description"
            className="!h-[52px] !min-h-[52px] !max-h-[52px] w-full !resize-none !rounded-md !border-[#D9D9D9] !text-sm !font-normal"
            style={{ height: 52 }}
            data-cy="talent-acquisition-create-job-text-editor-description"
          />
        </Form.Item>
      </div>

      <div
        className="mt-auto flex justify-end gap-2 pt-4"
        data-cy="talent-acquisition-create-job-details-step-actions"
      >
        <Button
          onClick={close}
          className="!h-8 min-w-[72px] !rounded-md !border-[#D9D9D9] !bg-white !px-4 !text-[14px] !font-normal !text-[rgba(0,0,0,0.7)] hover:!border-[#1E40AF] hover:!text-[#1E40AF]"
          data-cy="talent-acquisition-create-job-button-cancel"
        >
          Cancel
        </Button>
        <Button
          type="primary"
          onClick={handleContinue}
          className="!h-8 min-w-[76px] !rounded-md !border !border-solid !border-[#1E40AF] !bg-[#1E40AF] !px-4 !text-[14px] !font-normal !text-white hover:!border-[#1D4ED8] hover:!bg-[#1D4ED8]"
          data-cy="talent-acquisition-create-job-button-continue"
        >
          Continue
        </Button>
      </div>
    </div>
  );
};

export default JobDetailsStep;
