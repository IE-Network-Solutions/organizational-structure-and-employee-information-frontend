'use client';

import React, { useState } from 'react';
import { Button, Popover, Select } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import FilterAltOutlinedIcon from '@mui/icons-material/FilterAltOutlined';
import { bscFilterButtonClassName } from '@/app/(afterLogin)/(bsc)/bsc/_components/bscToolbarStyles';
import { useGetActiveFiscalYears } from '@/store/server/features/organizationStructure/fiscalYear/queries';
import { useBscUiStore } from '@/store/uistate/features/bsc';

export default function ScorecardPeriodFilter() {
  const [filterOpen, setFilterOpen] = useState(false);
  const { data: activeFy } = useGetActiveFiscalYears();
  const {
    myScorecardSessionId,
    myScorecardMonthId,
    myScorecardSessionMonths,
    setMyScorecardSessionId,
    setMyScorecardMonthId,
    setMyScorecardSessionMonths,
  } = useBscUiStore();

  const handleSessionChange = (sessionId: string | undefined) => {
    setMyScorecardSessionId(sessionId);
    setMyScorecardMonthId(undefined);
    if (!sessionId) {
      setMyScorecardSessionMonths([]);
      return;
    }
    const session = activeFy?.sessions?.find((s) => s.id === sessionId);
    setMyScorecardSessionMonths(session?.months || []);
  };

  const handleReset = () => {
    setMyScorecardSessionId(undefined);
    setMyScorecardMonthId(undefined);
    setMyScorecardSessionMonths([]);
  };

  const filterBody = (
    <div
      data-cy="bsc-my-scorecard-components-scorecardperiodfilter-tsx-scorecardperiodfilter-div-40"
      className="flex flex-col gap-4"
    >
      <div
        data-cy="bsc-my-scorecard-components-scorecardperiodfilter-tsx-scorecardperiodfilter-div-41"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2"
      >
        <div
          data-cy="bsc-my-scorecard-components-scorecardperiodfilter-tsx-scorecardperiodfilter-div-42"
          className="flex flex-col gap-2"
        >
          <label
            data-cy="bsc-my-scorecard-components-scorecardperiodfilter-tsx-scorecardperiodfilter-label-43"
            className="text-sm font-medium text-gray-700"
          >
            Session
          </label>
          <Select
            allowClear
            placeholder="Select session"
            className="w-full h-10 rounded-lg"
            value={myScorecardSessionId}
            onChange={handleSessionChange}
            options={(activeFy?.sessions || []).map((session) => ({
              value: session.id,
              label: session.name,
            }))}
            data-cy="bsc-my-sc-session"
          />
        </div>
        <div
          data-cy="bsc-my-scorecard-components-scorecardperiodfilter-tsx-scorecardperiodfilter-div-57"
          className="flex flex-col gap-2"
        >
          <label
            data-cy="bsc-my-scorecard-components-scorecardperiodfilter-tsx-scorecardperiodfilter-label-58"
            className="text-sm font-medium text-gray-700"
          >
            Month
          </label>
          <Select
            allowClear
            placeholder="Select month"
            className="w-full h-10 rounded-lg"
            value={myScorecardMonthId}
            onChange={setMyScorecardMonthId}
            disabled={
              !myScorecardSessionId || myScorecardSessionMonths.length === 0
            }
            options={myScorecardSessionMonths.map((month) => ({
              value: month.id,
              label: month.name,
            }))}
            data-cy="bsc-my-sc-month"
          />
        </div>
      </div>
    </div>
  );

  const filterPopover = (
    <div
      data-cy="bsc-my-scorecard-components-scorecardperiodfilter-tsx-scorecardperiodfilter-div-80"
      className="w-[460px] max-w-[460px]"
    >
      {filterBody}
      <div
        data-cy="bsc-my-scorecard-components-scorecardperiodfilter-tsx-scorecardperiodfilter-div-82"
        className="flex justify-end gap-2 pt-4 mt-4 border-t border-gray-100"
      >
        <Button
          onClick={handleReset}
          className="h-8 px-4 rounded-lg text-xs text-gray-700 border-gray-300"
        >
          Reset
        </Button>
        <Button
          type="primary"
          onClick={() => setFilterOpen(false)}
          className="h-8 px-4 rounded-lg text-xs bg-okr-primary border-okr-primary"
        >
          Save Filter
        </Button>
      </div>
    </div>
  );

  return (
    <div data-cy="bsc-my-sc-tab-filters">
      <Popover
        content={filterPopover}
        title={
          <div
            data-cy="bsc-my-scorecard-components-scorecardperiodfilter-tsx-scorecardperiodfilter-div-105"
            className="flex justify-between items-start"
          >
            <div data-cy="bsc-my-scorecard-components-scorecardperiodfilter-tsx-scorecardperiodfilter-div-106">
              <h3
                data-cy="bsc-my-scorecard-components-scorecardperiodfilter-tsx-scorecardperiodfilter-h3-107"
                className="text-base font-bold text-gray-900 m-0"
              >
                Filter
              </h3>
              <p
                data-cy="bsc-my-scorecard-components-scorecardperiodfilter-tsx-scorecardperiodfilter-p-108"
                className="text-xs text-gray-500 mt-1 mb-0"
              >
                Select all filters that apply
              </p>
            </div>
            <button
              data-cy="bsc-my-scorecard-components-scorecardperiodfilter-tsx-scorecardperiodfilter-button-112"
              type="button"
              onClick={() => setFilterOpen(false)}
              className="text-gray-400 hover:text-gray-600 p-1 border-none bg-transparent cursor-pointer"
            >
              <CloseOutlined />
            </button>
          </div>
        }
        trigger="click"
        open={filterOpen}
        onOpenChange={setFilterOpen}
        placement="bottomRight"
        arrow={false}
      >
        <Button
          type="default"
          className={bscFilterButtonClassName}
          icon={<FilterAltOutlinedIcon className="py-1" />}
          data-cy="bsc-my-sc-filter"
        >
          Filter
        </Button>
      </Popover>
    </div>
  );
}
