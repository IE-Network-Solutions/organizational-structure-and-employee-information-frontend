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
    <div
      className="p-5 rounded-2xl bg-white h-full"
      id="tnaCommitmentRulePageId"
      data-cy="tna-commitment-rule-page"
    >
      <div
        className="flex justify-between mb-4"
        id="tnaCommitmentRulePageHeaderId"
        data-cy="tna-commitment-rule-page-header"
      >
        <h1
          className="text-lg text-bold"
          id="tnaCommitmentRulePageTitleId"
          data-cy="tna-commitment-rule-page-title"
        >
          Commitment Rules
        </h1>

        <AccessGuard
          permissions={[Permissions.CreateCommitmentRule]}
          data-cy="tna-commitment-rule-page-create-guard"
          id="tnaCommitmentRulePageCreateGuardId"
        >
          <Button
            icon={<FaPlus />}
            type="primary"
            size="large"
            id="tnaCommitmentRulePageNewButtonId"
            data-cy="tna-commitment-rule-page-new-button"
            onClick={() => {
              setIsShowCommitmentSidebar(true);
            }}
          >
            <span
              className="hidden lg:inline"
              data-cy="tna-commitment-rule-page-new-button-text"
              id="tnaCommitmentRulePageNewButtonTextId"
            >
              New Rule
            </span>
          </Button>
        </AccessGuard>
      </div>

      <Spin spinning={isLoading} data-cy="tna-commitment-rule-page-spinner">
        {data?.items ? (
          data.items.map((item) => (
            <CommitmentCard
              key={item.id}
              item={item}
              data-cy={`tna-commitment-card-${item.id}`}
            />
          ))
        ) : (
          <div
            className="p-5"
            id="tnaCommitmentRulePageEmptyId"
            data-cy="tna-commitment-rule-page-empty"
          ></div>
        )}
      </Spin>

      <TnaCommitmentSidebar data-cy="tna-commitment-sidebar" />
    </div>
  );
};

export default TnaCommitmentRulePage;
