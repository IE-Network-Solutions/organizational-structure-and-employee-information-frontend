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
import { Button, Col, Input, Form, Row, Avatar } from 'antd';
import relativeTime from 'dayjs/plugin/relativeTime';
import dayjs from 'dayjs';
import CommentActionMenu from '../commentActionMenu';
import { FaUser } from 'react-icons/fa';
import { useState, useMemo } from 'react';
import TextEditor from '@/components/form/textEditor';

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
  const { mutate: onAddPlanComment, isLoading: addPlanLoading } =
    useAddPlanComment();
  const { mutate: onAddReportComment, isLoading: addReportLoading } =
    useAddReportComment();
  const { mutate: deletePlanComment, isLoading: deletePlanLoading } =
    useDeletePlanComment();
  const { mutate: deleteReportComment, isLoading: deleteReportLoading } =
    useDeleteReportComment();
  const { mutate: onUpdatePlanComment, isLoading: editPlanLoading } =
    useUpdatePlanComment();
  const { mutate: onUpdateReportComment, isLoading: editReportLoading } =
    useUpdateReportComment();

  const [editingCommentId, setEditingCommentId] = useState<string>('');
  const { userId } = useAuthenticationStore();
  const [form] = Form.useForm();

  // Memoize the user details for performance
  const getUserDetail = useMemo(
    () => (id: string) => {
      const user = allUsers?.items?.find((user: any) => id === user.id);
      return user
        ? {
            fullName: `${user.firstName} ${user.middleName} ${user.lastName}`,
            profileImage: user.profileImage,
            role: user.role?.name || '-',
          }
        : {
            fullName: '-',
            profileImage: null,
            role: '-',
          };
    },
    [allUsers],
  );

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
  const handleEdit = (commentData: CommentsData) => {
    form.setFieldsValue({ comment: commentData.comment });
    setEditingCommentId(commentData.id);
  };

  const handleDelete = (id: string) => {
    const mutation = isPlanCard ? deletePlanComment : deleteReportComment;
    mutation(id);
  };

  const isLoading =
    addPlanLoading ||
    addReportLoading ||
    deletePlanLoading ||
    deleteReportLoading ||
    editPlanLoading ||
    editReportLoading;

  return (
    <div className="w-full">
      {data?.map((commentData) => {
        const { fullName, profileImage } = getUserDetail(
          commentData.commentedBy,
        );

        return (
          <Row
            key={commentData.id}
            justify="space-between"
            align="middle"
            className="w-full"
          >
            <Col>
              <div className="text-xs font-semibold flex items-center">
                <Avatar
                  src={profileImage || undefined}
                  icon={!profileImage ? <FaUser /> : undefined}
                  alt={fullName}
                  className="mr-1"
                />
                <span className="font-normal"> {fullName}</span>
                <div className="text-gray-400 text-xs ml-2">
                  {dayjs(commentData.createdAt).fromNow()}
                </div>
              </div>
              <div className="text-gray-700  ml-9 font-semibold">
                {commentData.comment}
              </div>
            </Col>
            <Col hidden={commentData?.commentedBy !== userId}>
              <CommentActionMenu
                onEdit={() => handleEdit(commentData)}
                onDelete={() => handleDelete(commentData.id)}
              />
            </Col>
          </Row>
        );
      })}

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

        <Form.Item
          name="comment"
          rules={[{ required: true, message: 'Please enter a comment' }]}
          className="w-full"
        >
          <TextEditor height={100} placeholder="Add a comment..." />
        </Form.Item>

        <Form.Item className="flex justify-end w-full">
          <Button
            loading={isLoading}
            type="primary"
            htmlType="submit"
            className="my-2 w-auto"
          >
            Comment
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default CommentList;
