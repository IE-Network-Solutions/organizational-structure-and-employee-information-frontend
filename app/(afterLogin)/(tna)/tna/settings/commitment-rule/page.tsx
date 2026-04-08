'use client';
import React, { useEffect, useMemo } from 'react';
import CommitmentCard from './_components/commitmentCard';
import CommitmentRulePageSkeleton from './_components/commitmentRulePageSkeleton';
import TnaCommitmentSidebar from '@/app/(afterLogin)/(tna)/tna/settings/commitment-rule/_components/commitmentSidebar';
import { useTnaSettingsStore } from '@/store/uistate/features/tna/settings';
import { useGetTnaCommitment } from '@/store/server/features/tna/commitment/queries';
import { Button } from 'antd';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
import { FaPlus } from 'react-icons/fa';
import EmptyState from '@/components/empty';

const TnaCommitmentRulePage = () => {
  const { isShowCommitmentSidebar, setIsShowCommitmentSidebar } =
    useTnaSettingsStore();
  const {
    data,
    isLoading: isCommitmentListLoading,
    refetch,
  } = useGetTnaCommitment({});

  const items = useMemo(() => data?.items ?? [], [data?.items]);

  const canCreateCommitmentRule = AccessGuard.checkAccess({
    permissions: [Permissions.CreateCommitmentRule],
  });

  useEffect(() => {
    if (!isShowCommitmentSidebar) {
      refetch();
    }
  }, [isShowCommitmentSidebar, refetch]);

  return (
    <div
      className="p-5 rounded-2xl bg-white h-full"
      id="tnaCommitmentRulePageId"
      data-cy="tna-commitment-rule-page"
    >
      {isCommitmentListLoading ? (
        <CommitmentRulePageSkeleton />
      ) : (
        <>
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

          {items.length === 0 ? (
            <div
              className="w-full min-h-[240px] flex items-center justify-center"
              id="tnaCommitmentRulePageEmptyId"
              data-cy="tna-commitment-rule-page-empty"
            >
              <EmptyState
                title="No commitment rules yet"
                description="Create a rule to define amount ranges and commitment periods."
                actionText={canCreateCommitmentRule ? 'New Rule' : undefined}
                onAction={
                  canCreateCommitmentRule
                    ? () => setIsShowCommitmentSidebar(true)
                    : undefined
                }
              />
            </div>
          ) : (
            items.map((item) => (
              <CommitmentCard
                key={item.id}
                item={item}
                data-cy={`tna-commitment-card-${item.id}`}
              />
            ))
          )}
        </>
      )}

      <TnaCommitmentSidebar data-cy="tna-commitment-sidebar" />
    </div>
  );
};

export default TnaCommitmentRulePage;
