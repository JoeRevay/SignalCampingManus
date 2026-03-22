import "dotenv/config";
import express from "express";
import { createServer } from "http";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { initDb } from "../db";
import { generateSitemapXml } from "../sitemap";

async function startServer() {
  await initDb();

  const app = express();
  const server = createServer(app);
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // Redirects: hyphenated state variant → slash-separated canonical form
  // e.g. /best-remote-work-campgrounds-in-ohio → /best-remote-work-campgrounds-in/ohio
  const REDIRECT_PAIRS: [RegExp, string][] = [
    [/^\/best-remote-work-campgrounds-in-(michigan|ohio|pennsylvania|wisconsin)$/i,          "/best-remote-work-campgrounds-in/"],
    [/^\/best-campgrounds-with-verizon-signal-in-(michigan|ohio|pennsylvania|wisconsin)$/i,  "/best-campgrounds-with-verizon-signal-in/"],
    [/^\/best-campgrounds-with-att-signal-in-(michigan|ohio|pennsylvania|wisconsin)$/i,      "/best-campgrounds-with-att-signal-in/"],
    [/^\/best-campgrounds-with-tmobile-signal-in-(michigan|ohio|pennsylvania|wisconsin)$/i,  "/best-campgrounds-with-tmobile-signal-in/"],
    [/^\/campgrounds-with-strong-cell-service-in-(michigan|ohio|pennsylvania|wisconsin)$/i,  "/campgrounds-with-strong-cell-service-in/"],
  ];
  app.use((req, res, next) => {
    for (const [pattern, prefix] of REDIRECT_PAIRS) {
      const m = req.path.match(pattern);
      if (m) return res.redirect(301, `${prefix}${m[1].toLowerCase()}`);
    }
    next();
  });

  // Dynamic sitemap — registered FIRST, before tRPC, static, and Vite middleware
  // so it always wins and is never intercepted by catch-alls or express.static
  app.get("/sitemap.xml", (_req, res) => {
    try {
      const xml = generateSitemapXml();
      res.set("Content-Type", "application/xml; charset=utf-8");
      return res.send(xml);
    } catch (err) {
      console.error("[Sitemap] Failed to generate sitemap:", err);
      return res.status(500).send("Failed to generate sitemap");
    }
  });
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const port = parseInt(process.env.PORT || "5000");

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
