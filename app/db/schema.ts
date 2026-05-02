import {
  mysqlTable,
  mysqlEnum,
  serial,
  varchar,
  text,
  timestamp,
  decimal,
  int,
  bigint,
  date,
  index,
} from "drizzle-orm/mysql-core";

// ── Users (managed by auth system) ──────────────────────────────────────
export const users = mysqlTable("users", {
  id: serial("id").primaryKey(),
  unionId: varchar("unionId", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 320 }),
  avatar: text("avatar"),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
  lastSignInAt: timestamp("lastSignInAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ── Expenses ────────────────────────────────────────────────────────────
export const expenses = mysqlTable(
  "expenses",
  {
    id: serial("id").primaryKey(),
    userId: bigint("user_id", { mode: "number", unsigned: true })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
    currency: varchar("currency", { length: 3 }).notNull().default("USD"),
    category: varchar("category", { length: 50 }).notNull(),
    description: varchar("description", { length: 255 }),
    paymentMethod: varchar("payment_method", { length: 50 }),
    merchant: varchar("merchant", { length: 100 }),
    status: mysqlEnum("status", ["completed", "pending"])
      .notNull()
      .default("completed"),
    expenseDate: date("expense_date").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  },
  (table) => [
    index("idx_expenses_user_id").on(table.userId),
    index("idx_expenses_date").on(table.expenseDate),
    index("idx_expenses_category").on(table.category),
  ]
);

export type Expense = typeof expenses.$inferSelect;
export type InsertExpense = typeof expenses.$inferInsert;

// ── Budgets ─────────────────────────────────────────────────────────────
export const budgets = mysqlTable(
  "budgets",
  {
    id: serial("id").primaryKey(),
    userId: bigint("user_id", { mode: "number", unsigned: true })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    category: varchar("category", { length: 50 }).notNull(),
    amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
    period: mysqlEnum("period", ["monthly", "weekly", "yearly"])
      .notNull()
      .default("monthly"),
    startDate: date("start_date").notNull(),
    endDate: date("end_date"),
    alertThreshold: int("alert_threshold").notNull().default(80),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  },
  (table) => [index("idx_budgets_user_id").on(table.userId)]
);

export type Budget = typeof budgets.$inferSelect;
export type InsertBudget = typeof budgets.$inferInsert;

// ── Countries (Travel Safety) ───────────────────────────────────────────
export const countries = mysqlTable("countries", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  code: varchar("code", { length: 3 }).notNull().unique(),
  flag: varchar("flag", { length: 10 }),
  region: varchar("region", { length: 50 }),
  latitude: decimal("latitude", { precision: 10, scale: 6 }),
  longitude: decimal("longitude", { precision: 10, scale: 6 }),
  overallScore: int("overall_score").notNull().default(50),
  crimeRate: int("crime_rate").notNull().default(50),
  healthcareScore: int("healthcare_score").notNull().default(50),
  politicalStability: int("political_stability").notNull().default(50),
  naturalDisasterRisk: int("natural_disaster_risk").notNull().default(50),
  advisoryLevel: mysqlEnum("advisory_level", [
    "safe",
    "moderate",
    "high_risk",
    "critical",
  ])
    .notNull()
    .default("moderate"),
  travelAdvisory: text("travel_advisory"),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type Country = typeof countries.$inferSelect;
export type InsertCountry = typeof countries.$inferInsert;

// ── Safety Alerts ───────────────────────────────────────────────────────
export const safetyAlerts = mysqlTable(
  "safety_alerts",
  {
    id: serial("id").primaryKey(),
    countryId: bigint("country_id", { mode: "number", unsigned: true })
      .notNull()
      .references(() => countries.id, { onDelete: "cascade" }),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"),
    severity: mysqlEnum("severity", ["info", "warning", "critical"])
      .notNull()
      .default("info"),
    alertType: varchar("alert_type", { length: 50 }),
    effectiveDate: date("effective_date"),
    expiryDate: date("expiry_date"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("idx_alerts_country_id").on(table.countryId),
    index("idx_alerts_severity").on(table.severity),
  ]
);

export type SafetyAlert = typeof safetyAlerts.$inferSelect;
export type InsertSafetyAlert = typeof safetyAlerts.$inferInsert;

// ── User Watchlist ──────────────────────────────────────────────────────
export const userWatchlist = mysqlTable(
  "user_watchlist",
  {
    id: serial("id").primaryKey(),
    userId: bigint("user_id", { mode: "number", unsigned: true })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    countryId: bigint("country_id", { mode: "number", unsigned: true })
      .notNull()
      .references(() => countries.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("idx_watchlist_user_id").on(table.userId)]
);

export type UserWatchlist = typeof userWatchlist.$inferSelect;
export type InsertUserWatchlist = typeof userWatchlist.$inferInsert;
