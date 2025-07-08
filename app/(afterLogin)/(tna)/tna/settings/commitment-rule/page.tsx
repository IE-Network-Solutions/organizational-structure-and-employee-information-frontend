'use client';
import React, { useEffect } from 'react';
import CommitmentCard from './_components/commitmentCard';
import TnaCommitmentSidebar from '@/app/(afterLogin)/(tna)/tna/settings/commitment-rule/_components/commitmentSidebar';
import { useTnaSettingsStore } from '@/store/uistate/features/tna/settings';
import { useGetTnaCommitment } from '@/store/server/features/tna/commitment/queries';
import { Button, Spin } from 'antd';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
import { FaPlus } from 'react-icons/fa';

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
    <div className="p-5 rounded-2xl bg-white h-full">
      <div className="flex justify-between mb-4">
        <h1 className="text-lg text-bold">Commitment Rules</h1>

        <AccessGuard permissions={[Permissions.CreateCommitmentRule]}>
          <Button
            icon={<FaPlus />}
            type="primary"
            size="large"
            onClick={() => {
              setIsShowCommitmentSidebar(true);
            }}
          >
            <span className="hidden lg:inline">New Rule</span>
          </Button>
        </AccessGuard>
      </div>

      <Spin spinning={isLoading}>
        {data?.items ? (
          data.items.map((item) => <CommitmentCard key={item.id} item={item} />)
        ) : (
          <div className="p-5"></div>
        )}
      </Spin>

      <TnaCommitmentSidebar />
    </div>
  );
};

export default TnaCommitmentRulePage;
