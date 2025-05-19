// components/MeetingDetail/ParticipantsList.tsx
import { Tag, Avatar, Button } from 'antd';
import { FaPlus } from 'react-icons/fa';
import AddParticipantsPopconfirm from './AddParticipant';

const participants = [
  { name: 'Nahom Samuel', email: 'nahom@email.com', status: null,  },
  { name: 'Nahom Samuel', email: 'nahom@email.com', status: 'Confirmed' ,late:'2:00 min'},
  { name: 'Nahom Samuel', email: 'nahom@email.com', status: 'Confirmed',late:'10:00 min' },
  { name: 'Nahom Samuel', email: 'nahom@email.com', status: 'Not Confirmed' },
  { name: 'Nahom Samuel', email: 'nahom@email.com', status: 'Confirmed' },
];

const statusColorMap: Record<string, string> = {
  Revert: 'red',
  Confirmed: 'green',
  Confirm: 'blue',
  'Not Confirmed': 'orange',
};

export default function ParticipantsList() {
  return (
    <div className=" p-4 space-y-3">
      <div className='flex justify-between items-center py-2'>
         <h2 className="text-lg font-semibold mb-2">List of Participants</h2>
        <AddParticipantsPopconfirm/>
      </div>
      <h2 className="text-lg font-semibold"></h2>
      {participants.map((p, i) => (
        <div key={i} className="flex justify-between items-center border p-2 rounded-md">
          <div className="flex gap-2 items-center">
            <Avatar src="/avatar.png" />
            <div>
              <p className="font-medium">{p.name}</p>
              <p className="text-sm text-gray-500">{p.email}</p>
              {p.late &&(
               <Tag
                        className="font-bold border-none min-w-16 text-center capitalize text-[10px]"
                        color={
                       'orange'
                        }
                      >
                        Late By {p.late}
                      </Tag>)}
            </div>
          </div>
          {p.status?
          <Tag
                        className="font-bold border-none min-w-16 text-center capitalize text-sm"
                        color={
                        statusColorMap[p.status]
                        }
                      >
                        {p.status}
                      </Tag>: <Button
        

          type='primary'
         >Confirm</Button>}
        </div>
      ))}
     
    </div>
  );
}
