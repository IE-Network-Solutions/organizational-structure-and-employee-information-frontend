'use client';
import PageHeader from '@/components/common/pageHeader/pageHeader';
import { useRecognitionById } from '@/store/server/features/incentive/other/queries';
import { useParams } from 'next/navigation';
import React from 'react';
import IncentiveSettingsTable from './_components/incentiveSettingsTable';
import IncentiveSettingsDrawer from './_components/incentiveSettingdrawer';

type Params = {
  id: string;
};
const IncentiveSettings: React.FC = () => {
  const { id } = useParams<Params>();

  const { data: recognitionData } = useRecognitionById(id);

  return (
    <div
      id="incentive-settings-page-container"
      data-cy="incentive-settings-page-container"
    >
      <div
        id="incentive-settings-page-header-wrapper"
        data-cy="incentive-settings-page-header-wrapper"
        className="mb-4 m-2"
      >
        <PageHeader
          data-cy="incentive-settings-page-header"
          title={recognitionData?.name ? recognitionData?.name : '-'}
          size="small"
        ></PageHeader>
      </div>
      <IncentiveSettingsTable data-cy="incentive-settings-page-table" />
      <IncentiveSettingsDrawer
        data-cy="incentive-settings-page-drawer"
        recognitionData={recognitionData}
      />
    </div>
  );
};

export default IncentiveSettings;
