// components/MeetingList.tsx
import React from 'react';
import { Input, Select, DatePicker, Card, Avatar, Tooltip } from 'antd';
import { CalendarOutlined, UserOutlined, EnvironmentOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { FiUsers } from 'react-icons/fi';

const { RangePicker } = DatePicker;
const { Option } = Select;

const meetings = Array(6).fill({
  title: 'Product-Design Bi-Weekly Meeting',
  date: 'May 10, 2025 • 10:00AM',
  chair: 'Amanuel Taye',
  facilitator: 'Amanuel Taye',
  location: 'Meeting Room 1',
  attendees: [
    'https://randomuser.me/api/portraits/men/32.jpg',
    'https://randomuser.me/api/portraits/women/44.jpg',
    'https://randomuser.me/api/portraits/men/65.jpg',
  ],
});

const MeetingList = () => {
  return (
    <div className="p-6 space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        <Input.Search placeholder="Search Meeting" className="w-64" />
        <Select defaultValue="All Types" className="w-40">
          <Option value="All Types">All Types</Option>
        </Select>
        <Select defaultValue="All Departments" className="w-48">
          <Option value="All Departments">All Departments</Option>
        </Select>
        <RangePicker
          defaultValue={[dayjs('2023-01-01'), dayjs('2023-03-10')]}
          format="DD MMM YYYY"
        />
      </div>

      {/* Meeting Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {meetings.map((meeting, index) => (
          <Card bodyStyle={{padding:10}} key={index} title={meeting.title} className="shadow-md rounded-xl">
            <div className="space-y-1 text-sm text-gray-600 ">
               
              
              <div className="flex items-center gap-2">
                <UserOutlined className='text-blue'  />
                <div className='flex flex-col'>
                <span className='font-bold'>
                 Date
                </span>
                <span>{meeting.date}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <UserOutlined className='text-blue'  />
                <div className='flex flex-col'>
                <span className='font-bold'>
                  Chair person:
                </span>
                <span>
                {meeting.chair}
                </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <UserOutlined className='text-blue' />
                <div className='flex flex-col'>
                 <span className='font-bold'>
                  Facilitator: 
                </span>
                <span>
                 {meeting.chair}
                </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <EnvironmentOutlined className='text-blue'  />
                <div className='flex flex-col'>
                 <span className='font-bold'>
                  Location 
                </span>
                <span>
                  <span>In person • <strong>{meeting.location}</strong></span>
                </span>
                </div>
              </div>
             
              <div className="flex items-center gap-2">
                <FiUsers  className='text-blue' />
                <div className='flex flex-col'>
                   <div className="font-bold">Attendees</div>
                <div className="flex -space-x-2 mt-1">
                  {meeting.attendees.map((src, i) => (
                    <Tooltip title={`User ${i + 1}`} key={i}>
                      <Avatar size={24} src={src} />
                    </Tooltip>
                  ))}
                </div> 
                </div>
                
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default MeetingList;
