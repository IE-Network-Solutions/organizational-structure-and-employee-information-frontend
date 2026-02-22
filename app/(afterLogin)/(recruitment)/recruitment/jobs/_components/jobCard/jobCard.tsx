'use client';
import React from 'react';
import { Dropdown, Tooltip, Spin, Popover, Button } from 'antd';
import { BsThreeDots } from 'react-icons/bs';
import { IoShareSocialOutline } from 'react-icons/io5';
import { AiOutlineClockCircle } from 'react-icons/ai';
import { useJobState } from '@/store/uistate/features/recruitment/jobs';
import RecruitmentPagination from '../../../_components';
import { useGetJobs } from '@/store/server/features/recruitment/job/queries';
import ShareToSocialMedia from '../modals/share';
import ChangeStatusModal from '../modals/changeJobStatus';
import EditJob from '../modals/editJob/editModal';
import Link from 'next/link';
import { useCandidateState } from '@/store/uistate/features/recruitment/candidate';
import { useGetDepartments } from '@/store/server/features/employees/employeeManagment/department/queries';
import { Permissions } from '@/types/commons/permissionEnum';
import AccessGuard from '@/utils/permissionGuard';
import { CategoriesManagementStore } from '@/store/uistate/features/feedback/categories';
import { useDeleteJobs } from '@/store/server/features/recruitment/job/mutation';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const aiGradient = 'linear-gradient(180deg, #1E40AF 0%, #91CAFF 100%)';

const FRAME_WIDTH = 30.6;
const FRAME_HEIGHT = 29.6;
const FRAME_RADIUS = 8;
const FRAME_BORDER = 1;
const FRAME_PADDING = 2; // marginXXS
const FRAME_GAP = 2;
const VECTOR_WIDTH = 22.6;
const VECTOR_HEIGHT = 21.6;
const VECTOR_PADDING = 3;
const AI_ICON_WIDTH = 16.6;
const AI_ICON_HEIGHT = 15.6;

const AIcon: React.FC<{ className?: string }> = ({ className }) => {
  const gradientId = `ai-star-${React.useId().replace(/:/g, '')}`;
  return (
    <span
      className={`inline-flex items-center justify-center flex-shrink-0 ${className ?? ''}`}
      style={{
        width: FRAME_WIDTH,
        height: FRAME_HEIGHT,
        borderRadius: FRAME_RADIUS,
        background: aiGradient,
        padding: FRAME_BORDER,
        boxSizing: 'border-box',
      }}
    >
      <span
        className="flex items-center justify-center bg-white"
        style={{
          width: '100%',
          height: '100%',
          borderRadius: FRAME_RADIUS - FRAME_BORDER,
          padding: FRAME_PADDING,
          boxSizing: 'border-box',
        }}
      >
        <span
          className="flex items-center justify-center"
          style={{
            width: VECTOR_WIDTH,
            height: VECTOR_HEIGHT,
            padding: VECTOR_PADDING,
            boxSizing: 'border-box',
          }}
        >
        <span
          className="inline-flex items-center leading-none font-extrabold"
          style={{
            width: AI_ICON_WIDTH,
            height: AI_ICON_HEIGHT,
            gap: FRAME_GAP,
            boxSizing: 'border-box',
          }}
        >
          <span
            style={{
              background: aiGradient,
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              color: 'transparent',
              fontSize: '14px',
              lineHeight: 1,
              fontWeight: 800,
            }}
          >
            A
          </span>
          <span
            className="flex flex-col items-center justify-center font-extrabold"
            style={{ lineHeight: 1, marginTop: '-3px', alignSelf: 'flex-start' }}
          >
            <svg
              className="pointer-events-none shrink-0"
              width="6"
              height="6"
              viewBox="0 0 8 8"
              fill="none"
            >
              <defs>
                <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#1E40AF" />
                  <stop offset="100%" stopColor="#91CAFF" />
                </linearGradient>
              </defs>
              <path
                d="M4 0L4.5 2.5L7 3L5 5L5.5 7.5L4 6L2.5 7.5L3 5L1 3L3.5 2.5L4 0Z"
                fill={`url(#${gradientId})`}
              />
            </svg>
            <span
              style={{
                background: aiGradient,
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                color: 'transparent',
                fontSize: '9px',
                lineHeight: 1,
                marginTop: '1px',
                fontWeight: 800,
              }}
            >
              i
            </span>
          </span>
        </span>
        </span>
      </span>
    </span>
  );
};

const JobCard: React.FC = () => {
  const { searchParams } = useCandidateState();
  const {
    setChangeStatusModalVisible,
    selectedJobId,
    setSelectedJobId,
    setEditModalVisible,
    currentPage,
    pageSize,
    setCurrentPage,
    setPageSize,
    setShareModalOpen,
    setSelectedJob,
  } = useJobState();
  const { deleteModal, setDeleteModal } = CategoriesManagementStore();

  const { data: jobList, isLoading: isJobListLoading } = useGetJobs(
    searchParams?.whatYouNeed || '',
    currentPage,
    pageSize,
  );
  const { mutate: deleteJob, isLoading } = useDeleteJobs();

  const { data: departments } = useGetDepartments();

  const getDepartmentName = (jobDepartmentId: string | undefined) => {
    const department =
      departments &&
      departments.find((dept: any) => dept.id === jobDepartmentId);
    return department ? department.name : '';
  };

  const handleEditModalVisible = (job: any) => {
    setEditModalVisible(true);
    setSelectedJobId(job?.id);
    setSelectedJob(job);
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

  if (isJobListLoading)
    return (
      <div
        id="talent-acquisition-job-card-div-loading"
        data-cy="talent-acquisition-job-card-div-loading"
        className="flex justify-center items-center h-64"
      >
        <Spin data-cy="talent-acquisition-job-card-spin-loading" size="large" />
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
    setChangeStatusModalVisible(true);
    setSelectedJobId(job?.id);
  };

  const displayStatus = (status: string) => (status === 'Closed' ? 'Closed' : 'Open');

  return (
    <>
      {jobList?.items && jobList?.items?.length >= 1 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {jobList?.items.map((job: any, index: string) => {
            const jobDeadline = job?.jobDeadline
              ? new Date(job?.jobDeadline)
              : null;
            const today = new Date();
            const isDeadlinePassed = jobDeadline && jobDeadline < today;
            const jobStatus = isDeadlinePassed ? 'Closed' : job?.jobStatus;
            const applicantCount = job?.jobCandidate?.length ?? 0;

            const items = [
              {
                label: 'Change Status',
                key: '1',
                onClick: () => handleStatusChange(job),
                permissions: [Permissions.UpdateJobDescription],
              },
              {
                label: 'Share',
                key: '2',
                onClick: () => handleShareModalVisible(job?.id),
              },
              {
                label: 'Edit',
                key: '3',
                onClick: () => handleEditModalVisible(job),
                permissions: [Permissions.UpdateJobDescription],
              },
              {
                label: 'Delete',
                key: '4',
                onClick: () => {
                  handleDeleteJob(job?.id);
                  setDeleteModal(true);
                },
                permissions: [Permissions.UpdateJobDescription],
              },
            ];

            const filteredItems = items.filter((item) => {
              const { permissions } = item;
              return AccessGuard.checkAccess({ permissions });
            });

            const actionIconsTop = (
                  <div className="flex items-center gap-1 shrink-0">
                    <Tooltip title="Job matching">
                      <Link
                        href={`/recruitment/ai-job-matching/${job?.id}`}
                        className="flex items-center justify-center w-8 h-8 rounded-lg hover:opacity-90 shrink-0 transition-opacity"
                        data-cy={`talent-acquisition-job-card-link-applicants-${job?.id}`}
                        aria-label="Job matching (AI)"
                      >
                        <AIcon className="w-8 h-8" />
                      </Link>
                    </Tooltip>
                    <Tooltip title="Share">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          handleShareModalVisible(job?.id);
                        }}
                        className="flex items-center justify-center w-8 h-8 rounded-lg text-gray-500 hover:bg-gray-100 shrink-0"
                        data-cy={`talent-acquisition-job-card-share-${job?.id}`}
                      >
                        <IoShareSocialOutline className="w-4 h-4" />
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
                        <div className="text-base font-semibold text-gray-900 mb-2">Delete Job</div>
                        <p className="text-gray-500 text-sm mb-4">Are you sure you want to delete this job?</p>
                        <div className="flex gap-2 justify-end">
                          <Button
                            className="border-gray-300 text-gray-700"
                            onClick={() => setDeleteModal(false)}
                          >
                            Cancel
                          </Button>
                          <Button
                            type="primary"
                            className="!bg-red-600 hover:!bg-red-700 !border-0"
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
                        menu={{
                          items: filteredItems.map(({ label, key, onClick }) => ({
                            label,
                            key,
                            onClick,
                          })),
                        }}
                        trigger={['click']}
                      >
                        <button
                          type="button"
                          id={`talent-acquisition-job-card-button-menu-${job?.id}`}
                          data-cy={`talent-acquisition-job-card-button-menu-${job?.id}`}
                          className="flex items-center justify-center w-8 h-8 rounded-lg text-gray-500 hover:bg-gray-100 shrink-0 border-0 cursor-pointer bg-transparent"
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
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex flex-col relative"
              >
                {/* Same order on mobile and desktop: status + deadline | actions → title → department • applicants → location/type pills → created */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex flex-wrap items-center gap-2 min-w-0 flex-1">
                    <span
                      className={`inline-flex items-center text-xs font-medium rounded-md border px-3 py-1.5 ${
                        jobStatus === 'Closed'
                          ? 'border-gray-200 bg-white text-gray-600'
                          : 'border-emerald-200 bg-white text-emerald-700'
                      }`}
                      data-cy={`talent-acquisition-job-card-div-status-${index}`}
                    >
                      {displayStatus(jobStatus)}
                    </span>
                    <span className="inline-flex items-center text-xs font-medium rounded-md border border-gray-200 bg-white px-3 py-1.5 text-gray-700 whitespace-nowrap">
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
                      <h3 className="font-bold text-lg text-gray-900 truncate pr-2">
                        {job?.jobTitle}
                      </h3>
                    </Tooltip>
                  </Link>
                  {menuButton}
                </div>
                <Link href={`/recruitment/jobs/${job?.id}`} className="block flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 text-sm text-gray-500 mb-3">
                    <span id={`talent-acquisition-job-departmentId-${index}`} data-cy={`talent-acquisition-job-departmentId-${index}`}>
                      {getDepartmentName(job?.departmentId) || '—'}
                    </span>
                    <span className="text-gray-300">•</span>
                    <span>{applicantCount} Applicants</span>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {job?.jobLocation && (
                      <span className="inline-flex items-center text-xs font-medium rounded-md border border-gray-200 bg-white px-3 py-1.5 text-gray-700">
                        {job.jobLocation}
                      </span>
                    )}
                    {job?.employmentType && (
                      <span className="inline-flex items-center text-xs font-medium rounded-md border border-gray-200 bg-white px-3 py-1.5 text-gray-700">
                        {job.employmentType}
                      </span>
                    )}
                  </div>
                </Link>
                <div className="flex items-center justify-end gap-1.5 text-sm text-gray-400 mt-auto pt-2 border-t border-gray-100">
                  <AiOutlineClockCircle className="w-4 h-4 shrink-0" />
                  <span>
                    Created {job?.createdAt ? dayjs(job.createdAt).fromNow() : 'Unknown'}
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
        total={jobList?.meta?.totalItems ?? 1}
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
