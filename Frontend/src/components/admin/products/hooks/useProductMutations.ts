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
  imageCover: string;
  images?: string;
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
      // 1. Prepare Product Payload (Strip specGroups)
      const { specGroups, ...productData } = values;
      const payload = {
        ...productData,
        images: values.images
          ? values.images.split(",").map((s) => s.trim())
          : [],
        tags: values.tags ? values.tags.split(",").map((s) => s.trim()) : [],
      };

      if (editingProduct) {
        // --- UPDATE FLOW ---
        // Capture original state for rollback if needed
        const originalProductData = {
          name: editingProduct.name,
          description: editingProduct.description,
          shortDescription: editingProduct.shortDescription,
          price: editingProduct.price,
          discountPercent: editingProduct.discountPercent,
          stock: editingProduct.stock,
          category:
            typeof editingProduct.category === "object"
              ? (editingProduct.category as { _id?: string; id: string })._id ||
                (editingProduct.category as { id: string }).id
              : editingProduct.category,
          brand: editingProduct.brand,
          imageCover: editingProduct.imageCover,
          images: editingProduct.images,
          tags: editingProduct.tags,
          status: (editingProduct as { status?: string }).status || "active",
          isFeatured: editingProduct.isFeatured,
        };

        const updated = await updateProduct(editingProduct.id, payload);

        try {
          if (specGroups && specGroups.length > 0) {
            if (editingProduct.specification) {
              await updateSpecification(
                editingProduct.specification._id ||
                  editingProduct.specification.id,
                { details: specGroups }
              );
            } else {
              await createSpecification({
                product: editingProduct.id,
                details: specGroups,
              });
            }
          } else if (editingProduct.specification) {
            // specGroups empty, but spec exists -> delete it
            await deleteSpecification(
              editingProduct.specification._id || editingProduct.specification.id
            );
          }
          return updated;
        } catch (specError) {
          // Rollback product update on specification failure
          await updateProduct(editingProduct.id, originalProductData);
          throw specError;
        }
      } else {
        // --- CREATE FLOW ---
        const created = await createProduct(payload);

        try {
          if (specGroups && specGroups.length > 0) {
            await createSpecification({
              product: created.id,
              details: specGroups,
            });
          }
          return created;
        } catch (specError) {
          // Rollback: Delete orphaned product on specification failure
          await deleteProduct(created.id);
          throw specError;
        }
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
