"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";

export default function Navbar() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    await logout();
    router.push("/admin");
  };

  const isAdminArea =
    pathname?.startsWith("/admin") ||
    pathname?.startsWith("/login") ||
    pathname?.startsWith("/register") ||
    pathname?.startsWith("/dashboard");

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-zinc-200/80 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-3 py-3 sm:px-6 sm:py-4">
        <Link
          href="/"
          className="flex min-w-0 items-center gap-2 text-lg font-bold tracking-tight sm:gap-2.5 sm:text-xl"
        >
          <Image
            src="/image.png"
            alt="NeonCode"
            width={36}
            height={36}
            className="h-8 w-8 shrink-0 rounded-lg object-contain sm:h-9 sm:w-9"
            priority
          />
          <span className="truncate text-[var(--brand-dark)]">NeonCode</span>
        </Link>

        {loading ? (
          <span className="h-8 w-16 sm:w-20" aria-hidden />
        ) : user ? (
          <div className="flex shrink-0 items-center gap-1.5 sm:gap-3">
            <span className="hidden max-w-[140px] truncate text-sm text-zinc-500 md:inline">
              {user.name || user.email}
            </span>
            <Link
              href="/dashboard"
              className="rounded-lg bg-[var(--brand)] px-2.5 py-2 text-xs font-semibold text-[var(--brand-dark)] transition hover:brightness-105 sm:px-4 sm:text-sm"
            >
              Dashboard
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-lg bg-red-600 px-2.5 py-2 text-xs font-medium text-white transition hover:bg-red-700 sm:px-4 sm:text-sm"
            >
              Logout
            </button>
          </div>
        ) : isAdminArea ? (
          <div className="flex shrink-0 items-center gap-2 text-xs font-medium sm:gap-3 sm:text-sm">
            <Link
              href="/login"
              className="px-1 text-zinc-600 transition hover:text-[var(--brand-dark)] sm:px-0"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="rounded-lg bg-[var(--brand)] px-2.5 py-2 font-semibold text-[var(--brand-dark)] transition hover:brightness-105 sm:px-3.5"
            >
              Register
            </Link>
          </div>
        ) : (
          <span className="shrink-0 text-[10px] font-medium tracking-wide text-zinc-400 sm:text-xs">
            Team Review
          </span>
        )}
      </div>
    </nav>
  );
}
