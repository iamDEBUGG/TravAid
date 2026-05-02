import { relations } from "drizzle-orm";
import {
  users,
  expenses,
  budgets,
  countries,
  safetyAlerts,
  userWatchlist,
} from "./schema";

export const usersRelations = relations(users, ({ many }) => ({
  expenses: many(expenses),
  budgets: many(budgets),
  watchlist: many(userWatchlist),
}));

export const expensesRelations = relations(expenses, ({ one }) => ({
  user: one(users, {
    fields: [expenses.userId],
    references: [users.id],
  }),
}));

export const budgetsRelations = relations(budgets, ({ one }) => ({
  user: one(users, {
    fields: [budgets.userId],
    references: [users.id],
  }),
}));

export const countriesRelations = relations(countries, ({ many }) => ({
  alerts: many(safetyAlerts),
  watchlist: many(userWatchlist),
}));

export const safetyAlertsRelations = relations(safetyAlerts, ({ one }) => ({
  country: one(countries, {
    fields: [safetyAlerts.countryId],
    references: [countries.id],
  }),
}));

export const userWatchlistRelations = relations(userWatchlist, ({ one }) => ({
  user: one(users, {
    fields: [userWatchlist.userId],
    references: [users.id],
  }),
  country: one(countries, {
    fields: [userWatchlist.countryId],
    references: [countries.id],
  }),
}));
