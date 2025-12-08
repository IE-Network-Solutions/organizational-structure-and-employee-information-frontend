'use client';
import React from 'react';
import DefaultIncentiveSettingsTable from './_components/incentiveSettingsTable';
import PageHeader from '@/components/common/pageHeader/pageHeader';
import { useAllChildrenRecognition } from '@/store/server/features/incentive/other/queries';
import IncentiveSettingsDrawer from '../[id]/_components/incentiveSettingdrawer';

const DefaultIncentiveSettingCard: React.FC = () => {
  const { data: recognitionData, isLoading: responseLoading } =
    useAllChildrenRecognition();

  return (
    <div id="default-incentive-card-container" data-cy="default-incentive-card-container">
      <div id="default-incentive-card-header-wrapper" data-cy="default-incentive-card-header-wrapper" className="mb-4 m-2">
        <PageHeader
          data-cy="default-incentive-card-header"
          title={recognitionData?.[0]?.name ? recognitionData?.[0]?.name : '-'}
          size="small"
        ></PageHeader>
      </div>
      <DefaultIncentiveSettingsTable
        data-cy="default-incentive-card-table"
        recognitionData={recognitionData}
        responseLoading={responseLoading}
      />
      <IncentiveSettingsDrawer data-cy="default-incentive-card-drawer" recognitionData={recognitionData?.[0]} />
    </div>
  );
};

export default DefaultIncentiveSettingCard;
