import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  className?: string;
  size?: number;
}

export const LoadingSpinner = ({ className, size = 24 }: LoadingSpinnerProps) => {
  return (
    <Loader2 
      className={cn("animate-spin text-primary", className)} 
      size={size} 
    />
  );
};

export const LoadingPage = () => {
  return (
    <div className="flex h-[400px] w-full items-center justify-center">
      <LoadingSpinner size={40} />
    </div>
  );
};
