"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import {
  AuthShell,
  AuthField,
  AuthSubmit,
  AuthFooter,
} from "@/components/AuthUI";

export default function RegisterPage() {
  const router = useRouter();
  const { refresh } = useAuth();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    masterKey: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Registration failed");
      await refresh();
      router.push("/dashboard");
    } catch (err) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      badge="Master key required"
      title="Create Admin"
      subtitle="Email + password + master key. Accounts are stored in MongoDB."
    >
      <form onSubmit={handleRegister} className="space-y-3.5">
        <AuthField
          label="Full name"
          icon="user"
          name="name"
          autoComplete="name"
          placeholder="Your full name"
          value={form.name}
          onChange={handleChange}
          required
        />
        <AuthField
          label="Email"
          icon="mail"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@neoncode.com"
          value={form.email}
          onChange={handleChange}
          required
        />
        <AuthField
          label="Password"
          icon="lock"
          name="password"
          type="password"
          autoComplete="new-password"
          placeholder="Min 6 characters"
          value={form.password}
          onChange={handleChange}
          required
          minLength={6}
        />
        <AuthField
          label="Admin master key"
          icon="key"
          name="masterKey"
          type="password"
          autoComplete="off"
          placeholder="NEON-ADMIN-2026"
          value={form.masterKey}
          onChange={handleChange}
          required
        />
        <p className="-mt-1 text-[11px] leading-snug text-zinc-400">
          Master key from{" "}
          <code className="text-[var(--brand-dark)]">.env.local</code>:{" "}
          <span className="font-medium text-zinc-600">NEON-ADMIN-2026</span>
        </p>

        {error ? (
          <p
            role="alert"
            className="rounded-[12px] border border-red-200 bg-red-50 px-3.5 py-2.5 text-center text-sm text-red-600"
          >
            {error}
          </p>
        ) : null}

        <AuthSubmit loading={loading}>Create admin account</AuthSubmit>
      </form>

      <AuthFooter text="Already admin?" href="/login" linkLabel="Login" />
    </AuthShell>
  );
}
