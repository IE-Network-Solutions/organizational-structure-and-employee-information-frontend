/** Synthetic user returned when GET /users/:id responds 404 (stale reference, deleted user, etc.). */
export const UNKNOWN_EMPLOYEE_FLAG = '__unknownEmployee' as const;

export function createUnknownEmployeePlaceholder(requestedId: string) {
  return {
    [UNKNOWN_EMPLOYEE_FLAG]: true,
    id: requestedId,
    firstName: 'Unknown',
    middleName: '',
    lastName: 'user',
    profileImage: undefined as string | undefined,
  };
}

export function isUnknownEmployeeRecord(data: unknown): boolean {
  return (
    typeof data === 'object' &&
    data !== null &&
    (data as Record<string, unknown>)[UNKNOWN_EMPLOYEE_FLAG] === true
  );
}

export function isUserNotFoundError(error: unknown): boolean {
  const status = (error as { response?: { status?: number } })?.response
    ?.status;
  return status === 404;
}
