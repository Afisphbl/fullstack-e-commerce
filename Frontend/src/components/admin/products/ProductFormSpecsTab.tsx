import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, X } from "lucide-react";
import { Control, UseFormRegister, FieldArrayWithId } from "react-hook-form";
import { ProductFormValues } from "./hooks/useProductForm";
import { ProductSpecificationFields } from "./ProductSpecificationFields";

interface ProductFormSpecsTabProps {
  control: Control<ProductFormValues>;
  register: UseFormRegister<ProductFormValues>;
  specGroups: FieldArrayWithId<ProductFormValues, "specGroups", "id">[];
  appendGroup: (value: { group: string; specs: { name: string; value: string }[] }) => void;
  removeGroup: (index: number) => void;
}

export const ProductFormSpecsTab = ({
  control,
  register,
  specGroups,
  appendGroup,
  removeGroup,
}: ProductFormSpecsTabProps) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Label>Product Specifications</Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() =>
            appendGroup({ group: "New Group", specs: [{ name: "", value: "" }] })
          }
          className="gap-2"
        >
          <Plus className="h-4 w-4" /> Add Group
        </Button>
      </div>

      <div className="space-y-6">
        {specGroups.map((group, groupIndex) => (
          <div
            key={group.id}
            className="border rounded-lg p-4 bg-muted/10 relative"
          >
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => removeGroup(groupIndex)}
              className="absolute right-2 top-2 h-6 w-6 text-muted-foreground hover:text-destructive"
            >
              <X className="h-4 w-4" />
            </Button>

            <div className="mb-4 pr-8">
              <Input
                placeholder="Group Name (e.g. Performance, Display)"
                {...register(`specGroups.${groupIndex}.group`)}
                className="font-bold border-none bg-transparent h-8 px-0 focus-visible:ring-0"
              />
            </div>

            <div className="space-y-2">
              <ProductSpecificationFields
                control={control}
                groupIndex={groupIndex}
                register={register}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
