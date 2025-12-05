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
import { SendOutlined } from '@ant-design/icons';

dayjs.extend(relativeTime);

const CommentList = ({
  data,
  planId,
  isPlanCard,
  showAddForm = true,
  onFormSubmit,
}: {
  data: CommentsData[];
  planId: string;
  isPlanCard: boolean;
  showAddForm?: boolean;
  onFormSubmit?: () => void;
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
                onFormSubmit?.(); // Notify parent
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
              onFormSubmit?.(); // Notify parent
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
      {data.map((commentData) => {
        const { fullName, profileImage } = getUserDetail(
          commentData.commentedBy,
        );
        const isOwnComment = commentData.commentedBy === userId;

        return (
          <div key={commentData.id} className={`w-full mb-3 flex items-start gap-2 ${isOwnComment ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`inline-block rounded-2xl px-4 py-3 shadow-sm ${
                isOwnComment
                  ? 'border border-[#574CFF] bg-white'
                  : 'bg-[#F5F5F7] border border-[#E5E7EB]'
              }`}
              style={{ maxWidth: '70%' }}
            >
              {/* Avatar and Name on top - Avatar first (left), then name - all inside bubble */}
              <div className="flex items-center gap-2 mb-2">
                <Avatar
                  src={profileImage || undefined}
                  icon={!profileImage ? <FaUser /> : undefined}
                  alt={fullName}
                  size="small"
                  className="flex-shrink-0"
                />
                <span className="text-sm font-semibold text-[#161A2C]">{fullName}</span>
              </div>
              {/* Comment text below - aligned left - inside bubble */}
              <div className="text-sm text-[#4B5563] break-words">
                {commentData.comment}
              </div>
            </div>
            {isOwnComment && (
              <CommentActionMenu
                onEdit={() => handleEdit(commentData)}
                onDelete={() => handleDelete(commentData.id)}
              />
            )}
          </div>
        );
      })}

      {showAddForm && (
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
            className="w-full mt-2 mb-0"
          >
            <div className="relative">
              <Input.TextArea
                placeholder="Add your comment here"
                className="rounded-2xl border-[#E5E7EB] bg-[#F9FAFB] px-4 pr-12"
                style={{ height: '88px', paddingRight: '48px', resize: 'none' }}
                autoSize={false}
              />
              <Button
                loading={isLoading}
                type="text"
                htmlType="submit"
                icon={<SendOutlined />}
                className="absolute right-2 top-2 flex items-center justify-center !w-8 !h-8 !p-0 border-0 bg-transparent text-[#111827] hover:bg-transparent hover:text-[#574CFF]"
              />
            </div>
          </Form.Item>
        </Form>
      )}
    </div>
  );
};

export default CommentList;
