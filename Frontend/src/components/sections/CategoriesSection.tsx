import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { fetchCategories, Category } from "@/lib/api";

interface CategoriesSectionProps {
  data: {
    title?: string;
  };
}

export const CategoriesSection: React.FC<CategoriesSectionProps> = ({ data }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchCategories()
      .then((cats) => {
        setCategories(cats);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-display font-bold text-foreground">
            {data.title || "Shop by Category"}
          </h2>
          <Link
            to="/shop"
            className="text-sm text-primary hover:underline flex items-center gap-1"
          >
            View All <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {loading ? (
            Array.from({ length: 5 }).map((_, idx) => (
              <div
                key={idx}
                className="relative rounded-lg overflow-hidden aspect-square bg-muted animate-pulse"
              >
                <div className="absolute bottom-3 left-3 space-y-2">
                  <div className="h-4 w-24 bg-muted-foreground/20 rounded" />
                  <div className="h-3 w-16 bg-muted-foreground/20 rounded" />
                </div>
              </div>
            ))
          ) : (
            categories.slice(0, 5).map((cat) => (
              <Link
                key={cat.id}
                to={`/shop?category=${cat.id}`}
                className="group relative rounded-lg overflow-hidden aspect-square"
              >
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/65 to-transparent dark:from-white/80 dark:to-white/15" />
                <div className="absolute bottom-3 left-3">
                  <h3 className="font-display text-sm font-bold text-white dark:text-black">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-white/80 dark:text-black/80">
                    {cat.count} products
                  </p>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </section>
  );
};
