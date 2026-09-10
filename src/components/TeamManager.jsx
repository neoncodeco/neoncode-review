"use client";

import { useEffect, useState } from "react";
import { DESIGNATION_OPTIONS } from "@/data/team";

const emptyForm = {
  _id: "",
  name: "",
  designation: "Designer",
  image: "",
};

function initials(name) {
  const parts = String(name || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export default function TeamManager() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");
  const [form, setForm] = useState(emptyForm);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/team", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to load team");
      setMembers(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
      setMembers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const resetForm = () => {
    setForm(emptyForm);
    setOk("");
    setError("");
  };

  const editMember = (m) => {
    setForm({
      _id: m._id,
      name: m.name || "",
      designation: m.designation || "Designer",
      image: m.image || "",
    });
    setOk("");
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const uploadImage = async (file) => {
    if (!file) return;
    setUploading(true);
    setError("");
    setOk("");
    try {
      const body = new FormData();
      body.append("image", file);
      const res = await fetch("/api/upload", { method: "POST", body });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Upload failed");
      setForm((prev) => ({ ...prev, image: data.url }));
      setOk("Image uploaded via ImageBB");
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const saveMember = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setOk("");
    try {
      const isEdit = Boolean(form._id);
      const res = await fetch("/api/team", {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Save failed");
      setOk(isEdit ? "Member updated" : "Member added");
      resetForm();
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const removeMember = async (id) => {
    if (!confirm("Remove this team member from the review list?")) return;
    setError("");
    try {
      const res = await fetch(`/api/team?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Delete failed");
      if (form._id === id) resetForm();
      await load();
      setOk("Member removed");
    } catch (err) {
      setError(err.message);
    }
  };

  const byRole = DESIGNATION_OPTIONS.map((role) => ({
    role,
    list: members.filter((m) => m.designation === role),
  })).filter((g) => g.list.length > 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-[var(--brand-dark)]">
          Team profiles
        </h2>
        <p className="mt-1 text-sm text-zinc-500">
          Profile photo, name &amp; role — same cards clients see on the review
          form. Upload via ImageBB or paste a URL.
        </p>
      </div>

      <form
        onSubmit={saveMember}
        className="rounded-[20px] border border-zinc-200 bg-white p-5 sm:p-6 shadow-sm space-y-4"
      >
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-sm font-semibold text-zinc-800">
            {form._id ? "Edit profile" : "Add profile"}
          </h3>
          {form._id && (
            <button
              type="button"
              onClick={resetForm}
              className="text-xs font-medium text-zinc-500 hover:text-zinc-800"
            >
              Cancel edit
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-zinc-600">
              Full name
            </label>
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Prince Bala"
              className="w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-sm outline-none focus:border-[var(--brand)] focus:ring-[3px] focus:ring-[var(--brand-ring)]"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-zinc-600">
              Designation
            </label>
            <select
              required
              value={form.designation}
              onChange={(e) =>
                setForm({ ...form, designation: e.target.value })
              }
              className="w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-sm outline-none focus:border-[var(--brand)] focus:ring-[3px] focus:ring-[var(--brand-ring)]"
            >
              {DESIGNATION_OPTIONS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-zinc-600">
            Profile photo
          </label>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-[var(--brand-dark)] ring-1 ring-black/5">
              {form.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={form.image}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="flex h-full w-full items-center justify-center text-sm font-semibold text-[var(--brand)]">
                  {initials(form.name)}
                </span>
              )}
            </div>
            <div className="flex-1 space-y-2">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => uploadImage(e.target.files?.[0])}
                className="block w-full text-xs text-zinc-500 file:mr-3 file:rounded-lg file:border-0 file:bg-[var(--brand)] file:px-3 file:py-2 file:text-xs file:font-semibold file:text-[var(--brand-dark)]"
              />
              <input
                value={form.image}
                onChange={(e) => setForm({ ...form, image: e.target.value })}
                placeholder="Or paste ImageBB / image URL"
                className="w-full rounded-xl border border-zinc-200 px-3.5 py-2 text-xs outline-none focus:border-[var(--brand)]"
              />
              {uploading && (
                <p className="text-xs text-zinc-500">Uploading to ImageBB…</p>
              )}
            </div>
          </div>
        </div>

        {error && (
          <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
            {error}
          </p>
        )}
        {ok && (
          <p className="rounded-xl border border-[var(--brand)]/40 bg-[var(--brand-muted)] px-3 py-2 text-sm text-[var(--brand-dark)]">
            {ok}
          </p>
        )}

        <button
          type="submit"
          disabled={saving || uploading}
          className="rounded-xl bg-[var(--brand)] px-5 py-2.5 text-sm font-semibold text-[var(--brand-dark)] hover:brightness-105 disabled:opacity-50"
        >
          {saving ? "Saving…" : form._id ? "Update profile" : "Add profile"}
        </button>
      </form>

      <div>
        {loading ? (
          <p className="text-sm text-zinc-500 animate-pulse">Loading profiles…</p>
        ) : members.length === 0 ? (
          <p className="rounded-[20px] border border-zinc-200 bg-white p-6 text-sm text-zinc-500">
            No team profiles yet. Add one above or run seed migration.
          </p>
        ) : (
          <div className="space-y-8">
            {byRole.map(({ role, list }) => (
              <section key={role}>
                <div className="mb-3 flex items-baseline justify-between gap-2">
                  <h3 className="text-sm font-semibold text-[var(--brand-dark)]">
                    {role}
                  </h3>
                  <span className="text-xs text-zinc-400">{list.length}</span>
                </div>
                <ul className="grid grid-cols-1 gap-3 min-[480px]:grid-cols-2 xl:grid-cols-3">
                  {list.map((m) => (
                    <li
                      key={m._id}
                      className="flex flex-col overflow-hidden rounded-[20px] border border-zinc-200 bg-white shadow-sm"
                    >
                      <div className="relative aspect-[4/3] bg-[var(--brand-dark)]">
                        {m.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={m.image}
                            alt={m.name}
                            className="absolute inset-0 h-full w-full object-cover"
                          />
                        ) : (
                          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-black/25 text-lg font-semibold text-[var(--brand)] ring-1 ring-[var(--brand)]/30">
                              {initials(m.name)}
                            </span>
                            <span className="text-[10px] font-medium uppercase tracking-wide text-[var(--brand)]/70">
                              No photo yet
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-1 flex-col gap-3 p-4">
                        <div>
                          <p className="font-semibold text-[var(--brand-dark)]">
                            {m.name}
                          </p>
                          <p className="mt-0.5 text-xs text-zinc-500">
                            {m.designation}
                          </p>
                        </div>
                        <div className="mt-auto flex gap-2">
                          <button
                            type="button"
                            onClick={() => editMember(m)}
                            className="flex-1 rounded-lg border border-zinc-200 px-3 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-50"
                          >
                            Edit profile
                          </button>
                          <button
                            type="button"
                            onClick={() => removeMember(m._id)}
                            className="rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
