import { useGetBranches } from '@/store/server/features/employees/employeeManagment/branchOffice/queries';
import { useGetDepartments } from '@/store/server/features/employees/employeeManagment/department/queries';
import { useGetEmployementTypes } from '@/store/server/features/employees/employeeManagment/employmentType/queries';
import { Col, DatePicker, Form, Input, Radio, Row, Switch } from 'antd';
import { Select } from 'antd/lib';
import React from 'react';

const { Option } = Select;

const JobTimeLineForm = () => {
  const { data: departmentData } = useGetDepartments();
  const { data: employementType } = useGetEmployementTypes();
  const { data: branchOfficeData } = useGetBranches();

  return (
    <div>
      <div className="flex justify-center items-center text-gray-950 text-sm font-semibold my-2">
        Job TimeLine
      </div>
      <Row gutter={16}>
        <Col xs={24} sm={24}>
          <Form.Item
            className="font-semibold text-xs"
            name={'joinedDate'}
            label="joinedDate"
            id="joinedDate"
            rules={[{ required: true }]}
          >
            <DatePicker className="w-full" />
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={16}>
        <Col xs={24} sm={24}>
          <Form.Item
            className="font-semibold text-xs"
            name={'effectiveEndDate'}
            id="effectiveEndDate"
            label="Effective End Date"
            rules={[{ required: true }]}
          >
            <DatePicker className="w-full" />
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={16}>
        <Col xs={24} sm={12}>
          <Form.Item
            className="font-semibold text-xs"
            name={'jobTitle'}
            id="jobTitle"
            label="Position"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12}>
          <Form.Item
            className="font-semibold text-xs"
            name={'employmentTypeId'}
            id="employmentTypeId"
            label="Employment Type"
            rules={[{ required: true }]}
          >
            <Select
              placeholder="Select a option and change input text above"
              allowClear
            >
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
            rules={[{ required: true }]}
          >
            <Select
              className="w-full"
              placeholder="Select Department"
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
            rules={[{ required: true }]}
          >
            <Select
              className="w-full"
              placeholder="Select office branch"
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
      <Row>
        <Col xs={24} sm={8}>
          <div className="font-semibold text-sm">Department Lead or Not</div>
        </Col>
        <Col xs={24} sm={16}>
          <Form.Item
            name="departmentLeadOrNot"
            valuePropName="checked"
            id="departmentLeadOrNot"
          >
            <Switch defaultChecked />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16} className="flex justify-center items-center">
        <Col xs={24} className="flex justify-center items-center">
          <Form.Item
            className="font-semibold text-xs"
            label=""
            id="employmentContractType"
            name={'employmentContractType'}
            rules={[{ required: true, message: 'Please select a job type!' }]}
            initialValue={1}
          >
            <Radio.Group>
              <Row>
                <Col xs={24} sm={12}>
                  <Radio value="Permanent">Permanent</Radio>
                </Col>
                <Col xs={24} sm={12}>
                  <Radio value="Contractual">Contract</Radio>
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
