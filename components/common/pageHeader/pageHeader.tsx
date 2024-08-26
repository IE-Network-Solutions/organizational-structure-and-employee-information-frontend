'use client';
import React from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  children,
}) => {
  return (
    <div className="flex justify-between items-center">
      <div className="flex-1">
        <h2 className="text-2xl text-gray-900">{title}</h2>
        {description && (
          <div className="mt-2 text-sm text-gray-600 font-medium">
            {description}
          </div>
        )}
      </div>
      <div>{children}</div>
    </div>
  );
};

export default PageHeader;
