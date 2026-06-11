import { useGetCandidates } from '@/store/server/features/recruitment/candidate/queries';
import { useCandidateState } from '@/store/uistate/features/recruitment/candidate';
import { Table, TableColumnsType, Tag } from 'antd';
import dayjs from 'dayjs';
import { MdOutlineFileDownload } from 'react-icons/md';
import { TableRowSelection } from 'antd/es/table/interface';
import { useIsMobile } from '@/hooks/useIsMobile';
import { CustomMobilePagination } from '@/components/customPagination/mobilePagination';
import RecruitmentPagination from '../../../../_components';
import { TableSkeleton } from '@/components/tableSkeleton';
import StageApprovalModal from '../stageApprovalModal';
import { useApprovalFilter } from '@/store/server/features/approver/queries';
import { APPROVALTYPES } from '@/types/enumTypes';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import {
  useCandidateApprovalRequests,
  useCandidatePendingApprovals,
} from '@/store/server/features/recruitment/candidateApproval/queries';
import React, { useMemo } from 'react';

interface TableProps {
  jobId: string;
  departmentId?: string;
}

type ApprovalTableRow = {
  key: string;
  id?: string;
  candidateName: string;
  phoneNumber: string;
  cgpa: string | number;
  email: string;
  cv: React.ReactNode;
  createdAt: string;
  approvalStatus: React.ReactNode;
  rawItem: any;
};

const buildRequestKey = (
  candidateId?: string,
  applicantStatusStageId?: string,
) => `${candidateId ?? ''}|${applicantStatusStageId ?? ''}`;

const MyApprovalTable: React.FC<TableProps> = ({ jobId, departmentId }) => {
  const {
    currentPage,
    pageSize,
    searchParams,
    setCurrentPage,
    setPageSize,
    setSelectedCandidate,
    selectedRowKeys,
    setSelectedRowKeys,
    setIsShowStageApprovalModal,
    setStageApprovalCandidateId,
    setStageApprovalWorkflowId,
    setStageApprovalCandidate,
    setStageApprovalRows,
  } = useCandidateState();

  const { isMobile, isTablet } = useIsMobile();
  const userId = useAuthenticationStore((state) => state.userId);

  const { data: approvalData, isLoading: isWorkflowLoading } =
    useApprovalFilter(
      100,
      1,
      'Department',
      departmentId ?? '',
      '',
      APPROVALTYPES.CANDIDATE,
    );

  const approvalWorkflow = useMemo(() => {
    if (!departmentId) return null;
    const workflows = approvalData?.items ?? [];
    return workflows.find(
      (workflow: any) =>
        workflow?.entityId === departmentId &&
        (workflow?.approvers ?? []).some(
          (approver: any) => approver?.userId === userId,
        ),
    );
  }, [approvalData?.items, departmentId, userId]);

  const approvalWorkflowId = approvalWorkflow?.id ?? '';
  const loggedInApprover = useMemo(
    () =>
      (approvalWorkflow?.approvers ?? []).find(
        (approver: any) => approver?.userId === userId,
      ),
    [approvalWorkflow?.approvers, userId],
  );
  const isFirstApprover = loggedInApprover?.stepOrder === 1;

  const { data: candidateList, isLoading: isCandidateLoading } =
    useGetCandidates(
      jobId,
      searchParams?.whatYouNeed || '',
      searchParams?.dateRange || '',
      searchParams?.selectedJob || '',
      searchParams?.selectedStage || '',
      searchParams?.selectedDepartment || '',
      pageSize,
      currentPage,
    );

  const { data: existingRequests, isLoading: isRequestsLoading } =
    useCandidateApprovalRequests(
      {
        jobId,
        approvalWorkflowId,
      },
      !!approvalWorkflowId,
    );

  const { data: pendingApprovals, isLoading: isPendingLoading } =
    useCandidatePendingApprovals(
      jobId,
      approvalWorkflowId,
      !!approvalWorkflowId,
    );

  const onPageChange = (page: number, pageSize?: number) => {
    setCurrentPage(page);
    if (pageSize) {
      setPageSize(pageSize);
    }
  };

  const candidateById = useMemo(() => {
    const map = new Map<string, any>();
    (candidateList?.items ?? []).forEach((candidate: any) => {
      if (candidate?.id) map.set(candidate.id, candidate);
    });
    return map;
  }, [candidateList?.items]);

  const requestByCandidateStage = useMemo(() => {
    const map = new Map<string, any>();
    (existingRequests?.items ?? []).forEach((request: any) => {
      map.set(
        buildRequestKey(request?.candidateId, request?.applicantStatusStageId),
        request,
      );
    });
    return map;
  }, [existingRequests?.items]);

  const pendingByRequestId = useMemo(() => {
    const map = new Map<string, any>();
    (pendingApprovals?.items ?? []).forEach((request: any) => {
      const requestId = request?.id ?? request?.requestId;
      if (requestId) map.set(requestId, request);
    });
    return map;
  }, [pendingApprovals?.items]);

  const approvalRows = useMemo(() => {
    if (!approvalWorkflowId) return [];

    const pendingRows = Array.from(pendingByRequestId.values()).map(
      (request: any) => {
        const candidate = candidateById.get(request?.candidateId);
        const jobCandidate = candidate?.jobCandidate?.[0];
        const stage = jobCandidate?.applicantStatusStage;
        return {
          ...candidate,
          ...request,
          candidateId: request?.candidateId,
          requestId: request?.id ?? request?.requestId,
          approvalWorkflowId: request?.approvalWorkflowId ?? approvalWorkflowId,
          approvers: approvalWorkflow?.approvers ?? [],
          jobId: request?.jobId ?? jobId,
          jobCandidateId: jobCandidate?.id,
          currentStageId:
            request?.applicantStatusStageId ??
            jobCandidate?.applicantStatusStageId,
          currentStageTitle: stage?.title ?? '',
          isInitiated: true,
          displayCandidate: candidate,
        };
      },
    );

    const uninitiatedRows = isFirstApprover
      ? (candidateList?.items ?? [])
          .map((candidate: any) => {
            const jobCandidate = candidate?.jobCandidate?.[0];
            const currentStageId = jobCandidate?.applicantStatusStageId;
            if (!currentStageId) return null;

            const existingRequest = requestByCandidateStage.get(
              buildRequestKey(candidate?.id, currentStageId),
            );
            if (existingRequest) return null;

            return {
              ...candidate,
              candidateId: candidate?.id,
              requestId: null,
              approvalWorkflowId,
              approvers: approvalWorkflow?.approvers ?? [],
              jobId,
              jobCandidateId: jobCandidate?.id,
              currentStageId,
              currentStageTitle:
                jobCandidate?.applicantStatusStage?.title ?? '',
              isInitiated: false,
              displayCandidate: candidate,
            };
          })
          .filter(Boolean)
      : [];

    return [...pendingRows, ...uninitiatedRows];
  }, [
    approvalWorkflowId,
    approvalWorkflow?.approvers,
    candidateById,
    candidateList?.items,
    isFirstApprover,
    jobId,
    pendingByRequestId,
    requestByCandidateStage,
  ]);

  const handleOpenStageApproval = (item: any) => {
    if (!item?.candidateId) return;
    setStageApprovalCandidateId(item.candidateId);
    setStageApprovalWorkflowId(item.approvalWorkflowId);
    setStageApprovalCandidate(item.displayCandidate ?? item);
    setStageApprovalRows([item]);
    setIsShowStageApprovalModal(true);
  };

  const columns: TableColumnsType<ApprovalTableRow> = [
    {
      title: 'Name',
      dataIndex: 'candidateName',
      sorter: (a, b) => a.candidateName.localeCompare(b.candidateName),
    },
    {
      title: 'Phone',
      dataIndex: 'phoneNumber',
      ellipsis: true,
    },
    {
      title: 'CGPA',
      dataIndex: 'cgpa',
      sorter: (a: any, b: any) => a.cgpa - b.cgpa,
    },

    {
      title: 'CV',
      dataIndex: 'cv',
      align: 'center',
    },
    {
      title: 'Applied/Created Date',
      dataIndex: 'createdAt',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      ellipsis: true,
      render: (val: string) =>
        val ? (
          <a
            href={`mailto:${val}`}
            className="text-[#1E40AF] hover:underline"
            data-cy="talent-acquisition-my-approval-table-email-link"
          >
            {val}
          </a>
        ) : (
          '—'
        ),
    },
    {
      title: 'Approval Status',
      dataIndex: 'approvalStatus',
      align: 'center',
    },
  ];

  const data: ApprovalTableRow[] = approvalRows.map(
    (item: any, index: number) => {
      const candidate = item?.displayCandidate ?? item;
      const selectedStage = candidate?.jobCandidate?.[0]?.applicantStatusStage;

      const handleDownload = () => {
        const link = document.createElement('a');
        link.href = candidate?.resumeUrl;
        link.download = candidate?.documentName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      };

      return {
        key: item?.requestId ?? item?.candidateId ?? String(index),
        id: item?.candidateId,
        candidateName: candidate?.fullName ?? item?.candidateId ?? '--',
        phoneNumber: candidate?.phone ?? '--',
        cgpa: candidate?.CGPA ?? '--',
        email: candidate?.email ?? '--',
        cv: (
          <div
            id={`talent-acquisition-my-approval-table-div-cv-${item?.candidateId}`}
            data-cy={`talent-acquisition-my-approval-table-div-cv-${item?.candidateId}`}
            className={`flex items-center justify-center ${candidate?.resumeUrl ? '' : 'opacity-40'}`}
          >
            <button
              type="button"
              id={`talent-acquisition-my-approval-table-button-download-cv-${item?.candidateId}`}
              data-cy={`talent-acquisition-my-approval-table-button-download-cv-${item?.candidateId}`}
              className="flex h-9 w-9 items-center justify-center rounded border-0 bg-transparent text-[#1E40AF] hover:bg-[#EFF6FF] disabled:pointer-events-none"
              disabled={!candidate?.resumeUrl}
              aria-label={
                candidate?.documentName
                  ? `Download ${candidate.documentName}`
                  : 'Download CV'
              }
              onClick={handleDownload}
            >
              <MdOutlineFileDownload size={22} className="text-[#1E40AF]" />
            </button>
          </div>
        ),
        createdAt: candidate?.createdAt
          ? dayjs(candidate.createdAt).format('DD MMMM YYYY')
          : '--',
        approvalStatus: (
          <div
            className="flex justify-center gap-2"
            data-cy={`talent-acquisition-my-approval-table-div-approval-status-${item?.candidateId}`}
          >
            <Tag
              color={item?.isInitiated ? 'gold' : 'blue'}
              data-cy={`talent-acquisition-my-approval-table-tag-approval-status-${item?.candidateId}`}
            >
              {item?.isInitiated ? 'Pending approval' : 'Ready to initiate'}
            </Tag>
            {selectedStage?.title && (
              <Tag
                color="blue"
                data-cy={`talent-acquisition-my-approval-table-tag-selected-stage-${item?.candidateId}`}
              >
                {selectedStage.title}
              </Tag>
            )}
          </div>
        ),
        rawItem: item,
      };
    },
  );

  const rowSelection: TableRowSelection<ApprovalTableRow> = {
    selectedRowKeys,
    onChange: (newSelectedRowKeys, selectedRows) => {
      setSelectedRowKeys(newSelectedRowKeys);
      setSelectedCandidate(selectedRows.map((row) => row.rawItem));
    },
  };

  const onSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  const isResponseLoading =
    isWorkflowLoading ||
    isCandidateLoading ||
    isRequestsLoading ||
    isPendingLoading;

  return (
    <div
      id="talent-acquisition-my-approval-table-div-container"
      data-cy="talent-acquisition-my-approval-table-div-container"
      className="min-w-0 overflow-x-auto"
    >
      <style data-cy="talent-acquisition-my-approval-action-dropdown-styles">{`
          .talent-acquisition-candidate-action-dropdown .ant-dropdown-menu-item {
            display: flex;
            align-items: center;
            gap: 8px;
          }
          .talent-acquisition-candidate-action-dropdown .ant-dropdown-menu-title-content {
            margin-inline-start: 0 !important;
          }
        `}</style>
      {isResponseLoading ? (
        <div
          className="ta-job-detail-candidate-table-skeleton w-full min-w-[960px]"
          data-cy="talent-acquisition-my-approval-table-skeleton"
        >
          <TableSkeleton columns={columns} />
        </div>
      ) : (
        <Table
          columns={columns}
          dataSource={data}
          scroll={{ x: 'max-content' }}
          rowSelection={rowSelection}
          pagination={false}
          rowClassName={(record, index) => {
            void record;
            return index % 2 === 1 ? '!bg-[#F9FAFB]' : '!bg-white';
          }}
          onRow={(record: any) => ({
            onClick: (e) => {
              const target = e.target as HTMLElement;
              if (
                record?.id &&
                !target.closest('.ant-checkbox') &&
                !target.closest('.ant-checkbox-wrapper') &&
                !target.closest('button') &&
                !target.closest('.ant-dropdown') &&
                !target.closest('a')
              ) {
                handleOpenStageApproval(record.rawItem);
              }
            },
          })}
          locale={{
            emptyText: approvalWorkflowId
              ? 'No candidate approvals assigned to you for this job.'
              : 'No candidate approval workflow assigned to you for this job.',
          }}
          data-cy="talent-acquisition-my-approval-table"
        />
      )}

      {isMobile || isTablet ? (
        <CustomMobilePagination
          totalResults={candidateList?.meta?.totalItems ?? 1}
          pageSize={pageSize}
          onChange={onPageChange}
          onShowSizeChange={onPageChange}
        />
      ) : (
        <RecruitmentPagination
          current={currentPage}
          total={candidateList?.meta?.totalItems ?? 1}
          pageSize={pageSize}
          onChange={(page, size) => {
            setCurrentPage(page);
            setPageSize(size);
          }}
          onShowSizeChange={onSizeChange}
          data-cy="talent-acquisition-my-approval-table-pagination"
        />
      )}
      <StageApprovalModal />
    </div>
  );
};

export default MyApprovalTable;
