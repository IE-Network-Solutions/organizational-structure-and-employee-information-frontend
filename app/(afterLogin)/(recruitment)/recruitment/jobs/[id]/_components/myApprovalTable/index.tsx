import { useGetCandidates } from '@/store/server/features/recruitment/candidate/queries';
import {
  CandidateData,
  useCandidateState,
} from '@/store/uistate/features/recruitment/candidate';
import { Table, TableColumnsType, Tag } from 'antd';
import dayjs from 'dayjs';
import { MdOutlineFileDownload } from 'react-icons/md';
import { TableRowSelection } from 'antd/es/table/interface';
import { useIsMobile } from '@/hooks/useIsMobile';
import { CustomMobilePagination } from '@/components/customPagination/mobilePagination';
import RecruitmentPagination from '../../../../_components';
import { TableSkeleton } from '@/components/tableSkeleton';
import StageApprovalModal from '../stageApprovalModal';

interface TableProps {
  jobId: string;
}

const MyApprovalTable: React.FC<TableProps> = ({ jobId }) => {
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
  } = useCandidateState();

  const { isMobile, isTablet } = useIsMobile();

  const { data: candidateList, isLoading: isResponseLoading } =
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
  const onPageChange = (page: number, pageSize?: number) => {
    setCurrentPage(page);
    if (pageSize) {
      setPageSize(pageSize);
    }
  };

  function resolveApprovalWorkflowId(item: any) {
    return (
      item?.approvalWorkflowId ??
      item?.jobCandidate?.[0]?.approvalWorkflowId ??
      item?.jobCandidate?.[0]?.jobInformation?.approvalWorkflowId ??
      null
    );
  }

  const handleOpenStageApproval = (item: any) => {
    if (!item?.id) return;
    setStageApprovalCandidateId(item.id);
    setStageApprovalWorkflowId(resolveApprovalWorkflowId(item));
    setStageApprovalCandidate(item);
    setIsShowStageApprovalModal(true);
  };
  const columns: TableColumnsType<CandidateData> = [
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
            data-cy="talent-acquisition-job-candidate-table-email-link"
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

  const data = candidateList?.items?.map((item: any, index: any) => {
    const selectedStage = item?.jobCandidate?.[0]?.applicantStatusStage;

    const handleDownload = () => {
      const link = document.createElement('a');
      link.href = item?.resumeUrl;
      link.download = item?.documentName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };

    return {
      key: index,
      id: item?.id,
      candidateName: item?.fullName ?? '--',
      phoneNumber: item?.phone ?? '--',
      cgpa: item?.CGPA ?? '--',
      email: item?.email ?? '--',
      cv: (
        <div
          id={`talent-acquisition-job-candidate-table-div-cv-${item?.id}`}
          data-cy={`talent-acquisition-job-candidate-table-div-cv-${item?.id}`}
          className={`flex items-center justify-center ${item?.resumeUrl ? '' : 'opacity-40'}`}
        >
          <button
            type="button"
            id={`talent-acquisition-job-candidate-table-button-download-cv-${item?.id}`}
            data-cy={`talent-acquisition-job-candidate-table-button-download-cv-${item?.id}`}
            className="flex h-9 w-9 items-center justify-center rounded border-0 bg-transparent text-[#1E40AF] hover:bg-[#EFF6FF] disabled:pointer-events-none"
            disabled={!item?.resumeUrl}
            aria-label={
              item?.documentName
                ? `Download ${item.documentName}`
                : 'Download CV'
            }
            onClick={handleDownload}
          >
            <MdOutlineFileDownload size={22} className="text-[#1E40AF]" />
          </button>
        </div>
      ),
      createdAt: dayjs(item?.createdAt).format('DD MMMM YYYY') ?? '--',
      approvalStatus: selectedStage?.id ? (
        <Tag color="blue">{selectedStage?.title}</Tag>
      ) : (
        '--'
      ),
    };
  });

  const rowSelection: TableRowSelection<CandidateData> = {
    selectedRowKeys,
    onChange: (newSelectedRowKeys, selectedRows) => {
      setSelectedRowKeys(newSelectedRowKeys);
      setSelectedCandidate(
        candidateList?.items?.filter((item: CandidateData) =>
          selectedRows.some((row: CandidateData) => row.id === item.id),
        ) || [],
      );
    },
  };
  const onSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };
  return (
    <div
      id="talent-acquisition-job-candidate-table-div-container"
      data-cy="talent-acquisition-job-candidate-table-div-container"
      className="min-w-0 overflow-x-auto"
    >
      <style data-cy="talent-acquisition-job-candidate-action-dropdown-styles">{`
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
          data-cy="talent-acquisition-job-candidate-table-skeleton"
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
                handleOpenStageApproval(record.rawItem ?? record);
              }
            },
          })}
          data-cy="talent-acquisition-job-candidate-table"
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
          data-cy="talent-acquisition-candidate-table-pagination"
        />
      )}
      <StageApprovalModal />
    </div>
  );
};

export default MyApprovalTable;
