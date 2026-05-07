import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Control } from "react-hook-form";
import { ProductFormValues } from "./hooks/useProductForm";

interface ProductFormMediaTabProps {
  control: Control<ProductFormValues>;
}

export const ProductFormMediaTab = ({ control }: ProductFormMediaTabProps) => {
  return (
    <div className="space-y-6">
      <FormField
        control={control}
        name="imageCover"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Cover Image URL</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="images"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Gallery Images (Comma separated URLs)</FormLabel>
            <FormControl>
              <Textarea rows={3} {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};
