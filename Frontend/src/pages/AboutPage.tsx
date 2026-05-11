import React from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchPageBySlug } from "@/lib/api";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { SEO } from "@/components/shared/SEO";

const AboutPage = () => {
  const { data: page, isLoading, error } = useQuery({
    queryKey: ["page", "about"],
    queryFn: () => fetchPageBySlug("about"),
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
        <p className="text-muted-foreground">The content for this page could not be loaded.</p>
      </div>
    );
  }

  return (
    <>
      <SEO title={page.seoTitle || page.title} description={page.seoDescription} />
      
      <section className="bg-gradient-hero text-primary-foreground py-16 md:py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="mb-4 text-4xl font-display font-bold md:text-5xl">
            {page.title}
          </h1>
        </div>
      </section>

      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 max-w-4xl">
          <div 
            className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-display prose-a:text-primary"
            dangerouslySetInnerHTML={{ __html: page.content }} 
          />
        </div>
      </section>
    </>
  );
};

export default AboutPage;
