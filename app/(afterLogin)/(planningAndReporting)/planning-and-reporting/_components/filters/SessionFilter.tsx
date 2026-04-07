'use client';
import React from 'react';
import { Select } from 'antd';
import { PlanningAndReportingStore } from '@/store/uistate/features/planningAndReporting/useStore';
import {
  useGetAllFiscalYears,
  useGetFiscalYearById,
} from '@/store/server/features/organizationStructure/fiscalYear/queries';
import type { Session } from '@/store/server/features/organizationStructure/fiscalYear/interface';

const { Option } = Select;

const selectClassName =
  'w-full min-w-[160px] flex-1 md:w-auto [&_.ant-select-selector]:!border-[#E5E7EB] [&_.ant-select-selector]:!rounded-lg [&_.ant-select-selector]:!bg-[#FFFFFF] [&_.ant-select-selector]:!py-1 [&_.ant-select-selector]:!px-3 [&_.ant-select-selector]:!min-h-[48px] [&_.ant-select-selector]:!h-12 [&_.ant-select-selector]:!items-center [&_.ant-select-selection-placeholder]:!text-[#8F94A3] [&_.ant-select-selection-placeholder]:!leading-7 [&_.ant-select-selection-placeholder]:!pt-0 [&_.ant-select-selection-item]:!text-[#161A2C] [&_.ant-select-selection-item]:!leading-7 [&_.ant-select-selection-item]:!pt-0 [&_.ant-select-selection-item]:!flex [&_.ant-select-selection-item]:!items-center [&_.ant-select-selection-overflow-item]:!flex [&_.ant-select-selection-overflow-item]:!items-center [&.ant-select]:!h-12 [&.ant-select-focused_.ant-select-selector]:!border-[#574CFF] [&.ant-select-focused_.ant-select-selector]:!shadow-[0_0_0_2px_rgba(87,76,255,0.1)] [&.ant-select-focused_.ant-select-selector]:!bg-[#FFFFFF] [&.ant-select-open_.ant-select-selector]:!bg-[#FFFFFF]';

/** Fiscal year only — use with {@link SessionSelect} for custom layouts. */
export const FiscalYearSelect: React.FC = () => {
  const {
    selectedFiscalYearId,
    setSelectedFiscalYearId,
    setSelectedSessionIds,
    setAllSessionsOfYear,
    setPage,
    setPageReporting,
  } = PlanningAndReportingStore();

  const { data: allFiscalYears, isLoading: loadingYears } =
    useGetAllFiscalYears();

  const handleYearChange = (yearId: string | null) => {
    if (!yearId) {
      setSelectedFiscalYearId(null);
      setSelectedSessionIds([]);
      setAllSessionsOfYear([]);
      setPage(1);
      setPageReporting(1);
    } else {
      setSelectedFiscalYearId(yearId);
    }
  };

  return (
    <Select
      placeholder="Fiscal year"
      className={selectClassName}
      allowClear
      value={selectedFiscalYearId}
      onChange={handleYearChange}
      loading={loadingYears}
      size="large"
      showSearch
      optionFilterProp="children"
      filterOption={(input, option) =>
        option?.children
          ?.toString()
          .toLowerCase()
          .includes(input.toLowerCase()) ?? false
      }
    >
      {allFiscalYears?.items?.map((year) => (
        <Option key={year.id} value={year.id}>
          {year.name}
        </Option>
      ))}
    </Select>
  );
};

/** Session multi-select — use with {@link FiscalYearSelect} for custom layouts. */
export const SessionSelect: React.FC = () => {
  const {
    selectedFiscalYearId,
    selectedSessionIds,
    setSelectedSessionIds,
    setPage,
    setPageReporting,
  } = PlanningAndReportingStore();

  const { data: selectedFiscalYearData, isLoading: loadingSessions } =
    useGetFiscalYearById(selectedFiscalYearId || '');

  const handleSessionChange = (sessionIds: string[]) => {
    setSelectedSessionIds(sessionIds);
    setPage(1);
    setPageReporting(1);
  };

  return (
    <Select
      mode="multiple"
      placeholder="Session"
      className={selectClassName}
      allowClear
      value={selectedSessionIds}
      onChange={handleSessionChange}
      disabled={!selectedFiscalYearId}
      loading={loadingSessions}
      maxTagCount={1}
      size="large"
      showSearch
      optionFilterProp="children"
      filterOption={(input, option) =>
        option?.children
          ?.toString()
          .toLowerCase()
          .includes(input.toLowerCase()) ?? false
      }
    >
      {selectedFiscalYearData?.sessions?.map((session: Session) => (
        <Option key={session.id} value={session.id}>
          {session.name}
        </Option>
      ))}
    </Select>
  );
};

export const SessionFilter: React.FC = () => {
  return (
    <>
      <FiscalYearSelect />
      <SessionSelect />
    </>
  );
};

export default SessionFilter;
