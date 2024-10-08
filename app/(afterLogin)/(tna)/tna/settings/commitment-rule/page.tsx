'use client';
import PageHeader from '@/components/common/pageHeader/pageHeader';
import { LuPlus } from 'react-icons/lu';
import CustomButton from '@/components/common/buttons/customButton';
import React, { useEffect } from 'react';
import CommitmentCard from './_components/commitmentCard';
import TnaCommitmentSidebar from '@/app/(afterLogin)/(tna)/tna/settings/commitment-rule/_components/commitmentSidebar';
import { useTnaSettingsStore } from '@/store/uistate/features/tna/settings';
import { useGetTnaCommitment } from '@/store/server/features/tna/commitment/queries';
import { Spin } from 'antd';

const TnaCommitmentRulePage = () => {
  const { isShowCommitmentSidebar, setIsShowCommitmentSidebar } =
    useTnaSettingsStore();
  const { data, isLoading, refetch } = useGetTnaCommitment({});

  useEffect(() => {
    if (!isShowCommitmentSidebar) {
      refetch();
    }
  }, [isShowCommitmentSidebar]);

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

      <Spin spinning={isLoading}>
        {data?.items ? (
          data.items.map((item) => <CommitmentCard key={item.id} item={item} />)
        ) : (
          <div className="p-5"></div>
        )}
      </Spin>

      <TnaCommitmentSidebar />
    </>
  );
};

export default TnaCommitmentRulePage;
