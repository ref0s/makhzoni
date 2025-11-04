import { AlertTriangle } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { InventoryItem } from "@/pages/Dashboard";

interface LowStockAlertProps {
  items: InventoryItem[];
  categoryName?: string;
}

const LowStockAlert = ({ items, categoryName }: LowStockAlertProps) => {
  return (
    <Card className="glass border-destructive/50 bg-destructive/10 p-4">
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h3 className="font-semibold text-destructive mb-2">
            Low Stock Alert{categoryName ? ` – ${categoryName}` : ""}
          </h3>
          <p className="text-sm text-muted-foreground mb-3">
            {items.length} {items.length === 1 ? "item is" : "items are"} running low
            {categoryName ? ` in ${categoryName}` : ""} on stock
          </p>
          <div className="flex flex-wrap gap-2">
            {items.slice(0, 5).map((item) => (
              <div
                key={item.id}
                className="text-xs px-3 py-1.5 bg-card rounded-full border border-destructive/30"
              >
                <span className="font-medium">{item.name}</span>
                <span className="text-muted-foreground ml-2">
                  ({item.quantity}/{item.minThreshold})
                  {categoryName ? ` in ${categoryName}` : ""}
                </span>
              </div>
            ))}
            {items.length > 5 && (
              <div className="text-xs px-3 py-1.5 bg-muted rounded-full text-muted-foreground">
                +{items.length - 5} more
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default LowStockAlert;
