/**
 * Seed admin master key into MongoDB settings collection.
 * Run: node scripts/seed-master-key.mjs
 */
import dns from "node:dns";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { MongoClient } from "mongodb";

try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch {
  /* ignore */
}

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const envText = fs.readFileSync(path.join(root, ".env.local"), "utf8");
const env = Object.fromEntries(
  envText
    .split(/\r?\n/)
    .filter((l) => l && !l.startsWith("#") && l.includes("="))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
    })
);

const uri = env.MONGODB_URI;
const key = String(env.ADMIN_MASTER_KEY || "")
  .trim()
  .replace(/\s+/g, "");

if (!uri) {
  console.error("MONGODB_URI missing");
  process.exit(1);
}
if (!key || key.length < 8) {
  console.error("ADMIN_MASTER_KEY missing or too short (min 8)");
  process.exit(1);
}

const client = new MongoClient(uri, {
  family: 4,
  serverSelectionTimeoutMS: 20000,
});

try {
  await client.connect();
  const col = client.db("designerReviewDB").collection("settings");
  const now = new Date();
  await col.updateOne(
    { _id: "appConfig" },
    {
      $set: { adminMasterKey: key, updatedAt: now },
      $setOnInsert: { createdAt: now },
    },
    { upsert: true }
  );
  console.log("Master key saved to designerReviewDB.settings (appConfig)");
  console.log("Format OK:", key.replace(/.(?=.{4})/g, "*"));
} catch (err) {
  console.error("Seed failed:", err.message);
  process.exit(1);
} finally {
  await client.close();
}
