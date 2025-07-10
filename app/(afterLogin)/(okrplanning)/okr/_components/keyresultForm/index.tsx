import React from 'react';
import MilestoneForm from './milestoneForm';
import AchiveOrNot from './achiveOrNot';
import CurrencyForm from './currencyForm';
import NumericForm from './numericForm';
import PercentageForm from './percentageForm';
import { OKRFormProps } from '@/store/uistate/features/okrplanning/okr/interface';

// Define type for keyItem prop

// Define types for the props passed to the component

const KeyResultForm: React.FC<OKRFormProps> = ({
  keyItem,
  index,
  updateKeyResult,
  removeKeyResult,
  addKeyResultValue,
}) => {
  return (
    <div>
      {/* Conditionally render based on key_type */}
      {keyItem.key_type === 'Milestone' ? (
        <MilestoneForm
          key={index}
          keyItem={keyItem}
          index={index}
          updateKeyResult={updateKeyResult}
          removeKeyResult={removeKeyResult}
          addKeyResultValue={addKeyResultValue}
        />
      ) : keyItem.key_type === 'Achieve' || keyItem.key_type === 'Achieved' ? (
        <AchiveOrNot
          key={index}
          keyItem={keyItem}
          index={index}
          updateKeyResult={updateKeyResult}
          removeKeyResult={removeKeyResult}
          addKeyResultValue={addKeyResultValue}
        />
      ) : keyItem.key_type === 'Currency' ? (
        <CurrencyForm
          key={index}
          keyItem={keyItem}
          index={index}
          updateKeyResult={updateKeyResult}
          removeKeyResult={removeKeyResult}
          addKeyResultValue={addKeyResultValue}
        />
      ) : keyItem.key_type === 'Numeric' ? (
        <NumericForm
          key={index}
          keyItem={keyItem}
          index={index}
          updateKeyResult={updateKeyResult}
          removeKeyResult={removeKeyResult}
          addKeyResultValue={addKeyResultValue}
        />
      ) : keyItem.key_type === 'Percentage' ? (
        <PercentageForm
          key={index}
          keyItem={keyItem}
          index={index}
          updateKeyResult={updateKeyResult}
          removeKeyResult={removeKeyResult}
          addKeyResultValue={addKeyResultValue}
        />
      ) : (
        <div>{`Unknown key type: ${keyItem.key_type}`}</div> // Fallback for unsupported key types
      )}
    </div>
  );
};

export default KeyResultForm;
