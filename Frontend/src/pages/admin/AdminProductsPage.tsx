import React, { useEffect, useState } from "react";
import { fetchProducts, Product } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Search } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const AdminProductsPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);

  useEffect(() => {
    fetchProducts().then(setProducts);
  }, []);

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()),
  );

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const data = new FormData(form);
    if (editing) {
      setProducts((prev) =>
        prev.map((p) =>
          p.id === editing.id
            ? {
                ...p,
                name: data.get("name") as string,
                price: Number(data.get("price")),
                stock: Number(data.get("stock")),
                description: data.get("description") as string,
              }
            : p,
        ),
      );
      toast({ title: "Product updated!" });
    } else {
      const newProduct: Product = {
        id: String(Date.now()),
        name: data.get("name") as string,
        slug: (data.get("name") as string).toLowerCase().replace(/\s+/g, "-"),
        price: Number(data.get("price")),
        originalPrice: null,
        category: data.get("category") as string,
        brand: data.get("brand") as string,
        image:
          "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600",
        images: [
          "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600",
        ],
        description: data.get("description") as string,
        specs: {},
        stock: Number(data.get("stock")),
        featured: false,
        isNew: true,
        tags: [],
      };
      setProducts((prev) => [newProduct, ...prev]);
      toast({ title: "Product created!" });
    }
    setDialogOpen(false);
    setEditing(null);
  };

  const handleDelete = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    toast({ title: "Product deleted", variant: "destructive" });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-display font-bold text-foreground">
          Products
        </h1>
        <Dialog
          open={dialogOpen}
          onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) setEditing(null);
          }}
        >
          <DialogTrigger asChild>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-2" /> Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card max-w-lg">
            <DialogHeader>
              <DialogTitle className="font-display text-foreground">
                {editing ? "Edit" : "Add"} Product
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <Label className="text-foreground">Name</Label>
                <Input
                  name="name"
                  defaultValue={editing?.name}
                  required
                  className="bg-background"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-foreground">Price</Label>
                  <Input
                    name="price"
                    type="number"
                    step="0.01"
                    defaultValue={editing?.price}
                    required
                    className="bg-background"
                  />
                </div>
                <div>
                  <Label className="text-foreground">Stock</Label>
                  <Input
                    name="stock"
                    type="number"
                    defaultValue={editing?.stock}
                    required
                    className="bg-background"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-foreground">Category</Label>
                  <Input
                    name="category"
                    defaultValue={editing?.category}
                    required
                    className="bg-background"
                  />
                </div>
                <div>
                  <Label className="text-foreground">Brand</Label>
                  <Input
                    name="brand"
                    defaultValue={editing?.brand}
                    required
                    className="bg-background"
                  />
                </div>
              </div>
              <div>
                <Label className="text-foreground">Description</Label>
                <Textarea
                  name="description"
                  defaultValue={editing?.description}
                  rows={3}
                  className="bg-background"
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {editing ? "Update" : "Create"} Product
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative mb-4">
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
              <th className="text-left p-3 text-sm font-medium text-muted-foreground">
                Product
              </th>
              <th className="text-left p-3 text-sm font-medium text-muted-foreground">
                Price
              </th>
              <th className="text-left p-3 text-sm font-medium text-muted-foreground">
                Stock
              </th>
              <th className="text-left p-3 text-sm font-medium text-muted-foreground">
                Category
              </th>
              <th className="text-right p-3 text-sm font-medium text-muted-foreground">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr
                key={p.id}
                className="border-t border-border hover:bg-muted/50"
              >
                <td className="p-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={p.image}
                      alt={p.name}
                      className="w-10 h-10 rounded object-cover"
                    />
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {p.name}
                      </p>
                      <p className="text-xs text-muted-foreground">{p.brand}</p>
                    </div>
                  </div>
                </td>
                <td className="p-3 text-sm font-medium text-foreground">
                  ${p.price}
                </td>
                <td className="p-3">
                  <Badge
                    className={
                      p.stock > 20
                        ? "bg-success/10 text-success border-success/30 border"
                        : "bg-warning/10 text-warning border-warning/30 border"
                    }
                  >
                    {p.stock}
                  </Badge>
                </td>
                <td className="p-3 text-sm text-muted-foreground capitalize">
                  {p.category}
                </td>
                <td className="p-3 text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setEditing(p);
                      setDialogOpen(true);
                    }}
                    className="text-muted-foreground hover:text-primary"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(p.id)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminProductsPage;
