import { LucideIcon } from "lucide-react";

interface SectionCardProps {
  title: string;
  icon: LucideIcon;
  children: React.ReactNode;
}

export const SectionCard = ({
  title,
  icon: Icon,
  children,
}: SectionCardProps) => (
  <div className='rounded-xl border border-border bg-card p-6 shadow-card'>
    <div className='mb-4 flex items-center gap-2'>
      <div className='rounded-lg bg-primary/10 p-2'>
        <Icon className='h-4 w-4 text-primary' />
      </div>
      <h2 className='font-display font-semibold text-foreground'>{title}</h2>
    </div>
    <div className='space-y-4'>{children}</div>
  </div>
);
