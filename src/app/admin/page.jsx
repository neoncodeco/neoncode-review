"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";

export default function AdminPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) router.replace("/dashboard");
  }, [loading, user, router]);

  if (loading || user) {
    return (
      <main className="flex min-h-[calc(100vh-57px)] items-center justify-center bg-[var(--background)] sm:min-h-[calc(100vh-65px)]">
        <p className="text-sm font-medium text-[var(--brand-dark)] animate-pulse">
          Loading admin...
        </p>
      </main>
    );
  }

  return (
    <main className="relative flex min-h-[calc(100vh-57px)] items-center justify-center overflow-hidden bg-[var(--background)] px-3 py-10 sm:min-h-[calc(100vh-65px)] sm:px-4 sm:py-16">
      <div
        className="pointer-events-none absolute -top-24 right-0 h-72 w-72 rounded-full opacity-35 blur-3xl"
        style={{ background: "var(--brand)" }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-24 left-0 h-64 w-64 rounded-full bg-[var(--brand-dark)]/10 blur-3xl"
        aria-hidden
      />

      <div className="relative w-full max-w-md overflow-hidden rounded-[20px] border border-zinc-200/80 bg-white shadow-[0_24px_60px_-28px_rgba(10,20,10,0.35)] sm:rounded-[24px]">
        <div className="h-1.5 w-full bg-[var(--brand)]" />
        <div className="p-6 text-center sm:p-8">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--brand-dark)]">
            <Image
              src="/image.png"
              alt="NeonCode"
              width={40}
              height={40}
              className="h-9 w-9 object-contain"
              priority
            />
          </div>
          <span className="inline-flex items-center rounded-full bg-[var(--brand-muted)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--brand-dark)] ring-1 ring-[var(--brand)]/30">
            Admin access
          </span>
          <h1 className="mt-4 text-2xl font-semibold tracking-tight text-[var(--brand-dark)]">
            NeonCode Admin
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-zinc-500">
            Sign in to approve ratings, view analytics, manage profiles &amp;
            create users.
          </p>

          <div className="mt-7 grid gap-3">
            <Link
              href="/login"
              className="review-btn review-btn-primary flex w-full items-center justify-center rounded-[12px] py-3.5 text-sm font-semibold"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="flex w-full items-center justify-center rounded-[12px] border border-zinc-200 bg-white py-3.5 text-sm font-semibold text-zinc-800 transition hover:border-[var(--brand)] hover:bg-[var(--brand-muted)]"
            >
              Register with master key
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
            .
          </p>
        </div>
      </div>
    </main>
  );
}
