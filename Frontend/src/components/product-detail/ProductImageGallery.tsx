import { useState, useEffect } from "react";

interface ProductImageGalleryProps {
  images: string[];
  productName: string;
}

const PLACEHOLDER_IMAGE = "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=800&fit=crop";

export const ProductImageGallery = ({ images, productName }: ProductImageGalleryProps) => {
  const [selectedImage, setSelectedImage] = useState(0);

  // Clamp selectedImage when images array changes
  useEffect(() => {
    if (images.length === 0) {
      setSelectedImage(0);
    } else {
      const safeIndex = Math.max(0, Math.min(selectedImage, images.length - 1));
      if (safeIndex !== selectedImage) {
        setSelectedImage(safeIndex);
      }
    }
  }, [images, selectedImage]);

  // Get safe image source with fallback
  const currentImageSrc = images.length > 0 ? images[selectedImage] : PLACEHOLDER_IMAGE;

  return (
    <div>
      <div className="rounded-lg overflow-hidden bg-card border border-border mb-4 aspect-square">
        <img
          src={currentImageSrc}
          alt={productName}
          className="w-full h-full object-cover"
        />
      </div>
      {images.length > 1 && (
        <div className="flex gap-2">
          {images.map((img, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setSelectedImage(i)}
              aria-label={`Select image ${i + 1}`}
              className={`w-20 h-20 rounded-md overflow-hidden border-2 transition-colors ${
                i === selectedImage ? "border-primary" : "border-border"
              }`}
            >
              <img
                src={img}
                alt=""
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
