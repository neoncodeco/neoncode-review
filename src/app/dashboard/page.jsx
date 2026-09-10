"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import TeamManager from "@/components/TeamManager";
import {
  AnalyticsPanel,
  ReviewsModerator,
  ManualRatingPanel,
  UserCreatePanel,
} from "@/components/AdminPanels";

const TABS = [
  { id: "overview", label: "Analytics" },
  { id: "reviews", label: "Approvals" },
  { id: "manual", label: "Manual rating" },
  { id: "team", label: "Profiles" },
  { id: "users", label: "Users" },
];

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [tab, setTab] = useState("overview");
  const [members, setMembers] = useState([]);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace("/admin");
      return;
    }
    if (user.role !== "admin") {
      return;
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (!user?.uid || user.role !== "admin") return;
    (async () => {
      try {
        const res = await fetch("/api/team", { cache: "no-store" });
        const data = await res.json();
        if (res.ok && Array.isArray(data)) setMembers(data);
      } catch {
        /* ignore */
      }
    })();
  }, [user, tab]);

  if (authLoading) {
    return (
      <div className="min-h-[calc(100vh-65px)] flex items-center justify-center bg-[var(--background)]">
        <p className="text-sm font-medium text-[var(--brand-dark)] animate-pulse">
          Loading dashboard...
        </p>
      </div>
    );
  }

  if (!user) return null;

  if (user.role !== "admin") {
    return (
      <main className="min-h-[calc(100vh-65px)] bg-[var(--background)] p-6 flex items-center justify-center">
        <div className="max-w-md rounded-[24px] border border-amber-200 bg-white p-6 text-center shadow-sm">
          <h1 className="text-lg font-semibold text-[var(--brand-dark)]">
            Admin access required
          </h1>
          <p className="mt-2 text-sm text-zinc-600">
            This account is not an admin. Register with the master key.
          </p>
          <a
            href="/register"
            className="mt-4 inline-block rounded-xl bg-[var(--brand)] px-4 py-2 text-sm font-semibold text-[var(--brand-dark)]"
          >
            Register with master key
          </a>
        </div>
      </main>
    );
  }

  const adminUid = user.uid;
  const adminName = user.name || user.email || "Admin";

  return (
    <main className="min-h-[calc(100vh-57px)] overflow-x-hidden bg-[var(--background)] p-3 pb-10 sm:min-h-[calc(100vh-65px)] sm:p-6 sm:pb-12 lg:p-8">
      <div className="mx-auto w-full max-w-7xl min-w-0">
        <div className="mb-5 flex flex-col gap-4 sm:mb-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <p className="truncate text-[10px] font-semibold uppercase tracking-wider text-zinc-400 sm:text-xs">
              Signed in as {adminName}
            </p>
            <h1 className="text-xl font-semibold tracking-tight text-zinc-900 sm:text-2xl lg:text-3xl">
              NeonCode <span className="text-[var(--brand-dark)]">Admin</span>
            </h1>
            <p className="mt-1 text-xs text-zinc-500 sm:text-sm">
              Analytics, approve ratings, profiles, manual scores &amp; users.
            </p>
          </div>

          <div className="nc-scroll-x w-full max-w-full rounded-full bg-white p-1 ring-1 ring-zinc-200 lg:w-fit">
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={`nc-tab-chip rounded-full px-3 py-2 text-[11px] font-semibold transition sm:px-3.5 sm:text-xs ${
                  tab === t.id
                    ? "bg-[var(--brand-dark)] text-[var(--brand)]"
                    : "text-zinc-600 hover:bg-zinc-50"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="min-w-0">
          {tab === "overview" && (
            <AnalyticsPanel
              adminUid={adminUid}
              onGotoReviews={() => setTab("reviews")}
            />
          )}
          {tab === "reviews" && <ReviewsModerator adminUid={adminUid} />}
          {tab === "manual" && (
            <ManualRatingPanel adminUid={adminUid} members={members} />
          )}
          {tab === "team" && <TeamManager />}
          {tab === "users" && <UserCreatePanel adminUid={adminUid} />}
        </div>
      </div>
    </main>
  );
}
