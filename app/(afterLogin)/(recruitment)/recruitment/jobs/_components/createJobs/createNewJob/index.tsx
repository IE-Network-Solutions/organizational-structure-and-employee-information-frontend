'use client';
import React from 'react';
import {
  Button,
  Col,
  DatePicker,
  Form,
  FormInstance,
  Input,
  Row,
  Select,
} from 'antd';
import TextArea from 'antd/es/input/TextArea';
import AddFormResult from '../result';
import ShareToSocialMedia from '../share';

const { Option } = Select;

interface CreateJobsProps {
  close: () => void;
  form: FormInstance;
  stepChange: (value: number) => void;
}
const CreateNewJob: React.FC<CreateJobsProps> = ({
  close,
  form,
  stepChange,
}) => {
  return (
    <>
      <Form.Item
        name="jobName"
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
          size="large"
          placeholder="Job title"
          className="text-sm w-full  h-10"
        />
      </Form.Item>
      <Row gutter={16}>
        <Col lg={8} sm={24} md={24} xs={24} xl={8}>
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
              placeholder="Employment type"
              className="text-sm w-full h-10"
            >
              <Option value="Full-time">Full-time</Option>
              <Option value="Part-time">Part-time</Option>
              <Option value="Contract">Contract</Option>
              <Option value="Internship">Internship</Option>
              <Option value="Temporary">Temporary</Option>
            </Select>
          </Form.Item>
        </Col>
        <Col lg={8} sm={24} md={24} xs={24} xl={8}>
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
            <Select placeholder="Department" className="text-sm w-full h-10">
              <Option value="HR">HR</Option>
              <Option value="IT">IT</Option>
            </Select>
          </Form.Item>
        </Col>
        <Col lg={8} sm={24} md={24} xs={24} xl={8}>
          <Form.Item
            name="location"
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
            <Select placeholder="Location" className="text-sm w-full h-10">
              <Option value="New York">New York</Option>
              <Option value="Los Angeles">Los Angeles</Option>
              <Option value="Chicago">Chicago</Option>
            </Select>
          </Form.Item>
        </Col>
      </Row>

      <Form.Item
        name="yearsOfExperience"
        label={
          <span className="text-md my-2 font-semibold text-gray-700">
            Years of Experience
          </span>
        }
        rules={[
          {
            required: true,
            message: 'Please input the years of experience!',
          },
        ]}
      >
        <Input size="large" placeholder="0" className="text-sm w-full h-10" />
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
            <Select placeholder="Job status" className="text-sm w-full h-10">
              <Option value="Open">Open</Option>
              <Option value="Closed">Closed</Option>
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
            <Select placeholder="Compensation" className="text-sm w-full h-10">
              <Option value="Full-time">Full-time</Option>
              <Option value="Part-time">Part-time</Option>
            </Select>
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={16}>
        <Col xs={24} sm={24} lg={24} md={12} xl={12}>
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
            <Input
              size="large"
              placeholder="0"
              className="text-sm w-full h-10"
            />
          </Form.Item>
        </Col>
        <Col xs={24} sm={24} lg={24} md={12} xl={12}>
          <Form.Item
            name="expectedClosingDate"
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
            ]}
          >
            <DatePicker className="text-sm w-full h-10" />
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
        <TextArea rows={4} placeholder="Description" />
      </Form.Item>
      <AddFormResult />
      <ShareToSocialMedia />

      <Form.Item>
        <div className="flex justify-center absolute w-full bg-[#fff] px-6 py-6 gap-6">
          <Button
            onClick={close}
            className="flex justify-center text-sm font-medium text-gray-800 bg-white p-4 px-10 h-12 hover:border-gray-500 border-gray-300"
          >
            Cancel
          </Button>
          <Button
            onClick={() => stepChange(1)}
            className="flex justify-center text-sm font-medium text-white bg-primary p-4 px-10 h-12"
          >
            Next
          </Button>
        </div>
      </Form.Item>
    </>
  );
};

export default CreateNewJob;
