// components/MeetingDetail/ParticipantsList.tsx
import { Tag, Avatar, Button, Tooltip, Spin } from 'antd';
import AddParticipantsPopconfirm from './AddParticipant';
import { LoadingOutlined, UserOutlined } from '@ant-design/icons';
import { useGetEmployee } from '@/store/server/features/employees/employeeManagment/queries';

const statusColorMap: Record<string, string> = {
  Revert: 'red',
  Confirmed: 'green',
  Confirm: 'blue',
  'Not Confirmed': 'orange',
};

interface ParticipantsListProps {
  meeting: any; // Replace 'any' with a more specific type if available
  loading: boolean;
}

export default function ParticipantsList({
  meeting,
  loading,
}: ParticipantsListProps) {
  const EmployeeDetails = ({
    empId,
    isEmp,
    guest,
  }: {
    empId: string;
    isEmp: boolean;
    guest: any;
  }) => {
    const { data: userDetails, isLoading } = useGetEmployee(empId);
    if (isLoading && isEmp)
      return (
        <>
          <LoadingOutlined />
        </>
      );

    const userName =
      `${userDetails?.firstName} ${userDetails?.middleName} ${userDetails?.lastName} ` ||
      '-';
    const email = `${userDetails?.email} ` || '-';
    const profileImage = userDetails?.profileImage;
    const guestName = guest?.name;
    const guestEmail = guest?.email;

    return (
      <>
        {isEmp ? (
          <div className="flex gap-2">
            <Avatar src={profileImage} icon={<UserOutlined />} />
            <div>
              <span className="text-[10px]">{userName}</span>

              <Tooltip title={email}>
                <div className="text-[8px] text-gray-500">
                  {email?.length >= 20 ? email?.slice(0, 20) + '...' : email}
                </div>
              </Tooltip>
            </div>
          </div>
        ) : (
          <div className="flex gap-2">
            <Avatar icon={<UserOutlined />} />
            <div>
              <span className="text-[10px]">{guestName}</span>

              <Tooltip title={guestEmail}>
                <div className="text-[8px] text-gray-500">
                  {guestEmail?.length >= 20
                    ? guestEmail?.slice(0, 20) + '...'
                    : guestEmail}
                </div>
              </Tooltip>
            </div>
          </div>
        )}
      </>
    );
  };
  return (
    <div className=" p-4 space-y-3">
      <div className="flex justify-between items-center py-2">
        <h2 className="text-lg font-semibold mb-2">List of Participants</h2>
        <AddParticipantsPopconfirm meetingId={meeting?.id} loading={loading} />
      </div>
      {loading ? (
        <div className="flex justify-center">
          <Spin />
        </div>
      ) : (
        <>
          {meeting?.attendees?.map((p: any, i: number) => (
            <div
              key={i}
              className="flex justify-between items-center border p-2 rounded-md"
            >
              <EmployeeDetails
                isEmp={p?.userId == null ? false : true}
                empId={p?.userId}
                guest={p.guestUser}
              />

              {p.attendanceStatus ? (
                <Tag
                  className="font-bold border-none min-w-16 text-center capitalize text-[8px]"
                  color={statusColorMap[p.attendanceStatus]}
                >
                  {p.attendanceStatus}
                </Tag>
              ) : (
                <Button type="primary" className="text-[8px]">
                  Confirm
                </Button>
              )}
            </div>
          ))}
        </>
      )}
    </div>
  );
}
