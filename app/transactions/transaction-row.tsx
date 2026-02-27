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
import { Badge } from "@/components/ui/badge";
import { Trash2 } from "lucide-react";
import { deleteTransaction } from "@/lib/db/actions";
import { formatCurrency } from "@/lib/format";

export function TransactionRow({
  transaction,
}: {
  transaction: {
    id: string;
    amount: number;
    date: Date | string;
    description: string | null;
    categoryName: string;
    categoryType: string;
  };
}) {
  const router = useRouter();
  const [showDelete, setShowDelete] = useState(false);

  async function handleDelete() {
    await deleteTransaction(transaction.id);
    setShowDelete(false);
    router.refresh();
  }

  return (
    <>
      <div className="flex flex-col gap-2 rounded-lg border border-slate-200 px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-4 dark:border-slate-800">
        <div className="min-w-0">
          <p className="truncate font-medium">
            {transaction.description || "Expense"}
          </p>
          <p className="text-xs text-muted-foreground sm:text-sm">
            {new Date(transaction.date).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}{" "}
            •{" "}
            <Badge variant="secondary" className="inline text-xs font-normal">
              {transaction.categoryName}
            </Badge>
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span className="font-semibold text-red-600 dark:text-red-400">
            -{formatCurrency(transaction.amount)}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="text-destructive hover:bg-destructive/10 hover:text-destructive shrink-0"
            onClick={() => setShowDelete(true)}
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      </div>

      <Dialog open={showDelete} onOpenChange={setShowDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete transaction</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this transaction of{" "}
              {formatCurrency(transaction.amount)}? The amount will be restored
              to the budget category.
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
