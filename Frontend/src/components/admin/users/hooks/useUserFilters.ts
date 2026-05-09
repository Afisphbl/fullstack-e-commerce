import { useEffect, useState, useDeferredValue } from "react";
import { useSearchParams } from "react-router-dom";

export const useUserFilters = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchInput, setSearchInput] = useState(searchParams.get("search") || "");
  const deferredSearch = useDeferredValue(searchInput);

  const tab = searchParams.get("tab") || "all";
  const role = searchParams.get("role") || "all";
  const status = searchParams.get("status") || "all";
  const page = Number(searchParams.get("page") || "1");
  const searchParamString = searchParams.toString();

  const updateParams = (updates: Record<string, string | null>) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (!value || value === "all") {
        next.delete(key);
      } else {
        next.set(key, value);
      }
    });

    if (!next.get("page")) next.set("page", "1");
    setSearchParams(next);
  };

  useEffect(() => {
    setSearchInput(searchParams.get("search") || "");
  }, [searchParamString, searchParams]);

  useEffect(() => {
    const current = searchParams.get("search") || "";
    if (deferredSearch !== current) {
      const next = new URLSearchParams(searchParams);
      if (deferredSearch) next.set("search", deferredSearch);
      else next.delete("search");
      next.set("page", "1");
      setSearchParams(next);
    }
  }, [deferredSearch, searchParamString, searchParams, setSearchParams]);

  return {
    searchInput,
    setSearchInput,
    deferredSearch,
    tab,
    role,
    status,
    page,
    updateParams,
  };
};
