import { useRef, useState } from "react";
import { debounce, isNil } from "lodash-es";
import { Pagination } from "../../../types/pagination";

export type PaginatedFetchFn<T> = (
  page: number,
  search: string
) => Promise<{ data: T[]; pagination: Pagination }>;

type UsePaginatedSearchResult<T> = {
  items: T[];
  loading: boolean;
  hasMore: boolean;
  searchValue: string;
  setSearchValue: (v: string) => void;
  fetchNext: () => void;
  fetchFirst: () => void;
  removeItem: (id: string) => void;
};

export function usePaginatedSearch<T extends { id: string }>(
  fetchFn: PaginatedFetchFn<T>
): UsePaginatedSearchResult<T> {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [searchValue, setSearchValue] = useState("");

  // Refs so closures always see current values without re-creating debounce
  const fetchFnRef = useRef(fetchFn);
  fetchFnRef.current = fetchFn;

  const searchValueRef = useRef(searchValue);
  searchValueRef.current = searchValue;

  const latestPaginationRef = useRef<Pagination | null>(null);

  const fetchData = (fromPage?: number) => {
    setLoading(true);

    let from: number | null = null;

    if (isNil(fromPage)) {
      if (isNil(latestPaginationRef.current)) {
        from = 1;
      } else if (!isNil(latestPaginationRef.current.nextPage)) {
        from = latestPaginationRef.current.nextPage;
      }
    } else {
      from = fromPage;
    }

    if (!isNil(from)) {
      const page = from;
      fetchFnRef.current(page, searchValueRef.current).then((result) => {
        if (page === 1) {
          setItems([...result.data]);
        } else {
          setItems((prev) => [...prev, ...result.data]);
        }
        latestPaginationRef.current = result.pagination;
        setLoading(false);
        setHasMore(!!result.pagination.nextPage);
      });
    } else {
      setLoading(false);
    }
  };

  // Stable debounced wrapper — created once, reads from refs
  const debouncedFetchRef = useRef(
    debounce((fromPage?: number) => fetchData(fromPage), 100)
  );

  const fetchNext = () => {
    debouncedFetchRef.current();
  };

  const fetchFirst = () => {
    setItems([]);
    setHasMore(true);
    latestPaginationRef.current = null;
    debouncedFetchRef.current(1);
  };

  const removeItem = (id: string) => {
    setItems((prev) => {
      const next = prev.filter((item) => item.id !== id);
      if (next.length === 0) setHasMore(false);
      return next;
    });
  };

  return {
    items,
    loading,
    hasMore,
    searchValue,
    setSearchValue,
    fetchNext,
    fetchFirst,
    removeItem,
  };
}
