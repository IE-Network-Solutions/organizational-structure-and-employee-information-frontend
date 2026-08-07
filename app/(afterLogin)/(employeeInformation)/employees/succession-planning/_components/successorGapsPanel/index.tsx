'use client';
import React, { useState } from 'react';
import { Button, Empty, Select, Table, Tag } from 'antd';
import type { TableColumnsType } from 'antd';
import AddCircleOutlineOutlinedIcon from '@mui/icons-material/AddCircleOutlineOutlined';
import RefreshOutlinedIcon from '@mui/icons-material/RefreshOutlined';
import type {
  CompetencyGap,
  DevelopmentAction,
  GapStatus,
} from '../successionTypes';
import { gapSeverityColor, importanceColor } from '../tagColors';
import DevelopmentActionModal, {
  type DevelopmentActionFormValues,
} from '../developmentActionModal';

interface SuccessorGapsPanelProps {
  gaps: CompetencyGap[];
  actions?: DevelopmentAction[];
  onRecalculate: () => void;
  onStatusChange: (gapId: string, status: GapStatus) => void;
  onAddAction?: (action: Omit<DevelopmentAction, 'id'>) => void;
}

const SuccessorGapsPanel: React.FC<SuccessorGapsPanelProps> = ({
  gaps,
  actions = [],
  onRecalculate,
  onStatusChange,
  onAddAction,
}) => {
  const [actionModalOpen, setActionModalOpen] = useState(false);
  const [lockedGapId, setLockedGapId] = useState<string | undefined>();

  const openCount = gaps.filter((g) => g.status !== 'Closed').length;

  const actionCountForGap = (gapId: string) =>
    actions.filter((a) => a.gapId === gapId).length;

  const openActionModal = (gapId: string) => {
    setLockedGapId(gapId);
    setActionModalOpen(true);
  };

  const handleSaveAction = (payload: DevelopmentActionFormValues) => {
    onAddAction?.(payload);
    setActionModalOpen(false);
    setLockedGapId(undefined);
  };

  const columns: TableColumnsType<CompetencyGap> = [
    {
      title: <span className="text-[#4d4d4d] text-sm font-bold">Required</span>,
      key: 'required',
      minWidth: 200,
      render: (_: unknown, record) => (
        <div className="py-0.5 pr-2">
          <div className="text-sm text-gray-800 leading-snug whitespace-normal break-words">
            {record.competencyName}
          </div>
          {record.requiredLevel ? (
            <div className="text-xs text-gray-500 mt-0.5 leading-snug whitespace-normal break-words">
              {record.requiredLevel}
            </div>
          ) : null}
          <div className="text-xs text-gray-400 mt-0.5">{record.category}</div>
          {actionCountForGap(record.id) > 0 ? (
            <div className="text-xs text-primary mt-0.5">
              {actionCountForGap(record.id)} action
              {actionCountForGap(record.id) === 1 ? '' : 's'} in Actions
            </div>
          ) : null}
        </div>
      ),
    },
    {
      title: <span className="text-[#4d4d4d] text-sm font-bold">Current</span>,
      dataIndex: 'currentLevel',
      minWidth: 220,
      render: (value: string) => (
        <span className="text-sm text-[#4d4d4d] leading-snug whitespace-normal break-words block py-0.5 pr-2">
          {value || '—'}
        </span>
      ),
    },
    {
      title: (
        <span className="text-[#4d4d4d] text-sm font-bold">Importance</span>
      ),
      dataIndex: 'importance',
      width: 120,
      render: (value: CompetencyGap['importance']) => (
        <Tag color={importanceColor[value]} className="m-0">
          {value}
        </Tag>
      ),
    },
    {
      title: <span className="text-[#4d4d4d] text-sm font-bold">Severity</span>,
      dataIndex: 'gapSeverity',
      width: 110,
      render: (value: CompetencyGap['gapSeverity']) => (
        <Tag color={gapSeverityColor[value]} className="m-0">
          {value}
        </Tag>
      ),
    },
    {
      title: <span className="text-[#4d4d4d] text-sm font-bold">Status</span>,
      key: 'status',
      width: 150,
      render: (_: unknown, record) => (
        <Select
          size="small"
          className="w-full min-w-[130px]"
          value={record.status}
          onChange={(status) => onStatusChange(record.id, status)}
          options={[
            { value: 'Open', label: 'Open' },
            { value: 'In Progress', label: 'In Progress' },
            { value: 'Closed', label: 'Closed' },
          ]}
          data-cy={`gap-status-${record.id}`}
        />
      ),
    },
    {
      title: <span className="text-[#4d4d4d] text-sm font-bold">Action</span>,
      key: 'define-action',
      width: 160,
      render: (_: unknown, record) =>
        onAddAction ? (
          <Button
            type="primary"
            size="small"
            className="h-8 font-normal whitespace-nowrap"
            icon={<AddCircleOutlineOutlinedIcon style={{ fontSize: 16 }} />}
            onClick={() => openActionModal(record.id)}
            data-cy={`define-action-for-gap-${record.id}`}
          >
            Define action
          </Button>
        ) : null,
    },
  ];

  return (
    <div className="flex flex-col gap-3" data-cy="successor-gaps-panel">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-gray-500 mb-0">
          {openCount} open gap{openCount === 1 ? '' : 's'} vs role requirements
        </p>
        <Button
          size="small"
          icon={<RefreshOutlinedIcon style={{ fontSize: 16 }} />}
          onClick={onRecalculate}
          className="border border-[#D9D9D9] text-[#4d4d4d] font-normal h-8"
          data-cy="recalculate-gaps-btn"
        >
          Recalculate gaps
        </Button>
      </div>
      <Table
        columns={columns}
        dataSource={gaps}
        rowKey="id"
        pagination={false}
        size="middle"
        tableLayout="auto"
        scroll={{ x: 'max-content' }}
        locale={{
          emptyText: (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="No skill gaps identified for required competencies."
            />
          ),
        }}
        rowClassName={(_, index) =>
          index % 2 === 0 ? 'bg-white' : 'bg-[#FAFAFA]'
        }
        data-cy="successor-gaps-table"
      />

      {onAddAction ? (
        <DevelopmentActionModal
          open={actionModalOpen}
          gaps={gaps}
          lockedGapId={lockedGapId}
          onClose={() => {
            setActionModalOpen(false);
            setLockedGapId(undefined);
          }}
          onSave={handleSaveAction}
        />
      ) : null}
    </div>
  );
};

export default SuccessorGapsPanel;
