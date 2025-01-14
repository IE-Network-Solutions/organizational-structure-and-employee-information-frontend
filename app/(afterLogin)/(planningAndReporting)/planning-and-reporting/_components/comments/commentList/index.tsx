import { useGetAllUsers } from '@/store/server/features/employees/employeeManagment/queries';
import {
  useAddPlanComment,
  useDeletePlanComment,
  useUpdatePlanComment,
} from '@/store/server/features/okrplanning/planComments/mutations';
import {
  useAddReportComment,
  useDeleteReportComment,
  useUpdateReportComment,
} from '@/store/server/features/okrplanning/reportComments/mutations';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { CommentsData } from '@/types/okr';
import { Button, Col, Input, Form, Row, Avatar, Collapse } from 'antd';
import relativeTime from 'dayjs/plugin/relativeTime';

import dayjs from 'dayjs';
import CommentActionMenu from '../commentActionMenu';
import { FaUser } from 'react-icons/fa';
import { useState } from 'react';
const { Panel } = Collapse;

dayjs.extend(relativeTime);

const CommentList = ({
  data,
  planId,
  isPlanCard,
}: {
  data: CommentsData[];
  planId: string;
  isPlanCard: boolean;
}) => {
  const { data: allUsers } = useGetAllUsers();
  const { mutate: onAddPlanComment,isLoading:addPlanLoading } = useAddPlanComment();
  const { mutate: onAddReportComment,isLoading:addReportLoading } = useAddReportComment();

  const { mutate: deletePlanComment,isLoading:deletePlanLoading } = useDeletePlanComment();
  const { mutate: deleteReportComment,isLoading:deleteReportLoading } = useDeleteReportComment();

  const { mutate: onUpdatePlanComment,isLoading:editPlanLoading } = useUpdatePlanComment();
  const { mutate: onUpdateReportComment,isLoading:editReportLoading } = useUpdateReportComment();

  const [editingCommentId, setEditingCommentId] = useState<string>('');

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
          fullName: `${user.firstName} ${user.middleName} ${user.lastName}`,
        }
      : {
          firstName: '-',
          lastName: '-',
          middleName: '-',
          profileImage: null,
          role: '-',
          fullName: '-',
        };
  };
  const [form] = Form.useForm();

  const handleSubmit = () => {
    form
      .validateFields()
      .then((values) => {
        if (editingCommentId !== '') {
          // Update existing comment
          const updateMutation = isPlanCard
            ? onUpdatePlanComment
            : onUpdateReportComment;

          updateMutation(
            { id: editingCommentId, updatedComment: values },
            {
              onSuccess: () => {
                form.resetFields(); // Reset the form after submission
                setEditingCommentId(''); // Clear edit mode
              },
            },
          );
        } else {
          // Add new comment logic (similar to previous response)
          const addMutation = isPlanCard
            ? onAddPlanComment
            : onAddReportComment;

          addMutation(values, {
            onSuccess: () => {
              form.resetFields(); // Reset the form after submission
            },
          });
        }
      })
      .catch(() => {
        // Handle validation error if needed
      });
  };

  const handleEdit = (data: CommentsData) => {
    form.setFieldsValue({ comment: data.comment });
    setEditingCommentId(data.id); // Set the ID to indicate edit mode
  };
  const handleDelete = (id: string) => {
    if (isPlanCard) {
      deletePlanComment(id);
    } else {
      deleteReportComment(id);
    }
  };
  console.log(data,userId,"6767")
  return (
    <div className="w-full">
    
        {data.map((commentData) => (
         
            <Row
              justify="space-between"
              align="middle"
              className="w-full p-3 border-b last:border-b-0"
            >
              <Col>
              
                <div className="text-xs font-semibold flex items-center">
                <Avatar
                  src={
                    getUserDetail(commentData.commentedBy)?.profileImage ||
                    undefined
                  }
                  icon={
                    !getUserDetail(commentData.commentedBy)?.profileImage ? (
                      <FaUser />
                    ) : undefined
                  }
                  alt={
                    getUserDetail(commentData.commentedBy)?.fullName || 'User'
                  }
                  className="mr-1"
                />
                  {getUserDetail(commentData.commentedBy)?.fullName}
                </div>
                <div className="text-gray-700">{commentData.comment}</div>
                <div className="text-gray-500 text-xs">
                  {dayjs(commentData.createdAt).fromNow()}
                </div>
              </Col>
              <Col hidden={commentData?.commentedBy !==userId}>
                <CommentActionMenu
                  onEdit={() => handleEdit(commentData)}
                  onDelete={() => handleDelete(commentData?.id)}
                />
              </Col>
            </Row>
          
        ))}
      

      <Form
        form={form}
        layout="inline"
        className="w-full mt-4"
        onFinish={handleSubmit}
      >
        <Form.Item
          name={isPlanCard ? 'planId' : 'reportId'}
          initialValue={planId}
          hidden
        >
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
              <Button loading={addPlanLoading||addReportLoading||
deletePlanLoading||
deleteReportLoading||
editPlanLoading||
editReportLoading} type="primary" htmlType="submit" className="w-full">
                Send
              </Button>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </div>
  );
};

export default CommentList;
