import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/format";
import { BUDGET_TYPE_LABELS } from "@/lib/constants";

type CategorySpending = {
  categoryId: string;
  categoryName: string;
  categoryType: string;
  allocatedAmount: number;
  spent: number;
  remaining: number;
};

export function BudgetBreakdownList({
  data,
}: {
  data: CategorySpending[];
}) {
  const filtered = data.filter((d) => d.allocatedAmount > 0);

  if (filtered.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      {filtered.map((cat) => {
        const pct = Math.min(
          100,
          (cat.spent / cat.allocatedAmount) * 100
        );
        return (
          <div
            key={cat.categoryId}
            className="flex flex-col gap-1 rounded-lg border border-slate-200 px-3 py-2 dark:border-slate-800"
          >
            <div className="flex flex-wrap items-center gap-2">
              <p className="truncate font-medium">{cat.categoryName}</p>
              <Badge variant="secondary" className="shrink-0 text-xs">
                {BUDGET_TYPE_LABELS[cat.categoryType]}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <div className="min-w-0 flex-1">
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className={`h-full rounded-full transition-all ${
                      cat.remaining < 0 ? "bg-amber-500" : "bg-emerald-500"
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
              <span
                className={`shrink-0 text-xs font-medium ${
                  cat.remaining < 0
                    ? "text-amber-600 dark:text-amber-400"
                    : ""
                }`}
              >
                {formatCurrency(cat.spent)} /{" "}
                {formatCurrency(cat.allocatedAmount)}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
