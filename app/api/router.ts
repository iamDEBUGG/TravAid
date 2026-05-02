import { expenseRouter } from "./routers/expense";
import { budgetRouter } from "./routers/budget";
import { countryRouter } from "./routers/country";
import { analyticsRouter } from "./routers/analytics";
import { createRouter, publicQuery } from "./middleware";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  expense: expenseRouter,
  budget: budgetRouter,
  country: countryRouter,
  analytics: analyticsRouter,
});

export type AppRouter = typeof appRouter;
