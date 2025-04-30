'use client';
import React from 'react';
import { Card, Dropdown, Button, Tooltip, Spin } from 'antd';
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

const JobCard: React.FC = () => {
  const { searchParams } = useCandidateState();
  const {
    setChangeStatusModalVisible,
    setSelectedJobId,
    setEditModalVisible,
    currentPage,
    pageSize,
    setCurrentPage,
    setPageSize,
    setShareModalOpen,
    setSelectedJob,
  } = useJobState();

  const { data: jobList, isLoading: isJobListLoading } = useGetJobs(
    searchParams?.whatYouNeed || '',
    currentPage,
    pageSize,
  );

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

  if (isJobListLoading)
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
      </div>
    );

  const NoData = () => (
    <div className="w-full h-full flex justify-center items-center my-5">
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
          ];

          const filteredItems = items.filter((item) => {
            const { permissions } = item;
            return AccessGuard.checkAccess({ permissions });
          });

          return (
            <Card key={index} className="mb-4 rounded-lg shadow-sm">
              <div className="flex justify-between items-start">
                <Link href={`/recruitment/jobs/${job?.id}`}>
                  <>
                    <div className="font-medium text-sm flex justify-center items-center gap-4 mb-3">
                      <div className="w-full text-left">
                        <span className="font-bold text-xl text-gray-700">
                          {job?.jobTitle}
                        </span>
                      </div>
                      {jobStatus == 'Closed' ? (
                        <div className="mb-0 items-center text-xs font-normal rounded-lg px-4 py-1 bg-[#F8F8F8] text-[#A0AEC0] border-gray-200 border">
                          Closed
                        </div>
                      ) : (
                        <div className="mb-0 items-center text-xs font-normal rounded-lg px-4 py-1 bg-[#B2B2FF] text-[#3636F0]">
                          Active
                        </div>
                      )}
                    </div>
                    <div className="flex items-center justify-start gap-2">
                      <p className="text-sm text-gray-500">
                        {getDepartmentName(job?.departmentId)} .
                      </p>
                      <p className="text-sm text-gray-500">
                        {job?.jobLocation}
                      </p>
                    </div>
                    <div className="flex items-center justify-start mt-2 gap-2">
                      {job?.jobCandidate?.length > 0 ? (
                        job?.jobCandidate?.slice(0, 3).map((member: any) => (
                          <Tooltip
                            title={
                              <div className="flex justify-start items-center gap-4">
                                <>{member?.name ?? '-'}</>
                              </div>
                            }
                            key={member?.id}
                          >
                            <Image
                              src={AvatarImage}
                              alt="Profile pic"
                              width={15}
                              height={15}
                              className=""
                            />
                          </Tooltip>
                        ))
                      ) : (
                        <Image
                          src={AvatarImage}
                          alt="Profile pic"
                          width={15}
                          height={15}
                          className=""
                        />
                      )}
                      <p className="text-sm text-gray-500">
                        {job?.jobCandidate.length > 0
                          ? job?.jobCandidate?.length + ' '
                          : '0 '}
                        Candidates Applied
                      </p>
                    </div>
                  </>
                </Link>

                <div className="">
                  <Dropdown
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
                      icon={<BsThreeDotsVertical />}
                      className="border-0"
                    />
                  </Dropdown>
                </div>
              </div>
            </Card>
          );
        })
      ) : (
        <div className="bg-white w-full min-h-40 rounded-lg">
          <div className="flex items-center justify-center">
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
