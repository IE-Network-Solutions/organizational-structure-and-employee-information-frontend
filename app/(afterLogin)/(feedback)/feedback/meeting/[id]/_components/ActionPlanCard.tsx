// components/ActionPlan/ActionPlanCard.tsx
import { useMeetingStore } from '@/store/uistate/features/conversation/meeting';
import { EditOutlined } from '@ant-design/icons';
import { Tag, Tooltip, Avatar } from 'antd';
import { LuPencil } from 'react-icons/lu';

interface ActionPlanCardProps {
  issue: string;
  description: string;
  deadline: string;
  status: 'Resolved' | 'Unresolved';
  priority: 'High'|'Medium' | 'Low';
  responsiblePeople: string[];
}

export default function ActionPlanCard({
  issue,
  description,
  deadline,
  status,
  priority,
  responsiblePeople,
}: ActionPlanCardProps) {
  const statusColor = status === 'Resolved' ? 'green' : 'orange';
  const priorityColor =  priority === 'High'
                  ? 'red'
                  : priority === 'Medium'
                    ? 'orange'
                    : 'blue'
  const {setActionPlanData,setOpenAddActionPlan}=useMeetingStore();
  function handleEditActionPlan(value:any){
    setActionPlanData(value)
    setOpenAddActionPlan(true)

  }

  return (
    <div className="bg-white border rounded-xl p-4  space-y-2">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-semibold">Issue</p>
          <p className="text-gray-600 text-sm">{issue}</p>
          <p className="text-gray-600 text-sm">{description}</p>
        </div>
        <Tooltip title="Edit">
          <LuPencil
           onClick={()=>handleEditActionPlan({
  issue,
  description,
  deadline,
  status,
  priority,
  responsiblePeople,
})}
 className="text-gray-500 hover:text-blue-500 cursor-pointer" />
        </Tooltip>
      </div>
      <div className="grid grid-cols-4 text-sm pt-2">
        <div>
          <p className="font-bold text-gray-700">Responsible Person</p>
          <Avatar.Group maxCount={3}>
            {responsiblePeople.map((name, idx) => (
              <Tooltip key={idx} title={name}>
                <Avatar>{name[0]}</Avatar>
              </Tooltip>
            ))}
          </Avatar.Group>
        </div>
        <div>
          <p className="font-bold text-gray-700">Deadline</p>
          <p>{deadline}</p>
        </div>
        <div>
          <p className="font-bold text-gray-700">Status</p>
          <Tag
                        className="font-bold border-none min-w-16 text-center capitalize text-sm"
                        color={
                        statusColor
                        }
                      >
                        {status}
                      </Tag>
        </div>
        <div>
          <p className="font-bold text-gray-700">Priority</p>
          <Tag
              className="font-bold border-none min-w-16 text-center capitalize text-sm"
              color={
               priorityColor
              }
            >
              {priority || 'None'}
            </Tag>
        </div>
      </div>
    </div>
  );
}
