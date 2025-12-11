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
            <div 
              className="text-lg text-gray-900 font-semibold flex items-center"
              data-cy={`tna-commitment-card-label-${item.id}`}
              id={`tnaCommitmentCardLabel${item.id}Id`}
            >
              {item.name}
            </div>
          ),
          extra: (
            <AccessGuard
              permissions={[
                Permissions.UpdateCommitmentRule,
                Permissions.DeleteCommitmentRule,
              ]}
              data-cy="tna-commitment-card-action-buttons-guard"
              id="tnaCommitmentCardActionButtonsGuardId"
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
                data-cy="tna-commitment-card-action-buttons"
              />
            </AccessGuard>
          ),
          children: (
            <div data-cy={`tna-commitment-card-content-${item.id}`} id={`tnaCommitmentCardContent${item.id}Id`}>
              <div className="flex  mt-4 first:mt-0" data-cy={`tna-commitment-card-content-name-${item.id}`} id={`tnaCommitmentCardContentName${item.id}Id`}>
                <div className="text-sm text-gray-600 w-[160px]" data-cy={`tna-commitment-card-content-name-label-${item.id}`} id={`tnaCommitmentCardContentNameLabel${item.id}Id`}>Name</div>
                <div className="text-sm text-gray-900 font-semibold flex-1" data-cy={`tna-commitment-card-content-name-value-${item.id}`} id={`tnaCommitmentCardContentNameValue${item.id}Id`}>
                  {item.name}
                </div>
              </div>
              <div className="flex  mt-4 first:mt-0" data-cy={`tna-commitment-card-content-amount-${item.id}`} id={`tnaCommitmentCardContentAmount${item.id}Id`}>
                <div className="text-sm text-gray-600 w-[160px]" data-cy={`tna-commitment-card-content-amount-label-${item.id}`} id={`tnaCommitmentCardContentAmountLabel${item.id}Id`}>Amount</div>
                <div className="text-sm text-gray-900 font-semibold flex-1" data-cy={`tna-commitment-card-content-amount-value-${item.id}`} id={`tnaCommitmentCardContentAmountValue${item.id}Id`}>
                  {item.amountMin} - {item.amountMax}
                </div>
              </div>
              <div className="flex  mt-4 first:mt-0" data-cy={`tna-commitment-card-content-commitment-period-${item.id}`} id={`tnaCommitmentCardContentCommitmentPeriod${item.id}Id`}>
                <div className="text-sm text-gray-600 w-[160px]" data-cy={`tna-commitment-card-content-commitment-period-label-${item.id}`} id={`tnaCommitmentCardContentCommitmentPeriodLabel${item.id}Id`}>
                  Commitment Period
                </div>
                <div className="text-sm text-gray-900 font-semibold flex-1" data-cy={`tna-commitment-card-content-commitment-period-value-${item.id}`} id={`tnaCommitmentCardContentCommitmentPeriodValue${item.id}Id`}>
                  {item.commitmentPeriodDays} days
                </div>
              </div>
              <div className="flex  mt-4 first:mt-0" data-cy={`tna-commitment-card-content-description-${item.id}`} id={`tnaCommitmentCardContentDescription${item.id}Id`}>
                <div className="text-sm text-gray-600 w-[160px]" data-cy={`tna-commitment-card-content-description-label-${item.id}`} id={`tnaCommitmentCardContentDescriptionLabel${item.id}Id`}>
                  Description
                </div>
                <div className="text-sm text-gray-900 font-semibold flex-1" data-cy={`tna-commitment-card-content-description-value-${item.id}`} id={`tnaCommitmentCardContentDescriptionValue${item.id}Id`}>
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
    <Spin spinning={isLoading} data-cy={`tna-commitment-card-spinner-${item.id}`}>
      <Collapse
        className="mt-6"
        items={items}
        style={{ borderColor: 'rgb(229 231 235)' }}
        data-cy={`tna-commitment-card-${item.id}`}
        expandIcon={({ isActive }) =>
          !isActive ? (
            <IoIosArrowDown size={24} className="text-gray-500" id={`tnaCommitmentCardExpandIcon${item.id}Id`} data-cy={`tna-commitment-card-expand-icon-${item.id}`} />
          ) : (
            <IoIosArrowUp size={24} className="text-gray-500" id={`tnaCommitmentCardCollapseIcon${item.id}Id`} data-cy={`tna-commitment-card-collapse-icon-${item.id}`} />
          )
        }
      />
    </Spin>
  );
};

export default CommitmentCard;
