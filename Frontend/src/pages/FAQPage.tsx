import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchFAQs, FAQ, fetchPageBySlug } from "@/lib/api";
import { SEO } from "@/components/shared/SEO";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";

const FAQPage = () => {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [search, setSearch] = useState("");

  const { data: page, isLoading: isPageLoading } = useQuery({
    queryKey: ["page", "faq"],
    queryFn: () => fetchPageBySlug("faq"),
  });
  useEffect(() => {
    fetchFAQs().then(setFaqs);
  }, []);

  const filtered = faqs.filter(
    (f) =>
      f.question.toLowerCase().includes(search.toLowerCase()) ||
      f.answer.toLowerCase().includes(search.toLowerCase()),
  );
  const categories = [...new Set(faqs.map((f) => f.category))];

  if (isPageLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-10">
      <SEO title={page?.seoTitle || "FAQ"} description={page?.seoDescription} />
      
      <h1 className="mb-2 text-3xl font-display font-bold text-foreground">
        {page?.title || "Frequently Asked Questions"}
      </h1>
      
      {page?.content ? (
        <div 
          className="prose prose-lg dark:prose-invert max-w-none prose-p:text-muted-foreground mb-8"
          dangerouslySetInnerHTML={{ __html: page.content }}
        />
      ) : (
        <p className="mb-8 text-muted-foreground">
          Find answers to common questions
        </p>
      )}

      <div className="relative mb-8">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search questions..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 bg-card"
        />
      </div>

      {categories.map((cat) => {
        const catFaqs = filtered.filter((f) => f.category === cat);
        if (catFaqs.length === 0) return null;
        return (
          <div
            key={cat}
            className="mb-7 rounded-xl border border-border bg-card p-5"
          >
            <div className="mb-4 inline-flex rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              {cat}
            </div>
            <Accordion type="single" collapsible>
              {catFaqs.map((faq) => (
                <AccordionItem
                  key={faq.id}
                  value={faq.id}
                  className="border-border"
                >
                  <AccordionTrigger className="text-left font-medium text-foreground hover:text-primary">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        );
      })}
    </div>
  );
};

export default FAQPage;
