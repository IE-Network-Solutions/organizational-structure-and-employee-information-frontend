import { Avatar, Card, Divider, List } from 'antd';
import { MdKeyboardArrowRight } from 'react-icons/md';
import Link from 'next/link';
import dayjs from 'dayjs';

function OneOnOneDetail() {
  //   const { isLoading, data: employeeData } = useGetEmployee(id);

  const dummyEmployeeData = {
    attendees: [
      {
        id: '1',
        firstName: 'John',
        middleName: 'A.',
        lastName: 'Doe',
        profileImage: 'https://via.placeholder.com/40',
        employeeJobInformation: [
          {
            isPositionActive: true,
            department: { name: 'Engineering' },
            branch: { name: 'New York Office' },
          },
        ],
      },
      {
        id: '2',
        firstName: 'Jane',
        middleName: 'B.',
        lastName: 'Smith',
        profileImage: 'https://via.placeholder.com/40',
        employeeJobInformation: [
          {
            isPositionActive: true,
            department: { name: 'Marketing' },
            branch: { name: 'London Office' },
          },
        ],
      },
      {
        id: '3',
        firstName: 'Emily',
        lastName: 'Johnson',
        profileImage: 'https://via.placeholder.com/40',
        employeeJobInformation: [
          {
            isPositionActive: true,
            department: { name: 'Sales' },
            branch: { name: 'Tokyo Office' },
          },
        ],
      },
    ],
  };
  const employeeData = {
    biWeeklyName: 'One To One Name',
    date: '2024-11-01',
    attendees: [
      {
        id: '1',
        firstName: 'John',
        middleName: 'A.',
        lastName: 'Doe',
        profileImage: 'https://via.placeholder.com/40',
        employeeJobInformation: [
          {
            isPositionActive: true,
            department: { name: 'With' },
            branch: { name: 'New York Office' },
          },
        ],
        reportingTo: {
          id: '4',
          firstName: 'Alice',
          middleName: 'C.',
          lastName: 'Johnson',
          profileImage: 'https://via.placeholder.com/40',
        },
      },
      {
        id: '2',
        firstName: 'Jane',
        middleName: 'B.',
        lastName: 'Smith',
        profileImage: 'https://via.placeholder.com/40',
        employeeJobInformation: [
          {
            isPositionActive: true,
            department: { name: 'Created By' },
            branch: { name: 'London Office' },
          },
        ],
      },
      {
        id: '3',
        firstName: 'Emily',
        lastName: 'Johnson',
        profileImage: 'https://via.placeholder.com/40',
        employeeJobInformation: [
          {
            isPositionActive: true,
            department: { name: 'With' },
            branch: { name: 'Tokyo Office' },
          },
        ],
      },
    ],
  };

  const attendees = employeeData?.attendees || dummyEmployeeData.attendees;

  return (
    <Card loading={false} className="mb-3">
      <div className="flex flex-col gap-3 items-center">
        <h5>One To One Name</h5>
        <span>{dayjs().format('MMMM D, YYYY')}</span>
        <Divider className="my-2" />
      </div>

      <List
        split={false}
        size="small"
        dataSource={attendees}
        renderItem={(attendee) => {
          const activePosition = attendee.employeeJobInformation?.find(
            (info) => info.isPositionActive,
          );

          return (
            <List.Item
              key={attendee.id}
              actions={[
                <MdKeyboardArrowRight key="arrow" className="cursor-pointer" />,
              ]}
            >
              <div className="flex flex-col w-full">
                <span className="mb-1 font-semibold text-gray-700 text-xs">
                  {activePosition?.department?.name || '-'}
                </span>
                <List.Item.Meta
                  avatar={<Avatar src={attendee.profileImage} />}
                  title={
                    <Link href={`/employees/manage-employees/${attendee.id}`}>
                      <div className="flex items-center mt-2">
                        <span className="text-xs font-medium cursor-pointer mr-2">
                          {attendee.firstName ?? '-'}
                        </span>
                        <span className="text-xs font-medium cursor-pointer">
                          {attendee.middleName || ''} {attendee.lastName}
                        </span>
                      </div>
                    </Link>
                  }
                />
              </div>
            </List.Item>
          );
        }}
      />
    </Card>
  );
}

export default OneOnOneDetail;
