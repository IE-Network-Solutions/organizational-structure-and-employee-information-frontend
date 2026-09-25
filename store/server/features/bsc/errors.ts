/** Normalize Nest / Axios errors into a plain Error for React Query onError handlers. */
export function toBscError(error: unknown, fallback = 'BSC request failed'): Error {
  if (error instanceof Error && !(error as { response?: unknown }).response) {
    return error;
  }

  const axiosLike = error as {
    response?: { data?: unknown };
    message?: string;
  };
  const data = axiosLike.response?.data;

  if (typeof data === 'string' && data.trim()) {
    return new Error(data);
  }

  if (data && typeof data === 'object') {
    const message = (data as { message?: unknown; error?: unknown }).message;
    if (typeof message === 'string' && message.trim()) {
      return new Error(message);
    }
    if (Array.isArray(message) && message.length > 0) {
      return new Error(message.map(String).join(', '));
    }
    const nested = (data as { error?: unknown }).error;
    if (typeof nested === 'string' && nested.trim()) {
      return new Error(nested);
    }
  }

  if (typeof axiosLike.message === 'string' && axiosLike.message.trim()) {
    return new Error(axiosLike.message);
  }

  return new Error(fallback);
}
