'use client';
/* eslint-disable local-rules/data-cy-required */
import React, { useEffect, useMemo, useState } from 'react';
import { Dropdown, Tooltip, Skeleton, Popover, Button } from 'antd';
import { BsThreeDots } from 'react-icons/bs';
import { CloseOutlined, DeleteOutlined, SwapOutlined } from '@ant-design/icons';
import {
  ClockAnalogIcon,
  ShareNetworkIcon,
} from '../../../_components/recruitmentIcons';
import { useJobState } from '@/store/uistate/features/recruitment/jobs';
import RecruitmentPagination from '../../../_components';
import {
  useGetAllJobs,
  useGetJobs,
} from '@/store/server/features/recruitment/job/queries';
import ShareToSocialMedia from '../modals/share';
import ChangeStatusModal from '../modals/changeJobStatus';
import EditJob from '../modals/editJob/editModal';
import Link from 'next/link';
import { useGetDepartments } from '@/store/server/features/employees/employeeManagment/department/queries';
import { Permissions } from '@/types/commons/permissionEnum';
import AccessGuard from '@/utils/permissionGuard';
import { CategoriesManagementStore } from '@/store/uistate/features/feedback/categories';
import { useDeleteJobs } from '@/store/server/features/recruitment/job/mutation';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const JobCardSkeleton: React.FC<{ index: number }> = ({ index }) => (
  <div
    className="flex flex-col rounded-xl border border-gray-200 bg-white p-5"
    data-cy={`talent-acquisition-job-card-skeleton-${index}`}
    aria-hidden
  >
    <div className="mb-3 flex items-start justify-between gap-2">
      <div className="flex min-w-0 flex-1 flex-wrap gap-2">
        <Skeleton.Button
          active
          size="small"
          className="!h-7 !min-w-[52px] !rounded"
        />
        <Skeleton.Button
          active
          size="small"
          className="!h-7 !min-w-[128px] !rounded"
        />
      </div>
      <div className="flex shrink-0 gap-2">
        <Skeleton.Avatar active size={32} shape="square" />
        <Skeleton.Avatar active size={32} shape="square" />
      </div>
    </div>
    <div className="mb-2 flex items-start justify-between gap-2">
      <Skeleton
        active
        title={{ width: '85%' }}
        paragraph={false}
        className="min-w-0 flex-1"
      />
      <Skeleton.Button
        active
        size="small"
        className="!h-8 !w-8 shrink-0 !rounded-md"
      />
    </div>
    <Skeleton active paragraph={{ rows: 1, width: ['45%'] }} className="mb-3" />
    <div className="mb-3 flex flex-wrap gap-2">
      <Skeleton.Button
        active
        size="small"
        className="!h-6 !min-w-[72px] !rounded"
      />
      <Skeleton.Button
        active
        size="small"
        className="!h-6 !min-w-[88px] !rounded"
      />
    </div>
    <div className="mt-auto border-t border-gray-200 pt-3">
      <Skeleton.Input active size="small" className="!h-4 !w-32" />
    </div>
  </div>
);

const JobCardAiMark: React.FC = () => {
  const uid = React.useId().replace(/:/g, '');
  const gid = `ai_linear_${uid}`;
  return (
    <svg
      width="17"
      height="16"
      viewBox="0 0 17 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0"
      aria-hidden
    >
      <defs>
        <linearGradient
          id={gid}
          x1="8.30013"
          y1="0"
          x2="8.30013"
          y2="15.6003"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0.413462" stopColor="#1E40AF" />
          <stop offset="1" stopColor="#91CAFF" />
        </linearGradient>
      </defs>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M13.0003 0C13.2585 0 13.4878 0.165258 13.5695 0.410263L14.2246 2.37566L16.19 3.03079C16.435 3.11246 16.6003 3.34174 16.6003 3.6C16.6003 3.85826 16.435 4.08754 16.19 4.16921L14.2246 4.82434L13.5695 6.78974C13.4878 7.03474 13.2585 7.2 13.0003 7.2C12.742 7.2 12.5127 7.03474 12.431 6.78974L11.7759 4.82434L9.81052 4.16921C9.56551 4.08754 9.40026 3.85826 9.40026 3.6C9.40026 3.34174 9.56551 3.11246 9.81052 3.03079L11.7759 2.37566L12.431 0.410263C12.5127 0.165258 12.742 0 13.0003 0Z"
        fill={`url(#${gid})`}
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M13.0003 8.6C13.5525 8.6 14.0003 9.04772 14.0003 9.6V14.6C14.0003 15.1523 13.5525 15.6 13.0003 15.6C12.448 15.6 12.0003 15.1523 12.0003 14.6V9.6C12.0003 9.04772 12.448 8.6 13.0003 8.6Z"
        fill={`url(#${gid})`}
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M3.14911 3.32785C3.27089 2.89727 3.66389 2.6 4.11136 2.6H5.88914C6.33661 2.6 6.72962 2.89727 6.85139 3.32786L9.9624 14.3279C10.1127 14.8593 9.80373 15.412 9.27229 15.5623C8.74085 15.7126 8.18819 15.4036 8.03789 14.8721L5.13273 4.6H4.86776L1.96251 14.8722C1.8122 15.4036 1.25954 15.7126 0.728104 15.5623C0.196665 15.4119 -0.112304 14.8593 0.038002 14.3278L3.14911 3.32785Z"
        fill={`url(#${gid})`}
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M1.00026 11.6C1.00026 11.0477 1.44797 10.6 2.00026 10.6H8.00026C8.55254 10.6 9.00026 11.0477 9.00026 11.6C9.00026 12.1523 8.55254 12.6 8.00026 12.6H2.00026C1.44797 12.6 1.00026 12.1523 1.00026 11.6Z"
        fill={`url(#${gid})`}
      />
    </svg>
  );
};

const JobCard: React.FC = () => {
  const [isClientReady, setIsClientReady] = useState(false);

  useEffect(() => {
    setIsClientReady(true);
  }, []);

  const {
    searchParams,
    setChangeStatusModalVisible,
    selectedJobId,
    setSelectedJobId,
    currentPage,
    pageSize,
    setCurrentPage,
    setPageSize,
    setShareModalOpen,
  } = useJobState();
  const { deleteModal, setDeleteModal } = CategoriesManagementStore();

  const filters = useMemo(
    () => ({
      department: searchParams?.department,
      employmentType: searchParams?.employmentType,
      status: searchParams?.status,
      location: searchParams?.location,
      createdDate: searchParams?.createdDate,
      closedDate: searchParams?.closedDate,
    }),
    [
      searchParams?.department,
      searchParams?.employmentType,
      searchParams?.status,
      searchParams?.location,
      searchParams?.createdDate,
      searchParams?.closedDate,
    ],
  );

  const isAnyFilterSet = Boolean(
    filters.department ||
    filters.employmentType ||
    filters.status ||
    filters.location ||
    filters.createdDate ||
    filters.closedDate,
  );

  const { data: jobList, isLoading: isJobListLoading } = useGetJobs(
    searchParams?.whatYouNeed || '',
    currentPage,
    pageSize,
    filters,
    { enabled: !isAnyFilterSet },
  );

  const { data: allJobsList, isLoading: isAllJobsLoading } = useGetAllJobs(
    searchParams?.whatYouNeed || '',
    undefined,
    undefined,
    { enabled: isAnyFilterSet },
  );

  const isJobsLoading = isAnyFilterSet ? isAllJobsLoading : isJobListLoading;

  const filteredAllItems = useMemo(() => {
    if (!isAnyFilterSet) return [];
    const items = allJobsList?.items ?? [];

    const getEffectiveStatus = (job: any) => {
      const jobDeadline = job?.jobDeadline ? new Date(job.jobDeadline) : null;
      const today = new Date();
      const isDeadlinePassed = jobDeadline && jobDeadline < today;
      return isDeadlinePassed ? 'Closed' : (job?.jobStatus ?? 'Open');
    };

    const normalizeYYYYMMDD = (v: any) => {
      if (!v) return '';
      return dayjs(v).format('YYYY-MM-DD');
    };

    let filtered = items;
    if (filters.department) {
      filtered = filtered.filter(
        (job: any) => job?.departmentId === filters.department,
      );
    }
    if (filters.employmentType) {
      filtered = filtered.filter(
        (job: any) => job?.employmentType === filters.employmentType,
      );
    }
    if (filters.location) {
      filtered = filtered.filter(
        (job: any) => job?.jobLocation === filters.location,
      );
    }
    if (filters.status) {
      filtered = filtered.filter(
        (job: any) => getEffectiveStatus(job) === filters.status,
      );
    }
    if (filters.createdDate) {
      filtered = filtered.filter(
        (job: any) => normalizeYYYYMMDD(job?.createdAt) === filters.createdDate,
      );
    }
    if (filters.closedDate) {
      filtered = filtered.filter(
        (job: any) =>
          normalizeYYYYMMDD(job?.jobDeadline) === filters.closedDate,
      );
    }

    return filtered;
  }, [
    allJobsList?.items,
    filters.createdDate,
    filters.department,
    filters.employmentType,
    filters.location,
    filters.status,
    filters.closedDate,
    isAnyFilterSet,
  ]);

  const totalItems = isAnyFilterSet
    ? filteredAllItems.length
    : (jobList?.meta?.totalItems ?? 1);

  const itemsToRender = isAnyFilterSet
    ? filteredAllItems.slice(
        Math.max(0, (currentPage - 1) * pageSize),
        Math.max(0, (currentPage - 1) * pageSize) + pageSize,
      )
    : (jobList?.items ?? []);

  const { mutate: deleteJob, isLoading } = useDeleteJobs();

  const { data: departments } = useGetDepartments();

  const getDepartmentName = (jobDepartmentId: string | undefined) => {
    const department =
      departments &&
      departments.find((dept: any) => dept.id === jobDepartmentId);
    return department ? department.name : '';
  };

  const handleShareModalVisible = (jobId: string) => {
    setShareModalOpen(true);
    setSelectedJobId(jobId);
  };

  const handleDeleteJob = (jobId: string) => {
    setSelectedJobId(jobId);
  };

  const handleDeleteModal = () => {
    deleteJob(selectedJobId, {
      onSuccess: () => {
        setDeleteModal(false);
      },
    });
    setSelectedJobId('');
  };

  // Ensure initial SSR and first client render stay identical before hydrating
  if (!isClientReady || isJobsLoading)
    return (
      <div
        id="talent-acquisition-job-card-div-loading-initial"
        data-cy="talent-acquisition-job-card-div-loading-initial"
        className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3"
        aria-busy="true"
        aria-label="Loading jobs"
      >
        {[...Array(pageSize).keys()].map((index) => (
          <JobCardSkeleton key={index} index={index} />
        ))}
      </div>
    );

  const NoData = () => (
    <div
      id="talent-acquisition-job-card-div-no-data"
      data-cy="talent-acquisition-job-card-div-no-data"
      className="w-full h-full flex justify-center items-center my-5"
    >
      No Job available.
    </div>
  );

  const handleStatusChange = (job: any) => {
    setDeleteModal(false);
    setChangeStatusModalVisible(true);
    setSelectedJobId(job?.id);
  };

  const displayStatus = (status: string) =>
    status === 'Closed' ? 'Closed' : 'Open';

  return (
    <>
      {itemsToRender.length >= 1 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {itemsToRender.map((job: any, index: string) => {
            const jobDeadline = job?.jobDeadline
              ? new Date(job?.jobDeadline)
              : null;
            const today = new Date();
            const isDeadlinePassed = jobDeadline && jobDeadline < today;
            const jobStatus = isDeadlinePassed ? 'Closed' : job?.jobStatus;
            const applicantCount = job?.jobCandidate?.length ?? 0;

            const menuItemsConfig = [
              {
                label: 'Change status',
                key: 'change-status',
                icon: <SwapOutlined className="!text-base text-gray-700" />,
                onClick: () => handleStatusChange(job),
                permissions: [Permissions.UpdateJobDescription],
              },
              {
                label: 'Delete',
                key: 'delete',
                icon: <DeleteOutlined className="!text-base text-gray-700" />,
                onClick: () => {
                  handleDeleteJob(job?.id);
                  setDeleteModal(true);
                },
                permissions: [Permissions.UpdateJobDescription],
              },
            ];

            const filteredMenuItems = menuItemsConfig
              .filter((item) =>
                AccessGuard.checkAccess({ permissions: item.permissions }),
              )
              .map(({ key, label, icon, onClick }) => ({
                key,
                label,
                icon,
                onClick,
              }));

            const actionIconsTop = (
              <div className="flex items-center gap-2 shrink-0">
                <Tooltip title="Job matching">
                  <Link
                    href={`/recruitment/ai-job-matching/${job?.id}`}
                    className="flex items-center justify-center w-8 h-8 shrink-0 rounded-lg p-px hover:opacity-95 transition-opacity"
                    style={{
                      background:
                        'linear-gradient(180deg, #1E40AF 0%, #91CAFF 100%)',
                      borderRadius: 8,
                    }}
                    data-cy={`talent-acquisition-job-card-link-applicants-${job?.id}`}
                    aria-label="Job matching (AI)"
                  >
                    <span className="flex h-full w-full items-center justify-center rounded-[7px] bg-white">
                      <JobCardAiMark />
                    </span>
                  </Link>
                </Tooltip>
                <Tooltip title="Share">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      handleShareModalVisible(job?.id);
                    }}
                    className="flex items-center justify-center w-8 h-8 rounded-lg text-[#111827] hover:bg-gray-50 shrink-0"
                    data-cy={`talent-acquisition-job-card-share-${job?.id}`}
                  >
                    <ShareNetworkIcon className="shrink-0" />
                  </button>
                </Tooltip>
              </div>
            );

            const menuButton = (
              <Popover
                open={deleteModal && selectedJobId === job?.id}
                onOpenChange={(open) => {
                  if (!open) setDeleteModal(false);
                }}
                trigger={[]}
                placement="bottom"
                align={{ offset: [0, 4] }}
                content={
                  <div className="w-[320px]">
                    <div className="mb-3 flex items-start justify-between gap-2">
                      <div
                        className="text-[16px] font-bold text-[rgba(0,0,0,0.7)]"
                        data-cy="talent-acquisition-job-card-delete-popover-title"
                      >
                        Delete job
                      </div>
                      <button
                        type="button"
                        className="-mr-1 -mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md hover:bg-gray-100"
                        aria-label="Close"
                        data-cy="talent-acquisition-job-card-delete-popover-close"
                        onClick={() => setDeleteModal(false)}
                      >
                        <CloseOutlined
                          className="text-[14px]"
                          style={{ color: 'rgba(0, 0, 0, 0.45)' }}
                        />
                      </button>
                    </div>
                    <p
                      className="mb-4 text-[14px] font-normal text-[rgba(0,0,0,0.7)]"
                      data-cy="talent-acquisition-job-card-delete-popover-body"
                    >
                      Are you sure you want to delete this job?
                    </p>
                    <div className="flex justify-end gap-2">
                      <Button
                        className="!h-9 !border-[#D9D9D9] !bg-white !px-4 !text-[14px] !font-normal !text-[rgba(0,0,0,0.7)] hover:!border-[#1E40AF] hover:!text-[#1E40AF]"
                        data-cy="talent-acquisition-job-card-delete-popover-cancel"
                        onClick={() => setDeleteModal(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        className="!h-9 !border-0 !bg-[#FF4D4F] !px-4 !text-[14px] !font-normal !text-white hover:!bg-[#E64548]"
                        data-cy="talent-acquisition-job-card-delete-popover-confirm"
                        loading={isLoading}
                        onClick={() => handleDeleteModal()}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                }
              >
                <div>
                  <Dropdown
                    data-cy={`talent-acquisition-job-card-dropdown-${job?.id}`}
                    menu={{ items: filteredMenuItems }}
                    trigger={['click']}
                  >
                    <button
                      type="button"
                      id={`talent-acquisition-job-card-button-menu-${job?.id}`}
                      data-cy={`talent-acquisition-job-card-button-menu-${job?.id}`}
                      className="flex items-center justify-center w-8 h-8 rounded-[6px] text-gray-600 hover:bg-gray-50 shrink-0 border border-solid border-[#D9D9D9] bg-white cursor-pointer"
                    >
                      <BsThreeDots className="w-4 h-4" />
                    </button>
                  </Dropdown>
                </div>
              </Popover>
            );

            return (
              <div
                key={job?.id ?? index}
                id={`talent-acquisition-job-card-div-card-${index}`}
                data-cy={`talent-acquisition-job-card-div-card-${index}`}
                className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col relative"
              >
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex flex-wrap items-center gap-2 min-w-0 flex-1">
                    <span
                      className={`inline-flex items-center rounded-[4px] border border-solid px-3 py-1 text-[12px] font-normal ${
                        jobStatus === 'Closed'
                          ? 'border-[#D1D5DB] bg-[#F3F4F6] text-[#6B7280]'
                          : 'border-[#B7EB8F] bg-[#F6FFED] text-[#52C41A]'
                      }`}
                      data-cy={`talent-acquisition-job-card-div-status-${index}`}
                    >
                      {displayStatus(jobStatus)}
                    </span>
                    <span className="inline-flex items-center rounded-[4px] border border-solid border-[#D9D9D9] bg-white px-3 py-1 text-[12px] font-normal text-[rgba(0,0,0,0.7)] whitespace-nowrap">
                      Deadline:{' '}
                      {job?.jobDeadline
                        ? dayjs(job.jobDeadline).format('DD MMMM YYYY')
                        : 'Not set'}
                    </span>
                  </div>
                  {actionIconsTop}
                </div>
                <div className="flex items-center justify-between gap-2 mb-2 min-w-0">
                  <Link
                    id={`talent-acquisition-job-card-link-${job?.id}`}
                    data-cy={`talent-acquisition-job-card-link-${job?.id}`}
                    href={`/recruitment/jobs/${job?.id}`}
                    className="flex-1 min-w-0"
                  >
                    <Tooltip title={job?.jobTitle}>
                      <h3 className="font-bold text-[20px] leading-tight text-black truncate pr-2">
                        {job?.jobTitle}
                      </h3>
                    </Tooltip>
                  </Link>
                  {menuButton}
                </div>
                <Link
                  href={`/recruitment/jobs/${job?.id}`}
                  className="block flex-1 min-w-0"
                >
                  <div className="flex items-center gap-1.5 text-[12px] font-normal text-[rgba(0,0,0,0.65)] mb-3">
                    <span
                      id={`talent-acquisition-job-departmentId-${index}`}
                      data-cy={`talent-acquisition-job-departmentId-${index}`}
                    >
                      {getDepartmentName(job?.departmentId) || '—'}
                    </span>
                    <span className="text-[rgba(0,0,0,0.25)]">•</span>
                    <span>{applicantCount} Applicants</span>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {job?.jobLocation && (
                      <span className="inline-flex items-center rounded-[4px] border border-solid border-[#D9D9D9] bg-white px-3 py-1 text-[12px] font-normal text-[rgba(0,0,0,0.7)]">
                        {job.jobLocation}
                      </span>
                    )}
                    {job?.employmentType && (
                      <span className="inline-flex items-center rounded-[4px] border border-solid border-[#D9D9D9] bg-white px-3 py-1 text-[12px] font-normal text-[rgba(0,0,0,0.7)]">
                        {job.employmentType}
                      </span>
                    )}
                  </div>
                </Link>
                <div className="flex items-center justify-end gap-1.5 mt-auto pt-3 border-t border-gray-200">
                  <ClockAnalogIcon className="w-4 h-4 shrink-0 text-black" />
                  <span
                    className="text-[12px] font-normal text-black"
                    suppressHydrationWarning
                  >
                    Created{' '}
                    {job?.createdAt
                      ? dayjs(job.createdAt).fromNow()
                      : 'Unknown'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div
          id="talent-acquisition-job-card-div-no-jobs"
          data-cy="talent-acquisition-job-card-div-no-jobs"
          className="bg-white w-full min-h-40 rounded-lg"
        >
          <div
            id="talent-acquisition-job-card-div-no-jobs-content"
            data-cy="talent-acquisition-job-card-div-no-jobs-content"
            className="flex items-center justify-center"
          >
            <NoData />
          </div>
        </div>
      )}
      <ChangeStatusModal />
      <ShareToSocialMedia />
      <EditJob />
      <RecruitmentPagination
        current={currentPage}
        total={totalItems}
        pageSize={pageSize}
        onChange={(page, pageSize) => {
          setCurrentPage(page);
          setPageSize(pageSize);
        }}
        onShowSizeChange={(size) => {
          setPageSize(size);
          setCurrentPage(1);
        }}
      />
    </>
  );
};

export default JobCard;
