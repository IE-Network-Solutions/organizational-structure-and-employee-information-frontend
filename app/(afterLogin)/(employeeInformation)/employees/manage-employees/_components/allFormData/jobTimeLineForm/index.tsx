'use client';
import { useGetBranches } from '@/store/server/features/employees/employeeManagment/branchOffice/queries';
import { useGetDepartments } from '@/store/server/features/employees/employeeManagment/department/queries';
import { useGetEmployementTypes } from '@/store/server/features/employees/employeeManagment/employmentType/queries';
import { useGetPositions } from '@/store/server/features/employees/positions/queries';
import { Col, DatePicker, Form, Radio, Row, Select, Switch } from 'antd';
import React, { useState } from 'react';

const { Option } = Select;

const JobTimeLineForm = () => {
  const { data: departmentData } = useGetDepartments();
  const { data: employementType } = useGetEmployementTypes();
  const { data: branchOfficeData } = useGetBranches();
  const { data: positions } = useGetPositions();

  const [contractType, setContractType] = useState<string>('Permanent');

  const handleContractTypeChange = (e: any) => {
    setContractType(e.target.value);
  };

  return (
    <div>
      <div className="flex justify-center items-center text-gray-950 text-sm font-semibold my-2">
        Job Timeline
      </div>
      <Row gutter={16}>
        <Col xs={24}>
          <Form.Item
            className="font-semibold text-xs"
            name={'effectiveStartDate'}
            label="Effective Start Date"
            id="joinedDate"
            rules={[
              { required: true, message: 'Please select the joined date' },
            ]}
          >
            <DatePicker className="w-full" />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col xs={24} sm={12}>
          <Form.Item
            className="font-semibold text-xs"
            name='positionId'
            id="jobTitle"
            label="Position"
            rules={[
              { required: true, message: 'Please select an position type' },
            ]}
          >
            <Select placeholder="Select position type" allowClear>
              {positions?.items?.map((position: any) => (
                <Option key={position?.id} value={position?.id}>
                  {position?.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        <Col xs={24} sm={12}>
          <Form.Item
            className="font-semibold text-xs"
            name={'employementTypeId'}
            id="employementTypeId"
            label="Employment Type"
            rules={[
              { required: true, message: 'Please select an employment type' },
            ]}
          >
            <Select placeholder="Select an employment type" allowClear>
              {employementType?.items?.map((item: any, index: number) => (
                <Option key={index} value={item?.id}>
                  {item?.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={16}>
        <Col xs={24} sm={12}>
          <Form.Item
            className="w-full font-semibold text-xs"
            name={'departmentId'}
            id="departmentId"
            label="Department"
            rules={[{ required: true, message: 'Please select a department' }]}
          >
            <Select
              className="w-full"
              placeholder="Select a department"
              allowClear
            >
              {departmentData?.map((department: any, index: number) => (
                <Option key={index} value={department?.id}>
                  {department?.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        <Col xs={24} sm={12}>
          <Form.Item
            className="w-full font-semibold text-xs"
            name={'branchId'}
            id="branchId"
            label="Branch Office"
            rules={[
              { required: true, message: 'Please select a branch office' },
            ]}
          >
            <Select
              className="w-full"
              placeholder="Select a branch office"
              allowClear
            >
              {branchOfficeData?.items?.map((branch, index: number) => (
                <Option key={index} value={branch?.id}>
                  {branch?.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
      </Row>
      {contractType === 'Contractual' && (
        <Row gutter={16}>
          <Col xs={24}>
            <Form.Item
              className="font-semibold text-xs"
              name={'effectiveEndDate'}
              id="effectiveEndDate"
              label="Effective End Date"
              rules={[
                {
                  required: true,
                  message: 'Please select the effective end date',
                },
              ]}
            >
              <DatePicker className="w-full" />
            </Form.Item>
          </Col>
        </Row>
      )}
      <Row gutter={16}>
        <Col xs={24} sm={8}>
          <div className="font-semibold text-sm">Department Lead</div>
        </Col>
        <Col xs={24} sm={16}>
          <Form.Item
            name="departmentLeadOrNot"
            valuePropName="checked"
            id="departmentLeadOrNot"
          >
            <Switch />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16} className="flex justify-center items-center">
        <Col xs={24} className="flex justify-center items-center mt-2">
          <Form.Item
            className="font-semibold text-xs"
            // label=" "
            id="employmentContractType"
            name={'employmentContractType'}
            rules={[{ required: true, message: 'Please select a job type' }]}
            initialValue="Permanent"
          >
            <Radio.Group onChange={handleContractTypeChange}>
              <Row>
                <Col xs={24} sm={12}>
                  <Radio value="Permanent">Permanent</Radio>
                </Col>
                <Col xs={24} sm={12}>
                  <Radio value="Contractual">Contractual</Radio>
                </Col>
              </Row>
            </Radio.Group>
          </Form.Item>
        </Col>
      </Row>
    </div>
  );
};

export default JobTimeLineForm;
