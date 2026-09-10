import { NextResponse } from "next/server";
import { usersCol, teamCol } from "@/lib/db";
import { hashPassword, newUserId } from "@/lib/session";

async function assertAdmin(uid) {
  if (!uid) return null;
  const col = await usersCol();
  return col.findOne({ uid, role: "admin", active: { $ne: false } });
}

export async function GET(req) {
  try {
    const adminUid = req.nextUrl.searchParams.get("adminUid")?.trim();
    const admin = await assertAdmin(adminUid);
    if (!admin) {
      return NextResponse.json({ message: "Admin only" }, { status: 403 });
    }

    const col = await usersCol();
    const list = await col
      .find({ active: { $ne: false } })
      .project({ passwordHash: 0 })
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json(
      list.map((u) => ({
        ...u,
        _id: u._id?.toString?.() ?? u._id,
        createdAt: u.createdAt ? new Date(u.createdAt).toISOString() : null,
      }))
    );
  } catch (error) {
    console.error("GET /api/admin/users failed:", error);
    return NextResponse.json(
      { message: error?.message || "Server error" },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const adminUid = String(body.adminUid || "").trim();
    const admin = await assertAdmin(adminUid);
    if (!admin) {
      return NextResponse.json({ message: "Admin only" }, { status: 403 });
    }

    const name = String(body.name || "").trim();
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");
    const role = body.role === "admin" ? "admin" : "member";
    const designation = String(body.designation || "").trim();
    const linkTeam = Boolean(body.linkTeam);
    const image = String(body.image || "").trim();

    if (!name || !email || password.length < 6) {
      return NextResponse.json(
        { message: "Name, email, and password (min 6) required" },
        { status: 400 }
      );
    }

    const col = await usersCol();
    const existing = await col.findOne({ email });
    if (existing) {
      return NextResponse.json(
        { message: "This email is already registered" },
        { status: 409 }
      );
    }

    const uid = newUserId();
    const passwordHash = await hashPassword(password);
    const now = new Date();

    let teamMemberId = null;
    if (linkTeam && designation) {
      const tcol = await teamCol();
      const id = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      const result = await tcol.insertOne({
        name,
        designation,
        image,
        id,
        active: true,
        userUid: uid,
        createdAt: now,
        updatedAt: now,
      });
      teamMemberId = result.insertedId.toString();
    }

    await col.insertOne({
      uid,
      email,
      name,
      passwordHash,
      role,
      designation: designation || "",
      teamMemberId,
      active: true,
      createdAt: now,
      updatedAt: now,
      createdBy: adminUid,
    });

    return NextResponse.json(
      {
        message: "User created",
        uid,
        email,
        role,
        teamMemberId,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/admin/users failed:", error);
    return NextResponse.json(
      { message: error?.message || "Server error" },
      { status: 500 }
    );
  }
}
