'use client';
import PageHeader from '@/components/common/pageHeader/pageHeader';
import { LuPlus } from 'react-icons/lu';
import CustomButton from '@/components/common/buttons/customButton';
import React from 'react';
import CommitmentCard from './_components/commitmentCard';
import TnaCommitmentSidebar from '@/app/(afterLogin)/(tna)/tna/settings/commitment-rule/_components/commitmentSidebar';
import { useTnaSettingsStore } from '@/store/uistate/features/tna/settings';

const TnaCommitmentRulePage = () => {
  const { setIsShowCommitmentSidebar } = useTnaSettingsStore();
  return (
    <>
      <PageHeader title="Commitment Rules" size="small">
        <CustomButton
          title="New Rule"
          icon={<LuPlus size={18} />}
          type="primary"
          size="large"
          onClick={() => {
            setIsShowCommitmentSidebar(true);
          }}
        />
      </PageHeader>

      <CommitmentCard />

      <TnaCommitmentSidebar />
    </>
  );
};

export default TnaCommitmentRulePage;
