'use client';

import { Card, Table, Tag } from 'antd';
import dayjs from 'dayjs';
import { useShiftSwapStore } from '@/store/uistate/features/timesheet/shiftSwap';
import SectionHeader from '../shared/SectionHeader';

const actionColor: Record<string, string> = {
  created: 'blue',
  updated: 'geekblue',
  deleted: 'red',
  assigned: 'green',
  reassigned: 'purple',
  copied: 'cyan',
  swap_requested: 'gold',
  swap_approved: 'green',
  swap_rejected: 'red',
  swap_cancelled: 'default',
  config_updated: 'magenta',
};

const AuditLogPanel = () => {
  const { auditLogs, filters } = useShiftSwapStore();
  const query = filters.search.trim().toLowerCase();
  const rows = auditLogs.filter((item) => {
    if (!query) return true;
    return `${item.actorName} ${item.description} ${item.action}`
      .toLowerCase()
      .includes(query);
  });

  return (
    <div
      id="time-attendance-settings-shift-swap-audit"
      data-cy="time-attendance-settings-shift-swap-audit"
    >
      <SectionHeader
        title="Audit Log"
        description="Every assignment, modification, approval, and swap is recorded for full traceability."
      />
      <Card className="border-[#D9D9D9]" styles={{ body: { padding: 0 } }}>
        <Table
          rowKey="id"
          dataSource={rows}
          pagination={{ pageSize: 10 }}
          columns={[
            {
              title: 'Time',
              dataIndex: 'timestamp',
              render: (value) => dayjs(value).format('MMM D, YYYY HH:mm'),
              width: 180,
            },
            {
              title: 'Action',
              dataIndex: 'action',
              render: (value: string) => (
                <Tag color={actionColor[value] || 'default'}>
                  {value.replaceAll('_', ' ')}
                </Tag>
              ),
              width: 160,
            },
            { title: 'Actor', dataIndex: 'actorName', width: 160 },
            { title: 'Details', dataIndex: 'description' },
          ]}
        />
      </Card>
    </div>
  );
};

export default AuditLogPanel;
