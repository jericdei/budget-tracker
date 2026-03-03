"use server";

import { revalidatePath } from "next/cache";
import { roundToTwoDecimals } from "@/lib/format";
import { eq, and, gte, lte, desc, sql, sum } from "drizzle-orm";
import { db } from "./index";
import {
  budgetCategories,
  budgetPeriods,
  incomeTransactions,
  transactions,
  type NewBudgetCategory,
  type NewTransaction,
} from "./schema";

export async function getBudgetCategories() {
  return db.select().from(budgetCategories).orderBy(budgetCategories.name);
}

export async function createBudgetCategory(data: {
  name: string;
  type: string;
  allocatedAmount: string;
}) {
  await db.insert(budgetCategories).values({
    name: data.name,
    type: data.type as NewBudgetCategory["type"],
    allocatedAmount: roundToTwoDecimals(data.allocatedAmount),
  });
  revalidatePath("/");
  revalidatePath("/budget");
  revalidatePath("/transactions");
}

export async function updateBudgetCategory(
  id: string,
  data: { name?: string; type?: string; allocatedAmount?: string },
) {
  await db
    .update(budgetCategories)
    .set({
      ...(data.name && { name: data.name }),
      ...(data.type && { type: data.type as NewBudgetCategory["type"] }),
      ...(data.allocatedAmount && {
        allocatedAmount: roundToTwoDecimals(data.allocatedAmount),
      }),
    })
    .where(eq(budgetCategories.id, id));
  revalidatePath("/");
  revalidatePath("/budget");
  revalidatePath("/transactions");
}

export async function deleteBudgetCategory(id: string) {
  await db.delete(budgetCategories).where(eq(budgetCategories.id, id));
  revalidatePath("/");
  revalidatePath("/budget");
  revalidatePath("/transactions");
}

/** Bi-monthly periods: 1st–15th and 16th–end of month (used when no manual period set) */
function getDefaultPeriodBounds(date: Date) {
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();

  let start: Date;
  let end: Date;

  if (day <= 15) {
    start = new Date(year, month, 1);
    end = new Date(year, month, 15, 23, 59, 59);
  } else {
    start = new Date(year, month, 16);
    end = new Date(year, month + 1, 0, 23, 59, 59); // last day of month
  }

  return { start, end };
}

export async function getPeriodStart(): Promise<Date | null> {
  const [latest] = await db
    .select({ startedAt: budgetPeriods.startedAt })
    .from(budgetPeriods)
    .orderBy(desc(budgetPeriods.startedAt))
    .limit(1);
  return latest ? new Date(latest.startedAt) : null;
}

export async function startNewPeriod(startedAt: Date) {
  await db.insert(budgetPeriods).values({
    startedAt,
  });
  revalidatePath("/");
  revalidatePath("/budget");
  revalidatePath("/transactions");
}

export type PeriodBounds = { start: Date; end: Date };

export async function getCurrentPeriodLabel(): Promise<string> {
  const manualStart = await getPeriodStart();
  const end = new Date();
  if (manualStart) {
    const startStr = manualStart.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
    const endStr = end.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
    return `Since ${startStr} – ${endStr}`;
  }
  const day = end.getDate();
  const month = end.toLocaleString("en-US", { month: "short" });
  const year = end.getFullYear();
  const lastDay = new Date(year, end.getMonth() + 1, 0).getDate();
  const suffix = lastDay === 31 ? "st" : "th";
  return day <= 15
    ? `1st-15th ${month} ${year}`
    : `16th-${lastDay}${suffix} ${month} ${year}`;
}

export async function getPeriodBounds(
  date: Date = new Date(),
): Promise<PeriodBounds> {
  const manualStart = await getPeriodStart();
  if (manualStart) {
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);
    return { start: manualStart, end };
  }
  return getDefaultPeriodBounds(date);
}

export async function getTotalPeriodIncome() {
  const { start, end } = await getPeriodBounds();
  const incomeResult = await db
    .select({ total: sum(incomeTransactions.amount) })
    .from(incomeTransactions)
    .where(
      and(
        gte(incomeTransactions.date, start),
        lte(incomeTransactions.date, end)
      )
    );
  return Number(incomeResult[0]?.total ?? 0);
}

export async function getIncomeTransactions(periodDate?: Date) {
  const targetDate = periodDate ?? new Date();
  const { start, end } = await getPeriodBounds(targetDate);
  return db
    .select()
    .from(incomeTransactions)
    .where(
      and(
        gte(incomeTransactions.date, start),
        lte(incomeTransactions.date, end)
      )
    )
    .orderBy(incomeTransactions.date);
}

export async function createIncomeTransaction(data: {
  amount: string;
  date: string;
  description?: string;
}) {
  await db.insert(incomeTransactions).values({
    amount: roundToTwoDecimals(data.amount),
    date: new Date(data.date),
    description: data.description ?? null,
  });
  revalidatePath("/");
  revalidatePath("/budget");
  revalidatePath("/transactions");
}

export async function deleteIncomeTransaction(id: string) {
  await db.delete(incomeTransactions).where(eq(incomeTransactions.id, id));
  revalidatePath("/");
  revalidatePath("/budget");
  revalidatePath("/transactions");
}

export async function getTransactions(periodDate?: Date) {
  const targetDate = periodDate ?? new Date();
  const { start, end } = await getPeriodBounds(targetDate);

  const txns = await db
    .select({
      id: transactions.id,
      amount: transactions.amount,
      date: transactions.date,
      description: transactions.description,
      imageData: transactions.imageData,
      imageType: transactions.imageType,
      categoryId: transactions.budgetCategoryId,
      categoryName: budgetCategories.name,
      categoryType: budgetCategories.type,
    })
    .from(transactions)
    .innerJoin(
      budgetCategories,
      eq(transactions.budgetCategoryId, budgetCategories.id),
    )
    .where(and(gte(transactions.date, start), lte(transactions.date, end)))
    .orderBy(desc(transactions.date));

  return txns;
}

export async function getSpendingByCategory(periodDate?: Date) {
  const targetDate = periodDate ?? new Date();
  const { start, end } = await getPeriodBounds(targetDate);

  const categories = await db.select().from(budgetCategories);
  const spentResult = await db
    .select({
      categoryId: transactions.budgetCategoryId,
      spent: sum(transactions.amount),
    })
    .from(transactions)
    .where(and(gte(transactions.date, start), lte(transactions.date, end)))
    .groupBy(transactions.budgetCategoryId);

  const spentMap = new Map(
    spentResult.map((r) => [r.categoryId, Number(r.spent ?? 0)]),
  );

  return categories.map((cat) => {
    const spent = spentMap.get(cat.id) ?? 0;
    const allocated = Number(cat.allocatedAmount);
    return {
      categoryId: cat.id,
      categoryName: cat.name,
      categoryType: cat.type,
      allocatedAmount: allocated,
      spent,
      remaining: allocated - spent,
    };
  });
}

export async function createTransaction(data: {
  amount: string;
  budgetCategoryId: string;
  date: string;
  description?: string;
  imageData?: string;
  imageType?: string;
}) {
  await db.insert(transactions).values({
    amount: roundToTwoDecimals(data.amount),
    budgetCategoryId: data.budgetCategoryId,
    date: new Date(data.date),
    description: data.description ?? null,
    imageData: data.imageData ?? null,
    imageType: data.imageType ?? null,
  });
  revalidatePath("/");
  revalidatePath("/transactions");
  revalidatePath("/budget");
}

export async function updateTransaction(
  id: string,
  data: {
    amount?: string;
    budgetCategoryId?: string;
    date?: string;
    description?: string;
    imageData?: string | null;
    imageType?: string | null;
  },
) {
  await db
    .update(transactions)
    .set({
      ...(data.amount && { amount: roundToTwoDecimals(data.amount) }),
      ...(data.budgetCategoryId && {
        budgetCategoryId: data.budgetCategoryId,
      }),
      ...(data.date && { date: new Date(data.date) }),
      ...(data.description !== undefined && {
        description: data.description || null,
      }),
      ...(data.imageData !== undefined && { imageData: data.imageData }),
      ...(data.imageType !== undefined && { imageType: data.imageType }),
    })
    .where(eq(transactions.id, id));
  revalidatePath("/");
  revalidatePath("/transactions");
  revalidatePath("/budget");
}

export async function deleteTransaction(id: string) {
  await db.delete(transactions).where(eq(transactions.id, id));
  revalidatePath("/");
  revalidatePath("/transactions");
  revalidatePath("/budget");
}
