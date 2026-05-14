import React, { useState, useRef } from "react";
import {
  fetchCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  Category,
} from "@/lib/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Edit, Trash2, Upload, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { usePageTitle } from "@/hooks/usePageTitle";

const CategorySkeleton = () => (
  <div className="bg-card rounded-lg border border-border p-4 flex items-center gap-4">
    <Skeleton className="w-16 h-16 rounded-lg" />
    <div className="flex-1 space-y-2">
      <Skeleton className="h-5 w-24" />
      <Skeleton className="h-4 w-16" />
    </div>
    <div className="flex gap-1">
      <Skeleton className="h-8 w-8 rounded-md" />
      <Skeleton className="h-8 w-8 rounded-md" />
    </div>
  </div>
);

const AdminCategoriesPage = () => {
  usePageTitle("Admin - Categories");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [categoryName, setCategoryName] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ["adminCategories"],
    queryFn: fetchCategories,
  });

  const createMutation = useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminCategories"] });
      toast.success("Category created successfully");
      handleCloseDialog();
    },
    onError: (error: Error) => {
      toast.error(error?.message || "Failed to create category");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: FormData }) =>
      updateCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminCategories"] });
      toast.success("Category updated successfully");
      handleCloseDialog();
    },
    onError: (error: Error) => {
      toast.error(error?.message || "Failed to update category");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminCategories"] });
      toast.success("Category deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(error?.message || "Failed to delete category");
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Please select an image file");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size must be less than 5MB");
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditing(null);
    setCategoryName("");
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleOpenEdit = (category: Category) => {
    setEditing(category);
    setCategoryName(category.name);
    setImagePreview(category.image);
    setDialogOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    if (!categoryName.trim()) {
      toast.error("Category name is required");
      return;
    }

    if (!editing && !imageFile) {
      toast.error("Category image is required");
      return;
    }

    const formData = new FormData();
    formData.append("name", categoryName.trim());

    if (imageFile) {
      formData.append("image", imageFile);
    }

    if (editing) {
      updateMutation.mutate({ id: editing.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      deleteMutation.mutate(id);
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-display font-bold text-foreground">
          Categories
        </h1>
        <Dialog
          open={dialogOpen}
          onOpenChange={(open) => {
            if (!open) handleCloseDialog();
            else setDialogOpen(open);
          }}
        >
          <DialogTrigger asChild>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-2" /> Add Category
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card max-w-md">
            <DialogHeader>
              <DialogTitle className="font-display text-foreground">
                {editing ? "Edit" : "Add"} Category
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <Label className="text-foreground">Name</Label>
                <Input
                  name="name"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  placeholder="Enter category name"
                  required
                  className="bg-background"
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <Label className="text-foreground">Image</Label>
                <div className="mt-2">
                  {imagePreview ? (
                    <div className="relative inline-block">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-32 h-32 object-cover rounded-lg border border-border"
                      />
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 hover:bg-destructive/90"
                        disabled={isSubmitting}
                        aria-label="Remove image"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <label
                      htmlFor="category-image-upload"
                      className="w-32 h-32 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors focus-within:ring-2 focus-within:ring-primary"
                    >
                      <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                      <span className="text-xs text-muted-foreground">
                        Upload Image
                      </span>
                    </label>
                  )}
                  <input
                    id="category-image-upload"
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="sr-only"
                    disabled={isSubmitting}
                    aria-label="Upload category image"
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    Max size: 5MB. Formats: JPG, PNG, WebP
                  </p>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-primary text-primary-foreground"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {editing ? "Updating..." : "Creating..."}
                  </>
                ) : editing ? (
                  "Update Category"
                ) : (
                  "Create Category"
                )}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => <CategorySkeleton key={i} />)
        ) : categories.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <p className="text-muted-foreground">
              No categories found. Create your first category!
            </p>
          </div>
        ) : (
          categories.map((cat) => (
            <div
              key={cat.id}
              className="bg-card rounded-lg border border-border p-4 flex items-center gap-4"
            >
              <img
                src={cat.image}
                alt={cat.name}
                className="w-16 h-16 rounded-lg object-cover"
              />
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">{cat.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {cat.count} products
                </p>
              </div>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleOpenEdit(cat)}
                  className="text-muted-foreground hover:text-primary"
                  disabled={deleteMutation.isPending}
                  aria-label={`Edit ${cat.name}`}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(cat.id, cat.name)}
                  className="text-muted-foreground hover:text-destructive"
                  disabled={deleteMutation.isPending}
                  aria-label={`Delete ${cat.name}`}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminCategoriesPage;
