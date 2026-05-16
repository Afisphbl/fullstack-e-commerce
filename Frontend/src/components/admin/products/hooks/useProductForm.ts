import { useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Product, SpecGroup, ProductStatus } from "@/lib/api";

// Multilingual field schema
const multilingualSchema = z.object({
  am: z.string().min(1, "Amharic translation is required"),
  en: z.string().min(1, "English translation is required"),
  om: z.string().min(1, "Afaan Oromo translation is required"),
});

const multilingualOptionalSchema = z.object({
  am: z.string().optional(),
  en: z.string().optional(),
  om: z.string().optional(),
});

const productSchema = z.object({
  name: multilingualSchema,
  description: multilingualSchema,
  shortDescription: multilingualOptionalSchema,
  price: z.coerce.number().min(0),
  discountPercent: z.coerce.number().min(0).max(100).default(0),
  stock: z.coerce.number().min(0),
  category: z.string().min(1, "Category is required"),
  brand: z.string().min(1, "Brand is required"),
  imageCover: z.union([z.string(), z.instanceof(File)]).optional(),
  images: z
    .union([
      z.string(),
      z.instanceof(FileList),
      z.array(z.union([z.string(), z.instanceof(File)])),
    ])
    .optional()
    .refine((val) => {
      if (val instanceof FileList) return val.length <= 5;
      if (typeof val === "string")
        return val.split(",").filter(Boolean).length <= 5;
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
          }),
        ),
      }),
    )
    .optional(),
});

export type ProductFormValues = z.infer<typeof productSchema>;

export const useProductForm = (editingProduct: Product | null) => {
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: { am: "", en: "", om: "" },
      description: { am: "", en: "", om: "" },
      shortDescription: { am: "", en: "", om: "" },
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

  const {
    fields: specGroups,
    append: appendGroup,
    remove: removeGroup,
  } = useFieldArray({
    control: form.control,
    name: "specGroups",
  });

  useEffect(() => {
    if (editingProduct) {
      const groups: SpecGroup[] = editingProduct.specification?.details || [];

      // Helper to convert string or multilingual object to multilingual format
      const toMultilingual = (field: any) => {
        if (typeof field === "string") {
          // Legacy data - use same value for all languages
          return { am: field, en: field, om: field };
        }
        if (field && typeof field === "object" && "am" in field) {
          // Already multilingual
          return {
            am: field.am || "",
            en: field.en || "",
            om: field.om || "",
          };
        }
        // Empty/undefined
        return { am: "", en: "", om: "" };
      };

      // Helper to extract string from multilingual or string field
      const toString = (field: any): string => {
        if (typeof field === "string") {
          return field;
        }
        if (field && typeof field === "object") {
          // Prefer English, fallback to other languages
          return field.en || field.am || field.om || "";
        }
        return "";
      };

      // Convert specification groups - extract strings from multilingual fields
      const normalizedGroups = groups.map((group) => ({
        group: toString(group.group),
        specs: group.specs.map((spec) => ({
          name: toString(spec.name),
          value: spec.value,
        })),
      }));

      form.reset({
        name: toMultilingual(editingProduct.name),
        description: toMultilingual(editingProduct.description),
        shortDescription: toMultilingual(editingProduct.shortDescription),
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
        status: (editingProduct.status as ProductStatus) || "active",
        isFeatured: editingProduct.isFeatured || false,
        specGroups: normalizedGroups,
      });
    } else {
      form.reset({
        name: { am: "", en: "", om: "" },
        description: { am: "", en: "", om: "" },
        shortDescription: { am: "", en: "", om: "" },
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
