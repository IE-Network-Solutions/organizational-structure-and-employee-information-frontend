import {
  useGetAllCandidates,
  useGetStages,
} from '@/store/server/features/recruitment/candidate/queries';
import {
  CandidateData,
  useCandidateState,
} from '@/store/uistate/features/recruitment/candidate';
import { Dropdown, Table, TableColumnsType, Tag } from 'antd';
import dayjs from 'dayjs';
import React from 'react';
import { EyeOutlined } from '@ant-design/icons';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import CandidateDetail from '../../../jobs/[id]/_components/candidateDetail/page';
import DeleteCandidate from '../../../_components/modals/deleteCandidate';
import EditCandidate from '../../../_components/modals/editCandidate';
import MoveToTalentPool from '../../../_components/modals/moveToTalentPool';
import { useChangeCandidateStatus } from '@/store/server/features/recruitment/candidate/mutation';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
import { TableRowSelection } from 'antd/es/table/interface';
import { CustomMobilePagination } from '@/components/customPagination/mobilePagination';
import { useIsMobile } from '@/hooks/useIsMobile';
import CustomPagination from '@/components/customPagination';
import SaveAltIcon from '@mui/icons-material/SaveAlt';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';

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
      title: (
        <span
          className="text-base"
          style={{ fontWeight: 600 }}
          data-cy="talent-acquisition-candidate-column-title-name"
        >
          Name
        </span>
      ),
      dataIndex: 'candidateName',
      key: 'candidateName',
      sorter: (a, b) => a.candidateName.localeCompare(b.candidateName),
      render: (text: string) => (
        <div
          className="text-sm text-gray-700"
          data-cy="talent-acquisition-candidate-cell-name"
        >
          {text ?? '--'}
        </div>
      ),
    },
    {
      title: (
        <span
          className="text-base"
          style={{ fontWeight: 600 }}
          data-cy="talent-acquisition-candidate-column-title-phone"
        >
          Phone Number
        </span>
      ),
      dataIndex: 'phoneNumber',
      key: 'phoneNumber',
      ellipsis: true,
      render: (text: string) => (
        <div
          className="text-sm text-gray-700"
          data-cy="talent-acquisition-candidate-cell-phone"
        >
          {text ?? '--'}
        </div>
      ),
    },
    {
      title: (
        <span
          className="text-base"
          style={{ fontWeight: 600 }}
          data-cy="talent-acquisition-candidate-column-title-cgpa"
        >
          CGPA
        </span>
      ),
      dataIndex: 'cgpa',
      key: 'cgpa',
      sorter: (a: any, b: any) => a.cgpa - b.cgpa,
      render: (text: string | number) => (
        <div
          className="text-sm text-gray-700"
          data-cy="talent-acquisition-candidate-cell-cgpa"
        >
          {text ?? '--'}
        </div>
      ),
    },
    {
      title: (
        <span
          className="text-base"
          style={{ fontWeight: 600 }}
          data-cy="talent-acquisition-candidate-column-title-cv"
        >
          CV
        </span>
      ),
      dataIndex: 'cv',
      key: 'cv',
    },
    {
      title: (
        <span
          className="text-base"
          style={{ fontWeight: 600 }}
          data-cy="talent-acquisition-candidate-column-title-created"
        >
          Applied/ Created Date
        </span>
      ),
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (text: string) => (
        <div
          className="text-sm text-gray-700"
          data-cy="talent-acquisition-candidate-cell-created"
        >
          {text ?? '--'}
        </div>
      ),
    },
    {
      title: (
        <span
          className="text-base"
          style={{ fontWeight: 600 }}
          data-cy="talent-acquisition-candidate-column-title-graduation"
        >
          Date of Graduation
        </span>
      ),
      dataIndex: 'graduateYear',
      key: 'graduateYear',
      render: (text: string) => (
        <div
          className="text-sm text-gray-700"
          data-cy="talent-acquisition-candidate-cell-graduation"
        >
          {text ?? '--'}
        </div>
      ),
    },
    {
      title: (
        <span
          className="text-base"
          style={{ fontWeight: 600 }}
          data-cy="talent-acquisition-candidate-column-title-email"
        >
          Email
        </span>
      ),
      dataIndex: 'LinkedInURL',
      key: 'LinkedInURL',
    },
    {
      title: (
        <span
          className="text-base"
          style={{ fontWeight: 600 }}
          data-cy="talent-acquisition-candidate-column-title-stages"
        >
          Stages
        </span>
      ),
      dataIndex: 'stages',
      key: 'stages',
    },
    {
      title: (
        <span
          className="text-base"
          style={{ fontWeight: 600 }}
          data-cy="talent-acquisition-candidate-column-title-action"
        >
          Action
        </span>
      ),
      dataIndex: 'action',
      key: 'action',
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
    const editDeleteItems = [
      {
        key: 'edit',
        label: 'Edit',
        icon: <EditOutlinedIcon fontSize="small" />,
        onClick: () => handleMenuClick('edit', item),
        permissions: [Permissions.UpdateCandidate],
      },
      {
        key: 'delete',
        label: 'Delete',
        icon: <DeleteOutlineOutlinedIcon fontSize="small" />,
        onClick: () => handleMenuClick('delete', item),
        permissions: [Permissions.DeleteCandidate],
      },
    ];

    const filteredEditDelete = editDeleteItems.filter((entry) =>
      AccessGuard.checkAccess({ permissions: entry.permissions }),
    );

    const actionMenuItems = [
      {
        key: 'view',
        label: 'View Detail',
        icon: <EyeOutlined />,
        onClick: () => handleCandidateDetail(item),
      },
      ...filteredEditDelete.map(({ key, label, icon, onClick }) => ({
        key,
        label,
        icon,
        onClick,
      })),
    ];

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
          className="inline-flex items-center justify-center text-primary hover:text-[#4096FF] transition-colors"
          title={item?.documentName ?? 'Download CV'}
        >
          <SaveAltIcon fontSize="small" />
        </a>
      ),

      createdAt: dayjs(item?.createdAt).format('DD MMMM YYYY') ?? '--',
      graduateYear: item?.graduateYear
        ? dayjs(item.graduateYear).format('DD MMMM YYYY')
        : '--',
      LinkedInURL: (
        <div
          id="talent-acquisition-candidate-table-div-email"
          data-cy="talent-acquisition-candidate-table-div-email"
          className="flex items-center"
        >
          <a
            id={`talent-acquisition-candidate-table-link-email-${item?.id}`}
            data-cy={`talent-acquisition-candidate-table-link-email-${item?.id}`}
            href={item?.email ? `mailto:${item.email}` : undefined}
            title={item?.email ?? ''}
            className="text-primary hover:text-[#4096FF] transition-colors text-sm break-all"
          >
            {item?.email ?? '--'}
          </a>
        </div>
      ),
      stages: (
        <div
          id="talent-acquisition-candidate-table-div-stages"
          data-cy="talent-acquisition-candidate-table-div-stages"
        >
          <Dropdown
            trigger={['click']}
            placement="bottomLeft"
            menu={{
              items:
                statusStage?.items?.map((stage: any) => ({
                  key: stage.id,
                  label: stage.title,
                  onClick: () =>
                    handleStageChange(
                      stage.id,
                      item?.jobCandidate?.map((e: any) => e?.id),
                    ),
                })) ?? [],
            }}
          >
            <Tag
              id={`talent-acquisition-candidate-table-tag-stage-${item?.id}`}
              data-cy={`talent-acquisition-candidate-table-tag-stage-${item?.id}`}
              className="inline-flex items-center justify-center cursor-pointer border border-solid transition-colors px-3 py-0.5 text-xs font-normal"
              style={{
                borderRadius: 6,
                backgroundColor: '#E6F0FF',
                color: '#1677FF',
                borderColor: '#B3CCFF',
              }}
            >
              {item?.jobCandidate?.[0]?.applicantStatusStage?.title ?? '--'}
            </Tag>
          </Dropdown>
        </div>
      ),
      action: (
        <div
          id="talent-acquisition-candidate-table-div-action"
          data-cy="talent-acquisition-candidate-table-div-action"
          className="flex items-center justify-start"
        >
          <Dropdown
            menu={{ items: actionMenuItems }}
            trigger={['click']}
            placement="bottomRight"
            overlayClassName="talent-acquisition-candidate-table-action-dropdown"
            overlayStyle={{
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              borderRadius: 8,
            }}
            data-cy={`talent-acquisition-candidate-table-dropdown-${item?.id}`}
          >
            <button
              type="button"
              disabled={item?.deletedAt !== null}
              className="cursor-pointer text-gray-500 hover:text-gray-700 p-1.5 border border-gray-300 rounded-md bg-gray-50 flex items-center justify-center hover:border-gray-400 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              data-cy={`talent-acquisition-candidate-table-action-${item?.id}`}
              id={`talent-acquisition-candidate-table-action-${item?.id}`}
            >
              <MoreHorizIcon className="text-[20px] text-gray-600" />
            </button>
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
    <div
      id="talent-acquisition-candidate-table-div-container"
      data-cy="talent-acquisition-candidate-table-div-container"
    >
      <div
        className="flex overflow-x-auto scrollbar-none w-full bg-white"
        id="talent-acquisition-candidate-table-scroll-wrapper"
        data-cy="talent-acquisition-candidate-table-scroll-wrapper"
      >
        <Table
          id="talent-acquisition-candidate-table-table"
          data-cy="talent-acquisition-candidate-table-table"
          className="w-full [&_.ant-table-thead_.ant-table-cell]:font-semibold"
          rowClassName={() => 'h-[60px]'}
          columns={columns}
          dataSource={data}
          loading={isResponseLoading}
          pagination={false}
          scroll={{ x: 'max-content' }}
          rowSelection={rowSelection}
        />
      </div>

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
