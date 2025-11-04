import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  Plus,
  Search,
  LogOut,
  AlertTriangle,
  Grid3x3,
  List,
  BellRing,
  Package,
  Pencil,
} from "lucide-react";
import InventoryGrid from "@/components/inventory/InventoryGrid";
import AddItemDialog from "@/components/inventory/AddItemDialog";
import CategoryManager from "@/components/inventory/CategoryManager";
import EditItemDialog from "@/components/inventory/EditItemDialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import axios from "axios";

export interface Category {
  id: string;
  name: string;
  color?: string;
  icon?: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  minThreshold: number;
  price: number;
  categoryId?: string;
  categoryName?: string; // Added for display
  lastUpdated: string;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isCategoryManagerOpen, setIsCategoryManagerOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<InventoryItem | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [activeCategoryId, setActiveCategoryId] = useState<string>("all");
  const [activeStatusFilter, setActiveStatusFilter] = useState<
    "all" | "low-stock" | "in-stock"
  >("all");
  const [isLowStockDrawerOpen, setIsLowStockDrawerOpen] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [itemsResponse, categoriesResponse] = await Promise.all([
        axios.get("http://localhost:3000/items"),
        axios.get("http://localhost:3000/categories"),
      ]);
      setItems(itemsResponse.data);
      setCategories(categoriesResponse.data);
    } catch (error) {
      console.error("Failed to fetch data:", error);
      toast.error("Failed to load data. Please try again.");
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Effect to show low stock toasts
  useEffect(() => {
    const currentLowStockItems = items.filter(
      (item) => item.quantity < item.minThreshold
    );
    currentLowStockItems.forEach((item) => {
      // Only show toast if it's a new low stock item or quantity dropped further
      // (simple check, could be more sophisticated with previous state)
      if (!sessionStorage.getItem(`lowStockToast-${item.id}`)) {
        toast.warning(`Low stock alert: ${item.name} (${item.quantity} left)`, {
          id: `lowStockToast-${item.id}`,
          duration: 5000,
          action: {
            label: "View",
            onClick: () => {
              setActiveStatusFilter("low-stock");
              setIsLowStockDrawerOpen(true);
            },
          },
        });
        sessionStorage.setItem(`lowStockToast-${item.id}`, "true");
      }
    });

    // Clear toasts for items no longer low stock
    const prevLowStockItems = Object.keys(sessionStorage)
      .filter((key) => key.startsWith("lowStockToast-"))
      .map((key) => key.replace("lowStockToast-", ""));

    prevLowStockItems.forEach((itemId) => {
      if (!currentLowStockItems.some((item) => item.id === itemId)) {
        toast.dismiss(`lowStockToast-${itemId}`);
        sessionStorage.removeItem(`lowStockToast-${itemId}`);
      }
    });
  }, [items, setActiveStatusFilter]);

  const handleLogout = () => {
    sessionStorage.removeItem("admin"); // Clear admin info
    toast.success("Logged out successfully");
    navigate("/");
  };

  const lowStockItems = items.filter(
    (item) => item.quantity < item.minThreshold
  );

  const filteredItems = items.filter((item) => {
    const matchesSearch = item.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategory =
      activeCategoryId === "all" || item.categoryId === activeCategoryId;

    const isLowStock = item.quantity < item.minThreshold;
    const matchesStatus =
      activeStatusFilter === "all" ||
      (activeStatusFilter === "low-stock" && isLowStock) ||
      (activeStatusFilter === "in-stock" && !isLowStock);

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const activeCategory = categories.find(
    (category) => category.id === activeCategoryId
  );
  const lowStockForDisplay =
    activeCategoryId === "all"
      ? lowStockItems
      : lowStockItems.filter((item) => item.categoryId === activeCategoryId);

  const handleAddItem = async (
    newItem: Omit<InventoryItem, "id" | "lastUpdated">
  ) => {
    try {
      await axios.post("http://localhost:3000/items", newItem);
      toast.success(`${newItem.name} added successfully`);
      fetchData(); // Refetch data to update UI
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to add item.";
      toast.error(errorMessage);
    }
  };

  const handleUpdateItem = async (
    id: string,
    updates: Partial<InventoryItem>
  ) => {
    try {
      await axios.patch(`http://localhost:3000/items/${id}`, updates);
      toast.success("Item updated successfully");
      fetchData(); // Refetch data to update UI
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to update item.";
      toast.error(errorMessage);
    }
  };

  const handleDeleteItem = async (id: string) => {
    try {
      await axios.delete(`http://localhost:3000/items/${id}`);
      toast.success("Item deleted successfully");
      fetchData(); // Refetch data to update UI
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to delete item.";
      toast.error(errorMessage);
    }
  };

  const handleAddCategory = async (newCategory: Omit<Category, "id">) => {
    try {
      await axios.post("http://localhost:3000/categories", newCategory);
      toast.success(`Category "${newCategory.name}" added`);
      fetchData(); // Refetch data to update UI
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to add category.";
      toast.error(errorMessage);
    }
  };

  const handleRenameCategory = async (id: string, name: string) => {
    try {
      await axios.patch(`http://localhost:3000/categories/${id}`, { name });
      toast.success("Category updated successfully");
      fetchData(); // Refetch data to update UI
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to update category.";
      toast.error(errorMessage);
    }
  };

  const handleDeleteCategory = async (id: string, force: boolean = false) => {
    try {
      const url = force
        ? `http://localhost:3000/categories/${id}?force=true`
        : `http://localhost:3000/categories/${id}`;
      const response = await axios.delete(url);

      if (!response.data.success && response.data.dependentItems) {
        // Handle dependent items scenario
        toast.error(
          `Category has ${response.data.dependentItems.length} dependent items. Delete them first or force delete.`
        );
        // Optionally, you could open a confirmation dialog here
      } else {
        toast.success(`Category deleted`);
        fetchData(); // Refetch data to update UI
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to delete category.";
      toast.error(errorMessage);
    }
  };

  const handleEditItem = (item: InventoryItem) => {
    setItemToEdit(item);
    setIsEditDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <header className="glass border-b border-border/50 sticky top-0 z-10 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-primary flex items-center justify-center shadow-glow">
                <Package className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Makhzoni</h1>
                <p className="text-xs text-muted-foreground">
                  Inventory System
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={handleLogout}>
                <LogOut className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => setIsLowStockDrawerOpen(true)} className="relative">
                <BellRing className="w-4 h-4" />
                {lowStockItems.length > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-destructive"></span>
                  </span>
                )}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 space-y-6">
        {/* Low Stock Alert */}

        {/* Controls Bar */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="relative flex-1 max-w-md w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-input border-border"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Select value={activeCategoryId} onValueChange={setActiveCategoryId}>
              <SelectTrigger className="w-full sm:w-48 bg-input border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem value={category.id} key={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={activeStatusFilter} onValueChange={setActiveStatusFilter}>
              <SelectTrigger className="w-full sm:w-48 bg-input border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="low-stock">Low Stock</SelectItem>
                <SelectItem value="in-stock">In Stock</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="icon"
                className="h-8 w-8"
                onClick={() => setViewMode("grid")}
              >
                <Grid3x3 className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="icon"
                className="h-8 w-8"
                onClick={() => setViewMode("list")}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>

            <Button variant="glass" size="sm" onClick={() => setIsCategoryManagerOpen(true)}>
              Categories
            </Button>
            <Button variant="hero" onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="w-4 h-4" />
              Add Item
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="glass p-6 rounded-lg shadow-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Items</p>
                <p className="text-3xl font-bold mt-1">{items.length}</p>
              </div>
              <Package className="w-8 h-8 text-primary" />
            </div>
          </div>

          <div className="glass p-6 rounded-lg shadow-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Categories</p>
                <p className="text-3xl font-bold mt-1">{categories.length}</p>
              </div>
              <Grid3x3 className="w-8 h-8 text-secondary" />
            </div>
          </div>

          <div className="glass p-6 rounded-lg shadow-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Low Stock</p>
                <p className="text-3xl font-bold mt-1 text-destructive">
                  {lowStockItems.length}
                </p>
              </div>
              <AlertTriangle className="w-8 h-8 text-destructive" />
            </div>
          </div>
        </div>

        {/* Inventory Grid */}
        <InventoryGrid
          items={filteredItems}
          categories={categories}
          onUpdateItem={handleUpdateItem}
          onDeleteItem={handleDeleteItem}
          onEditItem={handleEditItem}
          viewMode={viewMode}
        />
      </main>

      {/* Dialogs */}
      <AddItemDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        categories={categories}
        onAddItem={handleAddItem}
      />

      <CategoryManager
        open={isCategoryManagerOpen}
        onOpenChange={setIsCategoryManagerOpen}
        categories={categories}
        onAddCategory={handleAddCategory}
        onRenameCategory={handleRenameCategory}
        onDeleteCategory={handleDeleteCategory}
      />

      <EditItemDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        item={itemToEdit}
        categories={categories}
        onUpdateItem={handleUpdateItem}
      />

      {/* Low Stock Drawer */}
      <Sheet open={isLowStockDrawerOpen} onOpenChange={setIsLowStockDrawerOpen}>
        <SheetContent side="left" className="glass w-80 sm:w-96">
          <SheetHeader>
            <SheetTitle>Low Stock Alerts</SheetTitle>
          </SheetHeader>
          <div className="py-4 space-y-3">
            {lowStockItems.length === 0 ? (
              <p className="text-muted-foreground">
                No items currently low in stock.
              </p>
            ) : (
              lowStockItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                >
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {item.quantity} left (Min: {item.minThreshold})
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      handleEditItem(item);
                      setIsLowStockDrawerOpen(false);
                    }}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default Dashboard;
