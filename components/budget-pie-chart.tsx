"use client";

import { Pie, PieChart, Cell } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { formatCurrency } from "@/lib/format";

const CHART_COLORS = [
  "oklch(0.65 0.22 25)",   // coral
  "oklch(0.6 0.18 145)",   // teal
  "oklch(0.55 0.2 265)",   // violet
  "oklch(0.75 0.18 85)",   // amber
  "oklch(0.6 0.22 15)",    // red
  "oklch(0.55 0.15 250)",  // indigo
  "oklch(0.7 0.15 160)",   // emerald
  "oklch(0.65 0.2 330)",   // rose
  "oklch(0.6 0.2 200)",    // cyan
  "oklch(0.7 0.14 100)",   // lime
  "oklch(0.5 0.2 300)",    // purple
  "oklch(0.65 0.15 50)",   // orange
];

type CategorySpending = {
  categoryId: string;
  categoryName: string;
  categoryType: string;
  allocatedAmount: number;
  spent: number;
  remaining: number;
};

export function BudgetPieChart({
  data,
}: {
  data: CategorySpending[];
}) {
  const chartData = data
    .filter((d) => d.allocatedAmount > 0)
    .map((d, i) => ({
      name: d.categoryName,
      value: d.allocatedAmount,
      fill: CHART_COLORS[i % CHART_COLORS.length],
    }));

  const chartConfig = data.reduce(
    (acc, d, i) => {
      acc[d.categoryName] = {
        label: d.categoryName,
        color: CHART_COLORS[i % CHART_COLORS.length],
      };
      return acc;
    },
    {} as Record<string, { label: string; color: string }>
  );

  if (chartData.length === 0) {
    return null;
  }

  return (
    <ChartContainer
      config={chartConfig as ChartConfig}
      className="w-full aspect-square min-h-[240px] sm:min-h-[320px]"
    >
      <PieChart>
        <ChartTooltip
          content={
            <ChartTooltipContent
              formatter={(value, _name, item) => (
                <div className="flex w-full flex-wrap items-center gap-2">
                  <div
                    className="h-2.5 w-2.5 shrink-0 rounded-[2px]"
                    style={{
                      backgroundColor: item?.color ?? item?.payload?.fill,
                    }}
                  />
                  <div className="flex flex-1 justify-between leading-none items-center">
                    <span className="text-muted-foreground">
                      {item?.name ?? item?.payload?.name}
                    </span>
                    <span className="font-mono font-medium tabular-nums">
                      {formatCurrency(Number(value))}
                    </span>
                  </div>
                </div>
              )}
            />
          }
        />
        <ChartLegend
          content={
            <ChartLegendContent
              nameKey="name"
              className="flex-wrap justify-center gap-x-4 gap-y-2"
            />
          }
        />
        <Pie
          data={chartData}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          strokeWidth={1}
          paddingAngle={2}
        >
          {chartData.map((entry, index) => (
            <Cell key={entry.name} fill={entry.fill} />
          ))}
        </Pie>
      </PieChart>
    </ChartContainer>
  );
}
