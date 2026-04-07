// components/MeetingDetail/CommentsSection.tsx
import { Avatar, Tooltip } from 'antd';
import CommentComponent from './Comments';
import { useMeetingStore } from '@/store/uistate/features/conversation/meeting';
import { useGetMeetingComments } from '@/store/server/features/CFR/meeting/queries';
import { useGetEmployee } from '@/store/server/features/employees/employeeManagment/queries';
import { LoadingOutlined, UserOutlined } from '@ant-design/icons';

export default function CommentsSection({
  meetingId,
  canEditComment,
}: {
  meetingId: string;
  canEditComment: boolean;
}) {
  const { showComments, setShowComments } = useMeetingStore();
  const { data: comments } = useGetMeetingComments(meetingId);
  function handleOpenCloseComment() {
    setShowComments(!showComments);
  }
  const EmployeeDetails = ({
    empId,
    type,
  }: {
    empId: string;
    type: string;
  }) => {
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
      <div
        className="flex gap-2 items-center"
        data-cy="comments-section-user-container"
      >
        <Tooltip title={type == 'all' ? '' : userName}>
          <Avatar src={profileImage} icon={<UserOutlined />} />
        </Tooltip>

        {type == 'all' && (
          <div data-cy="comments-section-user-name">{userName}</div>
        )}
      </div>
    );
  };
  return (
    <div
      className=" p-4 space-y-2"
      data-cy="feedback-meeting-components-commentssection-div"
      id="feedback-meeting-components-commentssection-div"
    >
      <div
        className="flex items-center gap-2"
        data-cy="feedback-meeting-components-commentssection-div-header"
        id="feedback-meeting-components-commentssection-div-header"
      >
        <Avatar.Group
          maxCount={5}
          maxStyle={{ color: '#f56a00', backgroundColor: '#fde3cf' }}
          className="mt-1"
          data-cy="feedback-meeting-components-commentssection-avatar-group"
        >
          {comments
            ?.filter(
              (res: any, index: number, self: any[]) =>
                self.findIndex((r) => r.userId === res.userId) === index,
            )
            ?.map((res: any) => (
              <EmployeeDetails
                key={res.userId}
                type="avatar"
                empId={res.userId}
                data-cy={`feedback-meeting-components-commentssection-avatar-${res.userId}`}
              />
            ))}
        </Avatar.Group>

        <span
          onClick={() => handleOpenCloseComment()}
          className="font-semibold text-gray-800 cursor-pointer"
          data-cy="feedback-meeting-components-commentssection-span-toggle"
          id="feedback-meeting-components-commentssection-span-toggle"
        >
          {comments?.length} Comments
        </span>
      </div>
      {showComments && (
        <CommentComponent
          canEditComment={canEditComment}
          commentData={comments}
          meetingId={meetingId}
          data-cy="feedback-meeting-components-commentssection-comment-component"
        />
      )}
      {/* <Input.TextArea rows={3} placeholder="[[Comment by the person]]" /> */}
    </div>
  );
}
