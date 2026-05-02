import { z } from "zod";
import { createRouter, publicQuery } from "../middleware.js";
import { store } from "../lib/store.js";

export const analyticsRouter = createRouter({
  spendingTrend: publicQuery
    .input(
      z.object({
        startDate: z.string(),
        endDate: z.string(),
        granularity: z.enum(["daily", "weekly", "monthly"]).default("monthly"),
      })
    )
    .query(({ input }) => {
      const filtered = store.expenses.filter(
        e => e.expenseDate >= input.startDate && e.expenseDate <= input.endDate
      );
      const map = new Map<string, { total: number; count: number }>();
      for (const e of filtered) {
        const key =
          input.granularity === "daily"
            ? e.expenseDate
            : input.granularity === "monthly"
              ? e.expenseDate.substring(0, 7)
              : e.expenseDate.substring(0, 7); // simplified
        if (!map.has(key)) map.set(key, { total: 0, count: 0 });
        const entry = map.get(key)!;
        entry.total += Number(e.amount);
        entry.count++;
      }
      return Array.from(map.entries())
        .map(([period, data]) => ({
          period,
          totalAmount: Math.round(data.total * 100) / 100,
          transactionCount: data.count,
        }))
        .sort((a, b) => a.period.localeCompare(b.period));
    }),

  categoryBreakdown: publicQuery
    .input(
      z.object({
        startDate: z.string().optional(),
        endDate: z.string().optional(),
      })
    )
    .query(({ input }) => {
      let filtered = [...store.expenses];
      if (input.startDate)
        filtered = filtered.filter(e => e.expenseDate >= input.startDate!);
      if (input.endDate)
        filtered = filtered.filter(e => e.expenseDate <= input.endDate!);
      const total = filtered.reduce((s, e) => s + Number(e.amount), 0) || 1;
      const map = new Map<string, { total: number; count: number }>();
      for (const e of filtered) {
        if (!map.has(e.category)) map.set(e.category, { total: 0, count: 0 });
        const entry = map.get(e.category)!;
        entry.total += Number(e.amount);
        entry.count++;
      }
      return Array.from(map.entries()).map(([category, data]) => ({
        category,
        totalAmount: Math.round(data.total * 100) / 100,
        transactionCount: data.count,
        percentage: Math.round((data.total / total) * 100),
      }));
    }),

  monthlySummary: publicQuery
    .input(z.object({ year: z.number(), month: z.number().min(1).max(12) }))
    .query(({ input }) => {
      const monthStr = `${input.year}-${String(input.month).padStart(2, "0")}`;
      const filtered = store.expenses.filter(e =>
        e.expenseDate.startsWith(monthStr)
      );
      const totalExpenses = filtered.reduce((s, e) => s + Number(e.amount), 0);
      const totalBudget = store.budgets.reduce(
        (s, b) => s + Number(b.amount),
        0
      );
      const catMap = new Map<string, number>();
      for (const e of filtered)
        catMap.set(
          e.category,
          (catMap.get(e.category) || 0) + Number(e.amount)
        );
      let topCategory = "none";
      let topAmount = 0;
      for (const [cat, amt] of catMap) {
        if (amt > topAmount) {
          topCategory = cat;
          topAmount = amt;
        }
      }
      return {
        totalExpenses: Math.round(totalExpenses * 100) / 100,
        totalBudget,
        budgetUsed:
          totalBudget > 0 ? Math.round((totalExpenses / totalBudget) * 100) : 0,
        topCategory,
        transactionCount: filtered.length,
      };
    }),

  budgetVsActual: publicQuery
    .input(
      z.object({
        startDate: z.string().optional(),
        endDate: z.string().optional(),
      })
    )
    .query(({ input }) => {
      let filtered = [...store.expenses];
      if (input.startDate)
        filtered = filtered.filter(e => e.expenseDate >= input.startDate!);
      if (input.endDate)
        filtered = filtered.filter(e => e.expenseDate <= input.endDate!);
      const catMap = new Map<string, number>();
      for (const e of filtered)
        catMap.set(
          e.category,
          (catMap.get(e.category) || 0) + Number(e.amount)
        );
      return store.budgets.map(b => ({
        category: b.category,
        budget: Number(b.amount),
        actual: catMap.get(b.category) || 0,
        variance: Number(b.amount) - (catMap.get(b.category) || 0),
      }));
    }),

  merchantSummary: publicQuery
    .input(z.object({ limit: z.number().default(10) }))
    .query(({ input }) => {
      const map = new Map<string, { total: number; count: number }>();
      for (const e of store.expenses) {
        if (!e.merchant) continue;
        if (!map.has(e.merchant)) map.set(e.merchant, { total: 0, count: 0 });
        const entry = map.get(e.merchant)!;
        entry.total += Number(e.amount);
        entry.count++;
      }
      return Array.from(map.entries())
        .map(([merchant, data]) => ({
          merchant,
          totalAmount: data.total,
          transactionCount: data.count,
        }))
        .sort((a, b) => b.totalAmount - a.totalAmount)
        .slice(0, input.limit);
    }),

  safetyDistribution: publicQuery.query(() => {
    const dist = { safe: 0, moderate: 0, high_risk: 0, critical: 0, total: 0 };
    for (const c of store.countries) {
      dist[c.advisoryLevel as keyof typeof dist]++;
      dist.total++;
    }
    return dist;
  }),

  regionalSummary: publicQuery.query(() => {
    const map = new Map<
      string,
      { scores: number[]; crimes: number[]; health: number[] }
    >();
    for (const c of store.countries) {
      const r = c.region || "Other";
      if (!map.has(r)) map.set(r, { scores: [], crimes: [], health: [] });
      const e = map.get(r)!;
      e.scores.push(c.overallScore);
      e.crimes.push(c.crimeRate);
      e.health.push(c.healthcareScore);
    }
    const avg = (arr: number[]) =>
      Math.round(arr.reduce((a, b) => a + b, 0) / arr.length);
    return Array.from(map.entries())
      .map(([region, data]) => ({
        region,
        avgScore: avg(data.scores),
        countryCount: data.scores.length,
        avgCrime: avg(data.crimes),
        avgHealthcare: avg(data.health),
      }))
      .sort((a, b) => b.avgScore - a.avgScore);
  }),
});
