import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchBlogBySlug, Blog } from '@/lib/api';
import { Calendar, Clock, ChevronLeft, User } from 'lucide-react';

import { LoadingPage } from "@/components/ui/loading-spinner";

const BlogDetailPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [blog, setBlog] = useState<Blog | null>(null);
  useEffect(() => { if (slug) fetchBlogBySlug(slug).then(b => setBlog(b || null)); }, [slug]);

  if (!blog) return <LoadingPage />;

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <Link to="/blog" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary mb-6">
        <ChevronLeft className="h-4 w-4" /> Back to Blog
      </Link>
      <div className="rounded-lg overflow-hidden mb-8 aspect-video">
        <img src={blog.image} alt={blog.title} className="w-full h-full object-cover" />
      </div>
      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
        <span className="flex items-center gap-1"><User className="h-4 w-4" /> {blog.author}</span>
        <span className="flex items-center gap-1"><Calendar className="h-4 w-4" /> {blog.date}</span>
        <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> {blog.readTime}</span>
      </div>
      <h1 className="text-3xl font-display font-bold text-foreground mb-6">{blog.title}</h1>
      <div className="prose prose-lg max-w-none text-muted-foreground leading-relaxed whitespace-pre-line font-body">
        {blog.content}
      </div>
    </div>
  );
};

export default BlogDetailPage;