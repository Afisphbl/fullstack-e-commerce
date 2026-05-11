import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CtaSectionProps {
  data: {
    title: string;
    subtitle: string;
    buttonText: string;
    buttonLink: string;
  };
}

export const CtaSection: React.FC<CtaSectionProps> = ({ data }) => {
  return (
    <section className="py-20 bg-gradient-hero text-primary-foreground relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary rounded-full blur-3xl" />
      </div>
      <div className="container mx-auto px-4 text-center relative z-10">
        <h2 className="text-3xl font-display font-bold mb-4">
          {data.title}
        </h2>
        <p className="text-primary-foreground/70 mb-8 max-w-xl mx-auto">
          {data.subtitle}
        </p>
        <Button
          asChild
          size="lg"
          className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-neon font-display text-sm"
        >
          <Link to={data.buttonLink || "/shop"}>
            {data.buttonText || "Explore"} <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </section>
  );
};
