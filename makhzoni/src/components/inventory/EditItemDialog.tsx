import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import type { Category, InventoryItem } from "@/pages/Dashboard";

interface EditItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: InventoryItem | null;
  categories: Category[];
  onUpdateItem: (id: string, updates: Partial<InventoryItem>) => void;
}

const EditItemDialog = ({
  open,
  onOpenChange,
  item,
  categories,
  onUpdateItem,
}: EditItemDialogProps) => {
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [minThreshold, setMinThreshold] = useState("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [price, setPrice] = useState("");

  useEffect(() => {
    if (item) {
      setName(item.name);
      setQuantity(item.quantity.toString());
      setMinThreshold(item.minThreshold.toString());
      setCategoryId(item.categoryId || "");
      setPrice(item.price.toString());
    } else {
      // Reset form when dialog is closed or item is null
      setName("");
      setQuantity("");
      setMinThreshold("");
      setCategoryId("");
      setPrice("");
    }
  }, [item, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!item) return;

    // Validation
    const trimmedName = name.trim();
    if (!trimmedName || trimmedName.length === 0) {
      toast.error("Item name is required");
      return;
    }

    if (trimmedName.length > 100) {
      toast.error("Item name must be less than 100 characters");
      return;
    }

    const qty = parseInt(quantity, 10);
    const min = parseInt(minThreshold, 10);
    const parsedPrice = parseFloat(price);

    if (isNaN(qty) || qty < 0) {
      toast.error("Quantity must be a positive number");
      return;
    }

    if (isNaN(min) || min < 0) {
      toast.error("Minimum threshold must be a positive number");
      return;
    }

    if (isNaN(parsedPrice) || parsedPrice < 0) {
      toast.error("Price must be a positive number");
      return;
    }

    onUpdateItem(item.id, {
      name: trimmedName,
      quantity: qty,
      minThreshold: min,
      price: parsedPrice,
      categoryId: categoryId || undefined,
    });

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Item</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="itemName">Item Name *</Label>
            <Input
              id="itemName"
              placeholder="e.g., Laptop HP ProBook"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-input border-border"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity *</Label>
              <Input
                id="quantity"
                type="number"
                min="0"
                placeholder="10"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="bg-input border-border"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Unit Price *</Label>
              <Input
                id="price"
                type="number"
                min="0"
                step="0.01"
                placeholder="199.99"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="bg-input border-border"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="minThreshold">Min Threshold *</Label>
              <Input
                id="minThreshold"
                type="number"
                min="0"
                placeholder="5"
                value={minThreshold}
                onChange={(e) => setMinThreshold(e.target.value)}
                className="bg-input border-border"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category (Optional)</Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger className="bg-input border-border">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: category.color || "#00D9FF" }}
                      />
                      {category.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="hero">
              Save Changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditItemDialog;
