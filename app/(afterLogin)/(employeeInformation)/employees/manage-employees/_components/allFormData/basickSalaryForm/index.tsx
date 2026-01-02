import { Col, Form, InputNumber, Row } from 'antd';
import React from 'react';

const BasicSalaryForm: React.FC = () => {
  return (
    <div id="basic-salary-form" data-cy="basic-salary-form">
      <div
        className="flex justify-center items-center text-gray-950 text-sm font-semibold my-2"
        id="basic-salary-title"
        data-cy="basic-salary-title"
      >
        Basic Salary
      </div>
      <Row gutter={16} id="basic-salary-row" data-cy="basic-salary-row">
        <Col xs={24} sm={24} id="basic-salary-col" data-cy="basic-salary-col">
          <Form.Item
            className="font-semibold text-xs"
            name="basicSalary"
            id="basicSalary"
            data-cy="basicSalary"
            label="Basic Salary"
            rules={[
              { required: true, message: 'Basic Salary is Required' },
              { type: 'number', message: 'Salary must be a number' },
              {
                /*  eslint-disable-next-line @typescript-eslint/naming-convention */
                validator: (rule: any, value: any) => {
                  if (value === null || value === undefined || value === '') {
                    return Promise.reject('Salary is required');
                  }
                  if (isNaN(Number(value))) {
                    return Promise.reject('Salary must be a valid number');
                  }
                  const numValue = Number(value);
                  if (numValue <= 0) {
                    return Promise.reject('Salary must be greater than zero');
                  }
                  if (numValue > 100000000) {
                    return Promise.reject('Salary cannot exceed 100,000,000');
                  }
                  if (!Number.isInteger(numValue * 100)) {
                    return Promise.reject(
                      'Salary can have at most 2 decimal places',
                    );
                  }
                  return Promise.resolve();
                },
              },
            ]}
          >
            <InputNumber
              placeholder="Enter basic salary"
              className="w-full"
              min={0}
              max={100000000}
              step={1}
              precision={2}
              formatter={(value) =>
                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
              }
              parser={(value) => value?.replace(/,/g, '') as any}
              onKeyPress={(e) => {
                if (e.key === '-' || e.key === 'e' || e.key === '+') {
                  e.preventDefault();
                }
              }}
              id="basic-salary-input"
              data-cy="basic-salary-input"
            />
          </Form.Item>
        </Col>
      </Row>
    </div>
  );
};

export default BasicSalaryForm;
