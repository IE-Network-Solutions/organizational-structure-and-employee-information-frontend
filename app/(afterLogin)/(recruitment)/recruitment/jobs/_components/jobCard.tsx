'use client';
import React, { useState } from 'react';
import { Card, Dropdown, Menu, Button, Avatar, Tooltip } from 'antd';
import type { MenuProps } from 'antd';
import { BsThreeDotsVertical } from 'react-icons/bs';
import { BiUser } from 'react-icons/bi';
import ChangeStatusModal from './modals/changeStatusModal';
import ShareModal from './modals/shareModal';
import EditModal from './modals/editModal';

const JobCard: React.FC<{ job: any }> = ({ job }) => {
  const [isChangeStatusModalVisible, setChangeStatusModalVisible] =
    useState(false);
  const [isShareModalVisible, setShareModalVisible] = useState(false);
  const [isEditModalVisible, setEditModalVisible] = useState(false);

  const items: MenuProps['items'] = [
    {
      label: 'Change Status',
      key: '1',
      onClick: () => setChangeStatusModalVisible(true),
    },
    {
      label: 'Share',
      key: '2',
      onClick: () => setShareModalVisible(true),
    },
    {
      label: 'Edit',
      key: '3',
      onClick: () => setEditModalVisible(true),
    },
  ];
  return (
    <>
      <Card className="mb-4 rounded-lg shadow-sm">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-bold text-lg  flex justify-center items-center gap-4">
              <>{job.title}</>
              {job.status == 'Closed' ? (
                <div
                  className={`mb-0 items-center rounded px-2 py-1 bg-[#F8F8F8] text-[#A0AEC0] `}
                >
                  {job.status}
                </div>
              ) : (
                <div
                  className={`mb-0 items-center rounded px-2 py-1
              ${job.status == 'Active' ? 'bg-[#B2B2FF] text-[#3636F0]' : 'bg-[#FFEDEC] text-[#E03137]'} 
              `}
                >
                  {job.status}
                </div>
              )}
            </h3>
            <p className="text-sm text-gray-500">{job.location}</p>
            <div className="flex items-center mt-2">
              {job.team.length > 0 &&
                job.team.map((member: any) => (
                  <Tooltip
                    title={
                      <div className="flex justify-start items-center gap-4">
                        <>{member.name}</>
                      </div>
                    }
                    key={member.id}
                  >
                    <Avatar
                      icon={<BiUser />}
                      src={member.avatar}
                      className="mr-1"
                    />
                  </Tooltip>
                ))}
            </div>
            <p className="text-sm text-gray-500">
              {job.candidates} Candidates Applied
            </p>
          </div>

          <div className="">
            <Dropdown menu={{ items }} trigger={['click']}>
              <Button icon={<BsThreeDotsVertical />} className="border-0" />
            </Dropdown>
          </div>
        </div>
      </Card>
      <ChangeStatusModal
        visible={isChangeStatusModalVisible}
        onClose={() => setChangeStatusModalVisible(false)}
      />
      <ShareModal
        visible={isShareModalVisible}
        onClose={() => setShareModalVisible(false)}
      />
      <EditModal
        visible={isEditModalVisible}
        onClose={() => setEditModalVisible(false)}
        jobTitle={job.title}
      />
    </>
  );
};

export default JobCard;
