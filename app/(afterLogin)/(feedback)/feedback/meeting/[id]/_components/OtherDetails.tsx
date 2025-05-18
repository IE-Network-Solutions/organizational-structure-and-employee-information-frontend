// components/MeetingDetail/OtherDetails.tsx
import { ClockCircleOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { GoClock } from 'react-icons/go';
import { MdLocationOn } from 'react-icons/md';

export default function OtherDetails() {
  return (
    <div className="p-4 space-y-3">
      <h2 className="text-lg font-semibold">Other Details</h2>
      <div className="text-gray-700 space-y-3">
        <div className='flex gap-5'>
           <p className='w-full border p-3 rounded-lg'>10:00AM</p>
        <p className='w-full border p-3 rounded-lg'>12:00AM</p>
        </div>
       <div className='flex gap-5'>
        <div className='w-full border p-3 rounded-lg flex items-center gap-3'>
          <GoClock size={16} />
         <p>2 hours</p>
        </div>
        <div className='w-full border p-3 rounded-lg flex items-center gap-3'>
          <EnvironmentOutlined size={16} />
         <p>Hybrid</p>
        </div>
         
       </div>
       
        <div className='w-full border p-3 rounded-lg flex items-center gap-3'>
          <EnvironmentOutlined size={16} />
         <p>Hybrid</p>
        </div>
        <div className='w-full border p-3 rounded-lg flex items-center gap-3'>
          <EnvironmentOutlined size={16} />
         <p>Hybrid</p>
        </div>
      </div>
    </div>
  );
}
