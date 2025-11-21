'use client';
import React from 'react';
import {
  Button,
  Col,
  DatePicker,
  Form,
  FormInstance,
  Input,
  InputNumber,
  Row,
  Select,
  Spin,
} from 'antd';
import { EmploymentType, LocationType } from '@/types/enumTypes';
import { useGetDepartments } from '@/store/server/features/employees/employeeManagment/department/queries';
import dayjs from 'dayjs';
import TextEditor from '@/components/form/textEditor';

const { Option } = Select;
interface CreateJobsProps {
  close: () => void;
  form: FormInstance;
  stepChange: (value: number) => void;
}

const CreateNewJob: React.FC<CreateJobsProps> = ({
  close,
  stepChange,
  form,
}) => {
  const { data: departments, isLoading: isDepartmentLoading } =
    useGetDepartments();

  const handleNext = async () => {
    try {
      await form.validateFields([
        'jobTitle',
        'employmentType',
        'department',
        'jobLocation',
        'yearOfExperience',
        'jobStatus',
        'compensation',
        'quantity',
        'jobDeadline',
        'description',
      ]);
      stepChange(1);
    } catch (e) {}
  };

  return (
    <div className="p-2">
      <Form.Item
        name="jobTitle"
        label={
          <span className="text-md my-2 font-semibold text-gray-700">
            Job Name
          </span>
        }
        rules={[
          {
            required: true,
            message: 'Please input the job name!',
          },
        ]}
        >
        <Input
          id="jobTitle"
          data-cy="talent-acquisition-create-job-input-job-title"
          size="large"
          placeholder="Job title"
          className="text-sm w-full h-10"
          allowClear
        />
      </Form.Item>
      <Row gutter={16}>
        <Col xs={24} sm={24} lg={8} md={24} xl={8}>
          <Form.Item
            name="employmentType"
            label={
              <span className="text-md my-2 font-semibold text-gray-700">
                Employment Type
              </span>
            }
            rules={[
              {
                required: true,
                message: 'Please input the employment type!',
              },
            ]}
          >
            <Select
              id="employmentType"
              data-cy="talent-acquisition-create-job-select-employment-type"
              placeholder="Employment type"
              className="text-sm w-full h-10"
            >
              {EmploymentType &&
                Object.values(EmploymentType).map((type) => (
                  <Option key={type} value={type} id={`talent-acquisition-create-job-option-employment-type-${type}`} data-cy={`talent-acquisition-create-job-option-employment-type-${type}`}>
                    {type}
                  </Option>
                ))}
            </Select>
          </Form.Item>
        </Col>
        <Col xs={24} sm={24} lg={8} md={24} xl={8}>
          <Form.Item
            name="department"
            label={
              <span className="text-md my-2 font-semibold text-gray-700">
                Department
              </span>
            }
            rules={[
              {
                required: true,
                message: 'Please input the department!',
              },
            ]}
          >
            <Select
              id="department"
              data-cy="talent-acquisition-create-job-select-department"
              placeholder="Department"
              className="text-sm w-full h-10"
            >
              {isDepartmentLoading && (
                <div className="flex items-center justify-center h-30">
                  <Spin size="small" />
                </div>
              )}
              {departments &&
                departments.map((dep: any) => (
                  <Option key={dep?.id} value={dep?.id} id={`talent-acquisition-create-job-option-department-${dep?.id}`} data-cy={`talent-acquisition-create-job-option-department-${dep?.id}`}>
                    {dep?.name}
                  </Option>
                ))}
            </Select>
          </Form.Item>
        </Col>
        <Col xs={24} sm={24} lg={8} md={24} xl={8}>
          <Form.Item
            name="jobLocation"
            label={
              <span className="text-md my-2 font-semibold text-gray-700">
                Location
              </span>
            }
            rules={[
              {
                required: true,
                message: 'Please input the location!',
              },
            ]}
          >
            <Select
              id="jobLocation"
              data-cy="talent-acquisition-create-job-select-location"
              placeholder="Location"
              className="text-sm w-full h-10"
            >
              {Object.values(LocationType).map((type) => (
                <Option key={type} value={type} id={`talent-acquisition-create-job-option-location-${type}`} data-cy={`talent-acquisition-create-job-option-location-${type}`}>
                  {type}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
      </Row>
      <Form.Item
        name="yearOfExperience"
        label={
          <span className="text-md my-2 font-semibold text-gray-700">
            Years of Experience
          </span>
        }
        rules={[
          {
            required: true,
            type: 'number',
            message: 'Please input the years of experience!',
            transform: (value) => (value ? Number(value) : value),
          },
        ]}
      >
        <InputNumber
          id="yearOfExperience"
          data-cy="talent-acquisition-create-job-input-years-experience"
          size="large"
          placeholder="0"
          className="text-sm w-full h-10"
        />
      </Form.Item>
      <Row gutter={16}>
        <Col xs={24} sm={24} lg={24} md={12} xl={12}>
          <Form.Item
            name="jobStatus"
            label={
              <span className="text-md my-2 font-semibold text-gray-700">
                Job Status
              </span>
            }
            rules={[
              {
                required: true,
                message: 'Please input the job status',
              },
            ]}
          >
            <Select
              id="jobStatus"
              data-cy="talent-acquisition-create-job-select-job-status"
              placeholder="Job status"
              className="text-sm w-full h-10"
            >
              <Option value="Open" id="talent-acquisition-create-job-option-status-open" data-cy="talent-acquisition-create-job-option-status-open">Open</Option>
              <Option value="Closed" id="talent-acquisition-create-job-option-status-closed" data-cy="talent-acquisition-create-job-option-status-closed">Closed</Option>
            </Select>
          </Form.Item>
        </Col>
        <Col xs={24} sm={24} lg={24} md={12} xl={12}>
          <Form.Item
            name="compensation"
            label={
              <span className="text-md my-2 font-semibold text-gray-700">
                Compensation
              </span>
            }
            rules={[
              {
                required: true,
                message: 'Please input the compensation!',
              },
            ]}
          >
            <Select
              id="compensation"
              data-cy="talent-acquisition-create-job-select-compensation"
              placeholder="Compensation"
              className="text-sm w-full h-10"
            >
              {EmploymentType &&
                Object.values(EmploymentType).map((type, index) => (
                  <Option
                  id={`compensationOption-${index}`}
                    data-cy={`talent-acquisition-create-job-option-compensation-${type}`}
                    key={type}
                    value={type}
                  >
                    {type}
                  </Option>
                ))}
            </Select>
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={16}>
        <Col xs={24} sm={24} lg={24} md={24} xl={12}>
          <Form.Item
            name="quantity"
            label={
              <span className="text-md my-2 font-semibold text-gray-700">
                Quantity
              </span>
            }
            rules={[
              {
                required: true,
                message: 'Please input the quantity!',
              },
            ]}
          >
            <InputNumber
              id="quantity"
              data-cy="talent-acquisition-create-job-input-quantity"
              size="large"
              placeholder="0"
              className="text-sm w-full h-10"
            />
          </Form.Item>
        </Col>
        <Col xs={24} sm={24} lg={24} md={24} xl={12}>
          <Form.Item
            name="jobDeadline"
            label={
              <span className="text-md my-2 font-semibold text-gray-700">
                Expected Closing Date
              </span>
            }
            rules={[
              {
                required: true,
                message: 'Please input the expected closing date!',
              },
              {
                validator({}, value) {
                  if (!value || value.isAfter(dayjs(), 'day')) {
                    return Promise.resolve();
                  }
                  return Promise.reject(
                    new Error(
                      'Expected end date cannot be before the current date!',
                    ),
                  );
                },
              },
            ]}
          >
            <DatePicker id="jobDeadline" data-cy="talent-acquisition-create-job-date-picker-deadline" className="text-sm w-full h-10" />
          </Form.Item>
        </Col>
      </Row>
      <Form.Item
        name="description"
        label={
          <span className="text-md my-2 font-semibold text-gray-700">
            Description
          </span>
        }
        rules={[
          {
            required: true,
            message: 'Please input the description!',
          },
        ]}
      >
        <TextEditor placeholder="Description" />
      </Form.Item>
      <Form.Item>
        <div className="flex justify-center w-full bg-[#fff] px-6 py-6 gap-6">
          <Button
            id="cancelButton"
            data-cy="talent-acquisition-create-job-button-cancel"
            onClick={close}
            className="flex justify-center text-sm font-medium text-gray-800 bg-white p-4 px-10 h-10 hover:border-gray-500 border-gray-300"
          >
            Cancel
          </Button>
          <Button
            id="nextButton"
            data-cy="talent-acquisition-create-job-button-next"
            onClick={handleNext}
            className="flex justify-center text-sm font-medium text-white bg-primary p-4 px-10 h-10 border-none"
          >
            Next
          </Button>
        </div>
      </Form.Item>
    </div>
  );
};

export default CreateNewJob;
