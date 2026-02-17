import React from 'react';
import { Card, Col, Form, Input, Row, Select } from 'antd';
import { useGetNationalities } from '@/store/server/features/employees/employeeManagment/nationality/querier';
import AddCustomField from '../../addCustomField';
import DynamicFormFields from '../../dynamicFormDisplayer';
import UseSetCategorizedFormData from '../../customField';
import { validateName } from '@/utils/validation';
import ContactsIcon from '@mui/icons-material/Contacts';


const { Option } = Select;

const EmergencyContactForm = () => {
  const { data: nationalities } = useGetNationalities();
  const emergencyContactForm = UseSetCategorizedFormData('emergencyContact');

  return (
    <div id="emergency-contact-form" data-cy="emergency-contact-form">
     <Card 
             title={
              <div className="flex items-center gap-2 text-gray-600">
                 <div className="p-1.5 bg-blue-50 rounded text-blue-500">
                    <ContactsIcon fontSize="small" />
                 </div>
                <span className="text-sm font-medium">Emergency Contact</span>
              </div>
            }
            className="h-full shadow-sm"
            bodyStyle={{ padding: '16px' }}
          >
            <Row gutter={12}>
            <Col span={12}>
            <Form.Item
              name={['emergencyContact', 'firstName']} // Using firstName for Full Name
              label="Full Name"
              rules={[{ required: true, message: 'Full Name is required' }]}
            >
               <Input placeholder="Full Name" />
            </Form.Item>
            </Col>
             <Col span={12}>
            <Row gutter={12}>
                <Col span={12}>
                    <Form.Item
                      name={['emergencyContact', 'maritalStatus']}
                      label={<span className="text-gray-500">Marital Status (optional)</span>}
                    >
                       <Select placeholder="Select">
                          <Option value="single">Single</Option>
                          <Option value="married">Married</Option>
                          <Option value="divorced">Divorced</Option>
                       </Select>
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Form.Item
            className="font-semibold text-xs"
            name={['emergencyContact', 'nationality']}
            label={<span className="text-gray-500">Nationality</span>}
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
              {nationalities?.items?.map((nationality: any, index: number) => (
                <Option
                  key={index}
                  value={nationality?.id}
                  id={`emergency-contact-nationality-option-${index}`}
                  data-cy={`emergency-contact-nationality-option-${index}`}
                >
                  {nationality?.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
                </Col>
            </Row>
            </Col>
            </Row>
            <Row gutter={12}>
                <Col span={12}>
                    <Form.Item
            className="font-semibold text-xs"
            name={['emergencyContact', 'phoneNumber']}
            label={<span className="text-gray-500">Phone Number</span>}
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
                <Col span={12}>
                    <Form.Item
            className="font-semibold text-xs"
            name={['emergencyContact', 'gender']}
            label={<span className="text-gray-500">Gender</span>}
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






{/* 
      <Row
        gutter={16}
        id="emergency-contact-row-names"
        data-cy="emergency-contact-row-names"
      >
        <Col
          xs={24}
          sm={8}
          id="emergency-contact-first-name-col"
          data-cy="emergency-contact-first-name-col"
        >
          <Form.Item
            className="font-semibold text-xs"
            name={['emergencyContact', 'firstName']}
            label={
              <span
                className="mb-1 font-semibold text-xs"
                data-cy="emergency-contact-first-name-label"
              >
                First Name
              </span>
            }
            id="emergencyContactFirstName"
            data-cy="emergencyContactFirstName"
            rules={[
              {
                required: true,
                validator: (rule, value) =>
                  !validateName('Full Name', value)
                    ? Promise.resolve()
                    : Promise.reject(
                        new Error(validateName('Full Name', value) || ''),
                      ),
              },
            ]}
          >
            <Input
              id="emergency-contact-first-name-input"
              data-cy="emergency-contact-first-name-input"
            />
          </Form.Item>
        </Col>
        <Col
          xs={24}
          sm={8}
          id="emergency-contact-middle-name-col"
          data-cy="emergency-contact-middle-name-col"
        >
          <Form.Item
            className="font-semibold text-xs"
            name={['emergencyContact', 'middleName']}
            label={
              <span
                className="mb-1 font-semibold text-xs"
                data-cy="emergency-contact-middle-name-label"
              >
                Middle Name
              </span>
            }
            id="emergencyContactMiddleName"
            data-cy="emergencyContactMiddleName"
            rules={[
              {
                validator: (rule, value) =>
                  !value || !validateName('Middle Name', value)
                    ? Promise.resolve()
                    : Promise.reject(
                        new Error(validateName('Middle Name', value) || ''),
                      ),
              },
            ]}
          >
            <Input
              id="emergency-contact-middle-name-input"
              data-cy="emergency-contact-middle-name-input"
            />
          </Form.Item>
        </Col>
        <Col
          xs={24}
          sm={8}
          id="emergency-contact-last-name-col"
          data-cy="emergency-contact-last-name-col"
        >
          <Form.Item
            className="font-semibold text-xs"
            name={['emergencyContact', 'lastName']}
            label={
              <span
                className="mb-1 font-semibold text-xs"
                data-cy="emergency-contact-last-name-label"
              >
                Last Name
              </span>
            }
            id="emergencyContactLastName"
            data-cy="emergencyContactLastName"
            rules={[
              {
                required: true,
                validator: (rule, value) =>
                  !validateName('Last Name', value)
                    ? Promise.resolve()
                    : Promise.reject(
                        new Error(validateName('Last Name', value) || ''),
                      ),
              },
            ]}
          >
            <Input
              id="emergency-contact-last-name-input"
              data-cy="emergency-contact-last-name-input"
            />
          </Form.Item>
        </Col>
      </Row>
      <Row
        gutter={16}
        id="emergency-contact-row-phone"
        data-cy="emergency-contact-row-phone"
      >
        <Col
          xs={24}
          sm={12}
          id="emergency-contact-phone-col"
          data-cy="emergency-contact-phone-col"
        >
          <Form.Item
            className="font-semibold text-xs"
            name={['emergencyContact', 'phoneNumber']}
            label={
              <span
                className="mb-1 font-semibold text-xs"
                data-cy="emergency-contact-phone-label"
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
        <Col
          xs={24}
          sm={12}
          id="emergency-contact-gender-col"
          data-cy="emergency-contact-gender-col"
        >
          <Form.Item
            className="font-semibold text-xs"
            name={['emergencyContact', 'gender']}
            label={
              <span
                className="mb-1 font-semibold text-xs"
                data-cy="emergency-contact-gender-label"
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
      <Row
        gutter={16}
        id="emergency-contact-row-nationality"
        data-cy="emergency-contact-row-nationality"
      >
        <Col
          xs={24}
          sm={24}
          id="emergency-contact-nationality-col"
          data-cy="emergency-contact-nationality-col"
        >
          <Form.Item
            className="font-semibold text-xs"
            name={['emergencyContact', 'nationality']}
            label={
              <span
                className="mb-1 font-semibold text-xs"
                data-cy="emergency-contact-nationality-label"
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
              {nationalities?.items?.map((nationality: any, index: number) => (
                <Option
                  key={index}
                  value={nationality?.id}
                  id={`emergency-contact-nationality-option-${index}`}
                  data-cy={`emergency-contact-nationality-option-${index}`}
                >
                  {nationality?.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
      </Row>
     
      <AddCustomField
        formTitle="emergencyContact"
        customEmployeeInformationForm={emergencyContactForm}
        id="emergency-contact-custom-field"
        data-cy="emergency-contact-custom-field"
      /> */}
    </div>
  );
};

export default EmergencyContactForm;
