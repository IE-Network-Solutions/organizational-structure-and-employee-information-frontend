import { TbLock } from 'react-icons/tb';
import { GoLocation } from 'react-icons/go';
import ActionButton from '@/components/common/ActionButton';

const AreaCard = () => {
  return (
    <div className="border border-t-0 first:border-t px-4 py-2.5 border-gray-200 flex items-center gap-3">
      <TbLock size={16} className="text-gray-500" />
      <div className="flex items-center justify-between flex-1">
        <div className="flex-1">
          <div className="text-xs text-gray-900 leading-5 font-medium">
            Bahir Dar
          </div>
          <div className="flex items-center gap-2 text-gray-500">
            <GoLocation size={16} />
            <span className="text-xs">
              Akaky Kaliti subcity, Kilinto area around Tulu dimtu.
            </span>
          </div>
        </div>

        <ActionButton />
      </div>
    </div>
  );
};

export default AreaCard;
