"use client";

import { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";

export default function DashboardPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      const res = await fetch("/api/review", {
        cache: "no-store",
      });
      const data = await res.json();
      console.log("Dashboard data:", data);
      setReviews(data);
      setLoading(false);
    };

    fetchReviews();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading dashboard...
      </div>
    );
  }

  return (
    <>

      <main className="p-6">
        <h1 className="text-3xl font-bold mb-6">
          📊 Designer Reviews Dashboard
        </h1>

        {reviews.length === 0 ? (
          <p className="opacity-70">No reviews found</p>
        ) : (
          <div className="overflow-x-auto rounded-xl border">
            <table className="w-full text-sm">
              <thead className="bg-neutral-100 dark:bg-neutral-800">
                <tr>
                  <th className="p-3 text-left">Designer</th>
                  <th className="p-3 text-left">Rating</th>
                  <th className="p-3 text-left">Phone</th>
                  <th className="p-3 text-left">Comment</th>
                  <th className="p-3 text-left">Date</th>
                </tr>
              </thead>

              <tbody>
                {reviews.map((r) => {
                  const rating = Number(r.rating);

                  return (
                    <tr
                      key={r._id}
                      className="border-t hover:bg-neutral-50 dark:hover:bg-neutral-900"
                    >
                      <td className="p-3 font-semibold">
                        {r.designer}
                      </td>

                      <td className="p-3">
                        <span
                          className={`px-2 py-1 rounded text-xs font-bold ${
                            rating >= 8
                              ? "bg-green-500 text-white"
                              : rating >= 6
                              ? "bg-yellow-400 text-black"
                              : "bg-red-500 text-white"
                          }`}
                        >
                          ⭐ {rating}/10
                        </span>
                      </td>

                      <td className="p-3">{r.phone}</td>

                      <td className="p-3 max-w-xs truncate">
                        {r.comment || "—"}
                      </td>

                      <td className="p-3 text-xs opacity-70">
                        {new Date(r.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </>
  );
}
