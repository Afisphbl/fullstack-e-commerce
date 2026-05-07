import React, { useEffect, useState } from "react";
import { 
  fetchProducts, 
  Product, 
  Category, 
  fetchCategories, 
  createProduct, 
  updateProduct, 
  deleteProduct,
  createSpecification,
  updateSpecification,
  deleteSpecification,
  SpecGroup
} from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Search, X, GripVertical, Save } from "lucide-react";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";

const productSchema = z.object({
  name: z.string().min(2, "Name is required"),
  description: z.string().min(10, "Description is required"),
  shortDescription: z.string().optional(),
  price: z.coerce.number().min(0),
  discountPercent: z.coerce.number().min(0).max(100).default(0),
  stock: z.coerce.number().min(0),
  category: z.string().min(1, "Category is required"),
  brand: z.string().min(1, "Brand is required"),
  imageCover: z.string().url("Must be a valid URL"),
  images: z.string().optional(), // Comma separated for now
  tags: z.string().optional(), // Comma separated
  status: z.enum(["active", "inactive", "out_of_stock", "archived"]),
  isFeatured: z.boolean().default(false),
  // Specification groups
  specGroups: z.array(z.object({
    group: z.string().min(1, "Group name is required"),
    specs: z.array(z.object({
      name: z.string().min(1, "Spec name is required"),
      value: z.string().min(1, "Value is required")
    }))
  })).optional()
});

type ProductFormValues = z.infer<typeof productSchema>;

const AdminProductsPage = () => {
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  const queryClient = useQueryClient();

  const { data: productsData, isLoading: productsLoading } = useQuery({
    queryKey: ["adminProducts"],
    queryFn: () => fetchProducts({ limit: 100 })
  });

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories
  });

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
      specGroups: []
    }
  });

  const { fields: specGroups, append: appendGroup, remove: removeGroup } = useFieldArray({
    control: form.control,
    name: "specGroups"
  });

  useEffect(() => {
    if (editingProduct) {
      // Map flat specs back to groups if possible, or just load existing specification
      const groups: SpecGroup[] = editingProduct.specification?.details || [];
      
      form.reset({
        name: editingProduct.name,
        description: editingProduct.description,
        shortDescription: editingProduct.shortDescription || "",
        price: editingProduct.price,
        discountPercent: editingProduct.discountPercent || 0,
        stock: editingProduct.stock,
        category: typeof editingProduct.category === 'object' ? (editingProduct.category as any)._id || (editingProduct.category as any).id : editingProduct.category,
        brand: editingProduct.brand,
        imageCover: editingProduct.imageCover || "",
        images: editingProduct.images?.join(", ") || "",
        tags: editingProduct.tags?.join(", ") || "",
        status: (editingProduct as any).status || "active",
        isFeatured: editingProduct.isFeatured || false,
        specGroups: groups
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
        specGroups: []
      });
    }
  }, [editingProduct, form]);

  const saveMutation = useMutation({
    mutationFn: async (values: ProductFormValues) => {
      // 1. Prepare Product Payload (Strip specGroups)
      const { specGroups, ...productData } = values;
      const payload = {
        ...productData,
        images: values.images ? values.images.split(",").map(s => s.trim()) : [],
        tags: values.tags ? values.tags.split(",").map(s => s.trim()) : [],
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
          category: typeof editingProduct.category === 'object' ? (editingProduct.category as any)._id || (editingProduct.category as any).id : editingProduct.category,
          brand: editingProduct.brand,
          imageCover: editingProduct.imageCover,
          images: editingProduct.images,
          tags: editingProduct.tags,
          status: (editingProduct as any).status || "active",
          isFeatured: editingProduct.isFeatured
        };

        const updated = await updateProduct(editingProduct.id, payload);
        
        try {
          if (specGroups && specGroups.length > 0) {
            if (editingProduct.specification) {
              await updateSpecification(editingProduct.specification._id || editingProduct.specification.id, { details: specGroups });
            } else {
              await createSpecification({ product: editingProduct.id, details: specGroups });
            }
          } else if (editingProduct.specification) {
            // specGroups empty, but spec exists -> delete it
            await deleteSpecification(editingProduct.specification._id || editingProduct.specification.id);
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
            await createSpecification({ product: created.id, details: specGroups });
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
      setDialogOpen(false);
      setEditingProduct(null);
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to save product");
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      toast.success("Product deleted");
      queryClient.invalidateQueries({ queryKey: ["adminProducts"] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to delete product");
    }
  });

  const filtered = productsData?.products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  ) || [];
  

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold text-foreground">
          Products ({productsData?.total || 0})
        </h1>
        <Button 
          onClick={() => {
            setEditingProduct(null);
            setDialogOpen(true);
          }}
          className="bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="h-4 w-4 mr-2" /> Add Product
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 bg-card"
        />
      </div>

      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted">
            <tr>
              <th className="text-left p-4 text-sm font-medium text-muted-foreground">Product</th>
              <th className="text-left p-4 text-sm font-medium text-muted-foreground">Price</th>
              <th className="text-left p-4 text-sm font-medium text-muted-foreground">Stock</th>
              <th className="text-left p-4 text-sm font-medium text-muted-foreground">Category</th>
              <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
              <th className="text-right p-4 text-sm font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {productsLoading ? (
              <tr><td colSpan={6}><LoadingSpinner label="Loading products..." /></td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">No products found.</td></tr>
            ) : (
              filtered.map((p) => (
                <tr key={p.id} className="hover:bg-muted/50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={p.imageCover || p.image}
                        alt={p.name}
                        className="w-10 h-10 rounded-lg object-cover bg-muted"
                      />
                      <div>
                        <p className="text-sm font-semibold text-foreground">{p.name}</p>
                        <p className="text-xs text-muted-foreground">{p.brand}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="text-sm font-medium text-foreground">${p.price}</div>
                    {p.originalPrice && p.originalPrice !== p.price && (
                      <div className="text-xs text-muted-foreground line-through">${p.originalPrice}</div>
                    )}
                  </td>
                  <td className="p-4">
                    <Badge variant={p.stock > 10 ? "secondary" : "destructive"} className="font-mono">
                      {p.stock}
                    </Badge>
                  </td>
                  <td className="p-4 text-sm text-muted-foreground capitalize">
                    {typeof p.category === 'object' ? p.category.name : p.category}
                  </td>
                  <td className="p-4">
                    <Badge variant="outline" className="capitalize">{(p as any).status || "active"}</Badge>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setEditingProduct(p);
                          setDialogOpen(true);
                        }}
                        className="h-8 w-8 text-muted-foreground hover:text-primary"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          if (confirm("Are you sure you want to delete this product?")) {
                            deleteMutation.mutate(p.id);
                          }
                        }}
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0 gap-0 border-none bg-background">
          <DialogHeader className="p-6 border-b">
            <DialogTitle className="text-xl font-display">
              {editingProduct ? "Edit Product" : "Create New Product"}
            </DialogTitle>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit((v) => saveMutation.mutate(v))} className="space-y-0">
              <Tabs defaultValue="general" className="w-full">
                <div className="px-6 border-b bg-muted/30">
                  <TabsList className="h-12 bg-transparent gap-6">
                    <TabsTrigger value="general" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-12">General Info</TabsTrigger>
                    <TabsTrigger value="inventory" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-12">Pricing & Stock</TabsTrigger>
                    <TabsTrigger value="media" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-12">Media</TabsTrigger>
                    <TabsTrigger value="specs" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-12">Specifications</TabsTrigger>
                  </TabsList>
                </div>

                <div className="p-6">
                  <TabsContent value="general" className="mt-0 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Product Name</FormLabel>
                            <FormControl><Input {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="brand"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Brand</FormLabel>
                            <FormControl><Input {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="category"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Category</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {categories?.map(c => (
                                  <SelectItem key={c.id} value={c._id || c.id}>{c.name}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="status"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Status</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger><SelectValue /></SelectTrigger>
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
                    </div>

                    <FormField
                      control={form.control}
                      name="shortDescription"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Short Description</FormLabel>
                          <FormControl><Input {...field} /></FormControl>
                          <FormDescription>Brief summary for list views.</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Description</FormLabel>
                          <FormControl><Textarea rows={5} {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                      <div className="space-y-0.5">
                        <Label>Featured Product</Label>
                        <p className="text-xs text-muted-foreground">Show this product in featured sections.</p>
                      </div>
                      <FormField
                        control={form.control}
                        name="isFeatured"
                        render={({ field }) => (
                          <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                        )}
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="inventory" className="mt-0 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <FormField
                        control={form.control}
                        name="price"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Regular Price ($)</FormLabel>
                            <FormControl><Input type="number" step="0.01" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="discountPercent"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Discount Percentage (%)</FormLabel>
                            <FormControl><Input type="number" min="0" max="100" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="stock"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Stock Quantity</FormLabel>
                            <FormControl><Input type="number" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="media" className="mt-0 space-y-6">
                    <FormField
                      control={form.control}
                      name="imageCover"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cover Image URL</FormLabel>
                          <FormControl><Input {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="images"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Gallery Images (Comma separated URLs)</FormLabel>
                          <FormControl><Textarea rows={3} {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TabsContent>

                  <TabsContent value="specs" className="mt-0 space-y-6">
                    <div className="flex items-center justify-between">
                      <Label>Product Specifications</Label>
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm" 
                        onClick={() => appendGroup({ group: "New Group", specs: [{ name: "", value: "" }] })}
                        className="gap-2"
                      >
                        <Plus className="h-4 w-4" /> Add Group
                      </Button>
                    </div>

                    <div className="space-y-6">
                      {specGroups.map((group, groupIndex) => (
                        <div key={group.id} className="border rounded-lg p-4 bg-muted/10 relative">
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
                              {...form.register(`specGroups.${groupIndex}.group`)}
                              className="font-bold border-none bg-transparent h-8 px-0 focus-visible:ring-0"
                            />
                          </div>

                          <div className="space-y-2">
                             <SpecFields control={form.control} groupIndex={groupIndex} register={form.register} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                </div>
              </Tabs>

              <div className="p-6 border-t flex justify-end gap-3 bg-muted/10">
                <Button type="button" variant="ghost" onClick={() => setDialogOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={saveMutation.isPending} className="gap-2 px-8">
                  <Save className="h-4 w-4" />
                  {saveMutation.isPending ? "Saving..." : editingProduct ? "Update Product" : "Create Product"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const SpecFields = ({ control, groupIndex, register }: { control: any, groupIndex: number, register: any }) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: `specGroups.${groupIndex}.specs`
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

export default AdminProductsPage;
