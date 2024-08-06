import { Col, DatePicker, Form, Input, Row, Select } from 'antd'
import React from 'react'
import DynamicFormFields from '../../dynamicFormDisplayer';
import AddCustomField from '../../addCustomField';
import { useEmployeeManagmentStore } from '@/store/uistate/features/employees/employeeManagment';
import { useGetNationalities } from '@/store/server/features/employees/employeeManagment/nationality/querier';


const { Option } = Select;

const EmergencyContactForm=()=>{
    const { data: nationalities, isLoading: nationalityLoading } = useGetNationalities();

  return (
    <div>
          <div className='flex justify-center items-center text-gray-950 text-sm font-semibold my-2'>Emergency Contact</div>
      <Row gutter={16}>
          <Col xs={24} sm={12}>
            <Form.Item className='font-semibold text-xs' name={'emergencyContactfullName'} label="Full Name" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item className='font-semibold text-xs' name={'emergencyContactlastName'} label="Last Name" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
          </Col>
      </Row>
      <Row gutter={16}>
          <Col xs={24} sm={12}>
            <Form.Item className='font-semibold text-xs' name={'emergencyContactemailAddress'} label="Email Address" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item className='font-semibold text-xs' name={'emergencyContactgender'} label="Gender" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
          </Col>
      </Row>
      <Row gutter={16}>
          <Col xs={24} sm={12}>
            <Form.Item className='font-semibold text-xs' name={'emergencyContactDateOfBirth'} label="Date Of Birth" rules={[{ required: true }]}>
              <DatePicker className='w-full' />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item className='font-semibold text-xs' name={'emergencyContactNationality'} label="Nationality" rules={[{ required: true }]}>
              <Select
                placeholder="Select an option and change input text above"
                allowClear
              >
                {nationalities?.items?.map((nationality:any)=>(
                <Option value={nationality?.id}>{nationality?.name}</Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
      </Row>
    </div>
  )
}

export default EmergencyContactForm