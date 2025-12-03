'use client';
import React, { useEffect } from 'react';
import { Select } from 'antd';
import { PlanningAndReportingStore } from '@/store/uistate/features/planningAndReporting/useStore';
import {
  useGetAllFiscalYears,
  useGetFiscalYearById,
} from '@/store/server/features/organizationStructure/fiscalYear/queries';
import type { Session } from '@/store/server/features/organizationStructure/fiscalYear/interface';

const { Option } = Select;

export const SessionFilter: React.FC = () => {
  const {
    selectedFiscalYearId,
    setSelectedFiscalYearId,
    selectedSessionIds,
    setSelectedSessionIds,
    setAllSessionsOfYear,
    setPage,
    setPageReporting,
  } = PlanningAndReportingStore();

  const { data: allFiscalYears, isLoading: loadingYears } =
    useGetAllFiscalYears();
  const { data: selectedFiscalYearData, isLoading: loadingSessions } =
    useGetFiscalYearById(selectedFiscalYearId || '');

  // When year selected, populate all sessions and trigger refetch
  useEffect(() => {
    if (selectedFiscalYearData?.sessions) {
      const allSessionIds = selectedFiscalYearData.sessions.map(
        (s: Session) => s.id,
      );
      setAllSessionsOfYear(allSessionIds);
      // Don't show sessions as selected in UI, but backend will get all sessions
      setSelectedSessionIds([]);
      setPage(1);
      setPageReporting(1);
    }
  }, [
    selectedFiscalYearData,
    setAllSessionsOfYear,
    setSelectedSessionIds,
    setPage,
    setPageReporting,
  ]);

  const handleYearChange = (yearId: string | null) => {
    if (!yearId) {
      // Clear year → revert to default
      setSelectedFiscalYearId(null);
      setSelectedSessionIds([]);
      setAllSessionsOfYear([]);
      setPage(1);
      setPageReporting(1);
    } else {
      setSelectedFiscalYearId(yearId);
    }
  };

  const handleSessionChange = (sessionIds: string[]) => {
    // User explicitly selected sessions - show them in UI
    setSelectedSessionIds(sessionIds);
    setPage(1);
    setPageReporting(1);
  };

  return (
    <>
      {/* Fiscal Year Dropdown */}
      <Select
        placeholder="Fiscal year"
        style={{ width: 200 }}
        className="h-14"
        allowClear
        value={selectedFiscalYearId}
        onChange={handleYearChange}
        loading={loadingYears}
      >
        {allFiscalYears?.items?.map((year) => (
          <Option key={year.id} value={year.id}>
            {year.name}
          </Option>
        ))}
      </Select>

      {/* Session Dropdown */}
      <Select
        mode="multiple"
        placeholder="Session"
        style={{ width: 200 }}
        className="h-14"
        allowClear
        value={selectedSessionIds}
        onChange={handleSessionChange}
        disabled={!selectedFiscalYearId}
        loading={loadingSessions}
        maxTagCount={1}
      >
        {selectedFiscalYearData?.sessions?.map((session: Session) => (
          <Option key={session.id} value={session.id}>
            {session.name}
          </Option>
        ))}
      </Select>
    </>
  );
};

export default SessionFilter;
