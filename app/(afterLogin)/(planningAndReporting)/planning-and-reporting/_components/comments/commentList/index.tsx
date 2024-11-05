import { useGetAllUsers } from "@/store/server/features/employees/employeeManagment/queries";
import { useAddPlanComment, useDeletePlanComment, useUpdatePlanComment } from "@/store/server/features/okrplanning/planComments/mutations";
import { useAddReportComment, useDeleteReportComment, useUpdateReportComment } from "@/store/server/features/okrplanning/reportComments/mutations";
import { useAuthenticationStore } from "@/store/uistate/features/authentication";
import { CommentsData } from "@/types/okr";
import { Button, Col,Input, Form, Row, Avatar } from "antd";
import relativeTime from 'dayjs/plugin/relativeTime';

import dayjs from "dayjs";
import CommentActionMenu from "../commentActionMenu";
import { FaUser } from "react-icons/fa";
import { useState } from "react";

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
    const { mutate: onAddPlanComment } = useAddPlanComment();
    const { mutate: onAddReportComment } = useAddReportComment();
  
    const { mutate: deletePlanComment } = useDeletePlanComment();
    const { mutate: deleteReportComment } = useDeleteReportComment();
  
    const { mutate: onUpdatePlanComment } = useUpdatePlanComment();
    const { mutate: onUpdateReportComment } = useUpdateReportComment();
  
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
    return (
      <div className="w-full">
        {data.map((commentData) => (
          <div
            key={commentData.id}
            className="flex mb-4 p-3 border-b last:border-b-0"
          >
            <Avatar
              src={
                getUserDetail(commentData.commentedBy)?.profileImage || undefined
              }
              icon={
                !getUserDetail(commentData.commentedBy)?.profileImage ? (
                  <FaUser />
                ) : undefined
              }
              alt={getUserDetail(commentData.commentedBy)?.fullName || 'User'}
              className="mr-3"
            />
            <Row
              justify="space-between"
              align="middle"
              className="w-full mb-4 p-3 border-b last:border-b-0"
            >
              <Col>
                <div className="text-xs font-semibold">
                  {getUserDetail(commentData.commentedBy)?.fullName}
                </div>
                <div className="text-gray-700">{commentData.comment}</div>
                <div className="text-gray-500 text-xs">
                  {dayjs(commentData.createdAt).fromNow()}
                </div>
              </Col>
              <Col hidden={commentData.commentedBy !== userId}>
                <CommentActionMenu
                  onEdit={() => handleEdit(commentData)}
                  onDelete={() => handleDelete(commentData?.id)}
                />
              </Col>
            </Row>
          </div>
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



  export default CommentList;