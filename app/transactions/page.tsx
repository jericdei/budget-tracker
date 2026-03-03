import {
  getTransactions,
  getIncomeTransactions,
  getBudgetCategories,
  getCurrentPeriodLabel,
} from "@/lib/db/actions";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AddTransactionDialog } from "./add-transaction-dialog";
import { AddFundsDialog } from "@/components/add-funds-dialog";
import { TransactionRow } from "./transaction-row";
import { IncomeTransactionRow } from "@/components/income-transaction-row";
import { formatCurrency } from "@/lib/format";

export default async function TransactionsPage() {
  const [transactions, incomeTransactions, categories, periodLabel] = await Promise.all([
    getTransactions(),
    getIncomeTransactions(),
    getBudgetCategories(),
    getCurrentPeriodLabel(),
  ]);

  const totalSpent = transactions.reduce(
    (acc, t) => acc + Number(t.amount),
    0
  );
  const totalIncome = incomeTransactions.reduce(
    (acc, t) => acc + Number(t.amount),
    0
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl dark:text-slate-100">
            Transactions
          </h1>
          <p className="mt-1 text-sm text-muted-foreground sm:text-base">
            {periodLabel} — Log expenses to auto-deduct from budget
          </p>
        </div>
        <div className="flex gap-2">
          <AddTransactionDialog categories={categories} />
          <AddFundsDialog />
        </div>
      </div>

      <Card className="bg-white/80 dark:bg-slate-900/50">
        <CardHeader>
          <CardTitle>Funds added this period</CardTitle>
          <CardDescription>
            Total: +{formatCurrency(totalIncome)} — Income that increases your available funds.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {incomeTransactions.length === 0 ? (
            <p className="text-center text-muted-foreground py-6 text-sm">
              No funds added yet. Click &quot;Add funds&quot; when you receive income.
            </p>
          ) : (
            <div className="space-y-2">
              {incomeTransactions.map((txn) => (
                <IncomeTransactionRow
                  key={txn.id}
                  transaction={{
                    id: txn.id,
                    amount: Number(txn.amount),
                    date: txn.date,
                    description: txn.description,
                  }}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-white/80 dark:bg-slate-900/50">
        <CardHeader>
          <CardTitle>This Period&apos;s Spending</CardTitle>
          <CardDescription>
            Total: {formatCurrency(totalSpent)} — Each transaction deducts from
            its budget category automatically.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-300 py-12 text-center dark:border-slate-700">
              <p className="text-muted-foreground mb-4">
                No transactions this period. Add a transaction to track spending.
              </p>
              <AddTransactionDialog categories={categories} />
            </div>
          ) : (
            <div className="space-y-2">
              {transactions.map((txn) => (
                <TransactionRow
                  key={txn.id}
                  transaction={{
                    id: txn.id,
                    amount: Number(txn.amount),
                    date: txn.date,
                    description: txn.description,
                    categoryId: txn.categoryId,
                    categoryName: txn.categoryName,
                    categoryType: txn.categoryType,
                    imageData: txn.imageData,
                    imageType: txn.imageType,
                  }}
                  categories={categories}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
