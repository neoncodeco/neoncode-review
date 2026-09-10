"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { usePathname, useRouter } from "next/navigation";
import { auth } from "@/lib/auth";

export default function Navbar() {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setReady(true);
    });
    return () => unsub();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/admin");
  };

  const isAdminArea =
    pathname?.startsWith("/admin") ||
    pathname?.startsWith("/login") ||
    pathname?.startsWith("/register") ||
    pathname?.startsWith("/dashboard");

  return (
    <nav className="w-full border-b border-zinc-200/80 bg-white">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <Link
          href="/"
          className="flex items-center gap-2.5 text-xl font-bold tracking-tight"
        >
          <Image
            src="/image.png"
            alt="NeonCode"
            width={36}
            height={36}
            className="h-9 w-9 rounded-lg object-contain"
            priority
          />
          <span>
            <span className="text-[var(--brand-dark)]">Neon</span>
            <span className="text-[var(--brand-dark)]">Code</span>
          </span>
        </Link>

        {!ready ? (
          <span className="h-8 w-20" aria-hidden />
        ) : user ? (
          <div className="flex items-center gap-3 sm:gap-4">
            <span className="hidden sm:inline text-sm text-zinc-500 truncate max-w-[160px]">
              {user.displayName || user.email}
            </span>
            <Link
              href="/dashboard"
              className="px-4 py-2 rounded-lg bg-[var(--brand)] text-[var(--brand-dark)] text-sm font-semibold hover:brightness-105 transition"
            >
              Dashboard
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition"
            >
              Logout
            </button>
          </div>
        ) : isAdminArea ? (
          <div className="flex items-center gap-3 text-sm font-medium">
            <Link
              href="/login"
              className="text-zinc-600 hover:text-[var(--brand-dark)] transition"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="px-3.5 py-2 rounded-lg bg-[var(--brand)] text-[var(--brand-dark)] font-semibold hover:brightness-105 transition"
            >
              Register
            </Link>
          </div>
        ) : (
          <span className="text-xs font-medium tracking-wide text-zinc-400">
            Team Review
          </span>
        )}
      </div>
    </nav>
  );
}
