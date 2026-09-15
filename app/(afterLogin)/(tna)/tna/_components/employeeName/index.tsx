import React, { FC } from 'react';
import { useGetSimpleEmployee } from '@/store/server/features/employees/employeeDetail/queries';

interface EmployeeNameProps {
  userId?: string | null;
  /** Rendered when there is no user id at all. */
  fallback?: string;
  className?: string;
}

/** Resolves a user id to a display name; react-query dedupes repeats by id. */
const EmployeeName: FC<EmployeeNameProps> = ({
  userId,
  fallback = '-',
  className = '',
}) => {
  const { data, isLoading, isError } = useGetSimpleEmployee(userId ?? '');

  if (!userId) {
    return (
      <span className={className} data-cy="tna-employee-name-empty">
        {fallback}
      </span>
    );
  }

  if (isLoading) {
    return (
      <span className={className} data-cy="tna-employee-name-loading">
        …
      </span>
    );
  }

  if (isError || !data) {
    return (
      <span className={className} data-cy="tna-employee-name-error">
        {fallback}
      </span>
    );
  }

  const fullName =
    [data.firstName, data.middleName, data.lastName]
      .filter(Boolean)
      .join(' ') ||
    data.email ||
    fallback;

  return (
    <span className={className} data-cy="tna-employee-name">
      {fullName}
    </span>
  );
};

export default EmployeeName;
