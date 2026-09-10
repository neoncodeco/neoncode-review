"use client";

import { useEffect, useMemo, useState } from "react";
import { DESIGNATION_OPTIONS } from "@/data/team";

function StatCard({ label, value, hint }) {
  return (
    <div className="min-w-0 rounded-[16px] border border-zinc-200 bg-white p-3.5 shadow-sm sm:rounded-[20px] sm:p-5">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 sm:text-[11px]">
        {label}
      </p>
      <p className="mt-1.5 text-2xl font-semibold tabular-nums text-[var(--brand-dark)] sm:mt-2 sm:text-3xl">
        {value}
      </p>
      {hint ? (
        <p className="mt-1 text-[11px] leading-snug text-zinc-500 sm:text-xs">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export function AnalyticsPanel({ adminUid, onGotoReviews }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(
        `/api/admin/stats?adminUid=${encodeURIComponent(adminUid)}`,
        { cache: "no-store" }
      );
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Failed to load stats");
      setData(json);
    } catch (err) {
      setError(err.message);
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (adminUid) load();
  }, [adminUid]);

  if (loading) {
    return <p className="text-sm text-zinc-500 animate-pulse">Loading analytics…</p>;
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
        {error}
      </div>
    );
  }

  if (!data) return null;

  const t = data.totals;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 gap-2.5 sm:gap-3 lg:grid-cols-4">
        <StatCard label="Pending" value={t.pending} hint="Need approval" />
        <StatCard label="Approved" value={t.approved} hint="Live on profiles" />
        <StatCard
          label="Team avg"
          value={t.overallAverage || "—"}
          hint="All approved ratings"
        />
        <StatCard label="Members" value={t.members} hint={`${t.users} app users`} />
      </div>

      {t.pending > 0 && (
        <div className="rounded-[20px] border border-amber-200 bg-amber-50/80 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-semibold text-amber-900">
                {t.pending} review{t.pending === 1 ? "" : "s"} waiting
              </p>
              <p className="text-sm text-amber-800/80">
                Approve to add them to member profile averages.
              </p>
            </div>
            <button
              type="button"
              onClick={onGotoReviews}
              className="rounded-xl bg-[var(--brand-dark)] px-4 py-2 text-xs font-semibold text-[var(--brand)]"
            >
              Review queue
            </button>
          </div>
        </div>
      )}

      <section>
        <h3 className="mb-3 text-sm font-semibold text-[var(--brand-dark)]">
          Profile scores (auto-calculated)
        </h3>
        <p className="mb-4 text-xs text-zinc-500">
          Example: ratings 8, 9, 7 → average{" "}
          <span className="font-semibold text-[var(--brand-dark)]">8.0</span>{" "}
          on that member&apos;s profile after approval.
        </p>
        <ul className="grid grid-cols-1 gap-3 min-[480px]:grid-cols-2 xl:grid-cols-3">
          {data.profiles.map((p) => (
            <li
              key={p._id}
              className="overflow-hidden rounded-[20px] border border-zinc-200 bg-white shadow-sm"
            >
              <div className="flex gap-3 p-4">
                <div className="h-14 w-14 shrink-0 overflow-hidden rounded-2xl bg-[var(--brand-dark)]">
                  {p.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={p.image}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center text-xs font-semibold text-[var(--brand)]">
                      {(p.name || "?").slice(0, 2).toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-[var(--brand-dark)]">
                    {p.name}
                  </p>
                  <p className="text-xs text-zinc-500">{p.designation}</p>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-2xl font-semibold tabular-nums text-[var(--brand-dark)]">
                      {p.reviewCount ? p.average.toFixed(1) : "—"}
                    </span>
                    <span className="text-[11px] text-zinc-400">
                      {p.reviewCount} approved
                    </span>
                  </div>
                </div>
              </div>
              {p.reviewCount > 0 && (
                <div className="grid grid-cols-4 gap-1 border-t border-zinc-100 bg-zinc-50/80 px-3 py-2 text-center text-[10px] font-medium text-zinc-600">
                  <span>B {p.behavior}</span>
                  <span>Q {p.quality}</span>
                  <span>C {p.communication}</span>
                  <span>T {p.timeManagement}</span>
                </div>
              )}
            </li>
          ))}
        </ul>
      </section>

      {data.roleBreakdown?.length > 0 && (
        <section>
          <h3 className="mb-3 text-sm font-semibold text-[var(--brand-dark)]">
            By role
          </h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {data.roleBreakdown.map((r) => (
              <div
                key={r.role}
                className="rounded-2xl border border-zinc-200 bg-white px-4 py-3"
              >
                <p className="text-xs font-medium text-zinc-500">{r.role}</p>
                <p className="mt-1 text-lg font-semibold text-[var(--brand-dark)]">
                  {r.average || "—"}{" "}
                  <span className="text-xs font-normal text-zinc-400">
                    · {r.members} people
                  </span>
                </p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export function ReviewsModerator({ adminUid }) {
  const [reviews, setReviews] = useState([]);
  const [filter, setFilter] = useState("pending");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const q = new URLSearchParams({
        scope: "admin",
        adminUid,
      });
      if (filter !== "all") q.set("status", filter);
      const res = await fetch(`/api/review?${q}`, { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed");
      setReviews(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (adminUid) load();
  }, [adminUid, filter]);

  const setStatus = async (id, status) => {
    setBusyId(id);
    setError("");
    try {
      const res = await fetch("/api/review", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminUid, id, status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Update failed");
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId("");
    }
  };

  return (
    <div className="space-y-4">
      <div className="nc-scroll-x w-full max-w-full rounded-full bg-white p-1 ring-1 ring-zinc-200">
        {["pending", "approved", "rejected", "all"].map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`nc-tab-chip rounded-full px-3.5 py-1.5 text-xs font-semibold capitalize ${
              filter === f
                ? "bg-[var(--brand-dark)] text-[var(--brand)]"
                : "text-zinc-600 hover:bg-zinc-50"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {error && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
          {error}
        </p>
      )}

      {loading ? (
        <p className="text-sm text-zinc-500 animate-pulse">Loading…</p>
      ) : reviews.length === 0 ? (
        <div className="rounded-[20px] border border-dashed border-zinc-200 bg-white p-8 text-center text-sm text-zinc-500">
          No {filter === "all" ? "" : filter + " "}reviews.
        </div>
      ) : (
        <ul className="space-y-3">
          {reviews.map((r) => (
            <li
              key={r._id}
              className="rounded-[20px] border border-zinc-200 bg-white p-4 sm:p-5 shadow-sm"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-[var(--brand-dark)]">
                      {r.designer}
                    </h3>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${
                        r.status === "approved"
                          ? "bg-emerald-50 text-emerald-700"
                          : r.status === "rejected"
                            ? "bg-red-50 text-red-600"
                            : "bg-amber-50 text-amber-800"
                      }`}
                    >
                      {r.status || "approved"}
                    </span>
                    {r.source === "manual" && (
                      <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-semibold text-zinc-600">
                        Manual
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-500">
                    {r.designation || "—"} · Client: {r.name} ·{" "}
                    {r.businessName}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-3 text-xs font-medium text-zinc-600">
                    <span>B {r.behavior}</span>
                    <span>Q {r.quality}</span>
                    <span>C {r.communication}</span>
                    <span>T {r.timeManagement}</span>
                    <span className="font-semibold text-[var(--brand-dark)]">
                      Avg {r.averageRating}
                    </span>
                  </div>
                  {r.comment ? (
                    <p className="mt-2 text-sm italic text-zinc-600">{r.comment}</p>
                  ) : null}
                </div>
                <div className="flex shrink-0 gap-2">
                  {r.status !== "approved" && (
                    <button
                      type="button"
                      disabled={busyId === r._id}
                      onClick={() => setStatus(r._id, "approved")}
                      className="rounded-lg bg-[var(--brand)] px-3 py-2 text-xs font-semibold text-[var(--brand-dark)] disabled:opacity-50"
                    >
                      Approve
                    </button>
                  )}
                  {r.status !== "rejected" && (
                    <button
                      type="button"
                      disabled={busyId === r._id}
                      onClick={() => setStatus(r._id, "rejected")}
                      className="rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 disabled:opacity-50"
                    >
                      Reject
                    </button>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function ManualRatingPanel({ adminUid, members }) {
  const [form, setForm] = useState({
    employeeId: "",
    behavior: 8,
    quality: 8,
    communication: 8,
    timeManagement: 8,
    comment: "",
    name: "Admin (manual)",
  });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  const selected = useMemo(
    () => members.find((m) => m.id === form.employeeId || m._id === form.employeeId),
    [members, form.employeeId]
  );

  const submit = async (e) => {
    e.preventDefault();
    if (!selected) {
      setError("Select a team member");
      return;
    }
    setSaving(true);
    setError("");
    setMsg("");
    try {
      const res = await fetch("/api/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source: "manual",
          adminUid,
          name: form.name,
          phone: "—",
          businessName: "Manual admin rating",
          designer: selected.name,
          designation: selected.designation,
          employeeId: selected.id || selected._id,
          behavior: Number(form.behavior),
          quality: Number(form.quality),
          communication: Number(form.communication),
          timeManagement: Number(form.timeManagement),
          comment: form.comment,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed");
      setMsg("Manual rating saved and counted on profile.");
      setForm((p) => ({ ...p, comment: "" }));
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form
      onSubmit={submit}
      className="w-full max-w-xl space-y-4 rounded-[16px] border border-zinc-200 bg-white p-4 shadow-sm sm:rounded-[20px] sm:p-5 md:p-6"
    >
      <div>
        <h3 className="text-sm font-semibold text-[var(--brand-dark)]">
          Manual rating
        </h3>
        <p className="mt-1 text-xs text-zinc-500">
          Instantly approved and added to that member&apos;s average.
        </p>
      </div>

      <select
        required
        value={form.employeeId}
        onChange={(e) => setForm({ ...form, employeeId: e.target.value })}
        className="w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-sm"
      >
        <option value="">Select member…</option>
        {members.map((m) => (
          <option key={m._id || m.id} value={m.id || m._id}>
            {m.name} — {m.designation}
          </option>
        ))}
      </select>

      <div className="grid grid-cols-2 gap-3">
        {["behavior", "quality", "communication", "timeManagement"].map(
          (field) => (
            <label key={field} className="text-xs font-medium text-zinc-600">
              <span className="capitalize">
                {field === "timeManagement" ? "Time" : field}
              </span>
              <input
                type="number"
                min={1}
                max={10}
                value={form[field]}
                onChange={(e) =>
                  setForm({ ...form, [field]: Number(e.target.value) })
                }
                className="mt-1 w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm"
              />
            </label>
          )
        )}
      </div>

      <textarea
        value={form.comment}
        onChange={(e) => setForm({ ...form, comment: e.target.value })}
        placeholder="Optional note"
        rows={3}
        className="w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-sm"
      />

      {error && <p className="text-sm text-red-600">{error}</p>}
      {msg && <p className="text-sm text-[var(--brand-dark)]">{msg}</p>}

      <button
        type="submit"
        disabled={saving}
        className="rounded-xl bg-[var(--brand)] px-5 py-2.5 text-sm font-semibold text-[var(--brand-dark)] disabled:opacity-50"
      >
        {saving ? "Saving…" : "Save rating"}
      </button>
    </form>
  );
}

export function UserCreatePanel({ adminUid }) {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "member",
    designation: "Designer",
    linkTeam: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/admin/users?adminUid=${encodeURIComponent(adminUid)}`,
        { cache: "no-store" }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed");
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (adminUid) load();
  }, [adminUid]);

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setOk("");
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, adminUid }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Create failed");
      setOk(`Created ${form.email}`);
      setForm((p) => ({ ...p, name: "", email: "", password: "" }));
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <form
        onSubmit={submit}
        className="w-full max-w-xl space-y-3 rounded-[16px] border border-zinc-200 bg-white p-4 shadow-sm sm:rounded-[20px] sm:p-5 md:p-6"
      >
        <div>
          <h3 className="text-sm font-semibold text-[var(--brand-dark)]">
            Create user
          </h3>
          <p className="mt-1 text-xs text-zinc-500">
            Creates email/password login in the database (stays signed in as admin).
          </p>
        </div>
        <input
          required
          placeholder="Full name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-sm"
        />
        <input
          required
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-sm"
        />
        <input
          required
          type="password"
          minLength={6}
          placeholder="Temp password (min 6)"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          className="w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-sm"
        />
        <div className="grid grid-cols-2 gap-3">
          <select
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
            className="rounded-xl border border-zinc-200 px-3.5 py-2.5 text-sm"
          >
            <option value="member">Member</option>
            <option value="admin">Admin</option>
          </select>
          <select
            value={form.designation}
            onChange={(e) => setForm({ ...form, designation: e.target.value })}
            className="rounded-xl border border-zinc-200 px-3.5 py-2.5 text-sm"
          >
            {DESIGNATION_OPTIONS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
        <label className="flex items-center gap-2 text-xs text-zinc-600">
          <input
            type="checkbox"
            checked={form.linkTeam}
            onChange={(e) => setForm({ ...form, linkTeam: e.target.checked })}
          />
          Also add to public review team list
        </label>
        {error && <p className="text-sm text-red-600">{error}</p>}
        {ok && <p className="text-sm text-[var(--brand-dark)]">{ok}</p>}
        <button
          type="submit"
          disabled={saving}
          className="rounded-xl bg-[var(--brand)] px-5 py-2.5 text-sm font-semibold text-[var(--brand-dark)] disabled:opacity-50"
        >
          {saving ? "Creating…" : "Create user"}
        </button>
      </form>

      <div>
        <h3 className="mb-3 text-sm font-semibold text-[var(--brand-dark)]">
          App users
        </h3>
        {loading ? (
          <p className="text-sm text-zinc-500">Loading…</p>
        ) : (
          <ul className="divide-y divide-zinc-100 rounded-[20px] border border-zinc-200 bg-white overflow-hidden">
            {users.map((u) => (
              <li
                key={u.uid || u._id}
                className="flex items-center justify-between gap-3 px-4 py-3"
              >
                <div>
                  <p className="font-medium text-[var(--brand-dark)]">
                    {u.name || u.email}
                  </p>
                  <p className="text-xs text-zinc-500">{u.email}</p>
                </div>
                <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-[10px] font-semibold uppercase text-zinc-600">
                  {u.role}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
