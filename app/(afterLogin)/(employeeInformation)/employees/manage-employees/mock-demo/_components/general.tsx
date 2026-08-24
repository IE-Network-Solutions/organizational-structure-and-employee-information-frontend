'use client';

import { Col, Row } from 'antd';
import dayjs from 'dayjs';
import { MockEmployee } from '@/types/timesheet/workSchedule';
import { getEmployeeDisplayName } from '@/store/server/features/timesheet/workSchedule/helpers';
import { FieldGrid, InfoCard } from './shared';
import { MOCK_JOINED_DATE, MOCK_PROFILE } from './profile';

export default function MockGeneral({ employee }: { employee: MockEmployee }) {
  return (
    <Row gutter={16} data-cy="mock-employee-demo-general">
      <Col lg={12} sm={24} xs={24}>
        <InfoCard
          title="Personal Information"
          dataCy="mock-employee-demo-personal-card"
        >
          <FieldGrid
            dataCy="mock-employee-demo-personal-grid"
            items={[
              {
                label: 'Full Name',
                value: getEmployeeDisplayName(employee),
                dataCy: 'mock-employee-demo-personal-full-name',
              },
              {
                label: 'Gender',
                value: MOCK_PROFILE.gender,
                dataCy: 'mock-employee-demo-personal-gender',
              },
              {
                label: 'Marital Status',
                value: MOCK_PROFILE.maritalStatus,
                dataCy: 'mock-employee-demo-personal-marital-status',
              },
              {
                label: 'Date of Birth',
                value: dayjs(MOCK_PROFILE.dateOfBirth).format('DD MMMM, YYYY'),
                dataCy: 'mock-employee-demo-personal-dob',
              },
              {
                label: 'Nationality',
                value: MOCK_PROFILE.nationality,
                dataCy: 'mock-employee-demo-personal-nationality',
              },
              {
                label: 'Joined Date',
                value: dayjs(MOCK_JOINED_DATE).format('DD MMMM, YYYY'),
                dataCy: 'mock-employee-demo-personal-joined-date',
              },
            ]}
          />
        </InfoCard>
        <InfoCard title="Address" dataCy="mock-employee-demo-address-card">
          <FieldGrid
            dataCy="mock-employee-demo-address-grid"
            items={[
              {
                label: 'Country',
                value: MOCK_PROFILE.address.country,
                dataCy: 'mock-employee-demo-address-country',
              },
              {
                label: 'City',
                value: MOCK_PROFILE.address.city,
                dataCy: 'mock-employee-demo-address-city',
              },
              {
                label: 'Sub City',
                value: MOCK_PROFILE.address.subCity,
                dataCy: 'mock-employee-demo-address-sub-city',
              },
              {
                label: 'Phone Number',
                value: MOCK_PROFILE.address.phoneNumber,
                dataCy: 'mock-employee-demo-address-phone',
              },
            ]}
          />
        </InfoCard>
      </Col>
      <Col lg={12} sm={24} xs={24}>
        <InfoCard
          title="Emergency Contact Information"
          dataCy="mock-employee-demo-emergency-card"
        >
          <FieldGrid
            dataCy="mock-employee-demo-emergency-grid"
            items={[
              {
                label: 'Full Name',
                value: MOCK_PROFILE.emergency.fullName,
                dataCy: 'mock-employee-demo-emergency-full-name',
              },
              {
                label: 'Phone Number',
                value: MOCK_PROFILE.emergency.phoneNumber,
                dataCy: 'mock-employee-demo-emergency-phone',
              },
              {
                label: 'Gender',
                value: MOCK_PROFILE.emergency.gender,
                dataCy: 'mock-employee-demo-emergency-gender',
              },
              {
                label: 'Nationality',
                value: MOCK_PROFILE.emergency.nationality,
                dataCy: 'mock-employee-demo-emergency-nationality',
              },
              {
                label: 'Relationship',
                value: MOCK_PROFILE.emergency.relationship,
                dataCy: 'mock-employee-demo-emergency-relationship',
              },
            ]}
          />
        </InfoCard>
        <InfoCard
          title="Bank Information"
          dataCy="mock-employee-demo-bank-card"
        >
          <FieldGrid
            dataCy="mock-employee-demo-bank-grid"
            items={[
              {
                label: 'Bank Name',
                value: MOCK_PROFILE.bank.bankName,
                dataCy: 'mock-employee-demo-bank-name',
              },
              {
                label: 'Account Number',
                value: MOCK_PROFILE.bank.accountNumber,
                dataCy: 'mock-employee-demo-bank-account-number',
              },
              {
                label: 'Branch',
                value: MOCK_PROFILE.bank.branch,
                dataCy: 'mock-employee-demo-bank-branch',
              },
              {
                label: 'Account Name',
                value: MOCK_PROFILE.bank.accountName,
                dataCy: 'mock-employee-demo-bank-account-name',
              },
            ]}
          />
        </InfoCard>
      </Col>
    </Row>
  );
}
