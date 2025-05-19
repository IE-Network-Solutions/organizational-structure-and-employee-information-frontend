// components/MeetingDetail/MeetingAgenda.tsx
import { Button, List, message } from 'antd';
import { FaPlus } from 'react-icons/fa';
import { CloseOutlined } from '@ant-design/icons';
import { useMeetingStore } from '@/store/uistate/features/conversation/meeting';
import AgendaModal from './AddAgenda';
import MeetingAgendaModal from './MeetingAgendaModal';

const items = Array.from({ length: 5 }).map((_, i) => ({
  key: String(i),
  label: `Agenda ${i + 1}`,
  children: <p>This is question {i + 1} from the second stepper of meeting creation</p>,
}));
const removeItem = (index: number) => {
  message.success('delete')
  };

export default function MeetingAgenda() {
  const {openAddAgenda
,setOpenAddAgenda,openMeetingAgenda,setOpenMeetingAgenda}=useMeetingStore();
  return (
    <div className="p-4">
      <div className='flex justify-between items-center py-2'>
         <h2 className="text-lg font-semibold mb-2">Meeting Agenda</h2>
         <Button
         icon={<FaPlus/>}
          onClick={()=>setOpenAddAgenda(true)}
          type='primary'
         >Add New</Button>
      </div>
     
     <div className='flex flex-col gap-2'>
      {items?.map((i,index)=>(
         <div onClick={()=>setOpenMeetingAgenda(true)} className='flex items-center justify-between border rounded-md p-3'>
          <span className=''>{i.children}</span>
        <CloseOutlined
                key="close"
                className="text-gray-500 hover:text-red-500 cursor-pointer"
                onClick={() => removeItem(index)}
              />
      </div>
      ))}
     
     </div>
     <AgendaModal visible={openAddAgenda} onClose={()=>setOpenAddAgenda(false)} />
       <MeetingAgendaModal
        visible={openMeetingAgenda}
        onClose={() => setOpenMeetingAgenda(false)}
      />
    </div>
  );
}
