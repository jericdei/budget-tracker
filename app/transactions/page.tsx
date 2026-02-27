import { getTransactions, getBudgetCategories } from "@/lib/db/actions";
import { getCurrentPeriodLabel } from "@/lib/format";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AddTransactionDialog } from "./add-transaction-dialog";
import { TransactionRow } from "./transaction-row";
import { formatCurrency } from "@/lib/format";

export default async function TransactionsPage() {
  const [transactions, categories] = await Promise.all([
    getTransactions(),
    getBudgetCategories(),
  ]);

  const totalSpent = transactions.reduce(
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
            {getCurrentPeriodLabel()} — Log expenses to auto-deduct from budget
          </p>
        </div>
        <AddTransactionDialog categories={categories} />
      </div>

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
                    categoryName: txn.categoryName,
                    categoryType: txn.categoryType,
                  }}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
