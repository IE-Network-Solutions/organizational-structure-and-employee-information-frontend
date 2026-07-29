'use client';
import React, { useMemo, useState } from 'react';
import {
  Button,
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
import FlagOutlinedIcon from '@mui/icons-material/FlagOutlined';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import FilterAltOutlinedIcon from '@mui/icons-material/FilterAltOutlined';
import CustomBreadcrumb from '@/components/common/breadCramp';
import StatsCard from '../manage-employees/_components/statsCard';
import CriticalRolesTable from './_components/criticalRolesTable';
import EvaluatorsView, {
  buildEvaluatorAssignments,
} from './_components/evaluatorsView';
import CriticalRoleModal, {
  CriticalRole,
} from './_components/criticalRoleModal';
import { useSuccessionPlanningStore } from '@/store/uistate/features/employees/successionPlanning';
import { useIsMobile } from '@/hooks/useIsMobile';

const { Option } = Select;

type SuccessionView = 'roles' | 'evaluators';

const SuccessionPlanningPage: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isMobile } = useIsMobile();
  const initialView =
    searchParams.get('view') === 'evaluators' ? 'evaluators' : 'roles';

  const roles = useSuccessionPlanningStore((s) => s.roles);
  const addRole = useSuccessionPlanningStore((s) => s.addRole);
  const updateRole = useSuccessionPlanningStore((s) => s.updateRole);
  const deleteRole = useSuccessionPlanningStore((s) => s.deleteRole);

  const [activeView, setActiveView] = useState<SuccessionView>(initialView);
  const [searchValue, setSearchValue] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('');
  const [riskFilter, setRiskFilter] = useState<string>('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<CriticalRole | null>(null);

  const totalRoles = roles.length;
  const highRiskCount = roles.filter((r) => r.riskLevel === 'High').length;
  const rolesWithCompetencies = roles.filter(
    (r) => (r.competencies?.length ?? 0) > 0,
  ).length;
  const coveragePercent =
    totalRoles > 0
      ? Math.round((rolesWithCompetencies / totalRoles) * 100)
      : 0;

  const evaluatorAssignments = useMemo(
    () => buildEvaluatorAssignments(roles),
    [roles],
  );
  const uniqueEvaluatorCount = useMemo(
    () => new Set(evaluatorAssignments.map((a) => a.evaluatorId)).size,
    [evaluatorAssignments],
  );
  const pendingEvaluationCount = evaluatorAssignments.filter(
    (a) => a.status === 'Pending',
  ).length;
  const completedEvaluationCount = evaluatorAssignments.filter(
    (a) => a.status === 'Evaluated',
  ).length;
  const evaluationCompletionPercent =
    evaluatorAssignments.length > 0
      ? Math.round(
          (completedEvaluationCount / evaluatorAssignments.length) * 100,
        )
      : 0;

  const filtered = roles.filter((r) => {
    const matchesSearch =
      !searchValue ||
      r.roleName.toLowerCase().includes(searchValue.toLowerCase()) ||
      r.department.toLowerCase().includes(searchValue.toLowerCase());
    const matchesPriority = !priorityFilter || r.priority === priorityFilter;
    const matchesRisk = !riskFilter || r.riskLevel === riskFilter;
    return matchesSearch && matchesPriority && matchesRisk;
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
    if (riskFilter) {
      tags.push({
        key: 'risk',
        label: `${riskFilter} Risk`,
        clear: () => setRiskFilter(''),
      });
    }
    return tags;
  }, [priorityFilter, riskFilter]);

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

  const handleSave = (values: Omit<CriticalRole, 'id' | 'successorCount'>) => {
    if (editingRole) {
      updateRole(editingRole.id, values);
    } else {
      addRole(values);
    }
    setModalOpen(false);
    setEditingRole(null);
  };

  const handleDelete = (id: string) => {
    deleteRole(id);
  };

  const handleRowClick = (role: CriticalRole) => {
    router.push(`/employees/succession-planning/${role.id}`);
  };

  const filterPanel = (
    <div
      className="bg-white rounded-lg border border-[#E5E7EB] shadow-md p-4 min-w-[260px] sm:min-w-[320px]"
      data-cy="succession-planning-filter-panel"
    >
      <div className="flex flex-col gap-3">
        <div>
          <div className="text-xs font-semibold text-gray-500 mb-1">
            Priority
          </div>
          <Select
            placeholder="Priority"
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
        <div>
          <div className="text-xs font-semibold text-gray-500 mb-1">
            Risk Level
          </div>
          <Select
            placeholder="Risk Level"
            allowClear
            value={riskFilter || undefined}
            onChange={(v) => setRiskFilter(v ?? '')}
            className="w-full"
            data-cy="succession-planning-risk-filter"
          >
            <Option value="High">High</Option>
            <Option value="Medium">Medium</Option>
            <Option value="Low">Low</Option>
          </Select>
        </div>
        <div className="flex justify-end gap-2 pt-1">
          <Button
            onClick={() => {
              setPriorityFilter('');
              setRiskFilter('');
            }}
            data-cy="succession-planning-filter-reset"
          >
            Reset
          </Button>
          <Button
            type="primary"
            onClick={() => setFilterOpen(false)}
            data-cy="succession-planning-filter-apply"
          >
            Apply
          </Button>
        </div>
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
              <Segmented
                value={activeView}
                size="middle"
                onChange={(value) => {
                  const next = value as SuccessionView;
                  setActiveView(next);
                  router.replace(
                    next === 'evaluators'
                      ? '/employees/succession-planning?view=evaluators'
                      : '/employees/succession-planning',
                    { scroll: false },
                  );
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
                ]}
                data-cy="succession-planning-view-selector"
              />
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
            </div>
          }
          data-cy="succession-planning-breadcrumb"
        />
      </div>

      <div className="mb-6" data-cy="succession-planning-stats">
        <div
          className="flex gap-4 overflow-x-auto overflow-y-hidden scrollbar-hide sm:grid sm:grid-cols-2 lg:grid-cols-4"
          data-cy="succession-planning-stats-grid"
        >
          {activeView === 'roles' ? (
            <>
              <div
                className="min-w-[220px] shrink-0 sm:min-w-0 sm:shrink"
                data-cy="sp-stats-total-wrapper"
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
                  title="Total Critical Roles"
                  value={totalRoles}
                  id="sp-stats-total"
                  data-cy="sp-stats-total"
                />
              </div>
              <div
                className="min-w-[220px] shrink-0 sm:min-w-0 sm:shrink"
                data-cy="sp-stats-high-risk-wrapper"
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
                  title="High Risk Roles"
                  value={highRiskCount}
                  id="sp-stats-high-risk"
                  data-cy="sp-stats-high-risk"
                />
              </div>
              <div
                className="min-w-[220px] shrink-0 sm:min-w-0 sm:shrink"
                data-cy="sp-stats-coverage-wrapper"
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
                  title="Coverage Rate"
                  value={`${coveragePercent}%`}
                  id="sp-stats-coverage"
                  data-cy="sp-stats-coverage"
                />
              </div>
              <div
                className="min-w-[220px] shrink-0 sm:min-w-0 sm:shrink"
                data-cy="sp-stats-critical-wrapper"
              >
                <StatsCard
                  icon={
                    <span className="w-8 h-8 rounded-sm bg-lightorange flex items-center justify-center">
                      <FlagOutlinedIcon
                        className="text-orangebg"
                        fontSize="small"
                      />
                    </span>
                  }
                  title="Critical Priority"
                  value={roles.filter((r) => r.priority === 'Critical').length}
                  id="sp-stats-critical"
                  data-cy="sp-stats-critical"
                />
              </div>
            </>
          ) : (
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
                  title="Active Evaluators"
                  value={uniqueEvaluatorCount}
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
                  title="Total Assignments"
                  value={evaluatorAssignments.length}
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
                  title="Pending Evaluations"
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
                onEdit={openEditModal}
                onDelete={handleDelete}
                onRowClick={handleRowClick}
              />
            </div>
          </>
        ) : (
          <div className="pt-3" data-cy="succession-planning-evaluators-section">
            <EvaluatorsView roles={roles} />
          </div>
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
