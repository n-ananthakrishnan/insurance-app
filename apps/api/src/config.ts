import { z } from "zod";
import { existsSync, readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";

// Load the workspace-local environment before any Prisma client is constructed.
// This keeps `npm run dev` and the compiled server consistent without requiring
// a transitive dotenv dependency.
const moduleDir = __dirname;
for (const envPath of [resolve(process.cwd(), ".env"), resolve(moduleDir, "../.env"), resolve(moduleDir, "../../.env")]) {
  if (!existsSync(envPath)) continue;
  for (const line of readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/);
    if (!match || process.env[match[1]]) continue;
    let value = match[2];
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) value = value.slice(1, -1);
    process.env[match[1]] = value;
  }
  break;
}

export const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).optional().default("development"),
  PORT: z.preprocess(
    (v) => (typeof v === "string" ? parseInt(v, 10) : v),
    z.number().int().positive().optional().default(3001),
  ),
  DATABASE_URL: z.string().min(1).optional(),
  JWT_SECRET: z.string().min(16).optional(),
  BCRYPT_SALT_ROUNDS: z.preprocess(
    (v) => (typeof v === "string" ? parseInt(v, 10) : v),
    z.number().int().min(4).max(14).optional().default(12),
  ),
  LOGIN_MAX_ATTEMPTS: z.preprocess(
    (v) => (typeof v === "string" ? parseInt(v, 10) : v),
    z.number().int().min(1).max(20).optional().default(5),
  ),
  CORS_ORIGINS: z.string().optional().default("http://localhost:3000"),
  ENABLE_RATE_LIMIT: z.preprocess(
    (v) => (typeof v === "string" ? v === "true" : Boolean(v)),
    z.boolean().optional().default(false),
  ),
  R2_ACCOUNT_ID: z.string().optional(),
  R2_ACCESS_KEY_ID: z.string().optional(),
  R2_SECRET_ACCESS_KEY: z.string().optional(),
  R2_BUCKET: z.string().optional(),
  R2_PUBLIC_URL: z.union([z.string().url(), z.literal("")]).optional(),
  RESEND_API_KEY: z.string().optional(),
  RESEND_FROM: z.union([z.string().email(), z.literal("")]).optional(),
  FRONTEND_URL: z.string().url().optional(),
  LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).optional().default("info"),
});

type EnvData = z.infer<typeof envSchema>;

let parsedEnv: EnvData | null = null;

function loadEnv(): void {
  if (parsedEnv) return;
  const result = envSchema.safeParse(process.env);
  if (result.success) {
    parsedEnv = result.data;
  } else {
    console.warn(
      "[config] env validation warnings:",
      JSON.stringify(result.error.format(), null, 2),
    );
    parsedEnv = envSchema.parse({});
  }
}

loadEnv();

const env: EnvData = parsedEnv ?? envSchema.parse({});

export const config = {
  parsed: parsedEnv,
  data: env,
  BCRYPT_SALT_ROUNDS: env.BCRYPT_SALT_ROUNDS,
  LOGIN_MAX_ATTEMPTS: env.LOGIN_MAX_ATTEMPTS,
  JWT_SECRET: env.JWT_SECRET ?? "change-me-in-production",

  CORS_ORIGINS: env.CORS_ORIGINS ?? "http://localhost:3000",
  FRONTEND_ORIGIN: env.FRONTEND_URL ?? "http://localhost:3000",
  ENABLE_RATE_LIMIT: env.ENABLE_RATE_LIMIT ?? false,
  PORT: env.PORT ?? 3001,
  NODE_ENV: env.NODE_ENV ?? "development",
  LOG_LEVEL: env.LOG_LEVEL ?? "info",
  R2_ACCOUNT_ID: env.R2_ACCOUNT_ID ?? "",
  R2_ACCESS_KEY_ID: env.R2_ACCESS_KEY_ID ?? "",
  R2_SECRET_ACCESS_KEY: env.R2_SECRET_ACCESS_KEY ?? "",
  R2_BUCKET: env.R2_BUCKET ?? "",
  R2_BUCKET_NAME: env.R2_BUCKET ?? "",
  R2_PUBLIC_URL: env.R2_PUBLIC_URL ?? "",
  RESEND_API_KEY: env.RESEND_API_KEY ?? "",
  RESEND_FROM: env.RESEND_FROM ?? "",
  FRONTEND_URL: env.FRONTEND_URL ?? "http://localhost:3000",
} as const;
