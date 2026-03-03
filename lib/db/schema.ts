import {
  pgTable,
  text,
  uuid,
  decimal,
  timestamp,
  pgEnum,
} from "drizzle-orm/pg-core";

export const budgetCategoryTypeEnum = pgEnum("budget_category_type", [
  "expense",
  "savings",
  "insurance",
  "other",
]);

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

export const budgetPeriods = pgTable("budget_periods", {
  id: uuid("id").primaryKey().defaultRandom(),
  startedAt: timestamp("started_at").notNull().defaultNow(),
  funds: decimal("funds", { precision: 12, scale: 2 }).notNull().default("0"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const incomeTransactions = pgTable("income_transactions", {
  id: uuid("id").primaryKey().defaultRandom(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  date: timestamp("date").notNull(),
  description: text("description"),
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
  imageData: text("image_data"),
  imageType: text("image_type"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type BudgetCategory = typeof budgetCategories.$inferSelect;
export type NewBudgetCategory = typeof budgetCategories.$inferInsert;
export type Transaction = typeof transactions.$inferSelect;
export type NewTransaction = typeof transactions.$inferInsert;
