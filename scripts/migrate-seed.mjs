/**
 * Seed team members into designerReviewDB.
 * Loads MONGODB_URI from .env.local — run: node scripts/migrate-seed.mjs
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
const envPath = path.join(root, ".env.local");
const envText = fs.readFileSync(envPath, "utf8");
const uri = envText
  .split(/\r?\n/)
  .find((l) => l.startsWith("MONGODB_URI="))
  ?.slice("MONGODB_URI=".length)
  ?.trim();

if (!uri) {
  console.error("MONGODB_URI missing in .env.local");
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

const client = new MongoClient(uri, {
  family: 4,
  serverSelectionTimeoutMS: 20000,
});

try {
  await client.connect();
  const db = client.db("designerReviewDB");
  await db.command({ ping: 1 });
  console.log("Connected to designerReviewDB");

  const col = db.collection("teamMembers");
  const now = new Date();
  let upserted = 0;

  for (const m of TEAM_SEED) {
    const res = await col.updateOne(
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
    if (res.upsertedCount || res.modifiedCount || res.matchedCount) upserted += 1;
  }

  await col.updateMany(
    { designation: "Business Development" },
    { $set: { designation: "Sales Executive", updatedAt: now } }
  );

  const members = await col.find({ active: { $ne: false } }).toArray();
  const reviewCount = await db.collection("reviews").countDocuments();

  console.log(`Team seeded/updated: ${upserted} ops, ${members.length} active members`);
  console.log(`Reviews collection count: ${reviewCount}`);
  members.forEach((m) => {
    console.log(` - ${m.name} | ${m.designation} | photo: ${m.image ? "yes" : "no"}`);
  });
} catch (err) {
  console.error("Migration failed:", err.message);
  process.exit(1);
} finally {
  await client.close();
}
