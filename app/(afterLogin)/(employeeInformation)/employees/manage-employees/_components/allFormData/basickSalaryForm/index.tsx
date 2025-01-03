import { Col, Form, InputNumber, Row } from 'antd';
import React from 'react';

const BasicSalaryForm: React.FC = () => {
  return (
    <div>
      <div className="flex justify-center items-center text-gray-950 text-sm font-semibold my-2">
        Basic Salary
      </div>
      <Row gutter={16}>
        <Col xs={24} sm={24}>
          <Form.Item
            className="font-semibold text-xs"
            name="basicSalary"
            id="basicSalary"
            label="Basic Salary"
            rules={[{ required: true, message: 'Basic Salary is Required' }]}
          >
            <InputNumber placeholder="Enter basic salary" min={0} />
          </Form.Item>
        </Col>
      </Row>
    </div>
  );
};

export default BasicSalaryForm;
