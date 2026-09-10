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

export default function LoginPage() {
  const router = useRouter();
  const { refresh } = useAuth();
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
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Login failed");
      await refresh();
      router.push("/dashboard");
    } catch (err) {
      setError(err.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      badge="Staff access"
      title="Welcome back"
      subtitle="Sign in with your NeonCode admin email and password."
    >
      <form onSubmit={handleLogin} className="space-y-3.5">
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
          autoComplete="current-password"
          placeholder="Enter your password"
          value={form.password}
          onChange={handleChange}
          required
        />

        {error ? (
          <p
            role="alert"
            className="rounded-[12px] border border-red-200 bg-red-50 px-3.5 py-2.5 text-center text-sm text-red-600"
          >
            {error}
          </p>
        ) : null}

        <AuthSubmit loading={loading}>Sign in to dashboard</AuthSubmit>
      </form>

      <AuthFooter
        text="New admin?"
        href="/register"
        linkLabel="Register with master key"
      />
    </AuthShell>
  );
}
