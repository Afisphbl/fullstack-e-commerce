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
import { usePageTitle } from "@/hooks/usePageTitle";
import { useSiteSettings } from "@/contexts/SiteSettingsContext";

const AboutPage = () => {
  usePageTitle("About Us");
  const { settings } = useSiteSettings();

  return (
    <div>
      <section className='bg-gradient-hero text-primary-foreground py-16 md:py-20'>
        <div className='container mx-auto px-4'>
          <div className='grid grid-cols-1 items-center gap-10 lg:grid-cols-2'>
            <div>
              <p className='mb-3 text-xs uppercase tracking-[0.2em] text-accent'>
                {settings.aboutEyebrow}
              </p>
              <h1 className='mb-4 text-4xl font-display font-bold md:text-5xl'>
                {settings.aboutTitle}{" "}
                <span className='text-gradient'>{settings.aboutHighlight}</span>
              </h1>
              <p className='text-lg text-primary-foreground/75 whitespace-pre-wrap'>
                {settings.aboutIntro}
              </p>
            </div>
            <div className='overflow-hidden rounded-2xl border border-white/20 shadow-2xl'>
              <img
                src={
                  settings.aboutImage ||
                  "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200"
                }
                alt='Modern technology workspace'
                className='h-full w-full object-cover'
              />
            </div>
          </div>
        </div>
      </section>

      <section className='py-16 bg-background'>
        <div className='container mx-auto px-4'>
          <div className='grid grid-cols-2 md:grid-cols-4 gap-8 text-center'>
            {settings.aboutStats?.map((stat, idx) => {
              const icons = [Users, Globe, Zap, Award];
              const Icon = icons[idx % icons.length];
              return (
                <div key={idx}>
                  <Icon className='h-8 w-8 text-primary mx-auto mb-3' />
                  <p className='text-3xl font-display font-bold text-foreground'>
                    {stat.value}
                  </p>
                  <p className='text-sm text-muted-foreground'>{stat.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className='py-16 bg-card'>
        <div className='container mx-auto px-4'>
          <div className='mx-auto mb-10 max-w-2xl text-center'>
            <h2 className='mb-3 text-2xl font-display font-bold text-foreground'>
              Our Core Values
            </h2>
            <p className='text-muted-foreground'>
              The principles that shape every product, partnership, and customer
              experience at VoltEdge.
            </p>
          </div>

          <div className='grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4'>
            {settings.aboutValues?.map((val, idx) => {
              const icons = [ShieldCheck, Lightbulb, Handshake, Rocket];
              const Icon = icons[idx % icons.length];
              return (
                <div
                  key={idx}
                  className='rounded-xl border border-border bg-background p-5'
                >
                  <div className='mb-3 inline-flex rounded-lg bg-primary/10 p-2.5'>
                    <Icon className='h-5 w-5 text-primary' />
                  </div>
                  <h3 className='mb-1 font-display font-semibold text-foreground'>
                    {val.title}
                  </h3>
                  <p className='text-sm text-muted-foreground whitespace-pre-wrap'>
                    {val.desc}
                  </p>
                </div>
              );
            })}
          </div>

          <div className='mt-12 rounded-2xl border border-border bg-background p-6 md:p-8'>
            <h3 className='mb-5 text-xl font-display font-bold text-foreground'>
              Strategic Pillars
            </h3>
            <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
              {[
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
              ].map((pillar) => (
                <div
                  key={pillar.title}
                  className='rounded-lg border border-border p-4'
                >
                  <h4 className='mb-1 font-semibold text-foreground'>
                    {pillar.title}
                  </h4>
                  <p className='text-sm text-muted-foreground'>{pillar.text}</p>
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
