const CLOUDINARY_SEGMENT = "/image/upload/";

type CloudinaryFormat = "auto" | "webp" | "avif" | "jpg" | "png";

interface TransformOptions {
  width?: number;
  height?: number;
  quality?: "auto" | number;
  format?: CloudinaryFormat;
  crop?: "fill" | "fit" | "limit";
}

const isCloudinaryUrl = (src: string) =>
  src.includes("res.cloudinary.com") && src.includes(CLOUDINARY_SEGMENT);

export const optimizeImageUrl = (
  src: string,
  {
    width,
    height,
    quality = "auto",
    format = "auto",
    crop = "fill",
  }: TransformOptions = {},
) => {
  if (!src || !isCloudinaryUrl(src)) {
    return src;
  }

  const transforms = [`f_${format}`, `q_${quality}`];

  if (width) transforms.push(`w_${width}`);
  if (height) transforms.push(`h_${height}`);
  if (width || height) transforms.push(`c_${crop}`);

  return src.replace(
    CLOUDINARY_SEGMENT,
    `${CLOUDINARY_SEGMENT}${transforms.join(",")}/`,
  );
};

export const buildSrcSet = (
  src: string,
  widths: number[],
  options: Omit<TransformOptions, "width"> = {},
) => {
  if (!src || !isCloudinaryUrl(src)) {
    return undefined;
  }

  return widths
    .map((width) => `${optimizeImageUrl(src, { ...options, width })} ${width}w`)
    .join(", ");
};

export const preloadImage = (
  href: string,
  options?: { srcSet?: string; sizes?: string; fetchPriority?: "high" | "low" },
) => {
  if (typeof document === "undefined" || !href) {
    return () => {};
  }

  const link = document.createElement("link");
  link.rel = "preload";
  link.as = "image";
  link.href = href;

  if (options?.srcSet) link.imageSrcset = options.srcSet;
  if (options?.sizes) link.imageSizes = options.sizes;
  if (options?.fetchPriority) link.fetchPriority = options.fetchPriority;

  document.head.appendChild(link);

  return () => {
    link.remove();
  };
};
