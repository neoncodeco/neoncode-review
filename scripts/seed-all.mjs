/**
 * Seed admin master key + team into MongoDB.
 * Run: node scripts/seed-all.mjs
 */
import dns from "node:dns";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { MongoClient } from "mongodb";

try {
  dns.setServers(["8.8.8.8", "1.1.1.1", "8.8.4.4"]);
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
const masterKey = String(env.ADMIN_MASTER_KEY || "")
  .trim()
  .replace(/\s+/g, "");

if (!uri) {
  console.error("ERROR: MONGODB_URI missing in .env.local");
  process.exit(1);
}

if (/<db_password>|YOUR_PASSWORD|<|>/i.test(uri)) {
  console.error("ERROR: Replace <db_password> with the real Atlas password.");
  process.exit(1);
}

const TEAM_SEED = [
  { name: "Prince Bala", designation: "Project Manager", image: "" },
  { name: "Sagor Mandal", designation: "Sales Executive", image: "" },
  { name: "Abdullah Jilhan", designation: "Sales Executive", image: "" },
  { name: "Mithul", designation: "Sales Executive", image: "" },
  { name: "Abdullah", designation: "Designer", image: "" },
  { name: "Turan", designation: "Designer", image: "" },
  { name: "Israfil", designation: "Designer", image: "" },
  { name: "Fahim", designation: "Designer", image: "" },
  { name: "Jobaer", designation: "Designer", image: "" },
];

function slugify(name) {
  return String(name || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function printAuthHelp() {
  console.error(`
====================================================
 MongoDB AUTH FAILED — password/user wrong
====================================================
 Fix:
 1. Open https://cloud.mongodb.com
 2. Database Access → user "neon_code_review"
 3. Edit Password → set a NEW password
 4. Network Access → allow 0.0.0.0/0
 5. Put that password in .env.local:

    MONGODB_URI=mongodb+srv://neon_code_review:NEW_PASSWORD@neonreview.7c16fw9.mongodb.net/designerReviewDB?retryWrites=true&w=majority&appName=neonReview

 6. Run again:  node scripts/seed-all.mjs
====================================================
`);
}

const client = new MongoClient(uri, {
  family: 4,
  serverSelectionTimeoutMS: 20000,
});

try {
  await client.connect();
  const db = client.db("designerReviewDB");
  await db.command({ ping: 1 });
  console.log("OK: Connected to designerReviewDB");

  const now = new Date();

  if (masterKey) {
    await db.collection("settings").updateOne(
      { _id: "appConfig" },
      {
        $set: { adminMasterKey: masterKey, updatedAt: now },
        $setOnInsert: { createdAt: now },
      },
      { upsert: true }
    );
    console.log("OK: Master key saved (settings.appConfig)");
  } else {
    console.warn("WARN: ADMIN_MASTER_KEY empty — skipped");
  }

  const col = db.collection("teamMembers");
  for (const m of TEAM_SEED) {
    await col.updateOne(
      { name: m.name },
      {
        $set: {
          designation: m.designation,
          id: slugify(m.name),
          active: true,
          updatedAt: now,
        },
        $setOnInsert: {
          name: m.name,
          image: m.image || "",
          createdAt: now,
        },
      },
      { upsert: true }
    );
  }

  const members = await col.countDocuments({ active: { $ne: false } });
  console.log(`OK: Team members active = ${members}`);
  console.log("DONE. Restart: npm run dev");
  console.log("Register master key:", masterKey || "(set ADMIN_MASTER_KEY)");
} catch (err) {
  const msg = String(err?.message || err);
  console.error("Seed failed:", msg);
  if (/bad auth|authentication failed/i.test(msg)) printAuthHelp();
  process.exit(1);
} finally {
  await client.close();
}
