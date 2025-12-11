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
    <div
      id={`okr-key-result-form-${index}`}
      data-cy={`okr-key-result-form-${index}`}
      className="relative"
    >
      {/* AI Suggestion Indicator */}
      {keyItem.isAISuggestion && (
        <div
          id={`okr-key-result-ai-indicator-${index}`}
          data-cy={`okr-key-result-ai-indicator-${index}`}
          className="mx-4 mt-4 mb-2 px-3 py-2 bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200 rounded-lg flex items-center gap-2"
        >
          <ThunderboltFilled
            id={`okr-key-result-ai-icon-${index}`}
            data-cy={`okr-key-result-ai-icon-${index}`}
            className="text-indigo-600"
            style={{ fontSize: '14px' }}
          />
          <span
            id={`okr-key-result-ai-text-${index}`}
            data-cy={`okr-key-result-ai-text-${index}`}
            className="text-xs font-medium text-indigo-700"
          >
            This is a Key Result from the AI
          </span>
        </div>
      )}

      {/* Conditionally render based on key_type */}
      {keyItem.key_type === 'Milestone' ? (
        <MilestoneForm
          data-cy={`okr-milestone-form-${index}`}
          key={index}
          keyItem={keyItem}
          index={index}
          updateKeyResult={updateKeyResult}
          removeKeyResult={removeKeyResult}
          addKeyResultValue={addKeyResultValue}
        />
      ) : keyItem.key_type === 'Achieve' || keyItem.key_type === 'Achieved' ? (
        <AchiveOrNot
          data-cy={`okr-achieve-form-${index}`}
          key={index}
          keyItem={keyItem}
          index={index}
          updateKeyResult={updateKeyResult}
          removeKeyResult={removeKeyResult}
          addKeyResultValue={addKeyResultValue}
        />
      ) : keyItem.key_type === 'Currency' ? (
        <CurrencyForm
          data-cy={`okr-currency-form-${index}`}
          key={index}
          keyItem={keyItem}
          index={index}
          updateKeyResult={updateKeyResult}
          removeKeyResult={removeKeyResult}
          addKeyResultValue={addKeyResultValue}
        />
      ) : keyItem.key_type === 'Numeric' ? (
        <NumericForm
          data-cy={`okr-numeric-form-${index}`}
          key={index}
          keyItem={keyItem}
          index={index}
          updateKeyResult={updateKeyResult}
          removeKeyResult={removeKeyResult}
          addKeyResultValue={addKeyResultValue}
        />
      ) : keyItem.key_type === 'Percentage' ? (
        <PercentageForm
          data-cy={`okr-percentage-form-${index}`}
          key={index}
          keyItem={keyItem}
          index={index}
          updateKeyResult={updateKeyResult}
          removeKeyResult={removeKeyResult}
          addKeyResultValue={addKeyResultValue}
        />
      ) : (
        <div
          id={`okr-key-result-unknown-form-${index}`}
          data-cy={`okr-key-result-unknown-form-${index}`}
        >{`Unknown key type: ${keyItem.key_type}`}</div> // Fallback for unsupported key types
      )}
    </div>
  );
};

export default KeyResultForm;
