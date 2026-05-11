import React, { useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useFAQs } from "@/hooks/useFAQs";
import { ContentSkeleton } from "@/components/shared/ContentSkeleton";
import { usePageTitle } from "@/hooks/usePageTitle";

const FAQPage = () => {
  usePageTitle("FAQ");
  const [search, setSearch] = useState("");
  
  // Fetch FAQs from API
  const { data: faqs, isLoading, error } = useFAQs();

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-10">
        <ContentSkeleton lines={8} />
      </div>
    );
  }

  if (error || !faqs) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-10">
        <div className="text-center">
          <h1 className="mb-2 text-3xl font-display font-bold text-foreground">
            Frequently Asked Questions
          </h1>
          <p className="text-muted-foreground">
            Unable to load FAQs. Please try again later.
          </p>
        </div>
      </div>
    );
  }

  const filtered = faqs.filter(
    (f) =>
      f.question.toLowerCase().includes(search.toLowerCase()) ||
      f.answer.toLowerCase().includes(search.toLowerCase()),
  );
  const categories = [...new Set(faqs.map((f) => f.category))];

  return (
    <div className="container mx-auto max-w-4xl px-4 py-10">
      <h1 className="mb-2 text-3xl font-display font-bold text-foreground">
        Frequently Asked Questions
      </h1>
      <p className="mb-8 text-muted-foreground">
        Find answers to common questions
      </p>

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
                  key={faq._id || faq.id}
                  value={faq._id || faq.id}
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
