import React from 'react';
import { Button, Card, Col, Form, Input, Row } from 'antd';
import DynamicFormFields from '../../dynamicFormDisplayer';
import UseSetCategorizedFormData from '../../customField';
import { validateName } from '@/utils/validation';
import LocationPinIcon from '@mui/icons-material/LocationPin';

const EmployeeAddressForm = () => {
  const currentAddressForm = UseSetCategorizedFormData('address');
  return (
    <div id="employee-address-form" data-cy="employee-address-form">
      <Card
        title={
          <div
            data-cy="employee-address-form-title-div"
            className="flex items-center gap-2"
          >
            <Button
              data-cy="employee-address-form-icon"
              className="border border-[#73adff]"
              type="default"
              icon={
                <LocationPinIcon fontSize="small" className="text-[#73adff]" />
              }
            ></Button>
            <span
              data-cy="employee-address-form-title"
              className="text-sm font-normal text-[#4d4d4d]"
            >
              Address
            </span>
          </div>
        }
        className="h-full shadow-sm"
        bodyStyle={{ padding: '16px' }}
      >
        <Form.Item
          className="text-sm font-normal text-[#030712]"
          name={['address', 'country']}
          label={
            <span
              className="text-sm font-normal text-[#030712]"
              data-cy="employee-address-country-label"
            >
              Country
            </span>
          }
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

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              className="text-sm font-normal text-[#030712]"
              name={['address', 'city']}
              label={
                <span
                  className="text-sm font-normal text-[#030712] mb-1"
                  data-cy="employee-address-city-label"
                >
                  City
                </span>
              }
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
          <Col span={12}>
            <Form.Item
              name={['address', 'subCity']}
              label={
                <span
                  className="text-sm font-normal text-[#030712]"
                  data-cy="employee-address-subcity-label"
                >
                  Sub City
                </span>
              }
              id="addressSubCityId"
              data-cy="addressSubCityId"
            >
              <Input
                id="employee-address-subcity-input"
                data-cy="employee-address-subcity-input"
              />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item
          name={['address', 'phoneNumber']}
          label={
            <span
              className="text-sm font-normal text-[#030712]"
              data-cy="employee-address-phone-label"
            >
              Phone Number
            </span>
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
        <DynamicFormFields
          formTitle="address"
          fields={currentAddressForm.form}
          data-cy="employee-address-dynamic-fields"
        />
      </Card>
    </div>
  );
};

export default EmployeeAddressForm;
