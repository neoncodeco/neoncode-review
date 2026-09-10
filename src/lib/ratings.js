export function ratingLabel(r) {
  const n = Number(r);
  if (n >= 1 && n <= 3) return "Very Bad";
  if (n === 4) return "Bad";
  if (n >= 5 && n <= 6) return "Average";
  if (n >= 7 && n <= 8) return "Good";
  if (n >= 9 && n <= 10) return "Very Good";
  return "";
}

export function calcAverage(behavior, quality, communication, timeManagement) {
  const avg =
    (Number(behavior) +
      Number(quality) +
      Number(communication) +
      Number(timeManagement)) /
    4;
  return Number(avg.toFixed(1));
}

export function isValidScore(n) {
  return Number.isFinite(n) && n >= 1 && n <= 10;
}

/** Aggregate approved reviews into per-member stats */
export function buildMemberStats(reviews) {
  const map = {};
  for (const r of reviews) {
    const key = r.employeeId || r.designer;
    if (!key) continue;
    if (!map[key]) {
      map[key] = {
        key,
        name: r.designer,
        designation: r.designation || "",
        sum: 0,
        count: 0,
        behaviorSum: 0,
        qualitySum: 0,
        communicationSum: 0,
        timeSum: 0,
      };
    }
    const row = map[key];
    row.name = r.designer || row.name;
    row.designation = r.designation || row.designation;
    row.sum += Number(r.averageRating) || 0;
    row.count += 1;
    row.behaviorSum += Number(r.behavior) || 0;
    row.qualitySum += Number(r.quality) || 0;
    row.communicationSum += Number(r.communication) || 0;
    row.timeSum += Number(r.timeManagement) || 0;
  }

  const out = {};
  for (const [key, v] of Object.entries(map)) {
    out[key] = {
      name: v.name,
      designation: v.designation,
      count: v.count,
      average: v.count ? Number((v.sum / v.count).toFixed(1)) : 0,
      behavior: v.count ? Number((v.behaviorSum / v.count).toFixed(1)) : 0,
      quality: v.count ? Number((v.qualitySum / v.count).toFixed(1)) : 0,
      communication: v.count
        ? Number((v.communicationSum / v.count).toFixed(1))
        : 0,
      timeManagement: v.count ? Number((v.timeSum / v.count).toFixed(1)) : 0,
    };
  }
  return out;
}

export function serializeReview(r) {
  return {
    ...r,
    _id: r._id?.toString?.() ?? r._id,
    createdAt: r.createdAt ? new Date(r.createdAt).toISOString() : null,
    reviewedAt: r.reviewedAt ? new Date(r.reviewedAt).toISOString() : null,
  };
}
