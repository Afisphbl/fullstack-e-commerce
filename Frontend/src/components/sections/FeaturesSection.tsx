import React from "react";
import * as LucideIcons from "lucide-react";

interface Feature {
  icon: string;
  title: string;
  desc: string;
}

interface FeaturesSectionProps {
  data: {
    features: Feature[];
  };
}

export const FeaturesSection: React.FC<FeaturesSectionProps> = ({ data }) => {
  const features = data.features || [];

  return (
    <section className="py-12 border-b border-border bg-card">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map(({ icon, title, desc }, idx) => {
            const Icon = (LucideIcons as any)[icon] || LucideIcons.Zap;
            return (
              <div key={idx} className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-primary/10">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{title}</h3>
                  <p className="text-sm text-muted-foreground">{desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
