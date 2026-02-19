import React, { useEffect, useMemo, useState } from 'react';
import { Drawer } from 'antd';
import { EditOutlined, ThunderboltFilled } from '@ant-design/icons';
import MilestoneForm from './milestoneForm';
import AchiveOrNot from './achiveOrNot';
import CurrencyForm from './currencyForm';
import NumericForm from './numericForm';
import PercentageForm from './percentageForm';
import { OKRFormProps } from '@/store/uistate/features/okrplanning/okr/interface';
import { useIsMobile } from '@/hooks/useIsMobile';

// Define type for keyItem prop

// Define types for the props passed to the component

const KeyResultForm: React.FC<OKRFormProps> = ({
  keyItem,
  index,
  updateKeyResult,
  removeKeyResult,
  addKeyResultValue,
  embedInOkrSheet = false,
}) => {
  const { isMobile } = useIsMobile();
  const renderInline = !isMobile || embedInOkrSheet;
  const isNewKeyResult =
    !keyItem?.title || String(keyItem.title).trim().length === 0;
  const [isSheetOpen, setIsSheetOpen] = useState<boolean>(
    isMobile && !embedInOkrSheet && isNewKeyResult,
  );

  useEffect(() => {
    if (!isMobile || embedInOkrSheet) {
      setIsSheetOpen(false);
    }
  }, [isMobile, embedInOkrSheet]);

  useEffect(() => {
    if (isMobile && !embedInOkrSheet && isNewKeyResult) {
      setIsSheetOpen(true);
    }
  }, [isMobile, embedInOkrSheet, isNewKeyResult]);

  const metricLabel = useMemo(() => {
    if (keyItem?.key_type === 'Achieved') return 'Achieve or Not';
    return keyItem?.key_type || 'Key Result';
  }, [keyItem?.key_type]);

  const titleLabel = useMemo(() => {
    const title = keyItem?.title?.trim?.();
    return title && title.length > 0 ? title : `${metricLabel} Key Result`;
  }, [keyItem?.title, metricLabel]);

  const renderFormByType = () => {
    if (keyItem.key_type === 'Milestone') {
      return (
        <MilestoneForm
          data-cy={`okr-milestone-form-${index}`}
          key={index}
          keyItem={keyItem}
          index={index}
          updateKeyResult={updateKeyResult}
          removeKeyResult={removeKeyResult}
          addKeyResultValue={addKeyResultValue}
        />
      );
    }

    if (keyItem.key_type === 'Achieve' || keyItem.key_type === 'Achieved') {
      return (
        <AchiveOrNot
          data-cy={`okr-achieve-form-${index}`}
          key={index}
          keyItem={keyItem}
          index={index}
          updateKeyResult={updateKeyResult}
          removeKeyResult={removeKeyResult}
          addKeyResultValue={addKeyResultValue}
        />
      );
    }

    if (keyItem.key_type === 'Currency') {
      return (
        <CurrencyForm
          data-cy={`okr-currency-form-${index}`}
          key={index}
          keyItem={keyItem}
          index={index}
          updateKeyResult={updateKeyResult}
          removeKeyResult={removeKeyResult}
          addKeyResultValue={addKeyResultValue}
        />
      );
    }

    if (keyItem.key_type === 'Numeric') {
      return (
        <NumericForm
          data-cy={`okr-numeric-form-${index}`}
          key={index}
          keyItem={keyItem}
          index={index}
          updateKeyResult={updateKeyResult}
          removeKeyResult={removeKeyResult}
          addKeyResultValue={addKeyResultValue}
        />
      );
    }

    if (keyItem.key_type === 'Percentage') {
      return (
        <PercentageForm
          data-cy={`okr-percentage-form-${index}`}
          key={index}
          keyItem={keyItem}
          index={index}
          updateKeyResult={updateKeyResult}
          removeKeyResult={removeKeyResult}
          addKeyResultValue={addKeyResultValue}
        />
      );
    }

    return (
      <div
        id={`okr-key-result-unknown-form-${index}`}
        data-cy={`okr-key-result-unknown-form-${index}`}
      >{`Unknown key type: ${keyItem.key_type}`}</div>
    );
  };

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

      {renderInline && renderFormByType()}

      {isMobile && !embedInOkrSheet && (
        <>
          <button
            type="button"
            id={`okr-key-result-mobile-open-button-${index}`}
            data-cy={`okr-key-result-mobile-open-button-${index}`}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-white shadow-sm hover:shadow-md transition-shadow flex items-center justify-between text-left"
            onClick={() => setIsSheetOpen(true)}
          >
            <div className="min-w-0">
              <p className="text-xs text-okr-primary font-medium">
                {metricLabel}
              </p>
              <p className="text-sm font-semibold text-gray-900 truncate">
                {titleLabel}
              </p>
            </div>
            <span className="text-okr-primary flex items-center gap-1 text-sm font-medium">
              <EditOutlined />
              Edit
            </span>
          </button>

          <Drawer
            id={`okr-key-result-mobile-drawer-${index}`}
            data-cy={`okr-key-result-mobile-drawer-${index}`}
            title={
              <div className="flex flex-col">
                <span className="text-xs text-gray-500">{metricLabel}</span>
                <span className="text-sm font-semibold text-gray-900">
                  {titleLabel}
                </span>
              </div>
            }
            placement="bottom"
            open={isSheetOpen}
            onClose={() => setIsSheetOpen(false)}
            height="85vh"
            destroyOnClose={false}
            className="md:hidden"
            styles={{
              header: { borderBottom: '1px solid #e5e7eb' },
              body: { paddingTop: 12 },
            }}
          >
            <div
              id={`okr-key-result-mobile-drawer-body-${index}`}
              data-cy={`okr-key-result-mobile-drawer-body-${index}`}
              className="overflow-y-auto pb-6"
            >
              {renderFormByType()}
            </div>
          </Drawer>
        </>
      )}
    </div>
  );
};

export default KeyResultForm;
