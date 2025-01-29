'use client';
import PageHeader from '@/components/common/pageHeader/pageHeader';
import { useRecognitionById } from '@/store/server/features/incentive/other/queries';
import { useParams } from 'next/navigation';
import React from 'react';
import IncentiveSettingsTable from './_components/incentiveSettingsTable';
import { Button } from 'antd';
import { FaPlus } from 'react-icons/fa';
import { useIncentiveStore } from '@/store/uistate/features/incentive/incentive';
import IncentiveSettingsDrawer from './_components/incentiveSettingDrawer';

type Params = {
  id: string;
};
const IncentiveSettings: React.FC = () => {
  const { id } = useParams<Params>();

  const { setOpenIncentiveDrawer } = useIncentiveStore();

  const { data: recognitionData, isLoading: responseLoading } =
    useRecognitionById(id);

  return (
    <div>
      <div className="mb-6">
        <PageHeader
          title={
            recognitionData?.recognitionType?.name
              ? recognitionData?.recognitionType?.name
              : ''
          }
          size="small"
        >
          <Button
            onClick={() => setOpenIncentiveDrawer(true)}
            type="primary"
            className="bg-blue-600 hover:bg-blue-700"
          >
            <FaPlus size={13} className="mr-2" />
            Create Formula
          </Button>
        </PageHeader>
      </div>
      <IncentiveSettingsTable />
      <IncentiveSettingsDrawer />
    </div>
  );
};

export default IncentiveSettings;
