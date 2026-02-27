"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2 } from "lucide-react";
import { deleteBudgetCategory, updateBudgetCategory } from "@/lib/db/actions";
import { BUDGET_TYPE_LABELS } from "@/lib/constants";
import { formatCurrency } from "@/lib/format";

export function BudgetCategoryRow({
  category,
  spent,
  remaining,
}: {
  category: {
    id: string;
    name: string;
    type: string;
    allocatedAmount: number;
  };
  spent: number;
  remaining: number;
}) {
  const router = useRouter();
  const [showDelete, setShowDelete] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editName, setEditName] = useState(category.name);
  const [editType, setEditType] = useState(category.type);
  const [editAmount, setEditAmount] = useState(
    category.allocatedAmount.toString()
  );

  function openEdit() {
    setEditName(category.name);
    setEditType(category.type);
    setEditAmount(category.allocatedAmount.toString());
    setShowEdit(true);
  }

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editName.trim() || !editAmount || parseFloat(editAmount) < 0) return;
    await updateBudgetCategory(category.id, {
      name: editName.trim(),
      type: editType,
      allocatedAmount: editAmount,
    });
    setShowEdit(false);
    router.refresh();
  }

  async function handleDelete() {
    await deleteBudgetCategory(category.id);
    setShowDelete(false);
    router.refresh();
  }

  const pct = Math.min(100, (spent / category.allocatedAmount) * 100);

  return (
    <>
      <div className="flex flex-col gap-2 rounded-lg border border-slate-200 px-3 py-3 sm:flex-row sm:items-center sm:gap-4 sm:px-4 dark:border-slate-800">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="truncate font-medium sm:max-w-full">{category.name}</p>
            <Badge variant="secondary" className="shrink-0 text-xs">
              {BUDGET_TYPE_LABELS[category.type]}
            </Badge>
          </div>
          <div className="mt-2 flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-4">
            <div className="min-w-0 flex-1">
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className={`h-full rounded-full transition-all ${
                    remaining < 0 ? "bg-amber-500" : "bg-emerald-500"
                  }`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
            <span
              className={`shrink-0 text-xs font-medium sm:text-sm ${
                remaining < 0 ? "text-amber-600 dark:text-amber-400" : ""
              }`}
            >
              {formatCurrency(spent)} / {formatCurrency(category.allocatedAmount)}
            </span>
          </div>
        </div>
        <div className="flex shrink-0 gap-1 self-end sm:self-auto">
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-foreground"
            onClick={openEdit}
          >
            <Pencil className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={() => setShowDelete(true)}
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      </div>

      <Dialog open={showEdit} onOpenChange={setShowEdit}>
        <DialogContent>
          <form onSubmit={handleEdit}>
            <DialogHeader>
              <DialogTitle>Edit Budget Category</DialogTitle>
              <DialogDescription>
                Update the category name, type, or allocated amount.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">Name</Label>
                <Input
                  id="edit-name"
                  placeholder="e.g. Groceries, Rent"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-type">Type</Label>
                <Select value={editType} onValueChange={setEditType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(BUDGET_TYPE_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-amount">Amount per period</Label>
                <Input
                  id="edit-amount"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={editAmount}
                  onChange={(e) => setEditAmount(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowEdit(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!editName.trim() || !editAmount}
              >
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={showDelete} onOpenChange={setShowDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete budget category</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{category.name}&quot;? All
              transactions in this category will also be deleted.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDelete(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
