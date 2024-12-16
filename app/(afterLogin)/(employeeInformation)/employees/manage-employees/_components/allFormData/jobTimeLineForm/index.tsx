'use client';
import { useGetBranches } from '@/store/server/features/employees/employeeManagment/branchOffice/queries';
import { useGetDepartments } from '@/store/server/features/employees/employeeManagment/department/queries';
import { useGetEmployementTypes } from '@/store/server/features/employees/employeeManagment/employmentType/queries';
import { useGetPositions } from '@/store/server/features/employees/positions/queries';
import { JobActionStatus } from '@/types/enumTypes';
import {
  Button,
  Col,
  DatePicker,
  Form,
  Radio,
  Row,
  Select,
  Switch,
} from 'antd';
import React, { useState } from 'react';
import { AiOutlineReload } from 'react-icons/ai';

const JobTimeLineForm = () => {
  const { data: departmentData, refetch: departmentsRefetch } =
    useGetDepartments();
  const { data: employementType, refetch: employmentTypeRefetch } =
    useGetEmployementTypes();
  const { data: branchOfficeData, refetch: branchOfficeRefetch } =
    useGetBranches();
  const { data: positions, refetch: positionRefetch } = useGetPositions();

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
            name="positionId"
            id="jobTitle"
            label={
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span>Position</span>{' '}
                <Button
                  type="text"
                  size="small"
                  icon={<AiOutlineReload size={14} className="text-gray-600" />}
                  onClick={() => {
                    positionRefetch();
                  }}
                />
              </div>
            }
            rules={[
              { required: true, message: 'Please select an position type' },
            ]}
          >
            <Select
              showSearch
              optionFilterProp="label"
              placeholder="Select position type"
              allowClear
              options={positions?.items?.map((positions: any) => ({
                value: positions?.id,
                label: `${positions?.name ? positions?.name : ''} `,
              }))}
            />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12}>
          <Form.Item
            className="font-semibold text-xs"
            name={'employementTypeId'}
            id="employementTypeId"
            label={
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span>Employment Type</span>
                <Button
                  type="text"
                  size="small"
                  icon={<AiOutlineReload size={14} className="text-gray-600" />}
                  onClick={() => {
                    employmentTypeRefetch();
                  }}
                />
              </div>
            }
            rules={[
              { required: true, message: 'Please select an employment type' },
            ]}
          >
            <Select
              allowClear
              showSearch
              optionFilterProp="label"
              placeholder="Select an employment type"
              options={employementType?.items?.map((employementType: any) => ({
                value: employementType?.id,
                label: `${employementType?.name ? employementType?.name : ''} `,
              }))}
            />
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={16}>
        <Col xs={24} sm={12}>
          <Form.Item
            className="w-full font-semibold text-xs"
            name={'departmentId'}
            id="departmentId"
            label={
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span>Team</span>
                <Button
                  type="text"
                  size="small"
                  icon={<AiOutlineReload size={14} className="text-gray-600" />}
                  onClick={() => {
                    departmentsRefetch();
                  }}
                />
              </div>
            }
            rules={[{ required: true, message: 'Please select a Team' }]}
          >
            <Select
              allowClear
              showSearch
              optionFilterProp="label"
              placeholder="Select a Team"
              options={departmentData?.map((department: any) => ({
                value: department?.id,
                label: `${department?.name ? department?.name : ''} `,
              }))}
            />
          </Form.Item>{' '}
        </Col>
        <Col xs={24} sm={12}>
          <Form.Item
            className="w-full font-semibold text-xs"
            name={'branchId'}
            id="branchId"
            label={
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span>Branch Office</span>
                <Button
                  type="text"
                  size="small"
                  icon={<AiOutlineReload size={14} className="text-gray-600" />}
                  onClick={() => {
                    branchOfficeRefetch();
                  }}
                />
              </div>
            }
            rules={[
              { required: true, message: 'Please select a branch office' },
            ]}
          >
            <Select
              allowClear
              showSearch
              optionFilterProp="label"
              placeholder="Select a branch office"
              options={branchOfficeData?.items?.map((branch: any) => ({
                value: branch?.id,
                label: `${branch?.name ? branch?.name : ''} `,
              }))}
            />
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={16}>
        <Col xs={24} sm={12}>
          <Form.Item
            className="w-full font-semibold text-xs"
            name="jobAction"
            id="jobAction"
            label="Status"
            rules={[{ required: true, message: 'Please select Status' }]}
          >
            <Select
              allowClear
              showSearch
              optionFilterProp="label"
              placeholder="Select Status"
              options={JobActionStatus?.map((status: any) => ({
                value: status?.id,
                label: `${status?.name ? status?.name : ''} `,
              }))}
            />
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
          <div className="font-semibold text-sm">Team Lead</div>
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
