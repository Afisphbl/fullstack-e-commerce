import { Skeleton } from "@/components/ui/skeleton";

export const ProductSkeleton = () => (
  <div className="rounded-xl border border-border bg-card/90 p-3 space-y-4">
    <Skeleton className="aspect-[4/3] w-full rounded-lg" />
    <div className="space-y-2">
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-5 w-full" />
      <div className="flex justify-between items-center pt-2">
        <Skeleton className="h-6 w-1/4" />
        <Skeleton className="h-8 w-1/4" />
      </div>
    </div>
  </div>
);
