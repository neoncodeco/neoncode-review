import { NextResponse } from "next/server";
import { usersCol } from "@/lib/db";
import {
  sessionCookieOptions,
  signSession,
  verifyPassword,
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
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");

    if (!email || !password) {
      return NextResponse.json(
        { message: "Email and password required" },
        { status: 400 }
      );
    }

    let col;
    try {
      col = await usersCol();
    } catch (err) {
      return NextResponse.json({ message: mongoHint(err) }, { status: 500 });
    }

    const user = await col.findOne({ email, active: { $ne: false } });
    if (!user?.passwordHash) {
      return NextResponse.json(
        { message: "Invalid email or password" },
        { status: 401 }
      );
    }

    const ok = await verifyPassword(password, user.passwordHash);
    if (!ok) {
      return NextResponse.json(
        { message: "Invalid email or password" },
        { status: 401 }
      );
    }

    const sessionUser = {
      uid: user.uid,
      email: user.email,
      name: user.name || "",
      role: user.role || "member",
    };

    const token = await signSession(sessionUser);
    const res = NextResponse.json({
      message: "Logged in",
      user: sessionUser,
    });
    res.cookies.set(sessionCookieOptions(token));
    return res;
  } catch (error) {
    console.error("POST /api/auth/login failed:", error);
    return NextResponse.json({ message: mongoHint(error) }, { status: 500 });
  }
}
