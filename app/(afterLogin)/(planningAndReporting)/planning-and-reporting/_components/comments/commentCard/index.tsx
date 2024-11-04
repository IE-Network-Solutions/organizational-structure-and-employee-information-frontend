import React, { useState } from 'react';
import { Card, Button, Dropdown, Menu, Skeleton, Avatar, Tooltip, Input, Form, Row, Col, Popconfirm } from 'antd';
import { useGetAllUsers } from '@/store/server/features/okrplanning/okr/users/queries';
import { CommentsData } from '@/types/okr';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { FaUser } from 'react-icons/fa';
import { useAddPlanComment, useDeleteComment } from '@/store/server/features/okrplanning/comments/mutations';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { MoreOutlined } from '@ant-design/icons';

// Extend Day.js with the relative time plugin
dayjs.extend(relativeTime);

interface Props {
  data: CommentsData[];
  loading: boolean;
  planId:string;
}


const ActionMenu = ({ onEdit, onDelete}:{ onEdit:any, onDelete:any }) => {
    const menu = (
            <Menu>
                <Menu.Item key="edit" onClick={onEdit}>
                    Edit
                </Menu.Item>
                <Menu.Item key="delete">
                    <Popconfirm
                    title="Are you sure you want to delete this comment?"
                    onConfirm={onDelete}
                    okText="Yes"
                    cancelText="No"
                    >
                    Delete
                    </Popconfirm>
                </Menu.Item>
                </Menu>
    );
  
    return (
      <Dropdown overlay={menu} trigger={['click']}>
        <Button type="text" icon={<MoreOutlined />} />
      </Dropdown>
    );
  };
  
const CommentList = ({ data,planId }: { data: CommentsData[],planId:string }) => {
  const { data: allUsers } = useGetAllUsers();
  const { mutate: onAddComment } = useAddPlanComment();
  const { mutate: deleteComment } = useDeleteComment();

  const { userId } = useAuthenticationStore();



  const getUserDetail = (id: string) => {
    const user = allUsers?.items?.find((user: any) => id === user.id);
    return user
      ? {
          firstName: user.firstName || '-',
          lastName: user.lastName || '-',
          middleName: user.middleName || '-',
          profileImage: user.profileImage,
          role: user.role?.name || '-',
          fullName: `${user.firstName} ${user.middleName} ${user.lastName}`
        }
      : {
          firstName: '-',
          lastName: '-',
          middleName: '-',
          profileImage: null,
          role: '-',
          fullName: '-'
        };
  };
  const [form] = Form.useForm();

  const handleSubmit = () => {

    form.validateFields()
      .then(values => {
        onAddComment(values,{
            onSuccess:()=>{
                form.resetFields(); // Reset the form after submission
            }
        }); 
      })
      .catch(info => {
        // console.log('Validation Failed:', info);
      });
  };
  const handleEdit = () => {

  };
  const handleDelete = (id:string) => {
    deleteComment(id,{
        onSuccess:()=>{
              
        }
    });
  };
  return (
    <div className='w-full'>
      {data.map((commentData) => (
        <div key={commentData.id} className="flex mb-4 p-3 border-b last:border-b-0">
          <Avatar
            src={getUserDetail(commentData.commentedBy)?.profileImage || undefined}
            icon={!getUserDetail(commentData.commentedBy)?.profileImage ? <FaUser /> : undefined}
            alt={getUserDetail(commentData.commentedBy)?.fullName || 'User'}
            className="mr-3"
          />
        <Row justify="space-between" align="middle" className="w-full mb-4 p-3 border-b last:border-b-0">
        <Col>
            <div className="text-xs font-semibold">
            {getUserDetail(commentData.commentedBy)?.fullName}
            </div>
            <div className="text-gray-700">
            {commentData.comment}
            </div>
            <div className="text-gray-500 text-xs">
            {dayjs(commentData.createdAt).fromNow()}
            </div>
        </Col>
        <Col hidden={commentData.commentedBy!==userId}>
            <ActionMenu onEdit={handleEdit} onDelete={()=>handleDelete(commentData?.id)} />
        </Col>
        </Row>
        </div>
      ))}
    <Form form={form} layout="inline" className="w-full mt-4" onFinish={handleSubmit}>
      <Form.Item name="planId" initialValue={planId} hidden>
        <Input type="hidden" />
      </Form.Item>
      <Form.Item name="commentedBy" initialValue={userId} hidden>
        <Input type="hidden" />
      </Form.Item>
      <Row gutter={8} align="middle" className="w-full">
        <Col span={20}>
          <Form.Item
            name="comment"
            rules={[{ required: true, message: 'Please enter a comment' }]}
            className="w-full"
          >
            <Input placeholder="Add a comment..." />
          </Form.Item>
        </Col>
        <Col span={4}>
          <Form.Item>
            <Button type="primary" htmlType="submit" className="w-full">
              Send
            </Button>
          </Form.Item>
        </Col>
      </Row>
    </Form>

    </div>
  );
};

const CommentAuthorsAvatars = (data: CommentsData[]) => {
  const { data: allUsers } = useGetAllUsers();

  const getUserDetail = (id: string) => {
    const user = allUsers?.items?.find((user: any) => id === user.id);
    return user
      ? {
          firstName: user.firstName || '-',
          lastName: user.lastName || '-',
          middleName: user.middleName || '-',
          profileImage: user.profileImage,
          role: user.role?.name || '-',
          fullName: `${user.firstName} ${user.middleName} ${user.lastName}`
        }
      : {
          firstName: '-',
          lastName: '-',
          middleName: '-',
          profileImage: null,
          role: '-',
          fullName: '-'
        };
  };

  const maxDisplayCount = 10;
  const displayData = data?.slice(0, maxDisplayCount);
  const extraCount = data && data.length > maxDisplayCount ? data.length - maxDisplayCount : 0;
  
  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      {displayData?.map((commentData, index) => {
        const userDetail = getUserDetail(commentData.commentedBy);
        return (
          <Tooltip key={index} title={userDetail.fullName}>
            <Avatar
              src={userDetail.profileImage || undefined}
              icon={!userDetail.profileImage ? <FaUser /> : undefined}
              className="cursor-pointer"
              style={{
                border: '2px solid white',
                marginLeft: index > 0 ? -10 : 0, // Half-overlap effect
                zIndex: maxDisplayCount - index, // Ensures proper stacking order
              }}
            />
          </Tooltip>
        );
      })}
      {extraCount > 0 && (
        <div style={{ marginLeft: -10, padding: '0 10px', fontSize: '14px', background: '#f0f0f0', borderRadius: '50%' }}>
          +{extraCount}
        </div>
      )}
    </div>
  );
};

  
const CommentCard: React.FC<Props> = ({ data, loading,planId }) => {
  const [viewComment, setViewComment] = useState(false);

  return (
    <Card
      title={CommentAuthorsAvatars(data)}
      extra={<Button type="primary" onClick={() => setViewComment(!viewComment)}>
            Comment
        </Button>}
    >
        {loading ? (
          <>
            <Skeleton active title={false} paragraph={{ rows: 3, width: ['100%', '80%', '60%'] }} />
            <Skeleton.Button active shape="round" style={{ width: 100 }} />
          </>
        ) : (
          <>
            {viewComment && <CommentList data={data} planId={planId} />}
          </>
        )}
    </Card>
  );
};

export default CommentCard;
