import { useState, useMemo } from "react";
import { Product } from "@/lib/api";

export const useProductFilters = (products: Product[] | undefined) => {
  const [search, setSearch] = useState("");

  const filteredProducts = useMemo(() => {
    if (!products) return [];
    return products.filter((p) =>
      p.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [products, search]);

  return {
    search,
    setSearch,
    filteredProducts,
  };
};
