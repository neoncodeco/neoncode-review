import { NextResponse } from "next/server";
import { reviewsCol, teamCol, usersCol } from "@/lib/db";
import { buildMemberStats } from "@/lib/ratings";

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

    const [rcol, tcol, ucol] = await Promise.all([
      reviewsCol(),
      teamCol(),
      usersCol(),
    ]);

    const allReviews = await rcol.find({}).toArray();
    const approved = allReviews.filter(
      (r) => !r.status || r.status === "approved"
    );
    const pending = allReviews.filter((r) => r.status === "pending");
    const rejected = allReviews.filter((r) => r.status === "rejected");

    const members = await tcol
      .find({ active: { $ne: false } })
      .sort({ designation: 1, name: 1 })
      .toArray();

    const users = await ucol.countDocuments({ active: { $ne: false } });
    const statsByKey = buildMemberStats(approved);

    const profiles = members.map((m) => {
      const byId = statsByKey[m.id] || statsByKey[m.name];
      const avg = byId?.average ?? 0;
      const count = byId?.count ?? 0;
      return {
        _id: m._id?.toString?.() ?? m._id,
        id: m.id,
        name: m.name,
        designation: m.designation,
        image: m.image || "",
        average: avg,
        reviewCount: count,
        behavior: byId?.behavior ?? 0,
        quality: byId?.quality ?? 0,
        communication: byId?.communication ?? 0,
        timeManagement: byId?.timeManagement ?? 0,
      };
    });

    const overallAvg = approved.length
      ? Number(
          (
            approved.reduce((s, r) => s + (Number(r.averageRating) || 0), 0) /
            approved.length
          ).toFixed(1)
        )
      : 0;

    const byRole = {};
    for (const p of profiles) {
      const role = p.designation || "Other";
      if (!byRole[role]) byRole[role] = { count: 0, avgSum: 0, rated: 0 };
      byRole[role].count += 1;
      if (p.reviewCount > 0) {
        byRole[role].avgSum += p.average;
        byRole[role].rated += 1;
      }
    }

    const roleBreakdown = Object.entries(byRole).map(([role, v]) => ({
      role,
      members: v.count,
      average: v.rated ? Number((v.avgSum / v.rated).toFixed(1)) : 0,
    }));

    return NextResponse.json({
      totals: {
        reviews: allReviews.length,
        pending: pending.length,
        approved: approved.length,
        rejected: rejected.length,
        members: members.length,
        users,
        overallAverage: overallAvg,
      },
      roleBreakdown,
      profiles: profiles.sort((a, b) => b.average - a.average),
      recentPending: pending
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5)
        .map((r) => ({
          _id: r._id?.toString?.() ?? r._id,
          designer: r.designer,
          name: r.name,
          averageRating: r.averageRating,
          createdAt: r.createdAt
            ? new Date(r.createdAt).toISOString()
            : null,
        })),
    });
  } catch (error) {
    console.error("GET /api/admin/stats failed:", error);
    return NextResponse.json(
      { message: error?.message || "Server error" },
      { status: 500 }
    );
  }
}
