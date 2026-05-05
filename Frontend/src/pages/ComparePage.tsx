import React from "react";
import { useCompare } from "@/contexts/CompareContext";
import { Button } from "@/components/ui/button";
import { X, GitCompare } from "lucide-react";
import { Link } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";

const ComparePage = () => {
  const { compareList, removeFromCompare, clearCompare } = useCompare();
  const { addToCart } = useCart();

  if (compareList.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <GitCompare className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h1 className="text-2xl font-display font-bold text-foreground mb-2">
          No Products to Compare
        </h1>
        <p className="text-muted-foreground mb-6">
          Add products to compare their features side by side.
        </p>
        <Button asChild className="bg-primary text-primary-foreground">
          <Link to="/shop">Browse Products</Link>
        </Button>
      </div>
    );
  }

  const allSpecKeys = [
    ...new Set(compareList.flatMap((p) => Object.keys(p.specs))),
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-display font-bold text-foreground">
          Compare Products
        </h1>
        <Button
          variant="outline"
          onClick={clearCompare}
          className="text-destructive border-destructive/30"
        >
          Clear All
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[600px]">
          <thead>
            <tr>
              <th className="text-left p-4 text-muted-foreground font-medium text-sm">
                Feature
              </th>
              {compareList.map((p) => (
                <th key={p.id} className="p-4 text-center min-w-[200px]">
                  <button
                    onClick={() => removeFromCompare(p.id)}
                    aria-label={`Remove ${p.name} from compare`}
                    className="absolute top-2 right-2 text-muted-foreground hover:text-destructive"
                  >
                    <X className="h-4 w-4" />
                  </button>
                  <Link to={`/product/${p.slug}`}>
                    <img
                      src={p.image}
                      alt={p.name}
                      className="w-32 h-32 object-cover rounded-lg mx-auto mb-3"
                    />
                    <p className="font-semibold text-foreground text-sm">
                      {p.name}
                    </p>
                  </Link>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr className="border-t border-border">
              <td className="p-4 text-sm text-muted-foreground">Price</td>
              {compareList.map((p) => (
                <td
                  key={p.id}
                  className="p-4 text-center font-display font-bold text-foreground"
                >
                  ${p.price}
                </td>
              ))}
            </tr>
            <tr className="border-t border-border">
              <td className="p-4 text-sm text-muted-foreground">Brand</td>
              {compareList.map((p) => (
                <td key={p.id} className="p-4 text-center text-foreground">
                  {p.brand}
                </td>
              ))}
            </tr>
            {allSpecKeys.map((key) => (
              <tr key={key} className="border-t border-border even:bg-card">
                <td className="p-4 text-sm text-muted-foreground">{key}</td>
                {compareList.map((p) => (
                  <td
                    key={p.id}
                    className="p-4 text-center text-sm text-foreground"
                  >
                    {p.specs[key] || "—"}
                  </td>
                ))}
              </tr>
            ))}
            <tr className="border-t border-border">
              <td className="p-4" />
              {compareList.map((p) => (
                <td key={p.id} className="p-4 text-center">
                  <Button
                    onClick={() => addToCart(p)}
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    Add to Cart
                  </Button>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ComparePage;
