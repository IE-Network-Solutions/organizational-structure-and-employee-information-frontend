import React from 'react';
import { Col, Form, Input, Row } from 'antd';
import DynamicFormFields from '../../dynamicFormDisplayer';
import AddCustomField from '../../addCustomField';
import UseSetCategorizedFormData from '../../customField';
import { validateName } from '@/utils/validation';

const EmployeeAddressForm = () => {
  const currentAddressForm = UseSetCategorizedFormData('address');
  return (
    <div id="employee-address-form" data-cy="employee-address-form">
      <div
        className="flex justify-center items-center text-gray-950 text-sm font-semibold my-2"
        id="employee-address-title"
        data-cy="employee-address-title"
      >
        Address
      </div>
      <Row gutter={16} id="employee-address-row" data-cy="employee-address-row">
        <Col
          xs={24}
          sm={12}
          id="employee-address-country-col"
          data-cy="employee-address-country-col"
        >
          <Form.Item
            className="font-semibold text-xs"
            name={['address', 'country']}
            label={<span className="mb-1 font-semibold text-xs">Country</span>}
            id="addressCountryId"
            data-cy="addressCountryId"
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
            <Input
              id="employee-address-country-input"
              data-cy="employee-address-country-input"
            />
          </Form.Item>
        </Col>
        <Col
          xs={24}
          sm={12}
          id="employee-address-city-col"
          data-cy="employee-address-city-col"
        >
          <Form.Item
            className="font-semibold text-xs"
            name={['address', 'city']}
            label={<span className="mb-1 font-semibold text-xs">City</span>}
            id="addressCityId"
            data-cy="addressCityId"
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
            <Input
              id="employee-address-city-input"
              data-cy="employee-address-city-input"
            />
          </Form.Item>
        </Col>
        <Col
          xs={24}
          sm={12}
          id="employee-address-subcity-col"
          data-cy="employee-address-subcity-col"
        >
          <Form.Item
            name={['address', 'subCity']}
            label={<span className="mb-1 font-semibold text-xs">Sub City</span>}
            id="addressSubCityId"
            data-cy="addressSubCityId"
          >
            <Input
              id="employee-address-subcity-input"
              data-cy="employee-address-subcity-input"
            />
          </Form.Item>
        </Col>
        <Col
          xs={24}
          sm={12}
          id="employee-address-phone-col"
          data-cy="employee-address-phone-col"
        >
          <Form.Item
            name={['address', 'phoneNumber']}
            label={
              <span className="mb-1 font-semibold text-xs">Phone Number</span>
            }
            id="phoneNumber"
            data-cy="phoneNumber"
            rules={[
              {
                required: true,
                message: 'Phone Number is required.',
              },
              {
                pattern: /^\+?[0-9]\d{6,14}$/,
                message: 'Enter a valid phone number',
              },
            ]}
          >
            <Input
              id="employee-address-phone-input"
              data-cy="employee-address-phone-input"
            />
          </Form.Item>
        </Col>
      </Row>
      <DynamicFormFields
        formTitle="address"
        fields={currentAddressForm.form}
        data-cy="employee-address-dynamic-fields"
      />
      <AddCustomField
        formTitle="address"
        customEmployeeInformationForm={currentAddressForm}
        id="employee-address-custom-field"
        data-cy="employee-address-custom-field"
      />
    </div>
  );
};

export default EmployeeAddressForm;
