'use client';
import React from 'react';
import DefaultIncentiveSettingsTable from './_components/incentiveSettingsTable';
import PageHeader from '@/components/common/pageHeader/pageHeader';
import { useAllRecognition } from '@/store/server/features/incentive/other/queries';

const DefaultIncentiveSettingCard: React.FC = () => {
  const { data: recognitionData, isLoading: responseLoading } =
    useAllRecognition();
  return (
    <div>
      <div className="mb-6">
        <PageHeader
          title={
            recognitionData?.items[0]?.recognitionType?.name
              ? recognitionData?.items[0]?.recognitionType?.name
              : ''
          }
          size="small"
        ></PageHeader>
      </div>
      <DefaultIncentiveSettingsTable
        recognitionData={recognitionData}
        responseLoading={responseLoading}
      />
    </div>
  );
};

export default DefaultIncentiveSettingCard;
