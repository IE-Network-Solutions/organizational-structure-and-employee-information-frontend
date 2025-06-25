import {
  useGetCandidates,
  useGetStages,
} from '@/store/server/features/recruitment/candidate/queries';
import {
  CandidateData,
  useCandidateState,
} from '@/store/uistate/features/recruitment/candidate';
import { Button, Dropdown, Select, Table, TableColumnsType } from 'antd';
import dayjs from 'dayjs';
import React from 'react';
import { FaEye } from 'react-icons/fa';
import CandidateDetail from '../candidateDetail/page';
import { FaEllipsisVertical } from 'react-icons/fa6';
import { IoIosArrowForward } from 'react-icons/io';
import { FileDown } from 'lucide-react';
import { useChangeCandidateStatus } from '@/store/server/features/recruitment/candidate/mutation';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import DeleteCandidate from '../../../../_components/modals/deleteCandidate';
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

  const {
    currentPage,
    pageSize,
    searchParams,
    setCurrentPage,
    setPageSize,
    setCandidateDetailDrawer,
    setSelectedCandidate,
    setSelectedCandidateID,
    setEditCandidateModal,
    setEditCandidate,
    setDeleteCandidateId,
    setDeleteCandidateModal,
    setMoveToTalentPoolModal,
  } = useCandidateState();

  const handleCandidateDetail = (candidate: any) => {
    setSelectedCandidate(candidate);
    setSelectedCandidateID(candidate?.id);
    setCandidateDetailDrawer(true);
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
    {
      title: 'Internal/External',
      dataIndex: 'internal_external',
      sorter: (a, b) => a.internal_external.localeCompare(b.internal_external),
    },
    {
      title: 'CV',
      dataIndex: 'cv',
    },
    {
      title: 'Created Date',
      dataIndex: 'createdAt',
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
    } else if (key === 'edit') {
      setEditCandidate(candidate);
      setSelectedCandidateID(candidate?.id);
      setEditCandidateModal(true);
    } else if (key === 'delete') {
      setDeleteCandidateId(candidate?.id);
      setDeleteCandidateModal(true);
    }
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
      candidateName: item?.fullName ?? '--',
      phoneNumber: item?.phone ?? '--',
      cgpa: item?.CGPA ?? '--',
      internal_external:
        item?.jobCandidate?.isExternalApplicant === false
          ? 'External'
          : 'Internal',
      cv: (
        <div className="flex items-center justify-between ">
          <span
            className="text-xs font-semibold cursor-pointer"
            title={item?.documentName ?? 'CV.pdf'}
          >
            {item?.documentName?.length > 8
              ? `${item.documentName.slice(0, 8)}...`
              : (item?.documentName ?? 'CV.pdf')}{' '}
          </span>
          <div className="cursor-pointer" onClick={handleDownload}>
            <FileDown size={20} strokeWidth={1.25} />
          </div>
        </div>
      ),
      createdAt: dayjs(item?.createdAt).format('DD MMMM YYYY') ?? '--',
      stages: (
        <Select
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
            <Select.Option key={stage.id} value={stage.id}>
              {stage.title}
            </Select.Option>
          ))}
        </Select>
      ),
      action: (
        <div className="flex items-center justify-between gap-4 text-white">
          <Button
            id={`editUserButton${item?.id}`}
            disabled={item?.deletedAt !== null}
            className="bg-primary px-[10px]  text-white disabled:bg-gray-400 "
            onClick={() => handleCandidateDetail(item)}
          >
            <FaEye />
          </Button>
          <Dropdown
            menu={{
              items: [
                {
                  key: 'moveToTalentPool',
                  label: (
                    <div className="text-primary font-normal text-sm flex items-center justify-start gap-1">
                      Move to Talent Pool
                      <IoIosArrowForward size={12} />
                    </div>
                  ),
                  onClick: () => handleMenuClick('moveToTalentPool', item),
                },
                {
                  key: 'edit',
                  label: 'Edit',
                  onClick: () => handleMenuClick('edit', item),
                },
                {
                  key: 'delete',
                  label: 'Delete',
                  onClick: () => handleMenuClick('delete', item),
                },
              ],
            }}
            trigger={['click']}
            placement="bottomRight"
          >
            <FaEllipsisVertical className="text-lg text-gray-400 cursor-pointer" />
          </Dropdown>
        </div>
      ),
    };
  });

  const rowSelection: TableRowSelection<CandidateData> = {
    onChange: (nonused, selectedRows) => {
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
    <div>
      <Table
        className="w-full"
        columns={columns}
        dataSource={data}
        loading={isResponseLoading}
        scroll={{ x: 1000 }}
        rowSelection={rowSelection}
        pagination={false}
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
          current={currentPage}
          total={candidateList?.meta?.totalItems ?? 1}
          pageSize={pageSize}
          onChange={onPageChange}
          onShowSizeChange={onSizeChange}
        />
      )}
      <DeleteCandidate />
      <EditCandidate />
      <MoveToTalentPool />
      <CandidateDetail />
    </div>
  );
};

export default CandidateTable;
