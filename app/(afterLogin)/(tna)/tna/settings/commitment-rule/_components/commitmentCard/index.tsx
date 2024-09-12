import { Col, Collapse, CollapseProps, Row } from 'antd';
import { IoIosArrowDown, IoIosArrowUp } from 'react-icons/io';
import ActionButtons from '@/components/common/actionButton/actionButtons';

const CommitmentCard = () => {
  const items: CollapseProps['items'] = [
    {
      key: '1',
      label: (
        <div className="text-lg text-gray-900 font-semibold flex items-center">
          Commitment 1
        </div>
      ),
      extra: (
        <ActionButtons
          onEdit={(e: MouseEvent) => {
            e.stopPropagation();
          }}
          onDelete={(e: MouseEvent) => {
            e.stopPropagation();
          }}
        />
      ),
      children: (
        <div>
          <div className="flex  mt-4 first:mt-0">
            <div className="text-sm text-gray-600 w-[160px]">Name</div>
            <div className="text-sm text-gray-900 font-semibold flex-1">
              Commitment 1
            </div>
          </div>
          <div className="flex  mt-4 first:mt-0">
            <div className="text-sm text-gray-600 w-[160px]">Amount</div>
            <div className="text-sm text-gray-900 font-semibold flex-1">
              10,000 Br - 25,000 Br.
            </div>
          </div>
          <div className="flex  mt-4 first:mt-0">
            <div className="text-sm text-gray-600 w-[160px]">
              Commitment Period
            </div>
            <div className="text-sm text-gray-900 font-semibold flex-1">
              1 year
            </div>
          </div>
          <div className="flex  mt-4 first:mt-0">
            <div className="text-sm text-gray-600 w-[160px]">Description</div>
            <div className="text-sm text-gray-900 font-semibold flex-1">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque
              vel urna euismod, vehicula libero a, ultrices neque. Integer sit
              amet urna nec turpis tincidunt congue ac sit amet purus. Nullam
              facilisis, nunc ut commodo pharetra, orci libero laoreet lacus, at
              ultrices mi leo at est.
            </div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <Collapse
      className="mt-6"
      items={items}
      style={{ borderColor: 'rgb(229 231 235)' }}
      expandIcon={({ isActive }) =>
        !isActive ? (
          <IoIosArrowDown size={24} className="text-gray-500" />
        ) : (
          <IoIosArrowUp size={24} className="text-gray-500" />
        )
      }
    />
  );
};

export default CommitmentCard;
