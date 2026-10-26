import { useCallback, useMemo, useState } from "react";

export function usePaginatedData<T>(
  initialData: T[] = [],
  initialPageSize = 20,
  initialPage = 1,
) {
  const [page, setPage] = useState(Math.max(1, initialPage));
  const [pageSize, setPageSizeState] = useState(Math.max(1, initialPageSize));

  const data = useMemo(() => {
    const endIndex = page * pageSize;
    return initialData.slice(0, endIndex);
  }, [initialData, page, pageSize]);

  const hasMore = data.length < initialData.length;

  const loadMore = useCallback(() => {
    setPage((currentPage) => {
      const maxPage = Math.ceil(initialData.length / pageSize);

      return Math.min(currentPage + 1, maxPage);
    });
  }, [initialData.length, pageSize]);

  const setPageSize = useCallback((size: number) => {
    setPageSizeState(Math.max(1, size));
    setPage(1);
  }, []);

  return {
    data,
    loadMore,
    hasMore,
    page,
    pageSize,
    setPage,
    setPageSize,
  };
}
