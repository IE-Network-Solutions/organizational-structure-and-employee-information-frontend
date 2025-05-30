import React, { useEffect, useMemo } from 'react';
import { Row, Avatar, Form, Button, Tooltip } from 'antd';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { EditorContent, useEditor } from '@tiptap/react';
import { useGetMeetingAttendees } from '@/store/server/features/CFR/meeting/attendees/queries';
import { createMentionExtension } from './CustomMention';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextStyle from '@tiptap/extension-text-style';
import TextAlign from '@tiptap/extension-text-align';
import Placeholder from '@tiptap/extension-placeholder';
import {
  useGetAllUsers,
  useGetEmployee,
} from '@/store/server/features/employees/employeeManagment/queries';
import { useMeetingStore } from '@/store/uistate/features/conversation/meeting';
import {
  useCreateComments,
  useDeleteComments,
  useUpdateComments,
} from '@/store/server/features/CFR/meeting/mutations';
import { useAuthenticationStore } from '@/store/uistate/features/authentication';
import { UserOutlined, LoadingOutlined } from '@ant-design/icons';
import CommentActionMenu from '@/app/(afterLogin)/(planningAndReporting)/planning-and-reporting/_components/comments/commentActionMenu';
dayjs.extend(relativeTime);

// Function to get user details
const EmployeeDetails = ({ empId, type }: { empId: string; type: string }) => {
  const { data: userDetails, isLoading, error } = useGetEmployee(empId);

  if (isLoading)
    return (
      <>
        <LoadingOutlined />
      </>
    );

  if (error || !userDetails) return '-';

  const userName =
    `${userDetails?.firstName} ${userDetails?.middleName} ${userDetails?.lastName} ` ||
    '-';
  const profileImage = userDetails?.profileImage;
  return (
    <div className="flex gap-2 items-center">
      <Tooltip title={type == 'all' ? '' : userName}>
        <Avatar size={20} src={profileImage} icon={<UserOutlined />} />
      </Tooltip>

      {type == 'all' && (
        <div className="text-[10px]">
          {userName?.length > 10 ? userName?.slice(0, 10) + '...' : userName}
        </div>
      )}
    </div>
  );
};

type CommentComponentProps = {
  meetingId: string;
  commentData: any;
};

const CommentComponent: React.FC<CommentComponentProps> = ({
  meetingId,
  commentData,
}) => {
  const [form] = Form.useForm();
  const { comments, setComments, commentUpdate, setCommentUpdate } =
    useMeetingStore() as {
      comments: string;
      setComments: (c: string) => void;
      commentUpdate: any | null;
      setCommentUpdate: (c: any | null) => void;
    };
  const { mutate: createComment, isLoading: createLoading } =
    useCreateComments();
  const { mutate: updateComment, isLoading: updateLoading } =
    useUpdateComments();
  const { mutate: deleteComment, isLoading: deleteLoading } =
    useDeleteComments();
  const { userId } = useAuthenticationStore();

  const handleSubmit = () => {
    if (commentUpdate) {
      updateComment(
        { comments: comments, userId, id: commentUpdate.id },
        {
          onSuccess() {
            setComments('');
            setCommentUpdate(null);
          },
        },
      );
    } else {
      createComment(
        { meetingId, comments: comments, userId },
        {
          onSuccess() {
            setComments('');
          },
        },
      );
    }
  };

  const handleUpdate = (comment: any) => {
    setCommentUpdate(comment);
    setComments(comment.comments);
  };

  const { data: attendeesData, isLoading: loadingAttendees } =
    useGetMeetingAttendees(meetingId);
  const { data: employeeData } = useGetAllUsers();

  const getEmployeeData = (id: string) => {
    return employeeData?.items?.find((emp: any) => emp?.id === id) || {};
  };

  // 🧠 Memoize attendees
  const attendees = useMemo(() => {
    if (!attendeesData?.items || !employeeData?.items) return [];

    return attendeesData.items
      .filter((item: any) => item.userId)
      .map((item: any) => {
        const user = getEmployeeData(item.userId);
        return {
          id: item.userId,
          label:
            user?.firstName + ' ' + user?.middleName + ' ' + user?.lastName,
          profileImage: user?.profileImage,
        };
      });
  }, [attendeesData, employeeData]);

  const editor = useEditor(
    {
      extensions: [
        StarterKit,
        Underline,
        TextStyle,
        TextAlign.configure({ types: ['heading', 'paragraph'] }),
        Placeholder.configure({
          placeholder: 'Type @ to mention attendees...',
        }),
        createMentionExtension(attendees),
      ],
      content: comments,
      // editable: canEdit,
    },
    [loadingAttendees, attendees],
  );

  // Update editor content when content from store changes
  useEffect(() => {
    if (editor && comments !== undefined) {
      const currentContent = editor.getHTML();
      if (currentContent !== comments) {
        editor.commands.setContent(comments);
      }
    }
  }, [editor, comments]);

  // Set up editor update listener
  useEffect(() => {
    if (!editor) return;

    const handleUpdate = () => {
      const html = editor.getHTML();
      setComments(html);
    };

    editor.on('update', handleUpdate);

    return () => {
      editor.off('update', handleUpdate);
    };
  }, [editor, setComments]);

  function handleDelete(id: string) {
    deleteComment(id);
  }

  return (
    <div className="w-full">
      {commentData?.map((comment: any) => (
        <Row
          key={comment.id}
          justify="space-between"
          align="middle"
          className="w-full p-2 border-b-2"
        >
          <div className="grid grid-cols-[auto_1fr_auto] items-center gap-2">
            <EmployeeDetails type="all" empId={comment.userId} />

            <div
              className="text-gray-700 font-semibold text-[12px]"
              dangerouslySetInnerHTML={{ __html: comment.comments }}
            />
            {comment.userId == userId &&
              (!deleteLoading ? (
                <CommentActionMenu
                  onEdit={() => handleUpdate(comment)}
                  onDelete={() => handleDelete(comment.id)}
                />
              ) : (
                <LoadingOutlined className="text-gray-500" />
              ))}
          </div>
        </Row>
      ))}
      <Form
        form={form}
        layout="inline"
        className="w-full mt-4"
        // onFinish={handleSubmit}
      >
        <div className="w-full flex flex-col gap-2">
          <EditorContent
            className="min-h-20 border rounded-md px-2 py-1 focus:outline-none"
            editor={editor}
          />

          <div className="flex  justify-end mr-0">
            <Button
              loading={createLoading || updateLoading}
              type="primary"
              onClick={() => handleSubmit()}
              className="w-24"
            >
              Send
            </Button>
          </div>
        </div>
      </Form>
    </div>
  );
};

export default CommentComponent;
