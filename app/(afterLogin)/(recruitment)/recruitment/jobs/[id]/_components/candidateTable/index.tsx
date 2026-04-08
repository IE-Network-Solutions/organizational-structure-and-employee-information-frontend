import {
  useGetCandidates,
  useGetStages,
} from '@/store/server/features/recruitment/candidate/queries';
import {
  CandidateData,
  useCandidateState,
} from '@/store/uistate/features/recruitment/candidate';
import { Dropdown, Select, Table, TableColumnsType } from 'antd';
import dayjs from 'dayjs';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { BsThreeDots } from 'react-icons/bs';
import { MdOutlineFileDownload } from 'react-icons/md';
import {
  useChangeCandidateStatus,
  useDeleteCandidate,
} from '@/store/server/features/recruitment/candidate/mutation';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import EditCandidate from '../../../../_components/modals/editCandidate';
import MoveToTalentPool from '../../../../_components/modals/moveToTalentPool';
import { TableRowSelection } from 'antd/es/table/interface';
import { useIsMobile } from '@/hooks/useIsMobile';
import { CustomMobilePagination } from '@/components/customPagination/mobilePagination';
import RecruitmentPagination from '../../../../_components';
import DeleteModal from '@/components/common/deleteConfirmationModal';
import { TableSkeleton } from '@/components/tableSkeleton';

interface TableProps {
  jobId: string;
}

interface TriggerRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

const ViewDetailIcon = () => (
  <svg
    data-cy="talent-acquisition-candidate-table-view-icon"
    width="15"
    height="10"
    viewBox="0 0 15 10"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden
  >
    <path
      data-cy="talent-acquisition-candidate-table-view-icon-path"
      d="M7.33333 1.33333C9.86 1.33333 12.1133 2.75333 13.2133 5C12.1133 7.24667 9.86667 8.66667 7.33333 8.66667C4.8 8.66667 2.55333 7.24667 1.45333 5C2.55333 2.75333 4.80667 1.33333 7.33333 1.33333ZM7.33333 0C4 0 1.15333 2.07333 0 5C1.15333 7.92667 4 10 7.33333 10C10.6667 10 13.5133 7.92667 14.6667 5C13.5133 2.07333 10.6667 0 7.33333 0ZM7.33333 3.33333C8.25333 3.33333 9 4.08 9 5C9 5.92 8.25333 6.66667 7.33333 6.66667C6.41333 6.66667 5.66667 5.92 5.66667 5C5.66667 4.08 6.41333 3.33333 7.33333 3.33333ZM7.33333 2C5.68 2 4.33333 3.34667 4.33333 5C4.33333 6.65333 5.68 8 7.33333 8C8.98667 8 10.3333 6.65333 10.3333 5C10.3333 3.34667 8.98667 2 7.33333 2Z"
      fill="#323232"
    />
  </svg>
);

const EditIcon = () => (
  <svg
    data-cy="talent-acquisition-candidate-table-edit-icon"
    width="12"
    height="12"
    viewBox="0 0 12 12"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden
  >
    <path
      data-cy="talent-acquisition-candidate-table-edit-icon-path"
      d="M11.8067 2.69333C12.0667 2.43333 12.0667 2.01333 11.8067 1.75333L10.2467 0.193333C10.1133 0.06 9.94667 0 9.77333 0C9.6 0 9.43333 0.0666666 9.30667 0.193333L8.08667 1.41333L10.5867 3.91333L11.8067 2.69333V2.69333ZM0 9.5V12H2.5L9.87333 4.62667L7.37333 2.12667L0 9.5ZM1.94667 10.6667H1.33333V10.0533L7.37333 4.01333L7.98667 4.62667L1.94667 10.6667Z"
      fill="#323232"
    />
  </svg>
);

const DeleteIcon = () => (
  <svg
    data-cy="talent-acquisition-candidate-table-delete-icon"
    width="10"
    height="12"
    viewBox="0 0 10 12"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden
  >
    <path
      data-cy="talent-acquisition-candidate-table-delete-icon-path"
      d="M0.666667 10.6667C0.666667 11.4 1.26667 12 2 12H7.33333C8.06667 12 8.66667 11.4 8.66667 10.6667V2.66667H0.666667V10.6667ZM2 4H7.33333V10.6667H2V4ZM7 0.666667L6.33333 0H3L2.33333 0.666667H0V2H9.33333V0.666667H7Z"
      fill="#323232"
    />
  </svg>
);

const CandidateTable: React.FC<TableProps> = ({ jobId }) => {
  const { data: statusStage } = useGetStages();
  const { mutate: updateJobStatus } = useChangeCandidateStatus();
  const router = useRouter();
  const {
    currentPage,
    pageSize,
    searchParams,
    setCurrentPage,
    setPageSize,
    setSelectedCandidate,
    setSelectedCandidateID,
    setEditCandidateModal,
    setEditCandidate,
    setDeleteCandidateId,
    setMoveToTalentPoolModal,
    selectedRowKeys,
    setSelectedRowKeys,
  } = useCandidateState();

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteCandidateName, setDeleteCandidateName] = useState('');
  const [deleteTriggerRect, setDeleteTriggerRect] =
    useState<TriggerRect | null>(null);
  const { mutate: deleteCandidate } = useDeleteCandidate();

  const handleCandidateDetail = (candidate: any) => {
    router.push(`/recruitment/jobs/${jobId}/candidates/${candidate?.id}`);
  };
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

  const userId = useAuthenticationStore.getState().userId;

  const handleStageChange = (value: string, id: any) => {
    const selectedStage = statusStage?.items?.find(
      (stage: any) => stage.id === value,
    );

    if (selectedStage) {
      updateJobStatus({
        data: { applicantStatusStageId: selectedStage?.id, updatedBy: userId },
        id: id,
      });
    }
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
    // {
    //   title: 'Internal/External',
    //   dataIndex: 'internal_external',
    //   sorter: (a, b) => a.internal_external.localeCompare(b.internal_external),
    // },
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
      title: 'Stages',
      dataIndex: 'stages',
      align: 'center',
    },

    {
      title: 'Action',
      dataIndex: 'action',
      align: 'center',
    },
  ];

  const handleMenuClick = (key: string, candidate: any) => {
    if (key === 'moveToTalentPool') {
      setMoveToTalentPoolModal(true);
      setSelectedCandidate([candidate]);
    } else if (key === 'edit') {
      setEditCandidate(candidate);
      setSelectedCandidateID(candidate?.id);
      setEditCandidateModal(true);
    } else if (key === 'delete') {
      const btn = document.querySelector<HTMLElement>(
        `[data-cy="talent-acquisition-job-candidate-table-action-button-${candidate?.id}"]`,
      );
      if (btn) {
        const r = btn.getBoundingClientRect();
        setDeleteTriggerRect({
          top: r.top,
          left: r.left,
          width: r.width,
          height: r.height,
        });
      } else {
        setDeleteTriggerRect(null);
      }
      setSelectedCandidate(candidate);
      setDeleteCandidateId(candidate?.id);
      setDeleteCandidateName(candidate?.fullName ?? 'this candidate');
      setIsDeleteModalOpen(true);
    }
  };

  const handleConfirmDelete = () => {
    deleteCandidate(undefined, {
      onSuccess: () => setIsDeleteModalOpen(false),
    });
  };

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
      // internal_external:
      //   item?.jobCandidate?.isExternalApplicant === false
      //     ? 'External'
      //     : 'Internal',
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
      stages: selectedStage?.id ? (
        <div
          className="flex justify-center"
          data-cy={`talent-acquisition-job-candidate-table-stage-cell-${item?.id}`}
        >
          <Select
            id={`talent-acquisition-job-candidate-table-select-stage-${item?.id}`}
            data-cy={`talent-acquisition-job-candidate-table-select-stage-${item?.id}`}
            defaultValue={selectedStage.id}
            bordered={false}
            suffixIcon={null}
            className="ta-candidate-stage-select min-w-[96px] max-w-[140px] [&_.ant-select-selector]:!h-[24px] [&_.ant-select-selector]:!min-h-[24px] [&_.ant-select-selector]:!rounded-[4px] [&_.ant-select-selector]:!border [&_.ant-select-selector]:!border-solid [&_.ant-select-selector]:!border-[#91CAFF] [&_.ant-select-selector]:!bg-[#E6F4FF] [&_.ant-select-selector]:!px-2 [&_.ant-select-selection-item]:!text-[12px] [&_.ant-select-selection-item]:!font-normal [&_.ant-select-selection-item]:!leading-[24px] [&_.ant-select-selection-item]:!text-[#1677FF]"
            popupClassName="ta-candidate-stage-dropdown"
            onChange={(value) =>
              handleStageChange(
                value,
                item?.jobCandidate?.map((e: any) => e?.id),
              )
            }
          >
            {statusStage?.items?.map((stage: any) => (
              <Select.Option
                key={stage.id}
                value={stage.id}
                id={`talent-acquisition-job-candidate-table-option-stage-${stage.id}-${item?.id}`}
                data-cy={`talent-acquisition-job-candidate-table-option-stage-${stage.id}-${item?.id}`}
              >
                {stage.title}
              </Select.Option>
            ))}
          </Select>
        </div>
      ) : (
        '--'
      ),
      action: (
        <div
          id={`talent-acquisition-job-candidate-table-div-action-${item?.id}`}
          data-cy={`talent-acquisition-job-candidate-table-div-action-${item?.id}`}
          className="flex items-center justify-center"
        >
          <span
            data-cy={`talent-acquisition-job-candidate-table-dropdown-trigger-${item?.id}`}
          >
            <Dropdown
              data-cy={`talent-acquisition-job-candidate-table-dropdown-${item?.id}`}
              menu={{
                items: [
                  {
                    key: 'view',
                    label: (
                      <span
                        className="text-[14px] font-normal text-[rgba(0,0,0,0.7)]"
                        data-cy={`talent-acquisition-job-candidate-table-menu-view-${item?.id}`}
                      >
                        View Detail
                      </span>
                    ),
                    icon: <ViewDetailIcon />,
                    onClick: () => handleCandidateDetail(item),
                  },
                  {
                    key: 'edit',
                    label: (
                      <span
                        className="text-[14px] font-normal text-[rgba(0,0,0,0.7)]"
                        data-cy={`talent-acquisition-job-candidate-table-menu-edit-${item?.id}`}
                      >
                        Edit
                      </span>
                    ),
                    icon: <EditIcon />,
                    onClick: () => handleMenuClick('edit', item),
                  },
                  {
                    key: 'delete',
                    label: (
                      <span
                        className="text-[14px] font-normal text-[rgba(0,0,0,0.7)]"
                        data-cy={`talent-acquisition-job-candidate-table-menu-delete-${item?.id}`}
                      >
                        Delete
                      </span>
                    ),
                    icon: <DeleteIcon />,
                    onClick: () => handleMenuClick('delete', item),
                  },
                ],
              }}
              trigger={['click']}
              placement="bottomRight"
              overlayClassName="talent-acquisition-candidate-action-dropdown rounded-lg shadow-lg border border-gray-200"
            >
              <button
                type="button"
                className="flex h-8 w-8 cursor-pointer items-center justify-center rounded border border-solid border-[#D9D9D9] bg-white text-[rgba(0,0,0,0.45)] hover:border-[#1E40AF] hover:text-[#1E40AF]"
                aria-label="Actions"
                data-cy={`talent-acquisition-job-candidate-table-action-button-${item?.id}`}
              >
                <BsThreeDots className="text-base" />
              </button>
            </Dropdown>
          </span>
        </div>
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
          className="ta-job-detail-candidate-table w-full min-w-[960px] [&_.ant-table]:rounded-none [&_.ant-table-container]:!border-0 [&_.ant-table-cell]:!px-3 [&_.ant-table-cell]:!py-[11px] [&_.ant-table-thead>tr>th]:!border-b [&_.ant-table-thead>tr>th]:!border-[#F0F0F0] [&_.ant-table-thead>tr>th]:!bg-[#FAFAFA] [&_.ant-table-thead>tr>th]:!py-[10px] [&_.ant-table-thead>tr>th]:!text-[14px] [&_.ant-table-thead>tr>th]:!font-semibold [&_.ant-table-thead>tr>th]:!text-[rgba(0,0,0,0.65)] [&_.ant-table-tbody>tr>td]:!border-b [&_.ant-table-tbody>tr>td]:!border-[#F5F5F5] [&_.ant-table-tbody>tr>td.ant-table-cell-fix-left]:!bg-inherit [&_.ant-table-tbody>tr>td.ant-table-cell-fix-left-last]:!bg-inherit [&_.ant-table-tbody>tr.ant-table-row-selected>td]:!bg-inherit [&_.ant-table-tbody>tr.ant-table-row-selected:hover>td]:!bg-inherit"
          columns={columns}
          dataSource={data}
          scroll={{ x: 'max-content' }}
          rowSelection={rowSelection}
          pagination={false}
          rowClassName={(record, index) => {
            void record;
            return index % 2 === 1 ? '!bg-[#F9FAFB]' : '!bg-white';
          }}
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
      <EditCandidate jobId={jobId} />
      <MoveToTalentPool />
      <DeleteModal
        open={isDeleteModalOpen}
        onCancel={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        onAfterClose={() => setDeleteTriggerRect(null)}
        title="Delete Candidate"
        deleteMessage={`Are you sure you want to delete ${deleteCandidateName} from candidates?`}
        hideImage
        danger
        triggerRect={deleteTriggerRect ?? undefined}
        data-cy="talent-acquisition-candidate-delete-modal"
      />
    </div>
  );
};

export default CandidateTable;
