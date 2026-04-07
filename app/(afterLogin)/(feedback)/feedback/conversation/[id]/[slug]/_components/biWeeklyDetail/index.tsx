import { Card, Divider, List } from 'antd';
import { MdKeyboardArrowRight } from 'react-icons/md';
import dayjs from 'dayjs';
import { useGetAllUsers } from '@/store/server/features/employees/employeeManagment/queries';
import { ConversationStore } from '@/store/uistate/features/conversation';
import UserCard from '@/components/common/userCard/userCard';

type ConversationInstanceDetailProps = {
  conversationInstance: any;
};

function ConversationInstanceDetail({
  conversationInstance,
}: ConversationInstanceDetailProps) {
  const { selectedUserId, setSelectedUserId } = ConversationStore();
  const { data: allUserData } = useGetAllUsers();

  const attendees = conversationInstance?.userId?.map((userId: string) => {
    const employeeDataDetail = allUserData?.items?.find(
      (emp: any) => emp?.id === userId,
    );
    return employeeDataDetail || {};
  });

  return (
    <Card className="mb-3">
      <>
        <div
          className="flex flex-col gap-3 items-center"
          data-cy="bi-weekly-detail-header"
        >
          <h5 className="text-lg font-semibold" data-cy="bi-weekly-detail-name">
            {conversationInstance?.name ?? 'N/A'}
          </h5>
          <span
            className="text-sm text-gray-500"
            data-cy="bi-weekly-detail-date"
          >
            {dayjs(conversationInstance?.createdAt).format('MMMM D, YYYY')}
          </span>
          <Divider className="my-2" />
        </div>

        <span
          className="flex justify-center items-center mb-2 text-lg font-bold"
          data-cy="bi-weekly-detail-attendees-title"
        >
          Attendees
        </span>
        <Divider className="my-2" />

        <List
          split={false}
          size="small"
          dataSource={attendees}
          renderItem={(attendee: any) => {
            const activePosition = attendee?.employeeJobInformation?.find(
              (info: any) => info.isPositionActive,
            );
            return (
              <List.Item
                onClick={() => {
                  if (selectedUserId !== attendee?.id) {
                    setSelectedUserId(attendee?.id); // Set selectedUserId to the attendee's id
                  } else {
                    setSelectedUserId(''); // Reset selectedUserId if it's already the same as the attendee's id
                  }
                }}
                className={`${
                  selectedUserId === attendee?.id
                    ? 'ml-4 bg-[#1E40AF]'
                    : 'hover:bg-[#DBEAFE]'
                } px-4 py-2 rounded cursor-pointer sm:px-6 sm:py-3 md:px-8 md:py-4`}
                key={attendee.id}
                actions={[
                  <MdKeyboardArrowRight
                    key="arrow"
                    className="cursor-pointer"
                  />,
                ]}
              >
                <div
                  className="flex flex-col w-full"
                  data-cy={`bi-weekly-detail-attendee-${attendee.id}`}
                >
                  <span
                    className="mb-1 font-semibold text-gray-700 text-xs truncate w-full"
                    title={activePosition?.department?.name || '-'}
                    data-cy={`bi-weekly-detail-attendee-department-${attendee.id}`}
                  >
                    {activePosition?.department?.name || '-'}
                  </span>
                  <UserCard
                    data={attendee}
                    name={
                      <span
                        className="text-xs font-medium cursor-pointer truncate w-full"
                        data-cy={`bi-weekly-detail-attendee-name-${attendee.id}`}
                      >
                        {`${attendee?.firstName ?? '-'} ${attendee?.middleName ?? ''} ${attendee?.lastName ?? ''}`}
                      </span>
                    }
                    profileImage={attendee?.profileImage}
                    size="small"
                  />
                </div>
              </List.Item>
            );
          }}
        />
      </>
    </Card>
  );
}

export default ConversationInstanceDetail;
