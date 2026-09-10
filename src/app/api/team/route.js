import clientPromise from "@/lib/mongodb";
import { TEAM_SEED, slugify } from "@/data/team";
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";

async function getCollection() {
  const client = await clientPromise;
  const db = client.db("designerReviewDB");
  return db.collection("teamMembers");
}

function serialize(doc) {
  return {
    ...doc,
    _id: doc._id?.toString?.() ?? doc._id,
    createdAt: doc.createdAt ? new Date(doc.createdAt).toISOString() : null,
    updatedAt: doc.updatedAt ? new Date(doc.updatedAt).toISOString() : null,
  };
}

async function ensureSeed(col) {
  const now = new Date();

  // Migrate old label → Sales Executive
  await col.updateMany(
    { designation: "Business Development" },
    { $set: { designation: "Sales Executive", updatedAt: now } }
  );

  for (const m of TEAM_SEED) {
    await col.updateOne(
      { name: m.name },
      {
        $set: {
          designation: m.designation,
          id: slugify(m.name),
          updatedAt: now,
        },
        $setOnInsert: {
          name: m.name,
          image: m.image || "",
          active: true,
          createdAt: now,
        },
      },
      { upsert: true }
    );
  }
}

export async function GET() {
  try {
    const col = await getCollection();
    await ensureSeed(col);

    const members = await col
      .find({ active: { $ne: false } })
      .sort({ designation: 1, name: 1 })
      .toArray();

    return NextResponse.json(members.map(serialize));
  } catch (error) {
    console.error("GET /api/team failed:", error);
    return NextResponse.json(
      { message: error?.message || "Failed to fetch team" },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const name = String(body.name || "").trim();
    const designation = String(body.designation || "").trim();
    const image = String(body.image || "").trim();

    if (!name || !designation) {
      return NextResponse.json(
        { message: "Name and designation are required" },
        { status: 400 }
      );
    }

    const col = await getCollection();
    await ensureSeed(col);

    const now = new Date();
    const doc = {
      id: slugify(name) || `member-${Date.now()}`,
      name,
      designation,
      image,
      active: true,
      createdAt: now,
      updatedAt: now,
    };

    const result = await col.insertOne(doc);
    return NextResponse.json(
      { message: "Member added", member: serialize({ ...doc, _id: result.insertedId }) },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/team failed:", error);
    return NextResponse.json(
      { message: error?.message || "Failed to add member" },
      { status: 500 }
    );
  }
}

export async function PUT(req) {
  try {
    const body = await req.json();
    const id = String(body._id || "").trim();
    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json({ message: "Invalid member id" }, { status: 400 });
    }

    const name = String(body.name || "").trim();
    const designation = String(body.designation || "").trim();
    const image = body.image !== undefined ? String(body.image || "").trim() : undefined;

    if (!name || !designation) {
      return NextResponse.json(
        { message: "Name and designation are required" },
        { status: 400 }
      );
    }

    const col = await getCollection();
    const update = {
      name,
      designation,
      id: slugify(name) || `member-${Date.now()}`,
      updatedAt: new Date(),
    };
    if (image !== undefined) update.image = image;

    const result = await col.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: update },
      { returnDocument: "after" }
    );

    if (!result) {
      return NextResponse.json({ message: "Member not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: "Member updated",
      member: serialize(result),
    });
  } catch (error) {
    console.error("PUT /api/team failed:", error);
    return NextResponse.json(
      { message: error?.message || "Failed to update member" },
      { status: 500 }
    );
  }
}

export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json({ message: "Invalid member id" }, { status: 400 });
    }

    const col = await getCollection();
    // Soft delete so review history stays meaningful
    const result = await col.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: { active: false, updatedAt: new Date() } },
      { returnDocument: "after" }
    );

    if (!result) {
      return NextResponse.json({ message: "Member not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Member removed" });
  } catch (error) {
    console.error("DELETE /api/team failed:", error);
    return NextResponse.json(
      { message: error?.message || "Failed to delete member" },
      { status: 500 }
    );
  }
}
