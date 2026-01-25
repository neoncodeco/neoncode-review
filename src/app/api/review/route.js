
import clientPromise from "lib/mongodb";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const body = await req.json();
    const { name, phone, designer, rating, comment } = body;

    if (!name || !phone || !designer || !rating) {
      return NextResponse.json(
        { message: "All required fields missing" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("designerReviewDB");

    await db.collection("reviews").insertOne({
      name,
      phone,
      designer,
      rating,
      comment,
      createdAt: new Date(),
    });

    return NextResponse.json(
      { message: "Review saved successfully" },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Server error" },
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

    return NextResponse.json(reviews);
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to fetch reviews" },
      { status: 500 }
    );
  }
}
