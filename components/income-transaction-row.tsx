"use client";

import { useState, useTransition } from "react";
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
import { Loader2, Trash2 } from "lucide-react";
import { deleteIncomeTransaction } from "@/lib/db/actions";
import { formatCurrency, formatDateTime } from "@/lib/format";

export function IncomeTransactionRow({
  transaction,
}: {
  transaction: {
    id: string;
    amount: number;
    date: Date | string;
    description: string | null;
  };
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showDelete, setShowDelete] = useState(false);

  function handleDelete() {
    startTransition(async () => {
      await deleteIncomeTransaction(transaction.id);
      setShowDelete(false);
      router.refresh();
    });
  }

  return (
    <>
      <div className="flex flex-col gap-2 rounded-lg border border-slate-200 px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-4 dark:border-slate-800">
        <div className="min-w-0">
          <p className="truncate font-medium">
            {transaction.description || "Funds added"}
          </p>
          <p className="text-xs text-muted-foreground sm:text-sm">
            {formatDateTime(transaction.date)}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span className="font-semibold text-emerald-600 dark:text-emerald-400">
            +{formatCurrency(transaction.amount)}
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
            <DialogTitle>Delete income entry</DialogTitle>
            <DialogDescription>
              Remove this {formatCurrency(transaction.amount)} from your funds?
              This will reduce your available funds for this period.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDelete(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
