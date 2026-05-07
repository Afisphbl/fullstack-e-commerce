import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2 } from "lucide-react";
import { useFieldArray, Control, UseFormRegister } from "react-hook-form";
import { ProductFormValues } from "./hooks/useProductForm";

interface ProductSpecificationFieldsProps {
  control: Control<ProductFormValues>;
  groupIndex: number;
  register: UseFormRegister<ProductFormValues>;
}

export const ProductSpecificationFields = ({
  control,
  groupIndex,
  register,
}: ProductSpecificationFieldsProps) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: `specGroups.${groupIndex}.specs`,
  });

  return (
    <div className="space-y-3">
      {fields.map((spec, specIndex) => (
        <div key={spec.id} className="flex gap-2">
          <Input
            placeholder="Property Name"
            {...register(`specGroups.${groupIndex}.specs.${specIndex}.name`)}
            className="flex-1"
          />
          <Input
            placeholder="Value"
            {...register(`specGroups.${groupIndex}.specs.${specIndex}.value`)}
            className="flex-1"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => remove(specIndex)}
            disabled={fields.length === 1}
            className="h-10 w-10 text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => append({ name: "", value: "" })}
        className="text-xs text-primary h-8"
      >
        <Plus className="h-3 w-3 mr-1" /> Add Specification
      </Button>
    </div>
  );
};
