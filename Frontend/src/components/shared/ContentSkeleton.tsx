import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface ContentSkeletonProps {
  lines?: number;
  showImage?: boolean;
  className?: string;
}

export const ContentSkeleton: React.FC<ContentSkeletonProps> = ({
  lines = 3,
  showImage = false,
  className = "",
}) => {
  return (
    <div className={`space-y-4 ${className}`}>
      {showImage && <Skeleton className="h-48 w-full rounded-lg" />}
      <Skeleton className="h-6 w-3/4" />
      {Array.from({ length: lines }).map((_, idx) => (
        <Skeleton key={idx} className="h-4 w-full" />
      ))}
    </div>
  );
};
