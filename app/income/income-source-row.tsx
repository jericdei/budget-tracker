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
import { deleteIncomeSource } from "@/lib/db/actions";
import { FREQUENCY_LABELS } from "@/lib/constants";
import { formatCurrency } from "@/lib/format";

export function IncomeSourceRow({
  source,
}: {
  source: { id: string; name: string; amount: number; frequency: string };
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showDelete, setShowDelete] = useState(false);

  function handleDelete() {
    startTransition(async () => {
      await deleteIncomeSource(source.id);
      setShowDelete(false);
      router.refresh();
    });
  }

  return (
    <>
      <div className="flex flex-col gap-1 rounded-lg border border-slate-200 px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-4 dark:border-slate-800">
        <div className="min-w-0">
          <p className="truncate font-medium">{source.name}</p>
          <p className="text-xs text-muted-foreground sm:text-sm">
            {formatCurrency(source.amount)} / {FREQUENCY_LABELS[source.frequency]}
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="shrink-0 self-end text-destructive hover:bg-destructive/10 hover:text-destructive sm:self-auto"
          onClick={() => setShowDelete(true)}
        >
          <Trash2 className="size-4" />
        </Button>
      </div>

      <Dialog open={showDelete} onOpenChange={setShowDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete income source</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{source.name}&quot;? This
              cannot be undone.
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
