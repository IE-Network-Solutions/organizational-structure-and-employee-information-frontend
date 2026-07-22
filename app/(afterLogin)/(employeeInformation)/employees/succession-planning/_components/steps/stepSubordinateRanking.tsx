'use client';
import React from 'react';
import { Avatar, Empty, Table, Tooltip } from 'antd';
import type { TableColumnsType } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import AccountTreeOutlinedIcon from '@mui/icons-material/AccountTreeOutlined';
import { MOCK_POSITIONS } from './stepRoleSelection';

// ── Types ─────────────────────────────────────────────────────────────────────
interface SubordinateMock {
  id: string;
  name: string;
  currentTitle: string;
  department: string;
  initials: string;
  quarters: [number, number, number, number];
}

// ── Mock data: subordinates keyed by position id ──────────────────────────────
const MOCK_SUBORDINATES: Record<string, SubordinateMock[]> = {
  'pos-1': [],
  'pos-2': [
    { id: 'emp-3',  name: 'Helen Park',      currentTitle: 'Operations Lead',           department: 'Operations',      initials: 'HP', quarters: [88, 91, 85, 94] },
    { id: 'emp-4',  name: 'James Okafor',    currentTitle: 'Business Analyst',           department: 'Operations',      initials: 'JO', quarters: [72, 78, 80, 75] },
  ],
  'pos-3': [
    { id: 'emp-5',  name: 'Lena Fischer',    currentTitle: 'Senior Software Engineer',   department: 'Engineering',     initials: 'LF', quarters: [95, 92, 97, 93] },
    { id: 'emp-6',  name: 'Marcus Webb',     currentTitle: 'Engineering Manager',        department: 'Engineering',     initials: 'MW', quarters: [88, 84, 90, 87] },
    { id: 'emp-7',  name: 'Aiko Yamamoto',   currentTitle: 'Principal Engineer',         department: 'Engineering',     initials: 'AY', quarters: [79, 82, 76, 88] },
  ],
  'pos-4': [
    { id: 'emp-8',  name: 'Daniel Mensah',   currentTitle: 'Finance Manager',            department: 'Finance',         initials: 'DM', quarters: [91, 89, 93, 90] },
    { id: 'emp-9',  name: 'Priya Nair',      currentTitle: 'Financial Analyst',          department: 'Finance',         initials: 'PN', quarters: [83, 80, 85, 79] },
  ],
  'pos-5': [
    { id: 'emp-10', name: 'Carlos Rivera',   currentTitle: 'Product Manager',            department: 'Product',         initials: 'CR', quarters: [90, 87, 92, 95] },
    { id: 'emp-11', name: 'Sofia Johansson', currentTitle: 'Senior Product Manager',     department: 'Product',         initials: 'SJ', quarters: [85, 88, 83, 91] },
  ],
  'pos-6': [
    { id: 'emp-12', name: 'Kwame Asante',    currentTitle: 'Sales Manager',              department: 'Sales',           initials: 'KA', quarters: [93, 96, 91, 98] },
    { id: 'emp-13', name: 'Nina Kovacs',     currentTitle: 'Account Executive',          department: 'Sales',           initials: 'NK', quarters: [78, 82, 79, 84] },
    { id: 'emp-14', name: 'Tom Bradley',     currentTitle: 'Regional Sales Lead',        department: 'Sales',           initials: 'TB', quarters: [70, 75, 68, 73] },
  ],
  'pos-7': [
    { id: 'emp-15', name: 'Amara Diallo',    currentTitle: 'HR Business Partner',        department: 'Human Resources', initials: 'AD', quarters: [87, 89, 92, 88] },
    { id: 'emp-16', name: 'Ravi Sharma',     currentTitle: 'Talent Acquisition Lead',    department: 'Human Resources', initials: 'RS', quarters: [81, 79, 83, 80] },
  ],
  'pos-8': [
    { id: 'emp-17', name: 'Emeka Obi',       currentTitle: 'Senior Accountant',          department: 'Finance',         initials: 'EO', quarters: [88, 85, 91, 89] },
  ],
  'pos-9': [
    { id: 'emp-18', name: 'Yui Tanaka',      currentTitle: 'Software Engineer',          department: 'Engineering',     initials: 'YT', quarters: [84, 87, 89, 86] },
    { id: 'emp-19', name: 'Andre Dupont',    currentTitle: 'Senior Software Engineer',   department: 'Engineering',     initials: 'AD', quarters: [77, 80, 75, 82] },
  ],
  'pos-10': [
    { id: 'emp-20', name: 'Chioma Eze',      currentTitle: 'Sales Representative',       department: 'Sales',           initials: 'CE', quarters: [91, 88, 94, 92] },
    { id: 'emp-21', name: 'Lars Eriksson',   currentTitle: 'Sales Representative',       department: 'Sales',           initials: 'LE', quarters: [76, 73, 78, 71] },
  ],
};

// ── Exported helper ───────────────────────────────────────────────────────────
export const MOCK_SUBORDINATE_COUNTS: Record<string, number> = Object.fromEntries(
  Object.entries(MOCK_SUBORDINATES).map(([posId, list]) => [posId, list.length]),
);

// ── Helpers ───────────────────────────────────────────────────────────────────
const aggregate = (q: [number, number, number, number]) =>
  Math.round(q.reduce((s, v) => s + v, 0) / 4);

const QUARTER_LABELS = ['Q1', 'Q2', 'Q3', 'Q4'] as const;

// ── OKR Donut (pure SVG) ──────────────────────────────────────────────────────
const DONUT_SIZE = 52;
const STROKE    = 5;
const RADIUS    = (DONUT_SIZE - STROKE) / 2;
const CIRC      = 2 * Math.PI * RADIUS;
// Same blue as Ant Design primary (colorPrimary in antdProvider.tsx → #1E40AF)
const PRIMARY   = '#1E40AF';
const TRACK     = '#e5e7eb';

interface OkrDonutProps {
  score: number;
  quarters: [number, number, number, number];
}

const OkrDonut: React.FC<OkrDonutProps> = ({ score, quarters }) => {
  const filled = (score / 100) * CIRC;

  const tooltipContent = (
    <div className="flex flex-col gap-1 text-xs min-w-[110px]">
      <span className="font-semibold text-white mb-0.5">OKR by Quarter</span>
      {quarters.map((q, i) => (
        <div key={i} className="flex justify-between gap-3">
          <span className="text-gray-300">{QUARTER_LABELS[i]}</span>
          <span className="font-semibold text-white">{q}%</span>
        </div>
      ))}
      <div className="border-t border-gray-600 mt-1 pt-1 flex justify-between gap-3">
        <span className="text-gray-300">Avg</span>
        <span className="font-bold text-white">{score}%</span>
      </div>
    </div>
  );

  return (
    <Tooltip title={tooltipContent} placement="left">
      <svg
        width={DONUT_SIZE}
        height={DONUT_SIZE}
        viewBox={`0 0 ${DONUT_SIZE} ${DONUT_SIZE}`}
        className="shrink-0 cursor-pointer"
        data-cy="okr-donut"
      >
        <circle cx={DONUT_SIZE / 2} cy={DONUT_SIZE / 2} r={RADIUS}
          fill="none" stroke={TRACK} strokeWidth={STROKE} />
        <circle cx={DONUT_SIZE / 2} cy={DONUT_SIZE / 2} r={RADIUS}
          fill="none" stroke={PRIMARY} strokeWidth={STROKE}
          strokeDasharray={`${filled} ${CIRC - filled}`}
          strokeLinecap="round"
          transform={`rotate(-90 ${DONUT_SIZE / 2} ${DONUT_SIZE / 2})`} />
        <text x="50%" y="50%" dominantBaseline="central" textAnchor="middle"
          fontSize="9" fontWeight="700" fill={PRIMARY}>
          {score}%
        </text>
      </svg>
    </Tooltip>
  );
};

// ── Column header style — matches manage-employees table ─────────────────────
const th = 'text-[#4d4d4d] text-sm font-bold';
const td = 'text-[#4d4d4d] text-sm font-normal';

// ── Table row shape ───────────────────────────────────────────────────────────
interface RowData {
  key: string;
  rank: number;
  employee_name: React.ReactNode;
  job_title: React.ReactNode;
  department: React.ReactNode;
  okr: React.ReactNode;
}

// ── Main component ────────────────────────────────────────────────────────────
interface StepSubordinateRankingProps {
  positionId: string | null;
}

const StepSubordinateRanking: React.FC<StepSubordinateRankingProps> = ({
  positionId,
}) => {
  const position = MOCK_POSITIONS.find((p) => p.id === positionId);

  const ranked = [...(MOCK_SUBORDINATES[positionId ?? ''] ?? [])].sort(
    (a, b) => aggregate(b.quarters) - aggregate(a.quarters),
  );

  if (!position) {
    return (
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description={
          <span className="text-gray-400 text-sm">
            No position selected. Please go back and select a role.
          </span>
        }
        data-cy="step-subordinate-no-position"
      />
    );
  }

  // ── Build table rows in the same shape as UserTable ──────────────────────
  const tableData: RowData[] = ranked.map((emp, idx) => ({
    key: emp.id,
    rank: idx + 1,
    employee_name: (
      <div
        className="flex items-center gap-2"
        data-cy={`subordinate-name-cell-${emp.id}`}
      >
        {/* 24 px round avatar — matches manage-employees exactly */}
        <div className="relative w-6 h-6 rounded-full overflow-hidden shrink-0">
          <Avatar
            size={24}
            icon={<UserOutlined />}
            style={{ backgroundColor: PRIMARY }}
            className="w-6 h-6"
            data-cy={`subordinate-avatar-${emp.id}`}
          />
        </div>
        <span
          className={td}
          data-cy={`subordinate-name-${emp.id}`}
        >
          {emp.name}
        </span>
      </div>
    ),
    job_title: (
      <span className={td} data-cy={`subordinate-title-${emp.id}`}>
        {emp.currentTitle}
      </span>
    ),
    department: (
      <span className={td} data-cy={`subordinate-dept-${emp.id}`}>
        {emp.department}
      </span>
    ),
    okr: (
      <OkrDonut
        score={aggregate(emp.quarters)}
        quarters={emp.quarters}
      />
    ),
  }));

  const columns: TableColumnsType<RowData> = [
    {
      title: <span className={th}>#</span>,
      dataIndex: 'rank',
      key: 'rank',
      width: 40,
      render: (v: number) => (
        <span className="text-xs font-bold text-gray-400">{v}</span>
      ),
    },
    {
      title: <span className={th}>Employee Name</span>,
      dataIndex: 'employee_name',
      key: 'employee_name',
      ellipsis: true,
    },
    {
      title: <span className={th}>Position</span>,
      dataIndex: 'job_title',
      key: 'job_title',
      ellipsis: true,
    },
    {
      title: <span className={th}>Department</span>,
      dataIndex: 'department',
      key: 'department',
      ellipsis: true,
    },
    {
      title: <span className={th}>OKR Score</span>,
      dataIndex: 'okr',
      key: 'okr',
      width: 80,
      align: 'center' as const,
    },
  ];

  return (
    <div className="flex flex-col gap-4" data-cy="step-subordinate-ranking-container">

      {/* intro */}
      <p className="text-sm text-gray-500">
        Subordinates for{' '}
        <span className="font-semibold text-gray-700">{position.title}</span>{' '}
        ranked by 4-quarter aggregate OKR score. Hover the ring to see the
        quarterly breakdown.
      </p>

      {/* position pill */}
      <div
        className="flex items-center gap-2 bg-lightblue rounded-lg px-4 py-2 w-fit"
        data-cy="step-subordinate-position-pill"
      >
        <AccountTreeOutlinedIcon fontSize="small" className="text-primary" />
        <span className="text-sm font-semibold text-primary">{position.title}</span>
        <span className="text-xs text-gray-400">·</span>
        <span className="text-xs text-gray-500">{position.department}</span>
      </div>

      {/* table — matches manage-employees styling */}
      <Table
        columns={columns}
        dataSource={tableData}
        rowKey="key"
        pagination={false}
        scroll={{ x: 560 }}
        locale={{
          emptyText: (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <span className="text-gray-400 text-sm">
                  No subordinates found for this position.
                </span>
              }
              data-cy="step-subordinate-empty"
            />
          ),
        }}
        rowHoverable={false}
        rowClassName={(_, index) =>
          index % 2 === 0 ? 'bg-white' : 'bg-[#FAFAFA]'
        }
        data-cy="step-subordinate-table"
      />
    </div>
  );
};

export default StepSubordinateRanking;
