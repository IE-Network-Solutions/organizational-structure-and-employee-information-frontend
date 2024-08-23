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
    <>
      <div className="flex justify-between items-center">
        <h2 className="text-2xl text-gray-900">{title}</h2>
        <div>{children}</div>
      </div>
      {description && (
        <div className="mt-2 text-sm text-gray-600">{description}</div>
      )}
    </>
  );
};

export default PageHeader;
