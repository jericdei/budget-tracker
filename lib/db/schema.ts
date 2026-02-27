import {
  pgTable,
  text,
  uuid,
  decimal,
  timestamp,
  integer,
  pgEnum,
} from "drizzle-orm/pg-core";

export const incomeFrequencyEnum = pgEnum("income_frequency", [
  "none",
  "weekly",
  "biweekly",
  "monthly",
  "yearly",
]);

export const budgetCategoryTypeEnum = pgEnum("budget_category_type", [
  "expense",
  "savings",
  "insurance",
  "other",
]);

export const incomeSources = pgTable("income_sources", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  frequency: incomeFrequencyEnum("frequency").notNull().default("monthly"),
  isActive: integer("is_active").notNull().default(1),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const budgetCategories = pgTable("budget_categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  type: budgetCategoryTypeEnum("type").notNull().default("expense"),
  allocatedAmount: decimal("allocated_amount", {
    precision: 12,
    scale: 2,
  }).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const transactions = pgTable("transactions", {
  id: uuid("id").primaryKey().defaultRandom(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  budgetCategoryId: uuid("budget_category_id")
    .notNull()
    .references(() => budgetCategories.id, { onDelete: "cascade" }),
  date: timestamp("date").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type IncomeSource = typeof incomeSources.$inferSelect;
export type NewIncomeSource = typeof incomeSources.$inferInsert;
export type BudgetCategory = typeof budgetCategories.$inferSelect;
export type NewBudgetCategory = typeof budgetCategories.$inferInsert;
export type Transaction = typeof transactions.$inferSelect;
export type NewTransaction = typeof transactions.$inferInsert;
