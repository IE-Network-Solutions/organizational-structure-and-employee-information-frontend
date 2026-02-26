import React from 'react';
import { Col, Row } from 'antd';
import BankInformationForm from '../bankAccountForm';
import EmergencyContactForm from '../emergencyContactForm';
import EmployeeAddressForm from '../employeeAddressForm';

const CustomFieldsForm = () => {
  return (
    <div
      data-cy="employee-manage-custom-fields-form"
      className="flex flex-col gap-4"
    >
      <Row gutter={[16, 16]}>
        {/* Emergency Contact */}
        <Col
          data-cy="employee-manage-custom-fields-form-emergency-contact"
          span={24}
        >
          <EmergencyContactForm />
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        {/* Address */}
        <Col data-cy="employee-manage-custom-fields-form-address" lg={12} xs={24}>
          <EmployeeAddressForm />
        </Col>
        <Col
          data-cy="employee-manage-custom-fields-form-bank-information"
          lg={12}
          xs={24}
        >
          {/* Bank Information */}
          <BankInformationForm />
        </Col>
      </Row>
    </div>
  );
};

export default CustomFieldsForm;
