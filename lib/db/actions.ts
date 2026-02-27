"use server";

import { revalidatePath } from "next/cache";
import { eq, and, gte, lte, sql, sum } from "drizzle-orm";
import { db } from "./index";
import {
  incomeSources,
  budgetCategories,
  transactions,
  type NewIncomeSource,
  type NewBudgetCategory,
  type NewTransaction,
} from "./schema";

const FREQUENCY_TO_MONTHLY: Record<string, number> = {
  none: 0, // handled separately in getTotalPeriodIncome (full amount)
  weekly: 4.33,
  biweekly: 2.17,
  monthly: 1,
  yearly: 1 / 12,
};

function toMonthlyAmount(amount: number, frequency: string): number {
  return amount * (FREQUENCY_TO_MONTHLY[frequency] ?? 1);
}

export async function getIncomeSources() {
  return db.select().from(incomeSources).where(eq(incomeSources.isActive, 1));
}

export async function getTotalMonthlyIncome() {
  const sources = await getIncomeSources();
  return sources.reduce(
    (acc, s) => acc + toMonthlyAmount(Number(s.amount), s.frequency),
    0
  );
}

export async function createIncomeSource(data: {
  name: string;
  amount: string;
  frequency: string;
}) {
  await db.insert(incomeSources).values({
    name: data.name,
    amount: data.amount,
    frequency: data.frequency as NewIncomeSource["frequency"],
  });
  revalidatePath("/");
  revalidatePath("/income");
  revalidatePath("/budget");
}

export async function deleteIncomeSource(id: string) {
  await db.delete(incomeSources).where(eq(incomeSources.id, id));
  revalidatePath("/");
  revalidatePath("/income");
  revalidatePath("/budget");
}

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
    allocatedAmount: data.allocatedAmount,
  });
  revalidatePath("/");
  revalidatePath("/budget");
  revalidatePath("/transactions");
}

export async function updateBudgetCategory(
  id: string,
  data: { name?: string; type?: string; allocatedAmount?: string }
) {
  await db
    .update(budgetCategories)
    .set({
      ...(data.name && { name: data.name }),
      ...(data.type && { type: data.type as NewBudgetCategory["type"] }),
      ...(data.allocatedAmount && { allocatedAmount: data.allocatedAmount }),
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

/** Bi-monthly periods: 1st–15th and 16th–end of month */
function getPeriodBounds(date: Date) {
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

export async function getTotalPeriodIncome() {
  const sources = await getIncomeSources();
  let total = 0;
  for (const s of sources) {
    const amount = Number(s.amount);
    if (s.frequency === "none") {
      total += amount; // full amount, not split across periods
    } else {
      total += (amount * (FREQUENCY_TO_MONTHLY[s.frequency] ?? 1)) / 2;
    }
  }
  return total;
}

export async function getTransactions(periodDate?: Date) {
  const targetDate = periodDate ?? new Date();
  const { start, end } = getPeriodBounds(targetDate);

  const txns = await db
    .select({
      id: transactions.id,
      amount: transactions.amount,
      date: transactions.date,
      description: transactions.description,
      categoryId: transactions.budgetCategoryId,
      categoryName: budgetCategories.name,
      categoryType: budgetCategories.type,
    })
    .from(transactions)
    .innerJoin(
      budgetCategories,
      eq(transactions.budgetCategoryId, budgetCategories.id)
    )
    .where(and(gte(transactions.date, start), lte(transactions.date, end)))
    .orderBy(transactions.date);

  return txns;
}

export async function getSpendingByCategory(periodDate?: Date) {
  const targetDate = periodDate ?? new Date();
  const { start, end } = getPeriodBounds(targetDate);

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
    spentResult.map((r) => [r.categoryId, Number(r.spent ?? 0)])
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
}) {
  await db.insert(transactions).values({
    amount: data.amount,
    budgetCategoryId: data.budgetCategoryId,
    date: new Date(data.date),
    description: data.description ?? null,
  });
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
