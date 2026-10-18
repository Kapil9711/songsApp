import { useState } from "react";
export const usePaginatedData = (
  initialData: any,
  initialPageSize?: number,
  initialPage?: number,
) => {
  const [page, setPage] = useState(initialPage || 1);
  const [pageSize, setPageSize] = useState(initialPageSize || 20);
  const [loading, setLoading] = useState(false);
  const skip = (page - 1) * pageSize;
  const endIndex = skip + pageSize;
  const end = Math.min(endIndex, initialData.length);
  const data = initialData?.slice(0, end);
  const loadMore = () => {
    if (endIndex < initialData.length) {
      setLoading(true);
      setTimeout(() => {
        setPage(() => page + 1);
        setLoading(false);
      }, 100);
    }
  };
  return [data, loadMore, loading, setPageSize, setPage];
};
