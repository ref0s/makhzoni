import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Plus, Trash2, Folder, Pencil } from "lucide-react";
import type { Category } from "@/pages/Dashboard";

interface CategoryManagerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: Category[];
  onAddCategory: (category: Category) => void;
  onRenameCategory: (id: string, name: string) => void;
  onDeleteCategory: (id: string) => void;
}

const PRESET_COLORS = [
  "#00D9FF", "#00FFA3", "#FF6B9D", "#FFD700", "#9B59B6", "#FF6347", "#1E90FF", "#32CD32"
];

const CategoryManager = ({
  open,
  onOpenChange,
  categories,
  onAddCategory,
  onRenameCategory,
  onDeleteCategory,
}: CategoryManagerProps) => {
  const [newCategoryName, setNewCategoryName] = useState("");
  const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0]);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedName = newCategoryName.trim();
    if (!trimmedName) {
      toast.error("Category name is required");
      return;
    }

    if (trimmedName.length > 80) {
      toast.error("Category name must be less than 80 characters");
      return;
    }

    // Check for duplicates (case-insensitive)
    const existingCategory = categories.find(
      c => c.name.toLowerCase() === trimmedName.toLowerCase()
    );

    if (existingCategory) {
      toast.error("Category already exists", {
        description: "Would you like to use the existing one?",
      });
      return;
    }

    const newCategory: Category = {
      id: Date.now().toString(),
      name: trimmedName,
      color: selectedColor,
    };

    onAddCategory(newCategory);
    setNewCategoryName("");
    setSelectedColor(PRESET_COLORS[0]);
  };

  const handleStartEdit = (category: Category) => {
    setEditingCategoryId(category.id);
    setEditingName(category.name);
  };

  const handleRename = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategoryId) return;

    const trimmedName = editingName.trim();
    if (!trimmedName) {
      toast.error("Category name is required");
      return;
    }

    if (trimmedName.length > 80) {
      toast.error("Category name must be less than 80 characters");
      return;
    }

    const existingCategory = categories.find(
      c => c.name.toLowerCase() === trimmedName.toLowerCase() && c.id !== editingCategoryId
    );

    if (existingCategory) {
      toast.error("Another category already uses that name");
      return;
    }

    onRenameCategory(editingCategoryId, trimmedName);
    setEditingCategoryId(null);
    setEditingName("");
  };

  useEffect(() => {
    if (!open) {
      setEditingCategoryId(null);
      setEditingName("");
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage Categories</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Add New Category */}
          <Card className="glass p-4 border-border/50">
            <form onSubmit={handleAddCategory} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="categoryName">New Category Name</Label>
                <Input
                  id="categoryName"
                  placeholder="e.g., Electronics"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="bg-input border-border"
                />
              </div>

              <div className="space-y-2">
                <Label>Color</Label>
                <div className="flex gap-2 flex-wrap">
                  {PRESET_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setSelectedColor(color)}
                      className={`w-10 h-10 rounded-lg transition-smooth ${
                        selectedColor === color ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : ""
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <Button type="submit" variant="hero" className="w-full">
                <Plus className="w-4 h-4" />
                Add Category
              </Button>
            </form>
          </Card>

          {/* Existing Categories */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground">Existing Categories</h3>
            {categories.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Folder className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No categories yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {categories.map((category) => (
                  <Card
                    key={category.id}
                    className="glass p-4 flex items-center justify-between hover:shadow-glow transition-smooth"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: category.color || "#00D9FF" }}
                    />
                    <span className="font-medium">{category.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleStartEdit(category)}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:bg-destructive/10"
                      onClick={() => onDeleteCategory(category.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {editingCategoryId && (
            <Card className="glass p-4 border-border/50 space-y-4">
              <div>
                <h4 className="text-sm font-medium mb-1">Rename Category</h4>
                <p className="text-xs text-muted-foreground">
                  Update the category name and save to apply the change.
                </p>
              </div>
              <form onSubmit={handleRename} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="renameCategory">New Category Name</Label>
                  <Input
                    id="renameCategory"
                    placeholder="e.g., Storage"
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    className="bg-input border-border"
                    autoFocus
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      setEditingCategoryId(null);
                      setEditingName("");
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" variant="hero">
                    Save
                  </Button>
                </div>
              </form>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CategoryManager;
