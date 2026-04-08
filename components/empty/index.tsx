import React from 'react';
import { Empty, Button } from 'antd';
import { ImFilesEmpty } from 'react-icons/im';

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
  /** Root test id (defaults to `empty-state-root`). */
  'data-cy'?: string;
  /** Smaller padding and typography for tabs and panels. */
  compact?: boolean;
  /** Tight, single-line style for nested areas (e.g. table sub-sections). */
  minimal?: boolean;
  className?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No Data Found',
  description = 'There is nothing to display here yet.',
  actionText,
  onAction,
  'data-cy': dataCy = 'empty-state-root',
  compact = false,
  minimal = false,
  className = '',
}) => {
  const iconSize = minimal ? 32 : compact ? 48 : 60;
  const paddingClass = minimal ? 'py-4' : compact ? 'py-8' : 'py-16';

  const descriptionNode = minimal ? (
    <p
      className="m-0 text-center text-sm font-medium text-gray-600"
      data-cy="empty-state-description"
    >
      {description}
    </p>
  ) : (
    <div className="text-center" data-cy="empty-state-description-wrap">
      <h3
        className={`m-0 font-semibold text-gray-700 ${
          compact ? 'text-base' : 'text-lg'
        }`}
        data-cy="empty-state-title"
      >
        {title}
      </h3>
      <p
        className="mt-1 text-sm text-gray-500"
        data-cy="empty-state-description"
      >
        {description}
      </p>
    </div>
  );

  return (
    <div
      className={`flex flex-col items-center justify-center ${paddingClass} ${className}`}
      data-cy={dataCy}
    >
      <Empty
        image={
          <ImFilesEmpty style={{ fontSize: iconSize, color: '#bfbfbf' }} />
        }
        description={descriptionNode}
      />

      {actionText && !minimal && (
        <Button
          type="primary"
          className="mt-4 px-6 h-10 rounded-lg"
          onClick={onAction}
        >
          {actionText}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
