import { getIncomeSources, getTotalMonthlyIncome } from "@/lib/db/actions";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AddIncomeSourceDialog } from "./add-income-dialog";
import { IncomeSourceRow } from "./income-source-row";
import { formatCurrency } from "@/lib/format";

export default async function IncomePage() {
  const [sources, totalMonthly] = await Promise.all([
    getIncomeSources(),
    getTotalMonthlyIncome(),
  ]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl dark:text-slate-100">
            Income Sources
          </h1>
          <p className="mt-1 text-sm text-muted-foreground sm:text-base">
            Configure your sources of funds
          </p>
        </div>
        <AddIncomeSourceDialog />
      </div>

      <Card className="border-emerald-200/50 bg-white/80 dark:border-emerald-900/30 dark:bg-slate-900/50">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total Monthly Income
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="min-w-0 break-words text-2xl font-bold text-emerald-700 sm:text-3xl dark:text-emerald-400">
            {formatCurrency(totalMonthly)}
          </p>
          <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
            Combined from all sources (normalized to monthly). Half applies to
            each budget period (1st–15th, 16th–30th).
          </p>
        </CardContent>
      </Card>

      <Card className="bg-white/80 dark:bg-slate-900/50">
        <CardHeader>
          <CardTitle>Sources</CardTitle>
          <CardDescription>
            Add salary, freelance income, investments, and other income streams
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sources.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-300 py-12 text-center dark:border-slate-700">
              <p className="text-muted-foreground mb-4">
                No income sources yet. Add your first source to get started.
              </p>
              <AddIncomeSourceDialog />
            </div>
          ) : (
            <div className="space-y-2">
              {sources.map((source) => (
                <IncomeSourceRow
                  key={source.id}
                  source={{
                    id: source.id,
                    name: source.name,
                    amount: Number(source.amount),
                    frequency: source.frequency,
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
