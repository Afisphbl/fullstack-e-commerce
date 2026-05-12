import type { ImgHTMLAttributes } from "react";

import { buildSrcSet, optimizeImageUrl } from "@/lib/images";

interface OptimizedImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  widths?: number[];
  optimizeWidth?: number;
  optimizeHeight?: number;
  crop?: "fill" | "fit" | "limit";
}

export const OptimizedImage = ({
  src = "",
  alt,
  widths,
  sizes,
  optimizeWidth,
  optimizeHeight,
  crop = "fill",
  loading,
  decoding,
  fetchPriority,
  ...props
}: OptimizedImageProps) => {
  const optimizedSrc = optimizeImageUrl(src, {
    width: optimizeWidth,
    height: optimizeHeight,
    crop,
  });
  const srcSet = widths?.length
    ? buildSrcSet(src, widths, { height: optimizeHeight, crop })
    : undefined;

  return (
    <img
      {...props}
      src={optimizedSrc}
      srcSet={srcSet}
      sizes={srcSet ? sizes : undefined}
      alt={alt}
      loading={loading ?? "lazy"}
      decoding={decoding ?? "async"}
      fetchPriority={fetchPriority}
    />
  );
};
