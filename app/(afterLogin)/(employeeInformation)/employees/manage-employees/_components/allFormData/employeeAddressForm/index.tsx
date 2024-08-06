import React from 'react'
import { Button, Card, Col, DatePicker, Form,Input,Image , Radio, Row, Select, Steps, Switch, Table, TableProps, TimePicker, Upload, UploadFile, message, List } from 'antd';
import DynamicFormFields from '../../dynamicFormDisplayer';
import AddCustomField from '../../addCustomField';
import { useEmployeeManagmentStore } from '@/store/uistate/features/employees/employeeManagment';

const { Step } = Steps;
const { Option } = Select;
const { Dragger } = Upload;
const  EmployeeAddressForm=()=>{
    const [form] = Form.useForm();
    const {addressForm,setAddressForm}=useEmployeeManagmentStore();
  return (
    <div>
    <div className='flex justify-center items-center text-gray-950 text-sm font-semibold my-2'>Address</div>
      <Row gutter={16}>
          <Col xs={24} sm={12}>
            <Form.Item className='font-semibold text-xs' name={'addressCountry'} label="Country" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item className='font-semibold text-xs' name={'addressCity'} label="City" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
          </Col>
      </Row>
      <Row gutter={16}>
          <Col xs={24} sm={12}>
            <Form.Item className='font-semibold text-xs' name={'addressSubcity'} label="Subcity/zone" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item className='font-semibold text-xs' name={'addressWoreda'} label="Woreda" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
          </Col>
      </Row>
      <Row gutter={16}>
          <Col xs={24} sm={12}>
            <Form.Item className='font-semibold text-xs' name={'addressPrimaryAddress'} label="Primary Address" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item className='font-semibold text-xs' name={'addressHouseNumber'} label="House Number" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
          </Col>
      </Row>
            <DynamicFormFields fields={addressForm.form} />
            <AddCustomField formTitle='address' setNewValue={setAddressForm} customEmployeeInformationForm={addressForm}/>
    </div>
  )
}

export default EmployeeAddressForm