'use client';
import React from 'react';
import { Button } from 'antd';
import { AiOutlineReload } from 'react-icons/ai';
import VariablePayTable from '../../(compensation)/benefit/variablePay/_components/variablePayTable';
import PageHeader from '@/components/common/pageHeader/pageHeader';
import VPScoreCard from './_components/vpScoreCard';
import { useGetVpScoreCalculate } from '@/store/server/features/okrplanning/okr/dashboard/VP/queries';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';

const VariablePayPage = () => {
  const userId = useAuthenticationStore.getState().userId;
  const {
    isLoading: isRefreshLoading,
    refetch,
    isRefetching,
  } = useGetVpScoreCalculate(userId, false);

  return (
    <div
      id="variable-pay-page-container"
      data-cy="variable-pay-page-container"
      className="h-auto w-auto px-6 py-6"
    >
      <PageHeader
        data-cy="variable-pay-page-header"
        title="Variable Pay"
        description="VP"
      >
        <div
          className="-mt-5"
          data-cy="variable-pay-score-card-refresh-wrapper"
        >
          <Button
            icon={
              <AiOutlineReload
                className={
                  isRefreshLoading || isRefetching ? 'animate-spin' : ''
                }
                data-cy="variable-pay-score-card-refresh-icon"
              />
            }
            className="flex flex-shrink-0 items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white font-normal text-[#5d5d5d] max-md:h-8 max-md:w-8 max-md:p-0"
            onClick={() => refetch()}
            disabled={isRefreshLoading || isRefetching}
            data-cy="variable-pay-score-card-refresh-button"
            id="variable-pay-score-card-refresh-button"
          >
            <span
              className="hidden md:inline"
              data-cy="variable-pay-score-card-refresh-button-text"
            >
              Refresh VP
            </span>
          </Button>
        </div>
      </PageHeader>
      <div
        className="mt-4 border-b border-gray-100"
        data-cy="variable-pay-page-header-separator"
      />
      <VPScoreCard />
      <VariablePayTable data-cy="variable-pay-table" />
    </div>
  );
};

export default VariablePayPage;
