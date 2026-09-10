import { NextResponse } from "next/server";
import { clearSessionCookieOptions } from "@/lib/session";

export async function POST() {
  const res = NextResponse.json({ message: "Logged out" });
  res.cookies.set(clearSessionCookieOptions());
  return res;
}
