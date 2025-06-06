import React from 'react';
import { Col, Form, Input, Row } from 'antd';
import DynamicFormFields from '../../dynamicFormDisplayer';
import AddCustomField from '../../addCustomField';
import UseSetCategorizedFormData from '../../customField';
import { validateName } from '@/utils/validation';

const EmployeeAddressForm = () => {
  const currentAddressForm = UseSetCategorizedFormData('address');
  return (
    <div>
      <div className="flex justify-center items-center text-gray-950 text-sm font-semibold my-2">
        Address
      </div>
      <Row gutter={16}>
        <Col xs={24} sm={12}>
          <Form.Item
            className="font-semibold text-xs"
            name={['address', 'country']}
            label={<span className="mb-1 font-semibold text-xs">Country</span>}
            id="addressCountryId"
            rules={[
              {
                required: true,
                validator: (rule, value) =>
                  !validateName('country', value)
                    ? Promise.resolve()
                    : Promise.reject(
                        new Error(validateName('country', value) || ''),
                      ),
              },
            ]}
          >
            <Input />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12}>
          <Form.Item
            className="font-semibold text-xs"
            name={['address', 'city']}
            label={<span className="mb-1 font-semibold text-xs">City</span>}
            id="addressCityId"
            rules={[
              {
                required: true,
                validator: (rule, value) =>
                  !validateName('city', value)
                    ? Promise.resolve()
                    : Promise.reject(
                        new Error(validateName('city', value) || ''),
                      ),
              },
            ]}
          >
            <Input />
          </Form.Item>
        </Col>
      </Row>
      <DynamicFormFields formTitle="address" fields={currentAddressForm.form} />
      <AddCustomField
        formTitle="address"
        customEmployeeInformationForm={currentAddressForm}
      />
    </div>
  );
};

export default EmployeeAddressForm;
