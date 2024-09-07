import { useCallback, useState } from 'react';

const usePagination = (initialPage: number = 1, initialLimit: number = 10) => {
  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);

  const updatePage = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  const updateLimit = useCallback((newLimit: number) => {
    setLimit(newLimit);
  }, []);

  return {
    page,
    limit,
    setPage: updatePage,
    setLimit: updateLimit,
  };
};

export default usePagination;
