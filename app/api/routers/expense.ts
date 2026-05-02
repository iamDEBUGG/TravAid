import { z } from "zod";
import { createRouter, publicQuery } from "../middleware.js";
import { store } from "../lib/store.js";

const createExpenseInput = z.object({
  amount: z.string().regex(/^\d+(\.\d{1,2})?$/),
  currency: z.string().length(3).default("USD"),
  category: z.enum([
    "food",
    "travel",
    "bills",
    "entertainment",
    "shopping",
    "other",
  ]),
  description: z.string().max(255).optional(),
  paymentMethod: z.string().max(50).optional(),
  merchant: z.string().max(100).optional(),
  status: z.enum(["completed", "pending"]).default("completed"),
  expenseDate: z.string(),
});

const updateExpenseInput = z.object({
  id: z.number(),
  amount: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/)
    .optional(),
  category: z
    .enum(["food", "travel", "bills", "entertainment", "shopping", "other"])
    .optional(),
  description: z.string().max(255).optional(),
  paymentMethod: z.string().max(50).optional(),
  merchant: z.string().max(100).optional(),
  status: z.enum(["completed", "pending"]).optional(),
  expenseDate: z.string().optional(),
});

const listExpensesInput = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  category: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  search: z.string().optional(),
  sortBy: z.enum(["date", "amount", "category"]).default("date"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export const expenseRouter = createRouter({
  create: publicQuery.input(createExpenseInput).mutation(({ input }) => {
    const e = store.addExpense({
      userId: 1,
      amount: input.amount,
      currency: input.currency,
      category: input.category,
      description: input.description || null,
      paymentMethod: input.paymentMethod || null,
      merchant: input.merchant || null,
      status: input.status,
      expenseDate: input.expenseDate.split("T")[0],
    });
    return { id: e.id };
  }),

  update: publicQuery.input(updateExpenseInput).mutation(({ input }) => {
    const { id, ...data } = input;
    const update: Record<string, unknown> = {};
    if (data.amount) update.amount = data.amount;
    if (data.category) update.category = data.category;
    if (data.description !== undefined) update.description = data.description;
    if (data.paymentMethod !== undefined)
      update.paymentMethod = data.paymentMethod;
    if (data.merchant !== undefined) update.merchant = data.merchant;
    if (data.status) update.status = data.status;
    if (data.expenseDate) update.expenseDate = data.expenseDate.split("T")[0];
    store.updateExpense(id, update);
    return { success: true };
  }),

  delete: publicQuery
    .input(z.object({ id: z.number() }))
    .mutation(({ input }) => {
      store.deleteExpense(input.id);
      return { success: true };
    }),

  list: publicQuery.input(listExpensesInput).query(({ input }) => {
    let items = [...store.expenses];
    if (input.category)
      items = items.filter(e => e.category === input.category);
    if (input.startDate)
      items = items.filter(e => e.expenseDate >= input.startDate!);
    if (input.endDate)
      items = items.filter(e => e.expenseDate <= input.endDate!);
    if (input.search) {
      const s = input.search.toLowerCase();
      items = items.filter(
        e =>
          e.description?.toLowerCase().includes(s) ||
          e.merchant?.toLowerCase().includes(s)
      );
    }
    items.sort((a, b) => {
      if (input.sortBy === "amount") {
        return input.sortOrder === "asc"
          ? Number(a.amount) - Number(b.amount)
          : Number(b.amount) - Number(a.amount);
      }
      if (input.sortBy === "category") {
        return input.sortOrder === "asc"
          ? a.category.localeCompare(b.category)
          : b.category.localeCompare(a.category);
      }
      return input.sortOrder === "asc"
        ? a.expenseDate.localeCompare(b.expenseDate)
        : b.expenseDate.localeCompare(a.expenseDate);
    });
    const offset = (input.page - 1) * input.limit;
    const paged = items.slice(offset, offset + input.limit);
    return {
      items: paged,
      total: items.length,
      page: input.page,
      totalPages: Math.ceil(items.length / input.limit),
    };
  }),

  getById: publicQuery
    .input(z.object({ id: z.number() }))
    .query(({ input }) => store.expenses.find(e => e.id === input.id) || null),

  getCategories: publicQuery.query(() => {
    const map = new Map<string, { count: number; total: number }>();
    for (const e of store.expenses) {
      if (!map.has(e.category)) map.set(e.category, { count: 0, total: 0 });
      const entry = map.get(e.category)!;
      entry.count++;
      entry.total += Number(e.amount);
    }
    return Array.from(map.entries()).map(([category, data]) => ({
      category,
      count: data.count,
      total: Math.round(data.total * 100) / 100,
    }));
  }),

  getRecent: publicQuery
    .input(z.object({ limit: z.number().default(5) }))
    .query(({ input }) => {
      return [...store.expenses]
        .sort((a, b) => b.expenseDate.localeCompare(a.expenseDate))
        .slice(0, input.limit);
    }),
});
