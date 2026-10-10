'use client';

/* eslint-disable local-rules/data-cy-required */

import React from 'react';
import { Table, Tag } from 'antd';
import AccessGuard from '@/utils/permissionGuard';
import { useGetOkrPerspectives } from '@/store/server/features/okrplanning/okr-perspective/queries';
import { OkrPerspective } from '@/store/server/features/okrplanning/okr-perspective/interface';

const MANAGE_OKR_SETTINGS = 'manage_okr_settings';

const OkrPerspectivesPage = () => {
  const { data: perspectives = [], isLoading } = useGetOkrPerspectives();

  return (
    <AccessGuard permissions={[MANAGE_OKR_SETTINGS]}>
      <div className="rounded-xl bg-white p-4 sm:p-6 lg:p-8">
        <div className="mb-6">
          <h2 className="mb-1 text-xl font-semibold text-[#262626]">
            OKR Perspectives
          </h2>
          <p className="m-0 text-sm text-[#595959]">
            The four balanced-scorecard perspectives are maintained by the
            system.
          </p>
        </div>
        <Table<OkrPerspective>
          dataSource={perspectives}
          loading={isLoading}
          rowKey="id"
          pagination={false}
          columns={[
            {
              title: 'Perspective',
              dataIndex: 'name',
              key: 'name',
              render: (name: string, record: OkrPerspective) => (
                <div>
                  <div className="font-medium text-[#262626]">{name}</div>
                  {record.description && (
                    <div className="mt-1 text-xs text-[#8c8c8c]">
                      {record.description}
                    </div>
                  )}
                </div>
              ),
            },
            {
              title: 'Type',
              key: 'type',
              width: 140,
              render: () => <Tag color="blue">System</Tag>,
            },
          ]}
          locale={{ emptyText: 'No OKR perspectives are available.' }}
        />
      </div>
    </AccessGuard>
  );
};

export default OkrPerspectivesPage;
