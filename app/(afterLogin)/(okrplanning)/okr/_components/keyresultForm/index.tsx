import React from 'react';
import { ThunderboltFilled } from '@ant-design/icons';
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
    <div className="relative">
      {/* AI Suggestion Indicator */}
      {keyItem.isAISuggestion && (
        <div className="mx-4 mt-4 mb-2 px-3 py-2 bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200 rounded-lg flex items-center gap-2">
          <ThunderboltFilled className="text-indigo-600" style={{ fontSize: '14px' }} />
          <span className="text-xs font-medium text-indigo-700">
            This is a Key Result from the AI
          </span>
        </div>
      )}
      
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
