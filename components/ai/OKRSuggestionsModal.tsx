import React, { useState } from 'react';
import { Button, Modal, Typography, Tag, Empty, Spin, Collapse } from 'antd';
import { PlusOutlined, ThunderboltFilled } from '@ant-design/icons';
import {
  fetchOKRKeyResultSuggestions,
  KeyResultSuggestion,
} from '@/utils/aiService';
import NotificationMessage from '@/components/common/notification/notificationMessage';

const { Panel } = Collapse;

interface OKRSuggestionsModalProps {
  objectiveTitle: string;
  addKeyResult: (
    keyType: string,
    metricTypeId: string,
    suggestion?: Partial<KeyResultSuggestion>,
  ) => void;
  getCurrentTotalWeight: () => number;
  metrics: any;
}

const OKRSuggestionsModal: React.FC<OKRSuggestionsModalProps> = ({
  objectiveTitle,
  addKeyResult,
  getCurrentTotalWeight,
  metrics,
}) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<KeyResultSuggestion[]>([]);

  const handleGenerate = async () => {
    if (!objectiveTitle || objectiveTitle.trim() === '') {
      NotificationMessage.warning({
        message: 'Please enter an objective title first',
      });
      return;
    }

    setLoading(true);
    try {
      const results = await fetchOKRKeyResultSuggestions(objectiveTitle);

      // Normalize and validate weights
      if (results && results.length > 0) {
        // Convert weights to percentages (if they're decimals like 0.3, convert to 30)
        const normalizedResults = results.map((r) => ({
          ...r,
          weight:
            r.weight <= 1 ? Math.round(r.weight * 100) : Math.round(r.weight),
        }));

        // Calculate total weight
        const totalWeight = normalizedResults.reduce(
          (sum, r) => sum + r.weight,
          0,
        );

        // If weights don't sum to 100, adjust proportionally
        if (totalWeight !== 100 && totalWeight > 0) {
          const adjustedResults = normalizedResults.map((r) => {
            const adjustedWeight = Math.round((r.weight / totalWeight) * 100);
            return { ...r, weight: adjustedWeight };
          });

          // Handle rounding errors - ensure total is exactly 100
          const adjustedTotal = adjustedResults.reduce(
            (sum, r) => sum + r.weight,
            0,
          );
          if (adjustedTotal !== 100 && adjustedResults.length > 0) {
            adjustedResults[0].weight += 100 - adjustedTotal;
          }

          setSuggestions(adjustedResults);
        } else {
          setSuggestions(normalizedResults);
        }
      } else {
        setSuggestions([]);
      }
    } catch (error) {
      NotificationMessage.error({
        message: 'Failed to generate key result suggestions',
      });
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSuggestion = (
    suggestion: KeyResultSuggestion,
    index: number,
  ) => {
    const currentTotalWeight = getCurrentTotalWeight();

    // Check if adding this suggestion would exceed 100%
    if (currentTotalWeight + suggestion.weight > 100) {
      NotificationMessage.warning({
        message: `Cannot add this key result. Current total weight is ${currentTotalWeight}%. Adding ${suggestion.weight}% would exceed 100%.`,
      });
      return;
    }

    // Map metric_type from API to internal key types
    const metricTypeMapping: { [key: string]: string } = {
      numeric: 'Numeric',
      percentage: 'Percentage',
      currency: 'Currency',
      milestone: 'Milestone',
      achieved: 'Achieved',
      achieve: 'Achieved',
    };

    const normalizedMetricType = suggestion.metric_type.toLowerCase();
    const keyType = metricTypeMapping[normalizedMetricType] || 'Numeric';

    // Map internal key type to actual metric name for finding metric ID
    const metricNameMapping: { [key: string]: string } = {
      Milestone: 'Milestone',
      Currency: 'Currency',
      Numeric: 'Numeric',
      Percentage: 'Percentage',
      Achieved: 'Achieve',
    };

    const actualMetricName = metricNameMapping[keyType] || keyType;
    const metricType = metrics?.items?.find(
      (metric: any) => metric.name === actualMetricName,
    );
    const metricTypeId = metricType?.id || '';

    // Add the key result with all suggestion data pre-filled
    addKeyResult(keyType, metricTypeId, {
      title: suggestion.title,
      weight: suggestion.weight,
      initial_value:
        suggestion.initial_value !== undefined ? suggestion.initial_value : 0,
      target_value:
        suggestion.target_value !== undefined ? suggestion.target_value : 100,
      milestones:
        keyType === 'Milestone'
          ? (suggestion.milestones || []).map((m) => ({
              title: m.title,
              weight: m.weight,
            }))
          : [],
    });

    // Remove the suggestion from the list
    setSuggestions((prev) => prev.filter((item, i) => i !== index));

    NotificationMessage.success({
      message: '✨ AI-suggested Key Result added successfully',
      description: 'All fields have been auto-filled from the suggestion.',
    });

    // Close modal after adding
    setOpen(false);
  };

  const handleOpen = () => {
    setOpen(true);
    // Auto-generate on open if objective is set and no suggestions yet
    if (
      objectiveTitle &&
      objectiveTitle.trim() !== '' &&
      suggestions.length === 0
    ) {
      setTimeout(() => handleGenerate(), 300);
    }
  };

  return (
    <>
      <Button
        type="primary"
        ghost
        onClick={handleOpen}
        disabled={!objectiveTitle || objectiveTitle.trim() === ''}
        icon={<ThunderboltFilled />}
        className="flex items-center gap-1"
        id="okr-ai-suggestions-open-button"
        data-cy="okr-ai-suggestions-open-button"
      >
        AI Suggestions
      </Button>
      <Modal
        title={
          <div className="flex items-center gap-2">
            <ThunderboltFilled className="text-indigo-600 text-lg" />
            <span className="text-base font-semibold">
              AI Key Result Suggestions
            </span>
          </div>
        }
        open={open}
        onCancel={() => setOpen(false)}
        footer={null}
        width={800}
      >
        <div className="mb-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex-1">
              <div className="text-sm text-gray-600 mb-1">Objective:</div>
              <div className="text-base font-medium">{objectiveTitle}</div>
            </div>
            <Button
              loading={loading}
              type="primary"
              onClick={handleGenerate}
              disabled={!objectiveTitle || objectiveTitle.trim() === ''}
            >
              {suggestions.length > 0 ? 'Regenerate' : 'Generate'}
            </Button>
          </div>
          <div className="text-xs text-gray-500 bg-blue-50 p-2 rounded">
            💡 AI will suggest key results with weights that sum to 100%
          </div>
        </div>

        <div
          className="max-h-96 overflow-y-auto"
          id="okr-ai-suggestions-modal-wrapper-view-space"
          data-cy="okr-ai-suggestions-modal-wrapper-view-space"
        >
          {loading && (
            <div className="flex justify-center items-center py-8">
              <Spin size="large" />
            </div>
          )}

          {!loading && suggestions.length === 0 && (
            <Empty
              description={
                <span className="text-xs">
                  {objectiveTitle && objectiveTitle.trim() !== ''
                    ? 'Click "Generate" to get AI suggestions'
                    : 'Please enter an objective title first'}
                </span>
              }
            />
          )}

          {!loading && suggestions.length > 0 && (
            <Collapse
              accordion={false}
              bordered={false}
              className="ai-suggestions-accordion"
              expandIconPosition="end"
              defaultActiveKey={[]}
            >
              {suggestions.map((suggestion, idx) => (
                <Panel
                  key={idx}
                  header={
                    <div
                      className="flex items-center justify-between w-full"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center gap-2">
                        <ThunderboltFilled
                          className="text-[#6366f1]"
                          style={{ fontSize: '16px' }}
                        />
                        <span className="text-sm font-medium text-gray-700">
                          AI Key Result Suggestion
                        </span>
                      </div>
                      <Button
                        type="primary"
                        size="small"
                        icon={<PlusOutlined />}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddSuggestion(suggestion, idx);
                        }}
                        className="bg-[#2B3CF1] hover:bg-[#1d2bb8] border-none"
                        style={{
                          fontSize: '12px',
                          height: '28px',
                          padding: '0 12px',
                        }}
                      />
                    </div>
                  }
                  className="mb-3 border border-[#e5e7eb] rounded-lg overflow-hidden"
                  style={{
                    backgroundColor: '#ffffff',
                  }}
                >
                  <div className="bg-white px-4 pb-4 -mt-3">
                    <Typography.Text className="text-sm block mb-3 text-gray-700 leading-relaxed">
                      {suggestion.title}
                    </Typography.Text>
                    <div className="flex gap-2 flex-wrap">
                      <Tag
                        className="rounded-full text-xs font-medium border-0"
                        style={{
                          backgroundColor: '#EEF2FF',
                          color: '#6366f1',
                          padding: '2px 10px',
                        }}
                      >
                        Weight: {suggestion.weight}%
                      </Tag>
                      <Tag
                        className="rounded-full text-xs font-medium border-0"
                        style={{
                          backgroundColor: '#FDF4FF',
                          color: '#a855f7',
                          padding: '2px 10px',
                        }}
                      >
                        Type: {suggestion.metric_type}
                      </Tag>
                      {(suggestion.metric_type.toLowerCase() === 'numeric' ||
                        suggestion.metric_type.toLowerCase() ===
                          'percentage') &&
                        typeof suggestion.initial_value === 'number' &&
                        typeof suggestion.target_value === 'number' && (
                          <Tag
                            className="rounded-full text-xs font-medium border-0"
                            style={{
                              backgroundColor: '#F0FDFA',
                              color: '#14b8a6',
                              padding: '2px 10px',
                            }}
                          >
                            {suggestion.initial_value} →{' '}
                            {suggestion.target_value}
                            {suggestion.metric_type.toLowerCase() ===
                            'percentage'
                              ? '%'
                              : ''}
                          </Tag>
                        )}
                      {suggestion.metric_type.toLowerCase() !== 'numeric' &&
                        suggestion.metric_type.toLowerCase() !== 'percentage' &&
                        typeof suggestion.initial_value === 'number' && (
                          <Tag
                            className="rounded-full text-xs font-medium border-0"
                            style={{
                              backgroundColor: '#F0FDFA',
                              color: '#14b8a6',
                              padding: '2px 10px',
                            }}
                          >
                            Initial: {suggestion.initial_value}
                          </Tag>
                        )}
                      {suggestion.metric_type.toLowerCase() !== 'numeric' &&
                        suggestion.metric_type.toLowerCase() !== 'percentage' &&
                        typeof suggestion.target_value === 'number' && (
                          <Tag
                            className="rounded-full text-xs font-medium border-0"
                            style={{
                              backgroundColor: '#F0FDF4',
                              color: '#22c55e',
                              padding: '2px 10px',
                            }}
                          >
                            Target: {suggestion.target_value}
                          </Tag>
                        )}
                    </div>
                  </div>
                </Panel>
              ))}
            </Collapse>
          )}
        </div>

        {suggestions.length > 0 && (
          <div className="mt-4 pt-3 border-t">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">
                Suggested Key Results: {suggestions.length}
              </span>
              <span className="text-gray-600">
                Total Weight:{' '}
                <strong>
                  {suggestions.reduce((sum, s) => sum + s.weight, 0)}%
                </strong>
              </span>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
};

export default OKRSuggestionsModal;
