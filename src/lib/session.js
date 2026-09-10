import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { randomUUID } from "crypto";
import bcrypt from "bcryptjs";

const COOKIE = "nc_session";
const MAX_AGE = 60 * 60 * 24 * 7; // 7 days

function secretKey() {
  const secret =
    process.env.AUTH_SECRET ||
    process.env.ADMIN_MASTER_KEY ||
    "neoncode-dev-secret-change-me";
  return new TextEncoder().encode(secret);
}

export function newUserId() {
  return randomUUID();
}

export async function hashPassword(password) {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password, hash) {
  if (!hash) return false;
  return bcrypt.compare(password, hash);
}

export async function signSession(payload) {
  return new SignJWT({
    uid: payload.uid,
    email: payload.email,
    name: payload.name,
    role: payload.role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(secretKey());
}

export async function verifySessionToken(token) {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey());
    return {
      uid: String(payload.uid || ""),
      email: String(payload.email || ""),
      name: String(payload.name || ""),
      role: String(payload.role || "member"),
    };
  } catch {
    return null;
  }
}

export function sessionCookieOptions(token) {
  return {
    name: COOKIE,
    value: token,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  };
}

export function clearSessionCookieOptions() {
  return {
    name: COOKIE,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  };
}

export async function getSessionFromCookies() {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  return verifySessionToken(token);
}

export { COOKIE };
