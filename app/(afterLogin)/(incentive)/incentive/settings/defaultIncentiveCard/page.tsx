'use client';
import React from 'react';
import DefaultIncentiveSettingsTable from './_components/incentiveSettingsTable';
import PageHeader from '@/components/common/pageHeader/pageHeader';
import { useAllChildrenRecognition } from '@/store/server/features/incentive/other/queries';

const DefaultIncentiveSettingCard: React.FC = () => {
  const { data: recognitionData, isLoading: responseLoading } =
    useAllChildrenRecognition();
  return (
    <div>
      <div className="mb-6">
        <PageHeader
          title={recognitionData?.[0]?.name ? recognitionData?.[0]?.name : '-'}
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
