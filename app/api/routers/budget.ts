import { z } from "zod";
import { createRouter, publicQuery } from "../middleware.js";
import { store } from "../lib/store.js";

const createBudgetInput = z.object({
  category: z.string().min(1).max(50),
  amount: z.string().regex(/^\d+(\.\d{1,2})?$/),
  period: z.enum(["monthly", "weekly", "yearly"]).default("monthly"),
  startDate: z.string(),
  endDate: z.string().optional(),
  alertThreshold: z.number().min(1).max(100).default(80),
});

export const budgetRouter = createRouter({
  create: publicQuery.input(createBudgetInput).mutation(({ input }) => {
    const b = store.addBudget({
      userId: 1,
      category: input.category,
      amount: input.amount,
      period: input.period,
      startDate: input.startDate.split("T")[0],
      endDate: input.endDate ? input.endDate.split("T")[0] : null,
      alertThreshold: input.alertThreshold,
    });
    return { id: b.id };
  }),

  update: publicQuery
    .input(
      z.object({
        id: z.number(),
        category: z.string().min(1).max(50).optional(),
        amount: z
          .string()
          .regex(/^\d+(\.\d{1,2})?$/)
          .optional(),
        period: z.enum(["monthly", "weekly", "yearly"]).optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        alertThreshold: z.number().min(1).max(100).optional(),
      })
    )
    .mutation(({ input }) => {
      const { id, ...data } = input;
      store.updateBudget(id, data);
      return { success: true };
    }),

  delete: publicQuery
    .input(z.object({ id: z.number() }))
    .mutation(({ input }) => {
      store.deleteBudget(input.id);
      return { success: true };
    }),

  list: publicQuery.query(() => store.budgets),

  getById: publicQuery
    .input(z.object({ id: z.number() }))
    .query(({ input }) => store.budgets.find(b => b.id === input.id) || null),
});
