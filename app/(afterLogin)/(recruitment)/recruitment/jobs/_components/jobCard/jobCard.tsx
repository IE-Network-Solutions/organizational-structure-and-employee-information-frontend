'use client';
import React from 'react';
import { Card, Dropdown, Button, Tooltip, Spin, Avatar } from 'antd';
import { BsThreeDotsVertical } from 'react-icons/bs';
import { useJobState } from '@/store/uistate/features/recruitment/jobs';
import RecruitmentPagination from '../../../_components';
import { useGetJobs } from '@/store/server/features/recruitment/job/queries';
import AvatarImage from '@/public/gender_neutral_avatar.jpg';
import Image from 'next/image';
import ShareToSocialMedia from '../modals/share';
import ChangeStatusModal from '../modals/changeJobStatus';
import EditJob from '../modals/editJob/editModal';
import Link from 'next/link';
import { useCandidateState } from '@/store/uistate/features/recruitment/candidate';
import { useGetDepartments } from '@/store/server/features/employees/employeeManagment/department/queries';
import { Permissions } from '@/types/commons/permissionEnum';
import AccessGuard from '@/utils/permissionGuard';
import DeleteModal from '@/components/common/deleteConfirmationModal';
import { CategoriesManagementStore } from '@/store/uistate/features/feedback/categories';
import { useDeleteJobs } from '@/store/server/features/recruitment/job/mutation';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { DATE_FORMAT } from '@/utils/constants';

dayjs.extend(relativeTime);

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

  return (
    <>
      {jobList?.items && jobList?.items?.length >= 1 ? (
        jobList?.items.map((job: any, index: string) => {
          const jobDeadline = job?.jobDeadline
            ? new Date(job?.jobDeadline)
            : null;
          const today = new Date();

          const isDeadlinePassed = jobDeadline && jobDeadline < today;
          const jobStatus = isDeadlinePassed ? 'Closed' : job?.jobStatus;

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

          return (
            <Card key={index} className="mb-4 rounded-lg w-full">
              <div
                id={`talent-acquisition-job-card-div-card-${index}`}
                data-cy={`talent-acquisition-job-card-div-card-${index}`}
                className="relative"
              >
                {/* Dropdown positioned at top-right corner */}
                <div
                  id={`talent-acquisition-job-card-div-dropdown-${index}`}
                  data-cy={`talent-acquisition-job-card-div-dropdown-${index}`}
                  className="absolute top-0 right-0"
                >
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
                    <Button
                      id={`talent-acquisition-job-card-button-menu-${job?.id}`}
                      data-cy={`talent-acquisition-job-card-button-menu-${job?.id}`}
                      icon={<BsThreeDotsVertical />}
                      className="border-0"
                      size="small"
                    />
                  </Dropdown>
                </div>

                <div
                  id={`talent-acquisition-job-card-div-content-${index}`}
                  data-cy={`talent-acquisition-job-card-div-content-${index}`}
                >
                  <Link
                    id={`talent-acquisition-job-card-link-${job?.id}`}
                    data-cy={`talent-acquisition-job-card-link-${job?.id}`}
                    href={`/recruitment/jobs/${job?.id}`}
                    className="block"
                  >
                    <div
                      id={`talent-acquisition-job-card-div-link-content-${index}`}
                      data-cy={`talent-acquisition-job-card-div-link-content-${index}`}
                      className="w-full"
                    >
                      {/* Title and Status - Mobile: Stack vertically, Desktop: Side by side */}
                      <div
                        id={`talent-acquisition-job-card-div-title-status-${index}`}
                        data-cy={`talent-acquisition-job-card-div-title-status-${index}`}
                        className="flex flex-col sm:flex-row sm:justify-between gap-3 mb-3"
                      >
                        <div
                          id={`talent-acquisition-job-card-div-title-${index}`}
                          data-cy={`talent-acquisition-job-card-div-title-${index}`}
                          className="flex-1 pr-8 sm:pr-0"
                        >
                          <Tooltip title={job?.jobTitle}>
                            <span className="font-bold text-lg sm:text-xl text-gray-700 block truncate">
                              {job?.jobTitle}
                            </span>
                          </Tooltip>
                        </div>
                        <div
                          id={`talent-acquisition-job-card-div-status-${index}`}
                          data-cy={`talent-acquisition-job-card-div-status-${index}`}
                          className="sm:mr-10"
                        >
                          {jobStatus == 'Closed' ? (
                            <div className="inline-flex items-center text-xs font-normal rounded-lg px-3 py-1 bg-[#F8F8F8] text-[#A0AEC0] border-gray-200 border">
                              Closed
                            </div>
                          ) : (
                            <div className="inline-flex items-center text-xs font-normal rounded-lg px-3 py-1 bg-[#B2B2FF] text-[#3636F0]">
                              Active
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Department/Location and Closing Date - Mobile: Stack vertically, Desktop: Side by side */}
                      <div
                        id={`talent-acquisition-job-card-div-dept-location-${index}`}
                        data-cy={`talent-acquisition-job-card-div-dept-location-${index}`}
                        className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-3"
                      >
                        <div
                          id={`talent-acquisition-job-card-div-dept-${index}`}
                          data-cy={`talent-acquisition-job-card-div-dept-${index}`}
                          className="flex items-center gap-2 flex-wrap"
                        >
                          <p
                            id={`talent-acquisition-job-departmentId-${index}`}
                            data-cy={`talent-acquisition-job-departmentId-${index}`}
                            className="text-sm text-gray-500"
                          >
                            {getDepartmentName(job?.departmentId)}
                          </p>
                          {getDepartmentName(job?.departmentId) &&
                            job?.jobLocation && (
                              <span className="text-gray-300">•</span>
                            )}
                          <p
                            id={`talent-acquisition-job-jobLocation-${index}`}
                            data-cy={`talent-acquisition-job-jobLocation-${index}`}
                            className="text-sm text-gray-500"
                          >
                            {job?.jobLocation}
                          </p>
                        </div>
                        <div
                          id={`talent-acquisition-job-card-div-closing-date-desktop-${index}`}
                          data-cy={`talent-acquisition-job-card-div-closing-date-desktop-${index}`}
                          className="hidden sm:block"
                        >
                          <span className="text-gray-700 font-medium">
                            Closing Date:{' '}
                          </span>
                          {job?.jobDeadline ? (
                            <span className="text-gray-500">
                              {dayjs(job.jobDeadline).format(DATE_FORMAT)}
                            </span>
                          ) : (
                            <span className="text-gray-500">Not set</span>
                          )}
                        </div>
                      </div>

                      {/* Mobile Closing Date - Only show on mobile */}
                      <div
                        id={`talent-acquisition-job-card-div-closing-date-mobile-${index}`}
                        data-cy={`talent-acquisition-job-card-div-closing-date-mobile-${index}`}
                        className="block sm:hidden mb-3"
                      >
                        <div className="text-sm">
                          <span className="text-gray-700 font-medium">
                            Closing Date:{' '}
                          </span>
                          {job?.jobDeadline ? (
                            <span className="text-gray-500">
                              {dayjs(job.jobDeadline).format(DATE_FORMAT)}
                            </span>
                          ) : (
                            <span className="text-gray-500">Not set</span>
                          )}
                        </div>
                      </div>

                      {/* Candidates and Created Date - Mobile: Stack vertically, Desktop: Side by side */}
                      <div
                        id={`talent-acquisition-job-card-div-candidates-created-${index}`}
                        data-cy={`talent-acquisition-job-card-div-candidates-created-${index}`}
                        className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3"
                      >
                        <div
                          id={`talent-acquisition-job-card-div-candidates-${index}`}
                          data-cy={`talent-acquisition-job-card-div-candidates-${index}`}
                          className="flex items-center gap-2"
                        >
                          {job?.jobCandidate?.length > 0 ? (
                            <Avatar.Group
                              maxCount={3}
                              maxStyle={{
                                color: '#f56a00',
                                backgroundColor: '#fde3cf',
                              }}
                              size="small"
                            >
                              {job.jobCandidate
                                .slice(0, 3)
                                .map((member: any) => (
                                  <Tooltip
                                    title={
                                      <div className="flex justify-start items-center gap-4">
                                        {member?.name ?? '-'}
                                      </div>
                                    }
                                    key={member?.id}
                                  >
                                    <Image
                                      src={AvatarImage}
                                      alt="Profile pic"
                                      width={20}
                                      height={20}
                                      className="rounded-full object-cover"
                                    />
                                  </Tooltip>
                                ))}
                            </Avatar.Group>
                          ) : (
                            <Image
                              src={AvatarImage}
                              alt="Profile pic"
                              width={20}
                              height={20}
                              className="rounded-full object-cover"
                            />
                          )}
                          <p className="text-sm text-gray-500">
                            {job?.jobCandidate.length > 0
                              ? job?.jobCandidate?.length + ' '
                              : '0 '}
                            Candidates Applied
                          </p>
                        </div>

                        <div
                          id={`talent-acquisition-job-card-div-created-desktop-${index}`}
                          data-cy={`talent-acquisition-job-card-div-created-desktop-${index}`}
                          className="hidden sm:block"
                        >
                          <div className="text-sm text-gray-500">
                            Created{' '}
                            {job?.createdAt
                              ? dayjs(job.createdAt).fromNow()
                              : 'Unknown'}
                          </div>
                        </div>
                      </div>

                      {/* Mobile Created Date - Only show on mobile */}
                      <div
                        id={`talent-acquisition-job-card-div-created-mobile-${index}`}
                        data-cy={`talent-acquisition-job-card-div-created-mobile-${index}`}
                        className="block sm:hidden mt-3"
                      >
                        <div className="text-sm text-gray-500">
                          Created{' '}
                          {job?.createdAt
                            ? dayjs(job.createdAt).fromNow()
                            : 'Unknown'}
                        </div>
                      </div>
                    </div>
                  </Link>

                  {/* Date information - shown at bottom */}
                </div>
              </div>
            </Card>
          );
        })
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
      <DeleteModal
        loading={isLoading}
        open={deleteModal}
        deleteMessage="Are you sure you want to delete this job?"
        onCancel={() => setDeleteModal(false)}
        onConfirm={() => {
          handleDeleteModal();
        }}
      />

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
