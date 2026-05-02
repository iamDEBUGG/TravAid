import { z } from "zod";
import { createRouter, publicQuery } from "../middleware";
import { store } from "../lib/store";

const listCountriesInput = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(200).default(200),
  region: z.string().optional(),
  search: z.string().optional(),
  sortBy: z.enum(["name", "overall_score", "crime_rate"]).default("overall_score"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export const countryRouter = createRouter({
  list: publicQuery
    .input(listCountriesInput)
    .query(({ input }) => {
      let items = [...store.countries];
      if (input.region) items = items.filter(c => c.region === input.region);
      if (input.search) {
        const s = input.search.toLowerCase();
        items = items.filter(c => c.name.toLowerCase().includes(s));
      }
      items.sort((a, b) => {
        const key = input.sortBy === "name" ? "name" : input.sortBy === "crime_rate" ? "crimeRate" : "overallScore";
        if (input.sortOrder === "asc") return a[key] > b[key] ? 1 : -1;
        return a[key] < b[key] ? 1 : -1;
      });
      const offset = (input.page - 1) * input.limit;
      return items.slice(offset, offset + input.limit);
    }),

  getById: publicQuery
    .input(z.object({ id: z.number() }))
    .query(({ input }) => store.countries.find(c => c.id === input.id) || null),

  getByCode: publicQuery
    .input(z.object({ code: z.string().length(3) }))
    .query(({ input }) => store.countries.find(c => c.code === input.code) || null),

  getAlerts: publicQuery
    .input(z.object({ countryId: z.number() }))
    .query(({ input }) => store.alerts.filter(a => a.countryId === input.countryId)),

  getRegions: publicQuery.query(() => {
    const regionMap = new Map<string, { scores: number[]; count: number }>();
    for (const c of store.countries) {
      const r = c.region || "Other";
      if (!regionMap.has(r)) regionMap.set(r, { scores: [], count: 0 });
      const entry = regionMap.get(r)!;
      entry.scores.push(c.overallScore);
      entry.count++;
    }
    return Array.from(regionMap.entries()).map(([region, data]) => ({
      region,
      count: data.count,
      countryCount: data.count,
      avgScore: Math.round(data.scores.reduce((a, b) => a + b, 0) / data.count),
    }));
  }),
});
