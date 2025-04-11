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
            objective={objective}
            key={index}
            keyValue={keyValue}
            index={index}
            isEdit={isEdit}
          />
        );
      default:
        return <div>{`Unknown key type: ${keyValue.key_type}`}</div>; // Fallback for unsupported key types
    }
  };

  return <div>{renderView()}</div>;
};

export default KeyResultView;
