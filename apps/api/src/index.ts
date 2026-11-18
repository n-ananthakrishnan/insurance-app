import express, { type Express } from "express";
import helmet from "helmet";
import cors from "cors";
import { rateLimit } from "express-rate-limit";
import { config } from "./config";
import { runtimeErrorHandler } from "./middleware/runtime-error-handler";
import { authRouter } from "./routers/auth";
import { runtimeRouter } from "./runtime-routes";
import { prisma } from "./prisma";

export function createApp(): Express {
  const app = express();

  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginResourcePolicy: { policy: "cross-origin" },
    })
  );

  const corsOrigins = String((config as any).CORS_ORIGINS || "")
    .split(",")
    .map((o: string) => o.trim())
    .filter(Boolean);

  app.use(
    cors({
      origin(origin, callback) {
        if (!origin) return callback(null, true);
        if (corsOrigins.includes(origin) || corsOrigins.includes("*")) return callback(null, true);
        return callback(new Error(`CORS origin not allowed: ${origin}`));
      },
      methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization", "X-Idempotency-Key"],
      credentials: true,
      maxAge: 86400,
    })
  );

  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: true, limit: "1mb" }));

  if ((config as any).ENABLE_RATE_LIMIT !== false) {
    const defaultLimiter = rateLimit({
      windowMs: 60 * 1000,
      max: 120,
      standardHeaders: true,
      legacyHeaders: false,
    });
    app.use(defaultLimiter);
  }

  app.get("/api/v1/health", async (_req, res) => {
    let database: "connected" | "disconnected" = "connected";
    try { await prisma.$queryRaw`SELECT 1`; } catch { database = "disconnected"; }
    res.status(database === "connected" ? 200 : 503).json({
      status: "ok",
      database,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  });

  app.use("/api/v1/auth", authRouter);
  app.use("/api/v1", runtimeRouter);

  app.use((_req, res) => {
    res.status(404).json({
      success: false,
      data: null,
      error: { code: "NOT_FOUND", messageJa: "見つかりませんでした。", messageEn: "Not found." },
    });
  });

  app.use(runtimeErrorHandler);

  return app;
}

export function startServer() {
  const app = createApp();
  const port = Number((config as any).PORT ?? 3001);
  app.listen(port, () => {
    console.log(`API listening on port ${port}`);
    console.log(`Health: http://localhost:${port}/api/v1/health`);
  });
}

if (process.argv[1] && (process.argv[1].endsWith("index.ts") || process.argv[1].endsWith("index.js"))) {
  startServer();
}
