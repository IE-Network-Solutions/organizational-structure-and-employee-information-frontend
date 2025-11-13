import {
  useGetAllCandidates,
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
import { FaEllipsisVertical } from 'react-icons/fa6';
import CandidateDetail from '../../../jobs/[id]/_components/candidateDetail/page';
import DeleteCandidate from '../../../_components/modals/deleteCandidate';
import EditCandidate from '../../../_components/modals/editCandidate';
import MoveToTalentPool from '../../../_components/modals/moveToTalentPool';
import { useChangeCandidateStatus } from '@/store/server/features/recruitment/candidate/mutation';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
import { SiGmail } from 'react-icons/si';
import { TableRowSelection } from 'antd/es/table/interface';
import { CustomMobilePagination } from '@/components/customPagination/mobilePagination';
import { useIsMobile } from '@/hooks/useIsMobile';
import CustomPagination from '@/components/customPagination';

const AllCandidateTable: React.FC = () => {
  const { data: statusStage } = useGetStages();
  const { mutate: updateJobStatus } = useChangeCandidateStatus();

  const userId = useAuthenticationStore.getState().userId;

  const { isMobile, isTablet } = useIsMobile();

  const handleStageChange = (value: string, id: any) => {
    const selectedStage = statusStage?.items?.find(
      (stage: any) => stage.id === value,
    );

    if (selectedStage) {
      updateJobStatus({
        data: { applicantStatusStageId: selectedStage?.id, updatedBy: userId },
        id: id[0],
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
    //   title: 'Internal/ External',
    //   dataIndex: 'internal_external',
    //   sorter: (a, b) => a.internal_external.localeCompare(b.internal_external),
    // },
    {
      title: 'CV',
      dataIndex: 'cv',
    },
    {
      title: 'Applied/ Created Date',
      dataIndex: 'createdAt',
    },
    {
      title: 'Date of Graduation',
      dataIndex: 'graduateYear',
    },

    {
      title: 'Email',
      dataIndex: 'LinkedInURL',
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
    selectedRowKeys,
    setSelectedRowKeys,
  } = useCandidateState();

  const { data: candidateList, isLoading: isResponseLoading } =
    useGetAllCandidates(
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

  const handleMenuClick = (key: string, candidate: any) => {
    if (key === 'edit') {
      setEditCandidate(candidate);
      setEditCandidateModal(true);
      setSelectedCandidateID(candidate?.id);
    } else if (key === 'delete') {
      setDeleteCandidateId(candidate?.id);
      setDeleteCandidateModal(true);
    }
  };

  const handleCandidateDetail = (candidate: any) => {
    setSelectedCandidate(candidate);
    setSelectedCandidateID(candidate?.id);
    setCandidateDetailDrawer(true);
  };

  const data = candidateList?.items?.map((item: any, index: any) => {
    const items = [
      {
        key: 'edit',
        label: 'Edit',
        onClick: () => handleMenuClick('edit', item),
        permissions: [Permissions.UpdateCandidate],
      },
      {
        key: 'delete',
        label: 'Delete',
        onClick: () => handleMenuClick('delete', item),
        permissions: [Permissions.DeleteCandidate],
      },
    ];

    const filteredItems = items.filter((item) => {
      const { permissions } = item;
      return AccessGuard.checkAccess({ permissions: permissions });
    });

    return {
      key: index,
      id: item.id,
      candidateName: item?.fullName ?? '--',
      phoneNumber: item?.phone ?? '--',
      cgpa: item?.CGPA ?? '--',
      // internal_external:
      //   item?.jobCandidate?.isExternalApplicant === false
      //     ? 'External'
      //     : 'Internal',

      cv: (
        <a
          id={`talent-acquisition-candidate-table-link-cv-${item?.id}`}
          data-cy={`talent-acquisition-candidate-table-link-cv-${item?.id}`}
          href={item?.resumeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-semibold cursor-pointer flex items-center gap-2"
          title={item?.documentName ?? 'CV.pdf'}
        >
          {item?.documentName?.length > 8
            ? `${item.documentName.slice(0, 8)}...`
            : (item?.documentName ?? 'CV.pdf')}
        </a>
      ),

      createdAt: dayjs(item?.createdAt).format('DD MMMM YYYY') ?? '--',
      graduateYear: item?.graduateYear
        ? dayjs(item.graduateYear).format('DD MMMM YYYY')
        : '--',
      LinkedInURL: (
        <div id="talent-acquisition-candidate-table-div-email" data-cy="talent-acquisition-candidate-table-div-email" className="flex justify-center">
          <a
            id={`talent-acquisition-candidate-table-link-email-${item?.id}`}
            data-cy={`talent-acquisition-candidate-table-link-email-${item?.id}`}
            href={`mailto:${item?.email}`}
            title="Send Email"
            className="text-blue-600 hover:text-blue-800 transition-colors"
          >
            <SiGmail size={20} />
          </a>
        </div>
      ),
      stages: (
        <div>
          <Select
            id={`talent-acquisition-candidate-table-select-stage-${item?.id}`}
            data-cy={`talent-acquisition-candidate-table-select-stage-${item?.id}`}
            defaultValue={item?.jobCandidate?.map(
              (e: any) => e?.applicantStatusStage?.title ?? '--',
            )}
            // style={{ width: 120 }}
            className="w-full"
            onChange={(value) =>
              handleStageChange(
                value,
                item?.jobCandidate?.map((e: any) => e?.id),
              )
            }
          >
            {statusStage?.items?.map((stage: any) => (
              <Select.Option key={stage.id} value={stage.id} id={`talent-acquisition-candidate-table-option-stage-${stage.id}-${item?.id}`} data-cy={`talent-acquisition-candidate-table-option-stage-${stage.id}-${item?.id}`}>
                {stage.title}
              </Select.Option>
            ))}
          </Select>
        </div>
      ),
      action: (
        <div id="talent-acquisition-candidate-table-div-action" data-cy="talent-acquisition-candidate-table-div-action" className="flex items-center justify-between gap-4 text-white">
          <Button
            id={`editUserButton${item?.id}`}
            data-cy={`talent-acquisition-candidate-table-button-view-${item?.id}`}
            disabled={item?.deletedAt !== null}
            className="bg-primary px-[10px]  text-white disabled:bg-gray-400  border-none "
            onClick={() => handleCandidateDetail(item)}
          >
            <FaEye />
          </Button>
          <Dropdown
            data-cy={`talent-acquisition-candidate-table-dropdown-${item?.id}`}
            menu={{
              items: filteredItems.map(({ label, key, onClick }) => ({
                label,
                key,
                onClick,
              })),
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
    <div id="talent-acquisition-candidate-table-div-container" data-cy="talent-acquisition-candidate-table-div-container">
      <Table
        id="talent-acquisition-candidate-table-table"
        data-cy="talent-acquisition-candidate-table-table"
        className="w-full"
        columns={columns}
        dataSource={data}
        loading={isResponseLoading}
        pagination={false}
        scroll={{ x: 1000 }}
        rowSelection={rowSelection} // Enable selection
      />

      {isMobile || isTablet ? (
        <CustomMobilePagination
          data-cy="talent-acquisition-candidate-table-pagination-mobile"
          totalResults={candidateList?.meta?.totalItems ?? 1}
          pageSize={pageSize}
          onChange={onPageChange}
          onShowSizeChange={onPageChange}
        />
      ) : (
        <CustomPagination
          data-cy="talent-acquisition-candidate-table-pagination-desktop"
          current={currentPage}
          total={candidateList?.meta?.totalItems ?? 1}
          pageSize={pageSize}
          onChange={onPageChange}
          onShowSizeChange={onSizeChange}
        />
      )}
      <CandidateDetail data-cy="talent-acquisition-candidate-table-candidate-detail" />
      <DeleteCandidate data-cy="talent-acquisition-candidate-table-delete-candidate" />
      <EditCandidate data-cy="talent-acquisition-candidate-table-edit-candidate" />
      <MoveToTalentPool data-cy="talent-acquisition-candidate-table-move-to-talent-pool" />
    </div>
  );
};

export default AllCandidateTable;
