import { Collapse, CollapseProps, Spin } from 'antd';
import { IoIosArrowDown, IoIosArrowUp } from 'react-icons/io';
import ActionButtons from '@/components/common/actionButton/actionButtons';
import { CommitmentRule } from '@/types/tna/tna';
import { FC, useEffect, useState } from 'react';
import { useDeleteTnaCommitment } from '@/store/server/features/tna/commitment/mutation';
import { useTnaSettingsStore } from '@/store/uistate/features/tna/settings';
import AccessGuard from '@/utils/permissionGuard';
import { Permissions } from '@/types/commons/permissionEnum';

interface CommitmentCardProps {
  item: CommitmentRule;
}

const CommitmentCard: FC<CommitmentCardProps> = ({ item }) => {
  const { setTnaCommitmentId, setIsShowCommitmentSidebar } =
    useTnaSettingsStore();
  const [items, setItems] = useState<CollapseProps['items']>([]);
  const { mutate: deleteCommitment, isLoading } = useDeleteTnaCommitment();

  useEffect(() => {
    if (item) {
      setItems([
        {
          key: item.id,
          label: (
            <div className="text-lg text-gray-900 font-semibold flex items-center">
              {item.name}
            </div>
          ),
          extra: (
            <AccessGuard
              permissions={[
                Permissions.UpdateCommitmentRule,
                Permissions.DeleteCommitmentRule,
              ]}
            >
              <ActionButtons
                id={item?.id ?? null}
                onEdit={(e: MouseEvent) => {
                  e.stopPropagation();
                  setTnaCommitmentId(item.id);
                  setIsShowCommitmentSidebar(true);
                }}
                onDelete={(e: MouseEvent) => {
                  e.stopPropagation();
                  deleteCommitment([item.id]);
                }}
              />
            </AccessGuard>
          ),
          children: (
            <div>
              <div className="flex  mt-4 first:mt-0">
                <div className="text-sm text-gray-600 w-[160px]">Name</div>
                <div className="text-sm text-gray-900 font-semibold flex-1">
                  {item.name}
                </div>
              </div>
              <div className="flex  mt-4 first:mt-0">
                <div className="text-sm text-gray-600 w-[160px]">Amount</div>
                <div className="text-sm text-gray-900 font-semibold flex-1">
                  {item.amountMin} - {item.amountMax}
                </div>
              </div>
              <div className="flex  mt-4 first:mt-0">
                <div className="text-sm text-gray-600 w-[160px]">
                  Commitment Period
                </div>
                <div className="text-sm text-gray-900 font-semibold flex-1">
                  {item.commitmentPeriodDays} days
                </div>
              </div>
              <div className="flex  mt-4 first:mt-0">
                <div className="text-sm text-gray-600 w-[160px]">
                  Description
                </div>
                <div className="text-sm text-gray-900 font-semibold flex-1">
                  {item.description}
                </div>
              </div>
            </div>
          ),
        },
      ]);
    }
  }, [item]);

  return (
    <Spin spinning={isLoading}>
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
    </Spin>
  );
};

export default CommitmentCard;
