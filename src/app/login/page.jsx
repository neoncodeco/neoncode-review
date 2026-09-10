"use client";
import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";

import { useRouter } from "next/navigation";
import { auth } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await signInWithEmailAndPassword(
        auth,
        form.email,
        form.password
      );
      router.push("/dashboard");
    } catch (err) {
      setError("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <form
        onSubmit={handleLogin}
        className="w-full max-w-md rounded-2xl border p-6 shadow-lg"
      >
        <h1 className="text-2xl font-bold text-center mb-6">
          Login
        </h1>

        <input
          name="email"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
          className="w-full mb-3 rounded-lg border px-4 py-2"
        />

        <input
          name="password"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          required
          className="w-full mb-4 rounded-lg border px-4 py-2"
        />

        <button
          disabled={loading}
          className="w-full bg-[var(--brand)] text-[var(--brand-dark)] py-2 rounded-lg font-semibold hover:brightness-105 disabled:opacity-50"
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        {error && (
          <p className="text-red-500 text-sm mt-3 text-center">
            {error}
          </p>
        )}

        <p className="mt-4 text-center text-xs text-zinc-400">
          Admin panel ·{" "}
          <a href="/admin" className="text-blue-600 hover:underline">
            /admin
          </a>
        </p>
      </form>
    </main>
  );
}
