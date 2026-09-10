import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";
import { reviewsCol, usersCol } from "@/lib/db";
import {
  ratingLabel,
  calcAverage,
  isValidScore,
  serializeReview,
} from "@/lib/ratings";

async function assertAdmin(uid) {
  if (!uid) return null;
  const col = await usersCol();
  return col.findOne({ uid, role: "admin", active: { $ne: false } });
}

function buildReviewDoc(fields, extras = {}) {
  const {
    name,
    phone,
    businessName,
    designer,
    designation,
    employeeId,
    comment,
    behavior,
    quality,
    communication,
    timeManagement,
  } = fields;

  const averageRating = calcAverage(
    behavior,
    quality,
    communication,
    timeManagement
  );

  return {
    name,
    phone,
    businessName,
    designer,
    designation,
    employeeId,
    behavior,
    behaviorLabel: ratingLabel(behavior),
    quality,
    qualityLabel: ratingLabel(quality),
    communication,
    communicationLabel: ratingLabel(communication),
    timeManagement,
    timeManagementLabel: ratingLabel(timeManagement),
    averageRating,
    averageLabel: ratingLabel(Math.round(averageRating)),
    comment,
    createdAt: new Date(),
    ...extras,
  };
}

/** Public submit → pending. Admin manual → approved. */
export async function POST(req) {
  try {
    const body = await req.json();
    const source = body.source === "manual" ? "manual" : "public";
    const adminUid = String(body.adminUid || "").trim();

    const name = String(body.name || "").trim();
    const phone = String(body.phone || "").trim();
    const businessName = String(body.businessName || "").trim();
    const designer = String(body.designer || "").trim();
    const designation = String(body.designation || "").trim();
    const employeeId = String(body.employeeId || "").trim();
    const comment = String(body.comment || "").trim();
    const behavior = Number(body.behavior);
    const quality = Number(body.quality);
    const communication = Number(body.communication);
    const timeManagement = Number(body.timeManagement);

    if (source === "manual") {
      const admin = await assertAdmin(adminUid);
      if (!admin) {
        return NextResponse.json({ message: "Admin only" }, { status: 403 });
      }
    }

    const clientOk =
      source === "manual"
        ? Boolean(designer)
        : name && phone && businessName && designer;

    if (
      !clientOk ||
      !isValidScore(behavior) ||
      !isValidScore(quality) ||
      !isValidScore(communication) ||
      !isValidScore(timeManagement)
    ) {
      return NextResponse.json(
        { message: "Invalid or missing fields" },
        { status: 400 }
      );
    }

    const col = await reviewsCol();
    const isManual = source === "manual";

    const doc = buildReviewDoc(
      {
        name: isManual ? name || "Admin (manual)" : name,
        phone: isManual ? phone || "—" : phone,
        businessName: isManual ? businessName || "Manual entry" : businessName,
        designer,
        designation,
        employeeId,
        comment,
        behavior,
        quality,
        communication,
        timeManagement,
      },
      {
        status: isManual ? "approved" : "pending",
        source,
        createdByAdmin: isManual ? adminUid : null,
        reviewedAt: isManual ? new Date() : null,
        reviewedBy: isManual ? adminUid : null,
      }
    );

    const result = await col.insertOne(doc);

    return NextResponse.json(
      {
        message: isManual
          ? "Manual rating saved & approved"
          : "Review submitted — waiting for admin approval",
        id: result.insertedId.toString(),
        status: doc.status,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/review failed:", error);
    return NextResponse.json(
      { message: error?.message || "Server error" },
      { status: 500 }
    );
  }
}

/**
 * GET ?scope=public → approved only (default)
 * GET ?scope=admin&adminUid=… → all (optional status filter)
 */
export async function GET(req) {
  try {
    const { searchParams } = req.nextUrl;
    const scope = searchParams.get("scope") || "public";
    const status = searchParams.get("status");
    const adminUid = searchParams.get("adminUid")?.trim();

    const col = await reviewsCol();
    const filter = {};

    if (scope === "admin") {
      const admin = await assertAdmin(adminUid);
      if (!admin) {
        return NextResponse.json({ message: "Admin only" }, { status: 403 });
      }
      if (status && ["pending", "approved", "rejected"].includes(status)) {
        filter.status = status;
      }
    } else {
      // Legacy docs without status count as approved for backward compat
      filter.$or = [{ status: "approved" }, { status: { $exists: false } }];
    }

    const reviews = await col
      .find(filter)
      .sort({ createdAt: -1 })
      .toArray();

    // Normalize missing status for admin view
    const serialized = reviews.map((r) =>
      serializeReview({
        ...r,
        status: r.status || "approved",
      })
    );

    return NextResponse.json(serialized);
  } catch (error) {
    console.error("GET /api/review failed:", error);
    return NextResponse.json(
      { message: "Failed to fetch reviews" },
      { status: 500 }
    );
  }
}

/** Approve / reject */
export async function PATCH(req) {
  try {
    const body = await req.json();
    const adminUid = String(body.adminUid || "").trim();
    const id = String(body.id || "").trim();
    const status = String(body.status || "").trim();

    const admin = await assertAdmin(adminUid);
    if (!admin) {
      return NextResponse.json({ message: "Admin only" }, { status: 403 });
    }

    if (!ObjectId.isValid(id) || !["approved", "rejected", "pending"].includes(status)) {
      return NextResponse.json({ message: "Invalid request" }, { status: 400 });
    }

    const col = await reviewsCol();
    const result = await col.findOneAndUpdate(
      { _id: new ObjectId(id) },
      {
        $set: {
          status,
          reviewedAt: new Date(),
          reviewedBy: adminUid,
        },
      },
      { returnDocument: "after" }
    );

    const doc = result?.value ?? result;
    if (!doc || !doc._id) {
      // driver version differences
      const updated = await col.findOne({ _id: new ObjectId(id) });
      if (!updated) {
        return NextResponse.json({ message: "Not found" }, { status: 404 });
      }
      return NextResponse.json({
        message: `Review ${status}`,
        review: serializeReview(updated),
      });
    }

    return NextResponse.json({
      message: `Review ${status}`,
      review: serializeReview(doc),
    });
  } catch (error) {
    console.error("PATCH /api/review failed:", error);
    return NextResponse.json(
      { message: error?.message || "Server error" },
      { status: 500 }
    );
  }
}
