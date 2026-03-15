import React from 'react';
import { Button, Card, Col, Form, Input, Row, Select } from 'antd';
import { useGetNationalities } from '@/store/server/features/employees/employeeManagment/nationality/querier';
import DynamicFormFields from '../../dynamicFormDisplayer';
import UseSetCategorizedFormData from '../../customField';
import ContactsIcon from '@mui/icons-material/Contacts';

const { Option } = Select;

const EmergencyContactForm = () => {
  const { data: nationalities } = useGetNationalities();
  const emergencyContactForm = UseSetCategorizedFormData('emergencyContact');

  return (
    <div id="emergency-contact-form" data-cy="emergency-contact-form">
      <Card
        title={
          <div
            data-cy="emergency-contact-form-title-div"
            className="flex items-center gap-2"
          >
            <Button
              data-cy="emergency-contact-form-icon"
              className="border border-[#73adff]"
              type="default"
              icon={
                <ContactsIcon fontSize="small" className="text-[#73adff]" />
              }
            ></Button>
            <span
              data-cy="emergency-contact-form-title"
              className="text-sm font-normal text-[#4d4d4d]"
            >
              Emergency Contact
            </span>
          </div>
        }
        className="h-full shadow-sm"
        bodyStyle={{ padding: '16px' }}
      >
        <Row gutter={12}>
          <Col lg={12} xs={24}>
            <Form.Item
              name={['emergencyContact', 'firstName']} // Using firstName for Full Name
              label={
                <span
                  data-cy="emergency-contact-full-name-label"
                  className="text-sm font-normal text-[#030712]"
                >
                  Full Name
                </span>
              }
              rules={[{ required: true, message: 'Full Name is required' }]}
            >
              <Input placeholder="Full Name" />
            </Form.Item>
          </Col>
          <Col lg={12} xs={24}>
            <Row gutter={16}>
              <Col lg={12} xs={24}>
                <Form.Item
                  className="text-sm font-normal text-[#030712]"
                  name={['emergencyContact', 'maritalStatus']}
                  label={
                    <span
                      data-cy="emergency-contact-marital-status-label"
                      className="text-sm font-normal text-[#030712]"
                    >
                      Marital Status
                    </span>
                  }
                >
                  <Select placeholder="Select">
                    <Option value="single">Single</Option>
                    <Option value="married">Married</Option>
                    <Option value="divorced">Divorced</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col lg={12} xs={24}>
                <Form.Item
                  className="text-sm font-normal text-[#030712]"
                  name={['emergencyContact', 'nationality']}
                  label={
                    <span
                      data-cy="emergency-contact-nationality-label"
                      className="text-sm font-normal text-[#030712]"
                    >
                      Nationality
                    </span>
                  }
                  id="emergencyContactNationality"
                  data-cy="emergencyContactNationality"
                  rules={[{ required: true }]}
                >
                  <Select
                    placeholder="Select nationality"
                    allowClear
                    showSearch
                    optionFilterProp="children"
                    filterOption={(input, option) =>
                      String(option?.children || '')
                        .toLowerCase()
                        .includes(input.toLowerCase())
                    }
                    id="emergency-contact-nationality-select"
                    data-cy="emergency-contact-nationality-select"
                  >
                    {nationalities?.items?.map(
                      (nationality: any, index: number) => (
                        <Option
                          key={index}
                          value={nationality?.id}
                          id={`emergency-contact-nationality-option-${index}`}
                          data-cy={`emergency-contact-nationality-option-${index}`}
                        >
                          {nationality?.name}
                        </Option>
                      ),
                    )}
                  </Select>
                </Form.Item>
              </Col>
            </Row>
          </Col>
        </Row>
        <Row gutter={12}>
          <Col lg={12} xs={24}>
            <Form.Item
              className="text-sm font-normal text-[#030712]"
              name={['emergencyContact', 'phoneNumber']}
              label={
                <span
                  data-cy="emergency-contact-phone-number-label"
                  className="text-sm font-normal text-[#030712]"
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
                id="emergency-contact-phone-input"
                data-cy="emergency-contact-phone-input"
              />
            </Form.Item>
          </Col>
          <Col lg={12} xs={24}>
            <Form.Item
              className="text-sm font-normal text-[#030712]"
              name={['emergencyContact', 'gender']}
              label={
                <span
                  data-cy="emergency-contact-gender-label"
                  className="text-sm font-normal text-[#030712]"
                >
                  Gender
                </span>
              }
              id="emergencyContactGender"
              data-cy="emergencyContactGender"
              rules={[{ required: true }]}
            >
              <Select
                placeholder="Select gender"
                allowClear
                id="emergency-contact-gender-select"
                data-cy="emergency-contact-gender-select"
              >
                <Option
                  value="male"
                  id="emergency-contact-gender-male"
                  data-cy="emergency-contact-gender-male"
                >
                  Male
                </Option>
                <Option
                  value="female"
                  id="emergency-contact-gender-female"
                  data-cy="emergency-contact-gender-female"
                >
                  Female
                </Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <DynamicFormFields
          formTitle="emergencyContact"
          fields={emergencyContactForm.form}
          data-cy="emergency-contact-dynamic-fields"
        />
      </Card>
    </div>
  );
};

export default EmergencyContactForm;
