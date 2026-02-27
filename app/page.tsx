import Link from "next/link";
import {
  getTotalPeriodIncome,
  getSpendingByCategory,
  getTransactions,
} from "@/lib/db/actions";
import { getCurrentPeriodLabel } from "@/lib/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BudgetPieChart } from "@/components/budget-pie-chart";
import { BudgetBreakdownList } from "@/components/budget-breakdown-list";
import { formatCurrency } from "@/lib/format";
import { TransactionRow } from "@/app/transactions/transaction-row";
import { ArrowRight, AlertCircle } from "lucide-react";

export default async function DashboardPage() {
  const [periodIncome, spendingByCategory, recentTransactions] =
    await Promise.all([
      getTotalPeriodIncome(),
      getSpendingByCategory(),
      getTransactions(),
    ]);

  const totalAllocated = spendingByCategory.reduce(
    (acc, c) => acc + c.allocatedAmount,
    0
  );
  const totalSpent = spendingByCategory.reduce((acc, c) => acc + c.spent, 0);
  const overBudget = spendingByCategory.filter((c) => c.remaining < 0);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl dark:text-slate-100">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-muted-foreground sm:text-base">
          {getCurrentPeriodLabel()} — Bi-monthly budget overview
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
        <Card className="border-emerald-200/50 bg-white/80 dark:border-emerald-900/30 dark:bg-slate-900/50">
          <CardHeader className="pb-2">
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
        <Card className="border-slate-200/50 bg-white/80 dark:border-slate-800 dark:bg-slate-900/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Period Budget
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="min-w-0 break-words text-xl font-bold sm:text-2xl">{formatCurrency(totalAllocated)}</p>
          </CardContent>
        </Card>
        <Card className="border-slate-200/50 bg-white/80 dark:border-slate-800 dark:bg-slate-900/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Spent This Period
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="min-w-0 break-words text-xl font-bold sm:text-2xl">{formatCurrency(totalSpent)}</p>
          </CardContent>
        </Card>
      </div>

      {overBudget.length > 0 && (
        <Card className="border-amber-200/50 bg-amber-50/50 dark:border-amber-900/30 dark:bg-amber-950/20">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-amber-800 dark:text-amber-200">
              <AlertCircle className="size-4" />
              Over Budget
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {overBudget.map((cat) => (
                <Badge
                  key={cat.categoryId}
                  variant="secondary"
                  className="bg-amber-200/80 text-amber-900 dark:bg-amber-900/50 dark:text-amber-100"
                >
                  {cat.categoryName}: {formatCurrency(-cat.remaining)} over
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 lg:grid-cols-2 lg:gap-6">
        <Card className="bg-white/80 dark:bg-slate-900/50 lg:col-span-2">
          <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>Budget by Category</CardTitle>
            <Button variant="outline" size="sm" asChild>
              <Link href="/budget">
                View all
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {spendingByCategory.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No budget categories yet.{" "}
                <Link href="/budget" className="text-emerald-600 hover:underline">
                  Create your budget
                </Link>
              </p>
            ) : (
              <>
                {/* Mobile: Budget breakdown list */}
                <div className="sm:hidden">
                  <BudgetBreakdownList data={spendingByCategory} />
                </div>
                {/* Desktop: Pie chart */}
                <div className="hidden sm:block">
                  <BudgetPieChart data={spendingByCategory} />
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="bg-white/80 dark:bg-slate-900/50">
          <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>Recent Transactions</CardTitle>
            <Button variant="outline" size="sm" asChild>
              <Link href="/transactions">
                View all
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {recentTransactions.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No transactions yet.{" "}
                <Link
                  href="/transactions"
                  className="text-emerald-600 hover:underline"
                >
                  Add a transaction
                </Link>
              </p>
            ) : (
              <div className="space-y-2">
                {recentTransactions.slice(0, 5).map((txn) => (
                  <TransactionRow
                    key={txn.id}
                    transaction={{
                      id: txn.id,
                      amount: Number(txn.amount),
                      date: txn.date,
                      description: txn.description,
                      categoryName: txn.categoryName,
                      categoryType: txn.categoryType,
                      imageData: txn.imageData,
                      imageType: txn.imageType,
                    }}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
