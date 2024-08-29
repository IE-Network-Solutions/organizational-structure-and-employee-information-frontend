import { Avatar } from 'antd';
import { UserOutlined } from '@ant-design/icons';

const LogCard = () => {
  return (
    <div className="flex items-center gap-3 mb-4 last:mb-0">
      <Avatar icon={<UserOutlined />} size={40} />
      <div className="flex-1">
        <div className="flex items-center text-sm text-gray-900 gap-1.5">
          <span className="font-bold">Dagmawit Yilma</span>
          <span className="text-success">approved</span>
          <span>attendance </span>
        </div>
        <div className="text-xs text-gray-500 mt-1">5:00 PM, 28 June 2023</div>
      </div>
    </div>
  );
};

export default LogCard;
