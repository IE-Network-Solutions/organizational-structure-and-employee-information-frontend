import {
  useGetCandidates,
  useGetStages,
} from '@/store/server/features/recruitment/candidate/queries';
import {
  CandidateData,
  useCandidateState,
} from '@/store/uistate/features/recruitment/candidate';
import {
  Button,
  Dropdown,
  Select,
  Table,
  TableColumnsType,
  Popover,
} from 'antd';
import dayjs from 'dayjs';
import React, { useState } from 'react';
import { FaEye, FaTrashAlt } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import { FaEllipsisVertical } from 'react-icons/fa6';
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

interface TableProps {
  jobId: string;
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

  const [deletePopoverCandidateId, setDeletePopoverCandidateId] = useState<
    string | null
  >(null);
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
      title: 'Phone Number',
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
            className="text-blue-600 hover:underline"
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
    },

    {
      title: 'Action',
      dataIndex: 'action',
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
      setSelectedCandidate(candidate);
      setDeleteCandidateId(candidate?.id);
      setDeletePopoverCandidateId(candidate?.id);
    }
  };

  const handleConfirmDelete = () => {
    deleteCandidate(undefined, {
      onSuccess: () => setDeletePopoverCandidateId(null),
    });
  };

  const data = candidateList?.items?.map((item: any, index: any) => {
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
          className="flex items-center justify-between "
        >
          <span
            className="text-xs font-semibold cursor-pointer"
            title={item?.documentName ?? 'CV.pdf'}
            data-cy={`talent-acquisition-job-candidate-table-cv-filename-${item?.id}`}
          >
            {item?.documentName?.length > 8
              ? `${item.documentName.slice(0, 8)}...`
              : (item?.documentName ?? 'CV.pdf')}{' '}
          </span>
          <div
            id={`talent-acquisition-job-candidate-table-button-download-cv-${item?.id}`}
            data-cy={`talent-acquisition-job-candidate-table-button-download-cv-${item?.id}`}
            className="cursor-pointer"
            onClick={handleDownload}
          >
            <MdOutlineFileDownload size={20} />
          </div>
        </div>
      ),
      createdAt: dayjs(item?.createdAt).format('DD MMMM YYYY') ?? '--',
      stages: (
        <Select
          id={`talent-acquisition-job-candidate-table-select-stage-${item?.id}`}
          data-cy={`talent-acquisition-job-candidate-table-select-stage-${item?.id}`}
          defaultValue={item?.jobCandidate?.map(
            (e: any) => e?.applicantStatusStage?.title ?? '--',
          )}
          style={{ width: 120 }}
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
      ),
      action: (
        <div
          id={`talent-acquisition-job-candidate-table-div-action-${item?.id}`}
          data-cy={`talent-acquisition-job-candidate-table-div-action-${item?.id}`}
          className="flex items-center justify-end"
        >
          <Popover
            open={deletePopoverCandidateId === item?.id}
            onOpenChange={(open) => !open && setDeletePopoverCandidateId(null)}
            placement="bottomRight"
            trigger={[]}
            content={
              <div
                id="candidate-delete-popover"
                className="w-72 p-1"
                data-cy="talent-acquisition-candidate-delete-popover"
              >
                <p
                  className="text-gray-700 text-sm mb-4"
                  data-cy="talent-acquisition-candidate-delete-popover-message"
                >
                  Are you sure you want to delete{' '}
                  <span
                    className="font-semibold"
                    data-cy="talent-acquisition-candidate-delete-popover-candidate-name"
                  >
                    {item?.fullName ?? 'this candidate'}
                  </span>{' '}
                  from candidates?
                </p>
                <div
                  className="flex justify-end gap-2"
                  data-cy="talent-acquisition-candidate-delete-popover-actions"
                >
                  <Button
                    size="small"
                    onClick={() => setDeletePopoverCandidateId(null)}
                    data-cy="talent-acquisition-candidate-delete-popover-cancel"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="primary"
                    danger
                    size="small"
                    onClick={handleConfirmDelete}
                    data-cy="talent-acquisition-candidate-delete-popover-confirm"
                  >
                    Delete
                  </Button>
                </div>
              </div>
            }
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
                  className="flex items-center justify-center w-8 h-8 rounded text-gray-500 hover:bg-gray-100 border-0 bg-transparent cursor-pointer"
                  aria-label="Actions"
                  data-cy={`talent-acquisition-job-candidate-table-action-button-${item?.id}`}
                >
                  <FaEllipsisVertical className="text-lg" />
                </button>
              </Dropdown>
            </span>
          </Popover>
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
    >
      <Table
        className="w-full"
        columns={columns}
        dataSource={data}
        loading={isResponseLoading}
        scroll={{ x: 1000 }}
        rowSelection={rowSelection}
        pagination={false}
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
          data-cy="talent-acquisition-candidate-table-pagination"
        />
      )}
      <EditCandidate />
      <MoveToTalentPool />
    </div>
  );
};

export default CandidateTable;
