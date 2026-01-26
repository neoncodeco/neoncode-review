"use client";
import { useState } from "react";

export default function ReviewForm() {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    designer: "",
    behavior: 0,
    quality: 0,
    communication: 0,
    timeManagement: 0,
    comment: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // ⭐ rating meaning (1–10)
  const ratingText = (r) => {
    if (r >= 1 && r <= 3) return "Very Bad";
    if (r === 4) return "Bad";
    if (r >= 5 && r <= 6) return "Average";
    if (r >= 7 && r <= 8) return "Good";
    if (r >= 9 && r <= 10) return "Very Good";
    return "";
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const setRating = (field, value) => {
    setForm({ ...form, [field]: value });
  };

  const submitReview = async (e) => {
    e.preventDefault();

    // 🔒 validation
    if (
      form.behavior < 1 ||
      form.quality < 1 ||
      form.communication < 1 ||
      form.timeManagement < 1
    ) {
      setMessage("❌ Please give all ratings (1–10)");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setMessage("✅ Review submitted successfully");
      setForm({
        name: "",
        phone: "",
        designer: "",
        behavior: 0,
        quality: 0,
        communication: 0,
        timeManagement: 0,
        comment: "",
      });
    } catch (err) {
      setMessage("❌ " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // ⭐ Reusable Rating Row (Responsive)
  const RatingRow = ({ label, field }) => (
    <div className="mb-5">
      <p className="font-medium mb-2">{label}</p>

      {/* Mobile: 5 cols | Desktop: 10 cols */}
      <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
        {[...Array(10)].map((_, i) => {
          const value = i + 1;
          return (
            <button
              key={value}
              type="button"
              onClick={() => setRating(field, value)}
              className={`py-2 rounded-lg border text-sm font-semibold transition
                ${
                  form[field] === value
                    ? "bg-yellow-400 text-black border-yellow-400"
                    : "bg-transparent hover:bg-neutral-100 dark:hover:bg-neutral-800"
                }`}
            >
              {value}
            </button>
          );
        })}
      </div>

      {form[field] > 0 && (
        <p className="mt-2 text-sm font-semibold text-yellow-600">
          {form[field]}/10 — {ratingText(form[field])}
        </p>
      )}
    </div>
  );

  return (
    <form
      onSubmit={submitReview}
      className="w-full max-w-lg mx-auto rounded-2xl border p-4 sm:p-6 shadow-lg"
    >
      <h1 className="text-xl sm:text-2xl font-bold text-center mb-6">
        Designer Review
      </h1>

      <input
        name="name"
        placeholder="Your Name"
        value={form.name}
        onChange={handleChange}
        required
        className="w-full mb-3 rounded-lg border px-4 py-3"
      />

      <input
        name="phone"
        placeholder="Phone Number"
        value={form.phone}
        onChange={handleChange}
        required
        className="w-full mb-3 rounded-lg border px-4 py-3"
      />

      <select
        name="designer"
        value={form.designer}
        onChange={handleChange}
        required
        className="w-full mb-5 rounded-lg border px-4 py-3"
      >
        <option value="">Select Designer</option>
        <option>Abdullah</option>
        <option>Redowan</option>
        <option>Arko</option>
      </select>

      <RatingRow label="🧑‍💼 Behavior" field="behavior" />
      <RatingRow label="🎯 Task Quality" field="quality" />
      <RatingRow label="💬 Communication" field="communication" />
      <RatingRow label="⏱ Time Management" field="timeManagement" />

      <textarea
        name="comment"
        placeholder="Additional comments (optional)"
        value={form.comment}
        onChange={handleChange}
        className="w-full h-24 mb-4 rounded-lg border px-4 py-3"
      />

      <button
        disabled={loading}
        className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? "Submitting..." : "Submit Review"}
      </button>

      {message && (
        <p className="mt-3 text-center text-sm">
          {message}
        </p>
      )}
    </form>
  );
}
