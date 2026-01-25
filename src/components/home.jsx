"use client";
import { useState } from "react";

export default function ReviewForm() {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    designer: "",
    rating: 0,
    comment: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const ratingText = (r) => {
    if (r <= 3) return "Very Bad";
    if (r <= 4) return "Bad";
    if (r <= 5) return "Average";
    if (r <= 7) return "Good";
    if (r <= 8) return "Better";
    return "Very Good";
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const submitReview = async (e) => {
    e.preventDefault();
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
        rating: 0,
        comment: "",
      });
    } catch (err) {
      setMessage("❌ " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={submitReview}
      className="w-full max-w-lg rounded-2xl border border-neutral-300 dark:border-neutral-700 bg-[var(--background)] p-6 shadow-lg"
    >
      <h1 className="text-2xl font-bold text-center mb-6">
        Service Review
      </h1>

      <input
        name="name"
        placeholder="Name"
        value={form.name}
        onChange={handleChange}
        required
        className="w-full mb-3 rounded-lg border px-4 py-2 bg-transparent outline-none"
      />

      <input
        name="phone"
        placeholder="Phone Number"
        value={form.phone}
        onChange={handleChange}
        required
        className="w-full mb-3 rounded-lg border px-4 py-2 bg-transparent outline-none"
      />

      <select
        name="designer"
        value={form.designer}
        onChange={handleChange}
        required
        className="w-full mb-4 rounded-lg border bg-transparent px-4 py-2 outline-none"
      >
        <option value="">Select Designer</option>
        <option>Abdullah</option>
        <option>Redowan</option>
        <option>Arko</option>
      </select>

      <p className="font-medium mb-1">Rating</p>
      <div className="flex flex-wrap gap-1 mb-2">
        {[...Array(10)].map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setForm({ ...form, rating: i + 1 })}
            className={`px-3 py-1 rounded border text-sm ${
              form.rating >= i + 1
                ? "bg-yellow-400 text-black"
                : ""
            }`}
          >
            {i + 1}
          </button>
        ))}
      </div>

      {form.rating > 0 && (
        <p className="text-sm font-semibold text-yellow-500 mb-2">
          {form.rating} ⭐ — {ratingText(form.rating)}
        </p>
      )}

      <textarea
        name="comment"
        placeholder="Comments"
        value={form.comment}
        onChange={handleChange}
        className="w-full h-24 mb-4 rounded-lg border px-4 py-2 bg-transparent outline-none"
      />

      <button
        disabled={loading}
        className="w-full rounded-lg bg-blue-600 py-2 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
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
