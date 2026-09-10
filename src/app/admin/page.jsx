"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/auth";

export default function AdminPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.replace("/dashboard");
      } else {
        setChecking(false);
      }
    });
    return () => unsub();
  }, [router]);

  if (checking) {
    return (
      <main className="min-h-[calc(100vh-65px)] flex items-center justify-center bg-[var(--background)]">
        <p className="text-sm font-medium text-[var(--brand-dark)] animate-pulse">
          Loading admin...
        </p>
      </main>
    );
  }

  return (
    <main className="relative min-h-[calc(100vh-65px)] overflow-hidden bg-[var(--background)] px-4 py-12 sm:py-16">
      <div
        className="pointer-events-none absolute -top-24 right-0 h-72 w-72 rounded-full opacity-35 blur-3xl"
        style={{ background: "var(--brand)" }}
        aria-hidden
      />

      <div className="relative mx-auto w-full max-w-md">
        <div className="overflow-hidden rounded-[20px] border border-zinc-200/80 bg-white shadow-[0_16px_40px_-20px_rgba(10,20,10,0.2)]">
          <div className="h-1.5 w-full bg-[var(--brand)]" />
          <div className="p-7 sm:p-8 text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--brand-muted)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--brand-dark)] ring-1 ring-[var(--brand)]/30">
              Admin access
            </span>
            <h1 className="mt-4 text-2xl font-semibold tracking-tight text-[var(--brand-dark)]">
              NeonCode Admin
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-zinc-500">
              Sign in to view team review data from the database.
            </p>

            <div className="mt-7 grid gap-3">
              <Link
                href="/login"
                className="flex w-full items-center justify-center rounded-[12px] bg-[var(--brand)] py-3.5 text-sm font-semibold text-[var(--brand-dark)] shadow-sm transition hover:brightness-105"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="flex w-full items-center justify-center rounded-[12px] border border-zinc-200 bg-white py-3.5 text-sm font-semibold text-zinc-800 transition hover:border-[var(--brand)] hover:bg-[var(--brand-muted)]"
              >
                Register
              </Link>
            </div>

            <p className="mt-6 text-xs text-zinc-400">
              Public review form stays at{" "}
              <Link
                href="/"
                className="font-medium text-[var(--brand-dark)] hover:underline"
              >
                home
              </Link>
              . This panel is for staff only.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
