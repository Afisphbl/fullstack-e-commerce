import { useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Product, SpecGroup } from "@/lib/api";

const productSchema = z.object({
  name: z.string().min(2, "Name is required"),
  description: z.string().min(10, "Description is required"),
  shortDescription: z.string().optional(),
  price: z.coerce.number().min(0),
  discountPercent: z.coerce.number().min(0).max(100).default(0),
  stock: z.coerce.number().min(0),
  category: z.string().min(1, "Category is required"),
  brand: z.string().min(1, "Brand is required"),
  imageCover: z.any().optional(),
  images: z.any().optional().refine((val) => {
    if (val instanceof FileList) return val.length <= 5;
    if (typeof val === 'string') return val.split(',').filter(Boolean).length <= 5;
    if (Array.isArray(val)) return val.length <= 5;
    return true;
  }, "Maximum 5 gallery images allowed"),


  tags: z.string().optional(),
  status: z.enum(["active", "inactive", "out_of_stock", "archived"]),
  isFeatured: z.boolean().default(false),
  specGroups: z
    .array(
      z.object({
        group: z.string().min(1, "Group name is required"),
        specs: z.array(
          z.object({
            name: z.string().min(1, "Spec name is required"),
            value: z.string().min(1, "Value is required"),
          })
        ),
      })
    )
    .optional(),
});

export type ProductFormValues = z.infer<typeof productSchema>;

export const useProductForm = (editingProduct: Product | null) => {
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      description: "",
      shortDescription: "",
      price: 0,
      discountPercent: 0,
      stock: 0,
      category: "",
      brand: "",
      imageCover: "",
      images: "",
      tags: "",
      status: "active",
      isFeatured: false,
      specGroups: [],
    },
  });

  const { fields: specGroups, append: appendGroup, remove: removeGroup } = useFieldArray({
    control: form.control,
    name: "specGroups",
  });

  useEffect(() => {
    if (editingProduct) {
      const groups: SpecGroup[] = editingProduct.specification?.details || [];

      form.reset({
        name: editingProduct.name,
        description: editingProduct.description,
        shortDescription: editingProduct.shortDescription || "",
        price: editingProduct.price,
        discountPercent: editingProduct.discountPercent || 0,
        stock: editingProduct.stock,
        category:
          typeof editingProduct.category === "object"
            ? (editingProduct.category as { _id?: string; id: string })._id ||
              (editingProduct.category as { id: string }).id
            : editingProduct.category,
        brand: editingProduct.brand,
        imageCover: editingProduct.imageCover || "",
        images: editingProduct.images?.join(", ") || "",
        tags: editingProduct.tags?.join(", ") || "",
        status: (editingProduct as { status?: string }).status || "active",
        isFeatured: editingProduct.isFeatured || false,
        specGroups: groups,
      });
    } else {
      form.reset({
        name: "",
        description: "",
        shortDescription: "",
        price: 0,
        discountPercent: 0,
        stock: 0,
        category: "",
        brand: "",
        imageCover: "",
        images: "",
        tags: "",
        status: "active",
        isFeatured: false,
        specGroups: [],
      });
    }
  }, [editingProduct, form]);

  return {
    form,
    specGroups,
    appendGroup,
    removeGroup,
  };
};
