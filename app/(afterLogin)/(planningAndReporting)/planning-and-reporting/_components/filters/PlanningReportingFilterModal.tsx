'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Modal, Select, Button, Row, Col, message } from 'antd';
import { useGetAllUsers } from '@/store/server/features/employees/employeeManagment/queries';
import { useGetDepartmentsWithUsers } from '@/store/server/features/employees/employeeManagment/department/queries';
import {
  useGetAllFiscalYears,
  useGetFiscalYearById,
} from '@/store/server/features/organizationStructure/fiscalYear/queries';
import type { Session } from '@/store/server/features/organizationStructure/fiscalYear/interface';
import { PlanningAndReportingStore } from '@/store/uistate/features/planningAndReporting/useStore';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';

const { Option } = Select;

export type ReportingFilterPlanType = 'all' | 'myPlan' | 'subordinatePlan';

const REPORTING_PLAN_TYPE_OPTIONS: {
  label: string;
  value: ReportingFilterPlanType;
}[] = [
  { label: 'All Report', value: 'all' },
  { label: 'My Report', value: 'myPlan' },
  { label: 'Subordinate Report', value: 'subordinatePlan' },
];

function getSubordinateIds(employeeItems: any[], managerId: string): string[] {
  return (
    employeeItems
      ?.filter(
        (emp: any) =>
          (emp?.delegatedTo?.id || emp?.reportingTo?.id) === managerId,
      )
      .map((emp: any) => emp.id) || []
  );
}

/** Maps employee + department + reporting plan scope to `selectedUser` for the reports API. */
export function resolveReportingSelectedUser(params: {
  planType: ReportingFilterPlanType;
  draftEmployee: string;
  draftDepartment: string;
  userId: string;
  getUserIdsByDepartmentId: (departmentId: string) => string[];
  employeeItems: any[] | undefined;
}): string[] {
  const {
    planType,
    draftEmployee,
    draftDepartment,
    userId,
    getUserIdsByDepartmentId,
    employeeItems,
  } = params;
  const items = employeeItems || [];
  const subordinateIds = getSubordinateIds(items, userId);

  const departmentUserIds =
    draftDepartment === 'all'
      ? null
      : getUserIdsByDepartmentId(draftDepartment);

  if (draftEmployee !== 'all') {
    if (planType === 'all') {
      return [draftEmployee];
    }
    if (planType === 'myPlan') {
      return draftEmployee === userId ? [userId] : [];
    }
    if (planType === 'subordinatePlan') {
      return subordinateIds.includes(draftEmployee) ? [draftEmployee] : [];
    }
  }

  if (draftDepartment === 'all') {
    if (planType === 'all') {
      return ['all'];
    }
    if (planType === 'myPlan') {
      return [userId];
    }
    return subordinateIds.length > 0
      ? ['subordinate', ...subordinateIds]
      : ['subordinate'];
  }

  const deptIds = departmentUserIds || [];
  if (planType === 'all') {
    return deptIds.length > 0 ? deptIds : [];
  }
  if (planType === 'myPlan') {
    return deptIds.includes(userId) ? [userId] : [];
  }
  const subordinatesInDept = items
    .filter(
      (emp: any) =>
        (emp?.delegatedTo?.id || emp?.reportingTo?.id) === userId &&
        deptIds.includes(emp.id),
    )
    .map((emp: any) => emp.id);
  return subordinatesInDept.length > 0
    ? ['subordinate', ...subordinatesInDept]
    : ['subordinate'];
}

export type CadenceFilterOption = {
  periodId: string;
  label: string;
  tabIndex: number;
};

function ReqLabel({
  children,
  dataCy,
}: {
  children: React.ReactNode;
  dataCy?: string;
}) {
  return (
    <span
      className="mb-1.5 block text-sm font-semibold text-[#161A2C]"
      data-cy={dataCy}
    >
      {children}{' '}
      <span
        className="text-red-500"
        data-cy="planning-reporting-filter-required-asterisk"
      >
        *
      </span>
    </span>
  );
}

const selectClassName =
  'w-full [&_.ant-select-selector]:!min-h-[48px] [&_.ant-select-selector]:!h-12 [&_.ant-select-selector]:!rounded-lg [&_.ant-select-selector]:!border-[#E5E7EB] [&_.ant-select-selector]:!bg-[#F5F5F7] [&_.ant-select-selector]:!px-3 [&_.ant-select-selector]:!py-2.5 [&_.ant-select-focused_.ant-select-selector]:!border-[#1D4ED8] [&_.ant-select-focused_.ant-select-selector]:!shadow-[0_0_0_2px_rgba(29,78,216,0.12)] [&_.ant-select-selection-item]:!text-[#161A2C] [&_.ant-select-selection-placeholder]:!text-[#8F94A3] [&.ant-select]:!h-12';

interface PlanningReportingFilterModalProps {
  open: boolean;
  onClose: () => void;
  cadenceOptions: CadenceFilterOption[];
  showEmployeeAndDepartment: boolean;
  /** Reporting tab: show plan scope (all / my / subordinate) and apply to `selectedUser`. */
  showReportingPlanType?: boolean;
}

export default function PlanningReportingFilterModal({
  open,
  onClose,
  cadenceOptions,
  showEmployeeAndDepartment,
  showReportingPlanType = false,
}: PlanningReportingFilterModalProps) {
  const { data: employeeData } = useGetAllUsers();
  const { data: departmentData } = useGetDepartmentsWithUsers();
  const { data: allFiscalYears, isLoading: loadingYears } =
    useGetAllFiscalYears();

  const { userId } = useAuthenticationStore();
  const {
    selectedUser,
    setSelectedUser,
    activePlanPeriodId,
    setActivePlanPeriodId,
    setActivePlanPeriod,
    filterDepartment,
    setFilterDepartment,
    reportingFilterPlanType,
    setReportingFilterPlanType,
    selectedFiscalYearId,
    setSelectedFiscalYearId,
    selectedSessionIds,
    setSelectedSessionIds,
    setAllSessionsOfYear,
    setPage,
    setPageReporting,
    setFilterModalOpenFromPage,
  } = PlanningAndReportingStore();

  const [draftEmployee, setDraftEmployee] = useState<string>('all');
  const [draftCadenceId, setDraftCadenceId] = useState<string>('');
  const [draftDepartment, setDraftDepartment] = useState<string>('all');
  const [draftReportingPlanType, setDraftReportingPlanType] =
    useState<ReportingFilterPlanType>('all');
  const [draftFiscalId, setDraftFiscalId] = useState<string | null>(null);
  const [draftSessionIds, setDraftSessionIds] = useState<string[]>([]);

  const { data: draftFiscalData, isLoading: loadingSessions } =
    useGetFiscalYearById(draftFiscalId || '');

  const getUserIdsByDepartmentId = useCallback(
    (departmentId: string) => {
      const department = departmentData?.find(
        (dep: any) => dep.id === departmentId,
      );
      if (department && department.users) {
        return department.users.map((u: { id: string }) => u.id);
      }
      return [];
    },
    [departmentData],
  );

  const departmentSelectOptions = useMemo(() => {
    const options = [{ label: 'All Departments', value: 'all' }];
    departmentData?.forEach((dept: { name?: string; id: string }) => {
      if (dept.name) options.push({ label: dept.name, value: dept.id });
    });
    return options;
  }, [departmentData]);

  const employeeSelectOptions = useMemo(() => {
    const options = [{ label: 'All employees', value: 'all' }];
    if (!employeeData?.items) return options;
    let list = employeeData.items;
    if (draftDepartment && draftDepartment !== 'all') {
      const ids = getUserIdsByDepartmentId(draftDepartment);
      list = list.filter((emp: { id: string }) => ids.includes(emp.id));
    }
    list.forEach((emp: any) => {
      const name =
        `${emp.firstName || ''} ${emp.middleName || ''} ${emp.lastName || ''}`.trim();
      if (name) options.push({ label: name, value: emp.id });
    });
    return options;
  }, [employeeData, draftDepartment, getUserIdsByDepartmentId]);

  useEffect(() => {
    if (!open) return;
    const u0 = selectedUser?.[0];
    if (!u0 || u0 === 'all' || u0 === 'subordinate') {
      setDraftEmployee('all');
    } else {
      setDraftEmployee(u0);
    }
    setDraftCadenceId(activePlanPeriodId || cadenceOptions[0]?.periodId || '');
    setDraftDepartment(filterDepartment || 'all');
    setDraftReportingPlanType(reportingFilterPlanType);
    setDraftFiscalId(selectedFiscalYearId);
    setDraftSessionIds([...selectedSessionIds]);
  }, [
    open,
    selectedUser,
    activePlanPeriodId,
    filterDepartment,
    reportingFilterPlanType,
    selectedFiscalYearId,
    selectedSessionIds,
    cadenceOptions,
  ]);

  const handleFiscalChange = (yearId: string | null) => {
    setDraftFiscalId(yearId);
    setDraftSessionIds([]);
  };

  const handleDepartmentDraftChange = (value: string) => {
    setDraftDepartment(value);
    setDraftEmployee('all');
  };

  const handleSave = () => {
    if (!cadenceOptions.length) {
      message.warning('No plan periods are available to filter.');
      return;
    }
    if (!draftCadenceId) {
      message.warning('Please select a plan period.');
      return;
    }
    const cadence = cadenceOptions.find((c) => c.periodId === draftCadenceId);
    if (!cadence) {
      message.warning('Please select a valid plan period.');
      return;
    }

    if (allFiscalYears?.items?.length && !draftFiscalId) {
      message.warning('Please select a fiscal year.');
      return;
    }

    if (showEmployeeAndDepartment) {
      if (showReportingPlanType) {
        setReportingFilterPlanType(draftReportingPlanType);
        setSelectedUser(
          resolveReportingSelectedUser({
            planType: draftReportingPlanType,
            draftEmployee,
            draftDepartment,
            userId,
            getUserIdsByDepartmentId,
            employeeItems: employeeData?.items,
          }),
        );
      } else {
        let users: string[];
        if (draftEmployee !== 'all') {
          users = [draftEmployee];
        } else if (draftDepartment === 'all') {
          users = ['all'];
        } else {
          const ids = getUserIdsByDepartmentId(draftDepartment);
          users = ids.length > 0 ? ids : [];
        }
        setSelectedUser(users);
      }
      setFilterDepartment(draftDepartment);
    }

    setActivePlanPeriodId(cadence.periodId);
    setActivePlanPeriod(cadence.tabIndex);

    setSelectedFiscalYearId(draftFiscalId);
    setSelectedSessionIds(draftSessionIds);

    if (draftFiscalId && draftFiscalData?.sessions?.length) {
      setAllSessionsOfYear(draftFiscalData.sessions.map((s: Session) => s.id));
    } else {
      setAllSessionsOfYear([]);
    }

    setPage(1);
    setPageReporting(1);
    setFilterModalOpenFromPage(false);
    onClose();
  };

  const handleReset = () => {
    const weekly =
      cadenceOptions.find((c) => c.label.toLowerCase().includes('week')) ||
      cadenceOptions[0];
    setDraftEmployee('all');
    setDraftDepartment('all');
    setDraftReportingPlanType('all');
    setDraftCadenceId(weekly?.periodId ?? '');
    setDraftFiscalId(null);
    setDraftSessionIds([]);
  };

  const handleModalClose = () => {
    setFilterModalOpenFromPage(false);
    onClose();
  };

  return (
    <Modal
      data-cy="planning-reporting-filter-modal"
      open={open}
      onCancel={handleModalClose}
      footer={null}
      width={640}
      centered
      destroyOnClose={false}
      className="planning-reporting-filter-modal"
      title={
        <div data-cy="planning-reporting-filter-modal-header">
          <div
            className="text-lg font-bold text-[#161A2C] md:text-xl"
            data-cy="planning-reporting-filter-modal-title"
          >
            Filter
          </div>
          <div
            className="mt-1 text-sm font-normal text-[#8F94A3]"
            data-cy="planning-reporting-filter-modal-subtitle"
          >
            Select All filters that apply
          </div>
        </div>
      }
    >
      <div className="pt-2" data-cy="planning-reporting-filter-modal-body">
        <Row gutter={[16, 16]}>
          {showEmployeeAndDepartment ? (
            <Col xs={24} md={12}>
              <ReqLabel data-cy="planning-reporting-filter-label-employee">
                Employee
              </ReqLabel>
              <Select
                data-cy="planning-reporting-filter-employee"
                className={selectClassName}
                placeholder="Select employee"
                options={employeeSelectOptions}
                value={
                  employeeSelectOptions.some((o) => o.value === draftEmployee)
                    ? draftEmployee
                    : undefined
                }
                onChange={(v) => setDraftEmployee(v)}
                loading={!employeeData}
                size="large"
                showSearch
                optionFilterProp="label"
              />
            </Col>
          ) : null}
          <Col xs={24} md={showEmployeeAndDepartment ? 12 : 12}>
            <ReqLabel data-cy="planning-reporting-filter-label-plan-period">
              Plan period
            </ReqLabel>
            <Select
              data-cy="planning-reporting-filter-cadence"
              className={selectClassName}
              placeholder="Select plan period"
              options={cadenceOptions.map((c) => ({
                label: c.label,
                value: c.periodId,
              }))}
              value={draftCadenceId || undefined}
              onChange={(v) => setDraftCadenceId(v)}
              size="large"
            />
          </Col>
          {showEmployeeAndDepartment ? (
            <Col xs={24} md={12}>
              <ReqLabel data-cy="planning-reporting-filter-label-department">
                Department
              </ReqLabel>
              <Select
                data-cy="planning-reporting-filter-department"
                className={selectClassName}
                placeholder="Department"
                options={departmentSelectOptions}
                value={draftDepartment}
                onChange={handleDepartmentDraftChange}
                size="large"
                showSearch
                optionFilterProp="label"
              />
            </Col>
          ) : null}
          {showEmployeeAndDepartment && showReportingPlanType ? (
            <Col span={24}>
              <ReqLabel data-cy="planning-reporting-filter-label-plan-type">
                Plan type
              </ReqLabel>
              <Select
                data-cy="planning-reporting-filter-plan-type"
                className={selectClassName}
                placeholder="Plan type"
                options={REPORTING_PLAN_TYPE_OPTIONS}
                value={draftReportingPlanType}
                onChange={(v) =>
                  setDraftReportingPlanType(v as ReportingFilterPlanType)
                }
                size="large"
              />
            </Col>
          ) : null}
          <Col xs={24} md={showEmployeeAndDepartment ? 12 : 12}>
            <ReqLabel data-cy="planning-reporting-filter-label-fiscal">
              Fiscal Year
            </ReqLabel>
            <Select
              data-cy="planning-reporting-filter-fiscal-year"
              allowClear
              placeholder="Fiscal year"
              className={selectClassName}
              value={draftFiscalId}
              onChange={handleFiscalChange}
              loading={loadingYears}
              size="large"
              showSearch
              optionFilterProp="children"
            >
              {allFiscalYears?.items?.map((year) => (
                <Option key={year.id} value={year.id}>
                  {year.name}
                </Option>
              ))}
            </Select>
          </Col>
          <Col span={24}>
            <ReqLabel data-cy="planning-reporting-filter-label-session">
              Session
            </ReqLabel>
            <Select
              data-cy="planning-reporting-filter-session"
              mode="multiple"
              allowClear
              placeholder="Session"
              className={selectClassName}
              value={draftSessionIds}
              onChange={(ids) => setDraftSessionIds(ids)}
              disabled={!draftFiscalId}
              loading={loadingSessions}
              maxTagCount={2}
              size="large"
              showSearch
              optionFilterProp="children"
            >
              {draftFiscalData?.sessions?.map((session: Session) => (
                <Option key={session.id} value={session.id}>
                  {session.name}
                </Option>
              ))}
            </Select>
          </Col>
        </Row>

        <div
          className="mt-8 flex justify-end gap-3 border-t border-[#F1F2F6] pt-6"
          data-cy="planning-reporting-filter-modal-footer"
        >
          <Button
            data-cy="planning-reporting-filter-reset"
            size="large"
            className="min-w-[100px] rounded-lg border-[#D1D5DB] font-semibold text-[#6B7280]"
            onClick={handleReset}
          >
            Reset
          </Button>
          <Button
            data-cy="planning-reporting-filter-save"
            type="primary"
            size="large"
            disabled={!!draftFiscalId && loadingSessions}
            className="min-w-[120px] rounded-lg border-0 !bg-[#1D4ED8] font-semibold hover:!bg-[#1E3A8A]"
            onClick={handleSave}
          >
            Save Filter
          </Button>
        </div>
      </div>
    </Modal>
  );
}
