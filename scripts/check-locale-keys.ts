/**
 * check-locale-keys.ts
 *
 * Ensures apps/web/i18n/ja.json and apps/web/i18n/en.json have the same
 * top-level key structure (recursive). Exits with code 1 when keys differ,
 * so CI fails the build.
 *
 * This script intentionally uses CommonJS-style __dirname resolution so it
 * runs reliably under `npx tsx` in this monorepo.
 */

const fs = require("fs");
const path = require("path");

const HERE = __dirname;
const WEB_ROOT = path.resolve(HERE, "..", "apps", "web");
const JA_PATH = path.join(WEB_ROOT, "i18n", "ja.json");
const EN_PATH = path.join(WEB_ROOT, "i18n", "en.json");

function loadJson(filePath) {
  try {
    const raw = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(raw);
  } catch (err) {
    console.error("Failed to read " + filePath + ":", err);
    process.exit(2);
  }
}

function collectKeys(obj, prefix) {
  if (prefix === undefined) prefix = "";
  if (obj === null || typeof obj !== "object" || Array.isArray(obj)) {
    return [];
  }
  const keys = [];
  const record = obj;
  for (const key of Object.keys(record)) {
    const full = prefix ? prefix + "." + key : key;
    const value = record[key];
    if (value !== null && typeof value === "object" && !Array.isArray(value)) {
      keys.push(...collectKeys(value, full));
    } else {
      keys.push(full);
    }
  }
  return keys.sort();
}

function main() {
  const ja = loadJson(JA_PATH);
  const en = loadJson(EN_PATH);

  const jaKeys = new Set(collectKeys(ja));
  const enKeys = new Set(collectKeys(en));

  const missingInEn = [...jaKeys].filter((k) => !enKeys.has(k));
  const missingInJa = [...enKeys].filter((k) => !jaKeys.has(k));

  if (missingInEn.length === 0 && missingInJa.length === 0) {
    console.log(
      "✓ Locale keys match: ja.json and en.json have the same keys."
    );
    process.exit(0);
  }

  if (missingInEn.length > 0) {
    console.error(
      "✗ Keys present in ja.json but missing in en.json (" +
        missingInEn.length +
        "):"
    );
    for (const k of missingInEn) {
      console.error("  - " + k);
    }
    console.error("");
  }
  if (missingInJa.length > 0) {
    console.error(
      "✗ Keys present in en.json but missing in ja.json (" +
        missingInJa.length +
        "):"
    );
    for (const k of missingInJa) {
      console.error("  - " + k);
    }
    console.error("");
  }

  console.error(
    "Please add the missing translations and re-run `npm run locale:check`."
  );
  process.exit(1);
}

main();
