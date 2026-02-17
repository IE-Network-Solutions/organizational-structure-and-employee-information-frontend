import React from 'react';
import { Card, Col, Form, Input, Row, Select } from 'antd';

import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import BankInformationForm from '../bankAccountForm';
import EmergencyContactForm from '../emergencyContactForm';
import EmployeeAddressForm from '../employeeAddressForm';

const { Option } = Select;

const CustomFieldsForm = () => {
  return (
    <div className="flex flex-col gap-4">
      <Row gutter={[16, 16]}>
       

        {/* Emergency Contact */}
        <Col span={24}>
          <EmergencyContactForm />
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        {/* Address */}
        <Col span={12}>
          <EmployeeAddressForm />

        </Col>
         <Col span={12}>
        {/* Bank Information */}
        <BankInformationForm />
        </Col>

       
      </Row>
    </div>
  );
};

export default CustomFieldsForm;
