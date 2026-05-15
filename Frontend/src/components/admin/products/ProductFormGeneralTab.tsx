import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { MultilingualInput } from "@/components/shared/MultilingualInput";
import { MultilingualTextarea } from "@/components/shared/MultilingualTextarea";
import { Category } from "@/lib/api";
import { Control } from "react-hook-form";
import { ProductFormValues } from "./hooks/useProductForm";

interface ProductFormGeneralTabProps {
  control: Control<ProductFormValues>;
  categories: Category[] | undefined;
}

export const ProductFormGeneralTab = ({
  control,
  categories,
}: ProductFormGeneralTabProps) => {
  return (
    <div className="space-y-6">
      {/* Multilingual Product Name */}
      <MultilingualInput
        name="name"
        label="Product Name"
        control={control}
        required
        placeholder="Enter product name"
      />

      {/* Brand (non-multilingual) */}
      <FormField
        control={control}
        name="brand"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Brand</FormLabel>
            <FormControl>
              <Input {...field} placeholder="e.g., Dell, Apple, Samsung" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Status */}
      <FormField
        control={control}
        name="status"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Status</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Multilingual Short Description */}
      <MultilingualInput
        name="shortDescription"
        label="Short Description"
        control={control}
        placeholder="Brief summary for list views"
      />

      {/* Multilingual Full Description */}
      <MultilingualTextarea
        name="description"
        label="Full Description"
        control={control}
        required
        rows={5}
        placeholder="Detailed product description"
      />

      {/* Featured Toggle */}
      <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
        <div className="space-y-0.5">
          <Label>Featured Product</Label>
          <p className="text-xs text-muted-foreground">
            Show this product in featured sections.
          </p>
        </div>
        <FormField
          control={control}
          name="isFeatured"
          render={({ field }) => (
            <FormControl>
              <Switch checked={field.value} onCheckedChange={field.onChange} />
            </FormControl>
          )}
        />
      </div>
    </div>
  );
};
