import React from 'react';

const SceletonLoading: React.FC = () => {
  return (
    <div className="p-4" data-cy="skeleton-loading-container">
      <div
        className="animate-pulse flex flex-col space-y-4"
        data-cy="skeleton-loading-content"
      >
        <div
          className="h-4 bg-gray-300 rounded w-3/4"
          data-cy="skeleton-line-1"
        ></div>
        <div
          className="h-4 bg-gray-300 rounded w-1/2"
          data-cy="skeleton-line-2"
        ></div>
        <div className="h-64 bg-gray-300 rounded" data-cy="skeleton-box"></div>
        <div
          className="h-4 bg-gray-300 rounded w-full"
          data-cy="skeleton-line-3"
        ></div>
        <div
          className="h-4 bg-gray-300 rounded w-full"
          data-cy="skeleton-line-4"
        ></div>
        <div
          className="h-4 bg-gray-300 rounded w-full"
          data-cy="skeleton-line-5"
        ></div>
      </div>
    </div>
  );
};

export default SceletonLoading;
