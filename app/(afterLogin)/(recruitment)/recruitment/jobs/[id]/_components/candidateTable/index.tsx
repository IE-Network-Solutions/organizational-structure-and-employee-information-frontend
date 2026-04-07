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
import { FaEye, FaTrashAlt } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import { BsThreeDots } from 'react-icons/bs';
import { MdOutlineFileDownload, MdModeEdit } from 'react-icons/md';
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
import CustomPagination from '@/components/customPagination';
import DeleteModal from '@/components/common/deleteConfirmationModal';

interface TableProps {
  jobId: string;
}

interface TriggerRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

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
                    label: 'View Detail',
                    icon: <FaEye className="text-gray-500 text-sm" />,
                    onClick: () => handleCandidateDetail(item),
                  },
                  {
                    key: 'edit',
                    label: 'Edit',
                    icon: <MdModeEdit className="text-gray-500 text-sm" />,
                    onClick: () => handleMenuClick('edit', item),
                  },
                  {
                    key: 'delete',
                    label: 'Delete',
                    icon: <FaTrashAlt className="text-gray-500 text-sm" />,
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
      <Table
        className="ta-job-detail-candidate-table w-full min-w-[960px] [&_.ant-table]:rounded-none [&_.ant-table-container]:!border-0 [&_.ant-table-cell]:!px-3 [&_.ant-table-cell]:!py-[11px] [&_.ant-table-thead>tr>th]:!border-b [&_.ant-table-thead>tr>th]:!border-[#F0F0F0] [&_.ant-table-thead>tr>th]:!bg-[#FAFAFA] [&_.ant-table-thead>tr>th]:!py-[10px] [&_.ant-table-thead>tr>th]:!text-[14px] [&_.ant-table-thead>tr>th]:!font-semibold [&_.ant-table-thead>tr>th]:!text-[rgba(0,0,0,0.65)] [&_.ant-table-tbody>tr>td]:!border-b [&_.ant-table-tbody>tr>td]:!border-[#F5F5F5] [&_.ant-table-tbody>tr>td.ant-table-cell-fix-left]:!bg-inherit [&_.ant-table-tbody>tr>td.ant-table-cell-fix-left-last]:!bg-inherit"
        columns={columns}
        dataSource={data}
        loading={isResponseLoading}
        scroll={{ x: 'max-content', y: 480 }}
        rowSelection={rowSelection}
        pagination={false}
        rowClassName={(record, index) => {
          void record;
          return index % 2 === 1 ? '!bg-[#F9FAFB]' : '!bg-white';
        }}
        data-cy="talent-acquisition-job-candidate-table"
      />

      {isMobile || isTablet ? (
        <CustomMobilePagination
          totalResults={candidateList?.meta?.totalItems ?? 1}
          pageSize={pageSize}
          onChange={onPageChange}
          onShowSizeChange={onPageChange}
        />
      ) : (
        <CustomPagination
          id="talent-acquisition-candidate-table-pagination"
          current={currentPage}
          total={candidateList?.meta?.totalItems ?? 1}
          pageSize={pageSize}
          onChange={onPageChange}
          onShowSizeChange={onSizeChange}
          showGoToPage
          activePageButtonClassName="!border !border-[#1E40AF] !bg-[#1E40AF] !text-white hover:!bg-[#1D4ED8] hover:!border-[#1D4ED8]"
          data-cy="talent-acquisition-candidate-table-pagination"
        />
      )}
      <EditCandidate />
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
