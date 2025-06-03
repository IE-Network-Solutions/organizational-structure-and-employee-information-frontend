// components/MeetingDetail/CommentsSection.tsx
import { Avatar, Tooltip } from 'antd';
import CommentComponent from './Comments';
import { useMeetingStore } from '@/store/uistate/features/conversation/meeting';
import { useGetMeetingComments } from '@/store/server/features/CFR/meeting/queries';
import { useGetEmployee } from '@/store/server/features/employees/employeeManagment/queries';
import { LoadingOutlined, UserOutlined } from '@ant-design/icons';

export default function CommentsSection({ meetingId,canEditComment }: { meetingId: string,canEditComment:boolean }) {
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
      <div className="flex gap-2 items-center">
        <Tooltip title={type == 'all' ? '' : userName}>
          <Avatar src={profileImage} icon={<UserOutlined />} />
        </Tooltip>

        {type == 'all' && <div>{userName}</div>}
      </div>
    );
  };
  return (
    <div className=" p-4 space-y-2">
      <div className="flex items-center gap-2">
        <Avatar.Group
          maxCount={5}
          maxStyle={{ color: '#f56a00', backgroundColor: '#fde3cf' }}
          className="mt-1"
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
              />
            ))}
        </Avatar.Group>

        <span
          onClick={() => handleOpenCloseComment()}
          className="font-semibold text-gray-800 cursor-pointer"
        >
          {comments?.length} Comments
        </span>
      </div>
      {showComments && (
        <CommentComponent canEditComment={canEditComment} commentData={comments} meetingId={meetingId} />
      )}
      {/* <Input.TextArea rows={3} placeholder="[[Comment by the person]]" /> */}
    </div>
  );
}
