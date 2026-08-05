'use client';
import React, { FC, useState } from 'react';
import { Button, Space, Table } from 'antd';
import dayjs from 'dayjs';
import { useRouter } from 'next/navigation';
import CustomPagination from '@/components/customPagination';
import { TableSkeleton } from '@/components/tableSkeleton';
import EmptyState from '@/components/empty';
import { TableColumnsType } from '@/types/table/table';
import { DATE_FORMAT } from '@/utils/constants';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import {
  useGetPendingForManager,
  useGetPendingForTnaOfficer,
} from '@/store/server/features/tna/externalTraining/queries';
import { useGetIsTnaOfficer } from '@/store/server/features/tna/tnaOfficer/queries';
import { ExternalTrainingRequest } from '@/types/tna/externalTna';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
import EmployeeName from '@/app/(afterLogin)/(tna)/tna/_components/employeeName';
import ManagerDecisionModal from '@/app/(afterLogin)/(tna)/tna/_components/decisionModals/managerDecisionModal';
import TnaOfficerDecisionModal from '@/app/(afterLogin)/(tna)/tna/_components/decisionModals/tnaOfficerDecisionModal';

/** The current user's approval inbox: manager queue and TNA Officer queue. */
const ApprovalsTab: FC = () => {
  const router = useRouter();
  const { userId } = useAuthenticationStore();

  const [managerPage, setManagerPage] = useState(1);
  const [managerLimit, setManagerLimit] = useState(10);
  const [officerPage, setOfficerPage] = useState(1);
  const [officerLimit, setOfficerLimit] = useState(10);
  const [activeRequest, setActiveRequest] =
    useState<ExternalTrainingRequest | null>(null);
  const [openModal, setOpenModal] = useState<'manager' | 'officer' | null>(
    null,
  );

  const { data: officerCheck } = useGetIsTnaOfficer(userId ?? '');
  const canActAsOfficer =
    Boolean(officerCheck?.isOfficer) ||
    AccessGuard.checkAccess({ permissions: [Permissions.ApproveTnaAsOfficer] });

  const { data: managerQueue, isLoading: isManagerLoading } =
    useGetPendingForManager(userId ?? '', {
      page: managerPage,
      limit: managerLimit,
    });

  const { data: officerQueue, isLoading: isOfficerLoading } =
    useGetPendingForTnaOfficer(
      { page: officerPage, limit: officerLimit },
      canActAsOfficer,
    );

  const buildColumns = (
    stage: 'manager' | 'officer',
  ): NonNullable<TableColumnsType<ExternalTrainingRequest>> => [
    {
      title: 'Course',
      dataIndex: 'courseName',
      key: 'courseName',
      render: (value: string, record: ExternalTrainingRequest) => (
        <div
          data-cy="tna-admin-approvals-course-cell"
          className="flex flex-col"
        >
          <span
            data-cy="tna-admin-approvals-course-name"
            className="text-sm font-bold text-black"
          >
            {value}
          </span>
          <span
            data-cy="tna-admin-approvals-course-provider"
            className="text-xs text-black/45"
          >
            {record.trainingProvider || 'External training'}
          </span>
        </div>
      ),
    },
    {
      title: 'Employee',
      dataIndex: 'requestedBy',
      key: 'requestedBy',
      render: (value: string) => <EmployeeName userId={value} />,
    },
    {
      title: 'Cost',
      dataIndex: 'cost',
      key: 'cost',
      render: (value: number) => Number(value ?? 0).toLocaleString(),
    },
    {
      title: 'Requested',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (value: string) =>
        value ? dayjs(value).format(DATE_FORMAT) : '-',
    },
    {
      title: '',
      key: 'action',
      render: (unusedValue: unknown, record: ExternalTrainingRequest) => {
        void unusedValue;
        return (
          <Space>
            <Button
              type="primary"
              size="small"
              className="rounded-md border-[#1E40AF] bg-[#1E40AF]"
              onClick={() => {
                setActiveRequest(record);
                setOpenModal(stage);
              }}
              data-cy={`tna-admin-approvals-review-${record.id}`}
            >
              Review
            </Button>
            <Button
              size="small"
              type="link"
              className="!px-0 !text-[#1E40AF]"
              onClick={() =>
                router.push(`/tna/management/external/${record.id}`)
              }
              data-cy={`tna-admin-approvals-open-${record.id}`}
            >
              Open
            </Button>
          </Space>
        );
      },
    },
  ];

  const managerColumns = buildColumns('manager');
  const officerColumns = buildColumns('officer');

  return (
    <div className="flex flex-col gap-6" data-cy="tna-admin-approvals-tab">
      <section data-cy="tna-admin-approvals-manager-section">
        <h2
          data-cy="tna-admin-approvals-manager-title"
          className="m-0 mb-3 text-sm font-bold leading-[22px] text-black"
        >
          Awaiting my manager approval
        </h2>
        {isManagerLoading ? (
          <TableSkeleton columns={managerColumns} />
        ) : !managerQueue?.items?.length ? (
          <EmptyState
            compact
            title="Nothing awaiting your approval"
            description="Requests from your direct reports will appear here."
            data-cy="tna-admin-approvals-manager-empty"
          />
        ) : (
          <>
            <Table
              rowKey="id"
              columns={managerColumns}
              dataSource={managerQueue.items}
              pagination={false}
              scroll={{ x: 'max-content' }}
              data-cy="tna-admin-approvals-manager-table"
            />
            <CustomPagination
              current={managerPage}
              total={managerQueue?.meta?.totalItems ?? 0}
              pageSize={managerLimit}
              onChange={(nextPage, nextSize) => {
                setManagerPage(nextPage);
                if (nextSize) setManagerLimit(nextSize);
              }}
              onShowSizeChange={(size) => {
                setManagerLimit(size);
                setManagerPage(1);
              }}
              data-cy="tna-admin-approvals-manager-pagination"
            />
          </>
        )}
      </section>

      {canActAsOfficer ? (
        <section data-cy="tna-admin-approvals-officer-section">
          <h2
            data-cy="tna-admin-approvals-officer-title"
            className="m-0 mb-3 text-sm font-bold leading-[22px] text-black"
          >
            Awaiting TNA Officer approval
          </h2>
          {isOfficerLoading ? (
            <TableSkeleton columns={officerColumns} />
          ) : !officerQueue?.items?.length ? (
            <EmptyState
              compact
              title="No requests awaiting the TNA Officer"
              description="Manager-approved requests land here for payment confirmation."
              data-cy="tna-admin-approvals-officer-empty"
            />
          ) : (
            <>
              <Table
                rowKey="id"
                columns={officerColumns}
                dataSource={officerQueue.items}
                pagination={false}
                scroll={{ x: 'max-content' }}
                data-cy="tna-admin-approvals-officer-table"
              />
              <CustomPagination
                current={officerPage}
                total={officerQueue?.meta?.totalItems ?? 0}
                pageSize={officerLimit}
                onChange={(nextPage, nextSize) => {
                  setOfficerPage(nextPage);
                  if (nextSize) setOfficerLimit(nextSize);
                }}
                onShowSizeChange={(size) => {
                  setOfficerLimit(size);
                  setOfficerPage(1);
                }}
                data-cy="tna-admin-approvals-officer-pagination"
              />
            </>
          )}
        </section>
      ) : null}

      <ManagerDecisionModal
        open={openModal === 'manager'}
        request={activeRequest}
        onClose={() => setOpenModal(null)}
      />
      <TnaOfficerDecisionModal
        open={openModal === 'officer'}
        request={activeRequest}
        onClose={() => setOpenModal(null)}
      />
    </div>
  );
};

export default ApprovalsTab;
