import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchBlogs, Blog } from "@/lib/api";
import { Calendar, Clock, ArrowRight, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { usePageTitle } from "@/hooks/usePageTitle";

const BlogPage = () => {
  usePageTitle("Blog");
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  useEffect(() => {
    fetchBlogs().then(setBlogs);
  }, []);

  const categories = ["All", ...new Set(blogs.map((blog) => blog.category))];

  const filtered = blogs
    .filter(
      (blog) => activeCategory === "All" || blog.category === activeCategory,
    )
    .filter((blog) => {
      const query = search.toLowerCase();
      return (
        blog.title.toLowerCase().includes(query) ||
        blog.excerpt.toLowerCase().includes(query) ||
        blog.author.toLowerCase().includes(query)
      );
    });

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="mx-auto mb-8 max-w-3xl text-center">
        <h1 className="mb-2 text-3xl font-display font-bold text-foreground">
          Tech Blog
        </h1>
        <p className="text-muted-foreground">
          Stay up to date with the latest in technology, product insights, and
          practical guides.
        </p>
      </div>

      <div className="mx-auto mb-5 max-w-2xl">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search articles"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 rounded-full bg-card pl-10"
          />
        </div>
      </div>

      <div className="mb-8 flex flex-wrap items-center justify-center gap-2">
        {categories.map((category) => (
          <Button
            key={category}
            size="sm"
            variant={activeCategory === category ? "default" : "outline"}
            className="rounded-full"
            onClick={() => setActiveCategory(category)}
          >
            {category}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((blog) => (
          <Link
            key={blog.id}
            to={`/blog/${blog.slug}`}
            className="group overflow-hidden rounded-xl border border-border bg-card shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-elevated"
          >
            <div className="aspect-[16/10] overflow-hidden">
              <img
                src={blog.image}
                alt={blog.title}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <div className="p-4">
              <div className="mb-2 flex items-center justify-between gap-2 text-[11px] text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <Calendar className="h-3 w-3" /> {blog.date}
                </span>
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-primary">
                  {blog.category}
                </span>
              </div>
              <h2 className="mb-2 line-clamp-2 font-display text-base font-bold text-foreground transition-colors group-hover:text-primary">
                {blog.title}
              </h2>
              <p className="mb-3 line-clamp-3 text-sm text-muted-foreground">
                {blog.excerpt}
              </p>
              <div className="mb-3 flex items-center justify-between text-xs text-muted-foreground">
                <span>By {blog.author}</span>
                <span className="inline-flex items-center gap-1">
                  <Clock className="h-3 w-3" /> {blog.readTime}
                </span>
              </div>
              <span className="inline-flex items-center gap-1 text-sm text-primary">
                Read More <ArrowRight className="h-3 w-3" />
              </span>
            </div>
          </Link>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="py-16 text-center text-muted-foreground">
          No blog posts found for your filters.
        </p>
      )}
    </div>
  );
};

export default BlogPage;
