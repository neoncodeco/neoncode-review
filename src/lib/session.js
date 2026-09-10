import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { randomUUID } from "crypto";
import bcrypt from "bcryptjs";

const COOKIE = "nc_session";
const MAX_AGE = 60 * 60 * 24 * 7; // 7 days

function secretKey() {
  const secret = process.env.AUTH_SECRET?.trim();
  if (!secret || secret.length < 32) {
    throw new Error(
      "AUTH_SECRET missing or too short in .env.local (use 32+ random chars)"
    );
  }
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

function cookieBase() {
  // Secure cookies on HTTPS / production; localhost stays http-friendly
  const secure =
    process.env.NODE_ENV === "production" ||
    process.env.AUTH_COOKIE_SECURE === "true";

  return {
    httpOnly: true,
    sameSite: "lax",
    secure,
    path: "/",
  };
}

export function sessionCookieOptions(token) {
  return {
    ...cookieBase(),
    name: COOKIE,
    value: token,
    maxAge: MAX_AGE,
  };
}

export function clearSessionCookieOptions() {
  return {
    ...cookieBase(),
    name: COOKIE,
    value: "",
    maxAge: 0,
  };
}

export async function getSessionFromCookies() {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  return verifySessionToken(token);
}

export { COOKIE };
