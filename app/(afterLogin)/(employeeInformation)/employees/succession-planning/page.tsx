'use client';
import React, { useState } from 'react';
import { Input, Select, Typography, Breadcrumb } from 'antd';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { SearchOutlined } from '@ant-design/icons';
import AddCircleOutlineOutlinedIcon from '@mui/icons-material/AddCircleOutlineOutlined';
import AccountTreeOutlinedIcon from '@mui/icons-material/AccountTreeOutlined';
import FlagOutlinedIcon from '@mui/icons-material/FlagOutlined';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import CustomBreadcrumb from '@/components/common/breadCramp';
import CustomButton from '@/components/common/buttons/customButton';
import StatsCard from '../manage-employees/_components/statsCard';
import CriticalRolesTable from './_components/criticalRolesTable';
import CriticalRoleModal, {
  CriticalRole,
} from './_components/criticalRoleModal';
import { MOCK_SUBORDINATE_COUNTS } from './_components/steps/stepSubordinateRanking';

const { Option } = Select;

// Seed data — positionIds map to MOCK_POSITIONS in stepRoleSelection
const INITIAL_ROLES: CriticalRole[] = [
  {
    id: '1',
    positionId: 'pos-1',
    roleName: 'Chief Executive Officer',
    department: 'Executive',
    priority: 'Critical',
    riskLevel: 'High',
    successorCount: 0,
    notes: 'Requires board approval for succession.',
  },
  {
    id: '2',
    positionId: 'pos-3',
    roleName: 'VP of Engineering',
    department: 'Engineering',
    priority: 'Critical',
    riskLevel: 'High',
    successorCount: 3,
    notes: 'Key technical leadership role.',
  },
  {
    id: '3',
    positionId: 'pos-8',
    roleName: 'Head of Finance',
    department: 'Finance',
    priority: 'High',
    riskLevel: 'Medium',
    successorCount: 1,
    notes: 'Oversees all financial operations.',
  },
  {
    id: '4',
    positionId: 'pos-7',
    roleName: 'Director of People',
    department: 'Human Resources',
    priority: 'High',
    riskLevel: 'Medium',
    successorCount: 2,
    notes: '',
  },
  {
    id: '5',
    positionId: 'pos-6',
    roleName: 'Head of Sales',
    department: 'Sales',
    priority: 'Medium',
    riskLevel: 'Low',
    successorCount: 3,
    notes: 'Regional lead succession plans in progress.',
  },
];

let nextId = INITIAL_ROLES.length + 1;

const SuccessionPlanningPage: React.FC = () => {
  const router = useRouter();
  const [roles, setRoles] = useState<CriticalRole[]>(INITIAL_ROLES);
  const [searchValue, setSearchValue] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('');
  const [riskFilter, setRiskFilter] = useState<string>('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<CriticalRole | null>(null);

  // ── derived stats ────────────────────────────────────────────────
  const totalRoles = roles.length;
  const highRiskCount = roles.filter((r) => r.riskLevel === 'High').length;
  const rolesWithSuccessors = roles.filter((r) => r.successorCount > 0).length;
  const coveragePercent =
    totalRoles > 0 ? Math.round((rolesWithSuccessors / totalRoles) * 100) : 0;

  // ── filtering ────────────────────────────────────────────────────
  const filtered = roles.filter((r) => {
    const matchesSearch =
      !searchValue ||
      r.roleName.toLowerCase().includes(searchValue.toLowerCase()) ||
      r.department.toLowerCase().includes(searchValue.toLowerCase());
    const matchesPriority = !priorityFilter || r.priority === priorityFilter;
    const matchesRisk = !riskFilter || r.riskLevel === riskFilter;
    return matchesSearch && matchesPriority && matchesRisk;
  });

  // ── handlers ─────────────────────────────────────────────────────
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
      setRoles((prev) =>
        prev.map((r) => (r.id === editingRole.id ? { ...r, ...values } : r)),
      );
    } else {
      const newRole: CriticalRole = {
        id: String(nextId++),
        // derive successor count from the mock subordinate data
        successorCount: MOCK_SUBORDINATE_COUNTS[values.positionId] ?? 0,
        ...values,
      };
      setRoles((prev) => [newRole, ...prev]);
    }
    setModalOpen(false);
    setEditingRole(null);
  };

  const handleDelete = (id: string) => {
    setRoles((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <div id="succession-planning-page" data-cy="succession-planning-page">
      {/* ── Page Header ─────────────────────────────────────────── */}
      <div
        className="flex flex-wrap justify-between items-center pt-4"
        id="succession-planning-header"
        data-cy="succession-planning-header"
      >
        <CustomBreadcrumb
          onBack={() => router.back()}
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
            <CustomButton
              title={
                <span className="flex items-center gap-2 leading-none">
                  <AddCircleOutlineOutlinedIcon
                    style={{ fontSize: 18, display: 'block' }}
                  />
                  <span>Add Critical Role</span>
                </span>
              }
              type="primary"
              id="add-critical-role-btn"
              onClick={openAddModal}
              data-cy="add-critical-role-btn"
            />
          }
          data-cy="succession-planning-breadcrumb"
        />
      </div>

      {/* ── Stats Row ───────────────────────────────────────────── */}
      <div className="mb-6" data-cy="succession-planning-stats">
        <div
          className="flex gap-4 overflow-x-auto overflow-y-hidden sm:grid sm:grid-cols-2 lg:grid-cols-4"
          data-cy="succession-planning-stats-grid"
        >
          <div
            className="min-w-[200px] shrink-0 sm:min-w-0 sm:shrink"
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
            className="min-w-[200px] shrink-0 sm:min-w-0 sm:shrink"
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
            className="min-w-[200px] shrink-0 sm:min-w-0 sm:shrink"
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
            className="min-w-[200px] shrink-0 sm:min-w-0 sm:shrink"
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
        </div>
      </div>

      {/* ── Table Section ───────────────────────────────────────── */}
      <div
        className="rounded-lg"
        id="succession-planning-table-section"
        data-cy="succession-planning-table-section"
      >
        {/* filter / search row */}
        <div
          className="flex flex-wrap justify-between items-center gap-3 mb-3 pt-3"
          data-cy="succession-planning-filter-row"
        >
          <Input
            placeholder="Search by role or department"
            allowClear
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="w-full sm:w-[280px] h-10 sm:h-8 pr-0 py-0"
            data-cy="succession-planning-search-input"
            suffix={
              <div className="text-gray-400 border-l border-gray-300 py-1 px-2">
                <SearchOutlined />
              </div>
            }
          />
          <div
            className="flex items-center gap-2 flex-wrap"
            data-cy="succession-planning-selects"
          >
            <Select
              placeholder="Priority"
              allowClear
              value={priorityFilter || undefined}
              onChange={(v) => setPriorityFilter(v ?? '')}
              className="w-32"
              data-cy="succession-planning-priority-filter"
            >
              <Option value="Critical">Critical</Option>
              <Option value="High">High</Option>
              <Option value="Medium">Medium</Option>
            </Select>
            <Select
              placeholder="Risk Level"
              allowClear
              value={riskFilter || undefined}
              onChange={(v) => setRiskFilter(v ?? '')}
              className="w-32"
              data-cy="succession-planning-risk-filter"
            >
              <Option value="High">High</Option>
              <Option value="Medium">Medium</Option>
              <Option value="Low">Low</Option>
            </Select>
          </div>
        </div>

        {/* table */}
        <div
          className="overflow-x-auto"
          data-cy="succession-planning-table-wrapper"
        >
          <CriticalRolesTable
            roles={filtered}
            onEdit={openEditModal}
            onDelete={handleDelete}
          />
        </div>
      </div>

      {/* ── Modal ───────────────────────────────────────────────── */}
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
