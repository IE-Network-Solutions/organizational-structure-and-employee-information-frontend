'use client';

import classNames from 'classnames';
import { Button, Col, Grid, Popover, Row, Select } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import { MdOutlineFilterAlt } from 'react-icons/md';
import React, { useMemo, useRef, useState } from 'react';
import { PlanningAndReportingStore } from '@/store/uistate/features/planningAndReporting/useStore';
import {
  useGetAllFiscalYears,
  useGetFiscalYearById,
} from '@/store/server/features/organizationStructure/fiscalYear/queries';
import { useGetDepartmentUsersAllLevels } from '@/store/server/features/employees/employeeManagment/department/queries';
import type { Session } from '@/store/server/features/organizationStructure/fiscalYear/interface';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import {
  buildEmployeeOptions,
  commitPlanningDraft,
  initPlanningFilterDraftFromStore,
  planTypeOptions,
  usePlanningToolbarFilters,
  type PlanningFilterDraft,
} from './usePlanningToolbarFilters';

const { Option } = Select;

const planningSelectClass =
  'w-full [&_.ant-select-selector]:!border-[#E5E7EB] [&_.ant-select-selector]:!rounded-lg [&_.ant-select-selector]:!bg-[#FFFFFF] [&_.ant-select-selector]:!py-2.5 [&_.ant-select-selector]:!px-3 [&_.ant-select-selector]:!min-h-[48px] [&_.ant-select-selector]:!h-12 [&_.ant-select-selection-placeholder]:!text-[#8F94A3] [&_.ant-select-selection-placeholder]:!leading-7 [&_.ant-select-selection-placeholder]:!pt-0 [&_.ant-select-selection-item]:!text-[#161A2C] [&_.ant-select-selection-item]:!leading-7 [&_.ant-select-selection-item]:!pt-0 [&.ant-select]:!h-12 [&.ant-select-focused_.ant-select-selector]:!border-[#574CFF] [&.ant-select-focused_.ant-select-selector]:!shadow-[0_0_0_2px_rgba(87,76,255,0.1)] [&.ant-select-focused_.ant-select-selector]:!bg-[#FFFFFF] [&.ant-select-open_.ant-select-selector]:!bg-[#FFFFFF]';

const sessionSelectClass =
  'w-full min-w-0 [&_.ant-select-selector]:!border-[#E5E7EB] [&_.ant-select-selector]:!rounded-lg [&_.ant-select-selector]:!bg-[#FFFFFF] [&_.ant-select-selector]:!py-1 [&_.ant-select-selector]:!px-3 [&_.ant-select-selector]:!min-h-[48px] [&_.ant-select-selector]:!h-12 [&_.ant-select-selector]:!items-center [&_.ant-select-selection-placeholder]:!text-[#8F94A3] [&_.ant-select-selection-placeholder]:!leading-7 [&_.ant-select-selection-placeholder]:!pt-0 [&_.ant-select-selection-item]:!text-[#161A2C] [&_.ant-select-selection-item]:!leading-7 [&_.ant-select-selection-item]:!pt-0 [&_.ant-select-selection-item]:!flex [&_.ant-select-selection-overflow-item]:!flex [&_.ant-select-selection-overflow-item]:!items-center [&.ant-select]:!h-12 [&.ant-select-focused_.ant-select-selector]:!border-[#574CFF] [&.ant-select-focused_.ant-select-selector]:!shadow-[0_0_0_2px_rgba(87,76,255,0.1)] [&.ant-select-focused_.ant-select-selector]:!bg-[#FFFFFF] [&.ant-select-open_.ant-select-selector]:!bg-[#FFFFFF]';

type Snapshot = {
  selectedUser: string[];
  planningFilterDepartment: string | undefined;
  planningFilterPlanType: string;
  selectedFiscalYearId: string | null;
  selectedSessionIds: string[];
  allSessionsOfYear: string[];
};

export default function PlanningToolbarFilters() {
  const screens = Grid.useBreakpoint();
  const showFilterLabel = Boolean(screens.lg);

  const [filterOpen, setFilterOpen] = useState(false);
  const [draft, setDraft] = useState<PlanningFilterDraft | null>(null);
  const snapshotRef = useRef<Snapshot | null>(null);
  const applyCloseRef = useRef(false);

  const { userId } = useAuthenticationStore();
  const activeTab = PlanningAndReportingStore((s) => s.activeTab);
  const {
    employeeData,
    isEmployeesLoading,
    departmentData,
    departmentOptions,
  } = usePlanningToolbarFilters();
  const { data: allFiscalYears, isLoading: loadingYears } =
    useGetAllFiscalYears();
  const { data: draftFiscalYearData, isLoading: loadingSessions } =
    useGetFiscalYearById(draft?.fiscalYearId || '');
  const { data: allLevelDepartmentUsers } = useGetDepartmentUsersAllLevels(
    draft?.department && draft.department !== 'all' ? draft.department : null,
  );

  const allLevelDepartmentUserIds = useMemo(() => {
    const payload = allLevelDepartmentUsers;
    if (!payload) return [];
    if (Array.isArray(payload)) {
      return payload
        .map((u: any) => String(u?.id ?? u?.userId ?? ''))
        .filter((id: string) => id);
    }
    if (Array.isArray(payload?.users)) {
      return payload.users
        .map((u: any) => String(u?.id ?? u?.userId ?? ''))
        .filter((id: string) => id);
    }
    if (Array.isArray(payload?.items)) {
      return payload.items
        .map((u: any) => String(u?.id ?? u?.userId ?? ''))
        .filter((id: string) => id);
    }
    return [];
  }, [allLevelDepartmentUsers]);

  const employeeOptions = useMemo(
    () =>
      buildEmployeeOptions(
        draft?.department ?? 'all',
        employeeData,
        departmentData,
        allLevelDepartmentUserIds,
      ),
    [
      draft?.department,
      employeeData,
      departmentData,
      allLevelDepartmentUserIds,
    ],
  );

  const employeeSelectValue = useMemo(() => {
    if (!draft) return 'all';
    const v = draft.employeeSelect;
    if (v === 'all' || v === 'subordinate') return 'all';
    const exists = employeeOptions.some((o) => o.value === v);
    return exists ? v : undefined;
  }, [draft, employeeOptions]);

  const captureSnapshot = (): Snapshot => {
    const s = PlanningAndReportingStore.getState();
    return {
      selectedUser: [...s.selectedUser],
      planningFilterDepartment: s.planningFilterDepartment,
      planningFilterPlanType: s.planningFilterPlanType,
      selectedFiscalYearId: s.selectedFiscalYearId,
      selectedSessionIds: [...s.selectedSessionIds],
      allSessionsOfYear: [...s.allSessionsOfYear],
    };
  };

  const restoreSnapshot = () => {
    const snap = snapshotRef.current;
    if (!snap) return;
    const {
      setSelectedUser,
      setPlanningFilterDepartment,
      setPlanningFilterPlanType,
      setSelectedFiscalYearId,
      setSelectedSessionIds,
      setAllSessionsOfYear,
    } = PlanningAndReportingStore.getState();
    setSelectedUser(snap.selectedUser);
    setPlanningFilterDepartment(snap.planningFilterDepartment);
    setPlanningFilterPlanType(snap.planningFilterPlanType);
    setSelectedFiscalYearId(snap.selectedFiscalYearId);
    setSelectedSessionIds(snap.selectedSessionIds);
    setAllSessionsOfYear(snap.allSessionsOfYear);
  };

  const handleFilterPopoverOpenChange = (open: boolean) => {
    if (open) {
      snapshotRef.current = captureSnapshot();
      setDraft(initPlanningFilterDraftFromStore());
      applyCloseRef.current = false;
    } else {
      if (!applyCloseRef.current) {
        restoreSnapshot();
      }
      applyCloseRef.current = false;
      setDraft(null);
    }
    setFilterOpen(open);
  };

  const handleFilterApply = () => {
    if (draft) {
      commitPlanningDraft(draft, {
        userId,
        employeeData,
        departmentData,
        allLevelDepartmentUserIds,
      });
    }
    applyCloseRef.current = true;
    setFilterOpen(false);
    setDraft(null);
  };

  const handleFilterCancel = () => {
    restoreSnapshot();
    applyCloseRef.current = true;
    setFilterOpen(false);
    setDraft(null);
  };

  const updateDraft = (patch: Partial<PlanningFilterDraft>) => {
    setDraft((d) => (d ? { ...d, ...patch } : d));
  };

  const filterPopoverContent = (
    <div
      className="w-[min(100vw-2rem,520px)] rounded-lg bg-white shadow-lg ring-1 ring-black/5"
      data-cy="planning-toolbar-filter-popover"
    >
      <div
        data-cy="planning-and-reporting-components-planning-planningtoolbarfilters-tsx-planningtoolbarfilters-div-152"
        className="flex items-center justify-between border-b border-gray-100 px-4 py-3"
      >
        <span
          data-cy="planning-and-reporting-components-planning-planningtoolbarfilters-tsx-planningtoolbarfilters-span-153"
          className="text-base font-semibold text-gray-900"
        >
          Filter
        </span>
        <button
          type="button"
          className="flex h-8 w-8 items-center justify-center rounded-md text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-800"
          aria-label="Close filter"
          onClick={handleFilterCancel}
          data-cy="planning-toolbar-filter-close"
        >
          <CloseOutlined />
        </button>
      </div>
      <div
        data-cy="planning-and-reporting-components-planning-planningtoolbarfilters-tsx-planningtoolbarfilters-div-164"
        className="max-h-[min(70vh,28rem)] overflow-y-auto px-4 pb-2 pt-4"
      >
        {draft ? (
          <Row gutter={[16, 16]}>
            <Col span={24}>
              <div
                data-cy="planning-and-reporting-components-planning-planningtoolbarfilters-tsx-planningtoolbarfilters-div-168"
                className="flex flex-col gap-2"
              >
                <span
                  data-cy="planning-and-reporting-components-planning-planningtoolbarfilters-tsx-planningtoolbarfilters-span-169"
                  className="text-sm font-medium text-gray-700"
                >
                  Employee
                </span>
                <Select
                  className={planningSelectClass}
                  placeholder="Select employee"
                  options={employeeOptions}
                  onChange={(value: string) =>
                    updateDraft({ employeeSelect: value })
                  }
                  value={employeeSelectValue}
                  loading={isEmployeesLoading}
                  size="large"
                  showSearch
                  optionFilterProp="label"
                  filterOption={(input, option) =>
                    option?.label
                      ?.toString()
                      .toLowerCase()
                      .includes(input.toLowerCase()) ?? false
                  }
                  notFoundContent={
                    isEmployeesLoading ? 'Loading...' : 'No employees found'
                  }
                  data-cy="planning-toolbar-filter-employee"
                />
              </div>
            </Col>
            <Col xs={24} sm={12}>
              <div
                data-cy="planning-and-reporting-components-planning-planningtoolbarfilters-tsx-planningtoolbarfilters-div-198"
                className="flex flex-col gap-2"
              >
                <span
                  data-cy="planning-and-reporting-components-planning-planningtoolbarfilters-tsx-planningtoolbarfilters-span-199"
                  className="text-sm font-medium text-gray-700"
                >
                  Plan type
                </span>
                <Select
                  id="planning-plan-type-select"
                  data-cy="planning-plan-type-select"
                  className={planningSelectClass}
                  placeholder="Plan type"
                  options={planTypeOptions}
                  onChange={(value: string) => updateDraft({ planType: value })}
                  value={draft.planType}
                  size="large"
                />
              </div>
            </Col>
            <Col xs={24} sm={12}>
              <div
                data-cy="planning-and-reporting-components-planning-planningtoolbarfilters-tsx-planningtoolbarfilters-div-215"
                className="flex flex-col gap-2"
              >
                <span
                  data-cy="planning-and-reporting-components-planning-planningtoolbarfilters-tsx-planningtoolbarfilters-span-216"
                  className="text-sm font-medium text-gray-700"
                >
                  Department
                </span>
                <Select
                  id="planning-department-select"
                  data-cy="planning-department-select"
                  className={planningSelectClass}
                  placeholder="Department"
                  options={departmentOptions}
                  onChange={(value: string) =>
                    updateDraft({ department: value })
                  }
                  value={draft.department}
                  size="large"
                  showSearch
                  optionFilterProp="label"
                  filterOption={(input, option) =>
                    option?.label
                      ?.toString()
                      .toLowerCase()
                      .includes(input.toLowerCase()) ?? false
                  }
                />
              </div>
            </Col>
            {activeTab === 2 ? (
              <>
                <Col xs={24} sm={12}>
                  <div
                    data-cy="planning-and-reporting-components-planning-planningtoolbarfilters-tsx-planningtoolbarfilters-div-244"
                    className="flex flex-col gap-2"
                  >
                    <span
                      data-cy="planning-and-reporting-components-planning-planningtoolbarfilters-tsx-planningtoolbarfilters-span-245"
                      className="text-sm font-medium text-gray-700"
                    >
                      Fiscal year
                    </span>
                    <Select
                      placeholder="Fiscal year"
                      className={sessionSelectClass}
                      allowClear
                      value={draft.fiscalYearId}
                      onChange={(yearId: string | null) =>
                        updateDraft({
                          fiscalYearId: yearId,
                          sessionIds:
                            yearId !== draft.fiscalYearId
                              ? []
                              : draft.sessionIds,
                        })
                      }
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
                  </div>
                </Col>
                <Col xs={24} sm={12}>
                  <div
                    data-cy="planning-and-reporting-components-planning-planningtoolbarfilters-tsx-planningtoolbarfilters-div-282"
                    className="flex flex-col gap-2"
                  >
                    <span
                      data-cy="planning-and-reporting-components-planning-planningtoolbarfilters-tsx-planningtoolbarfilters-span-283"
                      className="text-sm font-medium text-gray-700"
                    >
                      Session
                    </span>
                    <Select
                      mode="multiple"
                      placeholder="Session"
                      className={sessionSelectClass}
                      allowClear
                      value={draft.sessionIds}
                      onChange={(sessionIds: string[]) =>
                        updateDraft({ sessionIds })
                      }
                      disabled={!draft.fiscalYearId}
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
                      {draftFiscalYearData?.sessions?.map(
                        (session: Session) => (
                          <Option key={session.id} value={session.id}>
                            {session.name}
                          </Option>
                        ),
                      )}
                    </Select>
                  </div>
                </Col>
              </>
            ) : null}
          </Row>
        ) : null}
      </div>
      <div
        data-cy="planning-and-reporting-components-planning-planningtoolbarfilters-tsx-planningtoolbarfilters-div-323"
        className="flex justify-end gap-2 border-t border-gray-100 px-4 py-3"
      >
        <Button
          size="middle"
          className="rounded-md border-gray-200"
          onClick={handleFilterCancel}
          data-cy="planning-toolbar-filter-cancel"
        >
          Cancel
        </Button>
        <Button
          type="primary"
          size="middle"
          className="rounded-md border-0 !bg-[#1E40AF] hover:!bg-[#1E3A8A]"
          onClick={handleFilterApply}
          data-cy="planning-toolbar-filter-apply"
        >
          Filter
        </Button>
      </div>
    </div>
  );

  return (
    <Popover
      content={filterPopoverContent}
      trigger="click"
      open={filterOpen}
      onOpenChange={handleFilterPopoverOpenChange}
      placement="bottomRight"
      arrow={false}
      styles={{ body: { padding: 0 } }}
      overlayInnerStyle={{ padding: 0 }}
    >
      <Button
        type="default"
        size="large"
        aria-label="Filter"
        title={showFilterLabel ? undefined : 'Filter'}
        className={classNames(
          '!flex !items-center !justify-center !rounded-lg !border !border-[#E5E7EB] !bg-white !text-slate-800 shadow-sm hover:!border-gray-300 hover:!bg-gray-50',
          '[&_.ant-btn-icon]:!inline-flex [&_.ant-btn-icon]:!items-center [&_.ant-btn-icon]:!justify-center [&_.ant-btn-icon]:!leading-none',
          !showFilterLabel &&
            '[&_.ant-btn-icon]:!m-0 [&_.ant-btn-icon]:!flex [&_.ant-btn-icon]:!h-full [&_.ant-btn-icon]:!w-full',
          showFilterLabel
            ? '!h-9 !min-h-9 !min-w-0 !w-auto !gap-1.5 !px-3 !py-0'
            : '!h-9 !min-h-9 !min-w-9 !w-9 !gap-0 !px-0 !py-0 sm:!h-9 sm:!min-h-9 sm:!min-w-9 sm:!w-9',
        )}
        icon={
          <MdOutlineFilterAlt
            className="block h-[18px] w-[18px] shrink-0 text-slate-600"
            aria-hidden
          />
        }
        data-cy="planning-toolbar-filter-trigger"
      >
        {showFilterLabel ? (
          <span
            data-cy="planning-and-reporting-components-planning-planningtoolbarfilters-tsx-planningtoolbarfilters-span-379"
            className="text-[14px] font-normal leading-none"
          >
            Filter
          </span>
        ) : null}
      </Button>
    </Popover>
  );
}
