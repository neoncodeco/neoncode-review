import { NextResponse } from "next/server";
import { getSessionFromCookies } from "@/lib/session";

export async function GET() {
  const user = await getSessionFromCookies();
  // Always 200 — no session is normal (not an error)
  return NextResponse.json({ user: user?.uid ? user : null });
}
