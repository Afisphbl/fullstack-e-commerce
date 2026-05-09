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

interface ProductFormValues {
  name: string;
  description: string;
  shortDescription?: string;
  price: number;
  discountPercent: number;
  stock: number;
  category: string;
  brand: string;
  imageCover: any;
  images?: any;
  tags?: string;
  status: "active" | "inactive" | "out_of_stock" | "archived";
  isFeatured: boolean;
  specGroups?: SpecGroup[];
}

export const useProductMutations = (
  editingProduct: Product | null,
  onSuccess: () => void
) => {
  const queryClient = useQueryClient();

  const saveMutation = useMutation({
    mutationFn: async (values: ProductFormValues) => {
      // 1. Prepare Product Payload
      const { specGroups, ...productData } = values;
      
      const formData = new FormData();
      
      // Append basic fields
      Object.entries(productData).forEach(([key, value]) => {
        if (key === 'imageCover') {
          if (value instanceof File) {
            formData.append('imageCover', value);
          } else if (typeof value === 'string') {
             // If it's a string (URL), we only send it if it's the existing one
             // Actually, the backend might expect it in req.body if not a file
             formData.append('imageCover', value);
          }
        } else if (key === 'images') {
           if (value instanceof FileList) {
             Array.from(value).forEach(file => formData.append('images', file));
           } else if (typeof value === 'string' && value) {
             // Split comma separated URLs back into an array for the backend
             value.split(",").map(s => s.trim()).filter(Boolean).forEach(img => formData.append('images', img));
           } else if (Array.isArray(value)) {
              value.forEach(img => formData.append('images', img));
           }

        } else if (key === 'tags') {
           formData.append('tags', values.tags || "");
        } else {
          formData.append(key, String(value));
        }
      });

      let updatedOrCreated;
      if (editingProduct) {
        updatedOrCreated = await updateProduct(editingProduct.id, formData);
      } else {
        updatedOrCreated = await createProduct(formData);
      }

      // 2. Handle Specifications
      try {
        if (specGroups && specGroups.length > 0) {
          if (editingProduct?.specification) {
            await updateSpecification(
              editingProduct.specification._id || editingProduct.specification.id,
              { details: specGroups }
            );
          } else {
            await createSpecification({
              product: updatedOrCreated.id,
              details: specGroups,
            });
          }
        } else if (editingProduct?.specification) {
          await deleteSpecification(
            editingProduct.specification._id || editingProduct.specification.id
          );
        }
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
