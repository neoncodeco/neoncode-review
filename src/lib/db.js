import clientPromise from "@/lib/mongodb";

export async function getDb() {
  const client = await clientPromise;
  return client.db("designerReviewDB");
}

export async function usersCol() {
  const db = await getDb();
  return db.collection("appUsers");
}

export async function reviewsCol() {
  const db = await getDb();
  return db.collection("reviews");
}

export async function teamCol() {
  const db = await getDb();
  return db.collection("teamMembers");
}
