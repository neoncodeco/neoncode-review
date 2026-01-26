"use client";
import { useEffect, useState } from "react";

export default function DashboardPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/review", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => setReviews(data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center font-black animate-pulse text-indigo-600 uppercase tracking-widest">
        Loading dashboard...
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-neutral-900 p-4 sm:p-8 transition-colors">
      <div className="max-w-7xl mx-auto">

        {/* ================= HEADER ================= */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-gray-900 dark:text-gray-100">
            📊 Designer <span className="text-indigo-600">Reviews</span>
          </h1>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">
            Feedback Management
          </p>
        </div>

        {reviews.length === 0 ? (
          <div className="p-10 text-center bg-white dark:bg-neutral-800 rounded-3xl border-2 border-dashed border-gray-200 dark:border-neutral-700">
            <p className="opacity-70 font-bold uppercase text-sm text-gray-700 dark:text-gray-300">
              No reviews found
            </p>
          </div>
        ) : (
          <>
            {/* ================= DESKTOP TABLE ================= */}
            <div className="hidden md:block overflow-hidden rounded-[24px] border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 shadow-sm">
              <table className="w-full text-sm">
                <thead className="bg-gray-900 dark:bg-black text-white text-[10px] uppercase tracking-widest">
                  <tr>
                    <th className="p-4">Designer</th>
                    <th className="p-4">Behavior</th>
                    <th className="p-4">Quality</th>
                    <th className="p-4">Communication</th>
                    <th className="p-4">Time</th>
                    <th className="p-4">Average</th>
                    <th className="p-4">Phone</th>
                    <th className="p-4">Comment</th>
                    <th className="p-4 text-right">Date</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100 dark:divide-neutral-700">
                  {reviews.map((r) => (
                    <tr
                      key={r._id}
                      className="hover:bg-indigo-50/40 dark:hover:bg-neutral-700/40 transition-colors"
                    >
                      <td className="p-4 font-black uppercase text-gray-900 dark:text-gray-100">
                        {r.designer}
                      </td>

                      <td className="p-4 font-bold">{r.behavior}</td>
                      <td className="p-4 font-bold">{r.quality}</td>
                      <td className="p-4 font-bold">{r.communication}</td>
                      <td className="p-4 font-bold">{r.timeManagement}</td>

                      <td className="p-4">
                        <span className="px-3 py-1 rounded-full text-[10px] font-black bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-200">
                          ⭐ {r.averageRating} ({r.averageLabel})
                        </span>
                      </td>

                      <td className="p-4 font-mono text-gray-600 dark:text-gray-300">
                        {r.phone}
                      </td>

                      <td className="p-4 italic text-gray-600 dark:text-gray-300 max-w-xs truncate">
                        {r.comment || "—"}
                      </td>

                      <td className="p-4 text-right text-[10px] font-bold text-gray-400">
                        {new Date(r.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* ================= MOBILE VIEW ================= */}
            <div className="grid grid-cols-1 gap-4 md:hidden">
              {reviews.map((r) => (
                <div
                  key={r._id}
                  className="bg-white dark:bg-neutral-800 p-5 rounded-[24px] border border-gray-200 dark:border-neutral-700 shadow-sm transition-colors"
                >
                  <div className="flex justify-between mb-3">
                    <div>
                      <h3 className="font-black uppercase text-gray-900 dark:text-gray-100">
                        {r.designer}
                      </h3>
                      <p className="text-[11px] font-bold text-indigo-500">
                        {r.phone}
                      </p>
                    </div>
                    <span className="bg-indigo-600 text-white text-xs font-black px-3 py-1 rounded-xl">
                      ⭐ {r.averageRating}
                    </span>
                  </div>

                  {/* Rating grid */}
                  <div className="grid grid-cols-2 gap-2 text-xs font-bold mb-3 text-gray-700 dark:text-gray-300">
                    <p>🧑‍💼 Behavior: {r.behavior}</p>
                    <p>🎯 Quality: {r.quality}</p>
                    <p>💬 Communication: {r.communication}</p>
                    <p>⏱ Time: {r.timeManagement}</p>
                  </div>

                  <p className="italic text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-neutral-700 p-3 rounded-xl">
                    "{r.comment || "No comment"}"
                  </p>

                  <p className="mt-3 text-[10px] text-right font-bold text-gray-400">
                    {new Date(r.createdAt).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
