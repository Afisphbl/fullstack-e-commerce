import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form } from "@/components/ui/form";
import { Save } from "lucide-react";
import { Product, Category } from "@/lib/api";
import { useProductForm } from "./hooks/useProductForm";
import { useProductMutations } from "./hooks/useProductMutations";
import { ProductFormGeneralTab } from "./ProductFormGeneralTab";
import { ProductFormInventoryTab } from "./ProductFormInventoryTab";
import { ProductFormMediaTab } from "./ProductFormMediaTab";
import { ProductFormSpecsTab } from "./ProductFormSpecsTab";

interface ProductFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingProduct: Product | null;
  categories: Category[] | undefined;
  onSuccess: () => void;
}

export const ProductFormDialog = ({
  open,
  onOpenChange,
  editingProduct,
  categories,
  onSuccess,
}: ProductFormDialogProps) => {
  const { form, specGroups, appendGroup, removeGroup } = useProductForm(editingProduct);
  const { saveMutation } = useProductMutations(editingProduct, () => {
    onSuccess();
    onOpenChange(false);
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0 gap-0 border-none bg-background">
        <DialogHeader className="p-6 border-b">
          <DialogTitle className="text-xl font-display">
            {editingProduct ? "Edit Product" : "Create New Product"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((v) => saveMutation.mutate(v))}
            className="space-y-0"
          >
            <Tabs defaultValue="general" className="w-full">
              <div className="px-6 border-b bg-muted/30">
                <TabsList className="h-12 bg-transparent gap-6">
                  <TabsTrigger
                    value="general"
                    className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-12"
                  >
                    General Info
                  </TabsTrigger>
                  <TabsTrigger
                    value="inventory"
                    className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-12"
                  >
                    Pricing & Stock
                  </TabsTrigger>
                  <TabsTrigger
                    value="media"
                    className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-12"
                  >
                    Media
                  </TabsTrigger>
                  <TabsTrigger
                    value="specs"
                    className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-12"
                  >
                    Specifications
                  </TabsTrigger>
                </TabsList>
              </div>

              <div className="p-6">
                <TabsContent value="general" className="mt-0">
                  <ProductFormGeneralTab
                    control={form.control}
                    categories={categories}
                  />
                </TabsContent>

                <TabsContent value="inventory" className="mt-0">
                  <ProductFormInventoryTab control={form.control} />
                </TabsContent>

                <TabsContent value="media" className="mt-0">
                  <ProductFormMediaTab control={form.control} />
                </TabsContent>

                <TabsContent value="specs" className="mt-0">
                  <ProductFormSpecsTab
                    control={form.control}
                    register={form.register}
                    specGroups={specGroups}
                    appendGroup={appendGroup}
                    removeGroup={removeGroup}
                  />
                </TabsContent>
              </div>
            </Tabs>

            <div className="p-6 border-t flex justify-end gap-3 bg-muted/10">
              <Button
                type="button"
                variant="ghost"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={saveMutation.isPending}
                className="gap-2 px-8"
              >
                <Save className="h-4 w-4" />
                {saveMutation.isPending
                  ? "Saving..."
                  : editingProduct
                  ? "Update Product"
                  : "Create Product"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
