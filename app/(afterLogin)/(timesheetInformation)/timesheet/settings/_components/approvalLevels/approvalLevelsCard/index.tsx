import { TbLock } from 'react-icons/tb';
import { Avatar } from 'antd';
import { UserOutlined } from '@ant-design/icons';

const ApprovalLevelsCard = () => {
  return (
    <div className="border border-t-0 first:border-t px-4 py-2.5 border-gray-200 flex items-center gap-3">
      <TbLock size={16} className="text-gray-500" />
      <Avatar icon={<UserOutlined />} size={24} />
      <div className="flex-1">
        <div className="text-xs text-gray-900 leading-5 font-medium">
          Abeselom G/Gidan
        </div>
        <div className="text-gray-500 text-[10px]">Saas Teamlead</div>
      </div>
    </div>
  );
};

export default ApprovalLevelsCard;
