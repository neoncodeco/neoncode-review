

import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";


// helper: rating label
const ratingLabel = (r) => {
  if (r >= 1 && r <= 3) return "Very Bad";
  if (r === 4) return "Bad";
  if (r >= 5 && r <= 6) return "Average";
  if (r >= 7 && r <= 8) return "Good";
  if (r >= 9 && r <= 10) return "Very Good";
  return "";
};

export async function POST(req) {
  try {
    const body = await req.json();
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

    // 🔒 validation
    if (
      !name ||
      !phone ||
      !businessName ||
      !designer ||
      behavior < 1 ||
      behavior > 10 ||
      quality < 1 ||
      quality > 10 ||
      communication < 1 ||
      communication > 10 ||
      timeManagement < 1 ||
      timeManagement > 10
    ) {
      return NextResponse.json(
        { message: "Invalid or missing fields" },
        { status: 400 }
      );
    }

    const avgRating =
      (behavior + quality + communication + timeManagement) / 4;

    const client = await clientPromise;
    const db = client.db("designerReviewDB");

    const doc = {
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

      averageRating: Number(avgRating.toFixed(1)),
      averageLabel: ratingLabel(Math.round(avgRating)),

      comment,
      createdAt: new Date(),
    };

    const result = await db.collection("reviews").insertOne(doc);

    return NextResponse.json(
      {
        message: "Review saved successfully",
        id: result.insertedId.toString(),
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

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("designerReviewDB");

    const reviews = await db
      .collection("reviews")
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    const serialized = reviews.map((r) => ({
      ...r,
      _id: r._id?.toString?.() ?? r._id,
      createdAt: r.createdAt
        ? new Date(r.createdAt).toISOString()
        : null,
    }));

    return NextResponse.json(serialized);
  } catch (error) {
    console.error("GET /api/review failed:", error);
    return NextResponse.json(
      { message: "Failed to fetch reviews" },
      { status: 500 }
    );
  }
}
