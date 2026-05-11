import React from "react";
import { HeroSection } from "./HeroSection";
import { FeaturesSection } from "./FeaturesSection";
import { CategoriesSection } from "./CategoriesSection";
import { ProductsSection } from "./ProductsSection";
import { CtaSection } from "./CtaSection";

interface SectionData {
  _id?: string;
  name: string;
  type: string;
  isActive: boolean;
  data: any;
}

interface SectionRendererProps {
  section: SectionData;
}

export const SectionRenderer: React.FC<SectionRendererProps> = ({ section }) => {
  if (!section.isActive) return null;

  switch (section.type) {
    case "hero":
      return <HeroSection data={section.data} />;
    case "features":
      return <FeaturesSection data={section.data} />;
    case "categories":
      return <CategoriesSection data={section.data} />;
    case "products":
      return <ProductsSection data={section.data} />;
    case "cta":
      return <CtaSection data={section.data} />;
    default:
      console.warn(`Unsupported section type: ${section.type}`);
      return null;
  }
};
