'use client';
import CustomBreadcrumb from '@/components/common/breadCramp';
import { useGetJobs } from '@/store/server/features/recruitment/job/queries';
import { Button, Card, Col, Dropdown, Row, Spin } from 'antd';
import React from 'react';
import { BsThreeDotsVertical } from 'react-icons/bs';
import { useJobState } from '@/store/uistate/features/recruitment/jobs';
import ShareToSocialMedia from '@/app/(afterLogin)/(recruitment)/recruitment/jobs/_components/modals/share';
import Link from 'next/link';
import ChangeStatusModal from '@/app/(afterLogin)/(recruitment)/recruitment/jobs/_components/modals/changeJobStatus';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const OpenPositions: React.FC = () => {
  const {
    setChangeStatusModalVisible,
    setShareModalOpen,
    setSelectedJobId,
    setSelectedJob,
  } = useJobState();
  const { data: publicJobs, isLoading: responseLoading } = useGetJobs();
  console.log(publicJobs, 'publicJobs');

  const handleShareModalVisible = (jobId: string) => {
    setShareModalOpen(true);
    setSelectedJobId(jobId);
  };

  const handleChangeStatus = (job: any) => {
    setChangeStatusModalVisible(true);
    setSelectedJobId(job?.id);
    setSelectedJob(job);
  };

  if (responseLoading)
    return (
      <div className="flex items-center justify-center h-full">
        <Spin />
      </div>
    );
  return (
    <div>
      <CustomBreadcrumb title="Open Positions" subtitle="Here's all job list" />
      <Row gutter={16}>
        {publicJobs?.items?.map((job: any) => (
          <Col xs={24} sm={24} lg={12} md={12} xl={12}>
            <Card className="mb-4 rounded-lg shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <>
                    <h3 className="font-medium text-sm flex justify-center items-center gap-4 mb-3">
                      <div className="w-full text-left">
                        <span className="font-bold text-xl">
                          {job?.jobTitle}
                        </span>
                      </div>
                      {job?.jobStatus == 'Closed' ? (
                        <div
                          className={`mb-0 items-center rounded-lg px-3 py-1 bg-[#F8F8F8] text-[#A0AEC0] `}
                        >
                          {job?.jobStatus}
                        </div>
                      ) : (
                        <div
                          className={`mb-0 items-center rounded-lg px-3 py-1 
              ${job?.jobStatus == 'Active' ? 'bg-[#B2B2FF] text-[#3636F0]' : 'bg-[#FFEDEC] text-[#E03137]'} 
              `}
                        >
                          {job?.jobStatus}
                        </div>
                      )}
                    </h3>
                    <p className="text-sm text-gray-500">{job?.jobLocation}</p>
                    <div className="my-2">
                      <p className="text-sm text-gray-500">
                        {job?.jobCandidate.length > 0
                          ? job?.jobCandidate + ' '
                          : '0' + ' '}
                        Candidates Applied
                      </p>
                    </div>
                    <div className="flex w-full items-center justify-between">
                      <div className="text-sm text-gray-500">
                        Created {dayjs(job?.createdAt).fromNow()}
                      </div>

                      <Link href={`/job/openPositions/${job?.id}`} passHref>
                        <Button
                          className={`flex justify-center text-sm font-medium p-2 px-10 ${
                            job?.jobStatus === 'Closed'
                              ? 'bg-[#F8F8F8] text-[#A0AEC0] cursor-not-allowed'
                              : 'bg-primary text-white'
                          }`}
                          disabled={job?.jobStatus === 'Closed'}
                        >
                          Apply
                        </Button>
                      </Link>
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
                          onClick: () => handleChangeStatus(job),
                        },
                        {
                          label: 'Share',
                          key: '2',
                          onClick: () => handleShareModalVisible(job?.id),
                        },
                        {
                          label: 'Edit',
                          key: '3',
                          // onClick: () => handleEditModalVisible(job?.id),
                        },
                      ],
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
          </Col>
        ))}
      </Row>
      <ShareToSocialMedia />
      <ChangeStatusModal />
    </div>
  );
};

export default OpenPositions;
