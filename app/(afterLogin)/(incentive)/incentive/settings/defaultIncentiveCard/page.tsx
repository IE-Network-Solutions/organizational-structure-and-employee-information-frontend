'use client';
import React from 'react';
import DefaultIncentiveSettingsTable from './_components/incentiveSettingsTable';
import PageHeader from '@/components/common/pageHeader/pageHeader';
import { Button } from 'antd';
import { useParams } from 'next/navigation';
import { useIncentiveStore } from '@/store/uistate/features/incentive/incentive';
import { useRecognitionById } from '@/store/server/features/incentive/other/queries';
import { FaPlus } from 'react-icons/fa';

type Params = {
  id: string;
};
const DefaultIncentiveSettingCard: React.FC = () => {
  const { id } = useParams<Params>();

  const { setOpenIncentiveDrawer } = useIncentiveStore();

  const { data: recognitionData } = useRecognitionById(id);
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
      <DefaultIncentiveSettingsTable />
    </div>
  );
};

export default DefaultIncentiveSettingCard;
