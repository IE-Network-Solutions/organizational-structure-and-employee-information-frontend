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

const JobCard: React.FC = () => {
  const { data: jobList, isLoading: isJobListLoading } = useGetJobs();

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
  return (
    <>
      {jobList?.items.map((job: any, index: string) => (
        <Card key={index} className="mb-4 rounded-lg shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <>
                <h3 className="font-medium text-sm flex justify-center items-center gap-4 mb-3">
                  <div className="w-full text-left">
                    <span className="font-bold text-xl">{job?.jobTitle}</span>
                  </div>
                  {job?.jobStatus == 'Closed' ? (
                    <div
                      className={`mb-0 items-center text-xs font-normal rounded-lg px-4 py-1 bg-[#F8F8F8] text-[#A0AEC0] border-gray-200 border`}
                    >
                      {job?.jobStatus}
                    </div>
                  ) : (
                    <div className="mb-0 items-center text-xs font-normal rounded-lg px-4 py-1 bg-[#B2B2FF] text-[#3636F0] ">
                      Active
                    </div>
                  )}
                </h3>
                <p className="text-sm text-gray-500">{job?.jobLocation}</p>
                <div className="flex items-center justify-center mt-2 gap-2">
                  {job?.jobCandidate?.length > 0 ? (
                    job?.jobCandidate?.map((member: any) => (
                      <Tooltip
                        title={
                          <div className="flex justify-start items-center gap-4">
                            <>{member?.name}</>
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
                    {job?.jobCandidate.length > 0 ? job?.jobCandidate : '0 '}
                    Candidates Applied
                  </p>
                </div>
              </>
            </div>

            <div className="">
              <Dropdown
                menu={{
                  items: [
                    {
                      label: 'Change Status',
                      key: '1',
                      onClick: () => setChangeStatusModalVisible(true),
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
                    },
                  ],
                }}
                trigger={['click']}
              >
                <Button icon={<BsThreeDotsVertical />} className="border-0" />
              </Dropdown>
            </div>
          </div>
        </Card>
      ))}

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
