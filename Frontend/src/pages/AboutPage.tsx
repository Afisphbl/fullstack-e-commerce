import React from "react";
import {
  Zap,
  Globe,
  Users,
  Award,
  ShieldCheck,
  Lightbulb,
  Rocket,
  Handshake,
} from "lucide-react";
import * as LucideIcons from "lucide-react";
import { usePageContent } from "@/hooks/usePageContent";
import { ContentSkeleton } from "@/components/shared/ContentSkeleton";
import { usePageTitle } from "@/hooks/usePageTitle";

const AboutPage = () => {
  usePageTitle("About Us");
  const { data: pageContent, isLoading } = usePageContent("about");

  // Get icon component dynamically
  const getIconComponent = (iconName: string) => {
    const Icon = (LucideIcons as any)[iconName];
    return Icon || Zap;
  };

  // Default content
  const defaultHero = {
    title: "About VoltEdge",
    subtitle: "We're on a mission to make cutting-edge technology accessible to everyone. Founded in 2020, VoltEdge has grown from a small startup to a global electronics destination trusted by millions.",
    image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200",
  };

  const defaultStats = [
    { icon: "Users", value: "2M+", label: "Happy Customers" },
    { icon: "Globe", value: "50+", label: "Countries" },
    { icon: "Zap", value: "10K+", label: "Products" },
    { icon: "Award", value: "99%", label: "Satisfaction" },
  ];

  const defaultValues = [
    {
      icon: "ShieldCheck",
      title: "Trust First",
      description: "Transparent pricing, verified products, and secure transactions.",
    },
    {
      icon: "Lightbulb",
      title: "Innovate Daily",
      description: "We constantly explore technologies that improve everyday life.",
    },
    {
      icon: "Handshake",
      title: "Customer Obsessed",
      description: "Every decision starts with customer value and usability.",
    },
    {
      icon: "Rocket",
      title: "Move Fast",
      description: "We ship better experiences quickly and iterate with purpose.",
    },
  ];

  const defaultPillars = [
    {
      title: "Curated Selection",
      text: "Only high-value devices with practical, real-world performance.",
    },
    {
      title: "Premium Support",
      text: "Fast and informed pre-sale and post-sale support for every customer.",
    },
    {
      title: "Reliable Fulfillment",
      text: "Strong logistics operations with dependable and traceable delivery.",
    },
  ];

  // Get content from CMS or use defaults
  const heroSection = pageContent?.sections?.find((s) => s.key === "hero");
  const statsSection = pageContent?.sections?.find((s) => s.key === "stats");
  const valuesSection = pageContent?.sections?.find((s) => s.key === "values");
  const pillarsSection = pageContent?.sections?.find((s) => s.key === "pillars");

  const hero = heroSection || defaultHero;
  const stats = statsSection?.items || defaultStats;
  const values = valuesSection?.items || defaultValues;
  const pillars = pillarsSection?.items || defaultPillars;

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <ContentSkeleton lines={10} showImage />
      </div>
    );
  }
  return (
    <div>
      <section className="bg-gradient-hero text-primary-foreground py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2">
            <div>
              <p className="mb-3 text-xs uppercase tracking-[0.2em] text-accent">
                Who We Are
              </p>
              <h1 className="mb-4 text-4xl font-display font-bold md:text-5xl">
                {hero.title || "About VoltEdge"}
              </h1>
              <p className="text-lg text-primary-foreground/75">
                {hero.subtitle || hero.description || defaultHero.subtitle}
              </p>
            </div>
            <div className="overflow-hidden rounded-2xl border border-white/20 shadow-2xl">
              <img
                src={hero.image || defaultHero.image}
                alt="About VoltEdge"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((stat: any) => {
              const Icon = getIconComponent(stat.icon);
              return (
                <div key={stat.label}>
                  <Icon className="h-8 w-8 text-primary mx-auto mb-3" />
                  <p className="text-3xl font-display font-bold text-foreground">
                    {stat.value}
                  </p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-16 bg-card">
        <div className="container mx-auto px-4">
          <div className="mx-auto mb-10 max-w-2xl text-center">
            <h2 className="mb-3 text-2xl font-display font-bold text-foreground">
              {valuesSection?.title || "Our Core Values"}
            </h2>
            <p className="text-muted-foreground">
              {valuesSection?.description || "The principles that shape every product, partnership, and customer experience at VoltEdge."}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
            {values.map((value: any) => {
              const Icon = getIconComponent(value.icon);
              return (
                <div
                  key={value.title}
                  className="rounded-xl border border-border bg-background p-5"
                >
                  <div className="mb-3 inline-flex rounded-lg bg-primary/10 p-2.5">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="mb-1 font-display font-semibold text-foreground">
                    {value.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">{value.description}</p>
                </div>
              );
            })}
          </div>

          <div className="mt-12 rounded-2xl border border-border bg-background p-6 md:p-8">
            <h3 className="mb-5 text-xl font-display font-bold text-foreground">
              {pillarsSection?.title || "Strategic Pillars"}
            </h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {pillars.map((pillar: any) => (
                <div
                  key={pillar.title}
                  className="rounded-lg border border-border p-4"
                >
                  <h4 className="mb-1 font-semibold text-foreground">
                    {pillar.title}
                  </h4>
                  <p className="text-sm text-muted-foreground">{pillar.text || pillar.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
