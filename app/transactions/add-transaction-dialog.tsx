"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { ImagePlus, Plus, X } from "lucide-react";
import { createTransaction } from "@/lib/db/actions";
import type { BudgetCategory } from "@/lib/db/schema";

function fileToBase64(file: File): Promise<{ data: string; type: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const [header, base64] = result.split(",");
      const type = header.match(/data:(image\/[^;]+)/)?.[1] ?? "image/jpeg";
      resolve({ data: base64 ?? "", type });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function AddTransactionDialog({
  categories,
}: {
  categories: BudgetCategory[];
}) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [budgetCategoryId, setBudgetCategoryId] = useState("");
  const [date, setDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (
      !amount ||
      parseFloat(amount) <= 0 ||
      !budgetCategoryId
    )
      return;

    let imageData: string | undefined;
    let imageType: string | undefined;

    if (imageFile) {
      try {
        const { data, type } = await fileToBase64(imageFile);
        if (data.length < 5_000_000) {
          imageData = data;
          imageType = type;
        }
      } catch {
        // Skip image on error
      }
    }

    await createTransaction({
      amount,
      budgetCategoryId,
      date,
      description: description.trim() || undefined,
      imageData,
      imageType,
    });
    setAmount("");
    setBudgetCategoryId("");
    setDate(new Date().toISOString().split("T")[0]);
    setDescription("");
    setImageFile(null);
    setImagePreview(null);
    setOpen(false);
    router.refresh();
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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="size-4" />
          Add Transaction
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add Transaction</DialogTitle>
            <DialogDescription>
              Log an expense. It will automatically deduct from the selected
              budget category.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="category">Budget Category</Label>
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
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Input
                id="description"
                placeholder="e.g. Grocery run"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="image">Receipt/photo (optional)</Label>
              <input
                ref={fileInputRef}
                id="image"
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
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!amount || !budgetCategoryId || categories.length === 0}
            >
              Add Transaction
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
