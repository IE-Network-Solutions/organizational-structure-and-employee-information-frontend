'use client';

import React from 'react';
import { Card, Skeleton } from 'antd';

const QuestionSetSkeleton: React.FC = () => (
  <Card
    className="p-4 flex flex-col items-center shadow-lg rounded-lg text-center"
    data-cy="feedback-conversation-id-components-question-set-skeleton-card"
    id="feedback-conversation-id-components-question-set-skeleton-card"
  >
    <Skeleton.Input
      className="mb-2"
      active
      size="small"
      style={{ width: '70%' }}
      data-cy="feedback-conversation-id-components-question-set-skeleton-input-title"
    />
    <Skeleton.Input
      className="mb-4"
      active
      size="small"
      style={{ width: '50%' }}
      data-cy="feedback-conversation-id-components-question-set-skeleton-input-subtitle"
    />
    <div
      className="flex justify-center mb-4"
      data-cy="feedback-conversation-id-components-question-set-skeleton-div-avatar"
      id="feedback-conversation-id-components-question-set-skeleton-div-avatar"
    >
      <Skeleton.Avatar
        active
        size="large"
        shape="circle"
        data-cy="feedback-conversation-id-components-question-set-skeleton-avatar"
      />
    </div>
    <div
      className="text-sm text-gray-700 space-y-1"
      data-cy="feedback-conversation-id-components-question-set-skeleton-div-stats"
      id="feedback-conversation-id-components-question-set-skeleton-div-stats"
    >
      <Skeleton.Input
        className="mb-1"
        active
        size="small"
        style={{ width: '80%' }}
        data-cy="feedback-conversation-id-components-question-set-skeleton-input-stat-1"
      />
      <Skeleton.Input
        className="mb-1"
        active
        size="small"
        style={{ width: '60%' }}
        data-cy="feedback-conversation-id-components-question-set-skeleton-input-stat-2"
      />
    </div>
  </Card>
);

export default QuestionSetSkeleton;
