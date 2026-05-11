import React from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchPageBySlug } from "@/lib/api";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { SEO } from "@/components/shared/SEO";

const DynamicPage = () => {
  const { slug } = useParams<{ slug: string }>();

  const { data: page, isLoading, error } = useQuery({
    queryKey: ["page", slug],
    queryFn: () => fetchPageBySlug(slug as string),
    enabled: !!slug,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !page) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold mb-4">Page Not Found</h1>
        <p className="text-muted-foreground">The page you're looking for doesn't exist or has been moved.</p>
      </div>
    );
  }

  return (
    <>
      <SEO title={page.seoTitle || page.title} description={page.seoDescription} />
      
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <h1 className="mb-8 text-4xl font-display font-bold text-foreground">
          {page.title}
        </h1>
        
        <div 
          className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-display prose-a:text-primary"
          dangerouslySetInnerHTML={{ __html: page.content }} 
        />
      </div>
    </>
  );
};

export default DynamicPage;
