// components/MeetingDetail/MeetingAgenda.tsx
import { Button, List, message } from 'antd';
import { FaPlus } from 'react-icons/fa';
import { CloseOutlined } from '@ant-design/icons';

const items = Array.from({ length: 5 }).map((_, i) => ({
  key: String(i),
  label: `Agenda ${i + 1}`,
  children: <p>Previous meeting {i + 1}</p>,
}));
const removeItem = (index: number) => {
  message.success('delete')
  };

export default function PreviousMeeting() {
  return (
    <div className="p-4">
      <div className='flex justify-between items-center py-2'>
         <h2 className="text-lg font-semibold mb-2">Previous Meeting</h2>
      </div>
     
     <div className='flex flex-col gap-2'>
      {items?.map((i,index)=>(
         <div className='flex items-center justify-between border rounded-md p-3 bg-gray-50'>
          <span className='font-semibold text-gray-400'>{i.children}</span>
      </div>
      ))}
     
     </div>
    </div>
  );
}
