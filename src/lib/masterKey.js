import { getDb } from "@/lib/db";

const SETTINGS_ID = "appConfig";

export function normalizeMasterKey(value) {
  return String(value || "")
    .trim()
    .replace(/\s+/g, "");
}

export function isValidMasterKeyFormat(value) {
  const key = normalizeMasterKey(value);
  if (key.length < 8 || key.length > 64) return false;
  return /^[A-Za-z0-9@#_-]+$/.test(key);
}

function envMasterKey() {
  return normalizeMasterKey(process.env.ADMIN_MASTER_KEY);
}

async function settingsCol() {
  const db = await getDb();
  return db.collection("settings");
}

/** Best-effort sync env key → DB (ignore if DB down) */
export async function syncMasterKeyToDb() {
  const envKey = envMasterKey();
  if (!envKey || !isValidMasterKeyFormat(envKey)) return null;

  try {
    const col = await settingsCol();
    const now = new Date();
    await col.updateOne(
      { _id: SETTINGS_ID },
      {
        $set: { adminMasterKey: envKey, updatedAt: now },
        $setOnInsert: { createdAt: now },
      },
      { upsert: true }
    );
    return envKey;
  } catch {
    return null;
  }
}

/**
 * Verify submitted key.
 * Primary source: ADMIN_MASTER_KEY in .env.local (always works).
 * Also accepts matching key from DB settings if env empty.
 */
export async function verifyMasterKey(submitted) {
  const input = normalizeMasterKey(submitted);
  if (!input) {
    return { ok: false, message: "Master key required" };
  }

  if (!isValidMasterKeyFormat(input)) {
    return {
      ok: false,
      message: "Master key must be at least 8 characters (letters, numbers, - _ @ #)",
    };
  }

  const envKey = envMasterKey();

  if (envKey) {
    if (input !== envKey) {
      return { ok: false, message: "Invalid master key" };
    }
    // Sync to DB when possible (non-blocking for auth success)
    syncMasterKeyToDb().catch(() => {});
    return { ok: true };
  }

  // Env missing — try DB
  try {
    const col = await settingsCol();
    const doc = await col.findOne({ _id: SETTINGS_ID });
    const dbKey = normalizeMasterKey(doc?.adminMasterKey);
    if (!dbKey) {
      return {
        ok: false,
        message: "ADMIN_MASTER_KEY not set in .env.local",
      };
    }
    if (input !== dbKey) {
      return { ok: false, message: "Invalid master key" };
    }
    return { ok: true };
  } catch (err) {
    const msg = String(err?.message || "");
    if (/bad auth|authentication failed/i.test(msg)) {
      return {
        ok: false,
        message:
          "Database login failed. Fix MONGODB_URI password in .env.local, then restart.",
      };
    }
    return {
      ok: false,
      message: err?.message || "Could not verify master key",
    };
  }
}
