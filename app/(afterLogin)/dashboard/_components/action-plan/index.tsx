import { useDelegationState } from '@/store/uistate/features/dashboard/delegation';
import { Button } from 'antd';
import { FaAngleLeft, FaAngleRight } from 'react-icons/fa';
import Delegation from './delegation';
import Survey from './survey';

export default function ActionPlans() {
  const { type, setType } = useDelegationState(); // Access the Zustand store
  return (
    <div className="p-4 bg-white rounded-lg md:h-[617px]">
      <div className="flex justify-evenly items-center">
        <Button
          onClick={() => setType(1)}
          icon={<FaAngleLeft />}
          className="bg-light_purple w-8 h-8 rounded-full flex items-center justify-center border-none"
        />

        <h2 className="text-sm font-semibold ">
          {' '}
          {type == 1 ? 'Delegated Action Plans' : 'Survey Due Soon'}
        </h2>
        <Button
          onClick={() => setType(2)}
          icon={<FaAngleRight />}
          className="bg-light_purple w-8 h-8  rounded-full flex items-center justify-center border-none"
        />
      </div>
      {type == 1 ? <Delegation /> : <Survey />}
    </div>
  );
}
