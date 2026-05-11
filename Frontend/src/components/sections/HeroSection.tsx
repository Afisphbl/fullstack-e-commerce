import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeroSlide {
  image: string;
  title: string;
  subtitle: string;
}

interface HeroSectionProps {
  data: {
    slides: HeroSlide[];
  };
}

export const HeroSection: React.FC<HeroSectionProps> = ({ data }) => {
  const [slideIndex, setSlideIndex] = useState(0);
  const slides = data.slides || [];

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % slides.length);
    }, 3500);

    return () => clearInterval(timer);
  }, [slides.length]);

  if (!slides.length) return null;

  return (
    <section className="bg-gradient-hero text-primary-foreground relative overflow-hidden">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/30 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-float [animation-delay:3s]" />
      </div>
      <div className="container mx-auto px-4 py-24 md:py-32 relative z-10">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2">
          <div className="max-w-2xl animate-slide-up">
            <p className="text-accent font-display text-sm tracking-widest mb-4">
              NEXT-GEN ELECTRONICS
            </p>
            <h1 className="text-4xl md:text-6xl font-display font-bold mb-6 leading-tight">
              Experience The <span className="text-gradient">Future</span> Of
              Technology
            </h1>
            <p className="text-lg text-primary-foreground/70 mb-8 font-body">
              Discover cutting-edge electronics with unmatched performance.
              From AI-powered laptops to quantum displays — we bring
              tomorrow's tech today.
            </p>
            <div className="flex gap-4">
              <Button
                asChild
                size="lg"
                className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-neon font-display text-sm"
              >
                <Link to="/shop">
                  Shop Now <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-border bg-background/90 text-foreground hover:bg-background font-display text-sm"
              >
                <Link to="/about">Learn More</Link>
              </Button>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-white/20 bg-black/20 p-2 shadow-2xl">
            <div className="relative aspect-[16/11] overflow-hidden rounded-xl">
              {slides.map((slide, idx) => (
                <img
                  key={slide.title + idx}
                  src={slide.image}
                  alt={slide.title}
                  className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${idx === slideIndex ? "opacity-100" : "opacity-0"}`}
                />
              ))}
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <p className="text-xs uppercase tracking-[0.15em] text-accent">
                  Featured
                </p>
                <h3 className="text-xl font-display font-bold text-white">
                  {slides[slideIndex]?.title}
                </h3>
                <p className="text-sm text-white/80">
                  {slides[slideIndex]?.subtitle}
                </p>
              </div>
            </div>
            {slides.length > 1 && (
              <div className="mt-3 flex justify-center gap-1.5">
                {slides.map((_, idx) => (
                  <button
                    key={idx}
                    aria-label={`Go to hero slide ${idx + 1}`}
                    onClick={() => setSlideIndex(idx)}
                    className={`h-1.5 rounded-full transition-all ${idx === slideIndex ? "w-6 bg-white" : "w-2 bg-white/45"}`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
