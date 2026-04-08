import React from 'react';

const CustomLabel = (
  label: React.ReactNode,
  { required }: { required: boolean },
) => (
  <div data-cy="custom-label">
    {label}
    {required && (
      <span className="ml-1 text-error" data-cy="custom-label-required">
        *
      </span>
    )}
  </div>
);

export default CustomLabel;
