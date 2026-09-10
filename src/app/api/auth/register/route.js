import { NextResponse } from "next/server";
import { usersCol } from "@/lib/db";
import { verifyMasterKey } from "@/lib/masterKey";
import {
  hashPassword,
  newUserId,
  sessionCookieOptions,
  signSession,
} from "@/lib/session";

function mongoHint(error) {
  const msg = String(error?.message || "");
  if (/bad auth|authentication failed/i.test(msg)) {
    return "MongoDB password wrong. Fix MONGODB_URI in .env.local, then restart.";
  }
  return msg || "Server error";
}

export async function POST(req) {
  try {
    const body = await req.json();
    const name = String(body.name || "").trim();
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");
    const masterKey = String(body.masterKey || "");

    if (!name || !email || password.length < 6) {
      return NextResponse.json(
        { message: "Name, email, and password (min 6) required" },
        { status: 400 }
      );
    }

    const check = await verifyMasterKey(masterKey);
    if (!check.ok) {
      return NextResponse.json({ message: check.message }, { status: 403 });
    }

    let col;
    try {
      col = await usersCol();
    } catch (err) {
      return NextResponse.json({ message: mongoHint(err) }, { status: 500 });
    }

    const existing = await col.findOne({ email });
    if (existing) {
      return NextResponse.json(
        {
          message:
            "This email is already registered. Please login instead.",
        },
        { status: 409 }
      );
    }

    const uid = newUserId();
    const passwordHash = await hashPassword(password);
    const now = new Date();

    await col.insertOne({
      uid,
      email,
      name,
      passwordHash,
      role: "admin",
      active: true,
      createdAt: now,
      updatedAt: now,
      createdBy: "master-key",
    });

    const token = await signSession({
      uid,
      email,
      name,
      role: "admin",
    });

    const res = NextResponse.json({
      message: "Admin registered",
      user: { uid, email, name, role: "admin" },
    });
    res.cookies.set(sessionCookieOptions(token));
    return res;
  } catch (error) {
    console.error("POST /api/auth/register failed:", error);
    return NextResponse.json({ message: mongoHint(error) }, { status: 500 });
  }
}
