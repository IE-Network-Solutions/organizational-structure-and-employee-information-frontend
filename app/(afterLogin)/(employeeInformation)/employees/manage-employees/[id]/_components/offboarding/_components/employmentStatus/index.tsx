'use client';

import React from 'react';
import { useFetchOffboardItems } from '@/store/server/features/employees/offboarding/queries';
import OffboardingFormControl from '../offboardingFormControl';
import { Col, Row } from 'antd';
import Image from 'next/image';
import { GENDER_NEUTRAL_AVATAR_URL } from '@/constants/publicImageUrls';

const EmploymentStatus: React.FC = () => {
  const { data: employeeData } = useFetchOffboardItems();

  return (
    <div
      className="bg-white p-6 rounded-lg shadow-md max-w-2xl mx-auto"
      id="offboarding-employment-status-card"
      data-cy="offboarding-employment-status-card"
    >
      <Row
        gutter={16}
        align="middle"
        className="bg-gray-100 p-2 rounded-sm"
        id="offboarding-employment-status-header"
        data-cy="offboarding-employment-status-header"
      >
        <Col
          id="offboarding-employment-status-avatar-col"
          data-cy="offboarding-employment-status-avatar-col"
        >
          <Image unoptimized
            src={employeeData?.avatar || GENDER_NEUTRAL_AVATAR_URL}
            alt={employeeData?.name || 'Employee'}
            width={40}
            height={40}
            className="rounded-full"
            id="offboarding-employment-status-avatar"
            data-cy="offboarding-employment-status-avatar"
          />
        </Col>
        <Col
          id="offboarding-employment-status-info-col"
          data-cy="offboarding-employment-status-info-col"
        >
          <h2
            className="text-base font-semibold mb-0"
            id="offboarding-employment-status-name"
            data-cy="offboarding-employment-status-name"
          >
            {employeeData?.name ? employeeData?.name : 'Gelila Tegegne'}
          </h2>
          <p
            className="text-gray-500 mb-0 text-sm"
            id="offboarding-employment-status-role"
            data-cy="offboarding-employment-status-role"
          >
            {employeeData?.position
              ? employeeData?.position
              : 'Jr. Software Developer'}
          </p>
          <p
            className="text-sm text-gray-900 mb-0"
            id="offboarding-employment-status-manager"
            data-cy="offboarding-employment-status-manager"
          >
            Reports Directly to {''}
            {employeeData?.manager ? employeeData?.manager : 'Abeselom G/kidan'}
          </p>
        </Col>
      </Row>
      <p
        className="text-base font-semibold my-4"
        id="offboarding-employment-status-title"
        data-cy="offboarding-employment-status-title"
      >
        Employment Status
      </p>
      <div
        id="offboarding-employment-control-wrapper"
        data-cy="offboarding-employment-control-wrapper"
      >
        <OffboardingFormControl
          id="offboarding-employment-control"
          data-cy="offboarding-employment-control"
        />
      </div>
    </div>
  );
};

export default EmploymentStatus;
