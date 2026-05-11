import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export const HeroSkeleton = () => {
  return (
    <section className="bg-gradient-hero text-primary-foreground relative overflow-hidden">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/30 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-float [animation-delay:3s]" />
      </div>
      <div className="container mx-auto px-4 py-24 md:py-32 relative z-10">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2">
          <div className="max-w-2xl space-y-6">
            <Skeleton className="h-4 w-32 bg-primary-foreground/20" />
            <Skeleton className="h-12 w-full bg-primary-foreground/20" />
            <Skeleton className="h-12 w-3/4 bg-primary-foreground/20" />
            <Skeleton className="h-20 w-full bg-primary-foreground/20" />
            <div className="flex gap-4">
              <Skeleton className="h-12 w-32 bg-primary-foreground/20" />
              <Skeleton className="h-12 w-32 bg-primary-foreground/20" />
            </div>
          </div>
          <div className="relative overflow-hidden rounded-2xl border border-white/20 bg-black/20 p-2 shadow-2xl">
            <Skeleton className="aspect-[16/11] rounded-xl bg-primary-foreground/20" />
          </div>
        </div>
      </div>
    </section>
  );
};
