'use client';

import DeleteModal from '@/components/common/deleteConfirmationModal';
import { Button, List } from 'antd';
import React from 'react';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
// import { useDeleteOkrRule } from '@/store/server/features/okrplanning/monitoring-evaluation/okr-rule/mutations';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';
import { FaPlus } from 'react-icons/fa';
import MeetingTypeDrawer from './_components/meetingTypeDrawer';
import { useMeetingStore } from '@/store/uistate/features/conversation/meeting';
import { GoPencil } from 'react-icons/go';
import MeetingTypeDetail from './_components/meetingTypeDetail';

const DefineMeetingType = () => {
  const {
    open,
    setOpen,
    openDeleteModal,
    setOpenDeleteModal,
    deletedId,
    setDeletedId,
    meetingType,
    setMeetingType,
    meetingTypeDetailData,
    setMeetingTypeDetail
  } = useMeetingStore();

  // const { mutate: deleteOkrRule } = useDeleteMeetingType();
  const showDrawer = () => {
    setOpen(true);
  };
  const onClose = () => {
    setOpen(false);
  };
  const showDeleteModal = (id: string) => {
    setOpenDeleteModal(true);
    setDeletedId(id);
  };
  const onCloseDeleteModal = () => {
    setOpenDeleteModal(false);
  };
  const handleEditModal = (value: any) => {
    setMeetingType(value);
    setOpen(true);
  };
  const handleDetail=(item:any)=>{
    console.log(item,"itemitem")
    setMeetingTypeDetail(item)
  }
  // function handleDeleteMeetingType(id: string) {
  //   deleteMeetingType(id, {
  //     onSuccess: () => {
  //       onCloseDeleteModal();
  //     },
  //   });
  // }
const meetingTypes = [
  {
    id: '1',
    name: 'Introduction to Next.js',
    description: 'A beginner-friendly guide to building web apps with Next.js.'
  },
  {
    id: '2',
    name: 'Routing in Next.js',
    description: 'Understand file-based routing and dynamic routes in Next.js.'
  },
  {
    id: '3',
    name: 'API Routes',
    description: 'Create backend endpoints using API routes in your Next.js app.'
  },
  {
    id: '4',
    name: 'Static Site Generation (SSG)',
    description: 'Learn how to pre-render pages at build time for performance.'
  },
  {
    id: '5',
    name: 'Server-Side Rendering (SSR)',
    description: 'Explore how to render pages on each request with Next.js.'
  }
];  
console.log(meetingTypeDetailData,"meetingTypeDetailData")
  return (
    <>
    {meetingTypeDetailData?<MeetingTypeDetail />:
    <div className="p- rounded-2xl bg- h-full ">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Meeting Types</h2>
        {/* <AccessGuard permissions={[Permissions.CreateMeetingType]}> */}
          <Button
            type="primary"
            className="bg-blue-500 hover:bg-blue-600 focus:bg-blue-600"
            icon={<FaPlus className="text-xs" />}
            onClick={showDrawer}
          >
            <span className="hidden md:block ">Add New</span>
          </Button>
        {/* </AccessGuard> */}
      </div>

      <List
        dataSource={meetingTypes}
        bordered={false}
        renderItem={(item) => (
          <List.Item className="flex justify-between items-center py-4 px-4 rounded-xl my-3 border border-gray-300 ">
            <span  onClick={() => handleDetail(item)} className="cursor-pointer">{item?.name || 'Unknown title'}</span>
            <div>
              {/* <AccessGuard permissions={[Permissions.UpdateMeetingType]}> */}
                <Button
                  icon={<GoPencil  />}
                  className="mr-2 bg-blue text-white border-none rounded-md"
                  onClick={() => handleEditModal(item)}
                />
              {/* </AccessGuard> */}
              {/* <AccessGuard permissions={[Permissions.DeleteMeetingType]}> */}
                <Button
                  icon={<DeleteOutlined />}
                  className="mr-2 bg-red-500 text-white border-none  rounded-md"
                  onClick={() => showDeleteModal(item?.id as string)}
                />
              {/* </AccessGuard> */}
            </div>
          </List.Item>
        )}
      />
      <MeetingTypeDrawer meetType={meetingType} open={open} onClose={onClose} />
      <DeleteModal
        open={openDeleteModal}
        onConfirm={() => {}}
        onCancel={onCloseDeleteModal}
      />
    </div>}
    </>
    
  );
};

export default DefineMeetingType;
