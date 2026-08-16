'use client';
import React, { useEffect, useMemo, useState } from 'react';
import {
  Button,
  ConfigProvider,
  Input,
  Select,
  Typography,
  Breadcrumb,
  Segmented,
  Dropdown,
  Tag,
} from 'antd';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { SearchOutlined } from '@ant-design/icons';
import AddCircleOutlineOutlinedIcon from '@mui/icons-material/AddCircleOutlineOutlined';
import AccountTreeOutlinedIcon from '@mui/icons-material/AccountTreeOutlined';
import PersonOffOutlinedIcon from '@mui/icons-material/PersonOffOutlined';
import BoltOutlinedIcon from '@mui/icons-material/BoltOutlined';
import ScheduleOutlinedIcon from '@mui/icons-material/ScheduleOutlined';
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import FilterAltOutlinedIcon from '@mui/icons-material/FilterAltOutlined';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import CustomBreadcrumb from '@/components/common/breadCramp';
import StatsCard from '../manage-employees/_components/statsCard';
import CriticalRolesTable from './_components/criticalRolesTable';
import EvaluatorsView, {
  buildEvaluatorAssignments,
  EvaluatorScope,
} from './_components/evaluatorsView';
import CriticalRoleModal, {
  CriticalRole,
} from './_components/criticalRoleModal';
import ReportsView from './_components/reports/reportsView';
import {
  buildDevelopmentPlanProgressRows,
  buildSkillGapAnalysisRows,
  buildSuccessorReadinessRows,
  type SuccessionReportKey,
} from './_components/reports/reportData';
import { exportSuccessionReport } from './_components/reports/exportReports';
import NotificationMessage from '@/components/common/notification/notificationMessage';
import {
  computeCriticalRoleKpis,
  computeEvaluatorKpis,
} from './_components/successionKpis';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
import { useSuccessionPlanningStore } from '@/store/uistate/features/employees/successionPlanning';
import { useSuccessionPlanningData } from '@/store/server/features/employees/successionPlanning/useSuccessionPlanningData';
import { useIsMobile } from '@/hooks/useIsMobile';

const { Option } = Select;

type SuccessionView = 'roles' | 'evaluators' | 'reports';

const parseReportKey = (value: string | null): SuccessionReportKey => {
  if (value === 'gaps' || value === 'idp' || value === 'readiness')
    return value;
  return 'readiness';
};

const parseView = (value: string | null): SuccessionView => {
  if (value === 'evaluators' || value === 'reports') return value;
  return 'roles';
};

const SuccessionPlanningPage: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isMobile } = useIsMobile();
  const initialView = parseView(searchParams.get('view'));
  const initialScope: EvaluatorScope =
    searchParams.get('scope') === 'mine' ? 'mine' : 'admin';
  const initialAs = searchParams.get('as') ?? '';
  const initialReportKey = parseReportKey(searchParams.get('report'));

  // Server data is mirrored into the store the whole feature reads from, so the
  // screens below are unchanged from the design prototype.
  const {
    saveRole,
    removeRole,
    isLoading: isLoadingRoles,
  } = useSuccessionPlanningData();
  const roles = useSuccessionPlanningStore((s) => s.roles);

  const [activeView, setActiveView] = useState<SuccessionView>(initialView);
  const [reportKey, setReportKey] =
    useState<SuccessionReportKey>(initialReportKey);
  const [evaluatorScope, setEvaluatorScope] =
    useState<EvaluatorScope>(initialScope);
  const [viewAsEvaluatorId, setViewAsEvaluatorId] = useState(initialAs);
  const [searchValue, setSearchValue] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<CriticalRole | null>(null);
  const [downloadingReport, setDownloadingReport] = useState(false);

  /** Export the chosen report straight to Excel from the top bar. */
  const handleDownloadReport = async (key: SuccessionReportKey) => {
    setDownloadingReport(true);
    try {
      await exportSuccessionReport(roles, key);
    } catch {
      NotificationMessage.error({ message: 'Export failed' });
    } finally {
      setDownloadingReport(false);
    }
  };

  const {
    positionsWithSuccessors,
    positionsWithoutSuccessors,
    readyNowCount,
    readyWithinOneYearCount,
    successionCoveragePercent,
  } = useMemo(() => computeCriticalRoleKpis(roles), [roles]);

  const evaluatorAssignments = useMemo(
    () => buildEvaluatorAssignments(roles),
    [roles],
  );

  const evaluatorOptions = useMemo(() => {
    const byId = new Map<string, string>();
    evaluatorAssignments.forEach((a) => {
      if (!byId.has(a.evaluatorId)) {
        byId.set(a.evaluatorId, a.evaluatorName);
      }
    });
    return Array.from(byId.entries())
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [evaluatorAssignments]);

  useEffect(() => {
    if (
      evaluatorOptions.length > 0 &&
      !evaluatorOptions.some((e) => e.id === viewAsEvaluatorId)
    ) {
      setViewAsEvaluatorId(evaluatorOptions[0].id);
    }
  }, [evaluatorOptions, viewAsEvaluatorId]);

  const scopedAssignments = useMemo(() => {
    if (evaluatorScope !== 'mine') return evaluatorAssignments;
    if (!viewAsEvaluatorId) return [];
    return evaluatorAssignments.filter(
      (a) => a.evaluatorId === viewAsEvaluatorId,
    );
  }, [evaluatorAssignments, evaluatorScope, viewAsEvaluatorId]);

  const uniqueEvaluatorCount = useMemo(
    () => new Set(scopedAssignments.map((a) => a.evaluatorId)).size,
    [scopedAssignments],
  );
  const {
    pendingEvaluationCount,
    completedEvaluationCount,
    evaluationCompletionPercent,
    sessionCount: evaluatorSessionCount,
  } = useMemo(
    () => computeEvaluatorKpis(scopedAssignments),
    [scopedAssignments],
  );

  const syncEvaluatorsUrl = (
    scope: EvaluatorScope,
    asId: string = viewAsEvaluatorId,
  ) => {
    const params = new URLSearchParams();
    params.set('view', 'evaluators');
    if (scope === 'mine') {
      params.set('scope', 'mine');
      if (asId) params.set('as', asId);
    }
    router.replace(`/employees/succession-planning?${params.toString()}`, {
      scroll: false,
    });
  };

  const syncReportsUrl = (key: SuccessionReportKey = reportKey) => {
    const params = new URLSearchParams();
    params.set('view', 'reports');
    params.set('report', key);
    router.replace(`/employees/succession-planning?${params.toString()}`, {
      scroll: false,
    });
  };

  const readinessRowCount = useMemo(
    () => buildSuccessorReadinessRows(roles).length,
    [roles],
  );
  const gapRowCount = useMemo(
    () => buildSkillGapAnalysisRows(roles).length,
    [roles],
  );
  const idpRowCount = useMemo(
    () => buildDevelopmentPlanProgressRows(roles).length,
    [roles],
  );

  const filtered = roles.filter((r) => {
    const matchesSearch =
      !searchValue ||
      r.roleName.toLowerCase().includes(searchValue.toLowerCase()) ||
      r.department.toLowerCase().includes(searchValue.toLowerCase());
    const matchesPriority = !priorityFilter || r.priority === priorityFilter;
    return matchesSearch && matchesPriority;
  });

  const activeFilters = useMemo(() => {
    const tags: Array<{ key: string; label: string; clear: () => void }> = [];
    if (priorityFilter) {
      tags.push({
        key: 'priority',
        label: priorityFilter,
        clear: () => setPriorityFilter(''),
      });
    }
    return tags;
  }, [priorityFilter]);

  const openAddModal = () => {
    setEditingRole(null);
    setModalOpen(true);
  };

  const openEditModal = (role: CriticalRole) => {
    setEditingRole(role);
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setEditingRole(null);
  };

  const handleSave = async (
    values: Omit<CriticalRole, 'id' | 'successorCount'>,
  ) => {
    // Creating a role also notifies every evaluator assigned in step 4.
    await saveRole(values, editingRole?.id);
    setModalOpen(false);
    setEditingRole(null);
  };

  const handleDelete = async (id: string) => {
    await removeRole(id);
  };

  const handleRowClick = (role: CriticalRole) => {
    router.push(`/employees/succession-planning/${role.id}`);
  };

  const filterPanel = (
    <div
      className="bg-white rounded-lg border border-gray-200 min-w-[280px] sm:min-w-[320px] overflow-hidden shadow-md"
      data-cy="succession-planning-filter-panel"
    >
      <div className="px-5 pt-4 pb-1">
        <h3 className="text-base font-bold text-[#4d4d4d] m-0 mb-1">Filter</h3>
        <p className="text-sm text-[#8c8c8c] m-0 font-normal">
          Select all filters that apply
        </p>
      </div>

      <div className="px-5 py-3 flex flex-col gap-3">
        <div>
          <label className="text-sm font-medium text-gray-800 mb-1.5 block">
            Priority
          </label>
          <Select
            placeholder="Select priority"
            allowClear
            value={priorityFilter || undefined}
            onChange={(v) => setPriorityFilter(v ?? '')}
            className="w-full"
            data-cy="succession-planning-priority-filter"
          >
            <Option value="Critical">Critical</Option>
            <Option value="High">High</Option>
            <Option value="Medium">Medium</Option>
          </Select>
        </div>
      </div>

      <div className="px-5 py-3 flex justify-end gap-2 border-t border-gray-200">
        <Button
          onClick={() => {
            setPriorityFilter('');
          }}
          className="h-8 border border-[#D9D9D9] text-sm font-normal text-[#4d4d4d]"
          data-cy="succession-planning-filter-reset"
        >
          Reset
        </Button>
        <Button
          type="primary"
          className="h-8 font-normal text-sm"
          onClick={() => setFilterOpen(false)}
          data-cy="succession-planning-filter-apply"
        >
          Save Filter
        </Button>
      </div>
    </div>
  );

  return (
    <div
      id="succession-planning-page"
      data-cy="succession-planning-page"
      className="px-2 sm:px-0"
    >
      <div
        className="flex flex-wrap justify-between items-center pt-4"
        id="succession-planning-header"
        data-cy="succession-planning-header"
      >
        <CustomBreadcrumb
          title={
            <Typography.Title className="text-xl font-bold text-black !mb-0">
              Succession Planning
            </Typography.Title>
          }
          subtitle={
            <Breadcrumb
              className="text-xs sm:text-sm"
              items={[
                {
                  title: (
                    <span
                      className="text-gray-500"
                      data-cy="sp-breadcrumb-employee"
                    >
                      Employee
                    </span>
                  ),
                },
                {
                  title: (
                    <Link
                      className="text-gray-600"
                      href="/employees/manage-employees"
                      data-cy="sp-breadcrumb-manage-employees"
                    >
                      Manage Employees
                    </Link>
                  ),
                },
                {
                  title: (
                    <span
                      className="text-[#4d4d4d]"
                      data-cy="sp-breadcrumb-current"
                    >
                      Succession Planning
                    </span>
                  ),
                },
              ]}
            />
          }
          titleExtra={
            <div
              className="flex flex-wrap items-center gap-2 sm:gap-3 mr-1 sm:mr-0"
              data-cy="succession-planning-header-actions"
            >
              {/* Same Segmented treatment as Planning & Reporting so the
                  sub-module reads as part of the workspace. */}
              <ConfigProvider
                theme={{
                  components: {
                    Segmented: {
                      trackBg: '#f1f5f9',
                      itemSelectedBg: '#ffffff',
                      itemSelectedColor: '#0f172a',
                    },
                  },
                }}
              >
                <Segmented
                  value={activeView}
                  size={isMobile ? 'middle' : 'large'}
                  className={[
                    '!inline-flex !w-max max-w-full !shrink-0 !rounded-xl !border !border-slate-100 !bg-slate-50/70 !p-1.5 !h-[50px]',
                    '[&_.ant-segmented-group]:!w-max [&_.ant-segmented-group]:!items-stretch',
                    '[&_.ant-segmented-thumb]:!h-full [&_.ant-segmented-thumb]:!bg-white [&_.ant-segmented-thumb]:!py-0 [&_.ant-segmented-thumb]:!shadow-sm',
                    '[&_.ant-segmented-item]:!flex [&_.ant-segmented-item]:!flex-none [&_.ant-segmented-item]:!items-center [&_.ant-segmented-item]:!justify-center [&_.ant-segmented-item]:!self-stretch [&_.ant-segmented-item]:!bg-transparent',
                    '[&_.ant-segmented-item-selected]:!z-[1] [&_.ant-segmented-item-selected]:!rounded-md [&_.ant-segmented-item-selected]:!shadow-sm',
                    '[&_.ant-segmented-item-label]:!flex [&_.ant-segmented-item-label]:!h-9 [&_.ant-segmented-item-label]:!min-h-9 [&_.ant-segmented-item-label]:!items-center [&_.ant-segmented-item-label]:!justify-center [&_.ant-segmented-item-label]:!whitespace-nowrap [&_.ant-segmented-item-label]:!font-medium [&_.ant-segmented-item-label]:!text-slate-600 [&_.ant-segmented-item-label]:!px-4 [&_.ant-segmented-item-label]:!py-0 [&_.ant-segmented-item-label]:!text-[14px]',
                    '[&_.ant-segmented-item-selected_.ant-segmented-item-label]:!text-slate-900',
                  ].join(' ')}
                  onChange={(value) => {
                    const next = value as SuccessionView;
                    setActiveView(next);
                    if (next === 'evaluators') {
                      syncEvaluatorsUrl(evaluatorScope, viewAsEvaluatorId);
                    } else if (next === 'reports') {
                      syncReportsUrl(reportKey);
                    } else {
                      router.replace('/employees/succession-planning', {
                        scroll: false,
                      });
                    }
                  }}
                  options={[
                    {
                      label: isMobile ? 'Roles' : 'Critical Roles',
                      value: 'roles',
                    },
                    {
                      label: isMobile ? 'Evals' : 'Evaluators',
                      value: 'evaluators',
                    },
                    {
                      label: 'Reports',
                      value: 'reports',
                    },
                  ]}
                  data-cy="succession-planning-view-selector"
                />
              </ConfigProvider>
              {/* Downloads the chosen report as Excel directly — the reports
                  view no longer carries its own export button. */}
              <Dropdown
                menu={{
                  items: [
                    {
                      key: 'readiness',
                      label: 'Successor Readiness Report',
                      onClick: () => handleDownloadReport('readiness'),
                    },
                    {
                      key: 'gaps',
                      label: 'Skill Gap Analysis Report',
                      onClick: () => handleDownloadReport('gaps'),
                    },
                    {
                      key: 'idp',
                      label: 'Development Plan Progress Report',
                      onClick: () => handleDownloadReport('idp'),
                    },
                  ],
                }}
                trigger={['click']}
                placement="bottomRight"
              >
                <Button
                  type="default"
                  size="large"
                  loading={downloadingReport}
                  className="h-10 border border-[#D9D9D9] text-[#4d4d4d] font-normal"
                  icon={
                    <FileDownloadOutlinedIcon
                      style={{ fontSize: 18, display: 'block' }}
                    />
                  }
                  data-cy="succession-reports-btn"
                >
                  <span className="hidden sm:inline">Download Reports</span>
                </Button>
              </Dropdown>
              <AccessGuard permissions={[Permissions.CreateCriticalRole]}>
                <Button
                  type="primary"
                  size="large"
                  className="h-10 w-10 sm:w-auto mr-2 sm:mr-0"
                  icon={
                    <AddCircleOutlineOutlinedIcon
                      style={{ fontSize: 18, display: 'block' }}
                    />
                  }
                  id="add-critical-role-btn"
                  onClick={openAddModal}
                  data-cy="add-critical-role-btn"
                >
                  <span className="hidden sm:inline font-normal">
                    Add Critical Role
                  </span>
                </Button>
              </AccessGuard>
            </div>
          }
          data-cy="succession-planning-breadcrumb"
        />
      </div>

      <div className="mb-6" data-cy="succession-planning-stats">
        <div
          className="flex gap-4 overflow-x-auto overflow-y-hidden scrollbar-hide sm:grid sm:grid-cols-2 xl:grid-cols-5"
          data-cy="succession-planning-stats-grid"
        >
          {activeView === 'roles' ? (
            <>
              <div
                className="min-w-[220px] shrink-0 sm:min-w-0 sm:shrink"
                data-cy="sp-stats-with-successors-wrapper"
              >
                <StatsCard
                  icon={
                    <span className="w-8 h-8 rounded-sm bg-lightblue flex items-center justify-center">
                      <AccountTreeOutlinedIcon
                        className="text-blue"
                        fontSize="small"
                      />
                    </span>
                  }
                  title="Positions with Successors"
                  value={positionsWithSuccessors}
                  id="sp-stats-with-successors"
                  data-cy="sp-stats-with-successors"
                />
              </div>
              <div
                className="min-w-[220px] shrink-0 sm:min-w-0 sm:shrink"
                data-cy="sp-stats-without-successors-wrapper"
              >
                <StatsCard
                  icon={
                    <span className="w-8 h-8 rounded-sm bg-[#fff1f0] flex items-center justify-center">
                      <PersonOffOutlinedIcon
                        className="text-error"
                        fontSize="small"
                      />
                    </span>
                  }
                  title="Positions without Successors"
                  value={positionsWithoutSuccessors}
                  id="sp-stats-without-successors"
                  data-cy="sp-stats-without-successors"
                />
              </div>
              <div
                className="min-w-[220px] shrink-0 sm:min-w-0 sm:shrink"
                data-cy="sp-stats-ready-now-wrapper"
              >
                <StatsCard
                  icon={
                    <span className="w-8 h-8 rounded-sm bg-[#f6ffed] flex items-center justify-center">
                      <BoltOutlinedIcon
                        className="text-success"
                        fontSize="small"
                      />
                    </span>
                  }
                  title="Ready Now Successors"
                  value={readyNowCount}
                  id="sp-stats-ready-now"
                  data-cy="sp-stats-ready-now"
                />
              </div>
              <div
                className="min-w-[220px] shrink-0 sm:min-w-0 sm:shrink"
                data-cy="sp-stats-ready-one-year-wrapper"
              >
                <StatsCard
                  icon={
                    <span className="w-8 h-8 rounded-sm bg-lightorange flex items-center justify-center">
                      <ScheduleOutlinedIcon
                        className="text-orangebg"
                        fontSize="small"
                      />
                    </span>
                  }
                  title="Ready within One Year"
                  value={readyWithinOneYearCount}
                  id="sp-stats-ready-one-year"
                  data-cy="sp-stats-ready-one-year"
                />
              </div>
              <div
                className="min-w-[220px] shrink-0 sm:min-w-0 sm:shrink"
                data-cy="sp-stats-coverage-wrapper"
              >
                <StatsCard
                  icon={
                    <span className="w-8 h-8 rounded-sm bg-lightblue flex items-center justify-center">
                      <CheckCircleOutlineOutlinedIcon
                        className="text-blue"
                        fontSize="small"
                      />
                    </span>
                  }
                  title="Succession Coverage"
                  value={`${successionCoveragePercent}%`}
                  id="sp-stats-coverage"
                  data-cy="sp-stats-coverage"
                />
              </div>
            </>
          ) : activeView === 'evaluators' ? (
            <>
              <div
                className="min-w-[220px] shrink-0 sm:min-w-0 sm:shrink"
                data-cy="sp-stats-evaluators-wrapper"
              >
                <StatsCard
                  icon={
                    <span className="w-8 h-8 rounded-sm bg-lightblue flex items-center justify-center">
                      <PeopleAltOutlinedIcon
                        className="text-blue"
                        fontSize="small"
                      />
                    </span>
                  }
                  title={
                    evaluatorScope === 'mine'
                      ? 'My Assignments'
                      : 'Active Evaluators'
                  }
                  value={
                    evaluatorScope === 'mine'
                      ? evaluatorSessionCount
                      : uniqueEvaluatorCount
                  }
                  id="sp-stats-evaluators"
                  data-cy="sp-stats-evaluators"
                />
              </div>
              <div
                className="min-w-[220px] shrink-0 sm:min-w-0 sm:shrink"
                data-cy="sp-stats-assignments-wrapper"
              >
                <StatsCard
                  icon={
                    <span className="w-8 h-8 rounded-sm bg-lightorange flex items-center justify-center">
                      <AssignmentOutlinedIcon
                        className="text-orangebg"
                        fontSize="small"
                      />
                    </span>
                  }
                  title={
                    evaluatorScope === 'mine'
                      ? 'My Scored'
                      : 'Total Assignments'
                  }
                  value={
                    evaluatorScope === 'mine'
                      ? completedEvaluationCount
                      : evaluatorSessionCount
                  }
                  id="sp-stats-assignments"
                  data-cy="sp-stats-assignments"
                />
              </div>
              <div
                className="min-w-[220px] shrink-0 sm:min-w-0 sm:shrink"
                data-cy="sp-stats-pending-evals-wrapper"
              >
                <StatsCard
                  icon={
                    <span className="w-8 h-8 rounded-sm bg-[#fff1f0] flex items-center justify-center">
                      <WarningAmberOutlinedIcon
                        className="text-error"
                        fontSize="small"
                      />
                    </span>
                  }
                  title={
                    evaluatorScope === 'mine'
                      ? 'My Pending'
                      : 'Pending Evaluations'
                  }
                  value={pendingEvaluationCount}
                  id="sp-stats-pending-evals"
                  data-cy="sp-stats-pending-evals"
                />
              </div>
              <div
                className="min-w-[220px] shrink-0 sm:min-w-0 sm:shrink"
                data-cy="sp-stats-eval-completion-wrapper"
              >
                <StatsCard
                  icon={
                    <span className="w-8 h-8 rounded-sm bg-[#f6ffed] flex items-center justify-center">
                      <CheckCircleOutlineOutlinedIcon
                        className="text-success"
                        fontSize="small"
                      />
                    </span>
                  }
                  title="Completion Rate"
                  value={`${evaluationCompletionPercent}%`}
                  id="sp-stats-eval-completion"
                  data-cy="sp-stats-eval-completion"
                />
              </div>
            </>
          ) : (
            <>
              <div
                className="min-w-[220px] shrink-0 sm:min-w-0 sm:shrink"
                data-cy="sp-stats-report-readiness-wrapper"
              >
                <StatsCard
                  icon={
                    <span className="w-8 h-8 rounded-sm bg-lightblue flex items-center justify-center">
                      <BoltOutlinedIcon
                        className="text-blue"
                        fontSize="small"
                      />
                    </span>
                  }
                  title="Readiness Rows"
                  value={readinessRowCount}
                  id="sp-stats-report-readiness"
                  data-cy="sp-stats-report-readiness"
                />
              </div>
              <div
                className="min-w-[220px] shrink-0 sm:min-w-0 sm:shrink"
                data-cy="sp-stats-report-gaps-wrapper"
              >
                <StatsCard
                  icon={
                    <span className="w-8 h-8 rounded-sm bg-[#fff1f0] flex items-center justify-center">
                      <WarningAmberOutlinedIcon
                        className="text-error"
                        fontSize="small"
                      />
                    </span>
                  }
                  title="Skill Gap Rows"
                  value={gapRowCount}
                  id="sp-stats-report-gaps"
                  data-cy="sp-stats-report-gaps"
                />
              </div>
              <div
                className="min-w-[220px] shrink-0 sm:min-w-0 sm:shrink"
                data-cy="sp-stats-report-idp-wrapper"
              >
                <StatsCard
                  icon={
                    <span className="w-8 h-8 rounded-sm bg-lightorange flex items-center justify-center">
                      <AssignmentOutlinedIcon
                        className="text-orangebg"
                        fontSize="small"
                      />
                    </span>
                  }
                  title="Development Plan Rows"
                  value={idpRowCount}
                  id="sp-stats-report-idp"
                  data-cy="sp-stats-report-idp"
                />
              </div>
            </>
          )}
        </div>
      </div>

      <div
        className="rounded-lg"
        id="succession-planning-table-section"
        data-cy="succession-planning-table-section"
      >
        {activeView === 'roles' ? (
          <>
            <div
              className="flex justify-between gap-3 mb-2 pt-3 items-start"
              data-cy="succession-planning-filter-row"
            >
              <Input
                placeholder="Search by role or department"
                allowClear
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="w-[min(100%,300px)] pr-0 py-0 h-10 sm:h-8"
                data-cy="succession-planning-search-input"
                suffix={
                  <div className="text-gray-400 border-l border-gray-300 py-1 px-2">
                    <SearchOutlined />
                  </div>
                }
              />

              <div
                className="flex items-center gap-2 flex-wrap justify-end"
                data-cy="succession-planning-active-filters"
              >
                {activeFilters.map((filter) => (
                  <Tag
                    key={filter.key}
                    className="bg-white text-primary border-primary rounded-md px-3 h-6 flex items-center text-xs font-normal"
                    data-cy={`succession-planning-filter-tag-${filter.key}`}
                  >
                    <span
                      onClick={filter.clear}
                      className="text-primary hover:!text-[#FF8787] mr-2 text-lg leading-none cursor-pointer"
                    >
                      ×
                    </span>
                    {filter.label}
                  </Tag>
                ))}

                <Dropdown
                  placement="bottomRight"
                  trigger={['click']}
                  open={filterOpen}
                  onOpenChange={setFilterOpen}
                  dropdownRender={() => filterPanel}
                >
                  <Button
                    type="default"
                    className="border border-[#D9D9D9] font-normal text-[#4d4d4d] h-10 sm:h-8"
                    icon={<FilterAltOutlinedIcon className="py-1" />}
                    data-cy="succession-planning-filter-toggle-btn"
                  >
                    {!isMobile && 'Filter'}
                  </Button>
                </Dropdown>
              </div>
            </div>

            <div
              className="overflow-x-auto"
              data-cy="succession-planning-table-wrapper"
            >
              <CriticalRolesTable
                roles={filtered}
                loading={isLoadingRoles}
                onEdit={openEditModal}
                onDelete={handleDelete}
                onRowClick={handleRowClick}
              />
            </div>
          </>
        ) : activeView === 'evaluators' ? (
          <div
            className="pt-3"
            data-cy="succession-planning-evaluators-section"
          >
            <EvaluatorsView
              roles={roles}
              scope={evaluatorScope}
              onScopeChange={(scope) => {
                setEvaluatorScope(scope);
                syncEvaluatorsUrl(scope, viewAsEvaluatorId);
              }}
              viewAsEvaluatorId={viewAsEvaluatorId}
              onViewAsChange={(id) => {
                setViewAsEvaluatorId(id);
                if (evaluatorScope === 'mine') {
                  syncEvaluatorsUrl('mine', id);
                }
              }}
              evaluatorOptions={evaluatorOptions}
            />
          </div>
        ) : (
          <ReportsView
            roles={roles}
            reportKey={reportKey}
            onReportKeyChange={(key) => {
              setReportKey(key);
              syncReportsUrl(key);
            }}
          />
        )}
      </div>

      <CriticalRoleModal
        open={modalOpen}
        editingRole={editingRole}
        onClose={handleModalClose}
        onSave={handleSave}
      />
    </div>
  );
};

export default SuccessionPlanningPage;
