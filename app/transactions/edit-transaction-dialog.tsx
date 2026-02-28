"use client";

import { useEffect, useRef, useState, useTransition } from "react";
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
import { ImagePlus, Loader2, X } from "lucide-react";
import { updateTransaction } from "@/lib/db/actions";
import { compressImage } from "@/lib/utils";
import type { BudgetCategory } from "@/lib/db/schema";

export function EditTransactionDialog({
  transaction,
  categories,
  open,
  onOpenChange,
}: {
  transaction: {
    id: string;
    amount: number;
    date: Date | string;
    description: string | null;
    categoryId: string;
    imageData: string | null;
    imageType: string | null;
  };
  categories: BudgetCategory[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dateStr =
    typeof transaction.date === "string"
      ? transaction.date.split("T")[0]
      : new Date(transaction.date).toISOString().split("T")[0];
  const [amount, setAmount] = useState(transaction.amount.toString());
  const [budgetCategoryId, setBudgetCategoryId] = useState(
    transaction.categoryId || ""
  );
  const [date, setDate] = useState(dateStr);
  const [description, setDescription] = useState(
    transaction.description ?? ""
  );
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const existingImageSrc =
    transaction.imageData && transaction.imageType
      ? `data:${transaction.imageType};base64,${transaction.imageData}`
      : null;

  useEffect(() => {
    if (open) {
      const d =
        typeof transaction.date === "string"
          ? transaction.date.split("T")[0]
          : new Date(transaction.date).toISOString().split("T")[0];
      setAmount(transaction.amount.toString());
      setBudgetCategoryId(transaction.categoryId || "");
      setDate(d);
      setDescription(transaction.description ?? "");
      setImageFile(null);
      setImagePreview(null);
    }
  }, [open, transaction.id, transaction.amount, transaction.date, transaction.description, transaction.categoryId]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0 || !budgetCategoryId) return;

    startTransition(async () => {
      let imageData: string | undefined;
      let imageType: string | undefined;

      if (imageFile) {
        try {
          const { data, type } = await compressImage(imageFile);
          imageData = data;
          imageType = type;
        } catch {
          // Skip image on error
        }
      }

      await updateTransaction(transaction.id, {
        amount,
        budgetCategoryId,
        date,
        description: description.trim(),
        ...(imageFile
          ? { imageData: imageData ?? null, imageType: imageType ?? null }
          : {}),
      });
      onOpenChange(false);
      router.refresh();
    });
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file?.type.startsWith("image/")) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
    e.target.value = "";
  }

  function clearImage() {
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImageFile(null);
    setImagePreview(null);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit Transaction</DialogTitle>
            <DialogDescription>
              Update the transaction details. Changes will update the budget
              category deductions.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-amount">Amount</Label>
              <Input
                id="edit-amount"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-category">Budget Category</Label>
              <Select
                value={budgetCategoryId}
                onValueChange={setBudgetCategoryId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name} ({cat.type})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-date">Date</Label>
              <Input
                id="edit-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-description">Description (optional)</Label>
              <Input
                id="edit-description"
                placeholder="e.g. Grocery run"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-image">Receipt/photo (optional)</Label>
              <input
                ref={fileInputRef}
                id="edit-image"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />
              {imagePreview ? (
                <div className="relative inline-block">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="h-24 w-24 rounded-lg border object-cover"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute -right-2 -top-2 h-6 w-6"
                    onClick={clearImage}
                  >
                    <X className="size-3" />
                  </Button>
                </div>
              ) : existingImageSrc ? (
                <div className="relative inline-block">
                  <img
                    src={existingImageSrc}
                    alt="Current receipt"
                    className="h-24 w-24 rounded-lg border object-cover"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <ImagePlus className="size-4" />
                    Replace image
                  </Button>
                </div>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-fit"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <ImagePlus className="size-4" />
                  Attach image
                </Button>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                isPending ||
                !amount ||
                !budgetCategoryId ||
                categories.length === 0
              }
            >
              {isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
