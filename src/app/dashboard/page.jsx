"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/auth";
import TeamManager from "@/components/TeamManager";

export default function DashboardPage() {
  const router = useRouter();
  const [tab, setTab] = useState("reviews");
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.replace("/admin");
        return;
      }
      setAuthChecked(true);
    });
    return () => unsub();
  }, [router]);

  useEffect(() => {
    if (!authChecked || tab !== "reviews") return;

    const loadReviews = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch("/api/review", { cache: "no-store" });
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || "API failed");
        }

        setReviews(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Dashboard fetch error:", err);
        setError(err.message || "Failed to load reviews");
        setReviews([]);
      } finally {
        setLoading(false);
      }
    };

    loadReviews();
  }, [authChecked, tab]);

  if (!authChecked) {
    return (
      <div className="min-h-[calc(100vh-65px)] flex items-center justify-center bg-[var(--background)]">
        <p className="text-sm font-medium text-[var(--brand-dark)] animate-pulse">
          Loading dashboard...
        </p>
      </div>
    );
  }

  return (
    <main className="min-h-[calc(100vh-65px)] bg-[var(--background)] p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-zinc-900">
              NeonCode <span className="text-[var(--brand-dark)]">Admin</span>
            </h1>
            <p className="mt-1 text-sm text-zinc-500">
              Manage team profiles and view review submissions.
            </p>
          </div>

          <div className="flex gap-1.5 rounded-full bg-white p-1 ring-1 ring-zinc-200 w-fit">
            <button
              type="button"
              onClick={() => setTab("reviews")}
              className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
                tab === "reviews"
                  ? "bg-[var(--brand-dark)] text-[var(--brand)]"
                  : "text-zinc-600 hover:bg-zinc-50"
              }`}
            >
              Reviews
            </button>
            <button
              type="button"
              onClick={() => setTab("team")}
              className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
                tab === "team"
                  ? "bg-[var(--brand-dark)] text-[var(--brand)]"
                  : "text-zinc-600 hover:bg-zinc-50"
              }`}
            >
              Team &amp; Photos
            </button>
          </div>
        </div>

        {tab === "team" ? (
          <TeamManager />
        ) : (
          <>
            <div className="mb-4 flex justify-end">
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                {reviews.length} review{reviews.length === 1 ? "" : "s"}
              </p>
            </div>

            {loading ? (
              <p className="text-sm text-zinc-500 animate-pulse">
                Loading reviews…
              </p>
            ) : (
              <>
                {error && (
                  <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                    {error}
                  </div>
                )}

                {reviews.length === 0 && !error ? (
                  <div className="rounded-[20px] border border-dashed border-zinc-200 bg-white p-10 text-center">
                    <p className="text-sm font-medium text-zinc-600">
                      No reviews found yet
                    </p>
                    <p className="mt-1 text-xs text-zinc-400">
                      Submit a review from the home page to see it here.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="hidden md:block overflow-x-auto rounded-[20px] border border-zinc-200 bg-white shadow-sm">
                      <table className="w-full text-sm">
                        <thead className="bg-zinc-900 text-white text-[10px] uppercase tracking-widest">
                          <tr>
                            <th className="p-4 text-left">Member</th>
                            <th className="p-4 text-left">Role</th>
                            <th className="p-4 text-left">Client</th>
                            <th className="p-4 text-left">Business / FB</th>
                            <th className="p-4 text-left">Behavior</th>
                            <th className="p-4 text-left">Quality</th>
                            <th className="p-4 text-left">Comm.</th>
                            <th className="p-4 text-left">Time</th>
                            <th className="p-4 text-left">Average</th>
                            <th className="p-4 text-left">Phone</th>
                            <th className="p-4 text-left">Comment</th>
                            <th className="p-4 text-right">Date</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100">
                          {reviews.map((r) => (
                            <tr
                              key={r._id}
                              className="hover:bg-[var(--brand-muted)]/40 transition-colors"
                            >
                              <td className="p-4 font-semibold uppercase text-zinc-900">
                                {r.designer}
                              </td>
                              <td className="p-4 text-zinc-600">
                                {r.designation || "—"}
                              </td>
                              <td className="p-4 font-medium text-zinc-800">
                                {r.name || "—"}
                              </td>
                              <td className="p-4 text-zinc-600 max-w-[140px] truncate">
                                {r.businessName || "—"}
                              </td>
                              <td className="p-4 font-semibold tabular-nums">
                                {r.behavior}
                              </td>
                              <td className="p-4 font-semibold tabular-nums">
                                {r.quality}
                              </td>
                              <td className="p-4 font-semibold tabular-nums">
                                {r.communication}
                              </td>
                              <td className="p-4 font-semibold tabular-nums">
                                {r.timeManagement}
                              </td>
                              <td className="p-4">
                                <span className="inline-flex rounded-full bg-[var(--brand-muted)] px-2.5 py-1 text-[11px] font-semibold text-[var(--brand-dark)] ring-1 ring-[var(--brand)]/30">
                                  {r.averageRating} · {r.averageLabel}
                                </span>
                              </td>
                              <td className="p-4 font-mono text-xs text-zinc-600">
                                {r.phone}
                              </td>
                              <td className="p-4 italic text-zinc-500 max-w-xs truncate">
                                {r.comment || "—"}
                              </td>
                              <td className="p-4 text-right text-[11px] font-medium text-zinc-400">
                                {r.createdAt
                                  ? new Date(r.createdAt).toLocaleDateString()
                                  : "—"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:hidden">
                      {reviews.map((r) => (
                        <div
                          key={r._id}
                          className="rounded-[20px] border border-zinc-200 bg-white p-5 shadow-sm"
                        >
                          <div className="flex justify-between gap-3 mb-3">
                            <div className="min-w-0">
                              <h3 className="font-semibold uppercase text-zinc-900">
                                {r.designer}
                              </h3>
                              <p className="text-xs font-medium text-zinc-500">
                                {r.designation || "Team member"}
                              </p>
                              <p className="text-sm font-medium text-zinc-700">
                                {r.name || "—"}
                              </p>
                              <p className="text-xs font-medium text-[var(--brand-dark)] truncate">
                                {r.businessName || "No business name"}
                              </p>
                              <p className="text-xs text-zinc-400">{r.phone}</p>
                            </div>
                            <span className="shrink-0 h-fit rounded-xl bg-[var(--brand-dark)] px-3 py-1 text-xs font-semibold text-[var(--brand)]">
                              {r.averageRating}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-xs font-medium text-zinc-600 mb-3">
                            <p>Behavior: {r.behavior}</p>
                            <p>Quality: {r.quality}</p>
                            <p>Communication: {r.communication}</p>
                            <p>Time: {r.timeManagement}</p>
                          </div>

                          <p className="text-sm italic text-zinc-600 bg-zinc-50 p-3 rounded-xl">
                            {r.comment || "No comment"}
                          </p>

                          <p className="mt-3 text-[10px] text-right font-medium text-zinc-400">
                            {r.createdAt
                              ? new Date(r.createdAt).toLocaleString()
                              : "—"}
                          </p>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </>
            )}
          </>
        )}
      </div>
    </main>
  );
}
