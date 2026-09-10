/**
 * Ensure a clean test admin exists for login.
 * Run: node scripts/ensure-admin.mjs
 */
import dns from "node:dns";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { randomUUID } from "crypto";
import bcrypt from "bcryptjs";
import { MongoClient } from "mongodb";

try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch {
  /* ignore */
}

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const env = Object.fromEntries(
  fs
    .readFileSync(path.join(root, ".env.local"), "utf8")
    .split(/\r?\n/)
    .filter((l) => l && !l.startsWith("#") && l.includes("="))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
    })
);

const email = "admin@neoncode.test";
const password = "admin123";
const client = new MongoClient(env.MONGODB_URI, {
  family: 4,
  serverSelectionTimeoutMS: 20000,
});

try {
  await client.connect();
  const db = client.db("designerReviewDB");
  const users = db.collection("appUsers");
  const now = new Date();
  const passwordHash = await bcrypt.hash(password, 10);
  const uid = randomUUID();

  await users.updateOne(
    { email },
    {
      $set: {
        email,
        name: "NeonCode Admin",
        passwordHash,
        role: "admin",
        active: true,
        updatedAt: now,
      },
      $setOnInsert: {
        uid,
        createdAt: now,
        createdBy: "ensure-admin",
      },
    },
    { upsert: true }
  );

  // Keep uid stable if already existed
  const doc = await users.findOne({ email });
  console.log("OK admin ready");
  console.log("  email:", email);
  console.log("  password:", password);
  console.log("  role:", doc.role);
  console.log("  uid:", doc.uid);
  console.log("  master key (register):", env.ADMIN_MASTER_KEY);
  console.log(
    "  team members:",
    await db.collection("teamMembers").countDocuments({ active: { $ne: false } })
  );
} catch (err) {
  console.error("Failed:", err.message);
  process.exit(1);
} finally {
  await client.close();
}
