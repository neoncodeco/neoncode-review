"use client";

import { useEffect, useId, useMemo, useState } from "react";
import { TEAM_ROLES, TEAM_SEED, slugify } from "@/data/team";

const COMMENT_MAX = 500;

function buildSeedTeam() {
  return TEAM_SEED.map((m) => ({
    ...m,
    id: slugify(m.name),
    image: m.image || "",
  }));
}

function normalizeMember(m) {
  const seed = TEAM_SEED.find((s) => s.name === m.name);
  let designation = String(m.designation || "").trim();
  if (designation === "Business Development") {
    designation = "Sales Executive";
  }
  if (seed) {
    designation = seed.designation;
  }
  return {
    ...m,
    id: m.id || m._id || slugify(m.name),
    name: m.name,
    designation,
    image: m.image || "",
  };
}

const RATING_CATEGORIES = [
  {
    field: "behavior",
    label: "Behavior",
    description: "Attitude and professionalism",
    icon: "user",
  },
  {
    field: "quality",
    label: "Task Quality",
    description: "Quality of their work",
    icon: "target",
  },
  {
    field: "communication",
    label: "Communication",
    description: "Clarity and responsiveness",
    icon: "chat",
  },
  {
    field: "timeManagement",
    label: "Time Management",
    description: "Deadlines and delivery",
    icon: "clock",
  },
];

const EMPTY_FORM = {
  name: "",
  phone: "",
  businessName: "",
  designer: "",
  designation: "",
  employeeId: "",
  behavior: 0,
  quality: 0,
  communication: 0,
  timeManagement: 0,
  comment: "",
};

const inputClass =
  "review-input w-full rounded-[12px] border border-zinc-200/90 bg-white py-[13px] pl-11 pr-4 text-[14px] text-[var(--brand-dark)] placeholder:text-zinc-400 outline-none transition-all duration-200 hover:border-zinc-300 focus:border-[var(--brand)] focus:ring-[3px] focus:ring-[var(--brand-ring)]";

function ratingText(r) {
  if (r >= 1 && r <= 3) return "Very Bad";
  if (r === 4) return "Bad";
  if (r >= 5 && r <= 6) return "Average";
  if (r >= 7 && r <= 8) return "Good";
  if (r >= 9 && r <= 10) return "Very Good";
  return "";
}

function initials(name) {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function Icon({ name, className = "h-4 w-4" }) {
  const common = {
    className,
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.6,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true,
  };

  switch (name) {
    case "user":
      return (
        <svg viewBox="0 0 24 24" {...common}>
          <path d="M20 21a8 8 0 0 0-16 0" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      );
    case "phone":
      return (
        <svg viewBox="0 0 24 24" {...common}>
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.37 1.9.72 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.35 1.85.59 2.81.72A2 2 0 0 1 22 16.92z" />
        </svg>
      );
    case "building":
      return (
        <svg viewBox="0 0 24 24" {...common}>
          <path d="M3 21h18" />
          <path d="M5 21V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v16" />
          <path d="M15 9h4a2 2 0 0 1 2 2v10" />
          <path d="M9 7h1" />
          <path d="M9 11h1" />
          <path d="M9 15h1" />
        </svg>
      );
    case "target":
      return (
        <svg viewBox="0 0 24 24" {...common}>
          <circle cx="12" cy="12" r="9" />
          <circle cx="12" cy="12" r="5" />
          <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" />
        </svg>
      );
    case "chat":
      return (
        <svg viewBox="0 0 24 24" {...common}>
          <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z" />
        </svg>
      );
    case "clock":
      return (
        <svg viewBox="0 0 24 24" {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 2" />
        </svg>
      );
    case "star":
      return (
        <svg viewBox="0 0 24 24" {...common} fill="currentColor" stroke="none">
          <path d="M12 2.5l2.7 5.5 6 .9-4.4 4.3 1 6-5.3-2.8L6.7 19.2l1-6L3.3 8.9l6-.9L12 2.5z" />
        </svg>
      );
    case "send":
      return (
        <svg viewBox="0 0 24 24" {...common}>
          <path d="M22 2 11 13" />
          <path d="M22 2 15 22l-4-9-9-4 20-7z" />
        </svg>
      );
    case "shield":
      return (
        <svg viewBox="0 0 24 24" {...common}>
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      );
    case "check":
      return (
        <svg viewBox="0 0 24 24" {...common}>
          <path d="M20 6 9 17l-5-5" />
        </svg>
      );
    default:
      return null;
  }
}

function FieldIcon({ name }) {
  return (
    <span className="pointer-events-none absolute left-3.5 top-1/2 z-[1] -translate-y-1/2 text-zinc-400 transition-colors duration-200 group-focus-within:text-[var(--brand-dark)]">
      <Icon name={name} className="h-[17px] w-[17px]" />
    </span>
  );
}

function MemberAvatar({ member, size = "md" }) {
  const [broken, setBroken] = useState(false);
  const sizeClass = size === "lg" ? "h-16 w-16 text-lg" : "h-12 w-12 text-sm";

  if (broken || !member.image) {
    return (
      <span
        className={`flex ${sizeClass} shrink-0 items-center justify-center rounded-2xl bg-[var(--brand-dark)] font-semibold text-[var(--brand)]`}
      >
        {initials(member.name)}
      </span>
    );
  }

  return (
    <span
      className={`relative ${sizeClass} shrink-0 overflow-hidden rounded-2xl bg-[var(--brand-dark)] ring-1 ring-black/5`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={member.image}
        alt={member.name}
        className="h-full w-full object-cover"
        onError={() => setBroken(true)}
      />
    </span>
  );
}

export default function ReviewForm() {
  const formId = useId();
  const [form, setForm] = useState(EMPTY_FORM);
  const [roleFilter, setRoleFilter] = useState("Designer");
  const [team, setTeam] = useState(buildSeedTeam);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch("/api/team", { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        if (!alive || !Array.isArray(data) || data.length === 0) return;
        setTeam(data.map(normalizeMember));
      } catch {
        /* keep seed fallback */
      }
    })();
    return () => {
      alive = false;
    };
  }, [submitted]);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch("/api/review?scope=public", {
          cache: "no-store",
        });
        if (!res.ok) return;
        const data = await res.json();
        if (!alive || !Array.isArray(data)) return;

        // Only approved ratings (API already filters) → auto average
        const map = {};
        for (const r of data) {
          const key = r.employeeId || r.designer;
          if (!key) continue;
          if (!map[key]) map[key] = { sum: 0, count: 0, name: r.designer };
          map[key].sum += Number(r.averageRating) || 0;
          map[key].count += 1;
        }
        const next = {};
        for (const [key, v] of Object.entries(map)) {
          next[key] = {
            average: (v.sum / v.count).toFixed(1),
            count: v.count,
          };
          if (v.name) next[v.name] = next[key];
        }
        setStats(next);
      } catch {
        /* ignore */
      }
    })();
    return () => {
      alive = false;
    };
  }, [submitted]);

  const filteredMembers = useMemo(() => {
    if (!roleFilter) return [];
    return team.filter((m) => m.designation === roleFilter);
  }, [roleFilter, team]);

  const selectedMember = useMemo(
    () => team.find((m) => m.id === form.employeeId) || null,
    [form.employeeId, team]
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "comment" && value.length > COMMENT_MAX) return;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const setRating = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const selectMember = (member) => {
    setForm((prev) => ({
      ...prev,
      employeeId: member.id,
      designer: member.name,
      designation: member.designation,
    }));
    setError("");
  };

  const averageRating = submitted
    ? (
        (submitted.behavior +
          submitted.quality +
          submitted.communication +
          submitted.timeManagement) /
        4
      ).toFixed(1)
    : null;

  const submitReview = async (e) => {
    e.preventDefault();

    if (!form.employeeId || !form.designer) {
      setError("Please select a team member to review.");
      return;
    }

    if (
      form.behavior < 1 ||
      form.quality < 1 ||
      form.communication < 1 ||
      form.timeManagement < 1
    ) {
      setError("Please rate all categories from 1–10.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setSubmitted({ ...form });
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const startAnotherReview = () => {
    setForm({
      ...EMPTY_FORM,
      // Keep client details — only pick another member + ratings
      name: submitted?.name || "",
      phone: submitted?.phone || "",
      businessName: submitted?.businessName || "",
    });
    setRoleFilter("Designer");
    setSubmitted(null);
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (submitted) {
    const member =
      team.find((m) => m.id === submitted.employeeId) || {
        name: submitted.designer,
        designation: submitted.designation,
        image: null,
      };

    return (
      <div className="review-shell review-fade-in w-full min-w-0 max-w-[640px] mx-auto overflow-hidden rounded-[16px] border border-zinc-200/80 bg-white text-left shadow-[0_20px_50px_-24px_rgba(10,20,10,0.25)] sm:rounded-[22px]">
        <div className="h-1.5 w-full bg-[var(--brand)]" />
        <div className="p-4 sm:p-6 md:p-8">
          <div className="mb-6 flex flex-col items-center text-center sm:mb-7">
            <div className="review-success-pop mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--brand)] text-[var(--brand-dark)] shadow-[0_10px_28px_-10px_rgba(198,255,0,0.7)] sm:h-16 sm:w-16">
              <Icon name="check" className="h-7 w-7" />
            </div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--brand-dark)]/70">
              Confirmed
            </p>
            <h2 className="mt-1.5 text-[1.35rem] font-semibold tracking-tight text-[var(--brand-dark)] sm:text-[1.65rem]">
              Review submitted
            </h2>
            <p className="mt-2 max-w-sm text-[14px] leading-relaxed text-zinc-500">
              Thank you,{" "}
              <span className="font-medium text-zinc-800">{submitted.name}</span>.
              Feedback for{" "}
              <span className="font-medium text-zinc-800">{submitted.designer}</span>{" "}
              is waiting for admin approval before it counts on their score.
            </p>
          </div>

          <div className="mb-4 flex items-center gap-3 rounded-[16px] border border-zinc-100 bg-[var(--brand-muted)] p-3.5">
            <MemberAvatar member={member} size="lg" />
            <div className="min-w-0">
              <p className="font-semibold text-[var(--brand-dark)]">{member.name}</p>
              <p className="text-xs text-zinc-600">{member.designation}</p>
            </div>
            <div className="ml-auto rounded-xl bg-[var(--brand-dark)] px-3 py-2 text-center">
              <p className="text-[9px] uppercase tracking-wider text-white/50">Avg</p>
              <p className="text-lg font-semibold tabular-nums text-[var(--brand)] leading-none">
                {averageRating}
              </p>
            </div>
          </div>

          <div className="space-y-2 rounded-[16px] border border-zinc-100 bg-zinc-50/80 p-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-zinc-400">
              Preview · {submitted.businessName}
            </p>
            <ul className="space-y-2">
              {RATING_CATEGORIES.map((cat) => (
                <li
                  key={cat.field}
                  className="flex items-center justify-between gap-3 rounded-[10px] bg-white px-3 py-2 text-sm ring-1 ring-zinc-100"
                >
                  <span className="text-zinc-600">{cat.label}</span>
                  <span className="font-semibold tabular-nums text-[var(--brand-dark)]">
                    {submitted[cat.field]}/10
                    <span className="ml-1.5 text-xs font-medium text-zinc-400">
                      {ratingText(submitted[cat.field])}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
            {submitted.comment?.trim() && (
              <p className="pt-1 text-sm leading-relaxed text-zinc-600 whitespace-pre-wrap">
                {submitted.comment}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={startAnotherReview}
            className="review-btn review-btn-primary mt-6 w-full rounded-[12px] py-[14px] text-sm font-semibold"
          >
            Add another review
          </button>
          <p className="mt-2 text-center text-[12px] text-zinc-400">
            Your name &amp; business stay filled — just pick another member
          </p>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={submitReview}
      className="review-shell review-fade-in w-full min-w-0 max-w-[640px] mx-auto overflow-hidden rounded-[16px] border border-zinc-200/80 bg-white text-left shadow-[0_20px_50px_-24px_rgba(10,20,10,0.25)] sm:rounded-[22px]"
    >
      <div className="h-1.5 w-full bg-[var(--brand)]" />

      <div className="p-4 sm:p-8">
        <header className="review-stagger mb-6 sm:mb-8" style={{ "--d": "0ms" }}>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--brand-muted)] px-2.5 py-[5px] text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--brand-dark)] ring-1 ring-[var(--brand)]/30 sm:px-3 sm:text-[10.5px]">
            <Icon name="star" className="h-3 w-3" />
            Your feedback matters
          </span>
          <h1 className="mt-3 text-[1.45rem] font-semibold tracking-[-0.03em] text-[var(--brand-dark)] leading-tight sm:mt-4 sm:text-[1.75rem] md:text-[2rem]">
            Team Performance Review
          </h1>
          <p className="mt-2 max-w-[32rem] text-[13px] leading-[1.65] text-zinc-500 sm:mt-2.5 sm:text-[14px]">
            Rate Designers, Sales Executives & Project Managers on the
            NeonCode team. Pick a person, score their work, and help us improve.
          </p>
        </header>

        {/* Customer info */}
        <section
          className="review-stagger space-y-[18px]"
          style={{ "--d": "50ms" }}
          aria-labelledby={`${formId}-info`}
        >
          <h2 id={`${formId}-info`} className="sr-only">
            Your information
          </h2>

          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            <div>
              <label
                htmlFor={`${formId}-name`}
                className="mb-1.5 block text-[13px] font-medium text-zinc-700"
              >
                Your Name
              </label>
              <div className="group relative">
                <FieldIcon name="user" />
                <input
                  id={`${formId}-name`}
                  name="name"
                  type="text"
                  autoComplete="name"
                  placeholder="Enter your name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  className={inputClass}
                />
              </div>
            </div>
            <div>
              <label
                htmlFor={`${formId}-phone`}
                className="mb-1.5 block text-[13px] font-medium text-zinc-700"
              >
                Phone Number
              </label>
              <div className="group relative">
                <FieldIcon name="phone" />
                <input
                  id={`${formId}-phone`}
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  placeholder="Enter phone number"
                  value={form.phone}
                  onChange={handleChange}
                  required
                  className={inputClass}
                />
              </div>
            </div>
          </div>

          <div>
            <label
              htmlFor={`${formId}-business`}
              className="mb-1.5 block text-[13px] font-medium text-zinc-700"
            >
              Facebook / Business Name
            </label>
            <div className="group relative">
              <FieldIcon name="building" />
              <input
                id={`${formId}-business`}
                name="businessName"
                type="text"
                autoComplete="organization"
                placeholder="Enter Facebook page or business name"
                value={form.businessName}
                onChange={handleChange}
                required
                className={inputClass}
              />
            </div>
          </div>
        </section>

        {/* Team member picker */}
        <section
          className="review-stagger mt-8"
          style={{ "--d": "100ms" }}
          aria-labelledby={`${formId}-team`}
        >
          <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2
                id={`${formId}-team`}
                className="text-[13px] font-semibold tracking-wide text-[var(--brand-dark)]"
              >
                Select team member
              </h2>
              <p className="text-[12px] text-zinc-400">
                Choose who you want to review
              </p>
            </div>
          </div>

          <div className="mb-3 nc-scroll-x sm:flex-wrap sm:overflow-visible">
            {TEAM_ROLES.map((role) => {
              const active = roleFilter === role;
              return (
                <button
                  key={role}
                  type="button"
                  onClick={() => setRoleFilter(active ? "Designer" : role)}
                  className={`nc-tab-chip rounded-full px-3 py-2 text-[11px] font-semibold transition sm:py-1.5 sm:text-[12px] ${
                    active
                      ? "bg-[var(--brand-dark)] text-[var(--brand)]"
                      : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                  }`}
                >
                  {role}
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-1 gap-2.5 min-[420px]:grid-cols-2">
            {filteredMembers.length === 0 ? (
              <p className="col-span-full rounded-[14px] border border-dashed border-zinc-200 px-4 py-6 text-center text-sm text-zinc-400">
                {roleFilter
                  ? "No members in this role yet. Admin can add them from dashboard."
                  : "Pick a role above to see team members"}
              </p>
            ) : (
              filteredMembers.map((member) => {
              const selected = form.employeeId === member.id;
              const stat = stats[member.id] || stats[member.name];
              return (
                <button
                  key={member.id || member._id || member.name}
                  type="button"
                  onClick={() => selectMember(member)}
                  aria-pressed={selected}
                  className={`flex items-center gap-3 rounded-[16px] border p-3 text-left transition-all duration-200 ${
                    selected
                      ? "border-[var(--brand)] bg-[var(--brand-muted)] shadow-[0_0_0_1px_var(--brand)]"
                      : "border-zinc-200 bg-zinc-50/70 hover:border-zinc-300 hover:bg-white"
                  }`}
                >
                  <MemberAvatar member={member} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-[var(--brand-dark)]">
                      {member.name}
                    </p>
                    <p className="truncate text-[11px] font-medium text-zinc-500">
                      {member.designation}
                    </p>
                    <p className="mt-1 text-[11px] tabular-nums text-zinc-500">
                      {stat ? (
                        <>
                          <span className="font-semibold text-[var(--brand-dark)]">
                            ★ {stat.average}
                          </span>
                          <span className="text-zinc-400">
                            {" "}
                            · {stat.count} review{stat.count === 1 ? "" : "s"}
                          </span>
                        </>
                      ) : (
                        <span className="text-zinc-400">No ratings yet</span>
                      )}
                    </p>
                  </div>
                  {selected && (
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--brand)] text-[var(--brand-dark)]">
                      <Icon name="check" className="h-3.5 w-3.5" />
                    </span>
                  )}
                </button>
              );
            })
            )}
          </div>

          {selectedMember && (
            <div className="mt-3 flex items-center gap-3 rounded-[14px] border border-[var(--brand)]/40 bg-[var(--brand-dark)] p-3 text-white">
              <MemberAvatar member={selectedMember} />
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--brand)]">
                  Reviewing
                </p>
                <p className="truncate text-sm font-semibold">
                  {selectedMember.name}
                </p>
                <p className="truncate text-xs text-white/60">
                  {selectedMember.designation}
                </p>
              </div>
            </div>
          )}
        </section>

        {/* Ratings */}
        <section
          className="review-stagger mt-8 space-y-2.5"
          style={{ "--d": "150ms" }}
          aria-labelledby={`${formId}-ratings`}
        >
          <div className="mb-1 flex items-end justify-between">
            <h2
              id={`${formId}-ratings`}
              className="text-[13px] font-semibold tracking-wide text-[var(--brand-dark)]"
            >
              Ratings
            </h2>
            <span className="text-[11px] text-zinc-400">Scale 1–10</span>
          </div>

          {RATING_CATEGORIES.map((cat) => (
            <RatingRow
              key={cat.field}
              formId={formId}
              category={cat}
              value={form[cat.field]}
              onSelect={(v) => setRating(cat.field, v)}
            />
          ))}
        </section>

        {/* Comments */}
        <section className="review-stagger mt-8" style={{ "--d": "200ms" }}>
          <label
            htmlFor={`${formId}-comment`}
            className="mb-1.5 flex items-center gap-2 text-[13px] font-medium text-zinc-700"
          >
            <span className="text-zinc-400">
              <Icon name="chat" className="h-3.5 w-3.5" />
            </span>
            Additional comments
            <span className="font-normal text-zinc-400">(optional)</span>
          </label>
          <div className="relative">
            <textarea
              id={`${formId}-comment`}
              name="comment"
              rows={4}
              maxLength={COMMENT_MAX}
              placeholder="Share any other thoughts, suggestions or feedback..."
              value={form.comment}
              onChange={handleChange}
              className="review-input w-full resize-y rounded-[12px] border border-zinc-200/90 bg-white px-4 py-3.5 pb-8 text-[14px] text-[var(--brand-dark)] placeholder:text-zinc-400 outline-none transition-all duration-200 hover:border-zinc-300 focus:border-[var(--brand)] focus:ring-[3px] focus:ring-[var(--brand-ring)]"
            />
            <span
              className={`pointer-events-none absolute bottom-3 right-3.5 text-[11px] tabular-nums ${
                form.comment.length >= COMMENT_MAX
                  ? "text-red-500"
                  : "text-zinc-400"
              }`}
            >
              {form.comment.length}/{COMMENT_MAX}
            </span>
          </div>
        </section>

        {error && (
          <p
            role="alert"
            className="mt-4 rounded-[12px] border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-600"
          >
            {error}
          </p>
        )}

        <div className="review-stagger mt-7" style={{ "--d": "240ms" }}>
          <button
            type="submit"
            disabled={loading}
            className="review-btn review-btn-primary flex w-full items-center justify-center gap-2 rounded-[12px] py-[14px] text-sm font-semibold disabled:pointer-events-none disabled:opacity-55"
          >
            {loading ? (
              <>
                <span className="review-spinner h-4 w-4 rounded-full border-2 border-[var(--brand-dark)]/25 border-t-[var(--brand-dark)]" />
                Submitting...
              </>
            ) : (
              <>
                <Icon name="send" className="h-4 w-4" />
                Submit Review
              </>
            )}
          </button>
          <p className="mt-4 flex items-center justify-center gap-1.5 text-center text-[12px] text-zinc-400">
            <Icon name="shield" className="h-3.5 w-3.5 shrink-0" />
            Your feedback is private and used only to improve our services.
          </p>
        </div>
      </div>
    </form>
  );
}

function RatingRow({ formId, category, value, onSelect }) {
  const groupId = `${formId}-${category.field}`;
  const rated = value > 0;

  return (
    <div
      className={`rounded-[14px] border p-3.5 sm:p-4 transition-all duration-200 overflow-hidden ${
        rated
          ? "border-[var(--brand)]/50 bg-[var(--brand-muted)]"
          : "border-zinc-200 bg-zinc-50/70 hover:border-zinc-300 hover:bg-white"
      }`}
    >
      <div className="flex min-w-0 items-start gap-3">
        <span
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors duration-200 ${
            rated
              ? "bg-[var(--brand-dark)] text-[var(--brand)]"
              : "bg-[var(--brand-muted)] text-[var(--brand-dark)] ring-1 ring-[var(--brand)]/25"
          }`}
        >
          <Icon name={category.icon} className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p
            id={`${groupId}-label`}
            className="text-sm font-semibold text-[var(--brand-dark)]"
          >
            {category.label}
          </p>
          <p className="mt-0.5 text-xs leading-snug text-zinc-500">
            {category.description}
          </p>
          {rated && (
            <p className="mt-1 text-xs font-semibold text-[var(--brand-dark)]">
              {value}/10 — {ratingText(value)}
            </p>
          )}
        </div>
      </div>

      <div
        role="radiogroup"
        aria-labelledby={`${groupId}-label`}
        className="mt-3 grid w-full grid-cols-5 gap-1.5 min-[480px]:grid-cols-10 min-[480px]:gap-1"
      >
        {[...Array(10)].map((_, i) => {
          const n = i + 1;
          const selected = value === n;
          return (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={selected}
              aria-label={`${category.label} rating ${n}`}
              onClick={() => onSelect(n)}
              className={`rating-btn flex aspect-square w-full min-h-[40px] max-h-11 items-center justify-center rounded-full text-xs font-semibold tabular-nums transition-all duration-150 touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:ring-offset-1 sm:min-h-0 sm:max-h-10 ${
                selected
                  ? "bg-[var(--brand-dark)] text-[var(--brand)] shadow-sm"
                  : "border border-zinc-200 bg-white text-zinc-600 hover:border-[var(--brand)] hover:bg-[var(--brand-muted)] hover:text-[var(--brand-dark)] active:scale-95"
              }`}
            >
              {n}
            </button>
          );
        })}
      </div>
    </div>
  );
}
