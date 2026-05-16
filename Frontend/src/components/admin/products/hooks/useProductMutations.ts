import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  createProduct,
  updateProduct,
  deleteProduct,
  createSpecification,
  updateSpecification,
  deleteSpecification,
  Product,
  SpecGroup,
} from "@/lib/api";
import { ProductFormValues } from "./useProductForm";

export const useProductMutations = (
  editingProduct: Product | null,
  onSuccess: () => void,
) => {
  const queryClient = useQueryClient();

  const saveMutation = useMutation({
    mutationFn: async (values: ProductFormValues) => {
      console.log('=== MUTATION START ===');
      console.log('Form values:', values);
      
      // 1. Prepare Product Payload
      const { specGroups, ...productData } = values;

      const formData = new FormData();

      // Multilingual field keys
      const multilingualKeys = ["name", "description", "shortDescription"] as const;

      // Append basic fields
      Object.entries(productData).forEach(([key, value]) => {
        if (key === "imageCover") {
          if (value instanceof File) {
            formData.append("imageCover", value);
          } else if (typeof value === "string") {
            formData.append("imageCover", value);
          }
        } else if (key === "images") {
          if (value instanceof FileList) {
            Array.from(value).forEach((file) =>
              formData.append("images", file),
            );
          } else if (typeof value === "string" && value) {
            // Split comma separated URLs back into an array for the backend
            value
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
              .forEach((img) => formData.append("images", img));
          } else if (Array.isArray(value)) {
            value.forEach((img) => formData.append("images", img));
          }
        } else if (key === "tags") {
          formData.append("tags", values.tags || "");
        } else if ((multilingualKeys as readonly string[]).includes(key)) {
          // Handle multilingual objects as field[lang] keys
          // e.g. name[en], name[am], name[om]
          const ml = value as { am?: string; en?: string; om?: string };
          console.log(`Processing multilingual field ${key}:`, ml);
          if (ml && typeof ml === "object") {
            (["en", "am", "om"] as const).forEach((lang) => {
              const langValue = ml[lang] ?? "";
              console.log(`  ${key}[${lang}] = "${langValue}"`);
              formData.append(`${key}[${lang}]`, langValue);
            });
          }
        } else if (key === "isFeatured") {
          // Backend isBoolean() validator rejects "true"/"false" strings.
          // Send "1" for true and "0" for false
          formData.append("isFeatured", value ? "1" : "0");
        } else {
          formData.append(key, String(value));
        }
      });

      // Log FormData contents
      console.log('=== FormData Contents ===');
      for (const [key, value] of formData.entries()) {
        console.log(`${key}:`, value);
      }

      let updatedOrCreated;
      if (editingProduct) {
        console.log('Updating product:', editingProduct.id);
        updatedOrCreated = await updateProduct(editingProduct.id, formData);
      } else {
        console.log('Creating new product');
        updatedOrCreated = await createProduct(formData);
      }
      console.log('Product saved:', updatedOrCreated);

      // 2. Handle Specifications
      try {
        if (specGroups && specGroups.length > 0) {
          console.log('Processing specifications:', specGroups);
          if (editingProduct?.specification) {
            await updateSpecification(
              editingProduct.specification._id ||
                editingProduct.specification.id,
              { details: specGroups as SpecGroup[] },
            );
          } else {
            await createSpecification({
              product: updatedOrCreated.id,
              details: specGroups as SpecGroup[],
            });
          }
        } else if (editingProduct?.specification) {
          console.log('Deleting specifications');
          await deleteSpecification(
            editingProduct.specification._id || editingProduct.specification.id,
          );
        }
        console.log('=== MUTATION SUCCESS ===');
        return updatedOrCreated;
      } catch (specError) {
        console.error("Specification error:", specError);
        // We don't rollback product here for now as it's complex with FormData
        return updatedOrCreated;
      }
    },

    onSuccess: () => {
      toast.success(editingProduct ? "Product updated" : "Product created");
      queryClient.invalidateQueries({ queryKey: ["adminProducts"] });
      onSuccess();
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to save product");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      toast.success("Product deleted");
      queryClient.invalidateQueries({ queryKey: ["adminProducts"] });
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to delete product");
    },
  });

  return { saveMutation, deleteMutation };
};
