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
import { Badge } from "@/components/ui/badge";
import { Loader2, Pencil, Trash2 } from "lucide-react";
import { deleteTransaction } from "@/lib/db/actions";
import { formatCurrency } from "@/lib/format";
import { EditTransactionDialog } from "@/app/transactions/edit-transaction-dialog";
import type { BudgetCategory } from "@/lib/db/schema";

export function TransactionRow({
  transaction,
  categories,
}: {
  transaction: {
    id: string;
    amount: number;
    date: Date | string;
    description: string | null;
    categoryId: string;
    categoryName: string;
    categoryType: string;
    imageData: string | null;
    imageType: string | null;
  };
  categories?: BudgetCategory[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showDelete, setShowDelete] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showImage, setShowImage] = useState(false);

  const imageSrc =
    transaction.imageData && transaction.imageType
      ? `data:${transaction.imageType};base64,${transaction.imageData}`
      : null;

  function handleDelete() {
    startTransition(async () => {
      await deleteTransaction(transaction.id);
      setShowDelete(false);
      router.refresh();
    });
  }

  return (
    <>
      <div className="flex flex-col gap-2 rounded-lg border border-slate-200 px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-4 dark:border-slate-800">
        <div className="flex min-w-0 flex-1 gap-3">
          {imageSrc ? (
            <button
              type="button"
              onClick={() => setShowImage(true)}
              className="h-12 w-12 shrink-0 overflow-hidden rounded-lg border hover:opacity-90"
            >
              <img
                src={imageSrc}
                alt="Receipt"
                className="h-full w-full object-cover"
              />
            </button>
          ) : null}
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
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span className="font-semibold text-red-600 dark:text-red-400">
            -{formatCurrency(transaction.amount)}
          </span>
          {categories && categories.length > 0 && (
            <Button
              variant="ghost"
              size="icon"
              className="shrink-0"
              onClick={() => setShowEdit(true)}
              aria-label="Edit transaction"
            >
              <Pencil className="size-4" />
            </Button>
          )}
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

      {categories && categories.length > 0 && (
        <EditTransactionDialog
          transaction={{
            id: transaction.id,
            amount: transaction.amount,
            date: transaction.date,
            description: transaction.description,
            categoryId: transaction.categoryId,
            imageData: transaction.imageData,
            imageType: transaction.imageType,
          }}
          categories={categories}
          open={showEdit}
          onOpenChange={setShowEdit}
        />
      )}

      {showImage && imageSrc && (
        <Dialog open={showImage} onOpenChange={setShowImage}>
          <DialogContent className="max-w-[95vw] sm:max-w-lg">
            <DialogTitle className="sr-only">Receipt image</DialogTitle>
            <img
              src={imageSrc}
              alt="Receipt"
              className="w-full rounded-lg object-contain"
            />
          </DialogContent>
        </Dialog>
      )}

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
