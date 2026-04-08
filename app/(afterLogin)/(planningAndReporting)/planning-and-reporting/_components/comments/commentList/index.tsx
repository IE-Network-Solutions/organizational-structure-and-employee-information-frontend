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
import { Button, Input, Form, Avatar } from 'antd';
import relativeTime from 'dayjs/plugin/relativeTime';
import dayjs from 'dayjs';
import CommentActionMenu from '../commentActionMenu';
import { useState, useMemo, useEffect, useRef } from 'react';
import { SendOutlined } from '@ant-design/icons';

dayjs.extend(relativeTime);

const CommentList = ({
  data,
  planId,
  isPlanCard,
  showAddForm = true,
  resetToggle = 0,
  onEdit,
  onFormSubmit,
}: {
  data: CommentsData[];
  planId: string;
  isPlanCard: boolean;
  showAddForm?: boolean;
  resetToggle?: number;
  onEdit?: () => void;
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

  const [form] = Form.useForm();
  const [editingCommentId, setEditingCommentId] = useState<string>('');
  const [commentValue, setCommentValue] = useState<string>('');
  const { userId } = useAuthenticationStore();
  const lastResetToggle = useRef(resetToggle);

  const [localComments, setLocalComments] = useState<CommentsData[]>(data);

  useEffect(() => {
    setLocalComments(data);
  }, [data]);

  const getUserDetail = useMemo(
    () => (id: string) => {
      const user = allUsers?.items?.find((user: any) => id === user.id);
      if (!user) {
        return { fullName: 'Unknown', initials: 'U', profileImage: null };
      }
      const firstName = user.firstName || '';
      const middleName = user.middleName || '';
      return {
        fullName: `${firstName} ${middleName}`.trim() || 'Unknown',
        initials:
          `${firstName.charAt(0)}${middleName.charAt(0)}`.toUpperCase() || 'U',
        profileImage: user.profileImage,
      };
    },
    [allUsers],
  );

  const handleSubmit = () => {
    form
      .validateFields()
      .then((values) => {
        if (editingCommentId !== '') {
          const updateMutation = isPlanCard
            ? onUpdatePlanComment
            : onUpdateReportComment;

          setLocalComments((prev) =>
            prev.map((c) =>
              c.id === editingCommentId
                ? {
                    ...c,
                    comment: values.comment,
                    updatedAt: new Date().toISOString(),
                  }
                : c,
            ),
          );

          updateMutation(
            {
              id: editingCommentId,
              updatedComment: { comment: values.comment } as any,
            },
            {
              onSuccess: () => {
                form.resetFields();
                setEditingCommentId('');
                setCommentValue('');
              },
              onError: () => {
                setLocalComments(data);
              },
            },
          );
        } else {
          const addMutation = isPlanCard
            ? onAddPlanComment
            : onAddReportComment;

          const optimisticComment: CommentsData = {
            id: `optimistic-${Date.now()}`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            deletedAt: null,
            createdBy: userId,
            updatedBy: null,
            commentedBy: userId,
            comment: values.comment,
            tenantId: '',
          };
          setLocalComments((prev) => [...prev, optimisticComment]);

          addMutation(values, {
            onSuccess: () => {
              form.resetFields();
              setCommentValue('');
            },
            onError: () => {
              setLocalComments(data);
            },
          });
        }
      })
      .finally(() => {
        onFormSubmit?.();
      });
  };

  useEffect(() => {
    const isResetTriggered = resetToggle !== lastResetToggle.current;
    if (isResetTriggered || !showAddForm) {
      setEditingCommentId('');
      setCommentValue('');
      form.resetFields();
    }
    lastResetToggle.current = resetToggle;
  }, [resetToggle, showAddForm, form]);

  const commentBeingEdited = useMemo(() => {
    if (!editingCommentId) return null;
    return localComments.find((c) => c.id === editingCommentId);
  }, [editingCommentId, localComments]);

  const handleEdit = (commentData: CommentsData) => {
    setCommentValue(commentData.comment);
    setEditingCommentId(commentData.id);
    onEdit?.();
    form.setFieldsValue({ comment: commentData.comment });
  };

  useEffect(() => {
    if (editingCommentId && showAddForm && commentBeingEdited) {
      setCommentValue(commentBeingEdited.comment);
      form.setFieldsValue({ comment: commentBeingEdited.comment });
    }
  }, [editingCommentId, showAddForm, commentBeingEdited, form]);

  const handleDelete = (id: string) => {
    setLocalComments((prev) => prev.filter((c) => c.id !== id));
    const mutation = isPlanCard ? deletePlanComment : deleteReportComment;
    mutation(id, {
      onError: () => {
        setLocalComments(data);
      },
    } as any);
  };

  const isLoading =
    addPlanLoading ||
    addReportLoading ||
    deletePlanLoading ||
    deleteReportLoading ||
    editPlanLoading ||
    editReportLoading;

  const sortedComments = useMemo(() => {
    return [...localComments].sort(
      (a, b) => dayjs(a.createdAt).unix() - dayjs(b.createdAt).unix(),
    );
  }, [localComments]);

  return (
    <div
      data-cy="-components-comments-commentlist-index-tsx-index-div-179"
      className="w-full"
    >
      {/* Comment thread */}
      <div
        data-cy="auto-app-afterlogin-planningandreporting-planning-and-reporting-components-comments-commentlist-index-tsx-div-L214"
        className="space-y-2"
      >
        {sortedComments.map((commentData) => {
          const { fullName, initials, profileImage } = getUserDetail(
            commentData.commentedBy,
          );
          const isOwnComment = commentData.commentedBy === userId;
          const timeAgo = dayjs(commentData.createdAt).fromNow();

          return (
            <div
              key={commentData.id}
              className="group/comment flex items-start gap-2"
              data-cy="planningandreporting-planning-and-reporting-components-comments-commentlist-index-tsx-div-190"
            >
              <Avatar
                src={profileImage || undefined}
                size={24}
                className="flex-shrink-0 mt-0.5"
                style={{
                  backgroundColor: profileImage ? undefined : '#E0E7FF',
                  color: profileImage ? undefined : '#4C1D95',
                  fontSize: '10px',
                  fontWeight: 700,
                }}
              >
                {!profileImage && initials}
              </Avatar>

              <div
                data-cy="auto-app-afterlogin-planningandreporting-planning-and-reporting-components-comments-commentlist-index-tsx-div-L242"
                className="flex-1 min-w-0"
              >
                <div
                  data-cy="auto-app-afterlogin-planningandreporting-planning-and-reporting-components-comments-commentlist-index-tsx-div-L243"
                  className="flex items-baseline gap-2"
                >
                  <span
                    data-cy="auto-app-afterlogin-planningandreporting-planning-and-reporting-components-comments-commentlist-index-tsx-span-L244"
                    className="text-[12px] font-semibold text-[#161A2C]"
                  >
                    {fullName}
                  </span>
                  <span
                    data-cy="auto-app-afterlogin-planningandreporting-planning-and-reporting-components-comments-commentlist-index-tsx-span-L247"
                    className="text-[10px] text-[#B0B3C0]"
                  >
                    {timeAgo}
                  </span>
                </div>
                <p
                  data-cy="auto-app-afterlogin-planningandreporting-planning-and-reporting-components-comments-commentlist-index-tsx-p-L249"
                  className="text-[12px] text-[#4B5563] leading-relaxed mt-0.5 break-words"
                >
                  {commentData.comment}
                </p>
              </div>

              {isOwnComment && (
                <div
                  data-cy="auto-app-afterlogin-planningandreporting-planning-and-reporting-components-comments-commentlist-index-tsx-div-L255"
                  className="flex-shrink-0 opacity-0 group-hover/comment:opacity-100 transition-opacity"
                >
                  <CommentActionMenu
                    onEdit={() => handleEdit(commentData)}
                    onDelete={() => handleDelete(commentData.id)}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Input */}
      {showAddForm && (
        <Form
          form={form}
          layout="inline"
          className="w-full mt-3"
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
            rules={[{ required: true, message: '' }]}
            className="w-full mb-0"
          >
            <div
              data-cy="auto-app-afterlogin-planningandreporting-planning-and-reporting-components-comments-commentlist-index-tsx-div-L290"
              className="flex items-center gap-2"
            >
              <Input
                id={`planning-comment-textarea-${planId || 'new'}`}
                data-cy={`planning-comment-textarea-${planId || 'new'}`}
                placeholder={
                  editingCommentId
                    ? 'Edit your comment...'
                    : 'Write a comment...'
                }
                className={`flex-1 rounded-lg text-[12px] !py-1.5 !px-3 ${
                  editingCommentId
                    ? '!border-[#574CFF]/30 !bg-[#574CFF]/[0.03]'
                    : '!border-[#E5E7EB] !bg-[#FAFBFC]'
                } focus:!border-[#574CFF] focus:!shadow-[0_0_0_2px_rgba(87,76,255,0.08)]`}
                value={commentValue}
                onChange={(e) => {
                  const newValue = e.target.value;
                  setCommentValue(newValue);
                  form.setFieldsValue({ comment: newValue });
                }}
                onPressEnter={(e) => {
                  e.preventDefault();
                  handleSubmit();
                }}
              />
              <Button
                id={`planning-comment-submit-button-${planId || 'new'}`}
                data-cy={`planning-comment-submit-button-${planId || 'new'}`}
                loading={isLoading}
                type="primary"
                htmlType="submit"
                icon={<SendOutlined className="text-[11px]" />}
                className="!h-7 !min-h-7 !w-auto !min-w-0 !shrink-0 !rounded-md !px-2.5 !py-0 !bg-[#1E40AF] !text-white hover:!bg-[#1E3A8A]"
              >
                {editingCommentId ? 'Update' : 'Send'}
              </Button>
              {editingCommentId && (
                <Button
                  id={`planning-comment-cancel-button-${planId || 'new'}`}
                  data-cy={`planning-comment-cancel-button-${planId || 'new'}`}
                  type="text"
                  size="small"
                  onClick={() => {
                    setEditingCommentId('');
                    setCommentValue('');
                    form.resetFields();
                  }}
                  className="!text-[11px] !text-[#8F94A3] hover:!text-[#EF4444] !px-2 !h-[30px]"
                >
                  Cancel
                </Button>
              )}
            </div>
          </Form.Item>
        </Form>
      )}
    </div>
  );
};

export default CommentList;
