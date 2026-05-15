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
import { cn } from "@/lib/utils";
import { Product, Category } from "@/lib/api";
import { useProductForm } from "./hooks/useProductForm";
import { useProductMutations } from "./hooks/useProductMutations";
import { ProductFormGeneralTab } from "./ProductFormGeneralTab";
import { ProductFormInventoryTab } from "./ProductFormInventoryTab";
import { ProductFormMediaTab } from "./ProductFormMediaTab";
import { ProductFormSpecsTab } from "./ProductFormSpecsTab";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation("admin");

  const STEPS = [
    { id: "general", label: t("generalInfo") },
    { id: "inventory", label: t("pricingStock") },
    { id: "media", label: t("media") },
    { id: "specs", label: t("specifications") },
  ] as const;

  const { form, specGroups, appendGroup, removeGroup } =
    useProductForm(editingProduct);
  const { saveMutation } = useProductMutations(editingProduct, () => {
    onSuccess();
    onOpenChange(false);
  });

  const [activeTab, setActiveTab] =
    useState<(typeof STEPS)[number]["id"]>("general");

  const currentStepIndex = STEPS.findIndex((s) => s.id === activeTab);
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === STEPS.length - 1;

  const handleNext = () => {
    const nextStepId = STEPS[currentStepIndex + 1]?.id;
    if (nextStepId) {
      setActiveTab(nextStepId);
    }
  };

  const handleBack = () => {
    const prevStepId = STEPS[currentStepIndex - 1]?.id;
    if (prevStepId) {
      setActiveTab(prevStepId);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0 gap-0 border-none bg-background">
        <DialogHeader className="p-6 border-b">
          <DialogTitle className="text-xl font-display">
            {editingProduct ? t("editProduct") : t("createProduct")}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((v) => saveMutation.mutate(v))}
            className="space-y-0"
          >
            <Tabs
              value={activeTab}
              onValueChange={(v) =>
                setActiveTab(v as (typeof STEPS)[number]["id"])
              }
              className="w-full"
            >
              <div className="px-6 border-b bg-muted/30">
                {/* Desktop Tabs */}
                <TabsList className="hidden md:flex h-12 bg-transparent gap-6">
                  {STEPS.map((step) => (
                    <TabsTrigger
                      key={step.id}
                      value={step.id}
                      className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-12"
                    >
                      {step.label}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {/* Mobile Section Selector */}
                <div className="md:hidden py-3">
                  <Select
                    value={activeTab}
                    onValueChange={(v) =>
                      setActiveTab(v as (typeof STEPS)[number]["id"])
                    }
                  >
                    <SelectTrigger className="w-full h-11 bg-background">
                      <SelectValue placeholder={t("selectSection")} />
                    </SelectTrigger>
                    <SelectContent>
                      {STEPS.map((step) => (
                        <SelectItem key={step.id} value={step.id}>
                          {step.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
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

            <div className="p-4 sm:p-6 border-t flex flex-col-reverse sm:flex-row justify-between gap-3 bg-muted/10">
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  className="hidden sm:flex"
                >
                  {t("cancel")}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBack}
                  disabled={isFirstStep}
                  className="flex sm:hidden flex-1"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  {t("back")}
                </Button>
                {!isLastStep && (
                  <Button
                    type="button"
                    onClick={handleNext}
                    className="flex sm:hidden flex-1"
                  >
                    {t("next")}
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                )}
              </div>

              <div className="flex gap-2 w-full sm:w-auto">
                <Button
                  type="submit"
                  disabled={saveMutation.isPending}
                  className={cn(
                    "gap-2 w-full sm:w-auto transition-all",
                    !isLastStep && "sm:opacity-100"
                  )}
                >
                  <Save className="h-4 w-4" />
                  {saveMutation.isPending
                    ? t("saving")
                    : isLastStep
                      ? editingProduct
                        ? t("updateProduct")
                        : t("createProduct")
                      : t("saveProgress")}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
