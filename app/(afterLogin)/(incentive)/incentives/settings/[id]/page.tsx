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
    <div>
      <div className="mb-4 m-2">
        <PageHeader
          title={recognitionData?.name ? recognitionData?.name : '-'}
          size="small"
        ></PageHeader>
      </div>
      <IncentiveSettingsTable />
      <IncentiveSettingsDrawer recognitionData={recognitionData} />
    </div>
  );
};

export default IncentiveSettings;
