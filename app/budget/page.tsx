import {
  getBudgetCategories,
  getSpendingByCategory,
  getTotalPeriodIncome,
} from "@/lib/db/actions";
import { getCurrentPeriodLabel } from "@/lib/format";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AddBudgetCategoryDialog } from "./add-budget-dialog";
import { BudgetCategoryRow } from "./budget-category-row";
import { BUDGET_TYPE_LABELS } from "@/lib/constants";
import { formatCurrency } from "@/lib/format";

export default async function BudgetPage() {
  const [categories, spendingByCategory, periodIncome] = await Promise.all([
    getBudgetCategories(),
    getSpendingByCategory(),
    getTotalPeriodIncome(),
  ]);

  const spendingMap = new Map(
    spendingByCategory.map((s) => [s.categoryId, s])
  );

  const totalAllocated = categories.reduce(
    (acc, c) => acc + Number(c.allocatedAmount),
    0
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl dark:text-slate-100">
            Budget
          </h1>
          <p className="mt-1 text-sm text-muted-foreground sm:text-base">
            {getCurrentPeriodLabel()} — Allocate per period (1st–15th, 16th–30th)
          </p>
        </div>
        <AddBudgetCategoryDialog />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
        <Card className="border-emerald-200/50 bg-white/80 dark:border-emerald-900/30 dark:bg-slate-900/50">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Period Income
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="min-w-0 break-words text-xl font-bold text-emerald-700 sm:text-2xl dark:text-emerald-400">
              {formatCurrency(periodIncome)}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-white/80 dark:border-slate-200/50 dark:border-slate-800 dark:bg-slate-900/50">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Period Budget
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="min-w-0 break-words text-xl font-bold sm:text-2xl">
              {formatCurrency(totalAllocated)}
            </p>
            <p className="text-muted-foreground mt-1 text-sm">
              {totalAllocated > periodIncome
                ? `${formatCurrency(totalAllocated - periodIncome)} over income`
                : `${formatCurrency(periodIncome - totalAllocated)} remaining`}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white/80 dark:bg-slate-900/50">
        <CardHeader>
          <CardTitle>Budget Categories</CardTitle>
          <CardDescription>
            Plan spending per period (1st–15th or 16th–30th). Transactions
            automatically deduct from these categories.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {categories.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-300 py-12 text-center dark:border-slate-700">
              <p className="text-muted-foreground mb-4">
                No budget categories yet. Add your first category to build your
                budget.
              </p>
              <AddBudgetCategoryDialog />
            </div>
          ) : (
            <div className="space-y-2">
              {categories.map((cat) => {
                const spending = spendingMap.get(cat.id);
                return (
                  <BudgetCategoryRow
                    key={cat.id}
                    category={{
                      id: cat.id,
                      name: cat.name,
                      type: cat.type,
                      allocatedAmount: Number(cat.allocatedAmount),
                    }}
                    spent={spending?.spent ?? 0}
                    remaining={spending?.remaining ?? Number(cat.allocatedAmount)}
                  />
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
