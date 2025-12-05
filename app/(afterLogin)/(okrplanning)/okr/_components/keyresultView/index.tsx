import React from 'react';
import MilestoneView from './milestoneView';
import CurrencyView from './currencyView';
import PercentageView from './percentageView';
import NumericView from './numericView';
import AchieveOrNotView from './achiveOrNotView';
import { OKRProps } from '@/store/uistate/features/okrplanning/okr/interface';

// Define types for the props passed to the component

const KeyResultView: React.FC<OKRProps> = ({
  keyValue,
  index,
  objective,
  isEdit = false,
  form,
}) => {
  const renderView = () => {
    switch (keyValue.key_type || keyValue.metricType?.name) {
      case 'Milestone':
        return (
          <MilestoneView
            data-cy={`okr-key-result-view-milestone-${index}`}
            objective={objective}
            key={index}
            keyValue={keyValue}
            index={index}
            isEdit={isEdit}
            form={form}
          />
        );
      case 'Achieve':
        return (
          <AchieveOrNotView
            data-cy={`okr-key-result-view-achieve-${index}`}
            objective={objective}
            key={index}
            keyValue={keyValue}
            index={index}
            isEdit={isEdit}
          />
        );
      case 'Currency':
        return (
          <CurrencyView
            data-cy={`okr-key-result-view-currency-${index}`}
            objective={objective}
            key={index}
            keyValue={keyValue}
            index={index}
            isEdit={isEdit}
          />
        );
      case 'Percentage':
        return (
          <PercentageView
            data-cy={`okr-key-result-view-percentage-${index}`}
            objective={objective}
            key={index}
            keyValue={keyValue}
            index={index}
            isEdit={isEdit}
          />
        );
      case 'Numeric':
        return (
          <NumericView
            data-cy={`okr-key-result-view-numeric-${index}`}
            objective={objective}
            key={index}
            keyValue={keyValue}
            index={index}
            isEdit={isEdit}
          />
        );
      default:
        return (
          <div
            id={`okr-key-result-view-unknown-${index}`}
            data-cy={`okr-key-result-view-unknown-${index}`}
          >{`Unknown key type: ${keyValue.key_type}`}</div>
        ); // Fallback for unsupported key types
    }
  };

  return (
    <div
      id={`okr-key-result-view-container-${index}`}
      data-cy={`okr-key-result-view-container-${index}`}
    >
      {renderView()}
    </div>
  );
};

export default KeyResultView;
