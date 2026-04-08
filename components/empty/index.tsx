import { Empty, Button } from 'antd';
import { ImFilesEmpty } from 'react-icons/im';

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No Data Found',
  description = 'There is nothing to display here yet.',
  actionText,
  onAction,
}) => {
  return (
    <div
      className="flex flex-col items-center justify-center py-16"
      data-cy="empty-state-root"
    >
      <Empty
        image={<ImFilesEmpty style={{ fontSize: 60, color: '#bfbfbf' }} />}
        description={
          <div className="text-center" data-cy="empty-state-description-wrap">
            <h3
              className="text-lg font-semibold text-gray-700"
              data-cy="empty-state-title"
            >
              {title}
            </h3>
            <p
              className="text-gray-500 text-sm mt-1"
              data-cy="empty-state-description"
            >
              {description}
            </p>
          </div>
        }
      />

      {actionText && (
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
