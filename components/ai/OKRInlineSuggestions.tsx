import React, { useState, useEffect, useCallback } from 'react';
import { Button, Tag, Spin, Empty } from 'antd';
import {
  PlusOutlined,
  ThunderboltFilled,
  CloseOutlined,
} from '@ant-design/icons';
import {
  fetchOKRKeyResultSuggestions,
  KeyResultSuggestion,
} from '@/utils/aiService';
import NotificationMessage from '@/components/common/notification/notificationMessage';

interface OKRInlineSuggestionsProps {
  objectiveTitle: string;
  addKeyResult: (
    keyType: string,
    metricTypeId: string,
    suggestion?: Partial<KeyResultSuggestion>,
  ) => void;
  getCurrentTotalWeight: () => number;
  metrics: any;
  isVisible: boolean;
  onClose: () => void;
}

const OKRInlineSuggestions: React.FC<OKRInlineSuggestionsProps> = ({
  objectiveTitle,
  addKeyResult,
  getCurrentTotalWeight,
  metrics,
  isVisible,
  onClose,
}) => {
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<KeyResultSuggestion[]>([]);

  const handleGenerate = useCallback(async () => {
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
  }, [objectiveTitle]);

  // Auto-generate suggestions when visible and objective is set
  useEffect(() => {
    if (
      isVisible &&
      objectiveTitle &&
      objectiveTitle.trim() !== '' &&
      suggestions.length === 0
    ) {
      // Only auto-generate the first time panel opens; do not re-generate after user adds/clears
      handleGenerate();
    }
  }, [isVisible, objectiveTitle, suggestions.length, handleGenerate]);

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

    // Remove the suggestion from the list and close panel if none remain
    setSuggestions((prev) => {
      const next = prev.filter((item, i) => i !== index);
      if (next.length === 0) {
        onClose();
      }
      return next;
    });

    NotificationMessage.success({
      message: 'AI-suggested Key Result added successfully',
    });
  };

  if (!isVisible) return null;

  return (
    <div
      className="mb-4 bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200 rounded-lg p-4"
      id="okr-inline-ai-suggestions-wrapper-view-space"
      data-cy="okr-inline-ai-suggestions-wrapper-view-space"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <ThunderboltFilled
            className="text-indigo-600"
            style={{ fontSize: '18px' }}
          />
          <span className="text-base font-semibold text-indigo-900">
            AI Key Result Suggestion
          </span>
          <span className="text-sm text-indigo-600">{objectiveTitle}</span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="small"
            onClick={handleGenerate}
            loading={loading}
            disabled={!objectiveTitle || objectiveTitle.trim() === ''}
            className="text-indigo-600 border-indigo-300 hover:border-indigo-500"
          >
            Regenerate
          </Button>
          <Button
            type="text"
            size="small"
            icon={<CloseOutlined />}
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          />
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg p-3">
        {loading && (
          <div className="flex justify-center items-center py-8">
            <Spin size="large" />
          </div>
        )}

        {!loading && suggestions.length === 0 && (
          <Empty
            description={
              <span className="text-sm text-gray-600">
                {objectiveTitle && objectiveTitle.trim() !== ''
                  ? 'No suggestions available. Click "Regenerate" to try again.'
                  : 'Please enter an objective title first'}
              </span>
            }
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        )}

        {!loading && suggestions.length > 0 && (
          <div className="space-y-3">
            {suggestions.map((suggestion, idx) => (
              <div
                key={idx}
                className="border border-gray-200 rounded-lg bg-white hover:border-indigo-300 transition-colors"
              >
                {/* Suggestion Header */}
                <div className="flex items-start justify-between p-3 border-b border-gray-100">
                  <div className="flex-1">
                    <p className="text-sm text-gray-700 leading-relaxed mb-2">
                      {suggestion.title}
                    </p>
                    <div className="flex gap-2 flex-wrap">
                      <Tag
                        className="rounded-full text-xs font-medium border-0 m-0"
                        style={{
                          backgroundColor: '#EEF2FF',
                          color: '#6366f1',
                          padding: '2px 10px',
                        }}
                      >
                        Weight: {suggestion.weight}%
                      </Tag>
                      <Tag
                        className="rounded-full text-xs font-medium border-0 m-0"
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
                            className="rounded-full text-xs font-medium border-0 m-0"
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
                    </div>
                  </div>
                  <Button
                    type="text"
                    size="small"
                    icon={<PlusOutlined />}
                    onClick={() => handleAddSuggestion(suggestion, idx)}
                    className="ml-3 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        {suggestions.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-200 flex justify-between items-center text-sm text-gray-600">
            <span>Suggested Key Results: {suggestions.length}</span>
            <span>
              Total Weight:{' '}
              <strong className="text-gray-900">
                {suggestions.reduce((sum, s) => sum + s.weight, 0)}%
              </strong>
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default OKRInlineSuggestions;
