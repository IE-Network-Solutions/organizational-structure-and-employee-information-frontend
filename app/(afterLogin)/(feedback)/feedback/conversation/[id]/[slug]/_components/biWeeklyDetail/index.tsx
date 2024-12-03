import { Avatar, Card, Divider, List } from 'antd';
import { MdKeyboardArrowRight } from 'react-icons/md';
import dayjs from 'dayjs';
import { useGetAllUsers } from '@/store/server/features/employees/employeeManagment/queries';
import { ConversationStore } from '@/store/uistate/features/conversation';

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
        <div className="flex flex-col gap-3 items-center">
          <h5 className="text-lg font-semibold">
            {conversationInstance?.name ?? 'N/A'}
          </h5>
          <span className="text-sm text-gray-500">
            {dayjs(conversationInstance?.createdAt).format('MMMM D, YYYY')}
          </span>
          <Divider className="my-2" />
        </div>

        <span className="flex justify-center items-center mb-2 text-lg font-bold">
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
                className={`${selectedUserId === attendee?.id && 'ml-8 bg-indigo-100'} 
                                px-4 py-2 rounded cursor-pointer hover:bg-indigo-100
                                sm:px-6 sm:py-3 md:px-8 md:py-4`} // Responsive padding
                key={attendee.id}
                actions={[
                  <MdKeyboardArrowRight
                    key="arrow"
                    className="cursor-pointer"
                  />,
                ]}
              >
                <div className="flex flex-col w-full">
                  <span className="mb-1 font-semibold text-gray-700 text-xs">
                    {activePosition?.department?.name || '-'}
                  </span>
                  <List.Item.Meta
                    avatar={<Avatar src={attendee?.profileImage} />}
                    title={
                      <div className="flex items-center mt-2">
                        <span className="text-xs font-medium cursor-pointer mr-2">
                          {attendee?.firstName ?? '-'}
                        </span>
                        <span className="text-xs font-medium cursor-pointer">
                          {attendee?.middleName ?? ''}{' '}
                          {attendee?.lastName ?? ''}
                        </span>
                      </div>
                    }
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
