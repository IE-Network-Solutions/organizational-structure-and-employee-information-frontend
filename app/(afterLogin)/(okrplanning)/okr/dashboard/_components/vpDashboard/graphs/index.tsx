import { Col, Row } from 'antd';
import React from 'react';
import ActualVsTargetChart from './actualVsTarget';
import CriteriaContributionChart from './criteriaContribution';
import { useGetActiveFiscalYears } from '@/store/server/features/organizationStructure/fiscalYear/queries';
import CriteriaFilter from './criteriaFilter';
import { useVariablePayStore } from '@/store/uistate/features/okrplanning/VP';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { useGetCriteriaByFilter } from '@/store/server/features/okrplanning/okr/dashboard/VP/queries';

interface VPGraphProps {
  id?: string;
}
const VPGraph: React.FC<VPGraphProps> = ({ id }) => {
  const { searchParams } = useVariablePayStore();
  const { data: activeCalender } = useGetActiveFiscalYears();
  const userId = useAuthenticationStore.getState().userId;
  const identifier = id ?? userId;

  function getActiveSessionMonthIds(activeCalender: any) {
    const activeSession = activeCalender?.sessions?.find(
      (session: any) => session?.active === true,
    );
    return activeSession
      ? activeSession?.months?.map((month: any) => month?.id)
      : [];
  }

  const activeMonthIds = getActiveSessionMonthIds(activeCalender);
  const { data: variablePay } = useGetCriteriaByFilter(
    { activeMonthIds, identifier },
    searchParams?.selectedRange || '',
  );

  return (
    <div className="w-full mt-12">
      <CriteriaFilter />
      <Row gutter={[16, 16]} className="mt-4">
        <Col xs={24} sm={24} md={12} lg={12} xl={12}>
          <ActualVsTargetChart variablePay={variablePay} />
        </Col>
        <Col xs={24} sm={24} md={12} lg={12} xl={12}>
          <CriteriaContributionChart variablePay={variablePay} />
        </Col>
      </Row>
    </div>
  );
};

export default VPGraph;
