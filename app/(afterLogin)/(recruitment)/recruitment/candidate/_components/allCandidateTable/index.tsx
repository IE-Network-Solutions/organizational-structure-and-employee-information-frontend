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
import { FileDown } from 'lucide-react';
import CandidateDetail from '../../../jobs/[id]/_components/candidateDetail/page';
import DeleteCandidate from '../../../_components/modals/deleteCandidate';
import EditCandidate from '../../../_components/modals/editCandidate';
import MoveToTalentPool from '../../../_components/modals/moveToTalentPool';
import { useChangeCandidateStatus } from '@/store/server/features/recruitment/candidate/mutation';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';

const AllCandidateTable: React.FC = () => {
  const { data: statusStage } = useGetStages();
  const { mutate: updateJobStatus } = useChangeCandidateStatus();

  const userId = useAuthenticationStore.getState().userId;

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
  } = useCandidateState();

  const { data: candidateList, isLoading: isResponseLoading } =
    useGetAllCandidates(
      searchParams?.whatYouNeed || '',
      searchParams?.dateRange || '',
      searchParams?.selectedJob || '',
      searchParams?.selectedStage || '',
      searchParams?.selectedDepartment || '',
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
      internal_external:
        item?.jobCandidate?.isExternalApplicant === false
          ? 'External'
          : 'Internal',

      cv: (
        <a
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
      stages: (
        <div>
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
        </div>
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

  const rowSelection = {
    onChange: (notused: any, selectedRows: any) => {
      setSelectedCandidate(
        candidateList?.items?.filter((item: any) =>
          selectedRows.some((row: any) => row.id === item.id),
        ),
      );
    },
  };

  return (
    <div>
      <Table
        className="w-full"
        columns={columns}
        dataSource={data}
        rowSelection={rowSelection} // Enable selection
        pagination={{
          total: candidateList?.meta?.totalItems,
          current: currentPage,
          pageSize: pageSize,
          onChange: onPageChange,
          showSizeChanger: true,
          onShowSizeChange: onPageChange,
        }}
        loading={isResponseLoading}
        scroll={{ x: 1000 }}
      />
      <CandidateDetail />
      <DeleteCandidate />
      <EditCandidate />
      <MoveToTalentPool />
    </div>
  );
};

export default AllCandidateTable;
