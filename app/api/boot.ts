import { Hono } from "hono";
import type { HttpBindings } from "@hono/node-server";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "./router";
import { seedStore } from "./lib/seed-mem";

// Seed in-memory data on startup
seedStore();

const app = new Hono<{ Bindings: HttpBindings }>();

app.use("/api/trpc/*", async (c) => {
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req: c.req.raw,
    router: appRouter,
    createContext: () => ({}),
  });
});
app.all("/api/*", (c) => c.json({ error: "Not Found" }, 404));

export default app;

if (process.env.NODE_ENV === "production") {
  const { serve } = await import("@hono/node-server");
  const port = parseInt(process.env.PORT || "3000");
  serve({ fetch: app.fetch, port }, () => {
    console.log(`TravAid running on http://localhost:${port}/`);
  });
}
