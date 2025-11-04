import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Minus, Plus, Trash2, Package, Pencil } from "lucide-react";
import type { InventoryItem, Category } from "@/pages/Dashboard";

interface InventoryGridProps {
  items: InventoryItem[];
  categories: Category[];
  onUpdateItem: (id: string, updates: Partial<InventoryItem>) => void;
  onDeleteItem: (id: string) => void;
  onEditItem: (item: InventoryItem) => void; // Add onEditItem prop
  viewMode: "grid" | "list";
}

const InventoryGrid = ({ items, categories, onUpdateItem, onDeleteItem, onEditItem, viewMode }: InventoryGridProps) => {
  const getCategoryById = (id?: string) => categories.find(c => c.id === id);

  const handleQuantityChange = (item: InventoryItem, delta: number) => {
    const newQuantity = Math.max(0, item.quantity + delta);
    onUpdateItem(item.id, { quantity: newQuantity });
  };

  if (items.length === 0) {
    return (
      <div className="glass rounded-lg p-12 text-center">
        <Package className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Items Found</h3>
        <p className="text-muted-foreground">Start by adding your first inventory item</p>
      </div>
    );
  }

  if (viewMode === "list") {
    return (
      <div className="glass rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-border">
              <tr>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Item</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Category</th>
                <th className="text-center p-4 text-sm font-medium text-muted-foreground">Quantity</th>
                <th className="text-center p-4 text-sm font-medium text-muted-foreground">Min Threshold</th>
                <th className="text-center p-4 text-sm font-medium text-muted-foreground">Unit Price</th>
                <th className="text-center p-4 text-sm font-medium text-muted-foreground">Status</th>
                <th className="text-right p-4 text-sm font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => {
                const category = getCategoryById(item.categoryId);
                const isLowStock = item.quantity < item.minThreshold;

                return (
                  <tr key={item.id} className="border-b border-border/50 hover:bg-muted/50 transition-smooth">
                    <td className="p-4">
                      <div className="font-medium">{item.name}</div>
                    </td>
                    <td className="p-4">
                      {category && (
                        <Badge style={{ backgroundColor: category.color || "#00D9FF" }}>
                          {category.name}
                        </Badge>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleQuantityChange(item, -1)}
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                        <span className="font-semibold min-w-[2rem] text-center">{item.quantity}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleQuantityChange(item, 1)}
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>
                    </td>
                    <td className="p-4 text-center text-muted-foreground">{item.minThreshold}</td>
                    <td className="p-4 text-center font-medium">${item.price.toFixed(2)}</td>
                    <td className="p-4 text-center">
                      {isLowStock ? (
                        <Badge variant="destructive">Low Stock</Badge>
                      ) : (
                        <Badge variant="secondary">In Stock</Badge>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => onEditItem(item)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={() => onDeleteItem(item.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {items.map((item) => {
        const category = getCategoryById(item.categoryId);
        const isLowStock = item.quantity < item.minThreshold;

        return (
          <Card
            key={item.id}
            className="glass p-6 shadow-card hover:shadow-glow transition-smooth"
          >
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-1">{item.name}</h3>
                  {category && (
                    <Badge
                      style={{ backgroundColor: category.color || "#00D9FF" }}
                      className="text-xs"
                    >
                      {category.name}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 -mt-2 -mr-2"
                    onClick={() => onEditItem(item)}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 -mt-2 -mr-2 text-destructive hover:bg-destructive/10"
                    onClick={() => onDeleteItem(item.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Quantity Control */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Quantity</span>
                  <span className="font-medium">Min: {item.minThreshold}</span>
                </div>
                
                <div className="flex items-center justify-center gap-3 bg-muted rounded-lg p-3">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10"
                    onClick={() => handleQuantityChange(item, -1)}
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  
                  <div className="text-center">
                    <div className="text-3xl font-bold">{item.quantity}</div>
                    <div className="text-xs text-muted-foreground">pieces</div>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10"
                    onClick={() => handleQuantityChange(item, 1)}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Price */}
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Unit Price</span>
                <span className="font-semibold text-foreground">${item.price.toFixed(2)}</span>
              </div>

              {/* Status */}
              {isLowStock && (
                <div className="flex items-center gap-2 text-destructive text-sm">
                  <div className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
                  <span className="font-medium">Low Stock Alert</span>
                </div>
              )}
            </div>
          </Card>
        );
      })}
    </div>
  );
};

export default InventoryGrid;
